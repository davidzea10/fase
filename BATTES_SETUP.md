# Guide de configuration de la fonctionnalité Battes

Ce guide vous explique comment configurer la fonctionnalité de téléchargement de documents PDF (Battes).

## 📋 Étapes de configuration

### Étape 1 : Créer la table `documents` dans Supabase

1. Allez dans votre **Dashboard Supabase** → **SQL Editor**
2. Copiez-collez le contenu du fichier `create-documents-table.sql`
3. Exécutez le script
4. Cela va créer :
   - La table `documents` avec toutes les colonnes nécessaires (incluant `niveau` pour L1, L2, L3, MASTER1, MASTER2)
   - Les politiques RLS (Row Level Security)
   - Les index pour améliorer les performances
   - Un trigger pour mettre à jour automatiquement `updated_at`

**Note** : Si la table existe déjà sans la colonne `niveau`, exécutez aussi le script `add-niveau-column.sql` pour l'ajouter.

### Étape 2 : Créer le bucket Supabase Storage

1. Allez dans **Supabase Dashboard** → **Storage**
2. Cliquez sur **"New bucket"**
3. Configurez le bucket :
   - **Nom du bucket** : `battes`
   - **Public bucket** : ❌ **NON** (privé, accessible via les politiques)
   - **File size limit** : `10 MB` (ou selon vos besoins)
   - **Allowed MIME types** : `application/pdf`
4. Cliquez sur **"Create bucket"**

### Étape 3 : Configurer les politiques de sécurité du bucket

1. Allez dans **Storage** → **battes** → **Policies**
2. Cliquez sur **"New Policy"**

#### Politique 1 : Admins peuvent uploader des fichiers
- **Policy name** : `Admins can upload documents`
- **Allowed operation** : `INSERT`
- **Target roles** : `authenticated`
- **USING expression** :
  ```sql
  public.is_admin(auth.uid())
  ```
- **WITH CHECK expression** :
  ```sql
  public.is_admin(auth.uid())
  ```

#### Politique 2 : Utilisateurs authentifiés peuvent voir les fichiers
- **Policy name** : `Authenticated users can view documents`
- **Allowed operation** : `SELECT`
- **Target roles** : `authenticated`
- **USING expression** :
  ```sql
  auth.role() = 'authenticated'
  ```

#### Politique 3 : Admins peuvent supprimer des fichiers
- **Policy name** : `Admins can delete documents`
- **Allowed operation** : `DELETE`
- **Target roles** : `authenticated`
- **USING expression** :
  ```sql
  public.is_admin(auth.uid())
  ```

### Étape 4 : Créer la fonction helper `is_admin`

1. Allez dans **Supabase Dashboard** → **SQL Editor**
2. Copiez-collez le contenu du fichier `setup-battes-storage.sql`
3. Exécutez le script
4. Cela va créer la fonction `is_admin()` utilisée par les politiques

### Étape 5 : Vérifier la configuration

1. Connectez-vous en tant qu'**admin**
2. Allez sur `/admin/battes`
3. Essayez d'uploader un fichier PDF
4. Vérifiez que le fichier apparaît dans la liste
5. Allez sur `/battes` (page publique)
6. Vérifiez que vous pouvez voir et télécharger le document

## 🎯 Fonctionnalités implémentées

### Page Admin (`/admin/battes`)
- ✅ Upload de fichiers PDF (max 10MB)
- ✅ Nom personnalisé pour chaque examen
- ✅ Sélection du niveau (L1, L2, L3, MASTER1, MASTER2)
- ✅ Liste de tous les examens avec métadonnées
- ✅ Suppression d'examens
- ✅ Affichage de la taille, niveau et date d'ajout
- ✅ Accès réservé aux admins uniquement

### Page Publique (`/battes`)
- ✅ Affichage des anciens examens par rubriques (L1, L2, L3, MASTER1, MASTER2)
- ✅ Filtres par niveau avec boutons
- ✅ Recherche par nom d'examen
- ✅ Téléchargement des PDF
- ✅ Affichage des métadonnées (niveau, taille, date)
- ✅ Design responsive (mobile/desktop)
- ✅ Bouton "Gérer les examens" visible uniquement pour les admins

## 🔒 Sécurité

- ✅ Seuls les admins peuvent uploader des documents
- ✅ Seuls les admins peuvent supprimer des documents
- ✅ Tous les utilisateurs authentifiés peuvent voir et télécharger
- ✅ Les fichiers sont stockés dans un bucket privé
- ✅ Validation du type de fichier (PDF uniquement)
- ✅ Validation de la taille (max 10MB)

## 📝 Structure de la table `documents`

```sql
- id (UUID) → Clé primaire
- nom (TEXT) → Nom de l'examen
- niveau (TEXT) → Niveau : 'L1', 'L2', 'L3', 'MASTER1', 'MASTER2'
- fichier_url (TEXT) → URL publique du fichier dans Storage
- fichier_nom (TEXT) → Nom original du fichier
- taille_fichier (BIGINT) → Taille en octets
- auteur_id (UUID) → Référence auth.users(id)
- cree_le (TIMESTAMP) → Date de création
- updated_at (TIMESTAMP) → Date de mise à jour
```

## 🐛 Dépannage

### Erreur : "Bucket not found"
- Vérifiez que le bucket `battes` existe dans Supabase Storage
- Vérifiez que le nom du bucket est exactement `battes` (minuscules)

### Erreur : "Permission denied" lors de l'upload
- Vérifiez que vous êtes connecté en tant qu'admin
- Vérifiez que les politiques du bucket sont correctement configurées
- Vérifiez que la fonction `is_admin()` existe dans Supabase

### Erreur : "File too large"
- Vérifiez la limite de taille dans les paramètres du bucket
- Par défaut, la limite est de 10MB

### Les examens ne s'affichent pas
- Vérifiez que la table `documents` existe
- Vérifiez que la colonne `niveau` existe dans la table
- Vérifiez que les politiques RLS permettent la lecture
- Vérifiez que vous êtes connecté (authentifié)

### La colonne niveau n'existe pas
- Si vous avez créé la table avant l'ajout de cette fonctionnalité, exécutez `add-niveau-column.sql`
- Les documents existants seront automatiquement mis à jour avec le niveau 'L1'

## 📚 Fichiers créés

- `create-documents-table.sql` → Script SQL pour créer la table (avec colonne niveau)
- `add-niveau-column.sql` → Script SQL pour ajouter la colonne niveau si la table existe déjà
- `setup-battes-storage.sql` → Script SQL pour la fonction helper
- `app/admin/battes/page.tsx` → Page admin (gestion des examens)
- `app/battes/page.tsx` → Page publique (affichage par rubriques)
- `BATTES_SETUP.md` → Ce guide

## ✅ Checklist de déploiement

- [ ] Table `documents` créée avec colonne `niveau`
- [ ] Si table existante : colonne `niveau` ajoutée via `add-niveau-column.sql`
- [ ] Bucket `battes` créé dans Storage
- [ ] Politiques du bucket configurées
- [ ] Fonction `is_admin()` créée
- [ ] Test d'upload réussi avec sélection de niveau
- [ ] Test d'affichage par rubriques réussi
- [ ] Test de téléchargement réussi
- [ ] Navigation mise à jour (lien "Battes" visible)
- [ ] Vérification que seuls les admins voient le bouton "Gérer les examens"

---

**Note** : Assurez-vous d'avoir exécuté tous les scripts SQL dans l'ordre avant de tester la fonctionnalité.

