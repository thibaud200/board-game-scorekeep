import { body, validationResult } from 'express-validator'
import express from 'express'
import Database from 'better-sqlite3'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import fetch from 'node-fetch' // Pour les requêtes BGG

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = 3001

// Créer la base de données dans le répertoire du projet
const dbPath = path.join(__dirname, 'database', 'board-game-tracker.db')
const db = new Database(dbPath)
const distPath = path.join(__dirname, 'dist');
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
    
    console.log('BGG Proxy Request:', bggUrl)
    console.log('BGG Params:', req.params)
    console.log('BGG Query:', queryString)
    
    const response = await fetch(bggUrl, {
      headers: {
        'User-Agent': 'BoardGameScoreTracker/1.0'
      }
    })
    
    if (!response.ok) {
      console.log('BGG API Error:', response.status, response.statusText)
      return res.status(response.status).json({ error: 'BGG API Error' })
    }
    
    const xmlData = await response.text()
    console.log('BGG Response (first 200 chars):', xmlData.substring(0, 200))
    
    // Retourner le XML avec le bon content-type
    res.set('Content-Type', 'application/xml')
    res.send(xmlData)
    
    // Rate limiting : petite pause pour éviter le spam
    await new Promise(resolve => setTimeout(resolve, 100))
    
  } catch (error) {
    console.error('BGG Proxy Error:', error)
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
    name TEXT PRIMARY KEY,
    has_characters BOOLEAN NOT NULL,
    characters TEXT,
    supports_cooperative BOOLEAN NOT NULL,
    supports_competitive BOOLEAN NOT NULL,
    supports_campaign BOOLEAN NOT NULL,
    default_mode TEXT,
    is_cooperative_by_default BOOLEAN NOT NULL
  );

  CREATE TABLE IF NOT EXISTS game_sessions (
    id TEXT PRIMARY KEY,
    game_type TEXT NOT NULL,
    is_cooperative BOOLEAN NOT NULL,
    players TEXT NOT NULL,
    scores TEXT NOT NULL,
    characters TEXT,
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
    name TEXT NOT NULL,
    base_game_name TEXT NOT NULL,
    description TEXT,
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
  `)
} catch (error) {
  // Les colonnes existent déjà, on ignore l'erreur
  console.log('Colonnes déjà existantes ou ajoutées')
}

console.log('🗄️  Base de données SQLite créée dans:', dbPath)

// Routes API

// Players
app.get('/api/players', (req, res) => {
  try {
    const players = db.prepare('SELECT * FROM players ORDER BY name').all()
    res.json(players)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

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
    } catch (error) {
      res.status(500).json({ error: error.message })
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
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  }
)

app.delete('/api/players/:id', (req, res) => {
  try {
    const { id } = req.params
    const stmt = db.prepare('DELETE FROM players WHERE id = ?')
    stmt.run(id)
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Game Templates
app.get('/api/game-templates', (req, res) => {
  try {
    const templates = db.prepare('SELECT * FROM game_templates ORDER BY name').all()
    res.json(templates.map(template => ({
      name: template.name,
      hasCharacters: Boolean(template.has_characters),
      characters: template.characters ? JSON.parse(template.characters) : undefined,
      supportsCooperative: Boolean(template.supports_cooperative),
      supportsCompetitive: Boolean(template.supports_competitive),
      supportsCampaign: Boolean(template.supports_campaign),
      defaultMode: template.default_mode || 'competitive',
      isCooperativeByDefault: Boolean(template.is_cooperative_by_default)
    })))
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.post('/api/game-templates',
  [
    body('name').isString().notEmpty().trim().escape(),
    body('hasCharacters').isBoolean(),
    body('characters').optional().isArray(),
  // removed legacy extensions validation
    body('supportsCooperative').isBoolean(),
    body('supportsCompetitive').isBoolean(),
    body('supportsCampaign').isBoolean(),
    body('defaultMode').optional().isString().trim().escape(),
    body('isCooperativeByDefault').optional().isBoolean()
  ],
  (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }
    try {
      const template = req.body
      const stmt = db.prepare(`
        INSERT OR REPLACE INTO game_templates 
        (name, has_characters, characters, supports_cooperative, supports_competitive, supports_campaign, default_mode, is_cooperative_by_default)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `)
      stmt.run(
        template.name,
        template.hasCharacters ? 1 : 0,
        template.characters ? JSON.stringify(template.characters) : null,
        template.supportsCooperative ? 1 : 0,
        template.supportsCompetitive ? 1 : 0,
        template.supportsCampaign ? 1 : 0,
        template.defaultMode || 'competitive',
        template.isCooperativeByDefault || template.supportsCooperative ? 1 : 0
      )
      res.json(template)
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  }
)

// Game Sessions
app.get('/api/game-sessions', (req, res) => {
  try {
    const sessions = db.prepare('SELECT * FROM game_sessions ORDER BY created_at DESC').all()
    res.json(sessions.map(session => ({
      id: session.id,
      gameTemplate: session.game_type, // Primary field for consistency
      gameType: session.game_type, // Keep for backward compatibility
      gameMode: session.game_mode || (session.is_cooperative ? 'cooperative' : 'competitive'), // Fallback for legacy data
      isCooperative: Boolean(session.is_cooperative), // Keep for backward compatibility
      players: JSON.parse(session.players),
      scores: JSON.parse(session.scores),
      characters: session.characters ? JSON.parse(session.characters) : undefined,
  extensions: session.extensions ? JSON.parse(session.extensions) : undefined, // still used for now, will be migrated to array of extension names
      winner: session.winner,
      winCondition: session.win_condition,
      date: session.date,
      startTime: session.start_time,
      endTime: session.end_time,
      duration: session.duration,
      completed: Boolean(session.completed),
      // Map coop_result to cooperativeResult and convert legacy values
      cooperativeResult: session.coop_result === 'won' ? 'victory' : 
                        session.coop_result === 'lost' ? 'defeat' : 
                        session.coop_result,
      deadCharacters: session.dead_characters ? JSON.parse(session.dead_characters) : undefined,
      newCharacterNames: session.new_character_names ? JSON.parse(session.new_character_names) : undefined,
      characterHistory: session.character_history ? JSON.parse(session.character_history) : undefined
    })))
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.post('/api/game-sessions',
  [
    body('id').isString().notEmpty().trim().escape(),
    body('gameTemplate').optional().isString().trim().escape(),
    body('gameType').optional().isString().trim().escape(),
    body('isCooperative').isBoolean(),
    body('gameMode').optional().isString().trim().escape(),
    body('players').isArray(),
    body('scores').isArray(),
    body('characters').optional().isArray(),
  body('extensions').optional().isArray(), // keep for now, but should be array of extension names from new table
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
        (id, game_type, is_cooperative, game_mode, players, scores, characters, extensions,
         winner, win_condition, date, start_time, end_time, duration, completed,
         coop_result, dead_characters, new_character_names, character_history)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)
      stmt.run(
        session.id,
        session.gameTemplate || session.gameType, // Support both field names
        session.isCooperative ? 1 : 0, // Keep for backward compatibility
        session.gameMode || (session.isCooperative ? 'cooperative' : 'competitive'), // New game mode field
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
        1, // Always mark as completed when saving through this endpoint
        session.cooperativeResult || session.coopResult || null,
        session.deadCharacters ? JSON.stringify(session.deadCharacters) : null,
        session.newCharacterNames ? JSON.stringify(session.newCharacterNames) : null,
        session.characterHistory ? JSON.stringify(session.characterHistory) : null
      )
      res.json(session)
    } catch (error) {
      console.error('Error saving game session:', error)
      res.status(500).json({ error: error.message })
    }
  }
)

// Current Game
app.get('/api/current-game', (req, res) => {
  try {
    const result = db.prepare('SELECT game_data FROM current_game WHERE id = 1').get()
    const gameData = result?.game_data ? JSON.parse(result.game_data) : null
    res.json(gameData)
  } catch (error) {
    res.status(500).json({ error: error.message })
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
    } catch (error) {
      res.status(500).json({ error: error.message })
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
  } catch (error) {
    res.status(500).json({ error: error.message });
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
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// Delete an extension
app.delete('/api/extensions/:id', (req, res) => {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM game_extensions WHERE id = ?').run(id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
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
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Démarrer le serveur
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🗄️  Base de données SQLite créée dans: ${dbPath}`)
  console.log(`🚀 Serveur API démarré sur http://localhost:${PORT}`)
})

// ...routes API et autres...

// Place cette route tout en bas du fichier, après toutes les routes API :
// Fallback SPA pour toutes les routes non gérées
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});