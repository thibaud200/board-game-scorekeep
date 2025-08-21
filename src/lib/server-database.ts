import { Database, generateId, DEFAULT_GAME_TEMPLATES } from './database'
import { Player, GameSession, GameTemplate } from '@/App'

const API_BASE_URL = 'http://localhost:3001/api'

export class ServerDatabase implements Database {
  async init(): Promise<void> {
    try {
      // Vérifier que le serveur est accessible
      const response = await fetch(`${API_BASE_URL}/players`)
      if (!response.ok) {
        throw new Error('Serveur API non accessible')
      }
      
      // Vérifier si nous avons des templates par défaut, sinon les ajouter
      const templates = await this.getGameTemplates()
      if (templates.length === 0) {
        console.log('Ajout des templates par défaut...')
        for (const template of DEFAULT_GAME_TEMPLATES) {
          await this.addGameTemplate(template)
        }
      }
      
      console.log('Base de données serveur initialisée avec succès')
    } catch (error) {
      console.error('Échec d\'initialisation de la base de données serveur:', error)
      throw error
    }
  }

  // Player operations
  async getPlayers(): Promise<Player[]> {
    const response = await fetch(`${API_BASE_URL}/players`)
    if (!response.ok) throw new Error('Échec de récupération des joueurs')
    return response.json()
  }

  async addPlayer(player: Omit<Player, 'id'>): Promise<Player> {
    const id = generateId()
    const newPlayer: Player = { id, ...player }
    
    const response = await fetch(`${API_BASE_URL}/players`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newPlayer)
    })
    
    if (!response.ok) throw new Error('Échec d\'ajout du joueur')
    return response.json()
  }

  async updatePlayer(id: string, updates: Partial<Player>): Promise<Player> {
    const response = await fetch(`${API_BASE_URL}/players/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    })
    
    if (!response.ok) throw new Error('Échec de mise à jour du joueur')
    return response.json()
  }

  async deletePlayer(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/players/${id}`, {
      method: 'DELETE'
    })
    
    if (!response.ok) throw new Error('Échec de suppression du joueur')
  }

  // Game History operations
  async getGameHistory(): Promise<GameSession[]> {
    const response = await fetch(`${API_BASE_URL}/game-sessions`)
    if (!response.ok) throw new Error('Échec de récupération de l\'historique')
    return response.json()
  }

  async addGameSession(session: Omit<GameSession, 'id'>): Promise<GameSession> {
    const id = generateId()
    const newSession: GameSession = { id, ...session }
    
    const response = await fetch(`${API_BASE_URL}/game-sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newSession)
    })
    
    if (!response.ok) throw new Error('Échec d\'ajout de la session')
    return response.json()
  }

  async updateGameSession(id: string, updates: Partial<GameSession>): Promise<GameSession> {
    // Pour la mise à jour, nous devons d'abord récupérer la session existante
    const sessions = await this.getGameHistory()
    const existing = sessions.find(s => s.id === id)
    if (!existing) throw new Error('Session de jeu non trouvée')
    
    const updated = { ...existing, ...updates }
    
    const response = await fetch(`${API_BASE_URL}/game-sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated)
    })
    
    if (!response.ok) throw new Error('Échec de mise à jour de la session')
    return response.json()
  }

  async deleteGameSession(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/game-sessions/${id}`, {
      method: 'DELETE'
    })
    
    if (!response.ok) throw new Error('Échec de suppression de la session')
  }

  // Game Template operations
  async getGameTemplates(): Promise<GameTemplate[]> {
    const response = await fetch(`${API_BASE_URL}/game-templates`)
    if (!response.ok) throw new Error('Échec de récupération des templates')
    return response.json()
  }

  async addGameTemplate(template: GameTemplate): Promise<GameTemplate> {
    const response = await fetch(`${API_BASE_URL}/game-templates`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(template)
    })
    
    if (!response.ok) throw new Error('Échec d\'ajout du template')
    return response.json()
  }

  async updateGameTemplate(name: string, updates: Partial<GameTemplate>): Promise<GameTemplate> {
    // Pour la mise à jour, nous devons d'abord récupérer le template existant
    const templates = await this.getGameTemplates()
    const existing = templates.find(t => t.name === name)
    if (!existing) throw new Error('Template de jeu non trouvé')
    
    const updated = { ...existing, ...updates }
    
    const response = await fetch(`${API_BASE_URL}/game-templates`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated)
    })
    
    if (!response.ok) throw new Error('Échec de mise à jour du template')
    return response.json()
  }

  async deleteGameTemplate(name: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/game-templates/${name}`, {
      method: 'DELETE'
    })
    
    if (!response.ok) throw new Error('Échec de suppression du template')
  }

  // Current Game operations
  async getCurrentGame(): Promise<GameSession | null> {
    const response = await fetch(`${API_BASE_URL}/current-game`)
    if (!response.ok) throw new Error('Échec de récupération du jeu actuel')
    return response.json()
  }

  async setCurrentGame(game: GameSession | null): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/current-game`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ game })
    })
    
    if (!response.ok) throw new Error('Échec de sauvegarde du jeu actuel')
  }

  // Database management
  async export(): Promise<Uint8Array> {
    throw new Error('Export non disponible avec la base de données serveur')
  }

  async import(data: Uint8Array): Promise<void> {
    throw new Error('Import non disponible avec la base de données serveur')
  }
}
