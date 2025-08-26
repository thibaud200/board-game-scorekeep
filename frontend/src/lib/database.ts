import { GameTemplate } from '@/types'

export interface Database {
  addGameExtension?(extension: {
    name: string;
    base_game_name: string;
    min_players?: number;
    max_players?: number;
    image?: string;
  }): Promise<any>;
  // Player operations
  getPlayers(): Promise<any[]>
  addPlayer(player: Omit<any, 'id'>): Promise<any>
  updatePlayer(id: string, updates: Partial<any>): Promise<any>
  deletePlayer(id: string): Promise<void>

  // Game History operations
  getGameHistory(): Promise<any[]>
  addGameSession(session: Omit<any, 'id'>): Promise<any>
  updateGameSession(id: string, updates: Partial<any>): Promise<any>
  deleteGameSession(id: string): Promise<void>

  // Game Template operations
  getGameTemplates(): Promise<GameTemplate[]>
  addGameTemplate(template: GameTemplate): Promise<GameTemplate>
  updateGameTemplate(id: string, updates: Partial<GameTemplate>): Promise<GameTemplate>
  deleteGameTemplate(id: string | number): Promise<void>

  // Current Game operations
  getCurrentGame(): Promise<any | null>
  setCurrentGame(game: any | null): Promise<void>

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
