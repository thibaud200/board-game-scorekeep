const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '../board-game-tracker.db');
const db = new Database(dbPath);

// 1. Enrichir la table game_extensions
// Ajout des colonnes : description, min_players, max_players, rules

db.exec(`
  PRAGMA foreign_keys=off;
  BEGIN TRANSACTION;

  CREATE TABLE IF NOT EXISTS game_extensions_new (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    base_game_name TEXT NOT NULL,
    description TEXT,
    min_players INTEGER,
    max_players INTEGER,
    rules TEXT
  );

  INSERT INTO game_extensions_new (id, name, base_game_name)
    SELECT id, name, base_game_name FROM game_extensions;

  DROP TABLE game_extensions;
  ALTER TABLE game_extensions_new RENAME TO game_extensions;

  COMMIT;
  PRAGMA foreign_keys=on;
`);

// 2. Ajout d'index sur les colonnes de recherche fréquente, uniquement si la table existe
function tableExists(tableName) {
  const res = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name=?").get(tableName);
  return !!res;
}

const indexStatements = [
  { table: 'game_extensions', sql: "CREATE INDEX IF NOT EXISTS idx_game_extensions_name ON game_extensions(name)" },
  { table: 'game_extensions', sql: "CREATE INDEX IF NOT EXISTS idx_game_extensions_base_game_name ON game_extensions(base_game_name)" },
  { table: 'game_templates', sql: "CREATE INDEX IF NOT EXISTS idx_game_templates_name ON game_templates(name)" },
  { table: 'game_sessions', sql: "CREATE INDEX IF NOT EXISTS idx_game_sessions_game_type ON game_sessions(game_type)" }
];
indexStatements.forEach(({ table, sql }) => {
  if (tableExists(table)) {
    db.exec(sql);
  } else {
    console.warn(`Table absente, index ignoré: ${table}`);
  }
});

console.log('Migration terminée : enrichissement de game_extensions et ajout des index.');
