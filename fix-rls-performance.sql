-- Script SQL pour corriger toutes les politiques RLS et optimiser les performances
-- À exécuter dans l'éditeur SQL de Supabase (Dashboard > SQL Editor)
-- Ce script corrige les problèmes de performance en utilisant (select auth.uid()) au lieu de auth.uid()

-- ============================================
-- 1. CORRIGER LES POLITIQUES DE LA TABLE PROFILES
-- ============================================

-- Supprimer TOUTES les politiques existantes de la table profiles
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'profiles') LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.profiles', r.policyname);
    END LOOP;
END $$;

-- Recréer les politiques optimisées avec (select auth.uid())
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING ((select auth.uid()) = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING ((select auth.uid()) = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK ((select auth.uid()) = id);

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (select auth.uid()) AND role = 'admin'
    )
  );

-- ============================================
-- 2. CORRIGER LES POLITIQUES DE LA TABLE QUESTIONS
-- ============================================

-- Supprimer TOUTES les politiques existantes de la table questions
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'questions') LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.questions', r.policyname);
    END LOOP;
END $$;

-- Recréer les politiques optimisées
-- Tous peuvent voir les questions approuvées et visibles (y compris les utilisateurs non authentifiés)
CREATE POLICY "Public can view approved questions"
  ON public.questions FOR SELECT
  USING (
    (statut = 'approuve' AND (visible = true OR visible IS NULL))
    OR 
    (statut IS NULL AND (visible = true OR visible IS NULL))
  );

-- Les utilisateurs authentifiés peuvent créer des questions
CREATE POLICY "Authenticated users can create questions"
  ON public.questions FOR INSERT
  WITH CHECK ((select auth.role()) = 'authenticated');

-- Les admins peuvent tout faire sur les questions
CREATE POLICY "Admins can manage all questions"
  ON public.questions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (select auth.uid()) AND role = 'admin'
    )
  );

-- ============================================
-- 3. CORRIGER LES POLITIQUES DE LA TABLE QUESTION_LIKES
-- ============================================

-- Supprimer TOUTES les politiques existantes de la table question_likes
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'question_likes') LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.question_likes', r.policyname);
    END LOOP;
END $$;

-- Recréer les politiques optimisées
-- Tous peuvent voir les likes (même non authentifiés)
CREATE POLICY "Public can view likes"
  ON public.question_likes FOR SELECT
  USING (true);

-- Les utilisateurs authentifiés peuvent gérer leurs propres likes
CREATE POLICY "Users can manage own likes"
  ON public.question_likes FOR ALL
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- Les admins peuvent tout faire
CREATE POLICY "Admins can manage all likes"
  ON public.question_likes FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (select auth.uid()) AND role = 'admin'
    )
  );

-- ============================================
-- 4. CORRIGER LES POLITIQUES DE LA TABLE DOCUMENTS
-- ============================================

-- Supprimer TOUTES les politiques existantes de la table documents
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'documents') LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.documents', r.policyname);
    END LOOP;
END $$;

-- Recréer les politiques optimisées
-- Tous les utilisateurs authentifiés peuvent voir les documents
CREATE POLICY "Authenticated users can view documents"
  ON public.documents FOR SELECT
  USING ((select auth.role()) = 'authenticated');

-- Seuls les admins peuvent créer des documents
CREATE POLICY "Admins can create documents"
  ON public.documents FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (select auth.uid()) AND role = 'admin'
    )
  );

-- Seuls les admins peuvent modifier des documents
CREATE POLICY "Admins can update documents"
  ON public.documents FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (select auth.uid()) AND role = 'admin'
    )
  );

-- Seuls les admins peuvent supprimer des documents
CREATE POLICY "Admins can delete documents"
  ON public.documents FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (select auth.uid()) AND role = 'admin'
    )
  );

-- ============================================
-- 5. CRÉER/MAJ LA FONCTION is_admin() OPTIMISÉE
-- ============================================

CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = user_id AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- FIN DU SCRIPT
-- ============================================

-- Vérification : Afficher le nombre de politiques par table
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename IN ('profiles', 'questions', 'question_likes', 'documents')
ORDER BY tablename, policyname;

