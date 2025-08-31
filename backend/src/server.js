import { body, validationResult } from 'express-validator'
import express from 'express'
import Database from 'better-sqlite3'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import fetch from 'node-fetch' // Pour les requêtes BGG
import { Logger } from './lib/logger.ts';
const logger = new Logger({ level: 'debug' });

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = 3001


// Types stricts synchronisés avec la BDD
import { GameSessionDB, PlayerDB, GameTemplateDB, GameExtensionDB } from './types.js';

// Créer la base de données dans le répertoire du projet
const dbPath = path.join(__dirname, '..', 'database', 'board-game-tracker.db');
const db = new Database(dbPath)
const distPath = path.join(__dirname, '..', '..', 'frontend', 'dist');
app.use(express.static(distPath));

// Configuration CORS et middleware
app.use(cors())
app.use(express.json())

// Proxy BGG API pour éviter les problèmes CORS
app.get('/api/bgg/:endpoint', async (req, res) => {
  try {
    const bggPath = req.params.endpoint
    const queryString = req.url.split('?')[1] || ''
    const bggUrl = `https://boardgamegeek.com/xmlapi2/${bggPath}${queryString ? '?' + queryString : ''}`
    logger.debug('BGG Proxy Request: ' + bggUrl)
    logger.debug('BGG Params: ' + JSON.stringify(req.params))
    logger.debug('BGG Query: ' + queryString)
    const response = await fetch(bggUrl, {
      headers: {
        'User-Agent': 'BoardGameScoreTracker/1.0'
      }
    })
    if (!response.ok) {
      logger.debug('BGG API Error: ' + response.status + ' ' + response.statusText)
      return res.status(response.status).json({ error: 'BGG API Error' })
    }
    const xmlData = await response.text()
    logger.debug('BGG Response (first 200 chars): ' + xmlData.substring(0, 200))
    res.set('Content-Type', 'application/xml')
    res.send(xmlData)
    await new Promise(resolve => setTimeout(resolve, 100))
  } catch (error) {
    logger.debug('BGG Proxy Error: ' + (error instanceof Error ? error.message : String(error)))
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Créer les tables si elles n'existent pas
db.exec(`
  CREATE TABLE IF NOT EXISTS players (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    avatar TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS game_templates (
    id TEXT PRIMARY KEY,
    id_bgg TEXT,
    name TEXT NOT NULL,
    min_players INTEGER,
    max_players INTEGER,
    description TEXT,
    image TEXT,
    has_characters BOOLEAN NOT NULL,
    characters TEXT,
    supports_cooperative BOOLEAN NOT NULL,
    supports_competitive BOOLEAN NOT NULL,
    supports_campaign BOOLEAN NOT NULL,
    default_mode TEXT,
    is_cooperative_by_default BOOLEAN NOT NULL,
    created_at DATETIME CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS game_sessions (
    id TEXT PRIMARY KEY,
    game_template_id TEXT NOT NULL,
    game_mode TEXT,
    players TEXT NOT NULL,
    scores TEXT NOT NULL,
    characters TEXT,
    extensions TEXT,
    winner TEXT,
    win_condition TEXT NOT NULL,
    date TEXT NOT NULL,
    start_time TEXT,
    end_time TEXT,
    duration INTEGER,
    completed BOOLEAN NOT NULL DEFAULT 0,
    coop_result TEXT,
    dead_characters TEXT,
    new_character_names TEXT,
    character_history TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS current_game (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    game_data TEXT
  );

  CREATE TABLE IF NOT EXISTS game_extensions (
    id TEXT PRIMARY KEY,
    id_bgg TEXT,
    name TEXT NOT NULL,
    base_game_id TEXT NOT NULL,
    min_players INTEGER,
    max_players INTEGER,
    description TEXT,
    image TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  INSERT OR IGNORE INTO current_game (id, game_data) VALUES (1, NULL);
`)

// Ajouter les nouvelles colonnes si elles n'existent pas déjà
try {
  db.exec(`
    ALTER TABLE game_sessions ADD COLUMN coop_result TEXT;
    ALTER TABLE game_sessions ADD COLUMN dead_characters TEXT;
    ALTER TABLE game_sessions ADD COLUMN new_character_names TEXT;
    ALTER TABLE game_sessions ADD COLUMN character_history TEXT;
    ALTER TABLE game_templates ADD COLUMN supports_cooperative BOOLEAN;
    ALTER TABLE game_templates ADD COLUMN supports_competitive BOOLEAN;
    ALTER TABLE game_templates ADD COLUMN supports_campaign BOOLEAN;
    ALTER TABLE game_templates ADD COLUMN default_mode BOOLEAN;
  `)
} catch (error) {
  logger.debug('Colonnes déjà existantes ou ajoutées')
}

// Routes API
// Players

// GET /api/players — renvoie PlayerDB[]
app.get('/api/players', (req, res) => {
  try {
  // Type attendu: PlayerDB[]
  const players = db.prepare('SELECT * FROM players ORDER BY name').all();
    res.json(players);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/players',
  [
    body('id').isString().notEmpty().trim().escape(),
    body('name').isString().notEmpty().trim().escape(),
    body('avatar').optional().isString().trim().escape()
  ],
  (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }
    try {
      const { id, name, avatar } = req.body
      const stmt = db.prepare('INSERT INTO players (id, name, avatar) VALUES (?, ?, ?)')
      stmt.run(id, name, avatar || null)
      res.json({ id, name, avatar })
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  }
)

app.put('/api/players/:id',
  [
    body('name').optional().isString().notEmpty().trim().escape(),
    body('avatar').optional().isString().trim().escape()
  ],
  (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }
    try {
      const { id } = req.params
      const { name, avatar } = req.body
      const sets = []
      const values = []
      if (name !== undefined) {
        sets.push('name = ?')
        values.push(name)
      }
      if (avatar !== undefined) {
        sets.push('avatar = ?')
        values.push(avatar)
      }
      if (sets.length === 0) {
        return res.status(400).json({ error: 'No updates provided' })
      }
      values.push(id)
      const stmt = db.prepare(`UPDATE players SET ${sets.join(', ')} WHERE id = ?`)
      stmt.run(...values)
      const updated = db.prepare('SELECT * FROM players WHERE id = ?').get(id)
      res.json(updated)
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  }
)

app.delete('/api/players/:id', (req, res) => {
  try {
    const { id } = req.params
    const stmt = db.prepare('DELETE FROM players WHERE id = ?')
    stmt.run(id)
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Game Templates

// GET /api/game-templates — renvoie GameTemplateDB[]
app.get('/api/game-templates', (req, res) => {
  try {
  // Type attendu: GameTemplateDB[]
  const templates = db.prepare('SELECT * FROM game_templates ORDER BY name').all();
    res.json(templates.map(template => ({
      ...template,
      has_characters: Boolean(template.has_characters),
      supports_cooperative: Boolean(template.supports_cooperative),
      supports_competitive: Boolean(template.supports_competitive),
      supports_campaign: Boolean(template.supports_campaign),
      is_cooperative_by_default: Boolean(template.is_cooperative_by_default),
      characters: template.characters ? JSON.parse(template.characters) : undefined,
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/game-templates',
  [
    body('id').isString().notEmpty().trim().escape(),
    body('id_bgg').optional().isString().trim().escape(),
    body('name').isString().notEmpty().trim().escape(),
    body('min_players').optional().isInt(),
    body('max_players').optional().isInt(),
    body('description').optional().isString().trim(),
    body('image').optional().isString().trim(),
    body('hasCharacters').isBoolean(),
    body('characters').optional().isArray(),
    body('supportsCooperative').isBoolean(),
    body('supportsCompetitive').isBoolean(),
    body('supportsCampaign').isBoolean(),
    body('defaultMode').optional().isString().trim().escape(),
    body('isCooperativeByDefault').optional().isBoolean(),
  // pas de validation pour createdAt, il est toujours renseigné par le backend
  ],
  (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
  logger.debug('Validation errors in /api/game-templates POST:', JSON.stringify(errors.array(), null, 2));
  logger.debug('Request body in /api/game-templates POST:', JSON.stringify(req.body, null, 2));
  console.error('Validation errors:', errors.array());
  console.error('Request body:', req.body);
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const template = req.body
      const stmt = db.prepare(`
        INSERT OR REPLACE INTO game_templates 
        (id, id_bgg, name, min_players, max_players, description, image, has_characters, characters, supports_cooperative, supports_competitive, supports_campaign, default_mode, is_cooperative_by_default, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)
      stmt.run(
        template.id,
        template.id_bgg || null,
        template.name,
        template.min_players || null,
        template.max_players || null,
        template.description || null,
        template.image || null,
        template.hasCharacters ? 1 : 0,
        template.characters ? JSON.stringify(template.characters) : null,
        template.supportsCooperative ? 1 : 0,
        template.supportsCompetitive ? 1 : 0,
        template.supportsCampaign ? 1 : 0,
        template.defaultMode || 'competitive',
        template.isCooperativeByDefault ? 1 : 0,
        new Date().toISOString()
      )
      res.json(template)
    } catch (err) {
      logger.debug('Error in /api/game-templates POST:', err);
      console.error(err);
      res.status(500).json({ error: err.message })
    }
  }
)

// Update game template
app.put('/api/game-templates/:id',
  [
    body('id_bgg').optional().isString().trim().escape(),
    body('name').optional().isString().trim().escape(),
    body('min_players').optional().isInt(),
    body('max_players').optional().isInt(),
  // pas de validation pour description, il n'est pas obligatoire en modification
    body('image').optional().isString().trim(),
    body('hasCharacters').optional().isBoolean(),
    body('characters').optional().isArray(),
    body('supportsCooperative').optional().isBoolean(),
    body('supportsCompetitive').optional().isBoolean(),
    body('supportsCampaign').optional().isBoolean(),
    body('defaultMode').optional().isString().trim().escape(),
    body('isCooperativeByDefault').optional().isBoolean(),
  // pas de validation pour createdAt, il est toujours géré par le backend
  ],
  (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }
    try {
      const { id } = req.params
      const updates = req.body
      const sets = []
      const values = []
      if (updates.id_bgg !== undefined) {
        sets.push('id_bgg = ?')
        values.push(updates.id_bgg)
      }
      if (updates.name !== undefined) {
        sets.push('name = ?')
        values.push(updates.name)
      }
      if (updates.min_players !== undefined) {
        sets.push('min_players = ?')
        values.push(updates.min_players)
      }
      if (updates.max_players !== undefined) {
        sets.push('max_players = ?')
        values.push(updates.max_players)
      }
      if (updates.description !== undefined) {
        sets.push('description = ?')
        values.push(updates.description)
      }
      if (updates.image !== undefined) {
        sets.push('image = ?')
        values.push(updates.image)
      }
      if (updates.hasCharacters !== undefined) {
        sets.push('has_characters = ?')
        values.push(updates.hasCharacters ? 1 : 0)
      }
      if (updates.characters !== undefined) {
        sets.push('characters = ?')
        values.push(JSON.stringify(updates.characters))
      }
      if (updates.supportsCooperative !== undefined) {
        sets.push('supports_cooperative = ?')
        values.push(updates.supportsCooperative ? 1 : 0)
      }
      if (updates.supportsCompetitive !== undefined) {
        sets.push('supports_competitive = ?')
        values.push(updates.supportsCompetitive ? 1 : 0)
      }
      if (updates.supportsCampaign !== undefined) {
        sets.push('supports_campaign = ?')
        values.push(updates.supportsCampaign ? 1 : 0)
      }
      if (updates.defaultMode !== undefined) {
        sets.push('default_mode = ?')
        values.push(updates.defaultMode)
      }
      if (updates.isCooperativeByDefault !== undefined) {
        sets.push('is_cooperative_by_default = ?')
        values.push(updates.isCooperativeByDefault ? 1 : 0)
      }
  // pas de gestion du champ createdAt en modification
      if (sets.length === 0) {
        return res.status(400).json({ error: 'No updates provided' })
      }
      values.push(id)
      const stmt = db.prepare(`UPDATE game_templates SET ${sets.join(', ')} WHERE id = ?`)
      stmt.run(...values)
      const updated = db.prepare('SELECT * FROM game_templates WHERE id = ?').get(id)
      res.json(updated)
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  }
)

// Delete game template
app.delete('/api/game-templates/:id', (req, res) => {
  try {
    const { id } = req.params
    const stmt = db.prepare('DELETE FROM game_templates WHERE id = ?')
    stmt.run(id)
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Game Sessions

// GET /api/game-sessions — renvoie GameSessionDB[]
app.get('/api/game-sessions', (req, res) => {
  try {
  // Type attendu: GameSessionDB[]
  const sessions = db.prepare('SELECT * FROM game_sessions ORDER BY created_at DESC').all();
    res.json(sessions.map(session => ({
      ...session,
      players: JSON.parse(session.players),
      scores: JSON.parse(session.scores),
      characters: session.characters ? JSON.parse(session.characters) : undefined,
      extensions: session.extensions ? JSON.parse(session.extensions) : undefined,
      completed: Boolean(session.completed),
      dead_characters: session.dead_characters ? JSON.parse(session.dead_characters) : undefined,
      new_character_names: session.new_character_names ? JSON.parse(session.new_character_names) : undefined,
      character_history: session.character_history ? JSON.parse(session.character_history) : undefined,
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/game-sessions',
  [
    body('id').isString().notEmpty().trim().escape(),
    body('gameTemplateId').isString().notEmpty().trim().escape(),
    body('gameMode').optional().isString().trim().escape(),
    body('players').isArray(),
    body('scores').isArray(),
    body('characters').optional().isArray(),
    body('extensions').optional().isArray(),
    body('winner').optional().isString().trim().escape(),
    body('winCondition').optional().isString().trim().escape(),
    body('date').optional().isString().trim().escape(),
    body('startTime').optional().isString().trim().escape(),
    body('endTime').optional().isString().trim().escape(),
    body('duration').optional().isInt(),
    body('completed').isBoolean(),
    body('cooperativeResult').optional().isString().trim().escape(),
    body('deadCharacters').optional().isArray(),
    body('newCharacterNames').optional().isArray(),
    body('characterHistory').optional().isArray()
  ],
  (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }
    try {
      const session = req.body
      const stmt = db.prepare(`
        INSERT INTO game_sessions 
        (id, game_template_id, game_mode, players, scores, characters, extensions,
         winner, win_condition, date, start_time, end_time, duration, completed,
         coop_result, dead_characters, new_character_names, character_history)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)
      stmt.run(
        session.id,
        session.gameTemplateId,
        session.gameMode || 'competitive',
        JSON.stringify(session.players),
        JSON.stringify(session.scores),
        session.characters ? JSON.stringify(session.characters) : null,
        session.extensions ? JSON.stringify(session.extensions) : null,
        session.winner || null,
        session.winCondition || 'highest',
        session.date || new Date().toISOString().split('T')[0],
        session.startTime || null,
        session.endTime || null,
        session.duration || null,
        session.completed ? 1 : 0,
        session.cooperativeResult || null,
        session.deadCharacters ? JSON.stringify(session.deadCharacters) : null,
        session.newCharacterNames ? JSON.stringify(session.newCharacterNames) : null,
        session.characterHistory ? JSON.stringify(session.characterHistory) : null
      )
      res.json(session)
    } catch (err) {
      console.error('Error saving game session:', err)
      res.status(500).json({ error: err.message })
    }
  }
)

// Update game session
app.put('/api/game-sessions/:id',
  [
    body('gameTemplateId').optional().isString().trim().escape(),
    body('gameMode').optional().isString().trim().escape(),
    body('players').optional().isArray(),
    body('scores').optional().isArray(),
    body('characters').optional().isArray(),
    body('extensions').optional().isArray(),
    body('winner').optional().isString().trim().escape(),
    body('winCondition').optional().isString().trim().escape(),
    body('date').optional().isString().trim().escape(),
    body('startTime').optional().isString().trim().escape(),
    body('endTime').optional().isString().trim().escape(),
    body('duration').optional().isInt(),
    body('completed').optional().isBoolean(),
    body('cooperativeResult').optional().isString().trim().escape(),
    body('deadCharacters').optional().isArray(),
    body('newCharacterNames').optional().isArray(),
    body('characterHistory').optional().isArray()
  ],
  (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }
    try {
      const { id } = req.params
      const updates = req.body
      const sets = []
      const values = []
      if (updates.gameTemplateId !== undefined) {
        sets.push('game_template_id = ?')
        values.push(updates.gameTemplateId)
      }
      if (updates.gameMode !== undefined) {
        sets.push('game_mode = ?')
        values.push(updates.gameMode)
      }
      if (updates.players !== undefined) {
        sets.push('players = ?')
        values.push(JSON.stringify(updates.players))
      }
      if (updates.scores !== undefined) {
        sets.push('scores = ?')
        values.push(JSON.stringify(updates.scores))
      }
      if (updates.characters !== undefined) {
        sets.push('characters = ?')
        values.push(JSON.stringify(updates.characters))
      }
      if (updates.extensions !== undefined) {
        sets.push('extensions = ?')
        values.push(JSON.stringify(updates.extensions))
      }
      if (updates.winner !== undefined) {
        sets.push('winner = ?')
        values.push(updates.winner)
      }
      if (updates.winCondition !== undefined) {
        sets.push('win_condition = ?')
        values.push(updates.winCondition)
      }
      if (updates.date !== undefined) {
        sets.push('date = ?')
        values.push(updates.date)
      }
      if (updates.startTime !== undefined) {
        sets.push('start_time = ?')
        values.push(updates.startTime)
      }
      if (updates.endTime !== undefined) {
        sets.push('end_time = ?')
        values.push(updates.endTime)
      }
      if (updates.duration !== undefined) {
        sets.push('duration = ?')
        values.push(updates.duration)
      }
      if (updates.completed !== undefined) {
        sets.push('completed = ?')
        values.push(updates.completed ? 1 : 0)
      }
      if (updates.cooperativeResult !== undefined) {
        sets.push('coop_result = ?')
        values.push(updates.cooperativeResult)
      }
      if (updates.deadCharacters !== undefined) {
        sets.push('dead_characters = ?')
        values.push(JSON.stringify(updates.deadCharacters))
      }
      if (updates.newCharacterNames !== undefined) {
        sets.push('new_character_names = ?')
        values.push(JSON.stringify(updates.newCharacterNames))
      }
      if (updates.characterHistory !== undefined) {
        sets.push('character_history = ?')
        values.push(JSON.stringify(updates.characterHistory))
      }
      if (sets.length === 0) {
        return res.status(400).json({ error: 'No updates provided' })
      }
      values.push(id)
      const stmt = db.prepare(`UPDATE game_sessions SET ${sets.join(', ')} WHERE id = ?`)
      stmt.run(...values)
      const updated = db.prepare('SELECT * FROM game_sessions WHERE id = ?').get(id)
      res.json(updated)
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  }
)

// Delete game session
app.delete('/api/game-sessions/:id', (req, res) => {
  try {
    const { id } = req.params
    const stmt = db.prepare('DELETE FROM game_sessions WHERE id = ?')
    stmt.run(id)
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Current Game
app.get('/api/current-game', (req, res) => {
  try {
    const result = db.prepare('SELECT game_data FROM current_game WHERE id = 1').get()
    const gameData = result?.game_data ? JSON.parse(result.game_data) : null
    res.json(gameData)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.put('/api/current-game',
  [
    body('game').isObject()
  ],
  (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }
    try {
      const game = req.body.game
      const stmt = db.prepare('UPDATE current_game SET game_data = ? WHERE id = 1')
      stmt.run(game ? JSON.stringify(game) : null)
      res.json({ success: true })
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  }
)


// --- Extensions API ---
// List extensions for a base game
app.get('/api/extensions/:baseGameName', (req, res) => {
  try {
    const baseGameName = req.params.baseGameName;
    const extensions = db.prepare('SELECT id, name, base_game_name, description FROM game_extensions WHERE base_game_name = ? ORDER BY name').all(baseGameName);
    res.json(extensions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// Add a new extension
app.post('/api/extensions', [
  body('name').isString().notEmpty().trim().escape(),
  body('base_game_name').isString().notEmpty().trim().escape(),
  body('description').optional().isString().trim()
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { name, base_game_name, description } = req.body;
    const id = Date.now().toString(36) + Math.random().toString(36).substr(2);
    db.prepare('INSERT INTO game_extensions (id, name, base_game_name, description) VALUES (?, ?, ?, ?)').run(id, name, base_game_name, description || null);
    res.json({ id, name, base_game_name, description });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// Delete an extension
app.delete('/api/extensions/:id', (req, res) => {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM game_extensions WHERE id = ?').run(id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// Update an extension
app.put('/api/extensions/:id', [
  body('name').optional().isString().trim().escape(),
  body('description').optional().isString().trim()
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    const sets = [];
    const values = [];
    if (name !== undefined) {
      sets.push('name = ?');
      values.push(name);
    }
    if (description !== undefined) {
      sets.push('description = ?');
      values.push(description);
    }
    if (sets.length === 0) {
      return res.status(400).json({ error: 'No updates provided' });
    }
    values.push(id);
    db.prepare(`UPDATE game_extensions SET ${sets.join(', ')} WHERE id = ?`).run(...values);
    const updated = db.prepare('SELECT * FROM game_extensions WHERE id = ?').get(id);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Démarrer le serveur
app.listen(PORT, '0.0.0.0', () => {
  logger.debug(`🗄️  Base de données SQLite créée dans: ${dbPath}`)
  logger.debug(`🚀 Serveur API démarré sur http://localhost:${PORT}`)
})

// ...routes API et autres...

// Place cette route tout en bas du fichier, après toutes les routes API :
// Fallback SPA pour toutes les routes non gérées
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});