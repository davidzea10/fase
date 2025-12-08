-- Script SQL pour créer la table likes et les politiques RLS
-- À exécuter dans l'éditeur SQL de Supabase (Dashboard > SQL Editor)

-- 1. Créer la table likes
CREATE TABLE IF NOT EXISTS public.question_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('like', 'dislike')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(question_id, user_id) -- Un utilisateur ne peut liker/disliker qu'une fois par question
);

-- 2. Créer des index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_question_likes_question_id ON public.question_likes(question_id);
CREATE INDEX IF NOT EXISTS idx_question_likes_user_id ON public.question_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_question_likes_type ON public.question_likes(type);

-- 3. Activer RLS
ALTER TABLE public.question_likes ENABLE ROW LEVEL SECURITY;

-- 4. Créer les politiques RLS
-- Les utilisateurs peuvent voir tous les likes
CREATE POLICY "Anyone can view likes"
  ON public.question_likes FOR SELECT
  USING (true);

-- Les utilisateurs authentifiés peuvent créer/modifier leur propre like
CREATE POLICY "Users can manage own likes"
  ON public.question_likes FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Les admins peuvent tout faire
CREATE POLICY "Admins can manage all likes"
  ON public.question_likes FOR ALL
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

