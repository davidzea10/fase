"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Question = {
  id: string;
  titre: string;
  theme: string | null;
  statut?: string | null;
  visible?: boolean | null;
};

export default function AdminDashboardPage() {
  const [questions, setQuestions] = useState<Question[]>([]);

  useEffect(() => {
    const fetchQuestions = async () => {
      const { data, error } = await supabase
        .from("questions")
        .select("id, titre, theme, statut, visible")
        .order("cree_le", { ascending: false })
        .limit(10);

      if (error) {
        console.error("Erreur chargement questions admin:", error);
        return;
      }

      setQuestions((data as Question[]) || []);
    };

    fetchQuestions();
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-black">
          Dernières questions gérées
        </h2>
        <Link
          href="/admin/questions/new"
          className="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500"
        >
          Ajouter une question
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm">
        <table className="min-w-full text-left text-sm text-black">
          <thead className="bg-black/5 text-xs uppercase tracking-wide text-black/70">
            <tr>
              <th className="px-4 py-3">Question</th>
              <th className="px-4 py-3">Thème</th>
              <th className="px-4 py-3">Statut</th>
              <th className="px-4 py-3">Visible</th>
            </tr>
          </thead>
          <tbody>
            {questions.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-6 text-center text-sm text-black/60"
                >
                  Aucune question encore enregistrée. Ajoute ta première
                  question avec le bouton ci-dessus.
                </td>
              </tr>
            ) : (
              questions.map((q) => (
                <tr
                  key={q.id}
                  className="border-t border-black/5 hover:bg-black/5"
                >
                  <td className="px-4 py-3">{q.titre}</td>
                  <td className="px-4 py-3 text-black/80">
                    {q.theme ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        q.statut === "repondu"
                          ? "bg-blue-600/10 text-blue-700"
                          : "bg-black/5 text-black/80"
                      }`}
                    >
                      {q.statut === "repondu" ? "Répondu" : "En attente"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        q.visible
                          ? "bg-blue-600/10 text-blue-700"
                          : "bg-black/5 text-black/70"
                      }`}
                    >
                      {q.visible ? "Publiée" : "Cachée"}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}


