"use client";

export const dynamic = "force-dynamic";

import React, { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { getAllMachinesWithPieces, searchPdrs } from "@/actions/machines";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface MachineWithPieces {
  numero: number;
  nom_machine: string;
  img_machine: string | null;
  designation_complete: string;
  pieces_count: number;
}

interface PDRSearchResult {
  code: number;
  numero: number;
  designation_pdr: string;
  image_url: string | null;
  stock_actuel: number;
  emplacement: string | null;
  reference: string | null;
  nom_machine: string;
}

export default function VoirPdrsPage() {
  const [machines, setMachines] = useState<MachineWithPieces[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // États de recherche
  const [searchCode, setSearchCode] = useState("");
  const [searchDesignation, setSearchDesignation] = useState("");
  const [searchReference, setSearchReference] = useState("");
  const [searchResults, setSearchResults] = useState<PDRSearchResult[]>([]);
  const [searchPerformed, setSearchPerformed] = useState(false);

  // États pour le dialog de PDR
  const [selectedPdrIndex, setSelectedPdrIndex] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    const fetchMachines = async () => {
      try {
        setLoading(true);
        const result = await getAllMachinesWithPieces();
        if (result.success) {
          setMachines(result.data);
          setError(null);
        } else {
          setError(result.error || "Erreur lors du chargement des machines");
        }
      } catch (err) {
        setError("Une erreur est survenue");
        console.error(String(err));
      } finally {
        setLoading(false);
      }
    };

    fetchMachines();
  }, []);

  // Fonction de recherche
  const performSearch = useCallback(async () => {
    const searchTerms = [searchCode, searchDesignation, searchReference].filter(
      (term) => term.trim().length >= 4,
    );

    if (searchTerms.length === 0) {
      setSearchResults([]);
      setSearchPerformed(false);
      return;
    }

    try {
      let allResults: PDRSearchResult[] = [];

      for (const term of searchTerms) {
        const result = await searchPdrs(term);
        if (result.success) {
          allResults = [
            ...allResults,
            ...result.data.filter(
              (item) =>
                !allResults.some(
                  (existing) =>
                    existing.code === item.code &&
                    existing.numero === item.numero,
                ),
            ),
          ];
        }
      }

      setSearchResults(allResults);
      setSearchPerformed(true);
    } catch (err) {
      console.error("Erreur de recherche:", String(err));
      setSearchResults([]);
    }
  }, [searchCode, searchDesignation, searchReference]);

  // Fonctions pour gérer le dialog
  const handlePdrClick = (index: number) => {
    setSelectedPdrIndex(index);
    setIsDialogOpen(true);
  };

  const handleNextPdr = () => {
    if (
      selectedPdrIndex !== null &&
      selectedPdrIndex < searchResults.length - 1
    ) {
      setSelectedPdrIndex(selectedPdrIndex + 1);
    }
  };

  const handlePrevPdr = () => {
    if (selectedPdrIndex !== null && selectedPdrIndex > 0) {
      setSelectedPdrIndex(selectedPdrIndex - 1);
    }
  };

  const currentPdr =
    selectedPdrIndex !== null ? searchResults[selectedPdrIndex] : null;
  const pdrImageUrl =
    currentPdr && currentPdr.image_url && currentPdr.image_url.trim() !== ""
      ? currentPdr.image_url.trimEnd()
      : "https://res.cloudinary.com/dtrz3i2f5/image/upload/v1739457347/next-app-pdr-2026/empty_qswmu1.png";

  // Exécuter la recherche quand un critère change
  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch();
    }, 300);

    return () => clearTimeout(timer);
  }, [searchCode, searchDesignation, searchReference, performSearch]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-gray-600">Chargement des machines...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg">{error}</p>
        </div>
      </div>
    );
  }

  if (machines.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 text-lg">Aucune machine disponible</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Main Content */}
      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Section de recherche */}
          <div className="mb-12 p-6 bg-gray-50 rounded-lg border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Rechercher des Pièces Détachées
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Entrez au minimum 4 caractères pour rechercher
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Recherche par Code */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Code
                </label>
                <input
                  type="text"
                  placeholder="Ex: 001"
                  value={searchCode}
                  onChange={(e) => setSearchCode(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
                />
              </div>

              {/* Recherche par Designation */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Désignation
                </label>
                <input
                  type="text"
                  placeholder="Ex: Roulement"
                  value={searchDesignation}
                  onChange={(e) => setSearchDesignation(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
                />
              </div>

              {/* Recherche par Reference */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Référence
                </label>
                <input
                  type="text"
                  placeholder="Ex: REF123"
                  value={searchReference}
                  onChange={(e) => setSearchReference(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
                />
              </div>
            </div>

            {/* Résultats de recherche */}
            {searchPerformed && (
              <div className="mt-6">
                <p className="text-sm font-medium text-gray-700 mb-4">
                  {searchResults.length} résultat
                  {searchResults.length !== 1 ? "s" : ""} trouvé
                  {searchResults.length !== 1 ? "s" : ""}
                </p>

                {searchResults.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {searchResults.map((pdr, index) => (
                      <div
                        key={`${pdr.code}-${index}`}
                        className="group bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 hover:border-gray-300 cursor-pointer h-full flex flex-col"
                        onClick={() => handlePdrClick(index)}
                      >
                        {/* Container image */}
                        <div className="relative w-full h-40 bg-gray-50 overflow-hidden flex items-center justify-center">
                          <Image
                            src={
                              pdr.image_url && pdr.image_url.trim() !== ""
                                ? pdr.image_url.trimEnd()
                                : "https://res.cloudinary.com/dtrz3i2f5/image/upload/v1739457347/next-app-pdr-2026/empty_qswmu1.png"
                            }
                            alt={pdr.designation_pdr || "PDR"}
                            width={150}
                            height={150}
                            className="object-contain h-full w-full p-2 group-hover:scale-110 transition-transform duration-300"
                            onError={(e) => {
                              const img = e.target as HTMLImageElement;
                              img.src =
                                "https://res.cloudinary.com/dtrz3i2f5/image/upload/v1739457347/next-app-pdr-2026/empty_qswmu1.png";
                            }}
                          />
                        </div>

                        {/* Information PDR */}
                        <div className="p-3 flex-1 flex flex-col justify-between">
                          <div>
                            <h3 className="text-xs font-semibold text-gray-700 mb-1 line-clamp-2">
                              {pdr.designation_pdr}
                            </h3>
                            <p className="text-xs font-bold text-gray-800 mb-2">
                              {pdr.nom_machine}
                            </p>
                            <div className="space-y-0.5 text-xs text-gray-600">
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
                          <div className="mt-2 pt-2 border-t border-gray-200">
                            <p className="text-xs font-bold text-primary">
                              Stock: {pdr.stock_actuel}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <p className="text-gray-600 mb-8">
            Sélectionnez une machine pour voir les pièces détachées
          </p>

          {/* Grid de machines */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {machines.map((machine) => (
              <Link
                key={machine.numero}
                href={`/machines/${machine.numero}/pieces_machine`}
              >
                <div className="group bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-all duration-300 hover:border-gray-300 cursor-pointer h-full">
                  {/* Container image */}
                  <div className="relative w-full h-48 bg-gray-50 rounded-md mb-4 overflow-hidden flex items-center justify-center">
                    <Image
                      src={
                        machine.img_machine && machine.img_machine.trim() !== ""
                          ? machine.img_machine.trimEnd()
                          : "https://res.cloudinary.com/dtrz3i2f5/image/upload/v1739457347/next-app-pdr-2026/empty_qswmu1.png"
                      }
                      alt={
                        machine.designation_complete ||
                        machine.nom_machine ||
                        "Machine"
                      }
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

                  {/* Information machine */}
                  <div className="text-center">
                    <h3 className="text-sm font-semibold text-gray-700 mb-2 line-clamp-2 min-h-10">
                      {machine.designation_complete}
                    </h3>
                    <p className="text-xs text-gray-500 mb-3">
                      {machine.nom_machine}
                    </p>
                    <div className="text-xs text-primary font-medium">
                      {machine.pieces_count} pièce
                      {machine.pieces_count !== 1 ? "s" : ""}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>

      {/* Dialog pour agrandir l'image de PDR depuis les résultats de recherche */}
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
                disabled={selectedPdrIndex === searchResults.length - 1}
                className="absolute right-2 p-2 rounded-full bg-white shadow-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight className="w-6 h-6 text-gray-700" />
              </button>

              {/* Numéro de la pièce */}
              <div className="absolute top-2 right-2 bg-black bg-opacity-60 text-white px-3 py-1 rounded-full text-sm font-medium">
                {selectedPdrIndex !== null ? selectedPdrIndex + 1 : 1}/
                {searchResults.length}
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

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">
              © 2026 Gestion des PDR. Tous droits réservés.
            </p>
            <div className="flex gap-6 text-sm text-gray-600">
              <a href="#" className="hover:text-gray-900">
                À propos
              </a>
              <a href="#" className="hover:text-gray-900">
                Contact
              </a>
              <a href="#" className="hover:text-gray-900">
                Conditions d'utilisation
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
