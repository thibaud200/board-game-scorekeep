-- Ajout d'index pour optimiser les recherches fréquentes
CREATE INDEX IF NOT EXISTS idx_players_name ON players(name);
CREATE INDEX IF NOT EXISTS idx_players_id ON players(id);
CREATE INDEX IF NOT EXISTS idx_game_templates_name ON game_templates(name);
CREATE INDEX IF NOT EXISTS idx_game_sessions_created_at ON game_sessions(created_at);
