"use client";

export const dynamic = "force-dynamic";

import { Suspense } from "react";
import { MecanoLayoutContent } from "./MecanoLayoutContent";

export default function MecanoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
            <p className="mt-4 text-gray-600">Chargement...</p>
          </div>
        </div>
      }
    >
      <MecanoLayoutContent>{children}</MecanoLayoutContent>
    </Suspense>
  );
}
