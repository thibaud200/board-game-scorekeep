import { Player, GameSession, GameTemplate } from '@/App'

export interface Database {
  addGameExtension?(extension: {
    name: string;
    base_game_name: string;
    min_players?: number;
    max_players?: number;
    image?: string;
  }): Promise<any>;
  // Player operations
  getPlayers(): Promise<Player[]>
  addPlayer(player: Omit<Player, 'id'>): Promise<Player>
  updatePlayer(id: string, updates: Partial<Player>): Promise<Player>
  deletePlayer(id: string): Promise<void>

  // Game History operations
  getGameHistory(): Promise<GameSession[]>
  addGameSession(session: Omit<GameSession, 'id'>): Promise<GameSession>
  updateGameSession(id: string, updates: Partial<GameSession>): Promise<GameSession>
  deleteGameSession(id: string): Promise<void>

  // Game Template operations
  getGameTemplates(): Promise<GameTemplate[]>
  addGameTemplate(template: GameTemplate): Promise<GameTemplate>
  updateGameTemplate(name: string, updates: Partial<GameTemplate>): Promise<GameTemplate>
  deleteGameTemplate(name: string): Promise<void>

  // Current Game operations
  getCurrentGame(): Promise<GameSession | null>
  setCurrentGame(game: GameSession | null): Promise<void>

  // Database management
  init(): Promise<void>
  export(): Promise<Uint8Array>
  import(data: Uint8Array): Promise<void>
}

// Generate unique IDs
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

// Default game templates
export const DEFAULT_GAME_TEMPLATES: GameTemplate[] = [
  {
    name: 'Cthulhu',
    hasCharacters: true,
  characters: ['Investigator', 'Detective', 'Journalist', 'Professor', 'Doctor', 'Mystic'],
    supportsCooperative: true,
    supportsCompetitive: false,
    supportsCampaign: false,
    defaultMode: 'cooperative'
  },
  {
    name: 'Demeure de l\'Épouvante',
    hasCharacters: true,
  characters: ['Explorer', 'Scholar', 'Occultist', 'Psychic', 'Dilettante', 'Athlete'],
    supportsCooperative: true,
    supportsCompetitive: false,
    supportsCampaign: false,
    defaultMode: 'cooperative'
  }
]
