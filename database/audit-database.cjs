const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

// Chemin vers la BDD
const dbPath = path.join(__dirname, '../board-game-tracker.db');
const db = new Database(dbPath);

// 1. Extraction du schéma SQL
function getTableSchemas() {
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").all();
  return tables.map(t => {
    const schema = db.prepare(`SELECT sql FROM sqlite_master WHERE type='table' AND name=?`).get(t.name);
    return { name: t.name, schema: schema.sql };
  });
}

// 2. Extraction des index et clés étrangères
function getIndexesAndFKs(table) {
  const indexes = db.prepare(`PRAGMA index_list('${table}')`).all();
  const fks = db.prepare(`PRAGMA foreign_key_list('${table}')`).all();
  return { indexes, fks };
}

// 3. Analyse volumétrie
function getTableCounts() {
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").all();
  return tables.map(t => {
    const count = db.prepare(`SELECT COUNT(*) as count FROM ${t.name}`).get();
    return { name: t.name, count: count.count };
  });
}

// 4. Extraction des types TypeScript (depuis src/App.tsx)
function extractTypescriptTypes() {
  const appPath = path.join(__dirname, '../../src/App.tsx');
  if (!fs.existsSync(appPath)) return {};
  const content = fs.readFileSync(appPath, 'utf8');
  const types = {};
  const typeRegex = /export interface ([A-Za-z0-9_]+) \{([^}]+)\}/g;
  let match;
  while ((match = typeRegex.exec(content)) !== null) {
    const fields = match[2].split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('//'));
    types[match[1]] = fields.map(f => f.split(':')[0].replace('?', '').trim());
  }
  return types;
}

// 5. Vérification de la correspondance SQL <-> TypeScript
function checkCorrespondence(tableSchemas, tsTypes) {
  const issues = [];
  tableSchemas.forEach(({ name, schema }) => {
    const colRegex = /([a-zA-Z0-9_]+) [A-Z]+/g;
    const cols = [];
    let m;
    while ((m = colRegex.exec(schema)) !== null) cols.push(m[1]);
    // Correspondance avec le type
    let tsType = null;
    if (name === 'game_sessions') tsType = tsTypes.GameSession;
    if (name === 'game_templates') tsType = tsTypes.GameTemplate;
    if (name === 'players') tsType = tsTypes.Player;
    if (tsType) {
      const missingInTS = cols.filter(c => !tsType.includes(c));
      const missingInSQL = tsType.filter(f => !cols.includes(f));
      if (missingInTS.length) issues.push(`[${name}] Colonnes SQL non présentes dans TypeScript: ${missingInTS.join(', ')}`);
      if (missingInSQL.length) issues.push(`[${name}] Champs TypeScript non présents dans SQL: ${missingInSQL.join(', ')}`);
    }
  });
  return issues;
}

// 6. Rapport d'audit
function auditReport() {
  const tableSchemas = getTableSchemas();
  const tsTypes = extractTypescriptTypes();
  const indexFkReport = tableSchemas.map(({ name }) => {
    const { indexes, fks } = getIndexesAndFKs(name);
    return { table: name, indexes, fks };
  });
  const volumetry = getTableCounts();
  const correspondenceIssues = checkCorrespondence(tableSchemas, tsTypes);

  // Relations
  const relationIssues = [];
  indexFkReport.forEach(({ table, fks }) => {
    fks.forEach(fk => {
      // Vérifie si la table référencée existe
      if (!tableSchemas.find(t => t.name === fk.table)) {
        relationIssues.push(`[${table}] FK vers table inexistante: ${fk.table}`);
      }
    });
  });

  // Documentation check (présence des fichiers .md)
  const docFiles = [
    path.join(__dirname, '../docs/database-structure.md'),
    path.join(__dirname, '../../README.md'),
    path.join(__dirname, '../../ROADMAP.md')
  ];
  const docStatus = docFiles.map(f => ({ file: f, exists: fs.existsSync(f) }));

  // Synthèse
  return {
    tables: tableSchemas,
    indexesAndFKs: indexFkReport,
    volumetry,
    correspondenceIssues,
    relationIssues,
    docStatus
  };
}

// 7. Affichage du rapport
const report = auditReport();
console.log('--- AUDIT BASE DE DONNÉES ---\n');
console.log('Tables et schémas:\n', report.tables);
console.log('\nIndex et clés étrangères:\n', report.indexesAndFKs);
console.log('\nVolumétrie:\n', report.volumetry);
console.log('\nIncohérences SQL <-> TypeScript:\n', report.correspondenceIssues);
console.log('\nProblèmes de relations:\n', report.relationIssues);
console.log('\nDocumentation présente:\n', report.docStatus);

console.log('\n--- FIN AUDIT ---');
