-- Migration: Création de la table game_characters
CREATE TABLE IF NOT EXISTS game_characters (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  character_class TEXT,
  game_name TEXT NOT NULL,
  description TEXT,
  image TEXT,
  FOREIGN KEY (game_name) REFERENCES game_templates(name)
);