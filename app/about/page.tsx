"use client";

import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="rounded-3xl border border-black/5 bg-gradient-to-br from-blue-50 via-blue-100/50 to-indigo-50 p-8 shadow-lg">
        <div className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
            À propos
          </p>
          <h1 className="text-3xl font-bold text-black md:text-4xl">
            Plateforme de Communication FASE
          </h1>
          <p className="text-base leading-relaxed text-black/80 md:text-lg">
            Un espace dédié au dialogue entre la présidence facultaire et les étudiants 
            pour faciliter la communication, clarifier les informations académiques et 
            valoriser les retours des étudiants.
          </p>
        </div>
      </section>

      {/* Section 1: Initiative de la Préfecture */}
      <section className="space-y-6 rounded-3xl border border-black/5 bg-white p-6 shadow-sm md:p-8">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white">
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-black md:text-3xl">
              Initiative de la Préfecture
            </h2>
          </div>
        </div>

        <div className="space-y-4 text-base leading-relaxed text-black/80">
          <p>
            La présidente de la faculté, <strong className="text-black">Sabrina Penenge</strong>, 
            a initié cette plateforme pour créer un canal de communication direct et efficace 
            entre la présidence facultaire et les étudiants de la FASE.
          </p>
          <p>
            Cette initiative vise à :
          </p>
          <ul className="ml-6 list-disc space-y-2">
            <li>
              <strong className="text-black">Faciliter la communication</strong> : 
              Permettre aux étudiants de poser leurs questions et obtenir des réponses officielles
            </li>
            <li>
              <strong className="text-black">Clarifier les informations académiques</strong> : 
              Centraliser les réponses aux questions fréquentes sur les examens, stages, projets, etc.
            </li>
            <li>
              <strong className="text-black">Valoriser les retours étudiants</strong> : 
              Donner une voix aux étudiants et prendre en compte leurs préoccupations
            </li>
            <li>
              <strong className="text-black">Renforcer la transparence</strong> : 
              Rendre accessibles les décisions et informations importantes de la faculté
            </li>
          </ul>
          <p>
            Les questions sont centralisées, structurées par thématique et accompagnées de 
            réponses officielles. Les identités des étudiants ne sont pas affichées : 
            <strong className="text-black"> seul le contenu compte</strong>.
          </p>
        </div>
      </section>

      {/* Section 2: Comment poser une question */}
      <section className="space-y-6 rounded-3xl border border-black/5 bg-white p-6 shadow-sm md:p-8">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-green-600 text-white">
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-black md:text-3xl">
              Comment poser une question ?
            </h2>
          </div>
        </div>

        <div className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Étape 1 */}
            <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-5">
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 text-lg font-bold text-white">
                  1
                </div>
                <h3 className="text-lg font-semibold text-black">
                  Se connecter
                </h3>
              </div>
              <p className="text-sm leading-relaxed text-black/80">
                Connecte-toi à la plateforme avec ton email ou via Google. 
                Si tu n&apos;as pas encore de compte, l&apos;inscription est rapide et gratuite.
              </p>
            </div>

            {/* Étape 2 */}
            <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-5">
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 text-lg font-bold text-white">
                  2
                </div>
                <h3 className="text-lg font-semibold text-black">
                  Aller sur la page Questions
                </h3>
              </div>
              <p className="text-sm leading-relaxed text-black/80">
                Accède à la page &quot;Questions&quot; depuis le menu de navigation. 
                Tu y trouveras toutes les questions déjà posées et leurs réponses.
              </p>
            </div>

            {/* Étape 3 */}
            <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-5">
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 text-lg font-bold text-white">
                  3
                </div>
                <h3 className="text-lg font-semibold text-black">
                  Cliquer sur &quot;Poser une question&quot;
                </h3>
              </div>
              <p className="text-sm leading-relaxed text-black/80">
                Clique sur le bouton &quot;Poser une question&quot; en haut de la page. 
                Un formulaire s&apos;affichera pour saisir ta question.
              </p>
            </div>

            {/* Étape 4 */}
            <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-5">
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 text-lg font-bold text-white">
                  4
                </div>
                <h3 className="text-lg font-semibold text-black">
                  Remplir le formulaire
                </h3>
              </div>
              <p className="text-sm leading-relaxed text-black/80">
                Sélectionne une <strong>thématique</strong> (examen, stage, projet tutoré, etc.) 
                et rédige ta <strong>description</strong> de manière claire et détaillée.
              </p>
            </div>
          </div>

          {/* Étape 5 */}
          <div className="rounded-2xl border border-green-200 bg-green-50/50 p-6">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-green-600 text-xl font-bold text-white">
                5
              </div>
              <h3 className="text-xl font-semibold text-black">
                Soumettre et attendre la réponse
              </h3>
            </div>
            <p className="mb-4 text-base leading-relaxed text-black/80">
              Une fois ta question soumise, elle sera examinée par la Préfecture. 
              Tu recevras une notification par email lorsque la réponse officielle sera publiée.
            </p>
            <div className="rounded-lg border border-green-200 bg-white p-4">
              <p className="text-sm font-semibold text-green-700 mb-2">
                💡 Astuce :
              </p>
              <p className="text-sm text-black/80">
                Avant de poser une question, utilise la barre de recherche pour vérifier 
                si une question similaire n&apos;a pas déjà été posée et répondue.
              </p>
            </div>
          </div>
        </div>

        {/* Call to action */}
        <div className="flex justify-center pt-4">
          <Link
            href="/questions"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition hover:scale-105 hover:shadow-xl"
          >
            <span>Poser ma première question</span>
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
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        </div>
      </section>

      {/* Section 3: Processus de modération */}
      <section className="space-y-6 rounded-3xl border border-black/5 bg-white p-6 shadow-sm md:p-8">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-purple-600 text-white">
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-black md:text-3xl">
              Processus de modération
            </h2>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-purple-100 bg-purple-50/50 p-4">
              <div className="mb-2 text-sm font-semibold uppercase tracking-wide text-purple-600">
                Étape 1
              </div>
              <h3 className="mb-2 text-base font-semibold text-black">
                Soumission
              </h3>
              <p className="text-sm text-black/80">
                L&apos;étudiant soumet sa question via le formulaire dédié.
              </p>
            </div>

            <div className="rounded-xl border border-purple-100 bg-purple-50/50 p-4">
              <div className="mb-2 text-sm font-semibold uppercase tracking-wide text-purple-600">
                Étape 2
              </div>
              <h3 className="mb-2 text-base font-semibold text-black">
                Modération
              </h3>
              <p className="text-sm text-black/80">
                La Préfecture examine la question et prépare une réponse officielle.
              </p>
            </div>

            <div className="rounded-xl border border-purple-100 bg-purple-50/50 p-4">
              <div className="mb-2 text-sm font-semibold uppercase tracking-wide text-purple-600">
                Étape 3
              </div>
              <h3 className="mb-2 text-base font-semibold text-black">
                Publication
              </h3>
              <p className="text-sm text-black/80">
                La question et sa réponse sont publiées et visibles par tous les étudiants.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: Fonctionnalités */}
      <section className="space-y-6 rounded-3xl border border-black/5 bg-gradient-to-br from-blue-50 via-blue-100/50 to-indigo-50 p-6 shadow-sm md:p-8">
        <h2 className="text-2xl font-bold text-black md:text-3xl">
          Fonctionnalités de la plateforme
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-blue-200 bg-white p-5">
            <div className="mb-2 flex items-center gap-2">
              <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <h3 className="font-semibold text-black">Recherche et filtres</h3>
            </div>
            <p className="text-sm text-black/80">
              Recherche par mots-clés et filtrage par thématique pour trouver rapidement 
              les questions qui t&apos;intéressent.
            </p>
          </div>

          <div className="rounded-xl border border-blue-200 bg-white p-5">
            <div className="mb-2 flex items-center gap-2">
              <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
              </svg>
              <h3 className="font-semibold text-black">Système de likes</h3>
            </div>
            <p className="text-sm text-black/80">
              Exprime ton avis sur les questions et réponses avec le système de likes/dislikes, 
              similaire à Facebook.
            </p>
          </div>

          <div className="rounded-xl border border-blue-200 bg-white p-5">
            <div className="mb-2 flex items-center gap-2">
              <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="font-semibold text-black">Réponses officielles</h3>
            </div>
            <p className="text-sm text-black/80">
              Toutes les réponses sont officielles et proviennent directement de la 
              Présidence facultaire.
            </p>
          </div>

          <div className="rounded-xl border border-blue-200 bg-white p-5">
            <div className="mb-2 flex items-center gap-2">
              <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <h3 className="font-semibold text-black">Notifications</h3>
            </div>
            <p className="text-sm text-black/80">
              Reçois une notification par email lorsque ta question reçoit une réponse officielle.
            </p>
          </div>

          <div className="rounded-xl border border-blue-200 bg-white p-5">
            <div className="mb-2 flex items-center gap-2">
              <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <h3 className="font-semibold text-black">Exercices et documents</h3>
            </div>
            <p className="text-sm text-black/80">
              Télécharge les exercices et anciens examens (PDF) organisés par niveau (L1, L2, L3, MASTER1, MASTER2) 
              pour t&apos;aider dans tes révisions.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
