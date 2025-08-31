# 🎲 Board Game Score Tracker

> Système complet de suivi de parties de jeux de société — **architecture moderne, séparation stricte backend/frontend, bonnes pratiques S.O.L.I.D, CRUD, migrations, tests, documentation.**

## 📁 Structure du projet
```bash
board-game-scorekeep/ 
├── backend/ # API Express, base SQLite, migrations, scripts 
├── frontend/ # Application React/Vite, UI, services 
├── database/ # Fichiers DB, docs structure 
├── tests/ # Tests unitaires et intégration 
├── docs/ # Documentation technique 
├── README.md # Vue d'ensemble, installation, workflow
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
- Node.js 18+
- npm ou yarn

### Étapes
1. **Cloner le repo**
   ```bash
   git clone https://github.com/thibaud200/board-game-scorekeep.git
   cd board-game-scorekeep

   2. **Installer les dépendances
   cd backend && npm install
   cd ../frontend && npm install

   3. **Démarrer le backend
   cd backend
   npm run dev
   # API sur http://localhost:3001
   
   4. **Démarrer le frontend
   cd ../frontend
   npm run dev
   
   5. **Lancer les tests
   cd tests
   npm install
   npm test

   🏗️ Workflow recommandé
Développement : Modifier séparément backend et frontend, utiliser API REST pour communication.
Migrations : Scripts dans backend/database/migrations/.
Tests : Unités et intégration dans tests/.
Documentation : Compléter/mettre à jour dans docs/.
🔗 Liens utiles
Backend README
Frontend README
Structure DB
🛠️ Bonnes pratiques
Séparation stricte backend/frontend
Respect S.O.L.I.D, CRUD, validation
Documentation à jour
Tests automatisés
© 2025 thibaud200
