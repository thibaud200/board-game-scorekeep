# Frontend

Application React/Vite, composants, pages, styles, logique client.

## Démarrage

```bash
cd frontend
npm install
- `/components` : Composants React
- `/pages` : Pages principales
- `/styles` : Fichiers CSS
- `/lib` : Logique utilitaire
- `/public` : Fichiers statiques

#### 🛠️ Outils de développement et qualité
Outils complémentaires recommandés pour le frontend :
```json
{
  "husky": "^9.0.0",           // Git hooks

## 🔗 Synchronisation des types

La cohérence des types de données entre le frontend, le backend et la base de données est essentielle. Utilisez l'interface `GameCharacter` pour le champ `characters` dans les templates de jeux.

Exemple d'utilisation côté frontend :
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
```

## 🛠️ Bonnes pratiques
- Respect S.O.L.I.D, composants réutilisables
- Séparation logique UI/services
- Documentation à jour
- Tests automatisés