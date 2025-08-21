# 🎲 Board Game Score Tracker

> *Un système complet de suivi de parties de jeux de société avec gestion multi-modes*

[![TypeScript](https://img.shields.io/badge/TypeScript-100%25-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.0-61dafb.svg)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38b2ac.svg)](https://tailwindcss.com/)
[![SQLite](https://img.shields.io/badge/SQLite-3.x-003b57.svg)](https://www.sqlite.org/)

## 🎯 Vue d'ensemble

Board Game Score Tracker est une application web moderne et intuitive pour gérer vos sessions de jeux de société. Elle offre un suivi complet des parties avec support multi-modes (coopératif, compétitif, campagne), gestion avancée des personnages, et statistiques détaillées.

### ✨ Fonctionnalités principales

- 🎮 **Multi-modes de jeu** : Support coopératif, compétitif et campagne
- 👥 **Gestion des personnages** : Suivi des personnages avec historique complet
- 📊 **Statistiques avancées** : Analytics détaillées par joueur et par jeu
- 🛡️ **Validation robuste** : Prévention proactive des erreurs de saisie
- 📱 **Design responsive** : Interface adaptative mobile-first
- 🗄️ **Base de données** : Persistance locale SQLite avec migrations automatiques

## 🚀 Installation rapide

### Prérequis
- Node.js 18+ 
- npm ou yarn

### Étapes d'installation

1. **Cloner le repository**
```bash
git clone https://github.com/thibaud200/board-game-scorekeep.git
cd board-game-scorekeep
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Lancer l'application**
```bash
npm start
```

4. **Ouvrir votre navigateur**
```
http://localhost:5173  # Frontend (Vite)
http://localhost:3001  # Backend (Express)
```

L'application est prête ! 🎉

## 🏗️ Architecture technique

### Stack technologique

| Composant | Technologie | Version |
|-----------|------------|---------|
| **Frontend** | React + TypeScript | 19.0 |
| **Styling** | Tailwind CSS + Radix UI | 3.4 |
| **Backend** | Express.js | 4.x |
| **Base de données** | SQLite + better-sqlite3 | 3.x |
| **Build** | Vite | 6.x |
| **Icons** | Phosphor Icons React | 2.x |

### Structure du projet

```
src/
├── components/
│   ├── game/                   # 🎮 Gestion des jeux
│   │   ├── ActiveGame.tsx      # Partie en cours
│   │   ├── GameSetup.tsx       # Configuration
│   │   └── GameTemplates.tsx   # Templates
│   ├── player/                 # 👥 Gestion des joueurs
│   │   ├── PlayerManager.tsx   # CRUD joueurs
│   │   └── PlayerStats.tsx     # Statistiques
│   └── ui/                     # 🎨 Composants UI (Radix)
├── lib/
│   ├── database-context.tsx    # Context React
│   ├── database-hooks.ts       # Hooks personnalisés
│   └── server-database.ts      # API serveur
└── hooks/
    └── use-mobile.ts           # Responsive hooks
```

## 🎮 Guide d'utilisation

### 1. Créer des templates de jeux

1. Accédez à la section **Game Templates**
2. Cliquez sur **Add Template**
3. Configurez :
   - ✅ **Nom du jeu** (obligatoire)
   - 🎭 **Personnages** (optionnel)
   - 📦 **Extensions** (optionnel)
   - 🎯 **Modes supportés** (au moins un requis)

### 2. Gérer les joueurs

1. Allez dans **Players**
2. Ajoutez les joueurs de votre groupe
3. Consultez leurs statistiques individuelles

### 3. Lancer une partie

1. Cliquez sur **Start New Game**
2. Sélectionnez :
   - ✅ **Jeu** (obligatoire)
   - ✅ **Joueurs** (min. 2 requis)
   - 🎭 **Personnages** (si applicable)
3. Lancez la partie !

### 4. Pendant la partie

- 📊 **Scores en temps réel** : Modifiez les scores facilement
- 💀 **Gestion des personnages** : Mort, résurrection, remplacement
- ⏱️ **Durée** : Suivez le temps de jeu

### 5. Finaliser la partie

1. Saisissez la ✅ **durée** (obligatoire)
2. Pour les parties coopératives : Sélectionnez victoire/défaite
3. Complétez la partie pour sauvegarder

## 📊 Fonctionnalités avancées

### Validation et UX

L'application inclut un système de validation complet :

- 🔴 **Astérisque rouge (*)** : Champs obligatoires
- 🚫 **Bordures rouges** : Champs invalides  
- ✅ **Messages contextuels** : Aide en temps réel
- 🔒 **Boutons intelligents** : Désactivés si validation échoue

### Multi-modes de jeu

- **🤝 Coopératif** : Tous contre le jeu (victoire/défaite)
- **⚔️ Compétitif** : Joueurs les uns contre les autres (scores)
- **📖 Campagne** : Séries de scénarios liés (futur)

### Gestion des personnages

- Attribution de personnages uniques par session
- Suivi des événements (mort, résurrection, remplacement)
- Historique complet des actions

## 📈 Statistiques disponibles

- 🏆 **Par joueur** : Victoires, défaites, scores moyens
- 🎮 **Par jeu** : Nombre de parties, durée moyenne
- 📊 **Globales** : Tendances et comparaisons
- 💀 **Personnages** : Historique des événements

## 🔧 Scripts disponibles

```bash
# Développement
npm run dev          # Lance le frontend (Vite)
npm run server       # Lance le backend (Express)
npm start            # Lance frontend + backend

# Build
npm run build        # Build de production
npm run preview      # Aperçu du build

# Qualité
npm run lint         # ESLint
npm run type-check   # Vérification TypeScript
```

## 🛠️ Développement

### Contribution

1. Fork le projet
2. Créez une branche feature (`git checkout -b feature/AmazingFeature`)
3. Committez vos changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

### Structure de la base de données

La base SQLite contient les tables principales :
- `players` : Joueurs enregistrés
- `game_sessions` : Sessions de jeu complétées
- `game_templates` : Templates de jeux configurés
- `current_game` : État de la partie en cours

## 🗺️ Roadmap

Consultez [ROADMAP.md](./ROADMAP.md) pour les fonctionnalités futures :

- **Phase 1** : Système de victoire compétitif avancé
- **Phase 2** : Personnages par jeu avec sélection automatique
- **Phase 3** : Mode campagne multi-scénarios  
- **Phase 4** : Intégration APIs externes (BoardGameGeek)

## 📄 Documentation

- 📋 **[PRD](./src/prd.md)** : Spécifications complètes du produit
- 🗺️ **[ROADMAP](./ROADMAP.md)** : Feuille de route des développements
- 🛡️ **[SECURITY](./SECURITY.md)** : Politique de sécurité

## 📞 Support

- 🐛 **Issues** : [GitHub Issues](https://github.com/thibaud200/board-game-scorekeep/issues)
- 💬 **Discussions** : [GitHub Discussions](https://github.com/thibaud200/board-game-scorekeep/discussions)

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

---

<div align="center">

**🎲 Fait avec ❤️ pour la communauté des joueurs de société**

*Board Game Score Tracker - Parce que chaque partie compte !*

</div>
