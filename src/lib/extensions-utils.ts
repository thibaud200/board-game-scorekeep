// Utility to fetch extensions for a given base game from the new game_extensions table
import { Database } from './database';

export async function getExtensionsForGame(db: Database, baseGameName: string): Promise<string[]> {
  // Query the new game_extensions table for extensions linked to baseGameName
  if (!db) throw new Error('Database not initialized');
  // This assumes you have a method to run raw SQL or a similar API
  const stmt = (db as any).db.prepare('SELECT name FROM game_extensions WHERE base_game_name = ? ORDER BY name');
  const extensions: string[] = [];
  stmt.bind([baseGameName]);
  while (stmt.step()) {
    const row = stmt.getAsObject();
    extensions.push(row.name as string);
  }
  stmt.free();
  return extensions;
}
