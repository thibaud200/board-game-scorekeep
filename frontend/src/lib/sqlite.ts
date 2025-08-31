import { Database, generateId, DEFAULT_GAME_TEMPLATES } from './database'
import { PlayerDB, GameSessionDB, GameTemplate, GameExtensionDB } from '../types';
import * as sql from "sql.js"
import { logger } from '@/lib/logger';

const initSqlJs = sql.default ?? sql

interface SqlDatabase {
  run(sql: string, params?: unknown[]): void
  prepare(sql: string): {
    step(): boolean
    getAsObject(): Record<string, unknown>
    bind(params: unknown[]): void
    free(): void
  }
  export(): Uint8Array
  close(): void
}

interface SqlJs {
  Database: new (data?: Uint8Array) => SqlDatabase
}

export class SQLiteDatabase implements Database {
  // Extension operations
  async getGameExtensions(baseGameName?: string): Promise<GameExtensionDB[]> {
    if (!this.db) throw new Error('Database not initialized');
    let query = 'SELECT * FROM game_extensions';
  let params: unknown[] = [];
    if (baseGameName) {
      query += ' WHERE base_game_name = ?';
      params.push(baseGameName);
    }
    const stmt = this.db.prepare(query);
    if (params.length) stmt.bind(params);
    const extensions: GameExtensionDB[] = [];
    while (stmt.step()) {
      const row = stmt.getAsObject();
      extensions.push({
        id: String(row.id),
        name: row.name as string,
        base_game_name: row.base_game_name as string,
        description: typeof row.description === 'string' ? row.description : undefined,
        image: typeof row.image === 'string' ? row.image : undefined,
        min_players: row.min_players !== undefined ? Number(row.min_players) : undefined,
        max_players: row.max_players !== undefined ? Number(row.max_players) : undefined,
        created_at: typeof row.created_at === 'string' ? row.created_at : ''
      });
    }
    stmt.free();
    return extensions;
  }

  async addGameExtension(extension: { name: string; base_game_name: string; description?: string; image?: string; min_players?: number; max_players?: number }): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    const id = generateId();
    this.db.run(`
      INSERT OR REPLACE INTO game_extensions (
        id, name, base_game_name, description, image, min_players, max_players, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      id,
      extension.name,
      extension.base_game_name,
      extension.description || null,
      extension.image || null,
      extension.min_players ?? null,
      extension.max_players ?? null,
      new Date().toISOString()
    ]);
    this.saveToStorage();
    // Ne retourne rien, conforme à Database
  }

  async updateGameExtension(id: string, updates: { name?: string; description?: string; image?: string; min_players?: number; max_players?: number }): Promise<GameExtensionDB> {
    if (!this.db) throw new Error('Database not initialized');
    const sets: string[] = [];
  const values: unknown[] = [];
    if (updates.name !== undefined) {
      sets.push('name = ?');
      values.push(updates.name);
    }
    if (updates.description !== undefined) {
      sets.push('description = ?');
      values.push(updates.description);
    }
    if (updates.image !== undefined) {
      sets.push('image = ?');
      values.push(updates.image);
    }
      if (updates.min_players !== undefined) {
        sets.push('min_players = ?');
        values.push(updates.min_players);
      }
      if (updates.max_players !== undefined) {
        sets.push('max_players = ?');
        values.push(updates.max_players);
      }
    if (sets.length === 0) throw new Error('No updates provided');
    values.push(id);
    this.db.run(`UPDATE game_extensions SET ${sets.join(', ')} WHERE id = ?`, values);
    this.saveToStorage();
    const extensions = await this.getGameExtensions();
  return extensions.find(e => e.id === id) as GameExtensionDB;
  }

  async deleteGameExtension(id: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    this.db.run('DELETE FROM game_extensions WHERE id = ?', [id]);
    this.saveToStorage();
  }
  private db: SqlDatabase | null = null
  private SQL: SqlJs | null = null
  private dbPath = 'board-game-tracker.db'

  async init(): Promise<void> {
    try {
      this.SQL = await initSqlJs({
        locateFile: (file: string) => `/${file}`
      }) as SqlJs

      const dbExists = await this.loadFromStorage()
      
      if (!dbExists) {
        this.db = new this.SQL.Database()
        await this.createTables()
        await this.seedDefaultData()
        await this.saveToStorage()
      }
      
  logger.debug('Base de données SQLite initialisée avec succès');
    } catch (error) {
  logger.debug('Échec d\'initialisation de la base de données SQLite: ' + (error instanceof Error ? error.message : String(error)));
      throw error
    }
  }

  private async loadFromStorage(): Promise<boolean> {
    if (!this.SQL) return false
    
    try {
      const saved = localStorage.getItem('boardgame-db-backup')
      if (saved) {
        const data = new Uint8Array(JSON.parse(saved))
        this.db = new this.SQL.Database(data)
          logger.debug('Base de données chargée depuis localStorage');
        return true
      }
    } catch (error) {
        logger.debug('Aucune sauvegarde localStorage trouvée');
    }
    
    return false
  }

  private saveToStorage(): void {
    if (!this.db) return
    const data = this.db.export()
    localStorage.setItem('boardgame-db-backup', JSON.stringify(Array.from(data)))
  }

  private async createTables(): Promise<void> {
  if (!this.db) throw new Error('Base de données non initialisée');
  this.db.run(`
      CREATE TABLE IF NOT EXISTS game_characters (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        character_class TEXT,
        game_name TEXT NOT NULL,
        description TEXT,
        image TEXT
      )
    `)
    if (!this.db) throw new Error('Base de données non initialisée')

  if (!this.db) throw new Error('Base de données non initialisée');
  this.db.run(`
      CREATE TABLE IF NOT EXISTS players (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        avatar TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)

  if (!this.db) throw new Error('Base de données non initialisée');
  this.db.run(`
      CREATE TABLE IF NOT EXISTS game_templates (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        has_characters BOOLEAN NOT NULL,
        characters TEXT,
        is_cooperative_by_default BOOLEAN NOT NULL,
        base_game_name TEXT, -- NULL si jeu de base, sinon nom du jeu de base
        min_players INTEGER,
        max_players INTEGER,
        description TEXT,
        image TEXT,
        id_bgg TEXT,
        supports_cooperative BOOLEAN,
        supports_competitive BOOLEAN,
        supports_campaign BOOLEAN,
        default_mode TEXT
      )
    `)

  // New extensions table
  this.db.run(`
      CREATE TABLE IF NOT EXISTS game_extensions (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        base_game_name TEXT NOT NULL,
        description TEXT,
        image TEXT,
        min_players INTEGER,
        max_players INTEGER,
        FOREIGN KEY (base_game_name) REFERENCES game_templates(name)
      )
    `)

  if (!this.db) throw new Error('Base de données non initialisée');
  this.db.run(`
      CREATE TABLE IF NOT EXISTS game_sessions (
        id TEXT PRIMARY KEY,
        game_type TEXT NOT NULL,
        is_cooperative BOOLEAN NOT NULL,
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
        image TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)

  if (!this.db) throw new Error('Base de données non initialisée');
  this.db.run(`
      CREATE TABLE IF NOT EXISTS current_game (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        game_data TEXT
      )
    `)

  if (!this.db) throw new Error('Base de données non initialisée');
  this.db.run('INSERT OR IGNORE INTO current_game (id, game_data) VALUES (1, NULL)')
  logger.debug('Tables de base de données créées avec succès');
  }

  private async seedDefaultData(): Promise<void> {
    for (const template of DEFAULT_GAME_TEMPLATES) {
      await this.addGameTemplate(template)
    }
  logger.debug('Templates par défaut ajoutés');
  }

  async saveToFile(): Promise<void> {
    if (!this.db) throw new Error('Base de données non initialisée')
    
    const data = this.db.export()
    
    if ('showSaveFilePicker' in window) {
      try {
  const fileHandle = await (window as unknown as { showSaveFilePicker: Function }).showSaveFilePicker({
          suggestedName: this.dbPath,
          startIn: 'downloads',
          types: [{
            description: 'Base de données SQLite',
            accept: { 'application/x-sqlite3': ['.db'] }
          }]
        })
        
        const writable = await fileHandle.createWritable()
        await writable.write(data)
        await writable.close()
        
          logger.debug(`Base de données sauvegardée: ${this.dbPath}`);
      } catch (err) {
          logger.debug('Sauvegarde annulée par l\'utilisateur');
        this.downloadDatabase(data)
      }
    } else {
      this.downloadDatabase(data)
    }
  }

  async loadFromFile(): Promise<void> {
    if (!this.SQL) throw new Error('SQL.js non initialisé')
    
    if ('showOpenFilePicker' in window) {
      try {
  const [fileHandle] = await (window as unknown as { showOpenFilePicker: Function }).showOpenFilePicker({
          types: [{
            description: 'Base de données SQLite',
            accept: { 'application/x-sqlite3': ['.db'] }
          }]
        })
        
        const file = await fileHandle.getFile()
        const arrayBuffer = await file.arrayBuffer()
        const uint8Array = new Uint8Array(arrayBuffer)
        
        this.db?.close()
        this.db = new this.SQL.Database(uint8Array)
        this.saveToStorage()
        
          logger.debug(`Base de données chargée depuis: ${file.name}`);
      } catch (err) {
          logger.debug('Chargement de fichier annulé');
        throw new Error('Chargement de fichier annulé')
      }
    } else {
      throw new Error('API File System Access non supportée')
    }
  }

  private downloadDatabase(data: Uint8Array): void {
    const buffer = new ArrayBuffer(data.length)
    const view = new Uint8Array(buffer)
    view.set(data)
    const blob = new Blob([buffer], { type: 'application/octet-stream' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = this.dbPath
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  logger.debug(`Base de données téléchargée: ${this.dbPath}`);
  }

  // Player operations
  async getPlayers(): Promise<PlayerDB[]> {
    if (!this.db) throw new Error('Database not initialized')

    const stmt = this.db.prepare('SELECT * FROM players ORDER BY name')
    const players: PlayerDB[] = []

    while (stmt.step()) {
      const row = stmt.getAsObject()
      players.push({
        id: row.id as string,
        name: row.name as string,
        created_at: typeof row.created_at === 'string' ? row.created_at : ''
      });
    }

    stmt.free()
    return players
  }

  async addPlayer(player: Omit<PlayerDB, 'id'>): Promise<PlayerDB> {
    if (!this.db) throw new Error('Database not initialized')

    const id = generateId()
    const newPlayer: PlayerDB = { id, ...player }

    this.db.run(
      'INSERT INTO players (id, name) VALUES (?, ?)',
      [id, player.name]
    )

    this.saveToStorage()
    return newPlayer
  }

  async updatePlayer(id: string, updates: Partial<PlayerDB>): Promise<PlayerDB> {
    if (!this.db) throw new Error('Database not initialized')

  const sets: string[] = []
  const values: (string | number | null)[] = []

    if (updates.name !== undefined) {
      sets.push('name = ?')
      values.push(updates.name)
    }

    if (sets.length === 0) {
      throw new Error('No updates provided')
    }

    values.push(id)
    this.db.run(`UPDATE players SET ${sets.join(', ')} WHERE id = ?`, values)

    this.saveToStorage()

    const stmt = this.db.prepare('SELECT * FROM players WHERE id = ?')
    stmt.bind([id])
    
    if (stmt.step()) {
      const row = stmt.getAsObject()
      stmt.free()
      return {
        id: row.id as string,
        name: row.name as string,
        created_at: typeof row.created_at === 'string' ? row.created_at : ''
      }
    }

    stmt.free()
    throw new Error('Player not found')
  }

  async deletePlayer(id: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized')

    this.db.run('DELETE FROM players WHERE id = ?', [id])
    this.saveToStorage()
  }

  // Game History operations
  async getGameHistory(): Promise<GameSessionDB[]> {
    if (!this.db) throw new Error('Database not initialized')

    const stmt = this.db.prepare('SELECT * FROM game_sessions ORDER BY created_at DESC')
    const sessions: GameSessionDB[] = [];

    while (stmt.step()) {
      const row = stmt.getAsObject();
      sessions.push({
        id: row.id as string,
        game_type: row.game_type as string,
        is_cooperative: Boolean(row.is_cooperative),
        game_mode: ['cooperative', 'competitive', 'campaign'].includes(row.game_mode as string)
          ? (row.game_mode as 'cooperative' | 'competitive' | 'campaign')
          : 'competitive',
        players: JSON.parse(row.players as string),
        scores: JSON.parse(row.scores as string),
        characters: row.characters ? JSON.parse(row.characters as string) : undefined,
        extensions: row.extensions ? JSON.parse(row.extensions as string) : undefined,
        winner: (row.winner as string) || undefined,
        win_condition: ['highest', 'lowest', 'cooperative'].includes(row.win_condition as string)
          ? (row.win_condition as 'highest' | 'lowest' | 'cooperative')
          : undefined,
        date: row.date as string,
        start_time: (row.start_time as string) || '',
        end_time: (row.end_time as string) || undefined,
        duration: typeof row.duration === 'string' ? row.duration : undefined,
        completed: Boolean(row.completed),
        coop_result: row.coop_result as string,
        dead_characters: row.dead_characters ? JSON.parse(row.dead_characters as string) : undefined,
        new_character_names: row.new_character_names ? JSON.parse(row.new_character_names as string) : undefined,
        character_history: row.character_history ? JSON.parse(row.character_history as string) : undefined,
        created_at: typeof row.created_at === 'string' ? row.created_at : ''
      });
    }

    stmt.free();
    return sessions;
  }

  async addGameSession(session: Omit<GameSessionDB, 'id'>): Promise<GameSessionDB> {
    if (!this.db) throw new Error('Database not initialized')

    const id = generateId();
    this.db.run(`
      INSERT INTO game_sessions (
        id, game_type, is_cooperative, game_mode, players, scores, characters, extensions, winner, win_condition, date, start_time, end_time, duration, completed, coop_result, dead_characters, new_character_names, character_history, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      id,
      session.game_type,
      session.is_cooperative ? 1 : 0,
      session.game_mode,
      JSON.stringify(session.players),
      JSON.stringify(session.scores),
      session.characters ? JSON.stringify(session.characters) : null,
      session.extensions ? JSON.stringify(session.extensions) : null,
      session.winner || null,
      session.win_condition || null,
      session.date || null,
      session.start_time || null,
      session.end_time || null,
      session.duration || null,
      session.completed ? 1 : 0,
      session.coop_result || null,
      session.dead_characters ? JSON.stringify(session.dead_characters) : null,
      session.new_character_names ? JSON.stringify(session.new_character_names) : null,
      session.character_history ? JSON.stringify(session.character_history) : null,
      new Date().toISOString()
    ]);
    this.saveToStorage();
    return { id, ...session, created_at: new Date().toISOString() };
  }

  async updateGameSession(id: string, updates: Partial<GameSessionDB>): Promise<GameSessionDB> {
    if (!this.db) throw new Error('Database not initialized')

  const sets: string[] = []
  const values: (string | number | boolean | null)[] = []

    if (updates.game_type !== undefined) {
      sets.push('game_type = ?');
      values.push(updates.game_type);
    }
    if (updates.is_cooperative !== undefined) {
      sets.push('is_cooperative = ?');
      values.push(updates.is_cooperative ? 1 : 0);
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
      values.push(updates.characters ? JSON.stringify(updates.characters) : null)
    }
    if (updates.extensions !== undefined) {
      sets.push('extensions = ?')
      values.push(updates.extensions ? JSON.stringify(updates.extensions) : null)
    }
    if (updates.winner !== undefined) {
      sets.push('winner = ?')
      values.push(updates.winner)
    }
    if (updates.win_condition !== undefined) {
      sets.push('win_condition = ?');
      values.push(updates.win_condition);
    }
    if (updates.start_time !== undefined) {
      sets.push('start_time = ?');
      values.push(updates.start_time);
    }
    if (updates.end_time !== undefined) {
      sets.push('end_time = ?');
      values.push(updates.end_time);
    }
    if (updates.duration !== undefined) {
      sets.push('duration = ?')
      values.push(updates.duration)
    }
    if (updates.completed !== undefined) {
      sets.push('completed = ?')
      values.push(updates.completed ? 1 : 0)
    }

    if (sets.length === 0) {
      throw new Error('No updates provided')
    }

    values.push(id)
    this.db.run(`UPDATE game_sessions SET ${sets.join(', ')} WHERE id = ?`, values)

    this.saveToStorage()

    const sessions = await this.getGameHistory()
    const updated = sessions.find(s => s.id === id)
    if (!updated) throw new Error('Game session not found')
    return updated
  }

  async deleteGameSession(id: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized')

    this.db.run('DELETE FROM game_sessions WHERE id = ?', [id])
    this.saveToStorage()
  }

  // Game Template operations
  async getGameTemplates(): Promise<GameTemplate[]> {
    if (!this.db) throw new Error('Database not initialized')

    const stmt = this.db.prepare('SELECT * FROM game_templates ORDER BY name')
    const templates: GameTemplate[] = []

    while (stmt.step()) {
      const row = stmt.getAsObject();
      templates.push({
        id: String(row.id),
        name: row.name as string,
        hasCharacters: Boolean(row.has_characters),
        characters: row.characters ? JSON.parse(row.characters as string) : undefined,
        supportsCooperative: Boolean(row.supports_cooperative),
        supportsCompetitive: Boolean(row.supports_competitive),
        supportsCampaign: Boolean(row.supports_campaign),
        defaultMode: row.default_mode as 'cooperative' | 'competitive' | 'campaign' || 'competitive',
        min_players: row.min_players !== undefined ? Number(row.min_players) : undefined,
        max_players: row.max_players !== undefined ? Number(row.max_players) : undefined,
        description: row.description as string || undefined,
        image: row.image as string || undefined
      });
    }

    stmt.free()
    return templates
  }

  async addGameTemplate(template: GameTemplate): Promise<GameTemplate> {
    if (!this.db) throw new Error('Database not initialized')

    this.db.run(`
      INSERT OR REPLACE INTO game_templates (
        name, has_characters, characters, is_cooperative_by_default, base_game_name, min_players, max_players, description, image, id_bgg, supports_cooperative, supports_competitive, supports_campaign, default_mode
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      template.name,
      template.hasCharacters ? 1 : 0,
      template.characters ? JSON.stringify(template.characters) : null,
      template.isCooperativeByDefault ? 1 : 0,
      template.base_game_name || null,
      template.min_players || null,
      template.max_players || null,
      template.description || null,
      template.image || null,
      template.id_bgg || null,
      template.supportsCooperative ? 1 : 0,
      template.supportsCompetitive ? 1 : 0,
      template.supportsCampaign ? 1 : 0,
      template.defaultMode || 'competitive'
    ])

    this.saveToStorage()
    return template
  }

  async updateGameTemplate(id: string, updates: Partial<GameTemplate>): Promise<GameTemplate> {
    if (!this.db) throw new Error('Database not initialized')

  const sets: string[] = []
  const values: (string | number | boolean | null)[] = []

    if (updates.id_bgg !== undefined) {
      sets.push('id_bgg = ?');
      values.push(updates.id_bgg);
    }

    if (updates.hasCharacters !== undefined) {
      sets.push('has_characters = ?');
      values.push(updates.hasCharacters ? 1 : 0);
    }
    if (updates.characters !== undefined) {
      sets.push('characters = ?');
      values.push(updates.characters ? JSON.stringify(updates.characters) : null);
    }
    if (updates.isCooperativeByDefault !== undefined) {
      sets.push('is_cooperative_by_default = ?');
      values.push(updates.isCooperativeByDefault ? 1 : 0);
    }
    if (typeof (updates as Partial<GameTemplate>).base_game_name !== 'undefined') {
      sets.push('base_game_name = ?');
  values.push((updates as Partial<GameTemplate>).base_game_name ?? null);
    }
    if (updates.min_players !== undefined) {
      sets.push('min_players = ?');
      values.push(updates.min_players);
    }
    if (updates.max_players !== undefined) {
      sets.push('max_players = ?');
      values.push(updates.max_players);
    }
    if (updates.description !== undefined) {
      sets.push('description = ?');
      values.push(updates.description);
    }
    if (updates.image !== undefined) {
      sets.push('image = ?');
      values.push(updates.image);
    }

    if (sets.length === 0) {
      throw new Error('No updates provided')
    }

  values.push(id)
  this.db.run(`UPDATE game_templates SET ${sets.join(', ')} WHERE id = ?`, values)

    this.saveToStorage()

    const templates = await this.getGameTemplates()
  const updated = templates.find(t => String(t.id) === String(id))
    if (!updated) throw new Error('Game template not found')
    return updated
  }

  async deleteGameTemplate(id: number): Promise<void> {
  if (!this.db) throw new Error('Database not initialized');
  // Vérifie et convertit l'id en nombre si besoin
  const templateId = typeof id === 'string' ? Number(id) : id;
  if (!templateId || isNaN(templateId)) throw new Error('Invalid template id');
  // Supprime les extensions associées
  this.db.run('DELETE FROM game_extensions WHERE base_game_name = ?', [templateId]);
  // Supprime les personnages liés
  this.db.run('DELETE FROM game_characters WHERE game_name = ?', [templateId]);
  this.db.run('DELETE FROM game_templates WHERE id = ?', [templateId]);
  this.saveToStorage();
  }

  // Current Game operations
  async getCurrentGame(): Promise<GameSessionDB | null> {
    if (!this.db) throw new Error('Database not initialized')

    const stmt = this.db.prepare('SELECT game_data FROM current_game WHERE id = 1')
    
    if (stmt.step()) {
      const row = stmt.getAsObject()
      stmt.free()
      const gameData = row.game_data as string
      return gameData ? JSON.parse(gameData) : null
    }

    stmt.free()
    return null
  }

  async setCurrentGame(game: GameSessionDB | null): Promise<void> {
    if (!this.db) throw new Error('Database not initialized')

    this.db.run(
      'UPDATE current_game SET game_data = ? WHERE id = 1',
      [game ? JSON.stringify(game) : null]
    )

    this.saveToStorage()
  }

  // Database management
  async export(): Promise<Uint8Array> {
    if (!this.db) throw new Error('Database not initialized')
    return this.db.export()
  }

  async import(data: Uint8Array): Promise<void> {
    if (!this.SQL) throw new Error('sql.js not initialized')
    
    this.db?.close()
    this.db = new this.SQL.Database(data)
    this.saveToStorage()
  }
}
