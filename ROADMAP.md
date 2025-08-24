# 🗺️ Board Game Score Tracker - Roadmap

## 📋 État Actuel du Projet

### ✅ Fonctionnalités Complètes (v1.0)
- [x] Dashboard modulaire et responsive
- [x] Gestion multi-modes (coopératif/compétitif/campagne)
- [x] Système de templates de jeux configurables
- [x] Gestion personnages avec historique
- [x] Statistiques complètes et historique des parties
- [x] Base de données SQLite avec migrations
- [x] Interface sans numérotation des personnages
- [x] Correction du système victoire/défaite
- [x] Architecture TypeScript propre (0 erreur)
- [x] Nettoyage du code et suppression des fichiers redondants
- [x] **Intégration BoardGameGeek** avec auto-import intelligent
- [x] **Recherche BGG** en temps réel avec auto-complétion
- [x] **Analyse intelligente** des modes de jeu basée sur les mécaniques
- [x] **Import automatique** personnages/extensions depuis descriptions BGG
- [x] **Infrastructure de tests complète** avec 52/52 tests ✅

### ✅ Qualité Code & Tests (v1.0.1) - **COMPLET**
- [x] **Tests unitaires techniques** : BGGService, database-hooks, config (17/17 tests ✅)
- [x] **Tests unitaires fonctionnels** : BGGGameSearch (16/16 tests ✅)
- [x] **Tests d'intégration BGG** : Workflow complet end-to-end (7/7 tests ✅)
- [x] **Tests GameTemplateSection** : Création et gestion templates (12/12 tests ✅)
- [x] **Architecture Jest/RTL** : Configuration ESM + TypeScript + mocks
- [x] **Navigation tests** : Dashboard → GameTemplateSection → BGG workflow
- [x] **Internationalisation tests** : Support texte français dans les tests
- [x] **Radix UI compatibility** : Tests compatibles avec les composants Radix
- [x] **Legacy cleanup** : Suppression fichiers tests obsolètes
## 🎯 Prochaines Fonctionnalités Planifiées

### Phase 1: 🗄️ Refonte Structure Base de Données
**Statut**: 🔄 En cours - **PRIORITÉ #1**
**Priorité**: Critique (Prérequis pour toutes les améliorations futures)

#### Problèmes Actuels:
- **Personnages**: Stockés en CSV dans `game_templates.characters`
  - Impossible d'intégrer des APIs externes (BoardGameGeek, etc.)
  - Pas de liaison métier/classe avec le personnage
  - Gestion limitée des capacités et descriptions
- **Extensions**: Stockées en CSV sans métadonnées
  - Pas de validation des règles (ex: nombre de joueurs max)

Sécurité et migrations
 - Toutes les routes POST/PUT utilisent express-validator pour la validation des entrées.
 - Les requêtes SQL sont paramétrées pour éviter l'injection.
 - Les index sont ajoutés sur les colonnes de recherche fréquente.
 - Les scripts de migration sont stockés dans migrations.

-- Table des personnages structurée
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
    FOREIGN KEY (game_template) REFERENCES game_templates(name)
);

-- Table des extensions avec métadonnées
CREATE TABLE game_extensions (
    id TEXT PRIMARY KEY,
    game_template TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    min_players INTEGER,    -- Contraintes de joueurs
    max_players INTEGER,
- 🌐 **Support API**: Intégration BoardGameGeek, IGDB, etc.
- 🎭 **Personnages riches**: Classes, capacités, descriptions, images
- [ ] **Script de migration des données existantes** (CRITIQUE)
- [ ] **Analyse des données actuelles** : Audit du CSV existant
- [ ] **Stratégie de conversion** : CSV → Tables structurées
- [ ] **Backup automatique** : Sauvegarde avant migration
- [ ] **Tests de migration** : Validation des données converties
- [ ] **Rollback plan** : Restauration en cas d'échec

##### Étape 1: Analyse des Données Existantes
FROM game_templates 
WHERE characters IS NOT NULL 
   OR extensions IS NOT NULL;
```

##### Étape 2: Script de Migration
```typescript
interface MigrationScript {
  // Parsing des données CSV existantes
  parseCharactersCSV(csvData: string): ParsedCharacter[]
  parseExtensionsCSV(csvData: string): ParsedExtension[]
  
  // Conversion vers nouvelles structures
  convertToGameCharacters(parsed: ParsedCharacter[], gameTemplate: string): GameCharacter[]
  convertToGameExtensions(parsed: ParsedExtension[], gameTemplate: string): GameExtension[]
  
  // Validation des données converties
  validateMigratedData(characters: GameCharacter[], extensions: GameExtension[]): ValidationResult
  
  // Opérations de migration
  backupCurrentData(): Promise<BackupResult>
  migrateCharacters(): Promise<MigrationResult>
  migrateExtensions(): Promise<MigrationResult>
  cleanupLegacyColumns(): Promise<void>
}
```

##### Étape 3: Nouvelle Structure vs Ancienne
```sql
-- AVANT (Actuel)
CREATE TABLE game_templates (
  name TEXT PRIMARY KEY,
  characters TEXT,  -- CSV: "Héros,Voleur,Mage"
  extensions TEXT   -- CSV: "Extension 1,Extension 2"
  -- autres colonnes...

CREATE TABLE game_characters (
  abilities TEXT,                   -- JSON array, vide initialement
  image_url TEXT,                   -- NULL, à remplir via BGG
  source TEXT DEFAULT 'migrated',   -- Marqué comme données migrées
  external_id TEXT,                 -- NULL initialement
  FOREIGN KEY (game_template) REFERENCES game_templates(name)
);

  description TEXT,                 -- NULL initialement
  min_players INTEGER,              -- NULL, à définir manuellement
  source TEXT DEFAULT 'migrated',   -- Marqué comme données migrées
  external_id TEXT,                 -- NULL initialement
  FOREIGN KEY (game_template) REFERENCES game_templates(name)
);
```

##### Étape 4: Exemples de Conversion
```typescript
// EXEMPLE: Migration d'un jeu existant
// AVANT: game_templates.characters = "Barbare,Archer,Clerc,Mage"
// APRÈS: 4 entrées dans game_characters

const gloomhavenCharacters = [
  {
    id: 'gloomhaven-barbare-001',
    game_template: 'Gloomhaven',
    name: 'Barbare',
    class_type: null,  // À remplir plus tard
    source: 'migrated',
    abilities: '[]'
  },
  {
    id: 'gloomhaven-archer-002', 
    game_template: 'Gloomhaven',
    name: 'Archer',
```

##### Étape 5: Validation et Tests
```typescript
interface MigrationValidation {
  // Vérifier que toutes les données CSV ont été converties
  validateCharacterMigration(): Promise<ValidationResult>
  
  // Comparer les données avant/après
  testNewDataStructure(): Promise<TestResult>
}
```

-- Le backup sera automatiquement créé avant migration
```
- [ ] **Parser CSV** des personnages existants  
- [ ] **Parser CSV** des extensions existantes
- [ ] **Valider intégrité** des données migrées
- [ ] **Tests fonctionnels** avec nouvelles structures
#### ⚠️ Risques et Mitigation
- **Perte de données** → Backup automatique obligatoire
- **Rollback nécessaire** → Script de restauration automatique

**Priorité**: Haute

- [ ] **Cache local** : Stockage des résultats de recherche BGG
- [ ] **Sync périodique** : Mise à jour automatique des données BGG

#### ✅ Déjà Implémenté:
- [x] Service BGGService.ts avec XML parsing
- [x] Composant BGGGameSearch avec auto-complétion

#### Objectifs:
#### Structure de données:
```typescript
interface GameCharacter {
  id: string
  gameTemplate: string
  name: string
  classType: string // Métier/Classe (auto-rempli)
  description?: string
  abilities?: string[]
  source: 'manual' | 'api_boardgamegeek'
  externalId?: string
}

interface GameTemplate {
```
#### Fichiers à modifier:
- [ ] `src/App.tsx` - Nouvelles interfaces
- [ ] `src/components/GameSetup.tsx` - Sélection personnages améliorée
- [ ] `src/components/ActiveGame.tsx` - Affichage nom + classe
- [ ] `src/lib/database.ts` - CRUD pour nouvelle table game_characters
- [ ] `server.js` - Endpoints personnages
**Priorité**: Moyenne (Enhancement)

#### Objectifs:
- Support multilingue (Français, Anglais, Allemand)
- Fichiers JSON pour les chaînes de caractères
- Détection automatique de la langue du navigateur
- Stockage de la préférence utilisateur

#### Langues Prioritaires:
1. 🇫🇷 **Français** (langue principale)
2. 🇺🇸 **Anglais** (international)
3. 🇩🇪 **Allemand** (marché européen des jeux de société)

#### Structure des traductions:
```typescript
// locales/fr.json
{
  "common": {
    "save": "Sauvegarder",
    "cancel": "Annuler",
    "required": "obligatoire",
    "optional": "optionnel"
  },
  "game": {
    "setup": "Configuration de partie",
    "players": "Joueurs",
    "template": "Modèle de jeu"
  }
}
```

#### Fichiers à créer/modifier:
- [ ] `src/locales/` - Dossier des traductions
- [ ] `src/hooks/useTranslation.ts` - Hook personnalisé
- [ ] `src/components/LanguageSelector.tsx` - Sélecteur de langue
- [ ] Mise à jour de tous les composants avec les clés de traduction

### Phase 5: 💾 Backup & Import de Base de Données
**Statut**: 🔄 Planifié - **PRIORITÉ #5**
**Priorité**: Moyenne (Utilitaire)

#### 🎯 Objectifs:
- **Export complet** de la base de données (JSON/SQL)
- **Import/Restauration** depuis fichier de sauvegarde
- **Migration automatique** entre versions de schéma
- **Interface graphique** pour backup/restore

#### 📦 Fonctionnalités de Backup:
```typescript
interface DatabaseBackup {
  version: string
  timestamp: string
  metadata: {
    totalPlayers: number
    totalGames: number
    totalSessions: number
  }
  data: {
    players: Player[]
    gameTemplates: GameTemplate[]
    gameSessions: GameSession[]
    gameCharacters: GameCharacter[]  // Nouvelle table
    gameExtensions: GameExtension[]  // Nouvelle table
  }
}
```

#### 🛠️ Interface Utilisateur:
- **Bouton "Export Database"** → Télécharge backup.json
- **Bouton "Import Database"** → Upload + validation + restauration
- **Preview avant import** → Affichage des données à importer
- **Options avancées** → Export partiel (par jeu, par période)

#### 📂 Localisation:
- **Database Management Dialog** (déjà prévu en popup)
- **Section "Backup & Restore"** dans le dialog
- **Logs d'opération** pour traçabilité

#### 🔧 Implémentation Technique:
- [ ] `src/services/BackupService.ts` - Service export/import
- [ ] `src/components/DatabaseBackup.tsx` - Interface utilisateur
- [ ] `server.js` - Endpoints `/backup` et `/restore`
- [ ] Validation de schéma lors de l'import
- [ ] Migration automatique des anciennes versions

#### ⚠️ Gestion des Conflits:
- **Stratégies de merge** : Écraser, Fusionner, Ignorer
- **Validation des IDs** : Éviter les doublons
- **Rollback automatique** en cas d'erreur d'import

### Phase 6: 🏆 Système de Score Compétitif Avancé
**Statut**: 🔄 Planifié - **PRIORITÉ #6** (À détailler)
**Priorité**: Moyenne

#### Objectifs (À détailler selon vos besoins):
- 📊 Classement temporel (mensuel, annuel, par saison)
- 🏅 Points de victoire pondérés selon la difficulté
- 🎖️ Système de trophées et succès/achievements
- 🔥 Streak (séries de victoires consécutives)
- 📈 Évolution des performances dans le temps
- ⚔️ Rivalités entre joueurs (head-to-head stats)

#### Fonctionnalités Potentielles:
- Algorithme de classement ELO adapté aux jeux de société
- Interface de tableau de bord compétitif
- Calcul automatique des points de saison
- Badges de réussite (Maître du Donjon, Stratège, Vainqueur Ultime, etc.)
- Graphiques de progression des joueurs
- Comparaisons statistiques détaillées

#### Structure de données (À affiner):
```typescript
interface CompetitiveScore {
  playerId: string
  gameTemplate: string
  eloRating: number
  seasonPoints: number
  achievements: Achievement[]
  currentStreak: number
  bestStreak: number
  lastVictoryDate: string
}

interface Achievement {
  id: string
  name: string
  description: string
  unlockedAt: Date
  category: 'victories' | 'participation' | 'strategy' | 'social'
  icon: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
}

interface Season {
  id: string
  name: string
  startDate: string
  endDate: string
  isActive: boolean
  leaderboard: CompetitiveScore[]
}
```

**❓ Questions à préciser:**
- Quels types de trophées/achievements souhaitez-vous ?
- Faut-il un système de saisons (mensuel/trimestriel/annuel) ?
- Souhaitez-vous un algorithme ELO ou un système de points simples ?
- Interface séparée ou intégrée aux statistiques existantes ?

### Phase 7: 🏕️ Mode Campagne Multi-Scénarios
**Statut**: 🔄 Planifié - **PRIORITÉ #7** (À détailler)
**Priorité**: Moyenne
- [ ] Validation de schéma lors de l'import
- [ ] Migration automatique des anciennes versions

#### ⚠️ Gestion des Conflits:
- **Stratégies de merge** : Écraser, Fusionner, Ignorer
- **Validation des IDs** : Éviter les doublons
- **Rollback automatique** en cas d'erreur d'import

### Phase 2.8: 💾 Gestion Avancée de Base de Données
**Statut**: 🔄 Planifié
**Priorité**: Moyenne (UX et Admin)

#### Objectifs:
- **Export/Backup** : Sauvegarde complète de la base de données
- **Import/Restore** : Restauration depuis un fichier de sauvegarde
- **Nettoyage** : Suppression de données obsolètes ou corrompues
- **Validation** : Vérification de l'intégrité des données

#### Fonctionnalités à Implémenter:
```typescript
interface DatabaseBackup {
  version: string
  timestamp: string
  players: Player[]
  gameTemplates: GameTemplate[]
  gameSessions: GameSession[]
  metadata: {
    totalGames: number
    exportedBy: string
    checksum: string
  }
}
```

#### Interface Utilisateur:
- **Dialog Database Management** (déjà implémenté)
- Boutons "Export Database" et "Import Database" 
- Barre de progression pour les opérations longues
- Validation avant import avec aperçu des données
- Gestion des conflits (données existantes vs importées)

#### Fonctionnalités Techniques:
- **Export JSON** : Format standardisé et lisible
- **Validation Schema** : Vérification des données avant import
- **Backup automatique** : Avant chaque import majeur
- **Rollback** : Annulation possible après import
- **Logging** : Historique des opérations d'import/export

#### Fichiers à créer/modifier:
- [ ] `src/lib/database-backup.ts` - Service de backup/restore
- [ ] `src/components/DatabaseManager.tsx` - Nouvelles fonctionnalités UI
- [ ] `server.js` - Endpoints pour export/import
- [ ] `src/lib/database-validation.ts` - Validation des données
- [ ] Tests unitaires pour backup/restore

#### Cas d'Usage:
- 📱 **Migration d'appareil** : Transfert des données vers un nouveau device
- 🔄 **Synchronisation** : Partage de données entre utilisateurs
- 🛡️ **Sauvegarde préventive** : Avant mises à jour majeures
- 🚀 **Déploiement** : Import de données de test ou de production

### Phase 3: � Système de Score Compétitif
**Statut**: 🔄 Planifié
**Priorité**: Moyenne

#### Objectifs:
- 📊 Classement temporel (mensuel, annuel)
- 🏅 Points de victoire pondérés
- 🎖️ Système de trophées et succès
- 🔥 Streak (séries de victoires)

#### Nouvelles fonctionnalités:
- Algorithme de classement ELO adapté aux jeux de société
- Interface de tableau de bord compétitif
- Calcul automatique des points de saison
- Badges de réussite (Maître du Donjon, Stratège, etc.)

#### Structure de données:
```typescript
interface CompetitiveScore {
  playerId: string
  gameTemplate: string
  eloRating: number
  seasonPoints: number
  achievements: Achievement[]
  currentStreak: number
  bestStreak: number
}

interface Achievement {
  id: string
  name: string
  description: string
  unlockedAt: Date
  category: 'victories' | 'participation' | 'strategy' | 'social'
}
```

### Phase 4: �🏕️ Mode Campagne (Multi-Scénarios)
**Statut**: 🔄 Planifié
**Priorité**: Moyenne

#### Objectifs (À détailler selon vos besoins):
- Campagne = série de scénarios liés avec progression
- Gestion de l'état entre scénarios (succès/échecs influencent la suite)
- Statistiques cumulées sur l'ensemble de la campagne
- Mode proche du coopératif (1 scénario = 1 session)
- Sauvegarde/reprise de campagnes en cours
- Arbre de progression avec scénarios conditionnels

#### Fonctionnalités Potentielles:
- **Progression narrative** : Déblocage de scénarios selon les résultats
- **Persistance des personnages** : Évolution/amélioration entre scénarios
- **Ressources de campagne** : Équipement, objets, or collectés
- **Journal de campagne** : Historique des événements marquants
- **Branches narratives** : Choix qui influencent les scénarios suivants
- **Mode coop enrichi** : Objectifs de campagne complexes

#### Structure de données (À affiner):
```typescript
interface Campaign {
  id: string
  name: string
  gameTemplate: string
  scenarios: Scenario[]
  participants: string[] // Player IDs
  status: 'active' | 'completed' | 'paused' | 'failed'
  startDate: string
  currentScenario?: string
  campaignData?: any // État spécifique (ressources, déblocages)
  description?: string
}

interface Scenario {
  id: string
  campaignId: string
  name: string
  description?: string
  order: number
  session?: GameSession // Session associée si jouée
  status: 'locked' | 'available' | 'completed' | 'failed'
  prerequisites?: string[] // Scénarios requis
  unlocks?: string[] // Scénarios débloqués par celui-ci
  objectives?: string[]
  rewards?: string[]
}

interface CampaignProgress {
  campaignId: string
  totalScenarios: number
  completedScenarios: number
  failedScenarios: number
  currentBranch?: string
  unlockedScenarios: string[]
}
```

**❓ Questions à préciser:**
- Quels jeux supporteront le mode campagne en priorité ?
- Faut-il une progression des personnages entre scénarios ?
- Souhaitez-vous des ressources/équipements persistants ?
- Interface dédiée ou intégrée aux parties existantes ?
- Gestion des sauvegardes multiples de campagnes ?

#### Fichiers à créer/modifier:
- [ ] `src/components/CampaignManager.tsx` - Nouveau composant
- [ ] `src/components/CampaignDetail.tsx` - Détail d'une campagne
- [ ] `src/components/ScenarioSetup.tsx` - Configuration scénario
- [ ] `src/App.tsx` - Nouvelles interfaces
- [ ] `server.js` - Endpoints campagnes
- [ ] Migration DB - Tables campaigns et scenarios

### Phase 8: 🌐 Intégrations BGG Avancées
**Statut**: 🔄 Planifié - **PRIORITÉ #8**
**Priorité**: Basse (Enhancement)

#### APIs Cibles:
- **BoardGameGeek**: Données enrichies, reviews, rankings, images haute résolution
- **IGDB**: Images supplémentaires, descriptions enrichies
- **Steam**: Intégration jeux PC (si applicable)

#### Fonctionnalités Avancées:
- Import automatique de métadonnées étendues
- Synchronisation des scores avec BGG (si API disponible)
- Images haute résolution et galeries
- Suggestions de jeux basées sur l'historique
- Reviews et notes importées
- Données de complexité et recommandations d'âge

#### Prérequis:
- ✅ Phase 1 (Refonte DB) **OBLIGATOIRE**
- ✅ Phase 2 (BGG Finalisé) **OBLIGATOIRE**
- Authentification externe (OAuth si nécessaire)
- Cache local robuste des données API
- Gestion de la limitation de requêtes (rate limiting)

#### Fichiers à créer/modifier:
- [ ] `src/services/BGGAdvancedService.ts` - Service enrichi
- [ ] `src/components/GameGallery.tsx` - Galerie d'images
- [ ] `src/components/GameReviews.tsx` - Affichage reviews
- [ ] `src/lib/api-cache.ts` - Système de cache avancé

## 🚫 Fonctionnalités Volontairement Exclues

### Gestion Multi-Utilisateurs / Profils
**Décision**: ❌ Non implémenté par design

#### Objectifs:
- Support multilingue (Français, Anglais)
- Adaptation des formats de date/nombre selon la locale
- Interface traduite pour tous les composants
- Noms de jeux en multiple langues

#### Technologies:
- **react-i18next** pour la gestion des traductions
- Fichiers JSON pour les chaînes de caractères
- Détection automatique de la langue du navigateur
- Stockage de la préférence utilisateur

#### Langues Prioritaires:
1. 🇫🇷 **Français** (langue principale)
2. 🇺🇸 **Anglais** (international)
3. 🇩🇪 **Allemand** (marché européen des jeux de société)

#### Structure des traductions:
```typescript
// locales/fr.json
{
  "common": {
    "save": "Sauvegarder",
    "cancel": "Annuler",
    "required": "obligatoire",
    "optional": "optionnel"
  },
  "game": {
    "setup": "Configuration de partie",
    "players": "Joueurs",
    "template": "Modèle de jeu"
  }
}
```

#### Fichiers à créer/modifier:
- [ ] `src/locales/` - Dossier des traductions
- [ ] `src/hooks/useTranslation.ts` - Hook personnalisé
- [ ] `src/components/LanguageSelector.tsx` - Sélecteur de langue
- [ ] Mise à jour de tous les composants avec les clés de traduction
- [ ] `src/lib/game-database.ts` - Base de données jeux
- [ ] `src/components/GameImporter.tsx` - Interface d'import

## 🚫 Fonctionnalités Volontairement Exclues

### Gestion Multi-Utilisateurs / Profils
**Décision**: ❌ Non implémenté par design

**Raisons**:
- L'application n'a pas vocation à être en ligne pour plusieurs utilisateurs différents
- Usage prévu : local ou partage entre amis/joueurs du même groupe
- Simplicité d'utilisation privilégiée
- Évite la complexité d'authentification/autorisation

**Alternative**:
- Partage possible via export/import de données
- Utilisation sur appareils partagés sans restriction
- Focus sur l'expérience de groupe plutôt que individuelle

## 📊 Métriques de Progression

### Phase 1 - Refonte BDD (PRIORITÉ #1)
- [ ] 0/1 **script de migration critique** créé et testé
- [ ] 0/1 **backup automatique** des données actuelles
- [ ] 0/2 **nouvelles tables** créées (game_characters, game_extensions)
- [ ] 0/1 **parsing CSV** des données existantes (characters + extensions)
- [ ] 0/1 **conversion et validation** des données migrées
- [ ] 0/4 **fichiers API** modifiés (database.ts, server.js, etc.)
- [ ] 0/1 **plan de rollback** testé en cas d'échec
- [ ] 0/1 **tests de compatibilité** ascendante validés

### Phase 2 - Finalisation BGG (PRIORITÉ #2)
- [ ] 0/4 améliorations implémentées (images, cache, sync, UI)
- [ ] 0/2 nouveaux endpoints BGG créés
- [ ] 0/1 système de cache local implémenté

### Phase 3 - Personnages par Jeu (PRIORITÉ #3)
**Dépriorisé : la gestion avancée des personnages (classes, capacités, import API, etc.) n'est pas prévue pour le moment.**
Le texte et les exemples restent en fin de roadmap pour référence future.

---

## 📦 Gestion avancée des personnages (dépriorisée)

Tout le texte, les exemples et les structures concernant la gestion avancée des personnages (classes, capacités, import API, etc.) sont conservés ici pour référence, mais ne sont pas prioritaires dans la feuille de route actuelle.

#### Objectifs:
- Personnages avec classes, capacités, descriptions, images
- Import depuis APIs (BoardGameGeek, IGDB, etc.)
- Gestion avancée des capacités (conditions, effets, etc.)

#### Structure de données:
```typescript
interface GameCharacter {
  id: string
  gameTemplate: string
  name: string
  classType: string // Métier/Classe (auto-rempli)
  description?: string
  abilities?: string[]
  source: 'manual' | 'api_boardgamegeek'
  externalId?: string
}

interface Ability {
  id: string
  name: string
  description: string
  type: 'active' | 'passive'
  effect: string // Effet en texte brut ou JSON
  cooldown?: number // Tours avant réutilisation
}
```

#### Fichiers à modifier:
- [ ] `src/App.tsx` - Nouvelles interfaces
- [ ] `src/components/GameSetup.tsx` - Sélection personnages améliorée
- [ ] `src/components/ActiveGame.tsx` - Affichage nom + classe
- [ ] `src/lib/database.ts` - CRUD pour nouvelle table game_characters
- [ ] `server.js` - Endpoints personnages

#### Exemples de Migration:
```typescript
// EXEMPLE: Migration d'un jeu existant
// AVANT: game_templates.characters = "Barbare,Archer,Clerc,Mage"
// APRÈS: 4 entrées dans game_characters

const gloomhavenCharacters = [
  {
    id: 'gloomhaven-barbare-001',
    game_template: 'Gloomhaven',
    name: 'Barbare',
    class_type: null,  // À remplir plus tard
    source: 'migrated',
    abilities: '[]'
  },
  {
    id: 'gloomhaven-archer-002', 
    game_template: 'Gloomhaven',
    name: 'Archer',
    class_type: null,
    source: 'migrated',
    abilities: '[]'
  }
]
```

#### Validation et Tests:
```typescript
interface MigrationValidation {
  // Vérifier que toutes les données CSV ont été converties
  validateCharacterMigration(): Promise<ValidationResult>
  
  // Comparer les données avant/après
  testNewDataStructure(): Promise<TestResult>
}
```

---

**Dernière mise à jour**: 22 août 2025
**Version actuelle**: v1.0.1 (Tests complets + infrastructure qualité)
**Prochaine version planifiée**: v1.1 (Refonte BDD + BGG finalisé)

### 🎯 Roadmap Versions Futures
- **v1.1** : Phase 1 (Refonte BDD) + Phase 2 (BGG Final)
- **v1.2** : Phase 3 (Personnages avancés) + Phase 4 (Localisation)
- **v1.3** : Phase 5 (Backup/Import) + Phase 6 (Score Compétitif - à détailler)
- **v1.4** : Phase 7 (Mode Campagne - à détailler) + Phase 8 (BGG Avancé)

## 🧪 Statut de la Qualité Code

### ✅ Tests Unitaires & Intégration : 52/52 (100%)
- **Infrastructure Jest** : ESM + TypeScript + React Testing Library
- **Tests techniques** : BGGService (7), database-hooks (7), config (3)
- **Tests fonctionnels** : BGGGameSearch (16), GameTemplateSection (12)
- **Tests intégration** : BGG workflow complet (7)
- **Architecture** : Mocks robustes, navigation Dashboard, localisation FR
- **Legacy cleanup** : Fichiers obsolètes supprimés
