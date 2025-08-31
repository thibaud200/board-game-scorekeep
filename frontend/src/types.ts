// Types partagés pour Board Game Score Tracker
// Utiliser ce fichier pour toutes les interfaces de données communes


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
