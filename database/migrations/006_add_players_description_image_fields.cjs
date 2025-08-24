// Migration script to add min_players, max_players, description, image fields
// to game_templates, game_sessions, and game_extensions tables

const Database = require('better-sqlite3');
const db = new Database('database/board-game-tracker.db');

// Add columns to game_templates
db.exec(`
  ALTER TABLE game_templates ADD COLUMN min_players INTEGER;
  ALTER TABLE game_templates ADD COLUMN max_players INTEGER;
  ALTER TABLE game_templates ADD COLUMN description TEXT;
  ALTER TABLE game_templates ADD COLUMN image TEXT;
`);

// Add column to game_sessions
db.exec(`
  ALTER TABLE game_sessions ADD COLUMN image TEXT;
`);

// Add column to game_extensions
db.exec(`
  ALTER TABLE game_extensions ADD COLUMN image TEXT;
`);

console.log('Migration completed: Added min_players, max_players, description, image fields.');
