# Guide : Comment créer un compte administrateur

## Méthode 1 : Via l'interface Supabase (Recommandé)

### Étape 1 : Créer un compte utilisateur normal
1. Va sur ton site : `http://localhost:3000/register`
2. Inscris-toi avec un email et un mot de passe
3. Connecte-toi une fois pour créer ton profil

### Étape 2 : Promouvoir le compte en admin
1. Va dans **Supabase Dashboard** → **Table Editor** → **profiles**
2. Trouve ton profil (recherche par email)
3. Clique sur la ligne de ton profil pour l'éditer
4. Dans la colonne **role**, change `etudiant` en `admin`
5. Clique sur **Save** (ou appuie sur Entrée)

✅ **C'est fait !** Tu peux maintenant te déconnecter et te reconnecter. Tu auras accès à l'espace admin.

---

## Méthode 2 : Via SQL (Plus rapide)

### Étape 1 : Créer un compte utilisateur normal
1. Inscris-toi sur le site avec un email et mot de passe

### Étape 2 : Promouvoir via SQL
1. Va dans **Supabase Dashboard** → **SQL Editor**
2. Exécute cette commande (remplace `ton-email@exemple.com` par ton email) :

```sql
UPDATE public.profiles 
SET role = 'admin' 
WHERE email = 'ton-email@exemple.com';
```

3. Clique sur **Run**

✅ **C'est fait !** Déconnecte-toi et reconnecte-toi pour voir l'espace admin.

---

## Méthode 3 : Créer directement un admin (SQL)

Si tu veux créer un admin directement sans passer par l'inscription :

```sql
-- 1. D'abord, crée l'utilisateur dans auth.users (remplace les valeurs)
-- Note: Tu dois d'abord créer l'utilisateur via l'interface d'inscription
-- ou utiliser l'API Supabase Auth

-- 2. Ensuite, crée le profil admin directement
INSERT INTO public.profiles (id, email, role)
VALUES (
  'id-de-l-utilisateur-ici',  -- Remplace par l'ID de l'utilisateur depuis auth.users
  'ton-email@exemple.com',
  'admin'
)
ON CONFLICT (id) DO UPDATE SET role = 'admin';
```

**Pour trouver l'ID de l'utilisateur :**
```sql
SELECT id, email FROM auth.users WHERE email = 'ton-email@exemple.com';
```

---

## Vérifier qu'un compte est admin

Exécute cette requête SQL :

```sql
SELECT 
  p.email,
  p.role,
  u.email_confirmed_at,
  CASE 
    WHEN p.role = 'admin' THEN '✅ Admin'
    ELSE '👤 Étudiant'
  END as statut
FROM public.profiles p
JOIN auth.users u ON p.id = u.id
WHERE p.email = 'ton-email@exemple.com';
```

---

## Accès à l'espace admin

Une fois que tu es admin :
1. Connecte-toi sur le site
2. Tu verras un bouton **"Espace faculté"** dans le header
3. Clique dessus pour accéder à `/admin`
4. Tu peux maintenant :
   - Voir toutes les questions
   - Créer de nouvelles questions/réponses
   - Gérer le contenu

---

## Notes importantes

- ⚠️ **Sécurité** : Ne donne le rôle admin qu'aux personnes de confiance
- 🔒 Les admins ont accès à toutes les fonctionnalités de gestion
- 👥 Tu peux avoir plusieurs admins
- 🔄 Pour retirer le rôle admin, change simplement `role` de `admin` à `etudiant` dans la table `profiles`

