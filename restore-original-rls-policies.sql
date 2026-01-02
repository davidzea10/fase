-- Script SQL pour RESTAURER les politiques RLS à leur état d'origine
-- À exécuter dans l'éditeur SQL de Supabase (Dashboard > SQL Editor)
-- Ce script restaure les politiques originales AVANT les modifications de performance

-- ============================================
-- 1. RESTAURER LES POLITIQUES DE LA TABLE PROFILES
-- ============================================

-- Supprimer TOUTES les politiques existantes
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

-- Recréer les politiques ORIGINALES (sans optimisation pour éviter la récursion)
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- IMPORTANT: Ne PAS créer de politique pour que les admins voient tous les profils
-- car cela crée une récursion infinie (la politique lit profiles qui déclenche la politique...)
-- Les admins peuvent utiliser leur propre profil et gérer les autres tables.

-- ============================================
-- 2. RESTAURER LES POLITIQUES DE LA TABLE QUESTIONS
-- ============================================

-- Supprimer TOUTES les politiques existantes
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

-- Recréer les politiques CORRIGÉES
-- IMPORTANT: Seules les questions approuvées sont visibles par les étudiants
-- Les questions non approuvées (statut IS NULL ou statut != 'approuve') ne sont visibles QUE par les admins
CREATE POLICY "Questions approuvées sont visibles par tous"
  ON public.questions FOR SELECT
  USING (
    statut = 'approuve' AND (visible = true OR visible IS NULL)
  );

CREATE POLICY "Users can create questions"
  ON public.questions FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Créer la fonction is_admin() avec SECURITY DEFINER pour éviter la récursion
-- Cette fonction bypass les politiques RLS grâce à SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role TEXT;
BEGIN
  -- Récupérer directement le rôle depuis la table sans déclencher RLS
  SELECT role INTO user_role
  FROM public.profiles
  WHERE id = auth.uid();
  
  RETURN COALESCE(user_role, 'etudiant') = 'admin';
END;
$$ LANGUAGE plpgsql;

-- Politique pour les admins (utilise la fonction SECURITY DEFINER pour éviter la récursion)
CREATE POLICY "Admins can manage all questions"
  ON public.questions FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ============================================
-- 3. RESTAURER LES POLITIQUES DE LA TABLE QUESTION_LIKES
-- ============================================

-- Supprimer TOUTES les politiques existantes
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'question_likes') LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.question_likes', r.policyname);
    END LOOP;
END $$;

-- Recréer les politiques ORIGINALES
CREATE POLICY "Anyone can view likes"
  ON public.question_likes FOR SELECT
  USING (true);

CREATE POLICY "Users can manage own likes"
  ON public.question_likes FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all likes"
  ON public.question_likes FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ============================================
-- 4. RESTAURER LES POLITIQUES DE LA TABLE DOCUMENTS
-- ============================================

-- Supprimer TOUTES les politiques existantes
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'documents') LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.documents', r.policyname);
    END LOOP;
END $$;

-- Recréer les politiques ORIGINALES
CREATE POLICY "Authenticated users can view documents"
  ON public.documents FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can create documents"
  ON public.documents FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update documents"
  ON public.documents FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "Admins can delete documents"
  ON public.documents FOR DELETE
  USING (public.is_admin());

-- ============================================
-- 5. RESTAURER LES POLITIQUES DE LA TABLE REPONSES (si elle existe)
-- ============================================

DO $$ 
DECLARE
    r RECORD;
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'reponses') THEN
        FOR r IN (SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'reponses') LOOP
            EXECUTE format('DROP POLICY IF EXISTS %I ON public.reponses', r.policyname);
        END LOOP;
        
        -- Recréer les politiques
        EXECUTE 'CREATE POLICY "Public can view responses"
          ON public.reponses FOR SELECT
          USING (true)';
        
        EXECUTE 'CREATE POLICY "Admins can manage responses"
          ON public.reponses FOR ALL
          USING (public.is_admin())
          WITH CHECK (public.is_admin())';
    END IF;
END $$;

-- ============================================
-- 6. RESTAURER LES POLITIQUES DE LA TABLE IMPORTS (si elle existe)
-- ============================================

DO $$ 
DECLARE
    r RECORD;
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'imports') THEN
        FOR r IN (SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'imports') LOOP
            EXECUTE format('DROP POLICY IF EXISTS %I ON public.imports', r.policyname);
        END LOOP;
        
        EXECUTE 'CREATE POLICY "Admins can manage imports"
          ON public.imports FOR ALL
          USING (public.is_admin())
          WITH CHECK (public.is_admin())';
    END IF;
END $$;

-- ============================================
-- 7. RESTAURER LE TRIGGER POUR LA CRÉATION AUTOMATIQUE DES PROFILS
-- ============================================

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
-- 8. VÉRIFICATIONS
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

-- Vérifier que tous les utilisateurs ont un profil
SELECT 
  COUNT(DISTINCT u.id) as total_users,
  COUNT(DISTINCT p.id) as total_profiles,
  COUNT(DISTINCT u.id) - COUNT(DISTINCT p.id) as users_sans_profil
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id;

