-- Script SQL pour ajouter la colonne niveau à la table documents (si la table existe déjà)
-- À exécuter dans l'éditeur SQL de Supabase (Dashboard > SQL Editor)

-- Étape 1 : Ajouter la colonne niveau comme nullable d'abord
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'documents' 
    AND column_name = 'niveau'
  ) THEN
    ALTER TABLE public.documents
      ADD COLUMN niveau TEXT;
  END IF;
END $$;

-- Étape 2 : Mettre à jour les documents existants avec une valeur par défaut (L1)
UPDATE public.documents
SET niveau = 'L1'
WHERE niveau IS NULL;

-- Étape 3 : Ajouter la contrainte CHECK
DO $$ 
BEGIN
  -- Supprimer la contrainte si elle existe déjà
  ALTER TABLE public.documents DROP CONSTRAINT IF EXISTS documents_niveau_check;
  
  -- Ajouter la nouvelle contrainte
  ALTER TABLE public.documents
    ADD CONSTRAINT documents_niveau_check 
    CHECK (niveau IN ('L1', 'L2', 'L3', 'MASTER1', 'MASTER2'));
END $$;

-- Étape 4 : Rendre la colonne obligatoire (NOT NULL)
ALTER TABLE public.documents
  ALTER COLUMN niveau SET NOT NULL;

-- Étape 5 : Créer un index sur la colonne niveau
CREATE INDEX IF NOT EXISTS idx_documents_niveau ON public.documents(niveau);

