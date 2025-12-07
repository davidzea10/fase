const pillars = [
  {
    title: "Transparence",
    description:
      "Rendre accessibles les retours étudiants pour éclairer les décisions pédagogiques et administratives.",
  },
  {
    title: "Fiabilité",
    description:
      "Données importées depuis les formulaires officiels de la faculté, nettoyées et historisées.",
  },
  {
    title: "Action",
    description:
      "Chaque question met en lumière des axes d’amélioration pour les responsables et les enseignants.",
  },
];

export default function AboutPage() {
  return (
    <section className="space-y-10 rounded-3xl border border-black/5 bg-white p-8">
      <header className="space-y-4">
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
          À propos
        </p>
        <h1 className="text-3xl font-semibold text-black">
          Comment fonctionne la plateforme
        </h1>
        <p className="text-sm text-black/80">
          Cette application rassemble les réponses des étudiants aux enquêtes de
          la faculté d’économie. Les données sont importées à partir des exports
          Google Forms, contrôlées puis publiées pour diffusion interne.
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-3">
        {pillars.map((pillar) => (
          <article
            key={pillar.title}
            className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm"
          >
            <h2 className="text-lg font-semibold text-black">{pillar.title}</h2>
            <p className="mt-2 text-sm text-black/80">{pillar.description}</p>
          </article>
        ))}
      </div>

      <div className="rounded-2xl border border-black/5 bg-white p-6 text-sm text-black/80 shadow-sm">
        <h3 className="text-base font-semibold text-black">
          Processus résumé
        </h3>
        <ol className="mt-3 list-decimal space-y-2 pl-5">
          <li>Export des réponses Google Forms (CSV/Excel).</li>
          <li>Import contrôlé par l’administration via l’espace sécurisé.</li>
          <li>Nettoyage automatique + enrichissement des métadonnées.</li>
          <li>Publication sur la plateforme avec filtres et recherche.</li>
        </ol>
      </div>
    </section>
  );
}

