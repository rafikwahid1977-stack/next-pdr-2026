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

export default function PiecesMachineClient({ numero }: { numero: string }) {
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
          <p className="text-red-600 text-lg">{error}</p>
          <Link
            href="/machines"
            className="mt-4 text-blue-600 hover:text-blue-800"
          >
            Retour aux machines
          </Link>
        </div>
      </div>
    );
  }

  if (!machine) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 text-lg">Machine non trouvée</p>
          <Link
            href="/machines"
            className="mt-4 text-blue-600 hover:text-blue-800"
          >
            Retour aux machines
          </Link>
        </div>
      </div>
    );
  }

  if (pdrs.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 text-lg">Aucune pièce disponible</p>
          <Link
            href="/machines"
            className="mt-4 text-blue-600 hover:text-blue-800"
          >
            Retour aux machines
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                {machine.nom_machine}
              </h1>
              <p className="text-sm text-gray-600">
                {machine.designation_complete}
              </p>
            </div>
            <Link
              href="/machines"
              className="text-blue-600 hover:text-blue-800"
            >
              Retour
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-lg font-semibold text-gray-800 mb-6">
            Pièces détachées ({pdrs.length})
          </h2>

          {/* Grid of PDRs */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {pdrs.map((pdr, index) => (
              <button
                key={`${pdr.codigo}-${pdr.numero}`}
                onClick={() => handlePdrClick(index)}
                className="group relative overflow-hidden rounded-lg border border-gray-200 bg-white p-4 shadow-sm hover:shadow-lg transition-all duration-200"
              >
                {/* Image */}
                <div className="relative h-48 mb-4 overflow-hidden rounded-md bg-gray-100">
                  <img
                    src={
                      pdr.image_url && pdr.image_url.trim() !== ""
                        ? pdr.image_url.trimEnd()
                        : "https://res.cloudinary.com/dtrz3i2f5/image/upload/v1739457347/next-app-pdr-2026/empty_qswmu1.png"
                    }
                    alt={pdr.designation_pdr}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>

                {/* Info */}
                <div className="text-left">
                  <p className="font-semibold text-gray-900 truncate">
                    {pdr.designation_pdr}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">Code: {pdr.code}</p>
                  {pdr.reference && (
                    <p className="text-xs text-gray-600">
                      Ref: {pdr.reference}
                    </p>
                  )}
                  <p className="text-sm text-blue-600 font-medium mt-2">
                    Stock: {pdr.stock_actuel}
                  </p>
                </div>

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200" />
              </button>
            ))}
          </div>
        </div>
      </main>

      {/* Dialog for PDR details */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{currentPdr?.designation_pdr}</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Image */}
            <div className="flex items-center justify-center bg-gray-100 rounded-lg overflow-hidden">
              <img
                src={pdrImageUrl}
                alt={currentPdr?.designation_pdr}
                className="w-full h-full object-contain"
              />
            </div>

            {/* Info */}
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-600">Code</p>
                <p className="text-lg font-semibold">{currentPdr?.code}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Référence</p>
                <p className="text-lg font-semibold">
                  {currentPdr?.reference || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Stock actuel</p>
                <p className="text-lg font-semibold text-blue-600">
                  {currentPdr?.stock_actuel}
                </p>
              </div>
              {currentPdr?.emplacement && (
                <div>
                  <p className="text-xs text-gray-600">Emplacement</p>
                  <p className="text-lg font-semibold">
                    {currentPdr.emplacement}
                  </p>
                </div>
              )}

              {/* Navigation buttons */}
              <div className="flex gap-2 pt-4">
                <button
                  onClick={handlePrevPdr}
                  disabled={selectedPdrIndex === 0}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
                >
                  <ChevronLeft size={18} />
                  Précédent
                </button>
                <button
                  onClick={handleNextPdr}
                  disabled={selectedPdrIndex === pdrs.length - 1}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
                >
                  Suivant
                  <ChevronRight size={18} />
                </button>
              </div>

              {/* Counter */}
              <p className="text-center text-xs text-gray-600 pt-2">
                {(selectedPdrIndex ?? 0) + 1} / {pdrs.length}
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
