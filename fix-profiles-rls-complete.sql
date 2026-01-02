-- Script SQL pour corriger complètement les politiques RLS des profils
-- À exécuter dans l'éditeur SQL de Supabase (Dashboard > SQL Editor)
-- Ce script résout les problèmes de création et lecture de profils

-- ============================================
-- 1. SUPPRIMER TOUTES LES ANCIENNES POLITIQUES
-- ============================================

DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'profiles') LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.profiles', r.policyname);
    END LOOP;
END $$;

-- ============================================
-- 2. CRÉER LES PROFILS MANQUANTS POUR TOUS LES UTILISATEURS EXISTANTS
-- ============================================

-- Créer les profils pour tous les utilisateurs qui n'en ont pas
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
-- 3. RECRÉER LES POLITIQUES OPTIMISÉES
-- ============================================

-- Les utilisateurs peuvent voir leur propre profil
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING ((select auth.uid()) = id);

-- Les utilisateurs peuvent mettre à jour leur propre profil
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING ((select auth.uid()) = id);

-- Les utilisateurs peuvent créer leur propre profil
-- IMPORTANT: Cette politique permet la création avec WITH CHECK
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK ((select auth.uid()) = id);

-- Les admins peuvent voir tous les profils
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (select auth.uid()) AND role = 'admin'
    )
  );

-- Les admins peuvent mettre à jour tous les profils
CREATE POLICY "Admins can update all profiles"
  ON public.profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (select auth.uid()) AND role = 'admin'
    )
  );

-- ============================================
-- 4. VÉRIFIER ET CRÉER LE TRIGGER POUR LA CRÉATION AUTOMATIQUE
-- ============================================

-- Créer ou remplacer la fonction pour créer automatiquement un profil
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (
    NEW.id,
    NEW.email,
    'etudiant'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Supprimer l'ancien trigger s'il existe
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Créer le trigger pour appeler la fonction lors de la création d'un utilisateur
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 5. VÉRIFICATIONS
-- ============================================

-- Afficher toutes les politiques créées
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
WHERE schemaname = 'public' AND tablename = 'profiles'
ORDER BY policyname;

-- Vérifier que tous les utilisateurs ont un profil
SELECT 
  COUNT(DISTINCT u.id) as total_users,
  COUNT(DISTINCT p.id) as total_profiles,
  COUNT(DISTINCT u.id) - COUNT(DISTINCT p.id) as users_sans_profil
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id;

-- Afficher les utilisateurs sans profil (si il y en a)
SELECT 
  u.id,
  u.email,
  u.created_at as user_created_at
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE p.id IS NULL;

