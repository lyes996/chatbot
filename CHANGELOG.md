# Changelog - Confluence Chatbot

## Version 2.0.0 - Migration vers OpenAI (2025-11-05)

### 🚀 Changements majeurs

#### Remplacement d'Ollama par OpenAI
- **Raison** : Ollama nécessite un serveur local et n'est pas compatible avec les plateformes serverless comme Vercel
- **Solution** : Migration vers OpenAI API pour les embeddings et la génération de réponses
- **Avantages** :
  - ✅ Compatible avec Vercel (serverless)
  - ✅ Pas besoin de serveur local
  - ✅ Meilleure qualité de réponses
  - ✅ Déploiement simplifié
  - ✅ Scalabilité automatique

### 📝 Fichiers modifiés

#### Nouveaux fichiers
- `lib/ai.ts` - Intégration OpenAI (remplace `lib/ollama.ts`)
- `DEPLOYMENT_GUIDE.md` - Guide complet de déploiement
- `VERCEL_SETUP.md` - Configuration rapide pour Vercel
- `QUICK_START.md` - Guide de démarrage rapide (15 min)
- `CHANGELOG.md` - Ce fichier
- `vercel.json` - Configuration Vercel
- `scripts/check-env.js` - Vérification des variables d'environnement

#### Fichiers modifiés
- `lib/rag.ts` - Import mis à jour (ollama → ai)
- `app/api/chat/route.ts` - Import mis à jour
- `app/api/health/route.ts` - Vérification OpenAI au lieu d'Ollama
- `scripts/ingest-confluence.js` - Utilisation d'OpenAI pour les embeddings
- `scripts/setup-database.js` - Dimension des vecteurs : 4096 → 1536 (OpenAI)
- `package.json` - Dépendance : `ollama` → `openai`
- `.env.example` - Variables OpenAI au lieu d'Ollama
- `README.md` - Documentation mise à jour

#### Fichiers supprimés
- `lib/ollama.ts` - Remplacé par `lib/ai.ts`

### 🔧 Changements techniques

#### Embeddings
- **Avant** : Ollama avec dimension 4096
- **Après** : OpenAI `text-embedding-3-small` avec dimension 1536
- **Impact** : Base de données mise à jour pour supporter vector(1536)

#### Modèles de chat
- **Avant** : llama2, mistral, mixtral (local)
- **Après** : gpt-3.5-turbo, gpt-4, gpt-4-turbo (cloud)
- **Configuration** : Variable `OPENAI_MODEL` dans `.env`

#### Variables d'environnement

**Supprimées** :
```
OLLAMA_BASE_URL
OLLAMA_MODEL
```

**Ajoutées** :
```
OPENAI_API_KEY
OPENAI_MODEL
```

### 📊 Comparaison

| Aspect | Ollama (v1) | OpenAI (v2) |
|--------|-------------|-------------|
| Hébergement | Local | Cloud |
| Vercel | ❌ Non compatible | ✅ Compatible |
| Setup | Complexe | Simple |
| Coût | Gratuit | ~$1-5/mois |
| Qualité | Bonne | Excellente |
| Latence | Variable | Stable |
| Scalabilité | Limitée | Illimitée |

### 🎯 Migration

Pour migrer d'une installation existante :

1. **Mettre à jour les dépendances** :
   ```bash
   npm install
   ```

2. **Mettre à jour `.env`** :
   ```bash
   # Supprimer
   OLLAMA_BASE_URL=...
   OLLAMA_MODEL=...
   
   # Ajouter
   OPENAI_API_KEY=sk-...
   OPENAI_MODEL=gpt-3.5-turbo
   ```

3. **Recréer la base de données Supabase** :
   - Exécuter le nouveau SQL (vector(1536) au lieu de vector(4096))
   - Voir `DEPLOYMENT_GUIDE.md` pour le SQL complet

4. **Réingérer les données** :
   ```bash
   npm run ingest
   ```

5. **Redéployer sur Vercel** :
   - Mettre à jour les variables d'environnement
   - Redéployer

### ⚠️ Breaking Changes

- Les embeddings existants ne sont **pas compatibles** (dimension différente)
- Nécessite une **réingestion complète** des données
- Les variables d'environnement ont changé
- Nécessite une **clé API OpenAI** (payante)

### 🐛 Corrections

- Gestion d'erreur améliorée pour les variables d'environnement manquantes
- Validation des credentials avant l'ingestion
- Messages d'erreur plus clairs

### 📚 Documentation

- Guide de déploiement complet ajouté
- Guide de démarrage rapide (15 min)
- Configuration Vercel documentée
- Script de vérification des variables d'environnement

### 🔜 Prochaines étapes

- [ ] Support multi-espaces Confluence
- [ ] Cache des embeddings pour réduire les coûts
- [ ] Interface d'administration
- [ ] Métriques et analytics
- [ ] Support de fichiers attachés
- [ ] Recherche hybride (keyword + semantic)

---

## Version 1.0.0 - Version initiale (2025-11-04)

### Fonctionnalités

- Architecture RAG complète
- Intégration Confluence
- Ollama pour les embeddings et le chat
- Supabase avec pgvector
- Interface Next.js
- Streaming des réponses
- Affichage des sources

### Limitations

- Nécessite un serveur local pour Ollama
- Non compatible avec Vercel
- Setup complexe
