"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";

interface PdrItem {
  code: number;
  numero: number | null;
  designation_pdr: string | null;
  image_url: string | null;
  stock_actuel: number | null;
  emplacement: string | null;
  reference: string | null;
}

const DEFAULT_IMAGE =
  "https://res.cloudinary.com/dtrz3i2f5/image/upload/v1739457347/next-app-pdr-2026/empty_qswmu1.png";

export function PdrsGallery({
  pdrs,
  machineName,
}: {
  pdrs: PdrItem[];
  machineName: string;
}) {
  const [selectedPdr, setSelectedPdr] = useState<PdrItem | null>(null);
  const [selectedPdrIndex, setSelectedPdrIndex] = useState<number>(-1);
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [imageLoadState, setImageLoadState] = useState<Record<number, boolean>>(
    {},
  );
  const [isLoadingNextImage, setIsLoadingNextImage] = useState(false);

  // Attendre que le composant soit monté et les données chargées
  useEffect(() => {
    if (pdrs.length > 0) {
      console.log("PdrsGallery mounted with PDRs:", pdrs.length);
      pdrs.slice(0, 3).forEach((pdr) => {
        console.log(`Pièce #${pdr.numero}: image_url = ${pdr.image_url}`);
      });
    }

    // Attendre un court délai pour assurer que tous les assets sont chargés
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const handleImageLoad = (code: number) => {
    setImageLoadState((prev) => ({ ...prev, [code]: true }));
    console.log(`Image loaded for PDR code ${code}`);
  };

  const handleImageError = (code: number) => {
    console.error(`Erreur de chargement pour pièce code #${code}`);
    setImageErrors((prev) => new Set(prev).add(code));
  };

  const getImageSrc = (imageUrl: string | null, code?: number): string => {
    const src = imageUrl && imageUrl.trim() ? imageUrl : DEFAULT_IMAGE;
    if (code) {
      console.log(
        `Pièce #${code}: image_url = ${imageUrl}, utilisation de: ${src.substring(0, 60)}...`,
      );
    }
    return src;
  };

  const handleSelectPdr = (pdr: PdrItem, index: number) => {
    setSelectedPdr(pdr);
    setSelectedPdrIndex(index);
    setIsLoadingNextImage(false);
  };

  const handleNextPdr = () => {
    if (selectedPdrIndex < pdrs.length - 1) {
      setIsLoadingNextImage(true);
      const nextIndex = selectedPdrIndex + 1;
      setSelectedPdrIndex(nextIndex);
      setSelectedPdr(pdrs[nextIndex]);
    }
  };

  const handlePreviousPdr = () => {
    if (selectedPdrIndex > 0) {
      setIsLoadingNextImage(true);
      const prevIndex = selectedPdrIndex - 1;
      setSelectedPdrIndex(prevIndex);
      setSelectedPdr(pdrs[prevIndex]);
    }
  };

  const canGoNext = selectedPdrIndex < pdrs.length - 1;
  const canGoPrevious = selectedPdrIndex > 0;

  return (
    <>
      {isLoading && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600">Chargement des pièces...</p>
          </div>
        </section>
      )}

      {!isLoading && (
        <>
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Pièces - {machineName}
            </h2>
            <p className="text-gray-600 mb-8">{pdrs.length} pièces</p>

            {pdrs.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-gray-500 text-lg">Aucune pièce trouvée</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {pdrs.map((pdr, index) => (
                  <div
                    key={pdr.code}
                    className="cursor-pointer group"
                    onClick={() => handleSelectPdr(pdr, index)}
                  >
                    <div className="relative w-full h-[300px] overflow-hidden rounded-lg bg-gray-200 hover:shadow-lg transition-all duration-300 border border-gray-300">
                      <Image
                        src={getImageSrc(pdr.image_url, pdr.code)}
                        alt={pdr.designation_pdr || `Pièce ${pdr.numero}`}
                        fill
                        className="object-contain group-hover:scale-105 transition-transform duration-300 p-2"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                        priority={index < 8}
                        onLoad={() => {
                          setImageLoadState((prev) => ({
                            ...prev,
                            [pdr.code]: true,
                          }));
                          handleImageLoad(pdr.code);
                        }}
                        onError={() => {
                          handleImageError(pdr.code);
                          console.error(
                            `Image failed to load for Pièce #${pdr.code}: ${getImageSrc(pdr.image_url)}`,
                          );
                        }}
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300 rounded-lg" />

                      {/* Overlay avec infos */}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent p-3 rounded-b-lg">
                        <p className="text-xs text-gray-300">
                          Pièce #{pdr.numero}
                        </p>
                        <p className="text-xs font-semibold text-white line-clamp-2 mb-1">
                          {pdr.designation_pdr || "Sans désignation"}
                        </p>
                        <div className="text-[10px] text-gray-200 space-y-0.5">
                          <p>Code: {pdr.code}</p>
                          {pdr.stock_actuel !== null && (
                            <p>Stock: {pdr.stock_actuel}</p>
                          )}
                          {pdr.reference && <p>Ref: {pdr.reference}</p>}
                          {pdr.emplacement && <p>Empl: {pdr.emplacement}</p>}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}

      {/* Modal */}
      {selectedPdr && (
        <div
          className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center p-4"
          onClick={() => setSelectedPdr(null)}
        >
          <div
            className="bg-white rounded-lg overflow-hidden max-w-2xl w-full max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative w-full h-[400px] bg-black flex-shrink-0 overflow-hidden group">
              {/* Spinner loading */}
              {isLoadingNextImage && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-10">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                </div>
              )}

              {/* Image */}
              <Image
                src={getImageSrc(selectedPdr.image_url, selectedPdr.code)}
                alt={
                  selectedPdr.designation_pdr || `Pièce ${selectedPdr.numero}`
                }
                fill
                className="object-contain"
                sizes="600px"
                priority
                onLoad={() => {
                  handleImageLoad(selectedPdr.code);
                  setIsLoadingNextImage(false);
                }}
                onError={() => handleImageError(selectedPdr.code)}
              />

              {/* Chevron gauche */}
              {canGoPrevious && (
                <button
                  onClick={handlePreviousPdr}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white rounded-full p-2 transition-all opacity-0 group-hover:opacity-100 z-20"
                  aria-label="Pièce précédente"
                >
                  <svg
                    className="w-6 h-6"
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
              )}

              {/* Chevron droite */}
              {canGoNext && (
                <button
                  onClick={handleNextPdr}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white rounded-full p-2 transition-all opacity-0 group-hover:opacity-100 z-20"
                  aria-label="Pièce suivante"
                >
                  <svg
                    className="w-6 h-6"
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
              )}

              {/* Compteur */}
              {pdrs.length > 1 && (
                <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white px-3 py-1 rounded text-sm font-medium z-20">
                  {selectedPdrIndex + 1} / {pdrs.length}
                </div>
              )}
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              <p className="text-sm text-gray-500 mb-2">
                Pièce #{selectedPdr.numero}
              </p>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                {selectedPdr.designation_pdr || "Sans désignation"}
              </h3>

              <div className="mb-6 space-y-3 bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Code:</span>
                  <span className="font-semibold text-gray-900">
                    {selectedPdr.code}
                  </span>
                </div>
                {selectedPdr.stock_actuel !== null && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Stock Actuel:</span>
                    <span className="font-semibold text-gray-900">
                      {selectedPdr.stock_actuel}
                    </span>
                  </div>
                )}
                {selectedPdr.reference && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Référence:</span>
                    <span className="font-semibold text-gray-900">
                      {selectedPdr.reference}
                    </span>
                  </div>
                )}
                {selectedPdr.emplacement && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Emplacement:</span>
                    <span className="font-semibold text-gray-900">
                      {selectedPdr.emplacement}
                    </span>
                  </div>
                )}
              </div>

              <button
                onClick={() => setSelectedPdr(null)}
                className="w-full bg-gray-900 text-white py-2 px-4 rounded-lg hover:bg-gray-800 transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
