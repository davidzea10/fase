"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";

type Profile = {
  id: string;
  email: string;
  role: "etudiant" | "admin";
  nom?: string;
  prenom?: string;
};

type AuthContextType = {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any; data?: any }>;
  signUp: (email: string, password: string, nom?: string, prenom?: string) => Promise<{ error: any; data?: any }>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Vérifier la session actuelle
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    // Écouter les changements d'authentification
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchProfile(session.user.id);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        // Si le profil n'existe pas (code PGRST116 ou message indiquant aucune ligne)
        const isProfileNotFound = 
          error.code === "PGRST116" || 
          error.message?.includes("No rows") ||
          error.message?.includes("not found") ||
          error.code === "42P01"; // Table doesn't exist

        if (isProfileNotFound) {
          console.log("Profil non trouvé, création automatique...");
          // Récupérer les infos de l'utilisateur
          const { data: userData } = await supabase.auth.getUser();
          
          if (!userData?.user) {
            console.error("Impossible de récupérer les données utilisateur");
            setLoading(false);
            return;
          }

          // Créer le profil
          const newProfile = {
            id: userId,
            email: userData.user.email || "",
            role: "etudiant" as const,
          };

          const { data: createdProfile, error: insertError } = await supabase
            .from("profiles")
            .insert(newProfile)
            .select()
            .single();

          if (insertError) {
            console.error("Erreur lors de la création du profil:", insertError);
            // Si l'insertion échoue (peut-être à cause de RLS), on essaie quand même de continuer
            // Le trigger devrait créer le profil automatiquement
          } else {
            console.log("Profil créé avec succès:", createdProfile);
            setProfile(createdProfile);
          }
        } else {
          // Autre type d'erreur (RLS, permissions, etc.)
          console.error("Erreur lors de la récupération du profil:", {
            code: error.code,
            message: error.message,
            details: error.details,
            hint: error.hint,
          });
          
          // Essayer quand même de créer le profil si c'est une erreur de permission ou autre
          // Cela peut arriver si le profil n'existe pas mais l'erreur n'est pas PGRST116
          console.log("Tentative de création du profil après erreur...");
          const { data: userData } = await supabase.auth.getUser();
          
          if (userData?.user) {
            // D'abord vérifier si le profil existe vraiment
            const { data: checkProfile } = await supabase
              .from("profiles")
              .select("id")
              .eq("id", userId)
              .maybeSingle();
            
            if (!checkProfile) {
              // Le profil n'existe vraiment pas, on essaie de le créer
              const { data: createdProfile, error: insertError } = await supabase
                .from("profiles")
                .insert({
                  id: userId,
                  email: userData.user.email || "",
                  role: "etudiant",
                })
                .select()
                .single();
              
              if (insertError) {
                console.error("Impossible de créer le profil:", insertError);
                // Si l'insertion échoue à cause de RLS, on affiche un message clair
                if (insertError.code === "42501" || insertError.message?.includes("permission")) {
                  console.error("❌ ERREUR RLS: Les politiques de sécurité empêchent la création du profil.");
                  console.error("👉 Solution: Exécute le script SQL dans Supabase pour créer le profil manuellement.");
                }
              } else if (createdProfile) {
                console.log("✅ Profil créé avec succès:", createdProfile);
                setProfile(createdProfile);
              }
            } else {
              // Le profil existe mais on ne peut pas le lire (problème RLS)
              console.error("❌ Le profil existe mais les politiques RLS empêchent la lecture.");
              console.error("👉 Solution: Vérifie les politiques RLS dans Supabase.");
            }
          }
        }
      } else {
        // Profil trouvé avec succès
        setProfile(data);
      }
    } catch (err) {
      console.error("Erreur fetchProfile (catch):", err);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Erreur signIn Supabase:", {
          message: error.message,
          status: error.status,
          name: error.name,
        });
        return { error };
      }

      // Si la connexion réussit, mettre à jour l'état
      if (data.session) {
        setSession(data.session);
        setUser(data.user);
        if (data.user) {
          await fetchProfile(data.user.id);
        }
      }

      return { error: null, data };
    } catch (err) {
      console.error("Erreur inattendue lors de la connexion:", err);
      return { 
        error: { 
          message: "Une erreur inattendue s'est produite. Vérifie ta connexion internet.", 
          originalError: err 
        } 
      };
    }
  };

  const signUp = async (
    email: string,
    password: string,
    nom?: string,
    prenom?: string
  ) => {
    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // Désactiver la confirmation d'email pour le développement
        // En production, tu devras activer la confirmation d'email dans Supabase
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (authError) {
      console.error("Erreur signup Supabase:", authError);
      return { error: authError };
    }

    // Si l'utilisateur est créé (même non confirmé), créer le profil
    // Le trigger dans la base de données devrait le faire automatiquement,
    // mais on le fait aussi manuellement pour être sûr
    if (data.user) {
      // Vérifier si le profil existe déjà (créé par le trigger)
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", data.user.id)
        .single();

      // Si le profil n'existe pas, le créer
      if (!existingProfile) {
        const { error: profileError } = await supabase.from("profiles").insert({
          id: data.user.id,
          email: data.user.email || email,
          role: "etudiant",
          nom: nom || null,
          prenom: prenom || null,
        });

        if (profileError) {
          console.error("Erreur création profil:", profileError);
          // Ne pas retourner d'erreur ici car l'utilisateur est créé
          // Le trigger devrait créer le profil automatiquement
        }
      } else {
        // Mettre à jour le profil existant avec nom/prénom si fournis
        if (nom || prenom) {
          await supabase
            .from("profiles")
            .update({
              nom: nom || null,
              prenom: prenom || null,
            })
            .eq("id", data.user.id);
        }
      }
    }

    return { error: null, data };
  };

  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    // Redirection vers la page de connexion après déconnexion
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  };

  const value = {
    user,
    session,
    profile,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    isAdmin: profile?.role === "admin",
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

