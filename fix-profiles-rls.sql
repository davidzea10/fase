-- Script SQL pour corriger les problèmes de profils et RLS
-- À exécuter dans l'éditeur SQL de Supabase (Dashboard > SQL Editor)

-- ============================================
-- 1. Vérifier les profils manquants
-- ============================================
-- Cette requête montre les utilisateurs qui n'ont pas de profil
SELECT 
  u.id,
  u.email,
  u.email_confirmed_at,
  u.created_at as user_created_at,
  p.id as profile_id,
  CASE 
    WHEN p.id IS NULL THEN '❌ Profil manquant'
    ELSE '✅ Profil existe'
  END as statut
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
ORDER BY u.created_at DESC;

-- ============================================
-- 2. Créer les profils manquants
-- ============================================
-- Cette commande crée automatiquement les profils pour tous les utilisateurs qui n'en ont pas
INSERT INTO public.profiles (id, email, role)
SELECT 
  u.id,
  u.email,
  'etudiant' as role
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 3. Vérifier les politiques RLS
-- ============================================
-- Vérifie que les politiques RLS sont correctement configurées
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY policyname;

-- ============================================
-- 4. Recréer les politiques RLS si nécessaire
-- ============================================
-- Supprime les anciennes politiques
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- Recrée les politiques
-- Les utilisateurs peuvent lire leur propre profil
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Les utilisateurs peuvent mettre à jour leur propre profil
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Les utilisateurs peuvent insérer leur propre profil
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Les admins peuvent tout voir
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- 5. Vérifier que RLS est activé
-- ============================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 6. Vérifier le trigger de création automatique
-- ============================================
-- Vérifie que le trigger existe
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE event_object_table = 'users'
  AND trigger_schema = 'auth';

