"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

type FormState = {
  titre: string;
  intitule_question: string;
  theme: string;
  texte_reponse: string;
  statut: "en_attente" | "repondu";
  visible: boolean;
};

export default function AdminNewQuestionPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>({
    titre: "",
    intitule_question: "",
    theme: "",
    texte_reponse: "",
    statut: "repondu",
    visible: true,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    // Construire l'objet en ne gardant que les champs non vides
    const payload: Record<string, unknown> = {
      statut: form.statut,
      visible: form.visible,
    };

    if (form.titre.trim()) payload.titre = form.titre.trim();
    if (form.intitule_question.trim())
      payload.intitule_question = form.intitule_question.trim();
    if (form.theme.trim()) payload.theme = form.theme.trim();
    if (form.texte_reponse.trim())
      payload.texte_reponse = form.texte_reponse.trim();

    try {
      const { error: insertError } = await supabase
        .from("questions")
        .insert(payload);

      if (insertError) {
        console.error("Erreur insertion question:", insertError);
        setError("Impossible d’enregistrer la question. Vérifie tes droits.");
      } else {
        setSuccess("Question enregistrée avec succès.");
        // Retour au tableau admin après un court délai
        setTimeout(() => {
          router.push("/admin");
        }, 800);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h2 className="text-lg font-semibold text-black">
          Ajouter une nouvelle question
        </h2>
        <p className="text-xs text-black/70">
          Seul le titre est vraiment recommandé. Les autres champs sont
          facultatifs et peuvent être complétés plus tard.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1">
          <label className="text-sm font-medium text-black">
            Titre (résumé de la question)
          </label>
          <input
            type="text"
            value={form.titre}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, titre: event.target.value }))
            }
            placeholder="Ex : Report de l’examen de macroéconomie"
            className="w-full rounded-xl border border-black/10 bg-white px-4 py-2 text-sm text-black outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-black">
            Question complète (telle que posée par l’étudiant)
            <span className="ml-1 text-xs font-normal text-black/70">
              (optionnel)
            </span>
          </label>
          <textarea
            value={form.intitule_question}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                intitule_question: event.target.value,
              }))
            }
            rows={3}
            placeholder="Texte complet de la question si tu souhaites le conserver."
            className="w-full rounded-xl border border-black/10 bg-white px-4 py-2 text-sm text-black outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1">
            <label className="text-sm font-medium text-black">
              Thématique
              <span className="ml-1 text-xs font-normal text-black/70">
                (optionnel)
              </span>
            </label>
            <input
              type="text"
              value={form.theme}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, theme: event.target.value }))
              }
              placeholder="Ex : Examens, Scolarité, Stages…"
              className="w-full rounded-xl border border-black/10 bg-white px-4 py-2 text-sm text-black outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-black">
              Statut
            </label>
            <select
              value={form.statut}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  statut: event.target.value as FormState["statut"],
                }))
              }
              className="w-full rounded-xl border border-black/10 bg-white px-4 py-2 text-sm text-black outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="en_attente">En attente de réponse</option>
              <option value="repondu">Réponse déjà saisie</option>
            </select>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-black">
            Réponse officielle de la faculté
            <span className="ml-1 text-xs font-normal text-black/70">
              (optionnel)
            </span>
          </label>
          <textarea
            value={form.texte_reponse}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                texte_reponse: event.target.value,
              }))
            }
            rows={5}
            placeholder="Rédige ici la réponse qui sera affichée aux étudiants."
            className="w-full rounded-xl border border-black/10 bg-white px-4 py-2 text-sm text-black outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            id="visible"
            type="checkbox"
            checked={form.visible}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, visible: event.target.checked }))
            }
            className="h-4 w-4 rounded border-black/20 bg-white text-blue-600"
          />
          <label htmlFor="visible" className="text-sm text-black">
            Rendre cette question visible immédiatement pour les étudiants
          </label>
        </div>

        {error && (
          <p className="text-sm text-black" role="alert">
            {error}
          </p>
        )}
        {success && (
          <p className="text-sm text-blue-600" role="status">
            {success}
          </p>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Enregistrement..." : "Enregistrer la question"}
          </button>
        </div>
      </form>
    </div>
  );
}


