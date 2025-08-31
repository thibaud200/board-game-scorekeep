# 🧪 Tests - Board Game Score Tracker

Ce document décrit la stratégie de tests et la structure de test du projet.

## 🎯 **Statut Global : 52/52 Tests ✅ (100% de réussite)**

L'infrastructure de tests est **complète et fonctionnelle** avec une couverture robuste des fonctionnalités critiques.

## 📁 Structure des Tests

```
tests/
├── unit/                           # Tests unitaires (45/45 ✅)
│   ├── technical/                  # Tests techniques (17/17 ✅)
│   │   ├── BGGService.simple.test.ts      # Service BGG (7/7 ✅)
│   │   ├── database-hooks.simple.test.ts  # Hooks DB (7/7 ✅)
│   │   └── config.test.ts                 # Configuration (3/3 ✅)
│   └── functional/                 # Tests fonctionnels (28/28 ✅)
│       ├── BGGGameSearch.test.tsx          # Recherche BGG (16/16 ✅)
│       └── GameTemplateSection.simple.test.tsx # Templates (12/12 ✅)
├── integration/                    # Tests d'intégration (7/7 ✅)
│   └── bgg-workflow.test.tsx       # Workflow BGG complet (7/7 ✅)
├── fixtures/                       # Données de test
│   └── bgg-data.ts                # Fixtures BGG réalistes
├── mocks/                         # Mocks réutilisables
│   ├── index.ts                   # Mocks services
│   ├── lucide-react.js           # Mock icônes
│   └── lucide-icon.js            # Mock icônes
└── setup.ts                      # Configuration Jest globale
```
### Exemple de test sur GameCharacter

```typescript
import { GameCharacter } from '../frontend/src/types';

describe('GameCharacter', () => {
  it('should create a valid character object', () => {
    const character: GameCharacter = {
      id: 'brute',
      name: 'Brute',
      classType: 'Tank',
      abilities: ['Shield', 'Taunt'],
      source: 'manual',
      createdAt: '2025-08-31T12:00:00Z'
    };
    expect(character.name).toBe('Brute');
    expect(character.abilities).toContain('Shield');
  });
});
```

## 🎯 Stratégie de Tests

### ✅ Tests Unitaires Techniques (17/17)
**Objectif** : Tester la logique métier, les services et les utilitaires de façon isolée.

- **BGGService.simple.test.ts** (7/7 ✅) : Service BoardGameGeek
  - ✅ Parsing XML → JSON
  - ✅ Gestion d'erreurs API
  - ✅ Cas limites (données manquantes, caractères spéciaux)
  - ✅ Mocks robustes avec données réalistes

- **database-hooks.simple.test.ts** (7/7 ✅) : Hooks de base de données
  - ✅ Opérations CRUD simulées
  - ✅ Gestion d'état et contexte
  - ✅ Validation des types DatabaseContextType
  - ✅ Compatibilité avec l'architecture actuelle

- **config.test.ts** (3/3 ✅) : Configuration système
  - ✅ Variables d'environnement
  - ✅ Configuration par défaut
  - ✅ Validation des paramètres

### ✅ Tests Unitaires Fonctionnels (28/28)
**Objectif** : Tester les composants React et l'interface utilisateur.

- **BGGGameSearch.test.tsx** (16/16 ✅) : Composant de recherche
  - ✅ Interface utilisateur française ("Rechercher un jeu sur BoardGameGeek")
  - ✅ Debouncing des recherches
  - ✅ Sélection et import de jeux ("Importer depuis BGG")
  - ✅ Gestion d'erreurs réseau
  - ✅ États de chargement et résultats

- **GameTemplateSection.simple.test.tsx** (12/12 ✅) : Gestion templates
  - ✅ Formulaires de création/édition
  - ✅ Intégration BGG workflow
  - ✅ Validation des champs obligatoires
  - ✅ Gestion des modes de jeu (coopératif/compétitif/campagne)
  - ✅ Composants Radix UI (data-state pour checkboxes)

### ✅ Tests d'Intégration (7/7)
**Objectif** : Tester les workflows complets entre composants.

- **bgg-workflow.test.tsx** (7/7 ✅) : Workflow BGG complet
  - ✅ **Navigation** : Dashboard → GameTemplateSection (cursor-pointer)
  - ✅ **Recherche** : BGG search avec texte français
  - ✅ **Import** : Détection automatique modes de jeu
  - ✅ **Extraction** : Personnages et extensions depuis BGG
  - ✅ **Sauvegarde** : Client-side database (mockDb.addGameTemplate)
  - ✅ **Persistence** : Gestion d'état pendant interactions
  - ✅ **Erreurs** : Gestion gracieuse des erreurs API BGG

## 📊 Métriques Actuelles

### Taux de Réussite : **100%** (52/52 tests ✅)

### Couverture par Composant
- ✅ **BGGService** : 7/7 tests (API BGG, parsing, erreurs)
- ✅ **Database Hooks** : 7/7 tests (CRUD operations, context)
- ✅ **GameTemplateSection** : 12/12 tests (UI components, interactions)
- ✅ **Config** : 3/3 tests (validation, configuration)
- ✅ **BGGGameSearch** : 16/16 tests (search, import, intégration BGG)
- ✅ **BGG Workflow Integration** : 7/7 tests (end-to-end scenarios)

### Temps d'Exécution
- **Tests unitaires** : ~2-3 secondes
- **Tests d'intégration** : ~5-8 secondes
- **Suite complète** : ~10-15 secondes avec setup/teardown

### Indicateurs Qualité
- 🎯 **100% Pass Rate** : Tous les tests passent systématiquement
- 🔧 **0 Compilation Errors** : Code TypeScript clean
- 🌐 **Support Multilingue** : Tests français/anglais
- ⚡ **Performance** : Exécution rapide avec mocks optimisés

## 🚀 Commandes de Tests

```bash
# Lancer tous les tests (52/52 ✅)
npm test

# Tests en mode watch
npm run test:watch

# Tests avec couverture
npm run test:coverage

# Tests par fichier spécifique
npm test -- BGGGameSearch.test.tsx
npm test -- bgg-workflow.test.tsx
npm test -- GameTemplateSection.simple.test.tsx

# Tests par pattern
npm test -- --testNamePattern="BGG"
npm test -- --testNamePattern="workflow"
```

## 📊 Métriques de Qualité Atteintes

| Métrique | Objectif | **Résultat** | Statut |
|----------|----------|------------|--------|
| **Total Tests** | >40 | **52/52** | ✅ |
| **Tests Unitaires** | >30 | **45/45** | ✅ |
| **Tests Intégration** | >5 | **7/7** | ✅ |
| **Taux de Réussite** | 100% | **100%** | ✅ |

## 🛠️ Configuration Technique

### Jest Configuration (`jest.config.js`)
- ✅ **Environment** : `jsdom` pour les tests React
- ✅ **ESM Support** : Configuration complète pour modules ES6
- ✅ **TypeScript** : Compilation via `ts-jest`
- ✅ **Setup** : `tests/setup.ts` avec mocks globaux
- ✅ **Mocks automatiques** : lucide-react, window.matchMedia
- ✅ **Paths aliases** : Support des imports `@/` et relatifs

### Architecture des Mocks
- ✅ **window.matchMedia** : Mock pour composants responsive
- ✅ **lucide-react** : Icons mockés pour tests stables
- ✅ **BGGService** : Service API mocké avec données réalistes
- ✅ **Database Context** : Mock database avec opérations CRUD
- ✅ **Fetch API** : Global fetch mock pour intégration

### Spécificités Techniques Résolues
- ✅ **Navigation tests** : Dashboard card selection via `cursor-pointer`
- ✅ **Radix UI** : Checkbox state avec `data-state="checked"`
- ✅ **Français/Anglais** : Support texte localisé dans tests
- ✅ **Async components** : `screen.findBy...` pour éléments asynchrones
- ✅ **Client-side DB** : Mock `addGameTemplate` au lieu de fetch

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

## ✅ Infrastructure de Tests Complète

L'infrastructure de tests est maintenant **100% opérationnelle** avec 52/52 tests qui passent systématiquement.

### 🎯 Objectifs Accomplis
- **Infrastructure Jest complète** : Configuration ESM + TypeScript + React
- **Mocks robustes** : BGG API, Database, window.matchMedia, lucide-react
- **Tests complets** : Unitaires, fonctionnels, intégration
- **Support multilingue** : Interface française et validation UI
- **Architecture moderne** : Client-side database, Radix UI, async patterns

### 🔄 Maintenance Continue
- Les tests sont configurés pour s'exécuter en mode watch pendant le développement
- Coverage tracking activé avec métriques qualité
- Fixtures BGG maintenues avec vraies données
- Documentation synchronisée avec le code

*Dernière mise à jour : v1.0.1 - Infrastructure de tests complète*
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
