-- Script SQL pour permettre aux utilisateurs de voir TOUTES leurs propres questions
-- Y compris celles en attente (pour modification/suppression)
-- À exécuter dans l'éditeur SQL de Supabase (Dashboard > SQL Editor)

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
-- 2. Les questions répondues (statut = 'repondu')
-- 3. Leurs propres questions (même en attente) pour pouvoir les modifier/supprimer
CREATE POLICY "Students can view approved and answered questions"
  ON public.questions FOR SELECT
  USING (
    (statut = 'approuve' AND (visible = true OR visible IS NULL))
    OR 
    (statut = 'repondu' AND (visible = true OR visible IS NULL))
  );

-- Les utilisateurs peuvent voir TOUTES leurs propres questions (y compris en attente)
-- Cette politique permet de voir les questions pour modification/suppression
CREATE POLICY "Users can view own questions"
  ON public.questions FOR SELECT
  USING (
    auteur_id = auth.uid()
  );

-- Les utilisateurs authentifiés peuvent créer des questions
CREATE POLICY "Users can create questions"
  ON public.questions FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Les utilisateurs peuvent modifier leurs propres questions (seulement si pas encore répondue)
CREATE POLICY "Users can update own questions"
  ON public.questions FOR UPDATE
  USING (
    auteur_id = auth.uid() 
    AND statut != 'repondu' 
    AND statut != 'approuve'
  )
  WITH CHECK (
    auteur_id = auth.uid() 
    AND statut != 'repondu' 
    AND statut != 'approuve'
  );

-- Les utilisateurs peuvent supprimer leurs propres questions (seulement si pas encore répondue)
CREATE POLICY "Users can delete own questions"
  ON public.questions FOR DELETE
  USING (
    auteur_id = auth.uid() 
    AND statut != 'repondu' 
    AND statut != 'approuve'
  );

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
  qual,
  with_check
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

