# Guide de Déploiement - Confluence Chatbot

Ce guide vous accompagne pas à pas pour déployer complètement le chatbot Confluence sur Vercel.

## 📋 Prérequis

- Compte GitHub (pour le dépôt)
- Compte Vercel (gratuit)
- Compte Supabase (gratuit)
- Clé API OpenAI
- Accès Confluence avec API Token

## 🚀 Étape 1 : Configuration Supabase

### 1.1 Créer un projet Supabase

1. Allez sur [https://supabase.com](https://supabase.com)
2. Cliquez sur "Start your project"
3. Créez un nouveau projet :
   - Nom : `confluence-chatbot`
   - Database Password : Choisissez un mot de passe fort
   - Region : Choisissez la plus proche (ex: Europe West)
4. Attendez que le projet soit créé (~2 minutes)

### 1.2 Configurer la base de données

1. Dans votre projet Supabase, allez dans **SQL Editor**
2. Cliquez sur **New Query**
3. Copiez et exécutez le SQL suivant :

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

4. Cliquez sur **Run** pour exécuter

### 1.3 Récupérer les clés API

1. Allez dans **Settings** > **API**
2. Notez les valeurs suivantes :
   - **Project URL** : `https://xxxxx.supabase.co`
   - **anon public** : `eyJhbGc...` (clé publique)
   - **service_role** : `eyJhbGc...` (clé secrète)

## 🔑 Étape 2 : Configuration OpenAI

1. Allez sur [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Connectez-vous ou créez un compte
3. Cliquez sur **Create new secret key**
4. Donnez un nom : `confluence-chatbot`
5. Copiez la clé : `sk-...`
6. **Important** : Ajoutez des crédits à votre compte OpenAI (minimum $5)

## 🔐 Étape 3 : Configuration Confluence

### 3.1 Créer un API Token

1. Allez sur [https://id.atlassian.com/manage-profile/security/api-tokens](https://id.atlassian.com/manage-profile/security/api-tokens)
2. Cliquez sur **Create API token**
3. Donnez un nom : `Chatbot RAG`
4. Copiez le token généré

### 3.2 Informations nécessaires

Vous avez déjà :
- **Base URL** : `https://clickandcare.atlassian.net/wiki`
- **Username** : `lyes.cherfaoui@clickandcare.fr`
- **Space Key** : `Formation`
- **API Token** : (celui que vous venez de créer)

## 📝 Étape 4 : Configuration locale

### 4.1 Mettre à jour le fichier .env

Éditez le fichier `.env` à la racine du projet :

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# OpenAI Configuration
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-3.5-turbo

# Confluence Configuration
CONFLUENCE_BASE_URL=https://clickandcare.atlassian.net/wiki
CONFLUENCE_USERNAME=lyes.cherfaoui@clickandcare.fr
CONFLUENCE_API_TOKEN=votre_token_confluence
CONFLUENCE_SPACE_KEY=Formation
```

### 4.2 Installer les dépendances

```bash
npm install
```

### 4.3 Ingérer les données Confluence

```bash
npm run ingest
```

Cette commande va :
- Se connecter à Confluence
- Récupérer toutes les pages de l'espace "Formation"
- Générer des embeddings avec OpenAI
- Stocker tout dans Supabase

⏱️ **Temps estimé** : 2-5 minutes selon le nombre de pages

## 🌐 Étape 5 : Déploiement sur Vercel

### 5.1 Connecter le dépôt GitHub

1. Allez sur [https://vercel.com](https://vercel.com)
2. Cliquez sur **Add New** > **Project**
3. Importez votre dépôt GitHub : `lyes996/chatbot`
4. Sélectionnez la branche : `feature/confluence-chatbot-rag-system-ldc`

### 5.2 Configurer les variables d'environnement

Dans la section **Environment Variables**, ajoutez :

| Name | Value |
|------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxxxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGc...` |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGc...` |
| `OPENAI_API_KEY` | `sk-...` |
| `OPENAI_MODEL` | `gpt-3.5-turbo` |

**Note** : Les variables Confluence ne sont pas nécessaires pour le déploiement (uniquement pour l'ingestion locale).

### 5.3 Déployer

1. Cliquez sur **Deploy**
2. Attendez la fin du build (~2-3 minutes)
3. Votre chatbot sera disponible à : `https://votre-projet.vercel.app`

## ✅ Étape 6 : Vérification

### 6.1 Tester le chatbot

1. Ouvrez l'URL de votre déploiement
2. Posez une question sur la formation Click&Care
3. Vérifiez que :
   - La réponse est générée
   - Les sources Confluence sont affichées
   - Les liens fonctionnent

### 6.2 Vérifier la santé du système

Accédez à : `https://votre-projet.vercel.app/api/health`

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

## 🔄 Mise à jour des données

Pour mettre à jour les données Confluence :

1. Localement, exécutez : `npm run ingest`
2. Les nouvelles données seront automatiquement disponibles sur Vercel

## 🐛 Dépannage

### Erreur : "supabaseUrl is required"
- Vérifiez que les variables d'environnement sont bien configurées sur Vercel
- Redéployez le projet

### Erreur : "OpenAI API error"
- Vérifiez que votre clé API est valide
- Vérifiez que vous avez des crédits sur votre compte OpenAI

### Pas de résultats de recherche
- Vérifiez que l'ingestion s'est bien déroulée
- Vérifiez dans Supabase que la table `documents` contient des données

### Erreur Confluence lors de l'ingestion
- Vérifiez que votre API token est valide
- Vérifiez que vous avez accès à l'espace "Formation"

## 📊 Monitoring

### Supabase
- Allez dans **Database** > **Tables** > **documents** pour voir les données
- Vérifiez le nombre de lignes

### Vercel
- Allez dans **Deployments** pour voir l'historique
- Consultez les **Logs** en cas d'erreur

### OpenAI
- Allez sur [https://platform.openai.com/usage](https://platform.openai.com/usage)
- Surveillez votre consommation

## 💰 Coûts estimés

- **Supabase** : Gratuit (jusqu'à 500 MB)
- **Vercel** : Gratuit (hobby plan)
- **OpenAI** : 
  - Embeddings : ~$0.0001 par 1000 tokens
  - Chat : ~$0.0015 par 1000 tokens
  - **Estimation** : ~$1-5 par mois selon l'utilisation

## 🎉 Félicitations !

Votre chatbot Confluence est maintenant déployé et opérationnel ! 🚀

Pour toute question ou problème, consultez les logs ou contactez le support.
