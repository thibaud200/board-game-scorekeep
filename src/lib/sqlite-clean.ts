import { Database, generateId, DEFAULT_GAME_TEMPLATES } from './database'
import { Player, GameSession, GameTemplate } from '@/App'
import * as sql from "sql.js"

const initSqlJs = sql.default ?? sql

interface SqlDatabase {
  run(sql: string, params?: any[]): void
  prepare(sql: string): {
    step(): boolean
    getAsObject(): any
    bind(params: any[]): void
    free(): void
  }
  export(): Uint8Array
  close(): void
}

interface SqlJs {
  Database: new (data?: Uint8Array) => SqlDatabase
}

export class SQLiteDatabase implements Database {
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
      
      console.log('Base de données SQLite initialisée avec succès')
    } catch (error) {
      console.error('Échec d\'initialisation de la base de données SQLite:', error)
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
        console.log('Base de données chargée depuis localStorage')
        return true
      }
    } catch (error) {
      console.log('Aucune sauvegarde localStorage trouvée')
    }
    
    return false
  }

  private saveToStorage(): void {
    if (!this.db) return
    const data = this.db.export()
    localStorage.setItem('boardgame-db-backup', JSON.stringify(Array.from(data)))
  }

  private async createTables(): Promise<void> {
    if (!this.db) throw new Error('Base de données non initialisée')

    this.db.run(`
      CREATE TABLE IF NOT EXISTS players (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        avatar TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)

    this.db.run(`
      CREATE TABLE IF NOT EXISTS game_templates (
        name TEXT PRIMARY KEY,
        has_characters BOOLEAN NOT NULL,
        characters TEXT,
        has_extensions BOOLEAN NOT NULL,
        extensions TEXT,
        is_cooperative_by_default BOOLEAN NOT NULL
      )
    `)

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
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)

    this.db.run(`
      CREATE TABLE IF NOT EXISTS current_game (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        game_data TEXT
      )
    `)

    this.db.run('INSERT OR IGNORE INTO current_game (id, game_data) VALUES (1, NULL)')
    console.log('Tables de base de données créées avec succès')
  }

  private async seedDefaultData(): Promise<void> {
    for (const template of DEFAULT_GAME_TEMPLATES) {
      await this.addGameTemplate(template)
    }
    console.log('Templates par défaut ajoutés')
  }

  async saveToFile(): Promise<void> {
    if (!this.db) throw new Error('Base de données non initialisée')
    
    const data = this.db.export()
    
    if ('showSaveFilePicker' in window) {
      try {
        const fileHandle = await (window as any).showSaveFilePicker({
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
        
        console.log(`Base de données sauvegardée: ${this.dbPath}`)
      } catch (err) {
        console.log('Sauvegarde annulée par l\'utilisateur')
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
        const [fileHandle] = await (window as any).showOpenFilePicker({
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
        
        console.log(`Base de données chargée depuis: ${file.name}`)
      } catch (err) {
        console.log('Chargement de fichier annulé')
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
    console.log(`Base de données téléchargée: ${this.dbPath}`)
  }

  // Player operations
  async getPlayers(): Promise<Player[]> {
    if (!this.db) throw new Error('Database not initialized')

    const stmt = this.db.prepare('SELECT * FROM players ORDER BY name')
    const players: Player[] = []

    while (stmt.step()) {
      const row = stmt.getAsObject()
      players.push({
        id: row.id as string,
        name: row.name as string,
        avatar: row.avatar as string || undefined
      })
    }

    stmt.free()
    return players
  }

  async addPlayer(player: Omit<Player, 'id'>): Promise<Player> {
    if (!this.db) throw new Error('Database not initialized')

    const id = generateId()
    const newPlayer: Player = { id, ...player }

    this.db.run(
      'INSERT INTO players (id, name, avatar) VALUES (?, ?, ?)',
      [id, player.name, player.avatar || null]
    )

    this.saveToStorage()
    return newPlayer
  }

  async updatePlayer(id: string, updates: Partial<Player>): Promise<Player> {
    if (!this.db) throw new Error('Database not initialized')

    const sets: string[] = []
    const values: any[] = []

    if (updates.name !== undefined) {
      sets.push('name = ?')
      values.push(updates.name)
    }
    if (updates.avatar !== undefined) {
      sets.push('avatar = ?')
      values.push(updates.avatar)
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
        avatar: row.avatar as string || undefined
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
  async getGameHistory(): Promise<GameSession[]> {
    if (!this.db) throw new Error('Database not initialized')

    const stmt = this.db.prepare('SELECT * FROM game_sessions ORDER BY created_at DESC')
    const sessions: GameSession[] = []

    while (stmt.step()) {
      const row = stmt.getAsObject()
      sessions.push({
        id: row.id as string,
        gameTemplate: row.game_type as string, // Map game_type to gameTemplate for compatibility
        gameType: row.game_type as string,
        gameMode: row.game_mode as 'cooperative' | 'competitive' | 'campaign' || 'competitive',
        isCooperative: Boolean(row.is_cooperative),
        players: JSON.parse(row.players as string),
        scores: JSON.parse(row.scores as string),
        characters: row.characters ? JSON.parse(row.characters as string) : undefined,
        extensions: row.extensions ? JSON.parse(row.extensions as string) : undefined,
        winner: (row.winner as string) || undefined,
        winCondition: row.win_condition as 'highest' | 'lowest' | 'cooperative',
        date: row.date as string,
        startTime: (row.start_time as string) || '',
        endTime: (row.end_time as string) || undefined,
        duration: (row.duration as number) || undefined,
        completed: Boolean(row.completed)
      })
    }

    stmt.free()
    return sessions
  }

  async addGameSession(session: Omit<GameSession, 'id'>): Promise<GameSession> {
    if (!this.db) throw new Error('Database not initialized')

    const id = generateId()
    const newSession: GameSession = { id, ...session }

    this.db.run(`
      INSERT INTO game_sessions (
        id, game_type, is_cooperative, players, scores, characters, extensions,
        winner, win_condition, date, start_time, end_time, duration, completed
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      id,
      session.gameType,
      session.isCooperative ? 1 : 0,
      JSON.stringify(session.players),
      JSON.stringify(session.scores),
      session.characters ? JSON.stringify(session.characters) : null,
      session.extensions ? JSON.stringify(session.extensions) : null,
      session.winner || null,
      session.winCondition,
      session.date,
      session.startTime || null,
      session.endTime || null,
      session.duration || null,
      session.completed ? 1 : 0
    ])

    this.saveToStorage()
    return newSession
  }

  async updateGameSession(id: string, updates: Partial<GameSession>): Promise<GameSession> {
    if (!this.db) throw new Error('Database not initialized')

    const sets: string[] = []
    const values: any[] = []

    if (updates.gameType !== undefined) {
      sets.push('game_type = ?')
      values.push(updates.gameType)
    }
    if (updates.isCooperative !== undefined) {
      sets.push('is_cooperative = ?')
      values.push(updates.isCooperative ? 1 : 0)
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
    if (updates.winCondition !== undefined) {
      sets.push('win_condition = ?')
      values.push(updates.winCondition)
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
      const row = stmt.getAsObject()
      templates.push({
        name: row.name as string,
        hasCharacters: Boolean(row.has_characters),
        characters: row.characters ? JSON.parse(row.characters as string) : undefined,
        hasExtensions: Boolean(row.has_extensions),
        extensions: row.extensions ? JSON.parse(row.extensions as string) : undefined,
        supportsCooperative: Boolean(row.supports_cooperative),
        supportsCompetitive: Boolean(row.supports_competitive),
        supportsCampaign: Boolean(row.supports_campaign),
        defaultMode: row.default_mode as 'cooperative' | 'competitive' | 'campaign' || 'competitive'
      })
    }

    stmt.free()
    return templates
  }

  async addGameTemplate(template: GameTemplate): Promise<GameTemplate> {
    if (!this.db) throw new Error('Database not initialized')

    this.db.run(`
      INSERT OR REPLACE INTO game_templates (
        name, has_characters, characters, has_extensions, extensions, supports_cooperative, supports_competitive, supports_campaign, default_mode
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      template.name,
      template.hasCharacters ? 1 : 0,
      template.characters ? JSON.stringify(template.characters) : null,
      template.hasExtensions ? 1 : 0,
      template.extensions ? JSON.stringify(template.extensions) : null,
      template.supportsCooperative ? 1 : 0,
      template.supportsCompetitive ? 1 : 0,
      template.supportsCampaign ? 1 : 0,
      template.defaultMode || 'competitive'
    ])

    this.saveToStorage()
    return template
  }

  async updateGameTemplate(name: string, updates: Partial<GameTemplate>): Promise<GameTemplate> {
    if (!this.db) throw new Error('Database not initialized')

    const sets: string[] = []
    const values: any[] = []

    if (updates.hasCharacters !== undefined) {
      sets.push('has_characters = ?')
      values.push(updates.hasCharacters ? 1 : 0)
    }
    if (updates.characters !== undefined) {
      sets.push('characters = ?')
      values.push(updates.characters ? JSON.stringify(updates.characters) : null)
    }
    if (updates.hasExtensions !== undefined) {
      sets.push('has_extensions = ?')
      values.push(updates.hasExtensions ? 1 : 0)
    }
    if (updates.extensions !== undefined) {
      sets.push('extensions = ?')
      values.push(updates.extensions ? JSON.stringify(updates.extensions) : null)
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

    if (sets.length === 0) {
      throw new Error('No updates provided')
    }

    values.push(name)
    this.db.run(`UPDATE game_templates SET ${sets.join(', ')} WHERE name = ?`, values)

    this.saveToStorage()

    const templates = await this.getGameTemplates()
    const updated = templates.find(t => t.name === name)
    if (!updated) throw new Error('Game template not found')
    return updated
  }

  async deleteGameTemplate(name: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized')

    this.db.run('DELETE FROM game_templates WHERE name = ?', [name])
    this.saveToStorage()
  }

  // Current Game operations
  async getCurrentGame(): Promise<GameSession | null> {
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

  async setCurrentGame(game: GameSession | null): Promise<void> {
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
