-- Script SQL pour corriger les politiques RLS pour les questions
-- À exécuter dans l'éditeur SQL de Supabase (Dashboard > SQL Editor)

-- ============================================
-- 1. Supprimer les anciennes politiques
-- ============================================
DROP POLICY IF EXISTS "Questions approuvées sont visibles par tous" ON public.questions;
DROP POLICY IF EXISTS "Questions sans statut sont visibles" ON public.questions;
DROP POLICY IF EXISTS "Users can create questions" ON public.questions;
DROP POLICY IF EXISTS "Admins can manage all questions" ON public.questions;

-- ============================================
-- 2. Vérifier que la fonction is_admin existe
-- ============================================
-- Si elle n'existe pas, la créer
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = user_id AND role = 'admin'
  );
END;
$$;

-- ============================================
-- 3. Recréer les politiques RLS pour les questions
-- ============================================

-- Les utilisateurs peuvent voir les questions approuvées ET visibles
CREATE POLICY "Questions approuvées sont visibles par tous"
  ON public.questions FOR SELECT
  USING (
    (statut = 'approuve' AND (visible = true OR visible IS NULL))
    OR 
    (statut IS NULL AND (visible = true OR visible IS NULL))
  );

-- Les utilisateurs authentifiés peuvent créer des questions
CREATE POLICY "Users can create questions"
  ON public.questions FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Les admins peuvent TOUT faire sur les questions (SELECT, INSERT, UPDATE, DELETE)
CREATE POLICY "Admins can manage all questions"
  ON public.questions FOR ALL
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- ============================================
-- 4. Vérifier que RLS est activé
-- ============================================
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 5. Vérifier les politiques créées
-- ============================================
SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'questions'
ORDER BY policyname;

