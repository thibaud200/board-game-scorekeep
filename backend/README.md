# 🚀 Backend - Board Game Score Tracker

> **Serveur Express minimal** servant principalement de proxy pour l'API BoardGameGeek et bypass CORS. L'application fonctionne principalement côté client avec SQLite.

## 🎯 **Rôle du Backend**

### 🌐 **Proxy BGG** (Principal)
- **Contournement CORS** : Proxy pour API XML BoardGameGeek
- **Headers appropriés** : User-Agent et gestion des réponses XML
- **Gestion d'erreurs** : Retry et timeout pour requêtes BGG
- **Logs structurés** : Monitoring des requêtes API

### 🗄️ **Architecture Simplifiée**
- **Client-side first** : La majorité de la logique est dans le frontend
- **SQLite local** : Base de données directement dans le frontend avec better-sqlite3
- **Stateless** : Serveur sans état, pas de session ou authentification
- **Optionnel** : L'application peut fonctionner sans le backend pour la plupart des fonctionnalités

## 🚀 **Démarrage Rapide**

```bash
# Installation et lancement
cd backend
npm install
npm run dev
# ➡️ Serveur sur http://localhost:3001
```

### ⚙️ **Configuration**
```javascript
// server.js - Configuration principale
const PORT = process.env.PORT || 3001
const BGG_API_BASE = 'https://boardgamegeek.com/xmlapi2'

// Proxy BGG avec CORS
app.use('/api/bgg/*', bggProxyMiddleware)
```

## 📁 **Structure Minimale**

```
backend/
├── src/
│   ├── server.js          # Serveur Express principal
│   └── lib/
│       └── logger.ts      # Système de logs
├── database/              # Documentation et scripts (optionnels)
│   ├── docs/             # Documentation structure DB
│   └── migrations/       # Scripts de migration legacy
├── package.json
└── README.md
```

## 🌐 **Routes API**

### 🔍 **Proxy BGG** (`/api/bgg/*`)
```javascript
// Exemples d'utilisation
GET /api/bgg/search?query=Citadels&type=boardgame
GET /api/bgg/thing?id=478&stats=1

// Réponse : XML direct de BoardGameGeek
Content-Type: application/xml
```

**Fonctionnalités** :
- ✅ Contournement CORS automatique
- ✅ Headers User-Agent appropriés
- ✅ Gestion d'erreurs et status codes
- ✅ Logs détaillés des requêtes
- ✅ Support de tous les endpoints BGG

### 📊 **Endpoints Disponibles**
```bash
# Recherche de jeux
curl "http://localhost:3001/api/bgg/search?query=Gloomhaven&type=boardgame"

# Détails d'un jeu
curl "http://localhost:3001/api/bgg/thing?id=174430&stats=1"

# Status du serveur
curl "http://localhost:3001/health"
```

## 🛠️ **Développement**

### 📦 **Technologies**
- **Express 5** : Serveur web minimal
- **CORS** : Gestion des en-têtes cross-origin
- **Node.js 18+** : Runtime moderne
- **Logger custom** : Système de logs structurés

### ⚡ **Scripts Disponibles**
```bash
npm run dev        # Développement avec nodemon
npm start          # Production
npm run lint       # ESLint (si configuré)
npm test           # Tests (si implémentés)
```

### 🔧 **Variables d'Environnement**
```bash
# .env (optionnel)
PORT=3001                    # Port du serveur
NODE_ENV=development         # Environnement
BGG_API_TIMEOUT=10000       # Timeout requêtes BGG (ms)
LOG_LEVEL=debug             # Niveau de logs
```

## 📈 **Monitoring & Logs**

### 📊 **Logs Structurés**
```javascript
// Exemples de logs
logger.debug('BGG Proxy Request: https://boardgamegeek.com/xmlapi2/search?query=Citadels')
logger.debug('BGG Response (first 200 chars): <?xml version="1.0" encoding="UTF-8"?>')
logger.error('BGG API Error: 503 Service Unavailable')
```

### 🔍 **Debugging**
```bash
# Mode debug avec logs détaillés
DEBUG=* npm run dev

# Vérification du proxy
curl -v "http://localhost:3001/api/bgg/search?query=test"
```

## 🚀 **Déploiement**

### 🐳 **Docker** (Optionnel)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY src/ ./src/
EXPOSE 3001
CMD ["npm", "start"]
```

### ☁️ **Cloud Deploy**
```bash
# Heroku
git subtree push --prefix backend heroku main

# Vercel (avec vercel.json)
npx vercel --prod

# Railway
railway login && railway deploy
```

### 🔧 **Variables Production**
```bash
PORT=3001
NODE_ENV=production
BGG_API_TIMEOUT=15000
LOG_LEVEL=info
```

## 🧪 **Tests & Validation**

### ✅ **Tests Manuels**
```bash
# Test proxy BGG fonctionnel
curl "http://localhost:3001/api/bgg/search?query=Citadels" | head -c 200

# Test gestion d'erreurs  
curl "http://localhost:3001/api/bgg/invalid-endpoint"

# Test CORS headers
curl -H "Origin: http://localhost:5173" "http://localhost:3001/api/bgg/search?query=test"
```

### 🛠️ **Tests Automatisés** (Futures)
```javascript
// Exemples de tests à implémenter
describe('BGG Proxy', () => {
  it('should proxy BGG requests correctly')
  it('should handle CORS properly')
  it('should return XML responses')
  it('should handle API errors gracefully')
})
```

## 🔮 **Évolutions Futures**

### Phase 1 : Optimisations
- [ ] **Cache Redis** : Cache des réponses BGG fréquentes
- [ ] **Rate limiting** : Protection contre les abus API
- [ ] **Compression** : Gzip pour réponses volumineuses
- [ ] **Health checks** : Monitoring uptime et performance

### Phase 2 : Fonctionnalités Avancées
- [ ] **WebSocket** : Real-time pour parties collaboratives
- [ ] **API REST** : Endpoints pour synchronisation multi-device
- [ ] **Authentification** : JWT pour fonctionnalités premium
- [ ] **Database API** : Endpoints pour backup/restore centralisé

---

**📅 Dernière mise à jour** : Décembre 2025  
**🎯 Statut** : ✅ Fonctionnel - Proxy BGG opérationnel  
**🔧 Complexité** : Minimal - Serveur simple et efficace
