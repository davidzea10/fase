# Guide de configuration de l'authentification

## Étape 1 : Configuration Supabase

### 1.1 Créer la table `profiles` et configurer RLS

1. Va dans ton **Dashboard Supabase** → **SQL Editor**
2. Copie-colle le contenu du fichier `supabase-setup.sql` et exécute-le
3. Cela va créer :
   - La table `profiles` pour gérer les rôles (étudiant/admin)
   - Les politiques RLS (Row Level Security)
   - Les triggers pour créer automatiquement un profil lors de l'inscription
   - Les colonnes nécessaires dans la table `questions`

### 1.2 Activer l'authentification Email/Password

1. Dans Supabase Dashboard → **Authentication** → **Providers**
2. Active **Email** si ce n'est pas déjà fait
3. Configure les paramètres :
   - **Enable email confirmations** : **DÉSACTIVÉ** (pour le développement) ou Activé (pour la production)
   - **Secure email change** : Activé

⚠️ **IMPORTANT - Résolution du problème "Invalid login credentials" :**

Si tu rencontres l'erreur "Invalid login credentials" après l'inscription, c'est probablement parce que la **confirmation d'email est activée** dans Supabase. Voici comment résoudre :

**Option 1 : Désactiver la confirmation d'email (recommandé pour le développement)**
1. Va dans Supabase Dashboard → **Authentication** → **Providers** → **Email**
2. Désactive **"Enable email confirmations"**
3. Sauvegarde
4. Maintenant, les nouveaux utilisateurs pourront se connecter immédiatement après l'inscription

**Option 2 : Confirmer manuellement un utilisateur existant (si tu as déjà créé un compte)**
1. Va dans Supabase Dashboard → **Authentication** → **Users**
2. Trouve l'utilisateur qui ne peut pas se connecter
3. Clique sur les trois points (⋯) à droite de l'utilisateur
4. Sélectionne **"Confirm user"** ou **"Send confirmation email"**
5. Si tu choisis "Confirm user", l'utilisateur pourra se connecter immédiatement
6. Si tu choisis "Send confirmation email", l'utilisateur recevra un email avec un lien de confirmation

**Option 3 : Confirmer via SQL (pour les utilisateurs existants)**
```sql
-- Confirmer tous les utilisateurs non confirmés
UPDATE auth.users 
SET email_confirmed_at = NOW() 
WHERE email_confirmed_at IS NULL;

-- Ou pour un utilisateur spécifique
UPDATE auth.users 
SET email_confirmed_at = NOW() 
WHERE email = 'ton-email@exemple.com';
```

### 1.3 Configurer Google OAuth

1. Dans Supabase Dashboard → **Authentication** → **Providers**
2. Active **Google**
3. Tu auras besoin de :
   - **Client ID** et **Client Secret** depuis [Google Cloud Console](https://console.cloud.google.com/)
   
   **Pour obtenir les credentials Google :**
   - Va sur [Google Cloud Console](https://console.cloud.google.com/)
   - Crée un nouveau projet ou sélectionne un projet existant
   - Active l'API **Google+**
   - Va dans **Credentials** → **Create Credentials** → **OAuth client ID**
   - Type d'application : **Web application**
   - **Authorized redirect URIs** : Ajoute `https://[TON-PROJECT-ID].supabase.co/auth/v1/callback`
   - Copie le **Client ID** et **Client Secret** dans Supabase

4. Dans Supabase, colle les credentials Google
5. Sauvegarde

### 1.4 Configurer les URLs de redirection

1. Dans Supabase Dashboard → **Authentication** → **URL Configuration**
2. Ajoute dans **Redirect URLs** :
   - `http://localhost:3000/auth/callback` (pour le développement)
   - `https://ton-domaine.com/auth/callback` (pour la production)

## Étape 2 : Créer un administrateur

Après avoir créé un compte utilisateur normal, tu peux le promouvoir admin :

1. Va dans Supabase Dashboard → **Table Editor** → **profiles**
2. Trouve ton profil (ou celui que tu veux rendre admin)
3. Modifie le champ `role` de `etudiant` à `admin`
4. Sauvegarde

**Ou via SQL :**
```sql
UPDATE public.profiles 
SET role = 'admin' 
WHERE email = 'ton-email@exemple.com';
```

## Étape 3 : Tester l'authentification

1. Lance le serveur : `npm run dev`
2. Va sur `http://localhost:3000/login`
3. Teste :
   - **Inscription** avec email/password
   - **Connexion** avec email/password
   - **Connexion avec Google** (si configuré)
4. Vérifie que le header affiche bien ton nom/email après connexion
5. Teste l'accès à `/admin` (doit être protégé, accessible seulement aux admins)

### 🔧 Dépannage

**Problème : "Invalid login credentials" après l'inscription**
- Vérifie que la confirmation d'email est **désactivée** dans Supabase (voir section 1.2)
- Si tu as déjà créé un compte, confirme-le manuellement (voir section 1.2, Option 2 ou 3)
- Vérifie que les variables d'environnement sont correctement configurées (voir ci-dessous)

**Problème : Erreur 400 sur les endpoints Supabase**
- Vérifie que `NEXT_PUBLIC_SUPABASE_URL` et `NEXT_PUBLIC_SUPABASE_ANON_KEY` sont définis dans `.env.local`
- Redémarre le serveur de développement après avoir modifié les variables d'environnement

**Problème : Le profil n'est pas créé automatiquement**
- Vérifie que le trigger `on_auth_user_created` existe dans Supabase (voir `supabase-setup.sql`)
- Vérifie que la table `profiles` existe et que RLS est configuré correctement

## Structure des fichiers créés

- `contexts/AuthContext.tsx` : Contexte React pour gérer l'authentification
- `app/login/page.tsx` : Page de connexion
- `app/register/page.tsx` : Page d'inscription
- `app/auth/callback/route.ts` : Route de callback pour OAuth
- `components/ProtectedRoute.tsx` : Composant pour protéger les routes
- `components/MainHeader.tsx` : Header mis à jour avec le statut de connexion
- `app/admin/layout.tsx` : Layout admin protégé

## Notes importantes

- Les nouveaux utilisateurs ont automatiquement le rôle `etudiant` par défaut
- Seuls les utilisateurs avec `role = 'admin'` peuvent accéder à `/admin`
- Les questions créées par les étudiants auront `statut = 'en_attente'` par défaut
- Les questions doivent être approuvées par un admin pour être visibles publiquement

## Prochaines étapes

Une fois l'authentification fonctionnelle, nous passerons à :
- **Étape 2** : Formulaire de soumission de questions pour les étudiants
- **Étape 3** : Interface de modération admin pour approuver/rejeter les questions

