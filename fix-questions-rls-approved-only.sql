-- Script SQL pour corriger les politiques RLS des questions
-- Seules les questions approuvées doivent être visibles par les étudiants
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

-- IMPORTANT: Seules les questions approuvées sont visibles par le public/étudiants
-- On supprime la partie "OR (statut IS NULL...)" pour que les questions non approuvées
-- ne soient visibles QUE par les admins
CREATE POLICY "Questions approuvées sont visibles par tous"
  ON public.questions FOR SELECT
  USING (
    statut = 'approuve' AND (visible = true OR visible IS NULL)
  );

-- Les utilisateurs authentifiés peuvent créer des questions
CREATE POLICY "Users can create questions"
  ON public.questions FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Les admins peuvent voir TOUTES les questions (y compris celles non approuvées)
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

