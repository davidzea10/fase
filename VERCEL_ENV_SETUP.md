# Configuration des Variables d'Environnement sur Vercel

## Problème
L'application fonctionne en local mais pas sur Vercel car les variables d'environnement Supabase ne sont pas configurées sur Vercel.

## Solution : Configurer les Variables d'Environnement sur Vercel

### Étape 1 : Récupérer vos clés Supabase

1. Allez sur [Supabase Dashboard](https://app.supabase.com)
2. Sélectionnez votre projet
3. Allez dans **Settings** → **API**
4. Vous verrez deux informations importantes :
   - **Project URL** : `https://quvtorrfjgmlbwaitoao.supabase.co`
   - **anon public** key : `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### Étape 2 : Configurer sur Vercel

1. Allez sur [Vercel Dashboard](https://vercel.com/dashboard)
2. Sélectionnez votre projet (`fase` ou le nom de votre projet)
3. Allez dans **Settings** → **Environment Variables**
4. Ajoutez les deux variables suivantes :

#### Variable 1 :
- **Name** : `NEXT_PUBLIC_SUPABASE_URL`
- **Value** : `https://quvtorrfjgmlbwaitoao.supabase.co`
- **Environments** : ✅ Production, ✅ Preview, ✅ Development

#### Variable 2 :
- **Name** : `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Value** : `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF1dnRvcnJmamdtbGJ3YWl0b2FvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzOTQ5NTQsImV4cCI6MjA3ODk3MDk1NH0.-sOvI7CHbk-JKf4GRVVc5jRwN7tsDwemmxJLHApG3AE`
- **Environments** : ✅ Production, ✅ Preview, ✅ Development

### Étape 3 : Redéployer l'application

Après avoir ajouté les variables :

1. Allez dans **Deployments**
2. Cliquez sur les **3 points** (⋯) du dernier déploiement
3. Cliquez sur **Redeploy**
4. Ou simplement poussez un nouveau commit sur GitHub pour déclencher un nouveau déploiement

### Étape 4 : Vérifier que ça fonctionne

1. Attendez que le déploiement soit terminé
2. Visitez votre site Vercel
3. Ouvrez la console du navigateur (F12)
4. Vous ne devriez plus voir l'erreur "Variables d'environnement Supabase manquantes"

## Vérification rapide

Pour vérifier que les variables sont bien configurées sur Vercel :

1. Allez dans **Settings** → **Environment Variables**
2. Vous devriez voir :
   - `NEXT_PUBLIC_SUPABASE_URL` ✅
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` ✅

## Notes importantes

- ⚠️ **Ne jamais** commiter le fichier `.env.local` sur GitHub (il est déjà dans `.gitignore`)
- ✅ Les variables `NEXT_PUBLIC_*` sont accessibles côté client (navigateur)
- ✅ Sur Vercel, les variables sont injectées lors du build
- ✅ Après avoir ajouté/modifié des variables, il faut redéployer

## Si ça ne fonctionne toujours pas

1. Vérifiez que les noms des variables sont **exactement** :
   - `NEXT_PUBLIC_SUPABASE_URL` (avec underscores, pas de tirets)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (avec underscores, pas de tirets)

2. Vérifiez que les valeurs sont correctes (copiez-collez depuis Supabase)

3. Vérifiez que les variables sont activées pour **Production** (pas seulement Development)

4. Redéployez après chaque modification de variables

5. Vérifiez les logs de build sur Vercel pour voir s'il y a des erreurs

