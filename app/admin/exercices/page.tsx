"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Document = {
  id: string;
  nom: string;
  niveau: 'L1' | 'L2' | 'L3' | 'MASTER1' | 'MASTER2';
  fichier_url: string;
  fichier_nom: string | null;
  taille_fichier: number | null;
  auteur_id: string | null;
  cree_le: string;
};

const NIVEAUX = ['L1', 'L2', 'L3', 'MASTER1', 'MASTER2'] as const;

export default function AdminExercicesPage() {
  const router = useRouter();
  const { user, profile, loading: authLoading } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [nom, setNom] = useState("");
  const [niveau, setNiveau] = useState<'L1' | 'L2' | 'L3' | 'MASTER1' | 'MASTER2'>('L1');
  const [error, setError] = useState("");

  // Vérifier que l'utilisateur est admin
  useEffect(() => {
    if (!authLoading && (!user || profile?.role !== "admin")) {
      router.push("/");
    }
  }, [user, profile, authLoading, router]);

  useEffect(() => {
    if (user && profile?.role === "admin") {
      fetchDocuments();
    }
  }, [user, profile]);

  const fetchDocuments = async () => {
    const { data, error } = await supabase
      .from("documents")
      .select("*")
      .order("cree_le", { ascending: false });

    if (error) {
      console.error("Erreur chargement documents:", error);
      setError("Erreur lors du chargement des exercices.");
    } else {
      setDocuments((data as Document[]) || []);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      // Vérifier que c'est un PDF
      if (selectedFile.type !== "application/pdf") {
        setError("Seuls les fichiers PDF sont autorisés.");
        return;
      }
      // Vérifier la taille (max 10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError("Le fichier ne doit pas dépasser 10MB.");
        return;
      }
      setFile(selectedFile);
      setError("");
      // Définir le nom par défaut si vide
      if (!nom.trim()) {
        setNom(selectedFile.name.replace(/.pdf$/i, ""));
      }
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !nom.trim()) {
      setError("Veuillez sélectionner un fichier et entrer un nom.");
      return;
    }

    setUploading(true);
    setError("");

    try {
      // 1. Uploader le fichier dans Supabase Storage (bucket "battes" dans la BDD)
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `documents/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("battes")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        console.error("Erreur upload:", uploadError);
        setError("Erreur lors de l'upload du fichier. " + uploadError.message);
        setUploading(false);
        return;
      }

      // 2. Obtenir l'URL publique du fichier
      const { data: urlData } = supabase.storage
        .from("battes")
        .getPublicUrl(filePath);

      // 3. Enregistrer les métadonnées dans la table documents
      const { error: insertError } = await supabase.from("documents").insert({
        nom: nom.trim(),
        niveau: niveau,
        fichier_url: urlData.publicUrl,
        fichier_nom: file.name,
        taille_fichier: file.size,
        auteur_id: user?.id,
      });

      if (insertError) {
        console.error("Erreur insertion:", insertError);
        // Supprimer le fichier uploadé en cas d'erreur
        await supabase.storage.from("battes").remove([filePath]);
        setError("Erreur lors de l'enregistrement. " + insertError.message);
        setUploading(false);
        return;
      }

      // 4. Réinitialiser le formulaire et recharger la liste
      setFile(null);
      setNom("");
      setNiveau('L1');
      setError("");
      await fetchDocuments();
    } catch (err) {
      console.error("Erreur inattendue:", err);
      setError("Une erreur inattendue s'est produite.");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (documentId: string, fileUrl: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet exercice ?")) {
      return;
    }

    try {
      // Extraire le chemin du fichier depuis l'URL (bucket "battes" dans la BDD)
      const urlParts = fileUrl.split("/battes/");
      const filePath = urlParts.length > 1 ? `documents/${urlParts[1]}` : null;

      // Supprimer de la base de données
      const { error: deleteError } = await supabase
        .from("documents")
        .delete()
        .eq("id", documentId);

      if (deleteError) {
        console.error("Erreur suppression:", deleteError);
        setError("Erreur lors de la suppression.");
        return;
      }

      // Supprimer le fichier du storage si le chemin est valide
      if (filePath) {
        await supabase.storage.from("battes").remove([filePath]);
      }

      await fetchDocuments();
    } catch (err) {
      console.error("Erreur suppression:", err);
      setError("Erreur lors de la suppression.");
    }
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return "Taille inconnue";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  if (authLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center space-y-4">
          <div className="h-12 w-12 mx-auto border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-black/70">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!user || profile?.role !== "admin") {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-black">Gestion des Exercices</h1>
            <p className="mt-2 text-sm text-black/80">
              Téléchargez des exercices PDF que les étudiants pourront consulter et télécharger.
            </p>
          </div>
          <Link
            href="/exercices"
            className="rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-500"
          >
            Voir la page publique
          </Link>
        </div>
      </div>

      {/* Formulaire d'upload */}
      <div className="rounded-2xl border border-blue-200 bg-blue-50/30 p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-black">Ajouter un exercice</h2>
        <form onSubmit={handleUpload} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-black">
                Nom de l'exercice *
              </label>
              <input
                type="text"
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                placeholder="Ex: Exercice Mathématiques 2023"
                required
                className="w-full rounded-xl border border-black/10 bg-white px-4 py-2 text-sm text-black outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-black">
                Niveau *
              </label>
              <select
                value={niveau}
                onChange={(e) => setNiveau(e.target.value as typeof niveau)}
                required
                className="w-full rounded-xl border border-black/10 bg-white px-4 py-2 text-sm text-black outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                {NIVEAUX.map((niv) => (
                  <option key={niv} value={niv}>
                    {niv}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-black">
              Fichier PDF *
            </label>
            <input
              type="file"
              accept=".pdf,application/pdf"
              onChange={handleFileChange}
              required
              className="w-full rounded-xl border border-black/10 bg-white px-4 py-2 text-sm text-black outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {file && (
              <p className="mt-2 text-xs text-black/60">
                Fichier sélectionné : {file.name} ({(file.size / 1024).toFixed(1)} KB)
              </p>
            )}
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={uploading || !file || !nom.trim()}
            className="rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {uploading ? "Upload en cours..." : "Télécharger l'exercice"}
          </button>
        </form>
      </div>

      {/* Liste des documents */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-black">Exercices existants ({documents.length})</h2>
        {documents.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-black/10 bg-white p-8 text-center">
            <p className="text-sm text-black/60">Aucun exercice téléchargé pour le moment.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm transition hover:shadow-lg"
              >
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100">
                        <svg
                          className="h-6 w-6 text-red-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-black">{doc.nom}</h3>
                          <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">
                            {doc.niveau}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-black/60">
                          {doc.fichier_nom || "Fichier PDF"} • {formatFileSize(doc.taille_fichier)}
                        </p>
                        <p className="mt-1 text-xs text-black/50">
                          Ajouté le {new Date(doc.cree_le).toLocaleDateString("fr-FR")}
                        </p>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(doc.id, doc.fichier_url)}
                    className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

