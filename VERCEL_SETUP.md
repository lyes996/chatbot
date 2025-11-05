# Configuration Vercel - Guide Rapide

## 🎯 Variables d'environnement à configurer sur Vercel

Lors du déploiement sur Vercel, ajoutez ces variables d'environnement :

### Variables obligatoires

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# OpenAI
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-3.5-turbo
```

### Comment obtenir ces valeurs ?

#### 1. Supabase (https://supabase.com)

1. Créez un projet gratuit
2. Allez dans Settings > API
3. Copiez :
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - anon public → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - service_role → `SUPABASE_SERVICE_ROLE_KEY`

#### 2. OpenAI (https://platform.openai.com)

1. Créez un compte
2. Allez dans API Keys
3. Créez une nouvelle clé → `OPENAI_API_KEY`
4. Ajoutez des crédits (minimum $5)

## 📝 Étapes de déploiement

### 1. Préparer Supabase

Exécutez ce SQL dans l'éditeur SQL de Supabase :

```sql
-- Enable pgvector
CREATE EXTENSION IF NOT EXISTS vector;

-- Create table
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
USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

CREATE INDEX IF NOT EXISTS documents_space_key_idx ON documents(space_key);

-- Create function
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

### 2. Ingérer les données (localement)

```bash
# Installer les dépendances
npm install

# Configurer .env avec vos credentials
cp .env.example .env
# Éditez .env avec vos vraies valeurs

# Lancer l'ingestion
npm run ingest
```

### 3. Déployer sur Vercel

1. Connectez votre repo GitHub
2. Sélectionnez la branche `feature/confluence-chatbot-rag-system-ldc`
3. Ajoutez les variables d'environnement (voir ci-dessus)
4. Cliquez sur Deploy

### 4. Vérifier

Accédez à : `https://votre-app.vercel.app/api/health`

Résultat attendu :
```json
{
  "status": "healthy",
  "services": {
    "openai": "up",
    "supabase": "up"
  }
}
```

## 🔧 Commandes utiles

```bash
# Build local
npm run build

# Démarrer en local
npm run dev

# Ingérer les données Confluence
npm run ingest

# Setup database (alternative)
npm run setup-db
```

## ⚠️ Notes importantes

1. **OpenAI** : Assurez-vous d'avoir des crédits
2. **Supabase** : Le plan gratuit suffit pour commencer
3. **Ingestion** : À faire localement avant le déploiement
4. **Variables** : Ne commitez JAMAIS vos clés API

## 🐛 Problèmes courants

### Build échoue sur Vercel
- Vérifiez que toutes les variables d'environnement sont configurées
- Vérifiez qu'il n'y a pas d'erreurs TypeScript localement

### "supabaseUrl is required"
- Vérifiez que `NEXT_PUBLIC_SUPABASE_URL` est bien configuré
- Redéployez après avoir ajouté la variable

### Pas de résultats de recherche
- Vérifiez que l'ingestion a bien fonctionné
- Vérifiez dans Supabase que la table `documents` contient des données

### Erreur OpenAI
- Vérifiez que votre clé API est valide
- Vérifiez que vous avez des crédits

## 📊 Monitoring

- **Vercel** : Consultez les logs dans le dashboard
- **Supabase** : Vérifiez les données dans Database > Tables
- **OpenAI** : Surveillez l'usage sur platform.openai.com/usage

## 💰 Coûts

- **Vercel** : Gratuit (Hobby plan)
- **Supabase** : Gratuit (jusqu'à 500 MB)
- **OpenAI** : ~$1-5/mois selon l'utilisation
  - Embeddings : $0.0001 / 1K tokens
  - GPT-3.5-turbo : $0.0015 / 1K tokens

## ✅ Checklist finale

- [ ] Projet Supabase créé
- [ ] Base de données configurée (SQL exécuté)
- [ ] Clé OpenAI obtenue et créditée
- [ ] Variables d'environnement configurées localement
- [ ] Ingestion Confluence réussie
- [ ] Build local réussi (`npm run build`)
- [ ] Variables d'environnement configurées sur Vercel
- [ ] Déploiement Vercel réussi
- [ ] Test de l'API health
- [ ] Test du chatbot en production

🎉 Votre chatbot est prêt !
