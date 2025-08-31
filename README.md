# 🎲 Board Game Score Tracker

> **Système complet de suivi de parties de jeux de société** — Architecture moderne React/TypeScript avec intégration BoardGameGeek, base SQLite, interface responsive, et infrastructure de tests complète (52/52 tests ✅)

## 🚀 Fonctionnalités Principales

### ✅ **Implémenté et Fonctionnel**
- 🎮 **Gestion multi-modes** : Coopératif, Compétitif, Campagne avec logique intelligente
- 🔍 **Intégration BoardGameGeek** : Recherche temps réel, auto-import métadonnées, analyse des modes
- 👥 **Gestion avancée des joueurs** : Historique, statistiques, système de rédemption
- 🎭 **Personnages intelligents** : Extraction automatique depuis BGG, gestion par jeu
- 🏆 **Statistiques complètes** : Dashboard, historique parties, analytics par jeu
- 📊 **Templates de jeux** : Configuration flexible avec validation, support extensions
- 🗄️ **Base SQLite robuste** : Migrations automatiques, backup, structure optimisée
- 🧪 **Tests complets** : 52/52 tests ✅ (unitaires, fonctionnels, intégration)
- 🎨 **UI moderne** : React 19 + Radix UI + Tailwind, responsive design

### 🔍 **Intégration BGG Avancée**
- **Recherche intelligente** : Auto-complétion, debouncing, prévisualisation
- **Import complet** : Métadonnées, images, personnages, extensions, mécaniques
- **Analyse automatique** : Détection modes de jeu basée sur les mécaniques BGG
- **Formulaire d'édition** : Modification tous champs avant import avec validation
- **Cache local** : Optimisation performances, gestion hors-ligne

## 📁 Structure du Projet

```bash
board-game-scorekeep/
├── frontend/           # React 19 + TypeScript + Vite
│   ├── src/
│   │   ├── components/ # UI modulaire (Dashboard, BGG, Templates, etc.)
│   │   ├── services/   # BGGService, API calls
│   │   ├── lib/        # Database hooks, utils, context
│   │   └── hooks/      # Custom React hooks
├── backend/            # Express + SQLite (optionnel, proxy BGG)
├── tests/              # Jest + RTL - 52/52 tests ✅
│   ├── unit/          # Tests unitaires techniques et fonctionnels
│   ├── integration/   # Tests end-to-end BGG workflow
│   └── fixtures/      # Données de test, mocks BGG
└── database/          # SQLite + migrations + documentation
```

- **Backend** : Voir [`backend/README.md`](backend/README.md)
- **Frontend** : Voir [`frontend/README.md`](frontend/README.md)

#### 🛠️ Outils de développement et qualité
Outils complémentaires recommandés pour le frontend :
```json
{
  "husky": "^9.0.0",           // Git hooks
  "lint-staged": "^15.0.0",    // Linting sur staged files
  "commitizen": "^4.3.0",      // Commits conventionnels
  "semantic-release": "^24.0.0" // Release automatisée
}

## 🧩 Types de données partagés

Les interfaces TypeScript partagées garantissent la cohérence des données entre le frontend, le backend et la base de données.

Exemple d'utilisation du type `GameCharacter` :
```typescript
export interface GameCharacter {
  id: string;
  name: string;
  classType?: string;
  description?: string;
  abilities?: string[];
  imageUrl?: string;
  source?: 'manual' | 'api_boardgamegeek' | string;
  externalId?: string;
  createdAt?: string;
}

const characters: GameCharacter[] = [
  {
    id: "brute",
    name: "Brute",
    classType: "Tank",
    description: "Personnage robuste, encaisse les dégâts.",
    abilities: ["Shield", "Taunt"],
    imageUrl: "/images/brute.png",
    source: "manual",
    createdAt: "2025-08-31T12:00:00Z"
  }
];
```

## 🚀 Installation globale

### Prérequis
- **Node.js 18+** (recommandé: 20+)
- **npm** ou **yarn**

### Installation
```bash
# 1. Cloner le repository
git clone https://github.com/thibaud200/board-game-scorekeep.git
cd board-game-scorekeep

# 2. Installer les dépendances
cd frontend && npm install

# 3. Démarrer l'application
npm run dev
# ➡️ Ouvre sur http://localhost:5173
```

### Backend (Optionnel - Proxy BGG)
```bash
# Dans un autre terminal
cd backend && npm install
npm run dev
# ➡️ API sur http://localhost:3001
```

### Tests
```bash
cd tests && npm install
npm test
# ➡️ 52/52 tests ✅
```

## 🎯 Guide d'Utilisation Rapide

1. **📊 Dashboard** : Vue d'ensemble parties, stats, navigation modulaire
2. **🎮 Nouvelle Partie** : Sélection jeu, mode, joueurs, configuration
3. **🔍 Templates BGG** : Recherche BoardGameGeek → Import automatique
4. **👥 Gestion Joueurs** : Ajout/édition, historique, statistiques
5. **🏆 Historique** : Consultation parties, filtres, analytics

## 🛠️ Technologies Utilisées

- **Frontend** : React 19, TypeScript, Vite, Tailwind CSS
- **UI Components** : Radix UI, Lucide Icons, Sonner (notifications)
- **Base de Données** : SQLite avec better-sqlite3
- **Tests** : Jest 30, React Testing Library, Mock Service Worker
- **API** : BoardGameGeek XML API (via proxy Express)
- **Build** : Vite avec optimisations ESM, TypeScript strict

## 📈 État du Projet

### ✅ **Stable & Prêt Production**
- **Interface** : Design moderne, responsive, accessible
- **Fonctionnalités** : Toutes les features core implémentées
- **Tests** : Couverture complète, CI/CD ready
- **Performance** : Optimisé, lazy loading, cache intelligent
- **Documentation** : Complète, à jour, exemples pratiques

### � **Améliorations Futures** 
Voir [ROADMAP.md](ROADMAP.md) pour les prochaines phases :
- Phase 1 : Refonte structure BDD (personnages/extensions)
- Phase 2 : BGG avancé (cache, sync, images HD)
- Phase 3 : Analytics avancées
- Phase 4 : Mode campagne multi-scénarios

## 🤝 Contribution

1. **Fork** le projet
2. **Créer** une branche feature (`git checkout -b feature/amazing-feature`)
3. **Commit** les changements (`git commit -m 'Add amazing feature'`)
4. **Push** la branche (`git push origin feature/amazing-feature`)
5. **Ouvrir** une Pull Request

## 📝 Liens Utiles

- [📋 Documentation Technique](frontend/src/prd.md) - Spécifications détaillées
- [🗺️ Roadmap](ROADMAP.md) - Fonctionnalités futures
- [🧪 Tests](tests/README.md) - Guide des tests
- [🗄️ Base de Données](database/docs/database-structure.md) - Structure DB

---

**© 2025 Board Game Score Tracker** | Développé avec ❤️ pour les passionnés de jeux de société
