-- Script SQL complet pour corriger TOUTES les politiques RLS et optimiser les performances
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

-- Créer les profils manquants pour tous les utilisateurs existants
INSERT INTO public.profiles (id, email, role)
SELECT 
  u.id,
  u.email,
  'etudiant' as role
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

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

CREATE POLICY "Admins can update all profiles"
  ON public.profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (select auth.uid()) AND role = 'admin'
    )
  );

-- Vérifier et créer le trigger pour la création automatique
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

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_new_user();

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

-- S'assurer que toutes les questions existantes sont approuvées et visibles
UPDATE public.questions
SET statut = 'approuve', visible = true
WHERE statut IS NULL OR statut = '' OR visible IS NULL OR visible = false;

-- Recréer les politiques optimisées
-- IMPORTANT: Tous peuvent voir les questions approuvées (même non authentifiés)
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
-- IMPORTANT: Tous les utilisateurs authentifiés peuvent voir les documents
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
-- 5. CORRIGER LES POLITIQUES DE LA TABLE REPONSES (si elle existe)
-- ============================================

-- Supprimer TOUTES les politiques existantes de la table reponses
DO $$ 
DECLARE
    r RECORD;
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'reponses') THEN
        FOR r IN (SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'reponses') LOOP
            EXECUTE format('DROP POLICY IF EXISTS %I ON public.reponses', r.policyname);
        END LOOP;
    END IF;
END $$;

-- Recréer les politiques optimisées pour reponses (si la table existe)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'reponses') THEN
        -- Tous peuvent voir les réponses (même non authentifiés)
        EXECUTE 'CREATE POLICY "Public can view responses"
          ON public.reponses FOR SELECT
          USING (true)';
        
        -- Les admins peuvent tout faire
        EXECUTE 'CREATE POLICY "Admins can manage responses"
          ON public.reponses FOR ALL
          USING (
            EXISTS (
              SELECT 1 FROM public.profiles
              WHERE id = (select auth.uid()) AND role = ''admin''
            )
          )';
    END IF;
END $$;

-- ============================================
-- 6. CORRIGER LES POLITIQUES DE LA TABLE IMPORTS (si elle existe)
-- ============================================

-- Supprimer TOUTES les politiques existantes de la table imports
DO $$ 
DECLARE
    r RECORD;
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'imports') THEN
        FOR r IN (SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'imports') LOOP
            EXECUTE format('DROP POLICY IF EXISTS %I ON public.imports', r.policyname);
        END LOOP;
    END IF;
END $$;

-- Recréer les politiques optimisées pour imports (si la table existe)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'imports') THEN
        -- Seuls les admins peuvent gérer les imports
        EXECUTE 'CREATE POLICY "Admins can manage imports"
          ON public.imports FOR ALL
          USING (
            EXISTS (
              SELECT 1 FROM public.profiles
              WHERE id = (select auth.uid()) AND role = ''admin''
            )
          )';
    END IF;
END $$;

-- ============================================
-- 7. CRÉER/MAJ LA FONCTION is_admin() OPTIMISÉE
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
-- 8. VÉRIFICATIONS ET TESTS
-- ============================================

-- Afficher toutes les politiques créées
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename IN ('profiles', 'questions', 'question_likes', 'documents', 'reponses', 'imports')
ORDER BY tablename, policyname;

-- Vérifier que les questions approuvées sont accessibles
SELECT 
  COUNT(*) as total_questions,
  COUNT(*) FILTER (WHERE statut = 'approuve' AND (visible = true OR visible IS NULL)) as questions_visibles,
  COUNT(*) FILTER (WHERE statut IS NULL AND (visible = true OR visible IS NULL)) as questions_sans_statut
FROM public.questions;

-- Vérifier que les documents existent
SELECT COUNT(*) as total_documents FROM public.documents;
