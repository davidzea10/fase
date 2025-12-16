"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

type Activity = {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  images: string[];
};

const activities: Activity[] = [
  {
    id: "1",
    title: "Face à face prefac et étudiants",
    description: "Prise de contact et confrontations aux réalités que vivent les étudiants au sein de l'UPC de la FASE",
    date: "08/05/2025",
    time: "12H00",
    location: "Auditoire L1 LMD",
    images: ["/activite1.jpg"],
  },
  {
    id: "2",
    title: "Forum sur l'Économie Rurale",
    description: "L'ASBL Le Monde Rural a l'honneur de vous convier à son Forum sur l'Économie Rurale, qui se tiendra le samedi 14 juin 2025 à l'Université Protestante au Congo (UPC), autour du thème : « L'exode rural et ses répercussions sur la ville de Kinshasa ». Ce forum réunira experts, étudiants et acteurs de la société civile pour un échange constructif autour de solutions durables. Organisé par l'ASBL Le Monde Rural - « Plus un pas sans les ruraux »",
    date: "14/06/2025",
    time: "9H00",
    location: "UPC - Université Protestante au Congo",
    images: ["/forum.jpg"],
  },
  {
    id: "3",
    title: "MeetUp - Gouvernance inclusive en RDC : Quel rôle pour la Jeunesse Universitaire",
    description: "Rencontre-débat sur la gouvernance inclusive en République Démocratique du Congo et le rôle que peut jouer la jeunesse universitaire dans ce processus. Un échange constructif entre étudiants, experts et acteurs de la société civile pour explorer les opportunités et défis de la participation citoyenne des jeunes dans la gouvernance du pays.",
    date: "05/05/2025",
    time: "11H00 - 14H00",
    location: "UPC - Université Protestante au Congo",
    images: ["/meet1.jpg", "/meet2.jpg", "/meet3.jpg", "/meet4.jpg", "/meet5.jpg"],
  },
];

export default function ActivitesPage() {
  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl border border-black/5 bg-gradient-to-br from-blue-50 via-blue-100/50 to-indigo-50 p-8 shadow-lg">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, rgb(59 130 246) 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }}></div>
        </div>
        <div className="relative space-y-4">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">
            Initiatives de la présidence facultaire
          </p>
          <h1 className="text-4xl font-bold text-black md:text-5xl">
            Activités organisées
          </h1>
          <p className="max-w-2xl text-base text-black/80 md:text-lg">
            Découvrez les événements et activités organisés par la présidente de la faculté pour renforcer le dialogue et l&apos;engagement étudiant.
          </p>
        </div>
      </section>

      {/* Liste des activités */}
      <div className="space-y-16">
        {activities.map((activity, index) => (
          <ActivityCard key={activity.id} activity={activity} index={index} />
        ))}
      </div>
    </div>
  );
}

function ActivityCard({ activity, index }: { activity: Activity; index: number }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Animation au scroll
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    const element = document.getElementById(`activity-${activity.id}`);
    if (element) {
      observer.observe(element);
    }

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [activity.id]);

  // Auto-play carousel si plusieurs images
  useEffect(() => {
    if (activity.images.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % activity.images.length);
    }, 5000); // Change d'image toutes les 5 secondes

    return () => clearInterval(interval);
  }, [activity.images.length]);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % activity.images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + activity.images.length) % activity.images.length);
  };

  return (
    <article
      id={`activity-${activity.id}`}
      className={`group relative overflow-hidden rounded-3xl border border-black/10 bg-white shadow-lg transition-all duration-700 ${
        isVisible
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-8"
      }`}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      {/* Gradient overlay pour effet moderne */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/0 via-transparent to-indigo-50/0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 pointer-events-none" />

      <div className="grid gap-0 md:grid-cols-2">
        {/* Section Images avec Carousel */}
        <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-blue-100 to-indigo-100 md:aspect-auto md:min-h-[500px]">
          {activity.images.length > 0 ? (
            <>
              <div className="relative h-full w-full">
                {activity.images.map((img, idx) => (
                  <div
                    key={idx}
                    className={`absolute inset-0 transition-opacity duration-700 ${
                      idx === currentImageIndex
                        ? "opacity-100 z-10"
                        : "opacity-0 z-0"
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`${activity.title} - Image ${idx + 1}`}
                      fill
                      sizes="(min-width: 768px) 50vw, 100vw"
                      className="object-cover object-top"
                      priority={idx === 0}
                    />
                  </div>
                ))}
              </div>

              {/* Navigation du carousel */}
              {activity.images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow-lg backdrop-blur-sm transition-all hover:bg-white hover:scale-110"
                    aria-label="Image précédente"
                  >
                    <svg
                      className="h-5 w-5 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow-lg backdrop-blur-sm transition-all hover:bg-white hover:scale-110"
                    aria-label="Image suivante"
                  >
                    <svg
                      className="h-5 w-5 text-blue-600"
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
                  </button>

                  {/* Indicateurs de pagination */}
                  <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 gap-2">
                    {activity.images.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentImageIndex(idx)}
                        className={`h-2 rounded-full transition-all ${
                          idx === currentImageIndex
                            ? "w-8 bg-white"
                            : "w-2 bg-white/50 hover:bg-white/75"
                        }`}
                        aria-label={`Aller à l'image ${idx + 1}`}
                      />
                    ))}
                  </div>
                </>
              )}

              {/* Badge "Nouveau" ou autre */}
              <div className="absolute left-4 top-4 z-20 rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white shadow-lg">
                Activité
              </div>
            </>
          ) : (
            <div className="flex h-full items-center justify-center">
              <div className="text-center text-black/40">
                <svg
                  className="mx-auto h-16 w-16"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <p className="mt-2 text-sm">Aucune image</p>
              </div>
            </div>
          )}
        </div>

        {/* Section Détails */}
        <div className="flex flex-col justify-center p-6 md:p-8">
          <div className="space-y-6">
            {/* Titre */}
            <div>
              <h2 className="text-2xl font-bold text-black md:text-3xl">
                {activity.title}
              </h2>
              <div className="mt-2 h-1 w-16 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600" />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
                Description
              </p>
              <p className="text-base leading-relaxed text-black/80 md:text-lg">
                {activity.description}
              </p>
            </div>

            {/* Informations pratiques */}
            <div className="grid gap-4 rounded-2xl border border-blue-100 bg-blue-50/50 p-4">
              {/* Date */}
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white">
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
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                    Date
                  </p>
                  <p className="text-base font-semibold text-black">
                    {activity.date}
                  </p>
                </div>
              </div>

              {/* Heure */}
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-white">
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
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                    Heure
                  </p>
                  <p className="text-base font-semibold text-black">
                    {activity.time}
                  </p>
                </div>
              </div>

              {/* Lieu */}
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-green-600 text-white">
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
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                    Lieu
                  </p>
                  <p className="text-base font-semibold text-black">
                    {activity.location}
                  </p>
                </div>
              </div>
            </div>

            {/* Call to action (optionnel) */}
            <div className="pt-2">
              <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition hover:scale-105">
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
                <span>Événement à venir</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

