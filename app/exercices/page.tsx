"use client";

import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";

type Document = {
  id: string;
  nom: string;
  niveau: 'L1' | 'L2' | 'L3' | 'MASTER1' | 'MASTER2';
  fichier_url: string;
  fichier_nom: string | null;
  taille_fichier: number | null;
  cree_le: string;
};

const NIVEAUX = ['L1', 'L2', 'L3', 'MASTER1', 'MASTER2'] as const;

export default function ExercicesPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedNiveau, setSelectedNiveau] = useState<'all' | typeof NIVEAUX[number]>('all');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading) {
      fetchDocuments();
    }
  }, [authLoading]);

  const fetchDocuments = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("documents")
      .select("id, nom, niveau, fichier_url, fichier_nom, taille_fichier, cree_le")
      .order("cree_le", { ascending: false });

    if (error) {
      console.error("Erreur chargement documents:", error);
    } else {
      setDocuments((data as Document[]) || []);
    }
    setLoading(false);
  };

  // Filtrer les documents par niveau et recherche
  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      const matchesNiveau = selectedNiveau === 'all' || doc.niveau === selectedNiveau;
      const matchesSearch = doc.nom.toLowerCase().includes(search.toLowerCase());
      return matchesNiveau && matchesSearch;
    });
  }, [documents, selectedNiveau, search]);

  // Grouper les documents par niveau pour l'affichage par rubriques
  const documentsByNiveau = useMemo(() => {
    const grouped: Record<string, Document[]> = {
      L1: [],
      L2: [],
      L3: [],
      MASTER1: [],
      MASTER2: [],
    };

    filteredDocuments.forEach((doc) => {
      if (grouped[doc.niveau]) {
        grouped[doc.niveau].push(doc);
      }
    });

    return grouped;
  }, [filteredDocuments]);

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return "Taille inconnue";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const handleDownload = async (url: string, nom: string, docId: string) => {
    setDownloadingId(docId);
    try {
      // Extraire le chemin du fichier depuis l'URL stockée
      // L'URL peut avoir plusieurs formats :
      // 1. https://xxx.supabase.co/storage/v1/object/public/battes/documents/filename.pdf
      // 2. https://xxx.supabase.co/storage/v1/object/sign/battes/documents/filename.pdf
      
      let path: string | null = null;
      
      console.log("URL originale:", url); // Debug
      
      // Méthode 1: Extraire directement depuis "/battes/"
      if (url.includes("/battes/")) {
        const urlParts = url.split("/battes/");
        if (urlParts.length > 1) {
          path = urlParts[1];
          // Nettoyer les paramètres de requête et les fragments s'il y en a
          path = path.split("?")[0].split("#")[0];
          // Supprimer les espaces et caractères spéciaux
          path = path.trim();
        }
      }
      
      // Méthode 2: Si ça ne fonctionne pas, essayer d'extraire depuis le domaine Supabase
      if (!path) {
        try {
          const urlObj = new URL(url);
          const pathname = urlObj.pathname;
          // Chercher le pattern /battes/ dans le pathname
          const battesIndex = pathname.indexOf("/battes/");
          if (battesIndex !== -1) {
            path = pathname.substring(battesIndex + "/battes/".length);
            path = path.split("?")[0].split("#")[0].trim();
          }
        } catch (e) {
          console.error("Erreur parsing URL:", e);
        }
      }
      
      if (!path) {
        console.error("URL invalide, impossible d'extraire le chemin:", url);
        alert("Erreur : format d'URL invalide. Veuillez contacter l'administrateur.");
        setDownloadingId(null);
        return;
      }

      console.log("Chemin extrait pour téléchargement:", path); // Debug

      // Générer une URL signée valide pendant 1 heure (3600 secondes)
      const { data, error } = await supabase.storage
        .from("battes")
        .createSignedUrl(path, 3600);

      if (error) {
        console.error("Erreur génération URL signée:", error);
        console.error("Chemin utilisé:", path);
        console.error("URL originale:", url);
        alert("Erreur lors du téléchargement : " + (error.message || "Fichier introuvable"));
        setDownloadingId(null);
        return;
      }

      // Ouvrir l'URL signée dans un nouvel onglet pour téléchargement
      if (data?.signedUrl) {
        console.log("URL signée générée avec succès"); // Debug
        window.open(data.signedUrl, "_blank");
      } else {
        alert("Erreur : impossible de générer l'URL de téléchargement");
      }
    } catch (err) {
      console.error("Erreur téléchargement:", err);
      alert("Erreur lors du téléchargement.");
    } finally {
      setDownloadingId(null);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center space-y-4">
          <div className="h-12 w-12 mx-auto border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-black/70">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <section className="space-y-6">
      {/* En-tête */}
      <div className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-black">Exercices</h1>
            <p className="mt-2 text-sm text-black/80">
              Téléchargez les exercices mis à disposition par la préfecture.
            </p>
          </div>
          {user && profile?.role === "admin" && (
            <Link
              href="/admin/exercices"
              className="rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-500"
            >
              Gérer les exercices
            </Link>
          )}
        </div>
      </div>

      {/* Barre de recherche et filtres */}
      <div className="space-y-4">
        <div className="rounded-2xl border border-black/5 bg-white p-4">
          <label className="flex flex-col text-sm text-black">
            Rechercher un exercice
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tapez le nom de l'exercice..."
              className="mt-1 rounded-xl border border-black/10 bg-white px-4 py-2 text-black outline-none ring-0 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </label>
        </div>

        {/* Filtres par niveau */}
        <div className="rounded-2xl border border-black/5 bg-white p-4">
          <p className="mb-3 text-sm font-medium text-black">Filtrer par niveau :</p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedNiveau('all')}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                selectedNiveau === 'all'
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-black/5 text-black/70 hover:bg-black/10"
              }`}
            >
              Tous
            </button>
            {NIVEAUX.map((niv) => (
              <button
                key={niv}
                onClick={() => setSelectedNiveau(niv)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  selectedNiveau === niv
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-black/5 text-black/70 hover:bg-black/10"
                }`}
              >
                {niv}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Affichage par rubriques si "Tous" est sélectionné */}
      {selectedNiveau === 'all' ? (
        <div className="space-y-8">
          {NIVEAUX.map((niv) => {
            const docs = documentsByNiveau[niv];
            if (docs.length === 0 && search) return null; // Ne pas afficher les rubriques vides si recherche active
            
            return (
              <div key={niv} className="space-y-4">
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-semibold text-black">{niv}</h2>
                  <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                    {docs.length} exercice{docs.length > 1 ? 's' : ''}
                  </span>
                </div>
                {docs.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-black/10 bg-white p-8 text-center">
                    <p className="text-sm text-black/60">
                      Aucun exercice disponible pour {niv}.
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {docs.map((doc) => (
                      <div
                        key={doc.id}
                        className="group rounded-2xl border border-black/10 bg-white p-5 shadow-sm transition hover:shadow-lg"
                      >
                        <div className="mb-4 flex items-start gap-3">
                          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-red-100 group-hover:bg-red-200 transition-colors">
                            <svg
                              className="h-7 w-7 text-red-600"
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
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-black line-clamp-2">{doc.nom}</h3>
                            <p className="mt-1 text-xs text-black/60">
                              {formatFileSize(doc.taille_fichier)}
                            </p>
                            <p className="mt-1 text-xs text-black/50">
                              {new Date(doc.cree_le).toLocaleDateString("fr-FR", {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              })}
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() => handleDownload(doc.fichier_url, doc.nom, doc.id)}
                          disabled={downloadingId === doc.id}
                          className="flex w-full items-center justify-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-100 hover:border-blue-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <svg
                            className="h-5 w-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                            />
                          </svg>
                          Télécharger
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* Affichage simple si un niveau spécifique est sélectionné */
        filteredDocuments.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-black/10 bg-white p-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
              <svg
                className="h-8 w-8 text-gray-400"
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
            <p className="text-sm text-black/60">
              {search
                ? `Aucun exercice ne correspond à votre recherche pour ${selectedNiveau}.`
                : `Aucun exercice disponible pour ${selectedNiveau}.`}
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredDocuments.map((doc) => (
              <div
                key={doc.id}
                className="group rounded-2xl border border-black/10 bg-white p-5 shadow-sm transition hover:shadow-lg"
              >
                <div className="mb-4 flex items-start gap-3">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-red-100 group-hover:bg-red-200 transition-colors">
                    <svg
                      className="h-7 w-7 text-red-600"
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
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-black line-clamp-2">{doc.nom}</h3>
                      <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700 flex-shrink-0">
                        {doc.niveau}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-black/60">
                      {formatFileSize(doc.taille_fichier)}
                    </p>
                    <p className="mt-1 text-xs text-black/50">
                      {new Date(doc.cree_le).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleDownload(doc.fichier_url, doc.nom, doc.id)}
                  disabled={downloadingId === doc.id}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-100 hover:border-blue-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {downloadingId === doc.id ? (
                    <>
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-700 border-t-transparent"></div>
                      <span>Génération...</span>
                    </>
                  ) : (
                    <>
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                        />
                      </svg>
                      <span>Télécharger</span>
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        )
      )}

      {/* Statistiques */}
      {filteredDocuments.length > 0 && (
        <div className="rounded-2xl border border-black/5 bg-white p-4 text-center">
          <p className="text-sm text-black/60">
            {filteredDocuments.length} exercice{filteredDocuments.length > 1 ? "s" : ""} disponible
            {filteredDocuments.length > 1 ? "s" : ""}
            {selectedNiveau !== 'all' && ` pour ${selectedNiveau}`}
            {search && ` correspondant à "${search}"`}
          </p>
        </div>
      )}
    </section>
  );
}

