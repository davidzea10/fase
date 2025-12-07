"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

type Question = {
  id: string;
  titre: string;
  theme: string | null;
  intitule_question?: string | null;
  texte_reponse?: string | null;
  description?: string | null;
  cree_le: string;
};

export default function QuestionDetailPage() {
  const params = useParams<{ id: string }>();
  const [question, setQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuestion = async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from("questions")
          .select("*")
          .eq("id", params.id)
          .maybeSingle();

        if (fetchError) {
          console.error("Erreur chargement question:", fetchError);
          setError("Impossible de charger cette question.");
          return;
        }

        setQuestion((data as Question) ?? null);
      } finally {
        setLoading(false);
      }
    };

    if (params?.id) {
      fetchQuestion();
    }
  }, [params]);

  if (loading) {
    return (
      <section className="rounded-3xl border border-black/5 bg-white p-8 text-black">
        <p className="text-sm text-black/80">Chargement de la question…</p>
      </section>
    );
  }

  if (error || !question) {
    return (
      <section className="rounded-3xl border border-black/5 bg-white p-8 text-black">
        <h1 className="text-lg font-semibold text-black">
          Question introuvable
        </h1>
        <p className="mt-2 text-sm text-black/80">
          Cette question n&apos;existe pas ou n&apos;est plus disponible.
          Retourne à la liste des questions pour en consulter d&apos;autres.
        </p>
      </section>
    );
  }

  const questionTexte = question.intitule_question ?? question.titre;
  const reponseTexte =
    question.texte_reponse ??
    question.description ??
    "La réponse officielle sera publiée prochainement par la faculté.";

  return (
    <section className="space-y-6 rounded-3xl border border-black/5 bg-white p-8 text-black">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-wide text-blue-600">
          {question.theme ?? "Autres"}
        </p>
        <h1 className="text-2xl font-semibold text-black">{questionTexte}</h1>
      </header>

      <div className="grid gap-6 md:grid-cols-[3fr,2fr]">
        <article className="space-y-3 rounded-2xl border border-black/5 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-black/70">
            Réponse de la faculté
          </h2>
          <p className="whitespace-pre-line text-sm leading-relaxed text-black/80">
            {reponseTexte}
          </p>
        </article>

        <aside className="space-y-3 rounded-2xl border border-black/5 bg-white p-5 text-sm text-black/80 shadow-sm">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-black/70">
            Informations
          </h3>
          <ul className="space-y-1">
            <li>
              <span className="text-black/60">Thème :</span>{" "}
              <span className="text-black">
                {question.theme ?? "Non renseigné"}
              </span>
            </li>
            <li>
              <span className="text-black/60">ID interne :</span>{" "}
              <span className="font-mono text-xs text-black/80">
                {question.id}
              </span>
            </li>
          </ul>
          <p className="mt-3 text-xs text-black/60">
            Les questions sont affichées sans les noms des étudiants. Seul le
            contenu de la question et la réponse officielle sont visibles ici.
          </p>
        </aside>
      </div>
    </section>
  );
}