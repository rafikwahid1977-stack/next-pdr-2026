"use client";

export const dynamic = "force-dynamic";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  getMecanoInterventions,
  addMecanoInterv,
} from "@/actions/intervention_meca";
import { IMecano } from "@/interfaces";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { PhotoUploader } from "@/components/PhotoUploader";
import { PhotoLightbox } from "@/components/PhotoLightbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";

const machineParts = [
  {
    label: "Cromoman 70 A",
    value: "cromoman_A",
    sub: [
      { label: "Plieuse A", value: "plieuse_A" },
      { label: "Tour 3 Inf", value: "tour_3_inf" },
      { label: "Tour 3 Sup", value: "tour_3_sup" },
      { label: "Tour 4 Inf", value: "tour_4_inf" },
      { label: "Tour 4 Sup", value: "tour_4_sup" },
      { label: "Tour 5", value: "tour_5" },
      { label: "Superstructure A", value: "superstructure_A" },
      { label: "Autre Machine A", value: "autre_machine_A" },
    ],
  },
  {
    label: "Cromoman 70 B",
    value: "cromoman_B",
    sub: [
      { label: "Plieuse B", value: "plieuse_B" },
      { label: "Tour 6 Inf", value: "tour_6_inf" },
      { label: "Tour 6 Sup", value: "tour_6_sup" },
      { label: "Tour 7 Inf", value: "tour_7_inf" },
      { label: "Tour 7 Sup", value: "tour_7_sup" },
      { label: "Tour 8", value: "tour_8" },
      { label: "Superstructure B", value: "superstructure_B" },
      { label: "Autre Machine B", value: "autre_machine_B" },
    ],
  },
  { label: "Perforeuse", value: "perforeuse" },
  { label: "Coudeuse", value: "coudeuse" },
  { label: "BALDWIN A", value: "baldwin_A" },
  { label: "BALDWIN B", value: "baldwin_B" },
  {
    label: "Derouleur",
    value: "derouleur",
    sub: [
      { label: "Derouleur_3", value: "derouleur_3" },
      { label: "Derouleur_4", value: "derouleur_4" },
      { label: "Derouleur_5", value: "derouleur_5" },
      { label: "Derouleur_6", value: "derouleur_6" },
      { label: "Derouleur_7", value: "derouleur_7" },
      { label: "Derouleur_8", value: "derouleur_8" },
    ],
  },
  { label: "Technotrans", value: "technotrans" },
  { label: "Pompe Betz", value: "pompe_betz" },
  { label: "Compresseur GA 22+", value: "compresseur_ga_22_plus" },
  { label: "Compresseur GA 22 FF", value: "compresseur_ga_22_ff" },
  { label: "CTP AGFA", value: "ctp_agfa" },
  { label: "CTP FUJI", value: "ctp_fuji" },
  { label: "Groupe Electrogene", value: "groupe_electrogene" },
  { label: "FERAG A", value: "ferag_A" },
  { label: "FERAG B", value: "ferag_B" },
  { label: "AUTRE", value: "autre" },
];

// Textarea component inline
const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={`flex min-h-20 w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm ${className || ""}`}
    {...props}
  />
));
Textarea.displayName = "Textarea";

interface GroupedInterventions {
  [date: string]: IMecano[];
}

function MecanoPage() {
  const [interventions, setInterventions] = useState<IMecano[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({
    machine: "",
    partie_machine: "",
    description: "",
    imgs_intervention: [] as string[],
  });
  const [submitting, setSubmitting] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [displayCount, setDisplayCount] = useState(5);
  const [showPieces, setShowPieces] = useState(false);
  const [pieces, setPieces] = useState<
    {
      designation: string;
      reference: string;
      code: string;
      quantite: number;
      img_piece: string;
    }[]
  >([]);
  const [piecePhotoLightboxOpen, setPiecePhotoLightboxOpen] = useState(false);
  const [selectedPiecePhotos, setSelectedPiecePhotos] = useState<string[]>([]);
  const [selectedPiecePhotoIndex, setSelectedPiecePhotoIndex] = useState(0);
  const [hideAddButton, setHideAddButton] = useState(false);
  const searchParams = useSearchParams();
  const { user } = useAuth();

  // Check if coming from electro or if user is Boudjellah (can't add in mecano)
  useEffect(() => {
    const fromElectro = searchParams.get("from") === "electro";
    const isBoudjellah = user?.username === "Boudjellah";
    setHideAddButton(fromElectro || isBoudjellah);
  }, [searchParams, user?.username]);

  // Fetch interventions
  useEffect(() => {
    const fetchInterventions = async () => {
      setLoading(true);
      const result = await getMecanoInterventions();
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

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (
      !formData.machine.trim() ||
      !formData.description.trim() ||
      formData.imgs_intervention.length === 0
    ) {
      alert("Veuillez remplir tous les champs requis");
      return;
    }

    // Check if selected machine has subparts and partie_machine is required
    const selectedMachine = machineParts.find(
      (m) => m.label === formData.machine,
    );
    if (
      selectedMachine &&
      selectedMachine.sub &&
      selectedMachine.sub.length > 0 &&
      !formData.partie_machine.trim()
    ) {
      alert("Veuillez sélectionner une partie de la machine");
      return;
    }

    setSubmitting(true);
    try {
      // Prepare submission data
      const submissionData: any = {
        machine: formData.machine.trim(),
        partie_machine: formData.partie_machine.trim(),
        description: formData.description.trim(),
        imgs_intervention: formData.imgs_intervention,
        pieces: showPieces ? pieces : [],
        user: user?.username || "",
      };

      const result = await addMecanoInterv(submissionData);

      if (result.success && result.data && result.data.length > 0) {
        alert("Intervention mécanique ajoutée avec succès");
        setInterventions([result.data[0], ...interventions]);
        setOpenDialog(false);
        setFormData({
          machine: "",
          partie_machine: "",
          description: "",
          imgs_intervention: [],
        });
        setShowPieces(false);
        setPieces([]);
      } else {
        alert(`Erreur: ${result.error}`);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Erreur lors de l'ajout de l'intervention");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full p-6 md:ml-0">
      {/* Header with title and button */}
      <div className="flex justify-between items-center mb-8 mt-12 md:mt-0">
        <h1 className="text-3xl font-bold">Interventions Mécanique</h1>
        {/* Hide button if coming from electro or if user is Boudjellah (can't add in mecano) */}
        {!hideAddButton && (
          <Dialog open={openDialog} onOpenChange={setOpenDialog}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="mr-2 h-4 w-4" />
                Ajouter
              </Button>
            </DialogTrigger>
            <DialogContent
              className="sm:max-w-md max-h-[90vh] overflow-y-auto flex flex-col"
              aria-describedby="dialog-description"
            >
              <DialogHeader>
                <DialogTitle>Ajouter une intervention mécanique</DialogTitle>
                <p id="dialog-description" className="text-sm text-gray-500">
                  Remplissez le formulaire pour ajouter une nouvelle
                  intervention mécanique
                </p>
              </DialogHeader>

              <form
                onSubmit={handleSubmit}
                className="space-y-6 flex-1 overflow-y-auto px-1"
              >
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="machine">Machine *</Label>
                    <Select
                      value={formData.machine}
                      onValueChange={(value) =>
                        setFormData({
                          ...formData,
                          machine: value,
                          partie_machine: "",
                        })
                      }
                    >
                      <SelectTrigger id="machine">
                        <SelectValue placeholder="Sélectionner une machine" />
                      </SelectTrigger>
                      <SelectContent>
                        {machineParts.map((machine) => (
                          <SelectItem key={machine.value} value={machine.label}>
                            {machine.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Conditional Select for subparts */}
                  {formData.machine &&
                    (() => {
                      const selectedMachine = machineParts.find(
                        (m) => m.label === formData.machine,
                      );
                      return selectedMachine &&
                        selectedMachine.sub &&
                        selectedMachine.sub.length > 0 ? (
                        <div>
                          <Label htmlFor="partie_machine">
                            Partie de la machine *
                          </Label>
                          <Select
                            value={formData.partie_machine}
                            onValueChange={(value) =>
                              setFormData({
                                ...formData,
                                partie_machine: value,
                              })
                            }
                          >
                            <SelectTrigger id="partie_machine">
                              <SelectValue placeholder="Sélectionner une partie" />
                            </SelectTrigger>
                            <SelectContent>
                              {selectedMachine.sub.map((part) => (
                                <SelectItem key={part.value} value={part.label}>
                                  {part.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      ) : null;
                    })()}

                  <div>
                    <Label htmlFor="description">
                      Description de l'intervention *
                    </Label>
                    <Textarea
                      id="description"
                      placeholder="Décrivez l'intervention mécanique"
                      value={formData.description}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="images">Images de l'intervention *</Label>
                    <PhotoUploader
                      photos={formData.imgs_intervention}
                      onPhotosChange={(urls) =>
                        setFormData({
                          ...formData,
                          imgs_intervention: urls,
                        })
                      }
                    />
                  </div>

                  {/* Checkbox for pieces */}
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="pieces"
                      checked={showPieces}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setShowPieces(e.target.checked)
                      }
                      className="w-4 h-4 rounded"
                    />
                    <Label htmlFor="pieces" className="cursor-pointer">
                      Ajouter des pièces
                    </Label>
                  </div>

                  {/* Conditional pieces fields */}
                  {showPieces && (
                    <div className="border-t pt-4 space-y-4">
                      <h3 className="font-semibold text-sm">
                        Pièces utilisées
                      </h3>

                      {pieces.map((piece, index) => (
                        <div
                          key={index}
                          className="p-3 bg-gray-50 rounded-lg space-y-2 border border-gray-200"
                        >
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium">
                              Pièce {index + 1}
                            </span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                setPieces(pieces.filter((_, i) => i !== index))
                              }
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              Supprimer
                            </Button>
                          </div>
                          <div>
                            <Label className="text-xs">Désignation</Label>
                            <Input
                              placeholder="Ex: Boulon"
                              value={piece.designation}
                              onChange={(e) => {
                                const newPieces = [...pieces];
                                newPieces[index].designation = e.target.value;
                                setPieces(newPieces);
                              }}
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Référence</Label>
                            <Input
                              placeholder="Ex: BL-001"
                              value={piece.reference}
                              onChange={(e) => {
                                const newPieces = [...pieces];
                                newPieces[index].reference = e.target.value;
                                setPieces(newPieces);
                              }}
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Code</Label>
                            <Input
                              placeholder="Ex: CODE-001"
                              value={piece.code}
                              onChange={(e) => {
                                const newPieces = [...pieces];
                                newPieces[index].code = e.target.value;
                                setPieces(newPieces);
                              }}
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Quantité</Label>
                            <Input
                              type="number"
                              placeholder="Ex: 1"
                              value={piece.quantite}
                              onChange={(e) => {
                                const newPieces = [...pieces];
                                newPieces[index].quantite =
                                  parseInt(e.target.value) || 0;
                                setPieces(newPieces);
                              }}
                              min="1"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Image de la pièce</Label>
                            <div className="flex gap-2">
                              <input
                                type="file"
                                accept="image/*"
                                capture="environment"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    // Check file size (limit to 2MB per image)
                                    if (file.size > 2 * 1024 * 1024) {
                                      alert(
                                        "L'image est trop grande. Veuillez choisir une image plus petite (max 2MB)",
                                      );
                                      return;
                                    }
                                    const reader = new FileReader();
                                    reader.onload = (event) => {
                                      const base64String = event.target
                                        ?.result as string;
                                      // Compress image if too large
                                      if (base64String.length > 500000) {
                                        const img = new Image();
                                        img.onload = () => {
                                          const canvas =
                                            document.createElement("canvas");
                                          const maxDimension = 800;
                                          let width = img.width;
                                          let height = img.height;
                                          if (width > height) {
                                            if (width > maxDimension) {
                                              height *= maxDimension / width;
                                              width = maxDimension;
                                            }
                                          } else {
                                            if (height > maxDimension) {
                                              width *= maxDimension / height;
                                              height = maxDimension;
                                            }
                                          }
                                          canvas.width = width;
                                          canvas.height = height;
                                          const ctx = canvas.getContext("2d");
                                          ctx?.drawImage(
                                            img,
                                            0,
                                            0,
                                            width,
                                            height,
                                          );
                                          const compressedBase64 =
                                            canvas.toDataURL("image/jpeg", 0.7);
                                          const newPieces = [...pieces];
                                          newPieces[index].img_piece =
                                            compressedBase64;
                                          setPieces(newPieces);
                                        };
                                        img.src = base64String;
                                      } else {
                                        const newPieces = [...pieces];
                                        newPieces[index].img_piece =
                                          base64String;
                                        setPieces(newPieces);
                                      }
                                    };
                                    reader.readAsDataURL(file);
                                  }
                                }}
                                className="flex-1 text-xs file:text-xs file:px-2 file:py-1"
                              />
                            </div>
                            {piece.img_piece && (
                              <div className="mt-2 relative">
                                <img
                                  src={piece.img_piece}
                                  alt={`Pièce ${index + 1}`}
                                  className="w-20 h-20 object-cover rounded-lg border border-gray-300"
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    const newPieces = [...pieces];
                                    newPieces[index].img_piece = "";
                                    setPieces(newPieces);
                                  }}
                                  className="absolute -top-2 -right-2 bg-red-600 hover:bg-red-700 text-white rounded-full w-6 h-6 p-0 flex items-center justify-center"
                                >
                                  ×
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}

                      <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        onClick={() =>
                          setPieces([
                            ...pieces,
                            {
                              designation: "",
                              reference: "",
                              code: "",
                              quantite: 1,
                              img_piece: "",
                            },
                          ])
                        }
                      >
                        + Ajouter une pièce
                      </Button>
                    </div>
                  )}
                </div>

                {/* Submit button */}
                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? "Validation en cours..." : "Valider"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

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
                <h3 className="text-blue-700 text-lg font-semibold mb-4">
                  {date}
                </h3>
                <div className="space-y-3">
                  {intervs.map((interv) => (
                    <div
                      key={interv.id}
                      className="flex justify-between items-start p-4 rounded-lg border bg-gray-50 border-gray-200"
                    >
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
                          {interv.description}
                        </p>
                        <p className="text-sm text-blue-600 font-semibold mt-2">
                          <span className="font-medium">Technicien:</span>{" "}
                          {interv.user}
                        </p>
                        {interv.imgs_intervention &&
                          interv.imgs_intervention.length > 0 && (
                            <div className="mt-3 flex gap-2 flex-wrap">
                              {interv.imgs_intervention.map((photo, idx) => (
                                <button
                                  key={idx}
                                  onClick={() => {
                                    setSelectedPhotos(interv.imgs_intervention);
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
                                    <span className="text-white text-xs font-medium opacity-0 group-hover:opacity-100">
                                      {idx + 1}/
                                      {interv.imgs_intervention.length}
                                    </span>
                                  </div>
                                </button>
                              ))}
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
                                  className="flex gap-2 p-2 bg-white rounded border border-gray-200"
                                >
                                  {piece.img_piece && (
                                    <button
                                      onClick={() => {
                                        setSelectedPiecePhotos([
                                          piece.img_piece,
                                        ]);
                                        setSelectedPiecePhotoIndex(0);
                                        setPiecePhotoLightboxOpen(true);
                                      }}
                                      className="relative group cursor-pointer shrink-0"
                                    >
                                      <img
                                        src={piece.img_piece}
                                        alt={`Pièce ${idx + 1}`}
                                        className="w-12 h-12 object-cover rounded group-hover:scale-110 transition-transform"
                                      />
                                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 rounded transition-colors flex items-center justify-center">
                                        <span className="text-white text-xs font-medium opacity-0 group-hover:opacity-100">
                                          🔍
                                        </span>
                                      </div>
                                    </button>
                                  )}
                                  <div className="flex-1 text-xs">
                                    <p className="font-medium text-gray-900">
                                      {piece.designation}
                                    </p>
                                    <p className="text-gray-500">
                                      Ref: {piece.reference}
                                    </p>
                                    {piece.code && (
                                      <p className="text-gray-500">
                                        Code: {piece.code}
                                      </p>
                                    )}
                                    <p className="text-gray-500">
                                      Qty: {piece.quantite}
                                    </p>
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

export default MecanoPage;
