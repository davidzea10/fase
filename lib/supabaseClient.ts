// lib/supabaseClient.ts
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// Ne pas lancer d'erreur au build time, seulement au runtime
if (typeof window !== "undefined" && (!supabaseUrl || !supabaseAnonKey)) {
  console.error("❌ Variables d'environnement Supabase manquantes!");
  console.error("NEXT_PUBLIC_SUPABASE_URL:", supabaseUrl ? "✅ Défini" : "❌ Manquant");
  console.error("NEXT_PUBLIC_SUPABASE_ANON_KEY:", supabaseAnonKey ? "✅ Défini" : "❌ Manquant");
}

// Créer le client même si les variables sont vides (pour éviter les erreurs au build)
// Les erreurs seront gérées au runtime dans les composants
export const supabase = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseAnonKey || "placeholder-key",
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
    db: {
      schema: "public",
    },
    global: {
      headers: {
        "x-client-info": "faculte-reponses",
      },
    },
  }
);