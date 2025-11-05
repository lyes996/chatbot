# 📋 Instructions Finales - Confluence Chatbot

## ✅ Ce qui a été fait

### 1. Migration complète vers OpenAI
- ✅ Remplacement d'Ollama par OpenAI API
- ✅ Mise à jour de tous les fichiers de code
- ✅ Adaptation des scripts d'ingestion
- ✅ Configuration pour Vercel (serverless)

### 2. Documentation complète
- ✅ `QUICK_START.md` - Guide rapide (15 min)
- ✅ `DEPLOYMENT_GUIDE.md` - Guide détaillé complet
- ✅ `VERCEL_SETUP.md` - Configuration Vercel
- ✅ `CHANGELOG.md` - Historique des changements
- ✅ `README.md` - Mis à jour avec OpenAI

### 3. Outils et scripts
- ✅ `scripts/check-env.js` - Vérification des variables
- ✅ `vercel.json` - Configuration Vercel
- ✅ Build testé et fonctionnel

### 4. Commit Git
- ✅ Tous les changements committés
- ✅ Message de commit détaillé
- ✅ Prêt à être poussé sur GitHub

## 🚀 Prochaines étapes (À FAIRE)

### Étape 1 : Pousser les changements sur GitHub

```bash
# Vérifier la branche actuelle
git branch

# Si nécessaire, créer/basculer sur la bonne branche
git checkout -b feature/confluence-chatbot-rag-system-ldc

# Pousser les changements
git push origin feature/confluence-chatbot-rag-system-ldc
```

### Étape 2 : Créer un projet Supabase

1. Allez sur [https://supabase.com](https://supabase.com)
2. Cliquez sur **"Start your project"**
3. Créez un nouveau projet :
   - Nom : `confluence-chatbot`
   - Mot de passe : Choisissez un mot de passe fort
   - Région : Europe West (ou la plus proche)
4. Attendez 2-3 minutes que le projet soit créé

### Étape 3 : Configurer la base de données Supabase

1. Dans votre projet Supabase, allez dans **SQL Editor**
2. Cliquez sur **"New Query"**
3. Copiez-collez ce SQL :

```sql
-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create documents table
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  url TEXT NOT NULL UNIQUE,
  space_key TEXT,
  embedding vector(1536),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS documents_embedding_idx ON documents 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

CREATE INDEX IF NOT EXISTS documents_space_key_idx ON documents(space_key);

-- Create match function
CREATE OR REPLACE FUNCTION match_documents(
  query_embedding vector(1536),
  match_threshold float,
  match_count int
)
RETURNS TABLE (
  id uuid,
  title text,
  content text,
  url text,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    documents.id,
    documents.title,
    documents.content,
    documents.url,
    1 - (documents.embedding <=> query_embedding) as similarity
  FROM documents
  WHERE 1 - (documents.embedding <=> query_embedding) > match_threshold
  ORDER BY documents.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
```

4. Cliquez sur **"Run"**

### Étape 4 : Récupérer les clés Supabase

1. Dans Supabase, allez dans **Settings > API**
2. Notez ces 3 valeurs :
   - **Project URL** : `https://xxxxx.supabase.co`
   - **anon public** : `eyJhbGc...` (longue clé)
   - **service_role** : `eyJhbGc...` (longue clé secrète)

### Étape 5 : Obtenir une clé OpenAI

1. Allez sur [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Connectez-vous ou créez un compte
3. Cliquez sur **"Create new secret key"**
4. Nommez-la : `confluence-chatbot`
5. Copiez la clé : `sk-...`
6. **IMPORTANT** : Allez dans **Billing** et ajoutez au minimum $5 de crédits

### Étape 6 : Créer un token Confluence

1. Allez sur [https://id.atlassian.com/manage-profile/security/api-tokens](https://id.atlassian.com/manage-profile/security/api-tokens)
2. Cliquez sur **"Create API token"**
3. Nommez-le : `Chatbot RAG`
4. Copiez le token généré

### Étape 7 : Configuration locale (OPTIONNEL - pour tester)

Si vous voulez tester localement avant de déployer :

```bash
# Mettre à jour le fichier .env
nano .env

# Remplacez les valeurs placeholder par vos vraies valeurs :
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-3.5-turbo
CONFLUENCE_BASE_URL=https://clickandcare.atlassian.net/wiki
CONFLUENCE_USERNAME=lyes.cherfaoui@clickandcare.fr
CONFLUENCE_API_TOKEN=votre_token_confluence
CONFLUENCE_SPACE_KEY=Formation

# Vérifier la configuration
npm run check-env

# Ingérer les données Confluence
npm run ingest

# Tester localement
npm run dev
# Ouvrez http://localhost:3000
```

### Étape 8 : Déployer sur Vercel

1. Allez sur [https://vercel.com](https://vercel.com)
2. Connectez-vous avec GitHub
3. Cliquez sur **"Add New" > "Project"**
4. Importez le dépôt : `lyes996/chatbot`
5. Sélectionnez la branche : `feature/confluence-chatbot-rag-system-ldc`
6. Dans **Environment Variables**, ajoutez :

| Variable | Valeur |
|----------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxxxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGc...` |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGc...` |
| `OPENAI_API_KEY` | `sk-...` |
| `OPENAI_MODEL` | `gpt-3.5-turbo` |

7. Cliquez sur **"Deploy"**
8. Attendez 2-3 minutes

### Étape 9 : Ingérer les données

**IMPORTANT** : L'ingestion doit être faite localement car elle nécessite les credentials Confluence.

```bash
# Sur votre machine locale
npm run ingest
```

Cela va :
- Se connecter à Confluence
- Récupérer toutes les pages de l'espace "Formation"
- Générer les embeddings avec OpenAI
- Stocker dans Supabase

⏱️ Temps estimé : 2-5 minutes selon le nombre de pages

### Étape 10 : Tester le chatbot

1. Ouvrez l'URL de votre déploiement Vercel : `https://votre-app.vercel.app`
2. Posez une question sur Click&Care Academy
3. Vérifiez que :
   - ✅ La réponse est générée
   - ✅ Les sources Confluence sont affichées
   - ✅ Les liens fonctionnent

### Étape 11 : Vérifier la santé du système

Accédez à : `https://votre-app.vercel.app/api/health`

Vous devriez voir :
```json
{
  "status": "healthy",
  "services": {
    "openai": "up",
    "supabase": "up"
  },
  "timestamp": "2025-11-05T..."
}
```

## 📊 Récapitulatif des coûts

- **Vercel** : Gratuit (Hobby plan)
- **Supabase** : Gratuit (jusqu'à 500 MB de données)
- **OpenAI** : ~$1-5 par mois selon l'utilisation
  - Embeddings : $0.0001 / 1000 tokens
  - GPT-3.5-turbo : $0.0015 / 1000 tokens

**Total estimé** : $1-5 par mois

## 🎯 Checklist finale

- [ ] Changements poussés sur GitHub
- [ ] Projet Supabase créé
- [ ] SQL exécuté dans Supabase
- [ ] Clés Supabase récupérées
- [ ] Clé OpenAI obtenue et créditée
- [ ] Token Confluence créé
- [ ] Variables configurées sur Vercel
- [ ] Déploiement Vercel réussi
- [ ] Données Confluence ingérées
- [ ] Chatbot testé et fonctionnel
- [ ] API health vérifiée

## 🆘 En cas de problème

### Erreur "supabaseUrl is required"
- Vérifiez que `NEXT_PUBLIC_SUPABASE_URL` est bien configuré sur Vercel
- Redéployez après avoir ajouté la variable

### Erreur OpenAI
- Vérifiez que votre clé API est valide
- Vérifiez que vous avez des crédits sur votre compte

### Pas de résultats de recherche
- Vérifiez que l'ingestion s'est bien déroulée
- Vérifiez dans Supabase que la table `documents` contient des données

### Build échoue
- Consultez les logs Vercel
- Vérifiez que toutes les variables d'environnement sont configurées

## 📚 Documentation disponible

- `QUICK_START.md` - Guide rapide (15 min)
- `DEPLOYMENT_GUIDE.md` - Guide détaillé complet
- `VERCEL_SETUP.md` - Configuration Vercel spécifique
- `CHANGELOG.md` - Historique des changements
- `README.md` - Documentation générale

## 🎉 Félicitations !

Une fois toutes ces étapes complétées, votre chatbot Confluence sera :
- ✅ Déployé sur Vercel
- ✅ Connecté à Supabase
- ✅ Alimenté par OpenAI
- ✅ Prêt à répondre aux questions sur Click&Care Academy

**URL finale** : `https://votre-app.vercel.app`

---

**Besoin d'aide ?** Consultez les guides détaillés ou les logs Vercel.
