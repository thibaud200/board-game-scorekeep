# 🗺️ Board Game Score Tracker - Roadmap v1.0.1

## 📋 État Actuel du Projet - **DÉCEMBRE 2025**

### ✅ **Fonctionnalités Complètes et Stables (v1.0.1)**

#### 🎮 **Core Application**
- [x] **Dashboard modulaire** : Interface responsive avec navigation intuitive
- [x] **Gestion multi-modes** : Coopératif, Compétitif, Campagne avec logique intelligente
- [x] **Système de templates** : Configuration flexible des jeux avec validation robuste
- [x] **Gestion personnages** : Historique complet, statistiques par joueur
- [x] **Statistiques avancées** : Analytics complètes, historique des parties
- [x] **Base SQLite robuste** : Migrations automatiques, structure optimisée

#### 🔍 **Intégration BoardGameGeek - COMPLET**
- [x] **Service BGG complet** : XML parsing, proxy Express pour CORS
- [x] **Recherche intelligente** : Auto-complétion temps réel avec debouncing
- [x] **Import automatique** : Métadonnées complètes (nom, joueurs, durée, description)
- [x] **Analyse des modes** : Détection coopératif/compétitif basée sur mécaniques BGG
- [x] **Extraction personnages** : Auto-détection depuis descriptions BGG
- [x] **Gestion extensions** : Import et liaison automatique avec jeux de base
- [x] **Formulaire d'édition avancée** : Modification tous champs BGG avant import
- [x] **Support métadonnées étendues** : Catégories, mécaniques, familles, notes, complexité

#### 🧪 **Qualité & Tests - 100% COMPLET**
- [x] **Infrastructure Jest complète** : ESM + TypeScript + React Testing Library
- [x] **52/52 tests passants** : Taux de réussite 100% garanti
- [x] **Tests unitaires techniques** : BGGService, database-hooks, config (17/17 ✅)
- [x] **Tests fonctionnels** : BGGGameSearch, GameTemplateSection (28/28 ✅)
- [x] **Tests d'intégration** : BGG workflow end-to-end complet (7/7 ✅)
- [x] **Mocks robustes** : BGG API, Database, window.matchMedia, lucide-react
- [x] **Navigation tests** : Dashboard → GameTemplateSection → BGG workflow
- [x] **Support localisation** : Tests en français avec caractères spéciaux

#### 🎨 **Interface & UX**
- [x] **Design moderne** : React 19 + Radix UI + Tailwind CSS
- [x] **Architecture TypeScript** : 0 erreur de compilation, types stricts
- [x] **Responsive design** : Adaptation mobile/desktop optimisée
- [x] **Validation robuste** : Champs obligatoires, feedback immédiat
- [x] **Icônes cohérentes** : Lucide Icons dans toute l'application
- [x] **Notifications** : Sonner pour feedback utilisateur

### 📊 **Nouvelles Fonctionnalités v1.0.1**

#### 🔍 **BGG Avancé - NOUVELLEMENT AJOUTÉ**
- [x] **Formulaire d'édition complet** : Modification tous champs BGG avant import
  - Informations de base : nom, année, min/max joueurs, âge minimum
  - Temps de jeu : durée moyenne, min/max détaillé
  - Évaluations : note BGG et complexité modifiables
  - Images : URLs principale et miniature éditables
  - Description : texte libre avec prévisualisation
  - Métadonnées : catégories, mécaniques, familles (listes éditables)
  - Personnages : gestion liste avec ajout/suppression
  - Extensions : visualisation et suppression individuelle

#### 🗄️ **Base de Données Étendue**
- [x] **Nouveaux champs BGG** : thumbnail, playing_time, min/max_play_time, min_age
- [x] **Métadonnées structurées** : categories, mechanics, families (JSON)
- [x] **Évaluations** : rating (0-10), complexity (0-5)
- [x] **Contraintes FK supprimées** : Gestion flexible sans blocages
- [x] **Migration automatique** : Ajout champs sans perte de données

#### 🔧 **Améliorations Techniques**
- [x] **Interface GameTemplate étendue** : Support tous les nouveaux champs BGG
- [x] **Sauvegarde complète** : Persistance de toutes les métadonnées BGG
- [x] **Gestion des doublons** : Nettoyage automatique base de données
- [x] **Validation TypeScript** : Types stricts pour tous les nouveaux champs
## 🎯 **Prochaines Phases de Développement**

### Phase 1: 🗄️ **Optimisation Base de Données** 
**Statut**: 🔄 **Priorisé** - Q1 2026  
**Priorité**: Haute (Performance & Scalabilité)

#### Objectifs
- **Performance** : Optimisation requêtes, index intelligents
- **Structure** : Normalisation complète personnages/extensions
- **Maintenance** : Outils d'administration, backup automatique

#### Fonctionnalités Cibles
- [ ] **Tables structurées** : `game_characters`, `game_extensions` avec FK optionnelles
- [ ] **Migration intelligente** : Conversion CSV → Tables relationnelles
- [ ] **Cache local** : Stockage offline des métadonnées BGG
- [ ] **Backup automatique** : Sauvegarde programmée avec restauration
- [ ] **Audit tools** : Détection doublons, nettoyage automatique
- [ ] **Performance monitoring** : Métriques requêtes, optimisation

### Phase 2: 🌐 **BGG Avancé & Intégrations**
**Statut**: 📋 **Planifié** - Q2 2026  
**Priorité**: Moyenne (Enrichissement)

#### Nouvelles Fonctionnalités
- [ ] **Cache intelligent** : Stockage persistant résultats BGG
- [ ] **Sync périodique** : Mise à jour automatique métadonnées
- [ ] **Images HD** : Import automatique, galerie, optimisation
- [ ] **Reviews & Notes** : Import commentaires BGG, système notation
- [ ] **Suggestions** : Recommandations basées sur historique
- [ ] **Multi-langues** : Support descriptions dans différentes langues

#### Intégrations Externes
- [ ] **IGDB API** : Métadonnées jeux vidéo complémentaires
- [ ] **Steam API** : Intégration versions numériques
- [ ] **Amazon API** : Prix, disponibilité, liens achat

### Phase 3: 📊 **Analytics & Intelligence**
**Statut**: 🔮 **Vision** - Q3 2026  
**Priorité**: Moyenne (Insights)

#### Tableau de Bord Avancé
- [ ] **Métriques détaillées** : Temps de jeu moyen, préférences joueurs
- [ ] **Visualisations** : Graphiques tendances, répartition modes
- [ ] **Comparaisons** : Performance joueurs, évolution dans le temps
- [ ] **Prédictions** : Suggestions durée partie, difficulté optimale
- [ ] **Export données** : CSV, JSON, PDF pour analyses externes

#### Intelligence Artificielle
- [ ] **Recommandations personnalisées** : ML basé sur historique
- [ ] **Détection patterns** : Analyse comportements de jeu
- [ ] **Optimisation groupes** : Suggestions compositions joueurs
- [ ] **Auto-catégorisation** : Classification intelligente nouveaux jeux

### Phase 4: 🏕️ **Mode Campagne Multi-Scénarios**
**Statut**: 🔮 **Vision** - Q4 2026  
**Priorité**: Basse (Feature Avancée)

#### Fonctionnalités Campagne
- [ ] **Gestion multi-sessions** : Liaison parties en campagne
- [ ] **Progression personnages** : Évolution stats, équipements
- [ ] **Scénarios** : Bibliothèque, création custom, partage
- [ ] **Sauvegarde état** : Persistence entre sessions
- [ ] **Narratif** : Journal de campagne, timeline événements

### Phase 5: 🚀 **Déploiement & Distribution**
**Statut**: 🔮 **Vision** - 2027  
**Priorité**: Basse (Productisation)

#### Options de Déploiement
- [ ] **Application Electron** : Version desktop multi-platform
- [ ] **PWA complète** : Installation navigateur, offline complet
- [ ] **Docker containers** : Déploiement serveur facilitée
- [ ] **Cloud hosting** : Version SaaS avec synchronisation multi-device
- [ ] **Mobile apps** : React Native pour iOS/Android

## 📊 **Métriques de Qualité Actuelles**

### ✅ **Tests & Validation**
- **Couverture tests** : 52/52 tests ✅ (100%)
- **TypeScript** : 0 erreur de compilation
- **Performance** : Temps de chargement < 2s
- **Accessibilité** : Conformité ARIA, navigation clavier
- **Responsive** : Support mobile/tablet/desktop

### 🛠️ **Maintenance & Évolutivité**
- **Documentation** : 100% fonctionnalités documentées
- **Code quality** : ESLint + Prettier, conventions cohérentes
- **Dépendances** : Mises à jour sécurité automatiques
- **Backup** : Stratégie sauvegarde base de données
- **Monitoring** : Logs structurés, détection erreurs

## 🤝 **Contribution & Développement**

### 🚀 **Pour Contribuer**
1. **Voir issues GitHub** : Labels `good-first-issue`, `help-wanted`
2. **Setup développement** : `npm install` → `npm run dev`
3. **Tests obligatoires** : `npm test` doit passer 52/52 ✅
4. **Documentation** : Mise à jour des .md si nécessaire

### 🎯 **Priorités Contribution**
- **Phase 1** : Optimisation base de données (haute priorité)
- **Tests** : Maintenir couverture 100%
- **Documentation** : Exemples, guides utilisateur
- **UI/UX** : Amélioration ergonomie, accessibilité
- **Performance** : Optimisation bundle, lazy loading

---

**🗓️ Dernière mise à jour** : Décembre 2025  
**📊 Statut global** : ✅ Stable & Prêt Production  
**🎯 Prochaine milestone** : Phase 1 - Optimisation BDD (Q1 2026)

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
- [x] **Script de migration des données existantes** (complété)
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
    class_type: null,
    source: 'migrated',
    abilities: '[]'
  }
]
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
