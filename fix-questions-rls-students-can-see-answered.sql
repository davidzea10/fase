-- Script SQL pour corriger les politiques RLS des questions
-- Les étudiants doivent voir les questions approuvées ET répondues
-- Les admins peuvent voir toutes les questions

-- ============================================
-- 1. SUPPRIMER LES ANCIENNES POLITIQUES
-- ============================================

DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'questions') LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.questions', r.policyname);
    END LOOP;
END $$;

-- ============================================
-- 2. RECRÉER LES POLITIQUES CORRIGÉES
-- ============================================

-- IMPORTANT: Les étudiants peuvent voir :
-- 1. Les questions approuvées (statut = 'approuve')
-- 2. Les questions répondues par les admins (statut = 'repondu')
-- Les questions en attente (statut = 'en_attente' ou NULL) ne sont visibles QUE par les admins
CREATE POLICY "Students can view approved and answered questions"
  ON public.questions FOR SELECT
  USING (
    (statut = 'approuve' AND (visible = true OR visible IS NULL))
    OR 
    (statut = 'repondu' AND (visible = true OR visible IS NULL))
  );

-- Les utilisateurs authentifiés peuvent créer des questions
CREATE POLICY "Users can create questions"
  ON public.questions FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Les admins peuvent voir TOUTES les questions (y compris celles en attente)
CREATE POLICY "Admins can manage all questions"
  ON public.questions FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ============================================
-- 3. VÉRIFICATION
-- ============================================

-- Afficher les politiques créées
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'questions'
ORDER BY policyname;

-- Vérifier le nombre de questions par statut
SELECT 
  statut,
  COUNT(*) as nombre,
  COUNT(*) FILTER (WHERE visible = true) as visibles
FROM public.questions
GROUP BY statut
ORDER BY statut;

-- Vérifier combien de questions les étudiants peuvent voir
SELECT 
  COUNT(*) as questions_visibles_par_etudiants
FROM public.questions
WHERE (statut = 'approuve' OR statut = 'repondu') 
  AND (visible = true OR visible IS NULL);

