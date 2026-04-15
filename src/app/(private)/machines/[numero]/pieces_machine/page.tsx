import { Suspense } from "react";
import PiecesMachineClient from "./PiecesMachineClient";

export default async function Page({
  params,
}: {
  params: Promise<{ numero: string }>;
}) {
  const { numero } = await params;

  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="mt-4 text-gray-600">Chargement des pièces...</p>
          </div>
        </div>
      }
    >
      <PiecesMachineClient numero={numero} />
    </Suspense>
  );
}
