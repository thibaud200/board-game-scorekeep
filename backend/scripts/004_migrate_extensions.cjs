const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'board-game-tracker.db');
const db = new Database(dbPath);

// 1. Create new game_extensions table if not exists
db.exec(`
  CREATE TABLE IF NOT EXISTS game_extensions (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    base_game_name TEXT NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (base_game_name) REFERENCES game_templates(name)
  );
`);

// 2. Migrate extensions from game_templates to game_extensions
// Check if game_templates table exists before migrating extensions
const tableExists = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='game_templates'").get();
if (tableExists) {
  const templates = db.prepare('SELECT name, extensions FROM game_templates WHERE extensions IS NOT NULL').all();
  const insertExt = db.prepare('INSERT OR IGNORE INTO game_extensions (id, name, base_game_name) VALUES (?, ?, ?)');
  for (const template of templates) {
    let extensions;
    try {
      extensions = JSON.parse(template.extensions);
    } catch {
      extensions = [];
    }
    if (Array.isArray(extensions)) {
      for (const extName of extensions) {
        if (typeof extName === 'string' && extName.trim()) {
          const id = Date.now().toString(36) + Math.random().toString(36).substr(2);
          insertExt.run(id, extName.trim(), template.name);
        }
      }
    }
  }
} else {
  console.warn('Table game_templates does not exist, skipping extension migration.');
}

// 3. Remove legacy columns from game_templates and game_sessions
// Remove legacy columns only if tables exist
const templatesTableExists = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='game_templates'").get();
const sessionsTableExists = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='game_sessions'").get();

db.exec('PRAGMA foreign_keys=off;');
db.exec('BEGIN TRANSACTION;');

if (templatesTableExists) {
  db.exec(`CREATE TABLE IF NOT EXISTS game_templates_new AS
    SELECT name, has_characters, characters, supports_cooperative, supports_competitive, supports_campaign, default_mode, is_cooperative_by_default
    FROM game_templates;`);
  db.exec('DROP TABLE game_templates;');
  db.exec('ALTER TABLE game_templates_new RENAME TO game_templates;');
} else {
  console.warn('Table game_templates does not exist, skipping legacy column removal.');
}

if (sessionsTableExists) {
  db.exec(`CREATE TABLE IF NOT EXISTS game_sessions_new AS
    SELECT id, game_type, is_cooperative, players, scores, characters, winner, win_condition, date, start_time, end_time, duration, completed, coop_result, dead_characters, new_character_names, character_history, created_at
    FROM game_sessions;`);
  db.exec('DROP TABLE game_sessions;');
  db.exec('ALTER TABLE game_sessions_new RENAME TO game_sessions;');
} else {
  console.warn('Table game_sessions does not exist, skipping legacy column removal.');
}

db.exec('COMMIT;');
db.exec('PRAGMA foreign_keys=on;');

console.log('Migration complete: extensions moved to game_extensions table and legacy columns removed.');