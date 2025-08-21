# 🧪 Tests - Board Game Score Tracker

Ce document décrit la stratégie de tests et la structure de test du projet.

## 📁 Structure des Tests

```
tests/
├── unit/                           # Tests unitaires
│   ├── technical/                  # Tests techniques (services, utils, hooks)
│   │   ├── BGGService.test.ts      # Tests du service BoardGameGeek
│   │   ├── database-hooks.test.ts  # Tests des hooks de base de données
│   │   └── utils.test.ts           # Tests des utilitaires
│   └── functional/                 # Tests fonctionnels (composants, UI)
│       ├── BGGGameSearch.test.tsx  # Tests du composant de recherche BGG
│       ├── GameTemplateSection.test.tsx # Tests de création de templates
│       └── Dashboard.test.tsx      # Tests du dashboard
├── integration/                    # Tests d'intégration
│   ├── bgg-workflow.test.tsx       # Tests du workflow BGG complet
│   └── game-session.test.tsx       # Tests des sessions de jeu
├── e2e/                           # Tests end-to-end (à implémenter)
├── fixtures/                      # Données de test
│   └── bgg-data.ts               # Fixtures BGG réalistes
├── mocks/                        # Mocks réutilisables
│   └── index.ts                  # Mocks des services et composants
└── setup.ts                     # Configuration globale des tests
```

## 🎯 Stratégie de Tests

### Tests Unitaires Techniques
**Objectif** : Tester la logique métier, les services et les utilitaires de façon isolée.

- **BGGService.test.ts** : Tests du service BoardGameGeek
  - Parsing XML → JSON
  - Gestion d'erreurs API
  - Rate limiting
  - Cas limites (données manquantes, caractères spéciaux)

- **database-hooks.test.ts** : Tests des hooks de base de données
  - Opérations CRUD
  - Gestion d'état
  - Gestion d'erreurs
  - Validation des données

### Tests Unitaires Fonctionnels
**Objectif** : Tester les composants React et l'interface utilisateur.

- **BGGGameSearch.test.tsx** : Tests du composant de recherche
  - Interface utilisateur
  - Debouncing des recherches
  - Sélection et import de jeux
  - Gestion d'erreurs

- **GameTemplateSection.test.tsx** : Tests de création de templates
  - Formulaires de création/édition
  - Intégration BGG
  - Validation des champs
  - Gestion des modes de jeu

### Tests d'Intégration
**Objectif** : Tester les workflows complets entre composants.

- **bgg-workflow.test.tsx** : Tests du workflow BGG
  - Recherche → Sélection → Import → Sauvegarde
  - Analyse intelligente des modes
  - Extraction de données BGG
  - Persistence et état

## 🚀 Commandes de Tests

```bash
# Lancer tous les tests
npm test

# Tests en mode watch
npm run test:watch

# Tests avec couverture
npm run test:coverage

# Tests par catégorie
npm run test:unit          # Tests unitaires
npm run test:technical     # Tests techniques seulement
npm run test:functional    # Tests fonctionnels seulement
npm run test:integration   # Tests d'intégration
npm run test:e2e          # Tests end-to-end
```

## 📊 Objectifs de Couverture

| Type | Seuil | Description |
|------|-------|-------------|
| **Branches** | 80% | Couverture des branches conditionnelles |
| **Functions** | 80% | Couverture des fonctions |
| **Lines** | 80% | Couverture des lignes de code |
| **Statements** | 80% | Couverture des instructions |

## 🛠️ Configuration

### Jest Configuration (`jest.config.js`)
- Environment : `jsdom` pour les tests React
- Setup : `tests/setup.ts` pour la configuration globale
- Mocks : Configuration automatique des modules externes
- Coverage : Seuils définis pour maintenir la qualité

### TypeScript Support
- Compilation TypeScript via `ts-jest`
- Paths aliases (`@/`) configurés
- Types Jest étendus pour les matchers personnalisés

## 📋 Données de Test

### Fixtures BGG Réalistes
Les fixtures utilisent de vraies données BGG pour assurer la cohérence :

- **Gloomhaven** : Jeu coopératif/campagne avec personnages
- **Catan** : Jeu compétitif avec extensions
- **Pandemic** : Jeu coopératif avec rôles spécialisés

### Mocks Réutilisables
Mocks configurables pour :
- Service BGG (recherche, détails)
- Context de base de données
- Fetch API
- Composants React

## 🔍 Cas de Tests Couverts

### Service BGG
- ✅ Parsing XML valide
- ✅ Gestion XML malformé
- ✅ Erreurs réseau
- ✅ Timeouts
- ✅ Caractères spéciaux
- ✅ Données manquantes
- ✅ Rate limiting

### Interface Utilisateur
- ✅ Rendu des composants
- ✅ Interactions utilisateur
- ✅ Validation des formulaires
- ✅ Gestion des erreurs UI
- ✅ States de chargement
- ✅ Navigation

### Workflow BGG
- ✅ Recherche → Import complet
- ✅ Analyse intelligente des modes
- ✅ Extraction personnages/extensions
- ✅ Persistence des données
- ✅ Gestion des erreurs API

## 📈 Métriques et Qualité

### Coverage Reports
Les rapports de couverture sont générés dans `coverage/` et incluent :
- HTML Report : `coverage/lcov-report/index.html`
- LCOV : `coverage/lcov.info`
- JSON : `coverage/coverage-final.json`

### CI/CD Integration
Les tests sont intégrés dans le pipeline de développement :
- Tests automatiques sur chaque commit
- Blocage des PRs si couverture < seuils
- Tests de régression automatisés

## 🐛 Debugging des Tests

### Logs de Debug
Les tests incluent des logs de debug pour faciliter le diagnostic :
```typescript
console.log('BGG Search: Starting search for:', query)
console.log('BGG Search: Results received:', results)
```

### Isolation des Tests
Chaque test est isolé avec :
- `beforeEach()` pour nettoyer les mocks
- `afterEach()` pour restaurer l'état
- Mocks spécifiques par suite de tests

### Timeouts Étendus
Les tests d'intégration utilisent des timeouts étendus pour les workflows complexes :
```typescript
it('should complete workflow', async () => {
  // Test logic
}, 10000) // 10 secondes
```

## 🔄 Maintenance des Tests

### Mise à Jour des Fixtures
Les fixtures BGG doivent être mises à jour si :
- L'API BGG change de format
- De nouveaux champs sont ajoutés
- Les données de test deviennent obsolètes

### Révision des Mocks
Les mocks doivent être révisés lors de :
- Changements d'interface des services
- Nouvelles fonctionnalités
- Modifications de l'architecture

### Nettoyage Régulier
- Suppression des tests obsolètes
- Factorisation des helpers communs
- Optimisation des performances de tests
