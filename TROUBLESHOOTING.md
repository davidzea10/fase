# Guide de dépannage - Problème de connexion

## Problème : "Invalid login credentials" même après avoir désactivé la confirmation d'email

### Cause
Même si tu as désactivé la confirmation d'email dans Supabase, **les utilisateurs créés AVANT cette désactivation ne sont toujours pas confirmés**. Ils doivent être confirmés manuellement.

### Solution rapide (2 minutes)

#### Option 1 : Via l'interface Supabase (recommandé pour 1-2 utilisateurs)

1. Va dans **Supabase Dashboard** → **Authentication** → **Users**
2. Trouve l'utilisateur qui ne peut pas se connecter
3. Clique sur les **trois points (⋯)** à droite de l'utilisateur
4. Sélectionne **"Confirm user"**
5. L'utilisateur peut maintenant se connecter !

#### Option 2 : Via SQL (recommandé pour plusieurs utilisateurs)

1. Va dans **Supabase Dashboard** → **SQL Editor**
2. Copie-colle cette commande :
   ```sql
   UPDATE auth.users 
   SET email_confirmed_at = NOW()
   WHERE email_confirmed_at IS NULL;
   ```
3. Clique sur **Run** ou **Exécuter**
4. Tous les utilisateurs non confirmés sont maintenant confirmés !

#### Option 3 : Confirmer un utilisateur spécifique

```sql
UPDATE auth.users 
SET email_confirmed_at = NOW()
WHERE email = 'ton-email@exemple.com' 
  AND email_confirmed_at IS NULL;
```

### Vérifier qu'un utilisateur est confirmé

Exécute cette requête SQL pour voir le statut de tous les utilisateurs :

```sql
SELECT 
  id, 
  email, 
  email_confirmed_at, 
  created_at,
  CASE 
    WHEN email_confirmed_at IS NULL THEN '❌ Non confirmé'
    ELSE '✅ Confirmé'
  END as statut
FROM auth.users 
ORDER BY created_at DESC;
```

### Autres problèmes possibles

#### 1. Variables d'environnement manquantes

Vérifie que tu as un fichier `.env.local` avec :
```
NEXT_PUBLIC_SUPABASE_URL=https://ton-projet-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=ton-anon-key
```

**Important** : Redémarre le serveur après avoir modifié `.env.local` :
```bash
# Arrête le serveur (Ctrl+C)
# Puis relance :
npm run dev
```

#### 2. Mot de passe incorrect

- Vérifie que tu utilises le bon mot de passe
- Si tu as oublié le mot de passe, utilise "Reset password" dans Supabase Dashboard → Authentication → Users

#### 3. Email incorrect

- Vérifie l'orthographe de l'email
- Vérifie qu'il n'y a pas d'espaces avant/après

### Test après correction

1. Va sur `http://localhost:3000/login`
2. Entre ton email et mot de passe
3. Tu devrais maintenant pouvoir te connecter !

### Si le problème persiste

1. Ouvre la console du navigateur (F12)
2. Regarde les erreurs dans la console
3. Vérifie les logs du serveur Next.js
4. Vérifie que les variables d'environnement sont correctement chargées

---

## Problème : "Erreur lors de la récupération du profil"

### Symptôme
Tu arrives à te connecter, mais tu vois une erreur dans la console : `Erreur lors de la récupération du profil: {}`

### Cause
Le profil n'existe pas dans la table `profiles` pour cet utilisateur. Cela peut arriver si :
- Le trigger de création automatique n'a pas fonctionné
- L'utilisateur a été créé avant la configuration du trigger
- Il y a un problème avec les politiques RLS

### Solution rapide

#### Option 1 : Créer le profil manuellement (via SQL)

1. Va dans **Supabase Dashboard** → **SQL Editor**
2. Exécute cette commande pour créer les profils manquants :
   ```sql
   INSERT INTO public.profiles (id, email, role)
   SELECT 
     u.id,
     u.email,
     'etudiant' as role
   FROM auth.users u
   LEFT JOIN public.profiles p ON u.id = p.id
   WHERE p.id IS NULL
   ON CONFLICT (id) DO NOTHING;
   ```
3. Recharge la page de l'application

#### Option 2 : Créer le profil pour un utilisateur spécifique

```sql
INSERT INTO public.profiles (id, email, role)
VALUES (
  'id-de-l-utilisateur-ici',
  'email@exemple.com',
  'etudiant'
)
ON CONFLICT (id) DO NOTHING;
```

Pour trouver l'ID de l'utilisateur :
```sql
SELECT id, email FROM auth.users WHERE email = 'ton-email@exemple.com';
```

#### Option 3 : Utiliser le script complet

Exécute le fichier `fix-profiles-rls.sql` dans Supabase SQL Editor. Il va :
- Vérifier les profils manquants
- Les créer automatiquement
- Vérifier et corriger les politiques RLS

### Vérifier que le profil existe

```sql
SELECT 
  u.email,
  p.id as profile_id,
  p.role,
  CASE 
    WHEN p.id IS NULL THEN '❌ Profil manquant'
    ELSE '✅ Profil existe'
  END as statut
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE u.email = 'ton-email@exemple.com';
```

---

**Note** : Pour les nouveaux utilisateurs créés APRÈS avoir désactivé la confirmation d'email, ils seront automatiquement confirmés et pourront se connecter immédiatement. Le code a été amélioré pour créer automatiquement le profil s'il n'existe pas lors de la connexion.

