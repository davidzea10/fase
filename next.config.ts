import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Désactiver le pré-rendu statique pour éviter les erreurs avec Supabase
  // Toutes les pages sont dynamiques et nécessitent l'authentification
  output: 'standalone',
  
  // Permettre les images externes si nécessaire
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
  },
};

export default nextConfig;
