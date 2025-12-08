"use client";

import { ProtectedRoute } from "@/components/ProtectedRoute";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute requireAdmin={true}>
      <section className="space-y-6 rounded-3xl border border-black/5 bg-white p-6 shadow-sm">
        <header className="flex items-center justify-between border-b border-black/10 pb-4">
          <div>
            <h1 className="text-xl font-semibold text-black">Préfacture</h1>
            <p className="mt-1 text-xs text-black/70">
              Gestion des questions des étudiants et publication des réponses.
            </p>
          </div>
        </header>
        <div>{children}</div>
      </section>
    </ProtectedRoute>
  );
}


