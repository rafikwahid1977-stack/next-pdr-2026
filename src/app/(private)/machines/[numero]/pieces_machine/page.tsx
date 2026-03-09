"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { getPdrsForMachine } from "@/actions/machines";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

interface PDR {
  code: number;
  numero: number;
  designation_pdr: string;
  image_url: string | null;
  stock_actuel: number;
  emplacement: string | null;
  reference: string | null;
}

interface Machine {
  numero: number;
  nom_machine: string;
  designation_complete: string;
}

export default function PdrsPerMachinePage({
  params,
}: {
  params: Promise<{ numero: string }>;
}) {
  const { numero } = React.use(params);
  const machineId = parseInt(numero, 10);
  const [pdrs, setPdrs] = useState<PDR[]>([]);
  const [machine, setMachine] = useState<Machine | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedPdrIndex, setSelectedPdrIndex] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    const fetchPdrs = async () => {
      try {
        setLoading(true);
        const result = await getPdrsForMachine(machineId);
        if (result.success) {
          setPdrs(result.data);
          setMachine(result.machine || null);
          setError(null);
        } else {
          setError(result.error || "Erreur lors du chargement des pièces");
        }
      } catch (err) {
        setError("Une erreur est survenue");
        console.error(String(err));
      } finally {
        setLoading(false);
      }
    };

    fetchPdrs();
  }, [machineId]);

  const handlePdrClick = (index: number) => {
    setSelectedPdrIndex(index);
    setIsDialogOpen(true);
  };

  const handleNextPdr = () => {
    if (selectedPdrIndex !== null && selectedPdrIndex < pdrs.length - 1) {
      setSelectedPdrIndex(selectedPdrIndex + 1);
    }
  };

  const handlePrevPdr = () => {
    if (selectedPdrIndex !== null && selectedPdrIndex > 0) {
      setSelectedPdrIndex(selectedPdrIndex - 1);
    }
  };

  const currentPdr = selectedPdrIndex !== null ? pdrs[selectedPdrIndex] : null;
  const pdrImageUrl =
    currentPdr && currentPdr.image_url && currentPdr.image_url.trim() !== ""
      ? currentPdr.image_url.trimEnd()
      : "https://res.cloudinary.com/dtrz3i2f5/image/upload/v1739457347/next-app-pdr-2026/empty_qswmu1.png";

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-gray-600">Chargement des pièces...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg mb-4">{error}</p>
          <Link href="/machines" className="text-primary hover:underline">
            Retour aux machines
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-8 py-4">
          <div className="flex items-center gap-4">
            <Link href="/machines" className="text-primary hover:underline">
              ← Machines
            </Link>
            <span className="text-gray-400">|</span>
            <h1 className="text-2xl font-bold text-gray-800">
              {machine?.designation_complete || "Pièces détachées"}
            </h1>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          {pdrs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">
                Aucune pièce disponible pour cette machine
              </p>
            </div>
          ) : (
            <>
              <p className="text-gray-600 mb-8">
                {pdrs.length} pièce{pdrs.length !== 1 ? "s" : ""} disponible
                {pdrs.length !== 1 ? "s" : ""}
              </p>

              {/* Grid des PDRs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {pdrs.map((pdr, index) => (
                  <div
                    key={`${pdr.code}-${index}`}
                    className="group bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 hover:border-gray-300 cursor-pointer h-full flex flex-col"
                    onClick={() => handlePdrClick(index)}
                  >
                    {/* Container image */}
                    <div className="relative w-full h-48 bg-gray-50 overflow-hidden flex items-center justify-center">
                      <Image
                        src={
                          pdr.image_url && pdr.image_url.trim() !== ""
                            ? pdr.image_url.trimEnd()
                            : "https://res.cloudinary.com/dtrz3i2f5/image/upload/v1739457347/next-app-pdr-2026/empty_qswmu1.png"
                        }
                        alt={pdr.designation_pdr || "PDR"}
                        width={200}
                        height={200}
                        className="object-contain h-full w-full p-2 group-hover:scale-110 transition-transform duration-300"
                        onError={(e) => {
                          const img = e.target as HTMLImageElement;
                          img.src =
                            "https://res.cloudinary.com/dtrz3i2f5/image/upload/v1739457347/next-app-pdr-2026/empty_qswmu1.png";
                        }}
                      />
                    </div>

                    {/* Information PDR */}
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-2 line-clamp-2">
                          {pdr.designation_pdr}
                        </h3>
                        <div className="space-y-1 text-xs text-gray-600">
                          <p>
                            <span className="font-medium">Code:</span>{" "}
                            {pdr.code}
                          </p>
                          {pdr.reference && (
                            <p>
                              <span className="font-medium">Réf:</span>{" "}
                              {pdr.reference}
                            </p>
                          )}
                          {pdr.emplacement && (
                            <p>
                              <span className="font-medium">Empl:</span>{" "}
                              {pdr.emplacement}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <p className="text-sm font-bold text-primary">
                          Stock: {pdr.stock_actuel}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <p className="text-sm text-gray-600">
            © 2026 Gestion des PDR. Tous droits réservés.
          </p>
        </div>
      </footer>

      {/* Dialog pour agrandir l'image */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-center">
              {currentPdr?.designation_pdr}
            </DialogTitle>
          </DialogHeader>

          <div className="relative flex items-center justify-center bg-gray-50 rounded-lg p-4">
            {/* Image */}
            <div className="relative w-full h-96 flex items-center justify-center">
              <Image
                src={pdrImageUrl}
                alt={currentPdr?.designation_pdr || "PDR"}
                width={400}
                height={400}
                className="object-contain h-full w-full"
                onError={(e) => {
                  const img = e.target as HTMLImageElement;
                  img.src =
                    "https://res.cloudinary.com/dtrz3i2f5/image/upload/v1739457347/next-app-pdr-2026/empty_qswmu1.png";
                }}
              />

              {/* Chevron Précédent */}
              <button
                onClick={handlePrevPdr}
                disabled={selectedPdrIndex === 0}
                className="absolute left-2 p-2 rounded-full bg-white shadow-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft className="w-6 h-6 text-gray-700" />
              </button>

              {/* Chevron Suivant */}
              <button
                onClick={handleNextPdr}
                disabled={selectedPdrIndex === pdrs.length - 1}
                className="absolute right-2 p-2 rounded-full bg-white shadow-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight className="w-6 h-6 text-gray-700" />
              </button>

              {/* Numéro de la pièce */}
              <div className="absolute top-2 right-2 bg-black bg-opacity-60 text-white px-3 py-1 rounded-full text-sm font-medium">
                {selectedPdrIndex !== null ? selectedPdrIndex + 1 : 1}/
                {pdrs.length}
              </div>
            </div>
          </div>

          {/* Informations PDR détaillées */}
          {currentPdr && (
            <div className="grid grid-cols-2 gap-4 mt-6 p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-xs text-gray-500 font-medium">Code</p>
                <p className="text-sm font-semibold text-gray-800">
                  {currentPdr.code}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">
                  Stock Actuel
                </p>
                <p className="text-sm font-semibold text-primary">
                  {currentPdr.stock_actuel}
                </p>
              </div>
              {currentPdr.reference && (
                <div>
                  <p className="text-xs text-gray-500 font-medium">Référence</p>
                  <p className="text-sm font-semibold text-gray-800">
                    {currentPdr.reference}
                  </p>
                </div>
              )}
              {currentPdr.emplacement && (
                <div>
                  <p className="text-xs text-gray-500 font-medium">
                    Emplacement
                  </p>
                  <p className="text-sm font-semibold text-gray-800">
                    {currentPdr.emplacement}
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
