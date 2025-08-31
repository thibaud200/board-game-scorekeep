# 🤖 Contexte IA — Board Game Score Tracker

Ce fichier est destiné aux agents IA pour garantir que toutes les actions, suggestions et modifications respectent les standards, la structure et les objectifs du projet. Il doit être lu et pris en compte avant toute intervention automatique.

---

## 🎯 Objectif du projet

Board Game Score Tracker est une application web pour gérer les parties de jeux de société, avec suivi multi-modes, gestion des personnages, statistiques avancées et intégration BoardGameGeek.

---

## 🗝️ Stack technique

| Composant      | Technologie                | Version |
|----------------|---------------------------|---------|
| Frontend       | React + TypeScript        | 19.0    |
| Styling        | Tailwind CSS + Radix UI   | 3.4     |
| Backend        | Express.js                | 5.x     |
| Base de données| SQLite + better-sqlite3   | 3.x     |
| API externe    | BoardGameGeek XML API     | 2.0     |
| Build          | Vite                      | 6.x     |
| Tests          | Jest + React Testing Lib  | 30.x    |
| Icons          | Phosphor Icons React      | 2.x     |

---

## ⚠️ Contraintes spécifiques IA

### 🚫 Interdictions strictes
- **JAMAIS** utiliser le type `any`
- **JAMAIS** mélanger logique backend/frontend
- **JAMAIS** modifier la DB sans migration
- **JAMAIS** de code sans tests associés
- **TOUJOURS** respecter les normes de performance et de sécurité
- **TOUJOURS** documenter les décisions de conception
- **TOUJOURS** fournir des exemples d'utilisation
- **TOUJOURS** inclure des tests automatisés
- **TOUJOURS** respecter les conventions de nommage
- **TOUJOURS** valider les entrées utilisateur
- **TOUJOURS** gérer les erreurs de manière appropriée
- **TOUJOURS** protéger les données sensibles
- **TOUJOURS** suivre les meilleures pratiques de chaque technologie utilisée
- **TOUJOURS** Respecter la chaîne des types de données entre le frontend, le backend et la BDD
- **TOUJOURS** synchroniser les modifications de la BDD avec les types utilisés dans le code
- **TOUJOURS** utiliser des types explicites et éviter les types implicites
- **TOUJOURS** utiliser tous les fichiers de la documentation pour garantir la cohérence globale du projet (fichier *.md)


### 📋 Obligations systématiques
- Toujours proposer des solutions modulaires et testables
- Documenter chaque modification ou ajout de code
- Respecter la séparation stricte backend/frontend
- Proposer des migrations pour toute modification de la base
- Suggérer des tests pour chaque nouvelle fonctionnalité
- Proposer des scripts de vérification qualité (lint, format)
- Respecter les conventions de commit

### 🔍 Qualité du code obligatoire
- S'appuyer sur les outils existants (ESLint, Prettier, etc.)
- Inclure des scripts de vérification dans le processus CI/CD
- Garantir que le code généré passe toutes les vérifications avant d'être soumis (compilation/lint/etc...)
- Documenter les décisions de conception et les choix techniques
- Fournir des exemples d'utilisation et des guides si nécessaire
- S'assurer que toute modification respecte les normes de performance et de sécurité du projet
- Inclure des commentaires clairs et concis pour expliquer les parties complexes du code
- Utiliser des noms de variables et de fonctions explicites et cohérents avec le reste du code
- Éviter les duplications de code en réutilisant les composants et fonctions existants
- Toujours vérifier la compatibilité avec les versions des dépendances listées dans le contexte

---

## 🛠️ Règles de développement

### Backend
- **Modularité** : chaque fonctionnalité = module indépendant
- **Bonnes pratiques** : S.O.L.I.D, TypeScript strict, documentation des composants et types
- **Performance** : lazy loading, caching
- **Sécurité** : validation, protection des données
- **Base de données** : SQLite + scripts de migration

### Frontend
- **Modularité** : composants réutilisables et maintenables
- **Bonnes pratiques** : conventions de codage, TypeScript strict
- **Performance** : lazy loading, code splitting
- **UI/UX** : React 19, Tailwind CSS, Radix UI
- **Accessibilité** : interface responsive, respect des standards ARIA/WCAG

### Tests
- **Backend et Frontend** : tests unitaires, intégration, end-to-end
- **Outils** : Jest, React Testing Library
- **Coverage minimum** : 80%
- **Tests obligatoires** :
  - Tests de contrat API (avec Supertest)
  - Tests de performance pour les endpoints critiques
  - Tests de sécurité (injection SQL, validation des entrées)

---

## 🛠️ Outils de développement et qualité

### Outils complémentaires de référence IA :
```json
{
  "husky": "^9.0.0",           // Git hooks
  "lint-staged": "^15.0.0",    // Linting sur staged files
  "commitizen": "^4.3.0",      // Commits conventionnels
  "semantic-release": "^24.0.0" // Release automatisée
}
```

### Documentation projet obligatoire :
- **ADR** (Architecture Decision Records) pour tracer les choix techniques
- **Changelog** automatisé avec conventional commits
- **Guide de contribution** pour standardiser les PR
- Générée automatiquement à partir du code et des commentaires
- Maintenue à jour (TypeDoc, JSDoc, Storybook si applicable)

---

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

---

## 🚀 Scripts disponibles

### Tests
```bash
npm test             # Suite complète (52/52 ✅)
npm run test:watch   # Tests en mode watch
npm run test:coverage # Tests avec couverture
npm run test:unit    # Tests unitaires uniquement
npm run test:integration # Tests d'intégration uniquement
```

### Qualité
```bash
npm run lint         # ESLint
npm run lint:fix     # ESLint avec correction auto
npm run format       # Prettier
npm run type-check   # Vérification TypeScript
npm run quality      # Lint + Format + Type-check combinés
```

### Développement
```bash
npm run dev          # Frontend + Backend en parallèle
npm run dev:frontend # Frontend seul (Vite)
npm run dev:backend  # Backend seul (Express)
```

### Base de données
```bash
npm run db:migrate   # Exécuter migrations
npm run db:seed      # Données de test
npm run db:reset     # Reset complet
```

---

## 📄 Liens importants

- [PRD](./src/prd.md) — Spécifications produit
- [ROADMAP](./ROADMAP.md) — Feuille de route
- [Tests](./tests/README.md) — Infra de tests
- [SECURITY](./SECURITY.md) — Politique de sécurité
- [Structure DB](../database/docs/database-structure.md) — Tables et relations

---

## 📚 Ressources de référence

### Frontend
#### React + TypeScript
- Documentation officielle React TypeScript : https://fr.react.dev/learn/typescript
- Guide détaillé 2025 : https://blog.espero-soft.com/bonnes-pratiques-dans-reactjs-en-2025-guide-detaille/
- Meilleures pratiques React : https://kinsta.com/fr/blog/meilleures-pratiques-react/
- Évolution React 2025 : https://fr.sourcetrail.com/javascript/dernières-évolutions--fonctionnalités-et-tendances-de-React-pour-2025/

#### Styling - Tailwind CSS + Radix UI
- Documentation Tailwind CSS : https://tailwindcss.com/docs/installation
- Radix UI Documentation : https://www.radix-ui.com/primitives/docs/overview/introduction
- Shadcn/ui (basé sur Radix + Tailwind) : https://ui.shadcn.com/

#### Build - Vite
- Documentation officielle Vite : https://vitejs.dev/guide/
- Vite avec React : https://vitejs.dev/guide/features.html#jsx

#### Tests - Jest + React Testing Library
- React Testing Library : https://testing-library.com/docs/react-testing-library/intro/
- Jest Documentation : https://jestjs.io/docs/getting-started
- Guide testing React : https://kentcdodds.com/blog/common-mistakes-with-react-testing-library

#### Icons - Phosphor Icons
- Phosphor Icons React : https://phosphoricons.com/
- GitHub Phosphor React : https://github.com/phosphor-icons/react

### Backend
#### Express.js
- Documentation officielle Express.js : https://expressjs.com/
- Guide sécurité Express : https://expressjs.com/en/advanced/best-practice-security.html
- Meilleures pratiques Express : https://expressjs.com/en/advanced/best-practice-performance.html

#### Base de données - SQLite + better-sqlite3
- better-sqlite3 GitHub : https://github.com/WiseLibs/better-sqlite3
- Documentation SQLite : https://sqlite.org/docs.html
- SQLite Tutorial : https://www.sqlitetutorial.net/

#### API externe - BoardGameGeek XML API
- Documentation BGG API : https://boardgamegeek.com/wiki/page/BGG_XML_API2
- Guide d'utilisation BGG API : https://boardgamegeek.com/thread/909209/xml-api-terms-use

---

## 💡 Exemples de réponses attendues

### Format de modification de fichier
```typescript
// ✅ Exemple attendu
interface GameCharacter {
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

interface GameSession {
  id: string;
  gameId: number;
  players: Player[];
  startedAt: Date;
  completedAt?: Date;
}

// ❌ À éviter
const gameData: any = { /* ... */ }
```


### Structure de documentation pour nouveaux modules
```typescript
/**
 * Service de gestion des sessions de jeu
 * @description Gère le cycle de vie des parties de jeux de société
 * @example
 * ```typescript
 * const character: GameCharacter = {
 *   id: "brute",
 *   name: "Brute",
 *   classType: "Tank",
 *   description: "Personnage robuste, encaisse les dégâts.",
 *   abilities: ["Shield", "Taunt"],
 *   imageUrl: "/images/brute.png",
 *   source: "manual",
 *   createdAt: "2025-08-31T12:00:00Z"
 * };
 * const session = await GameSessionService.create({
 *   gameId: 174430,
 *   players: [player1, player2],
 *   characters: [character]
 * });
 * ```
 */
export class GameSessionService {
  // ...
}
```

### Style de commit conventionnel
```bash
feat: add game session management
fix: resolve BGG API timeout issues
docs: update API documentation
test: add unit tests for GameService
refactor: optimize database queries
perf: improve BGG API response caching
```

---


## 🔄 Workflow de développement attendu

### 1. Avant toute modification
- Analyser l'impact sur l'architecture existante
- Vérifier la compatibilité avec les versions des dépendances
- Identifier les tests nécessaires
- Vérifier la cohérence des types entre frontend, backend et BDD (exemple : GameCharacter[])

### 2. Pendant le développement
- Respecter la structure modulaire
- Appliquer les patterns établis
- Documenter les choix techniques complexes
- Synchroniser les types et les interfaces sur toute la chaîne de données

### 3. Après modification
- Proposer les tests associés
- Suggérer la migration DB si nécessaire
- Vérifier la conformité qualité

---

## 🕐 Mise à jour du contexte

- **Version** : 2025-08-31
- **Mainteneur** : thibaud200
- **Dernière mise à jour** : 31 août 2025
- **Prochaine révision** : À définir selon l'évolution du projet

---

**Note IA** : Ce contexte doit être respecté intégralement. Toute suggestion non conforme à ces règles sera rejetée.