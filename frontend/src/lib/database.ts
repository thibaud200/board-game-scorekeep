import { GameTemplate } from '@/types'
import { PlayerDB, GameSessionDB } from '../types';

export interface Database {
  addGameExtension?(extension: {
    name: string;
    base_game_name: string;
    min_players?: number;
    max_players?: number;
    image?: string;
  }): Promise<void>;
  // Player operations
  getPlayers(): Promise<PlayerDB[]>
  addPlayer(player: Omit<PlayerDB, 'id'>): Promise<PlayerDB>
  updatePlayer(id: string, updates: Partial<PlayerDB>): Promise<PlayerDB>
  deletePlayer(id: string): Promise<void>

  // Game History operations
  getGameHistory(): Promise<GameSessionDB[]>
  addGameSession(session: Omit<GameSessionDB, 'id'>): Promise<GameSessionDB>
  updateGameSession(id: string, updates: Partial<GameSessionDB>): Promise<GameSessionDB>
  deleteGameSession(id: string): Promise<void>

  // Game Template operations
  getGameTemplates(): Promise<GameTemplate[]>
  addGameTemplate(template: GameTemplate): Promise<GameTemplate>
  updateGameTemplate(id: string, updates: Partial<GameTemplate>): Promise<GameTemplate>
  deleteGameTemplate(id: string | number): Promise<void>

  // Current Game operations
  getCurrentGame(): Promise<GameSessionDB | null>
  setCurrentGame(game: GameSessionDB | null): Promise<void>

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
    characters: [
      { id: 'investigator', name: 'Investigator', classType: 'Detective' },
      { id: 'detective', name: 'Detective', classType: 'Detective' },
      { id: 'journalist', name: 'Journalist', classType: 'Support' },
      { id: 'professor', name: 'Professor', classType: 'Scholar' },
      { id: 'doctor', name: 'Doctor', classType: 'Medic' },
      { id: 'mystic', name: 'Mystic', classType: 'Occultist' }
    ],
    supportsCooperative: true,
    supportsCompetitive: false,
    supportsCampaign: false,
    defaultMode: 'cooperative'
  },
  {
    name: "Demeure de l'Épouvante",
    hasCharacters: true,
    characters: [
      { id: 'explorer', name: 'Explorer', classType: 'Scout' },
      { id: 'scholar', name: 'Scholar', classType: 'Scholar' },
      { id: 'occultist', name: 'Occultist', classType: 'Occultist' },
      { id: 'psychic', name: 'Psychic', classType: 'Support' },
      { id: 'dilettante', name: 'Dilettante', classType: 'Wildcard' },
      { id: 'athlete', name: 'Athlete', classType: 'Tank' }
    ],
    supportsCooperative: true,
    supportsCompetitive: false,
    supportsCampaign: false,
    defaultMode: 'cooperative'
  }
]
