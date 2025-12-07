-- Script pour permettre la lecture publique des questions
-- À exécuter dans Supabase SQL Editor

-- 1. S'assurer que RLS est activé
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;

-- 2. Supprimer toutes les anciennes policies sur questions
DROP POLICY IF EXISTS "Questions approuvées sont visibles par tous" ON public.questions;
DROP POLICY IF EXISTS "Questions sans statut sont visibles" ON public.questions;
DROP POLICY IF EXISTS "Questions visibles sont accessibles à tous" ON public.questions;
DROP POLICY IF EXISTS "Public can read approved questions" ON public.questions;
DROP POLICY IF EXISTS "Users can create questions" ON public.questions;
DROP POLICY IF EXISTS "Admins can manage all questions" ON public.questions;

-- 3. Mettre à jour les questions existantes pour qu'elles soient approuvées
UPDATE public.questions
SET statut = 'approuve', visible = true
WHERE statut IS NULL OR statut = '';

-- 4. Créer une politique qui permet la lecture PUBLIQUE (anonyme) des questions approuvées
-- Cette politique permet à TOUS (même non connectés) de lire les questions approuvées
CREATE POLICY "Public can read approved questions"
  ON public.questions FOR SELECT
  TO public
  USING (
    (statut = 'approuve' AND (visible = true OR visible IS NULL))
    OR 
    (statut IS NULL AND (visible = true OR visible IS NULL))
  );

-- 5. Les utilisateurs authentifiés peuvent créer des questions
CREATE POLICY "Users can create questions"
  ON public.questions FOR INSERT
  TO authenticated
  WITH CHECK (auth.role() = 'authenticated');

-- 6. Les admins peuvent tout faire sur les questions (SELECT, INSERT, UPDATE, DELETE)
CREATE POLICY "Admins can manage all questions"
  ON public.questions FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

