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
## 🎯 Prochaines Fonctionnalités Planifiées

### Phase 1: 🌐 Amélioration Intégration BGG
**Statut**: 🔄 En cours (90% complet)
**Priorité**: Moyenne

#### � Améliorations Restantes:
- [ ] **Images BGG** : Affichage des images de jeux importées
- [ ] **Cache local** : Stockage des résultats de recherche BGG
- [ ] **Sync périodique** : Mise à jour automatique des données BGG
- [ ] **Amélioration UI** : Popup de suggestions qui ne se coupe plus dans les dialogs

#### ✅ Déjà Implémenté:
- [x] Service BGGService.ts avec XML parsing
- [x] Composant BGGGameSearch avec auto-complétion
- [x] Proxy Express pour contourner CORS
- [x] Analyse intelligente des modes basée sur mécaniques
- [x] Import automatique personnages/extensions
- [x] Intégration complète dans GameTemplateSection

### Phase 2: 🏆 Amélioration du Mode Compétitif
**Statut**: ✅ Complet
**Priorité**: Haute

#### ✅ Fonctionnalités Implémentées:
- [x] Système de scoring en temps réel
- [x] Calcul automatique des classements
- [x] Validation des scores négatifs/positifs
- [x] Interface utilisateur optimisée pour la saisie rapide
- [x] Sauvegarde automatique des modifications

### Phase 3: 🎭 Gestion des Personnages par Jeu
**Statut**: 🔄 Planifié
**Priorité**: Haute

#### Objectifs:
- Base de données des personnages par jeu
- Sélection automatique selon le template
- Interface : Liste déroulante (nom) + Champ grisé (métier/classe)
- Filtrage automatique des personnages disponibles

#### Structure de données:
```typescript
interface GameCharacter {
  name: string
  class: string // Métier/Classe (auto-rempli)
  description?: string
  abilities?: string[]
  gameTemplate: string // Lien vers le template
}

interface GameTemplate {
  // Ajout
  hasDetailedCharacters?: boolean // true si personnages prédéfinis
  characterClasses?: GameCharacter[] // Liste complète
}
```

#### Fichiers à modifier:
- [ ] `src/App.tsx` - Nouvelles interfaces
- [ ] `src/components/GameSetup.tsx` - Sélection personnages améliorée
- [ ] `src/components/ActiveGame.tsx` - Affichage nom + classe
- [ ] `src/lib/database.ts` - Base de données personnages
- [ ] `server.js` - Endpoints personnages
- [ ] Migration DB - Table game_characters

### Phase 2.5: 🗄️ Refonte Structure Base de Données
**Statut**: 🔄 Planifié 
**Priorité**: Haute (Prérequis pour API et personnages avancés)

#### Problèmes Actuels:
- **Personnages**: Stockés en CSV dans `game_templates.characters`
  - Impossible d'intégrer des APIs externes (BoardGameGeek, etc.)
  - Pas de liaison métier/classe avec le personnage
  - Gestion limitée des capacités et descriptions
- **Extensions**: Stockées en CSV sans métadonnées
  - Pas de validation des règles (ex: nombre de joueurs max)
  - Impossible de gérer les contraintes (jeu pour 4 → extension permet 5 joueurs)

#### Nouvelles Tables Nécessaires:
```sql
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
    adds_characters INTEGER DEFAULT 0,
    adds_mechanics TEXT,    -- JSON array des nouvelles mécaniques
    image_url TEXT,
    source TEXT,
    external_id TEXT,
    FOREIGN KEY (game_template) REFERENCES game_templates(name)
);
```

#### Avantages de la Refonte:
- 🌐 **Support API**: Intégration BoardGameGeek, IGDB, etc.
- 🎭 **Personnages riches**: Classes, capacités, descriptions, images
- 📦 **Extensions intelligentes**: Validation des contraintes de joueurs
- 🔍 **Recherche avancée**: Filtrage par capacités, classes, etc.
- 📊 **Analytics améliorées**: Statistiques par personnage/extension

#### Migration Planifiée:
- [ ] Script de migration des données existantes
- [ ] Nouveaux endpoints API pour personnages et extensions
- [ ] Interface de gestion avancée des personnages
- [ ] Validation des contraintes d'extensions
- [ ] Tests de compatibilité ascendante

### Phase 3: 💾 Backup & Import de Base de Données
**Statut**: 🔄 Planifié
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

#### Objectifs:
- Campagne = série de scénarios liés
- Progression entre scénarios
- Statistiques cumulées sur la campagne
- Mode proche du coopératif (1 scénario = 1 session)

#### Structure de données:
```typescript
interface Campaign {
  id: string
  name: string
  gameTemplate: string
  scenarios: Scenario[]
  participants: string[] // Player IDs
  status: 'active' | 'completed' | 'paused'
  startDate: string
  description?: string
}

interface Scenario {
  id: string
  campaignId: string
  name: string
  order: number
  session?: GameSession // Session associée si jouée
  status: 'pending' | 'completed' | 'failed'
  prerequisites?: string[] // Scénarios requis
}
```

#### Fichiers à créer/modifier:
- [ ] `src/components/CampaignManager.tsx` - Nouveau composant
- [ ] `src/components/CampaignDetail.tsx` - Détail d'une campagne
- [ ] `src/components/ScenarioSetup.tsx` - Configuration scénario
- [ ] `src/App.tsx` - Nouvelles interfaces
- [ ] `server.js` - Endpoints campagnes
- [ ] Migration DB - Tables campaigns et scenarios

### Phase 5: 🌐 Intégrations API Externes
**Statut**: � Conceptuel
**Priorité**: Basse

#### APIs Cibles:
- **BoardGameGeek**: Données des jeux, reviews, rankings
- **IGDB**: Images, descriptions enrichies
- **Steam**: Intégration jeux PC (si applicable)

#### Fonctionnalités:
- Import automatique des métadonnées de jeux
- Synchronisation des scores avec BGG
- Images et descriptions automatiques
- Suggestions de jeux basées sur l'historique

#### Prérequis:
- ✅ Phase 2.5 (Refonte DB) **OBLIGATOIRE**
- Authentification externe (OAuth)
- Cache local des données API
- Gestion de la limitation de requêtes (rate limiting)

### Phase 7: 🌍 Localisation et Internationalisation
**Statut**: 🔄 Planifié
**Priorité**: Basse (Enhancement)

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

### Phase 1 - Mode Compétitif
- [ ] 0/6 fichiers modifiés
- [ ] 0/1 migration DB créée
- [ ] 0/1 interface utilisateur testée

### Phase 2 - Personnages par Jeu
- [ ] 0/6 fichiers modifiés
- [ ] 0/1 migration DB créée
- [ ] 0/1 base de données personnages créée

### Phase 3 - Mode Campagne
- [ ] 0/8 fichiers créés/modifiés
- [ ] 0/1 migration DB créée
- [ ] 0/1 interface campagne testée

### Phase 4 - API Jeux
- [ ] 0/3 fichiers créés
- [ ] 0/1 service API implémenté
- [ ] 0/1 système de cache créé

## 🔄 Notes de Développement

### Dépendances entre Phases
- Phase 2 peut être développée en parallèle de Phase 1
- Phase 3 dépend de Phase 2 (personnages)
- Phase 4 peut enrichir Phase 2 (données personnages)

### Considérations Techniques
- Maintenir la compatibilité ascendante des données
- Prévoir les migrations de base de données
- Conserver l'architecture modulaire actuelle
- Tests unitaires pour chaque nouvelle fonctionnalité

## 🐛 Améliorations UX Mineures

### Issues Connues à Corriger
- **BGG Search Popup Clipping** : La fenêtre de suggestions BGG peut être coupée dans les Dialogs
  - **Cause** : Overflow des DialogContent + z-index conflicts
  - **Solutions** : Portal, Popover Radix UI, ou positionnement dynamique
  - **Priorité** : Basse (amélioration cosmétique)

### Points d'Attention
- Performance avec des bases de données de personnages importantes
- Interface utilisateur intuitive pour la sélection de personnages
- Gestion des conflits entre modes (compétitif vs campagne)
- Sauvegarde/restauration des campagnes en cours

---

**Dernière mise à jour**: 21 août 2025
**Version actuelle**: v1.0 (stable)
**Prochaine version planifiée**: v1.1 (Mode compétitif amélioré)
