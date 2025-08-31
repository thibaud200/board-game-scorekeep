/**
 * Interface strictement synchronisée avec le champ `characters` (JSON array) de la BDD
 */
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
/**
 * Interface strictement synchronisée avec la table SQLite `game_sessions`.
 * Source : database/docs/database-structure.md
 * Utiliser ce type pour toutes les opérations backend et synchroniser avec le frontend.
 */
export interface GameSessionDB {
  id: string;
  game_type: string;
  is_cooperative: boolean;
  game_mode: 'cooperative' | 'competitive' | 'campaign' | string;
  players: string[]; // IDs des joueurs
  scores: Record<string, number>; // Scores par joueur
  characters?: Record<string, string>; // Personnages assignés (optionnel)
  extensions?: string[]; // IDs des extensions utilisées
  winner?: string; // ID du joueur gagnant
  win_condition?: string;
  date?: string;
  start_time: string;
  end_time?: string;
  duration?: string;
  completed: boolean;
  coop_result?: 'won' | 'lost' | string;
  dead_characters?: Record<string, string>; // Personnages morts (optionnel)
  new_character_names?: Record<string, string>; // Nouveaux noms (optionnel)
  /**
   * Historique des événements sur les personnages (morts, résurrections, renommages, etc.)
   * Synchronisé avec le champ JSON array de la BDD.
   */
  character_history?: CharacterEvent[];
  created_at: string;
}
/**
 * Événement d'historique de personnage (type générique, à spécialiser si besoin)
 */
export interface CharacterEvent {
  type: 'death' | 'revive' | 'rename' | string;
  characterId: string;
  timestamp: string;
  details?: Record<string, unknown>;
}

/**
 * Interface strictement synchronisée avec la table SQLite `players`.
 */
export interface PlayerDB {
  id: string;
  name: string;
  created_at: string;
}

/**
 * Interface strictement synchronisée avec la table SQLite `game_templates`.
 */
export interface GameTemplateDB {
  id: string;
  name: string;
  has_characters: boolean;
  /**
   * Liste des personnages du jeu (synchronisé avec le JSON array de la BDD)
   */
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

/**
 * Interface strictement synchronisée avec la table SQLite `game_extensions`.
 */
export interface GameExtensionDB {
  id: string;
  name: string;
  base_game_name: string;
  description?: string;
  created_at: string;
}
