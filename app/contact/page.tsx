"use client";

import Link from "next/link";

export default function ContactPage() {
  return (
    <section className="space-y-6 rounded-3xl border border-black/5 bg-white p-6 shadow-sm md:p-8">
      <div className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
          Contact
        </p>
        <h1 className="text-3xl font-semibold text-black">Préfecture – Faculté d&apos;économie</h1>
        <p className="text-sm text-black/70">
          Pour vos questions urgentes ou vos suggestions, contactez la préfecture. Nous répondons
          prioritairement via la chaîne WhatsApp dédiée.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-3 rounded-2xl border border-blue-100 bg-blue-50/40 p-5">
          <h2 className="text-lg font-semibold text-blue-900">WhatsApp (chaîne officielle)</h2>
          <p className="text-sm text-blue-900/80">
            Suivez les annonces de la préfecture et échangez autour des questions étudiantes.
          </p>
          <Link
            href="https://whatsapp.com/channel/0029VbA5YolCRs1rAi9zny1O"
            target="_blank"
            className="inline-flex items-center gap-2 rounded-full bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-green-500"
          >
            Ouvrir WhatsApp
          </Link>
        </div>

        <div className="space-y-3 rounded-2xl border border-black/10 bg-white p-5">
          <h2 className="text-lg font-semibold text-black">Autres canaux</h2>
          <ul className="space-y-2 text-sm text-black/80">
            <li>
              <span className="font-semibold">Espace étudiant :</span> Soumettez vos questions via la page &quot;Questions&quot;.
            </li>
            <li>
              <span className="font-semibold">Préfecture :</span> Les admins répondent et publient les réponses validées.
            </li>
            <li>
              <span className="font-semibold">Support :</span> Pour toute difficulté technique, contactez la préfecture via WhatsApp.
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}


