-- ============================================
-- Script SQL pour confirmer les utilisateurs
-- ============================================
-- À exécuter dans l'éditeur SQL de Supabase (Dashboard > SQL Editor)
-- 
-- IMPORTANT : Même si tu as désactivé la confirmation d'email dans Supabase,
-- les utilisateurs créés AVANT cette désactivation ne sont toujours pas confirmés.
-- Ce script les confirme tous.

-- ============================================
-- Option 1 : Confirmer TOUS les utilisateurs non confirmés
-- ============================================
-- Exécute cette commande pour confirmer tous les utilisateurs existants
UPDATE auth.users 
SET email_confirmed_at = COALESCE(email_confirmed_at, NOW())
WHERE email_confirmed_at IS NULL;

-- ============================================
-- Option 2 : Confirmer un utilisateur spécifique par email
-- ============================================
-- Remplace 'ton-email@exemple.com' par l'email de l'utilisateur
-- Décommente les lignes ci-dessous et remplace l'email :
/*
UPDATE auth.users 
SET email_confirmed_at = NOW()
WHERE email = 'ton-email@exemple.com' 
  AND email_confirmed_at IS NULL;
*/

-- ============================================
-- Option 3 : Voir tous les utilisateurs non confirmés
-- ============================================
-- Décommente pour voir la liste des utilisateurs non confirmés :
/*
SELECT 
  id, 
  email, 
  email_confirmed_at, 
  created_at,
  CASE 
    WHEN email_confirmed_at IS NULL THEN '❌ Non confirmé'
    ELSE '✅ Confirmé'
  END as statut
FROM auth.users 
ORDER BY created_at DESC;
*/

-- ============================================
-- Option 4 : Voir un utilisateur spécifique
-- ============================================
-- Pour vérifier le statut d'un utilisateur :
/*
SELECT 
  id, 
  email, 
  email_confirmed_at, 
  created_at,
  CASE 
    WHEN email_confirmed_at IS NULL THEN '❌ Non confirmé'
    ELSE '✅ Confirmé'
  END as statut
FROM auth.users 
WHERE email = 'ton-email@exemple.com';
*/

