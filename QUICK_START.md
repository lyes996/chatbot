# 🚀 Quick Start - Confluence Chatbot

Guide ultra-rapide pour déployer votre chatbot en 15 minutes.

## ⚡ Étapes rapides

### 1️⃣ Créer un projet Supabase (3 min)

1. Allez sur [supabase.com](https://supabase.com) → **Start your project**
2. Créez un projet : `confluence-chatbot`
3. Dans **SQL Editor**, exécutez :

```sql
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  url TEXT NOT NULL UNIQUE,
  space_key TEXT,
  embedding vector(1536),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX documents_embedding_idx ON documents 
USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

CREATE OR REPLACE FUNCTION match_documents(
  query_embedding vector(1536),
  match_threshold float,
  match_count int
)
RETURNS TABLE (id uuid, title text, content text, url text, similarity float)
LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  SELECT d.id, d.title, d.content, d.url,
    1 - (d.embedding <=> query_embedding) as similarity
  FROM documents d
  WHERE 1 - (d.embedding <=> query_embedding) > match_threshold
  ORDER BY d.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
```

4. Allez dans **Settings > API**, notez :
   - Project URL
   - anon public key
   - service_role key

### 2️⃣ Obtenir une clé OpenAI (2 min)

1. Allez sur [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Créez une clé : **Create new secret key**
3. Copiez la clé `sk-...`
4. Ajoutez $5 de crédits minimum

### 3️⃣ Créer un token Confluence (2 min)

1. Allez sur [id.atlassian.com/manage-profile/security/api-tokens](https://id.atlassian.com/manage-profile/security/api-tokens)
2. **Create API token** → Nommez-le `chatbot`
3. Copiez le token

### 4️⃣ Configuration locale (3 min)

```bash
# Cloner et installer
git clone https://github.com/lyes996/chatbot.git
cd chatbot
git checkout feature/confluence-chatbot-rag-system-ldc
npm install

# Configurer .env
cp .env.example .env
# Éditez .env avec vos vraies valeurs

# Vérifier la configuration
npm run check-env

# Ingérer les données Confluence
npm run ingest
```

### 5️⃣ Déployer sur Vercel (5 min)

1. Allez sur [vercel.com](https://vercel.com)
2. **Add New > Project**
3. Importez `lyes996/chatbot`
4. Branche : `feature/confluence-chatbot-rag-system-ldc`
5. Ajoutez les variables d'environnement :

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-3.5-turbo
```

6. **Deploy** 🚀

### 6️⃣ Tester (1 min)

Accédez à : `https://votre-app.vercel.app`

Posez une question sur Click&Care Academy !

## 📋 Checklist

- [ ] Projet Supabase créé
- [ ] SQL exécuté dans Supabase
- [ ] Clé OpenAI obtenue
- [ ] Token Confluence créé
- [ ] `.env` configuré localement
- [ ] `npm run check-env` ✅
- [ ] `npm run ingest` réussi
- [ ] Variables configurées sur Vercel
- [ ] Déploiement Vercel réussi
- [ ] Chatbot testé et fonctionnel

## 🆘 Besoin d'aide ?

- **Guide détaillé** : Voir [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
- **Configuration Vercel** : Voir [VERCEL_SETUP.md](./VERCEL_SETUP.md)
- **Problèmes** : Vérifiez les logs Vercel

## 💡 Commandes utiles

```bash
npm run check-env    # Vérifier la configuration
npm run ingest       # Ingérer les données Confluence
npm run dev          # Démarrer en local
npm run build        # Build de production
```

## 🎉 C'est tout !

Votre chatbot Confluence est maintenant déployé et opérationnel !

**URL de production** : `https://votre-app.vercel.app`

---

**Temps total** : ~15 minutes
**Coût mensuel** : ~$1-5 (OpenAI uniquement)
