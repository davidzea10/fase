-- Script de correction rapide pour les politiques RLS sur la table questions
-- À exécuter si tu as des erreurs de lecture des questions

-- 1. Mettre à jour les questions existantes pour qu'elles soient approuvées
UPDATE public.questions
SET statut = 'approuve', visible = true
WHERE statut IS NULL OR statut = '';

-- 2. Supprimer toutes les anciennes policies sur questions
DROP POLICY IF EXISTS "Questions approuvées sont visibles par tous" ON public.questions;
DROP POLICY IF EXISTS "Questions sans statut sont visibles" ON public.questions;
DROP POLICY IF EXISTS "Users can create questions" ON public.questions;
DROP POLICY IF EXISTS "Admins can manage all questions" ON public.questions;

-- 3. Créer une politique simple qui permet la lecture de toutes les questions visibles
-- (Pour le développement, on peut être plus permissif)
CREATE POLICY "Questions visibles sont accessibles à tous"
  ON public.questions FOR SELECT
  USING (
    visible = true 
    OR visible IS NULL
    OR statut = 'approuve'
    OR statut IS NULL
  );

-- 4. Les utilisateurs authentifiés peuvent créer des questions
CREATE POLICY "Users can create questions"
  ON public.questions FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- 5. Les admins peuvent tout faire sur les questions
CREATE POLICY "Admins can manage all questions"
  ON public.questions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

