# 🗄️ Structure de la Base de Données - Board Game Score Tracker v1.0.1

## 📊 Vue d'ensemble

Cette documentation décrit la structure actuelle de la base de données SQLite utilisée par l'application Board Game Score Tracker.

**Base de données** : `database/board-game-tracker.db`  
**Type** : SQLite 3.x avec better-sqlite3  
**Version du schéma** : v1.0.1
**Migrations** : Automatiques via scripts de migration  
**Tests** : Infrastructure complète avec mocks database (52/52 tests ✅)  

## 📋 Tables Principales

### 1. 👥 `players` - Gestion des Joueurs

```sql
CREATE TABLE players (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**Description** : Stockage des joueurs enregistrés dans l'application.

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| `id` | TEXT | PRIMARY KEY | Identifiant unique du joueur |
| `name` | TEXT | NOT NULL, UNIQUE | Nom du joueur (unique) |
| `created_at` | DATETIME | DEFAULT CURRENT_TIMESTAMP | Date de création |

### 2. 🎮 `game_sessions` - Sessions de Jeu Complétées

```sql
CREATE TABLE game_sessions (
    id TEXT PRIMARY KEY,
    game_type TEXT NOT NULL,
    is_cooperative INTEGER DEFAULT 0,
    game_mode TEXT DEFAULT 'competitive',
    players TEXT NOT NULL,
    scores TEXT NOT NULL,
    characters TEXT,
    extensions TEXT,
    winner TEXT,
    win_condition TEXT,
    date TEXT,
    start_time TEXT NOT NULL,
    end_time TEXT,
    duration TEXT,
    completed INTEGER DEFAULT 0,
    coop_result TEXT,
    dead_characters TEXT,
    new_character_names TEXT,
    character_history TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**Description** : Historique complet des parties terminées avec tous les détails.

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | TEXT | Identifiant unique de la session |
| `game_type` | TEXT | Nom du jeu (mappé vers `gameTemplate` côté frontend) |
| `is_cooperative` | INTEGER | 1 si coopératif, 0 sinon (legacy) |
| `game_mode` | TEXT | Mode de jeu : 'cooperative', 'competitive', 'campaign' |
| `players` | TEXT | JSON array des IDs de joueurs |
| `scores` | TEXT | JSON object des scores par joueur |
| `characters` | TEXT | JSON object des personnages assignés |
| `extensions` | TEXT | JSON array des extensions utilisées (affichées dans l'UI session et stats joueur) |
| `winner` | TEXT | ID du joueur gagnant (si compétitif) |
| `win_condition` | TEXT | Condition de victoire utilisée |
| `date` | TEXT | Date de la partie (format ISO) |
| `start_time` | TEXT | Heure de début (ISO string) |
| `end_time` | TEXT | Heure de fin (ISO string) |
| `duration` | TEXT | Durée en minutes |
| `completed` | INTEGER | 1 si terminée, 0 sinon |
| `coop_result` | TEXT | 'won'/'lost' pour parties coopératives |
| `dead_characters` | TEXT | JSON object des personnages morts |
| `new_character_names` | TEXT | JSON object des nouveaux noms |
| `character_history` | TEXT | JSON array de l'historique des événements |


### 3. 🎲 `game_templates` - Templates de Jeux

```sql
CREATE TABLE game_templates (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        has_characters BOOLEAN NOT NULL,
        characters TEXT,
        is_cooperative_by_default BOOLEAN NOT NULL,
        base_game_name TEXT,
        min_players INTEGER,
        max_players INTEGER,
        description TEXT,
        image TEXT,
        id_bgg TEXT,
        supports_cooperative BOOLEAN,
        supports_competitive BOOLEAN,
        supports_campaign BOOLEAN,
        default_mode TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**Description** : Configuration des types de jeux avec leurs caractéristiques.

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | INTEGER | Clé primaire auto-incrémentée |
| `name` | TEXT | Nom du jeu (unique, non null) |
| `has_characters` | BOOLEAN | 1 si le jeu a des personnages |
| `characters` | TEXT | Liste des personnages (JSON, voir exemple ci-dessous) |
| `is_cooperative_by_default` | BOOLEAN | 1 si le jeu est coopératif par défaut |
| `base_game_name` | TEXT | Nom du jeu de base (si extension) |
| `min_players` | INTEGER | Nombre minimum de joueurs |
| `max_players` | INTEGER | Nombre maximum de joueurs |
| `description` | TEXT | Description du jeu |
| `image` | TEXT | URL ou chemin de l'image |
| `id_bgg` | TEXT | Identifiant BoardGameGeek (optionnel) |
| `supports_cooperative` | BOOLEAN | 1 si supporte le mode coopératif |
| `supports_competitive` | BOOLEAN | 1 si supporte le mode compétitif |
| `supports_campaign` | BOOLEAN | 1 si supporte le mode campagne |
| `default_mode` | TEXT | Mode par défaut du jeu |
| `created_at` | DATETIME | Date de création du template |

**Exemple JSON pour `characters`** :
```json
[
    {
        "id": "brute",
        "name": "Brute",
        "classType": "Tank",
        "description": "Personnage robuste, encaisse les dégâts.",
        "abilities": ["Shield", "Taunt"],
        "imageUrl": "/images/brute.png",
        "source": "manual",
        "externalId": null,
        "createdAt": "2025-08-31T12:00:00Z"
    }
]
```

---

#### 🔗 Synchronisation des types

La structure du champ `characters` doit être identique entre la BDD (JSON), le backend (TypeScript/Express) et le frontend (TypeScript/React). Utiliser l'interface `GameCharacter` côté TypeScript pour garantir la cohérence des données et faciliter la validation, la documentation et les migrations.

### 4. ⚡ `current_game` - Partie en Cours

```sql
CREATE TABLE current_game (
    id INTEGER PRIMARY KEY,
    game_data TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**Description** : Sauvegarde de l'état de la partie actuellement en cours.

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | INTEGER | Toujours 1 (une seule partie en cours) |
| `game_data` | TEXT | JSON complet de l'état de la partie |
| `created_at` | DATETIME | Date de création de la partie |
| `updated_at` | DATETIME | Dernière mise à jour |

## 🔄 Migrations Appliquées

### Migration 1 : Support Multi-Modes
**Fichier** : `database/migrate-game-modes.cjs`
- Ajout des colonnes `supports_cooperative`, `supports_competitive`, `supports_campaign`
- Ajout de la colonne `default_mode`
- Migration des données existantes

## 📈 Relations et Index

### Relations Principales
- `game_sessions.players` → références vers `players.id` (JSON array)
- `game_sessions.game_type` → `game_templates.name`
- `game_sessions.winner` → `players.id`

### Index Recommandés (À implémenter)
```sql
-- Performance pour les requêtes fréquentes
CREATE INDEX idx_game_sessions_game_type ON game_sessions(game_type);
CREATE INDEX idx_game_sessions_date ON game_sessions(date);
CREATE INDEX idx_game_sessions_completed ON game_sessions(completed);
```

## 🚨 Limitations Actuelles et Évolutions Nécessaires

### ⚠️ Problèmes Identifiés

1. **🎭 Gestion des Personnages Limitée**
   - **Problème** : Les personnages sont stockés en CSV dans `game_templates.characters`
   - **Impact** : Impossible d'intégrer des APIs externes (BoardGameGeek, etc.)
   - **Solution requise** : Table `game_characters` séparée

2. **📦 Extensions Non Structurées**
   - **Problème** : Extensions stockées en CSV sans métadonnées
   - **Impact** : Pas de validation des règles (ex: nombre de joueurs max)
   - **Solution requise** : Table `game_extensions` avec propriétés

### 🔮 Structure Cible (Future)

#### Table `game_characters` (À créer)
```sql
CREATE TABLE game_characters (
    id TEXT PRIMARY KEY,
    game_template TEXT NOT NULL,
    name TEXT NOT NULL,
    class_type TEXT,        -- Classe/Métier du personnage
    description TEXT,
    abilities TEXT,         -- JSON array des capacités
    image_url TEXT,
    source TEXT,           -- 'manual', 'api_boardgamegeek', etc.
    external_id TEXT,      -- ID externe si importé d'une API
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (game_template) REFERENCES game_templates(name)
);
```

#### Table `game_extensions` (À créer)
```sql
CREATE TABLE game_extensions (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    base_game_name TEXT NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (base_game_name) REFERENCES game_templates(name)
);
```

## 🛠️ Scripts de Maintenance

### Sauvegarde
```bash
# Sauvegarde de la base
cp database/board-game-tracker.db database/backup-$(date +%Y%m%d).db
```

### Vérification d'Intégrité
```sql
-- Vérifier l'intégrité de la base
PRAGMA integrity_check;

-- Analyser les statistiques
ANALYZE;
```

### Nettoyage
```sql
-- Nettoyer les parties non terminées anciennes
DELETE FROM current_game WHERE created_at < datetime('now', '-7 days');

-- Vérifier les références orphelines
SELECT * FROM game_sessions 
WHERE game_type NOT IN (SELECT name FROM game_templates);
```

## 📊 Statistiques de Données

### Requêtes Utiles

```sql
-- Nombre total de parties par jeu
SELECT game_type, COUNT(*) as total_games 
    created_at DATETIME  -- Date de création du template (remplie à l'insertion, pas de DEFAULT via ALTER TABLE)
WHERE completed = 1 
GROUP BY game_type 
ORDER BY total_games DESC;

-- Joueurs les plus actifs
SELECT p.name, COUNT(gs.id) as games_played
FROM players p
JOIN game_sessions gs ON gs.players LIKE '%' || p.id || '%'
WHERE gs.completed = 1
GROUP BY p.id, p.name
ORDER BY games_played DESC;

-- Durée moyenne par type de jeu
SELECT game_type, 
       ROUND(AVG(CAST(duration AS INTEGER))) as avg_duration_minutes
FROM game_sessions 
WHERE completed = 1 AND duration IS NOT NULL
GROUP BY game_type;
```

---

**📅 Dernière mise à jour** : 22 août 2025  
**📝 Version** : 1.0.1  
**🧪 Tests** : Infrastructure complète (52/52 tests ✅)  
**📊 État** : Base de données opérationnelle avec intégration BGG et validation complète  
**👨‍💻 Maintenance** : Équipe de développement Board Game Score Tracker
