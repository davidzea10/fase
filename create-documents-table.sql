-- Script SQL pour créer la table documents et configurer RLS
-- À exécuter dans l'éditeur SQL de Supabase (Dashboard > SQL Editor)

-- 1. Créer la table documents
CREATE TABLE IF NOT EXISTS public.documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nom TEXT NOT NULL,
  niveau TEXT NOT NULL CHECK (niveau IN ('L1', 'L2', 'L3', 'MASTER1', 'MASTER2')),
  fichier_url TEXT NOT NULL,
  fichier_nom TEXT, -- Nom original du fichier
  taille_fichier BIGINT, -- Taille en octets
  auteur_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  cree_le TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. Créer des index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_documents_auteur ON public.documents(auteur_id);
CREATE INDEX IF NOT EXISTS idx_documents_cree_le ON public.documents(cree_le DESC);

-- Index pour niveau (créé seulement si la colonne existe)
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'documents' 
    AND column_name = 'niveau'
  ) THEN
    CREATE INDEX IF NOT EXISTS idx_documents_niveau ON public.documents(niveau);
  END IF;
END $$;

-- 3. Activer RLS
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- 4. Créer les politiques RLS
-- Tous les utilisateurs authentifiés peuvent voir les documents
CREATE POLICY "Authenticated users can view documents"
  ON public.documents FOR SELECT
  USING (auth.role() = 'authenticated');

-- Seuls les admins peuvent créer des documents
CREATE POLICY "Admins can create documents"
  ON public.documents FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Seuls les admins peuvent modifier des documents
CREATE POLICY "Admins can update documents"
  ON public.documents FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Seuls les admins peuvent supprimer des documents
CREATE POLICY "Admins can delete documents"
  ON public.documents FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 5. Créer une fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION public.update_documents_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Créer un trigger pour mettre à jour updated_at
DROP TRIGGER IF EXISTS update_documents_updated_at ON public.documents;
CREATE TRIGGER update_documents_updated_at
  BEFORE UPDATE ON public.documents
  FOR EACH ROW
  EXECUTE FUNCTION public.update_documents_updated_at();

