-- Script SQL pour la logique finale des questions
-- Les questions en attente ne sont visibles QUE dans "Mes questions" et chez l'admin
-- Pas dans "Toutes les questions" ni sur l'accueil
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

-- IMPORTANT: Les étudiants peuvent voir UNIQUEMENT les questions approuvées/répondues publiques
-- Cette politique s'applique aux requêtes générales (sans filtre auteur_id)
-- EXCLUT explicitement les questions en attente (statut = 'en_attente' ou NULL)
CREATE POLICY "Public can view approved and answered questions"
  ON public.questions FOR SELECT
  USING (
    visible = true
    AND (statut = 'approuve' OR statut = 'repondu')
    AND statut != 'en_attente'
    AND statut IS NOT NULL
  );

-- Les utilisateurs peuvent voir leurs propres questions en attente
-- Cette politique permet de les voir dans "Mes questions" (avec filtre auteur_id)
-- IMPORTANT: Cette politique nécessite auteur_id = auth.uid(), donc elle ne s'applique
-- que quand l'utilisateur filtre ses propres questions
CREATE POLICY "Users can view own pending questions"
  ON public.questions FOR SELECT
  USING (
    auteur_id = auth.uid() 
    AND (visible = false OR visible IS NULL)
    AND (statut = 'en_attente' OR statut IS NULL OR statut = '')
  );

-- Les utilisateurs peuvent aussi voir leurs propres questions répondues
-- (pour les voir dans "Mes questions")
CREATE POLICY "Users can view own answered questions"
  ON public.questions FOR SELECT
  USING (
    auteur_id = auth.uid() 
    AND (statut = 'repondu' OR statut = 'approuve')
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
  COUNT(*) FILTER (WHERE visible = true) as visibles_publiques,
  COUNT(*) FILTER (WHERE visible = false OR visible IS NULL) as non_visibles
FROM public.questions
GROUP BY statut
ORDER BY statut;

