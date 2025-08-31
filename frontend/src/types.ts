export interface Player {
  id: string;
  name: string;
  avatar?: string;
}

export interface Character {
  name?: string;
  type?: string;
}

export interface GameSession {
  id: string;
  gameTemplate: string;
  gameMode: 'cooperative' | 'competitive' | 'campaign';
  isCooperative: boolean;
  allowResurrection?: boolean;
  players: string[];
  scores: Record<string, number>;
  characters?: Record<string, { name?: string; type?: string }>;
  extensions?: string[];
  startTime?: string;
  winner?: string;
  winCondition?: 'highest' | 'lowest' | 'cooperative';
  date?: string;
  endTime?: string;
  duration?: number;
  completed?: boolean;
  cooperativeResult?: string;
  deadCharacters?: Record<string, boolean>;
  newCharacterNames?: Record<string, string>;
  characterHistory?: GameCharacter[];
  image?: string;
}
// Types partagés pour Board Game Score Tracker
/**
 * Représente un événement historique lié à un personnage dans une session de jeu
 */
export interface CharacterEvent {
  characterId: string;
  eventType: 'created' | 'died' | 'revived' | 'changed' | string;
  timestamp: string;
  details?: string;
}
// Utiliser ce fichier pour toutes les interfaces de données communes
/**
 * Types synchronisés avec la BDD et le backend (importés depuis backend/src/types.ts)
 * Utiliser ces types pour garantir la cohérence frontend/backend/BDD.
 */
export interface GameSessionDB {
  id: string;
  game_type: string;
  is_cooperative: boolean;
  game_mode: 'cooperative' | 'competitive' | 'campaign' | string;
  players: string[];
  scores: Record<string, number>;
  characters?: Record<string, string>;
  extensions?: string[];
  winner?: string;
  win_condition?: string;
  date?: string;
  start_time: string;
  end_time?: string;
  duration?: string;
  completed: boolean;
  coop_result?: 'won' | 'lost' | string;
  dead_characters?: Record<string, string>;
  new_character_names?: Record<string, string>;
  character_history?: CharacterEvent[];
  created_at: string;
}

export interface PlayerDB {
  id: string;
  name: string;
  created_at: string;
}

export interface GameTemplateDB {
  id: string;
  name: string;
  has_characters: boolean;
  characters?: GameCharacter[];
  is_cooperative_by_default: boolean;
  base_game_name?: string;
  min_players?: number;
  max_players?: number;
  description?: string;
  image?: string;
  id_bgg?: string;
  supports_cooperative?: boolean;
  supports_competitive?: boolean;
  supports_campaign?: boolean;
  default_mode?: string;
  created_at: string;
}

export interface GameExtensionDB {
  id: string;
  name: string;
  base_game_name: string;
  description?: string;
  image?: string;
  min_players?: number;
  max_players?: number;
  created_at: string;
}


export interface GameCharacter {
  id: string;
  name: string;
  classType?: string;
  description?: string;
  abilities?: string[];
  imageUrl?: string;
  source?: 'manual' | 'api_boardgamegeek' | string;
  externalId?: string;
  createdAt?: string;
}

export interface GameTemplate {
  id?: string | number;
  id_bgg?: string;
  name: string;
  hasCharacters: boolean;
  characters?: GameCharacter[];
  supportsCooperative: boolean;
  supportsCompetitive: boolean;
  supportsCampaign: boolean;
  defaultMode?: string;
  isCooperativeByDefault?: boolean;
  min_players?: number;
  max_players?: number;
  description?: string;
  image?: string;
  base_game_name?: string;
}
