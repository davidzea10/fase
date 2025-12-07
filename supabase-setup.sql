-- Script SQL pour configurer l'authentification et les profils
-- À exécuter dans l'éditeur SQL de Supabase (Dashboard > SQL Editor)

-- 1. Créer la table profiles pour stocker les informations des utilisateurs
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'etudiant' CHECK (role IN ('etudiant', 'admin')),
  nom TEXT,
  prenom TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. Activer Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Créer les politiques RLS pour la table profiles
-- Supprimer les anciennes policies si elles existent
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- Les utilisateurs peuvent lire leur propre profil
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Les utilisateurs peuvent mettre à jour leur propre profil
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Les utilisateurs peuvent insérer leur propre profil
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Les admins peuvent tout voir
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 4. Créer une fonction pour créer automatiquement un profil lors de l'inscription
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (
    NEW.id,
    NEW.email,
    'etudiant'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Créer un trigger pour appeler la fonction lors de la création d'un utilisateur
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 6. Ajouter les colonnes nécessaires à la table questions si elles n'existent pas
-- (Ces colonnes seront utilisées dans les prochaines étapes)
ALTER TABLE public.questions
  ADD COLUMN IF NOT EXISTS auteur_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS statut TEXT DEFAULT 'en_attente' CHECK (statut IN ('en_attente', 'approuve', 'rejete'));

-- 7. Mettre à jour les questions existantes pour qu'elles soient approuvées par défaut
-- (Pour la compatibilité avec les questions créées avant l'ajout du système de modération)
UPDATE public.questions
SET statut = 'approuve', visible = true
WHERE statut IS NULL OR statut = '';

-- 8. Activer RLS sur la table questions si ce n'est pas déjà fait
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;

-- 9. Mettre à jour les politiques RLS pour la table questions
-- Supprimer les anciennes policies si elles existent
DROP POLICY IF EXISTS "Questions approuvées sont visibles par tous" ON public.questions;
DROP POLICY IF EXISTS "Questions sans statut sont visibles" ON public.questions;
DROP POLICY IF EXISTS "Users can create questions" ON public.questions;
DROP POLICY IF EXISTS "Admins can manage all questions" ON public.questions;

-- Les utilisateurs peuvent voir les questions approuvées ET visibles
-- Cette politique permet aussi la lecture des questions sans statut (compatibilité)
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

-- Les admins peuvent tout faire sur les questions
CREATE POLICY "Admins can manage all questions"
  ON public.questions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 8. Créer un index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_questions_statut ON public.questions(statut);
CREATE INDEX IF NOT EXISTS idx_questions_auteur ON public.questions(auteur_id);

-- Note: Pour créer un administrateur, exécutez cette commande après avoir créé un compte:
-- UPDATE public.profiles SET role = 'admin' WHERE email = 'votre-email@exemple.com';

