-- Migration: Ajout colonne base_game_name à game_templates
ALTER TABLE game_templates ADD COLUMN base_game_name TEXT;
