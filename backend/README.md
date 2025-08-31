# Backend

API Express, base de données SQLite, scripts de migration, routes, modèles, contrôleurs.

## Démarrage

```bash
cd backend
npm install
npm run dev
```

## Structure

## 🔗 Synchronisation des types

La cohérence des types de données entre le backend, le frontend et la base de données est essentielle. Utilisez l'interface `GameCharacter` pour le champ `characters` dans les templates de jeux.

Exemple d'utilisation côté backend :
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

