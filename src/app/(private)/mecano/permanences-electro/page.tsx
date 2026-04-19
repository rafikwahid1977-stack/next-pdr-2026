"use client";

export const dynamic = "force-dynamic";

import React, { useEffect, useState } from "react";
import { getElectroInterventions } from "@/actions/interventions";
import { IElectro } from "@/interfaces";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PhotoLightbox } from "@/components/PhotoLightbox";

interface GroupedInterventions {
  [date: string]: IElectro[];
}

function PermanencesElectroPage() {
  const [interventions, setInterventions] = useState<IElectro[]>([]);
  const [loading, setLoading] = useState(true);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [displayCount, setDisplayCount] = useState(5);
  const [piecePhotoLightboxOpen, setPiecePhotoLightboxOpen] = useState(false);
  const [selectedPiecePhotos, setSelectedPiecePhotos] = useState<string[]>([]);
  const [selectedPiecePhotoIndex, setSelectedPiecePhotoIndex] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Global error handler
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error("Erreur détectée:", event.error);
      setErrorMessage(
        "Une erreur s'est produite. Veuillez rafraîchir la page et réessayer.",
      );
    };

    window.addEventListener("error", handleError);
    return () => {
      window.removeEventListener("error", handleError);
    };
  }, []);

  // Fetch interventions
  useEffect(() => {
    const fetchInterventions = async () => {
      setLoading(true);
      const result = await getElectroInterventions();
      if (result.success) {
        setInterventions(result.data);
      }
      setLoading(false);
    };

    fetchInterventions();
  }, []);

  // Group interventions by created date
  const groupedInterventions = interventions.reduce(
    (acc: GroupedInterventions, interv) => {
      const date = interv.created_at
        ? new Date(interv.created_at).toLocaleDateString("fr-FR")
        : "Non définie";
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(interv);
      return acc;
    },
    {},
  );

  return (
    <div className="w-full p-6">
      {/* Header with title */}
      <div className="mb-8 mt-12 md:mt-0">
        <h1 className="text-3xl font-bold">Interventions Électricien</h1>
      </div>

      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-800 text-sm mb-4">
          {errorMessage}
        </div>
      )}

      {/* Interventions cards */}
      {loading ? (
        <div className="text-center py-10">
          <p className="text-gray-600">Chargement des interventions...</p>
        </div>
      ) : Object.keys(groupedInterventions).length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-600">Aucune intervention enregistrée</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedInterventions)
            .slice(0, displayCount)
            .map(([date, intervs]) => (
              <Card key={date} className="w-full p-6 bg-white shadow-md">
                <h3 className="text-red-700 text-lg font-semibold mb-4">
                  {date}
                </h3>
                <div className="space-y-3">
                  {intervs.map((interv) => (
                    <div
                      key={interv.id}
                      className={`flex justify-between items-center p-4 rounded-lg border ${
                        interv.observation === "ras"
                          ? "bg-red-50 border-red-200"
                          : "bg-gray-50 border-gray-200"
                      }`}
                    >
                      {interv.observation === "ras" ? (
                        // RAS display - same line with flex-between
                        <div className="flex justify-between items-center w-full">
                          <p className="text-xs text-gray-500 font-medium">
                            Code: {interv.code_intervention}
                          </p>
                          <p className="text-4xl font-bold text-red-600">RAS</p>
                          <p className="text-xs text-gray-500 whitespace-nowrap">
                            {new Date(interv.created_at).toLocaleTimeString(
                              "fr-FR",
                            )}
                          </p>
                        </div>
                      ) : (
                        // Intervention display
                        <>
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900">
                              Code: {interv.code_intervention}
                            </p>
                            <p className="text-sm text-gray-700 font-bold italic">
                              <span className="font-medium">Machine:</span>{" "}
                              {interv.machine}
                            </p>
                            {interv.partie_machine && (
                              <p className="text-sm text-gray-700 font-bold italic">
                                <span className="font-medium">Partie:</span>{" "}
                                {interv.partie_machine}
                              </p>
                            )}
                            <p className="text-sm text-gray-700 font-bold italic">
                              <span className="font-medium">Description:</span>{" "}
                              {interv.intervention}
                            </p>
                            {interv.photos_intervention &&
                              interv.photos_intervention.length > 0 && (
                                <div className="mt-3 flex gap-2 flex-wrap">
                                  {interv.photos_intervention.map(
                                    (photo, idx) => (
                                      <button
                                        key={idx}
                                        onClick={() => {
                                          setSelectedPhotos(
                                            interv.photos_intervention,
                                          );
                                          setSelectedPhotoIndex(idx);
                                          setLightboxOpen(true);
                                        }}
                                        className="relative group cursor-pointer"
                                      >
                                        <img
                                          src={photo}
                                          alt={`Photo ${idx + 1}`}
                                          className="w-20 h-20 object-cover rounded-lg border border-gray-200 hover:border-blue-400 transition-all group-hover:scale-105"
                                        />
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 rounded-lg transition-colors flex items-center justify-center">
                                          <span className="text-white opacity-0 group-hover:opacity-100 text-xl">
                                            🔍
                                          </span>
                                        </div>
                                      </button>
                                    ),
                                  )}
                                </div>
                              )}
                            {interv.pieces && interv.pieces.length > 0 && (
                              <div className="mt-3 space-y-2">
                                <p className="text-xs font-semibold text-gray-600">
                                  Pièces utilisées:
                                </p>
                                <div className="space-y-2">
                                  {interv.pieces.map((piece, idx) => (
                                    <div
                                      key={idx}
                                      className="p-2 bg-white rounded border border-gray-200 text-xs"
                                    >
                                      <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                          <p className="font-medium text-gray-900">
                                            {piece.designation}
                                          </p>
                                          <p className="text-gray-600">
                                            Ref: {piece.reference}
                                          </p>
                                          <p className="text-gray-600">
                                            Code: {piece.code}
                                          </p>
                                          <p className="text-gray-600">
                                            Quantité: {piece.quantite}
                                          </p>
                                        </div>
                                        {piece.img_piece && (
                                          <button
                                            onClick={() => {
                                              setSelectedPiecePhotos([
                                                piece.img_piece,
                                              ]);
                                              setSelectedPiecePhotoIndex(0);
                                              setPiecePhotoLightboxOpen(true);
                                            }}
                                            className="ml-2 flex-shrink-0 relative group cursor-pointer"
                                          >
                                            <img
                                              src={piece.img_piece}
                                              alt={piece.designation}
                                              className="w-16 h-16 object-cover rounded border border-gray-200 hover:border-blue-400"
                                            />
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 rounded transition-colors flex items-center justify-center">
                                              <span className="text-white opacity-0 group-hover:opacity-100 text-lg">
                                                🔍
                                              </span>
                                            </div>
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 ml-4 whitespace-nowrap">
                            {new Date(interv.created_at).toLocaleTimeString(
                              "fr-FR",
                            )}
                          </p>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          {Object.keys(groupedInterventions).length > displayCount && (
            <div className="flex justify-center pt-4">
              <Button
                onClick={() => setDisplayCount(displayCount + 5)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Voir plus
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Photo Lightbox */}
      <PhotoLightbox
        photos={selectedPhotos}
        initialIndex={selectedPhotoIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
      />

      {/* Piece Photo Lightbox */}
      <PhotoLightbox
        photos={selectedPiecePhotos}
        initialIndex={selectedPiecePhotoIndex}
        isOpen={piecePhotoLightboxOpen}
        onClose={() => setPiecePhotoLightboxOpen(false)}
      />
    </div>
  );
}

export default PermanencesElectroPage;
