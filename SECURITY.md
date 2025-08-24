# Security Policy

## Supported Versions

We actively support the following versions of Board Game Score Tracker with security updates:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

If you discover a security vulnerability in Board Game Score Tracker, please report it to us as soon as possible.

### How to Report

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, please send an email to: **thibaud200@[domain]** with:

1. **Description** of the vulnerability
2. **Steps to reproduce** the issue
3. **Potential impact** and affected components
4. **Suggested fix** (if you have one)

### What to Include

Please include as much information as possible:

- **Type of issue** (e.g., XSS, SQL injection, data exposure)
- **Affected components** (frontend, backend, database)
- **Source files** related to the vulnerability
- **Proof-of-concept** or exploit code (if applicable)
- **Impact assessment** and potential attack scenarios

## Security Considerations

Board Game Score Tracker handles:

- **Local SQLite database** - No remote data transmission
- **BoardGameGeek API integration** - Read-only operations
- **Client-side data storage** - Browser localStorage/IndexedDB
- **Express.js backend** - Local API server

### Current Security Measures


### Current Security Measures

- ✅ **Input validation** with express-validator (backend API)
	- Toutes les routes POST/PUT utilisent express-validator pour vérifier et nettoyer les entrées utilisateur.
- ✅ **SQL injection prevention** with parameterized queries
	- Toutes les requêtes SQL utilisent des paramètres (jamais de concaténation directe).
- ✅ **Database indexing**
	- Index ajoutés sur les colonnes de recherche fréquente pour limiter les attaques par scan et améliorer la performance.
- ✅ **Migration scripts**
	- Les scripts de migration sont stockés dans `database/migrations` et doivent être appliqués manuellement pour garantir la cohérence du schéma.
- ✅ **SQLite best practices**
	- Ajout de colonnes via ALTER TABLE uniquement si la table existe, et une colonne à la fois.
- ✅ **CORS protection** for API endpoints
- ✅ **XSS protection** through React's built-in escaping
- ✅ **Local-only operation** - No external data storage

## Response Timeline

- **Initial response**: Within 48 hours
- **Status update**: Within 7 days
- **Fix timeline**: Depends on severity (1-30 days)

Thank you for helping keep Board Game Score Tracker secure! 🔒
