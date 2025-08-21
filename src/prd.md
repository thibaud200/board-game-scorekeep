# Board Game Score Tracker - PRD v2.1 (État Actuel)

## 🎯 Vision & Mission
- **Mission Statement**: Système de suivi de parties de jeux de société modulaire et réactif, permettant la gestion complète des sessions de jeu avec support multi-modes, gestion avancée des personnages, et validation robuste des données.
- **État Actuel**: Application complètement fonctionnelle avec interface moderne, base de données SQLite, architecture modulaire React, et système de validation complet.
- **Qualités d'expérience**: Adaptatif, Intuitif, Complet, Robuste

## 📊 Classification du Projet
- **Niveau de complexité**: Application Avancée (gestion d'état complexe, base de données, multi-modes, validation)
- **Architecture**: React 19 + TypeScript + Tailwind CSS + SQLite + Express Server + Radix UI
- **Activité principale**: Gestion complète des sessions de jeu avec validation et statistiques avancées

## ✅ Fonctionnalités Implémentées

### 🏠 Système de Dashboard Modulaire
- **Implémenté**: Dashboard central avec cartes interactives pour chaque fonction majeure
- **Composants**: `Dashboard.tsx`, navigation par sidebar responsive avec organisation par domaine
- **Architecture**: 
  - `src/components/game/` - Composants liés aux jeux
  - `src/components/player/` - Composants liés aux joueurs  
  - `src/components/ui/` - Composants réutilisables (Radix UI)
- **État**: ✅ Complet - Navigation fluide sans onglets, adaptation automatique mobile/desktop, architecture propre

### 🎮 Gestion Multi-Modes de Jeu
- **Implémenté**: Support pour modes Coopératif, Compétitif, et Campagne
- **Fonctionnalités**:
  - Templates de jeu configurables avec modes multiples combinables
  - Sélection dynamique du mode par session avec mode par défaut
  - Résultats adaptés au mode (victoire/défaite pour coopératif, scores pour compétitif)
  - Interface avec badges visuels cohérents (icônes + texte)
- **État**: ✅ Complet avec migration de base de données et corrections de mapping

### 👥 Gestion Avancée des Personnages
- **Implémenté**: Système complet de gestion des personnages avec historique
- **Fonctionnalités**:
  - Attribution de personnages personnalisés et prédéfinis
  - Suivi des morts/résurrections avec historique complet
  - Remplacement de personnages en cours de partie
  - Interface sans numérotation (#1, #2, etc.) pour meilleure UX
  - Validation d'unicité des personnages par session
- **État**: ✅ Complet avec `CharacterEvent` tracking et validation robuste

### � Système de Validation et UX
- **Implémenté**: Validation complète des formulaires avec indicateurs visuels
- **Fonctionnalités**:
  - **Champs obligatoires** avec astérisque rouge (*) :
    - Nom du jeu (GameSetup et GameTemplateSection)
    - Durée de partie (ActiveGame)
    - Sélection d'au moins 2 joueurs
    - Au moins un mode de jeu pour les templates
  - **Champs optionnels** avec indication "(optional)" :
    - Personnages personnalisés
    - Extensions de jeu
  - **Feedback visuel** :
    - Bordures rouges pour champs invalides
    - Messages d'erreur contextuels
    - Boutons désactivés si validation échoue
    - Toast notifications pour actions importantes
- **État**: ✅ Complet - Prévention proactive des erreurs de saisie

### �📊 Système de Templates de Jeux
- **Implémenté**: Gestion complète des modèles de jeux avec validation
- **Fonctionnalités**:
  - Création/édition de templates avec validation obligatoire du nom
  - Support multi-modes (coopératif + compétitif + campagne combinables)
  - Gestion des extensions par template (optionnelles)
  - Statistiques par type de jeu avec calcul correct
  - Interface avec icônes cohérentes pour tous les badges
- **État**: ✅ Complet avec interface moderne et validation robuste

### 🏆 Statistiques et Historique
- **Implémenté**: Système complet de statistiques et suivi
- **Fonctionnalités**:
  - Statistiques détaillées par joueur avec historique
  - Calcul correct des parties par template (résolution du bug mapping gameTemplate)
  - Affichage conditionnel des boutons de détail selon les données disponibles
  - Statistiques par type de jeu avec boutons de détail dynamiques
  - Suivi des victoires, défaites, morts de personnages
  - Durées moyennes et temps de jeu
  - Résolution du bug de mapping gameTemplate (server.js)
- **État**: ✅ Complet avec visualisations et calculs corrects

### 🛠️ Gestion de Base de Données
- **Implémenté**: Base de données SQLite complète avec migrations et validation
- **Fonctionnalités**:
  - Persistance côté serveur (Express + better-sqlite3)
  - Migration automatique des schémas multi-modes
  - Mapping correct entre DB (game_type) et interface (gameTemplate)
  - Gestion des sauvegardes/restaurations
  - Interface d'administration de la DB avec DatabaseManager
- **État**: ✅ Complet et stable avec intégrité des données

## 🏗️ Architecture Technique

### Structure des Composants (Organisée par Domaine)
```
src/
├── components/
│   ├── Dashboard.tsx           # Tableau de bord principal
│   ├── DatabaseManager.tsx    # Gestion de la base de données
│   ├── game/                   # 🎮 Domaine des jeux
│   │   ├── ActiveGame.tsx      # Jeu en cours avec validation
│   │   ├── GameSetup.tsx       # Configuration avec validation
│   │   ├── GameHistory.tsx     # Historique des parties
│   │   ├── GamesPlayedSection.tsx # Section parties jouées
│   │   ├── GameTemplates.tsx   # Templates de jeux
│   │   ├── GameTypeDetail.tsx  # Détail par type de jeu
│   │   └── GameTemplateSection.tsx # Gestion templates
│   ├── player/                 # 👥 Domaine des joueurs
│   │   ├── PlayerManager.tsx   # Gestion des joueurs
│   │   ├── PlayerStats.tsx     # Statistiques joueurs
│   │   ├── PlayerStatsDetail.tsx # Détail statistiques
│   │   └── PlayerSection.tsx   # Section joueurs
│   ├── sections/               # ⚡ En cours de migration
│   │   ├── GameTemplateSection.tsx # → game/
│   │   └── PlayerSection.tsx   # → player/
│   └── ui/                     # 🎨 Composants réutilisables (Radix UI)
│       ├── button.tsx          # Boutons avec variants
│       ├── card.tsx            # Cartes d'interface
│       ├── dialog.tsx          # Modales et dialogs
│       ├── input.tsx           # Champs de saisie validés
│       ├── sidebar.tsx         # Navigation latérale
│       └── ... (40+ composants UI)
├── lib/
│   ├── database-context.tsx   # Context React pour la DB
│   ├── database-hooks.ts      # Hooks personnalisés avec validation
│   ├── server-database.ts     # Interface serveur avec mapping correct
│   ├── database.ts            # Types et interfaces de base
│   └── utils.ts               # Utilitaires (formatage, validation)
└── hooks/
    └── use-mobile.ts          # Hook de détection mobile responsive
```

### Stack Technologique
- **Frontend**: React 19 + TypeScript + Tailwind CSS + Radix UI
- **Backend**: Express.js + better-sqlite3 + CORS
- **Validation**: Native HTML5 + TypeScript + Custom hooks
- **Icons**: Phosphor Icons React
- **Build**: Vite + TypeScript strict mode
- **Notifications**: Sonner (Toast system)

### Interfaces de Données (Complètes)
```typescript
interface GameSession {
  id: string
  gameTemplate: string        // Mapping correct avec game_type DB
  gameType?: string          // Backward compatibility
  players: string[]
  scores: Record<string, number>
  gameMode: 'cooperative' | 'competitive' | 'campaign'
  isCooperative: boolean     // Deprecated but kept for compatibility
  characters?: Record<string, Character | string>
  characterHistory?: CharacterEvent[]
  cooperativeResult?: 'victory' | 'defeat'
  deadCharacters?: Record<string, boolean>
  newCharacterNames?: Record<string, string>
  duration?: string | number // Validation required
  startTime: string
  endTime?: string
  completed?: boolean
  winner?: string
  winCondition?: 'highest' | 'lowest' | 'cooperative'
  extensions?: string[]
}

interface GameTemplate {
  name: string               // Validation required
  hasCharacters: boolean
  characters?: string
  hasExtensions: boolean
  extensions?: string
  // Multi-mode support (at least one required)
  supportsCooperative: boolean
  supportsCompetitive: boolean
  supportsCampaign: boolean
  defaultMode: 'cooperative' | 'competitive' | 'campaign' // Required
}

interface CharacterEvent {
  playerId: string
  action: 'death' | 'replacement' | 'revival'
  timestamp: string
  characterName?: string
  characterType?: string
  previousCharacter?: { name: string; type: string }
}
```

## 🎨 Direction de Design

### Identité Visuelle
- **Réponse émotionnelle**: Moderne, efficace, professionnel avec prévention d'erreurs
- **Personnalité de design**: Interface propre avec validation claire et feedback immédiat
- **Métaphores visuelles**: Cartes modulaires, badges cohérents, indicateurs de statut

### Stratégie Couleurs et Validation (Tailwind CSS)
- **Validation**: 
  - `text-destructive` pour les erreurs et champs requis (*)
  - `border-destructive` pour les champs invalides
  - `text-muted-foreground` pour les labels optionnels
- **States**: Disabled, Loading, Success, Error avec feedback visuel
- **Cohérence**: Icônes Phosphor uniformes dans tous les badges
- **Scheme**: Système de couleurs sombre/clair adaptatif avec thème automatique
- **Couleurs primaires**: Bleu profond pour la confiance et navigation
- **Couleurs fonctionnelles**:
  - `destructive` (rouge) pour erreurs et validation
  - `success` (vert) pour actions positives
  - `muted` (gris) pour informations secondaires
- **Contraste**: Conformité WCAG AA (4.5:1 minimum)

### Système Responsive et Validation UX
- **Mobile-First**: Design adaptatif commençant par mobile
- **Breakpoints**: sm (640px), md (768px), lg (1024px), xl (1280px)
- **Navigation**: Sidebar responsive avec adaptation automatique
- **Touch Targets**: Minimum 44px pour tous les éléments interactifs
- **Validation UX**:
  - Feedback immédiat sur les erreurs
  - Prévention proactive des saisies invalides
  - États visuels clairs (valid/invalid/required)

## 🚀 Fonctionnalités Avancées Implémentées

### Gestion Robuste des Sessions de Jeu
- Configuration flexible avec validation des champs obligatoires
- Support des extensions de jeu (optionnelles)
- Gestion des conditions de victoire personnalisées par mode
- Suivi en temps réel des scores avec validation des durées
- Prévention des données incohérentes

### Système de Personnages Avancé avec Validation
- Historique complet des événements de personnages avec timestamps
- Gestion des morts et résurrections avec logique métier
- Remplacement de personnages avec validation d'unicité
- Interface intuitive sans numérotation avec feedback visuel
- Prévention des doublons de personnages

### Analytics et Statistiques Corrigées
- Calculs automatiques des statistiques avec mapping DB correct
- Résolution du bug gameTemplate vs game_type
- Affichage conditionnel des boutons de détail
- Graphiques et visualisations précises
- Comparaisons entre joueurs fiables

## 🔧 Considérations Techniques et Qualité

### Architecture et Organisation
- **Séparation par domaine**: `/game/`, `/player/`, `/ui/`
- **Composants validés**: Tous les formulaires avec validation robuste  
- **Types stricts**: TypeScript 100% typé avec interfaces complètes
- **Gestion d'erreurs**: Try/catch avec feedback utilisateur approprié

### Performance et Fiabilité
- Chargement paresseux des composants non-critiques
- Optimisation des requêtes avec mapping DB correct
- Cache intelligent des statistiques calculées
- Validation côté client ET serveur
- Prévention des états incohérents

### Accessibilité et UX
- Navigation clavier complète avec indicateurs visuels
- Support des lecteurs d'écran avec ARIA labels
- Contraste WCAG AA conforme (testé)
- Validation accessible avec messages d'erreur contextuels
- États de chargement et feedback immédiat

### Compatibilité et Robustesse  
- Support navigateurs modernes (ES2020+)
- Adaptation mobile/tablet/desktop testée
- Gestion gracieuse des erreurs réseau
- Backward compatibility avec données existantes
- Migration de schéma automatique

## � Métriques de Succès Actuelles
- ✅ 0 erreur de compilation TypeScript (100% typé)
- ✅ Navigation fluide sur tous les appareils  
- ✅ Temps de chargement < 2s (optimisé)
- ✅ Interface cohérente avec validation complète
- ✅ Gestion complète du cycle de vie des parties
- ✅ Prévention proactive des erreurs utilisateur
- ✅ Architecture modulaire et maintenable
- ✅ Base de données intègre et migrée correctement

## 🎯 Améliorations Récentes (v2.1)
- **Validation complète**: Champs obligatoires/optionnels clairement indiqués
- **Fix critique**: Résolution du bug de mapping gameTemplate
- **Architecture**: Réorganisation par domaine fonctionnel
- **UX/UI**: Icônes cohérentes et feedback visuel immédiat
- **Robustesse**: Prévention des données incomplètes ou invalides
- **Documentation**: Commentaires ajoutés sur toutes les fonctions importantes

## 🔮 Roadmap Future (Voir ROADMAP.md)
- **Phase 1**: Système de points de victoire pour mode compétitif
- **Phase 2**: Gestion des personnages par jeu avec sélection automatique
- **Phase 3**: Mode campagne multi-scénarios
- **Phase 4**: Intégration API externes (BoardGameGeek, etc.)

---

**Note**: Cette application n'a volontairement PAS de gestion multi-utilisateurs car elle est conçue pour un usage local ou partage entre amis/joueurs du même groupe.
- API pour intégrations tierces
- Mode hors ligne avancé