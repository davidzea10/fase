-- Script SQL pour configurer le bucket Supabase Storage pour les documents Battes
-- À exécuter dans l'éditeur SQL de Supabase (Dashboard > SQL Editor)

-- Note: Ce script configure les politiques de sécurité pour le bucket "battes"
-- Le bucket doit être créé manuellement dans Supabase Dashboard > Storage

-- 1. Créer une fonction helper pour vérifier si un utilisateur est admin
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = user_id AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Politique pour permettre aux admins d'uploader des fichiers
-- Note: Les politiques de storage sont créées via l'interface Supabase Dashboard
-- Allez dans Storage > battes > Policies et créez ces politiques :

/*
POLITIQUE 1: Admins can upload files
- Operation: INSERT
- Policy name: "Admins can upload documents"
- USING expression: public.is_admin(auth.uid())
- WITH CHECK expression: public.is_admin(auth.uid())

POLITIQUE 2: Authenticated users can view files
- Operation: SELECT
- Policy name: "Authenticated users can view documents"
- USING expression: auth.role() = 'authenticated'

POLITIQUE 3: Admins can delete files
- Operation: DELETE
- Policy name: "Admins can delete documents"
- USING expression: public.is_admin(auth.uid())
*/

-- Instructions pour créer le bucket manuellement :
-- 1. Allez dans Supabase Dashboard > Storage
-- 2. Cliquez sur "New bucket"
-- 3. Nom du bucket : "battes"
-- 4. Public bucket : NON (privé, mais accessible via les politiques)
-- 5. File size limit : 10 MB (ou selon vos besoins)
-- 6. Allowed MIME types : application/pdf
-- 7. Cliquez sur "Create bucket"
-- 8. Allez dans l'onglet "Policies" du bucket
-- 9. Créez les 3 politiques mentionnées ci-dessus

