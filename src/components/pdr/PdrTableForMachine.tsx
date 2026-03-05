"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { IPdr } from "@/interfaces";
import { getPdrOfMachine, deletePdr } from "@/actions/pdrs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogOverlay,
  DialogTitle,
} from "@/components/ui/dialog";
import { EditPdrDialog } from "./EditPdrDialog";
import {
  Trash2,
  Edit2,
  Download,
  FileText,
  Sheet,
  X,
  ChevronLeft,
  ChevronRight,
  Loader,
} from "lucide-react";
import toast from "react-hot-toast";

interface PdrTableForMachineProps {
  machineName: string;
  machineDesignation: string;
}

// Helper function to convert value to number (null becomes 0)
function normalizeValue(value: number | string | null | undefined): number {
  if (value === null || value === undefined) return 0;
  const num = typeof value === "string" ? parseFloat(value) : value;
  return isNaN(num) ? 0 : num;
}

// Helper function to format currency value with DA and thousand separators
function formatValueWithDA(value: number | string | null | undefined): string {
  const numValue = normalizeValue(value);
  return new Intl.NumberFormat("fr-DZ", {
    style: "currency",
    currency: "DZD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numValue);
}

// Helper function to normalize PDR data (convert valeur to number)
function normalizePdrData(pdrs: IPdr[]): IPdr[] {
  return pdrs.map((pdr) => ({
    ...pdr,
    valeur: normalizeValue(pdr.valeur),
  }));
}

// Helper function to get image URL or default
function getImageUrl(imageUrl: string | null | undefined): string {
  if (imageUrl && imageUrl.trim()) {
    return imageUrl;
  }
  return "https://res.cloudinary.com/dtrz3i2f5/image/upload/v1739457347/next-app-pdr-2026/empty_qswmu1.png";
}

export function PdrTableForMachine({
  machineName,
  machineDesignation,
}: PdrTableForMachineProps) {
  const [pdrs, setPdrs] = useState<IPdr[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPdr, setSelectedPdr] = useState<IPdr | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(-1);
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const tableRef = useRef<HTMLDivElement>(null);

  // Ensure component is mounted before rendering
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const loadPdrs = useCallback(async () => {
    console.log("Starting to load PDRs for machine:", machineName);
    setIsLoading(true);
    try {
      const result = await getPdrOfMachine(machineName);
      console.log("getPdrOfMachine result:", result);
      console.log("PDRs data:", result.data);
      console.log("PDRs count:", result.data?.length);

      if (result.success && result.data) {
        // Normalize PDR data: convert valeur to number, replace null with 0
        const normalizedPdrs = normalizePdrData(result.data);
        console.log("Setting normalized PDRs:", normalizedPdrs);
        setPdrs(normalizedPdrs);
      } else {
        console.error("Error or no data:", result.error);
        toast.error(
          "Erreur: " + (result.error || "Impossible de charger les PDRs"),
        );
        setPdrs([]);
      }
    } catch (error) {
      console.error("Exception loading PDRs:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Une erreur est survenue";
      toast.error(errorMessage);
      setPdrs([]);
    } finally {
      setIsLoading(false);
    }
  }, [machineName]);

  useEffect(() => {
    console.log(
      "useEffect triggered for machine:",
      machineName,
      "isMounted:",
      isMounted,
    );
    if (isMounted) {
      loadPdrs();
    }
  }, [machineName, loadPdrs, isMounted]);

  const handleEdit = (pdr: IPdr) => {
    setSelectedPdr(pdr);
    setIsDialogOpen(true);
  };

  const handleImageClick = (imageUrl: string, index: number) => {
    setSelectedImage(imageUrl);
    setCurrentImageIndex(index);
    setIsImageLoading(true);
    setIsImageDialogOpen(true);
  };

  const goToPreviousImage = () => {
    if (currentImageIndex > 0) {
      setIsImageLoading(true);
      const previousIndex = currentImageIndex - 1;
      setCurrentImageIndex(previousIndex);
      const imageUrl = getImageUrl(pdrs[previousIndex].images_Pdr?.[0]);
      setSelectedImage(imageUrl);
    }
  };

  const goToNextImage = () => {
    if (currentImageIndex < pdrs.length - 1) {
      setIsImageLoading(true);
      const nextIndex = currentImageIndex + 1;
      setCurrentImageIndex(nextIndex);
      const imageUrl = getImageUrl(pdrs[nextIndex].images_Pdr?.[0]);
      setSelectedImage(imageUrl);
    }
  };

  const handleImageLoadComplete = () => {
    setIsImageLoading(false);
  };

  const handleDelete = async (code: number) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce PDR?")) {
      return;
    }

    try {
      const result = await deletePdr(code);

      if (result.success) {
        toast.success("PDR supprimé avec succès");
        setPdrs(pdrs.filter((pdr) => pdr.code !== code));
      } else {
        toast.error("Erreur lors de la suppression du PDR");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Une erreur est survenue");
    }
  };

  const handleEditSuccess = () => {
    loadPdrs();
  };

  // Export table to PDF using print dialog
  const exportPDF = () => {
    if (!tableRef.current) return;

    // Create a new window for printing
    const printWindow = window.open("", "", "height=600,width=900");
    if (!printWindow) {
      toast.error("Impossible d'ouvrir la fenêtre d'impression");
      return;
    }

    // Get the table HTML
    const tableHTML = tableRef.current.innerHTML;

    // Write the complete HTML document
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>PDR_${machineName}</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: white;
            color: black;
            padding: 20px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
          }
          th, td {
            border: 1px solid #999;
            padding: 12px;
            text-align: left;
          }
          th {
            background-color: #f5f5f5;
            font-weight: bold;
          }
          tr:nth-child(even) {
            background-color: #f9f9f9;
          }
          tr.bg-gray-100 {
            background-color: #f0f0f0 !important;
            font-weight: bold;
          }
          h3 {
            margin-bottom: 5px;
            font-size: 18px;
          }
          p {
            margin-bottom: 10px;
            font-size: 14px;
            color: #666;
          }
          img {
            max-width: 50px;
            height: auto;
            border-radius: 4px;
          }
          .no-print {
            display: none !important;
          }
          .text-right {
            text-align: right;
          }
          .font-semibold {
            font-weight: 600;
          }
          .font-bold {
            font-weight: 700;
          }
          .font-mono {
            font-family: 'Courier New', monospace;
          }
          .mb-4 {
            margin-bottom: 16px;
          }
          @media print {
            body {
              margin: 0;
              padding: 0;
            }
            @page {
              size: a4 landscape;
              margin: 10mm;
            }
          }
        </style>
      </head>
      <body>
        ${tableHTML}
        <script>
          window.print();
          setTimeout(() => window.close(), 100);
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Export table to Excel (CSV format for compatibility)
  const exportExcel = () => {
    try {
      // Create CSV content
      const headers = [
        "Numéro",
        "Code",
        "Désignation",
        "Valeur (DA)",
        "Emplacement",
        "Stock Actuel",
        "Référence",
      ];
      const rows = pdrs.map((pdr) => [
        pdr.numero || "",
        pdr.code || "",
        pdr.designation_pdr || "",
        pdr.valeur || "",
        pdr.emplacement || "",
        pdr.stock_actuel || "",
        pdr.reference || "",
      ]);

      // Add total row
      const totalValue = pdrs.reduce((sum, pdr) => sum + (pdr.valeur || 0), 0);
      rows.push(["", "", "TOTAL", formatValueWithDA(totalValue), "", "", ""]);

      // Convert to CSV
      const csvContent = [
        [machineName],
        [machineDesignation],
        [],
        headers.join(","),
        ...rows.map((row) =>
          row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","),
        ),
      ].join("\n");

      // Create blob and download
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `PDR_${machineName}_${new Date().toISOString().split("T")[0]}.csv`,
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Excel téléchargé avec succès");
    } catch (error) {
      console.error("Export Excel error:", error);
      toast.error("Erreur lors de l'export Excel");
    }
  };

  // Debug logging
  React.useEffect(() => {
    console.log("PdrTableForMachine state update:", {
      machineName,
      pdrsLength: pdrs.length,
      isLoading,
      isMounted,
      pdrs: pdrs.slice(0, 3),
    });
  }, [pdrs, isLoading, machineName, isMounted]);

  // Only render actual content after hydration
  if (!isMounted) {
    return (
      <div className="mt-8 space-y-4">
        <div className="border-b pb-4">
          <h2 className="text-2xl font-bold">{machineName}</h2>
          <p className="text-sm text-gray-600">{machineDesignation}</p>
        </div>
        <div className="text-center py-8 text-gray-500">
          Initialisation du composant...
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="mt-8 space-y-4">
        <div className="border-b pb-4">
          <h2 className="text-2xl font-bold">{machineName}</h2>
          <p className="text-sm text-gray-600">{machineDesignation}</p>
        </div>
        <div className="text-center py-8 text-gray-500">
          Chargement des PDRs...
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8 space-y-4">
      <div className="border-b pb-4">
        <h2 className="text-2xl font-bold">{machineName}</h2>
        <p className="text-sm text-gray-600">{machineDesignation}</p>
        <p className="text-xs text-gray-400 mt-2">
          Recherche: Machine = "{machineName}"
        </p>
        <p className="text-sm text-gray-500 mt-1">
          {pdrs.length} PDR(s) trouvé(s)
        </p>
      </div>

      {pdrs.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>Aucun PDR pour cette machine</p>
          <p className="text-xs text-gray-400 mt-2">
            Nom machine: &quot;{machineName}&quot;
          </p>
        </div>
      ) : (
        <>
          <div
            ref={tableRef}
            className="border rounded-lg overflow-hidden bg-white p-4"
          >
            <div className="mb-4">
              <h3 className="text-lg font-semibold">{machineName}</h3>
              <p className="text-sm text-gray-600">{machineDesignation}</p>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Image</TableHead>
                  <TableHead>Numéro</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Désignation</TableHead>
                  <TableHead className="text-right">Valeur</TableHead>
                  <TableHead>Emplacement</TableHead>
                  <TableHead>Stock Actuel</TableHead>
                  <TableHead>Référence</TableHead>
                  <TableHead className="text-right no-print">
                    Opérations
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pdrs.map((pdr, index) => {
                  const strNumero = String(pdr.numero || "-");
                  const strCode = String(pdr.code || "-");
                  const strDesignation = String(pdr.designation_pdr || "-");
                  const strEmplacement = String(pdr.emplacement || "-");
                  const strStock = String(pdr.stock_actuel || "-");
                  const strRef = String(pdr.reference || "-");
                  const imageUrl = getImageUrl(pdr.images_Pdr?.[0]);
                  console.log(
                    `Rendering image for code ${pdr.code}:`,
                    imageUrl,
                    "(from images_Pdr:",
                    pdr.images_Pdr,
                    ")",
                  );

                  return (
                    <TableRow key={pdr.code}>
                      <TableCell>
                        <img
                          src={imageUrl}
                          alt={strDesignation}
                          className="w-12 h-12 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => handleImageClick(imageUrl, index)}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "https://res.cloudinary.com/dtrz3i2f5/image/upload/v1739457347/next-app-pdr-2026/empty_qswmu1.png";
                          }}
                        />
                      </TableCell>
                      <TableCell>{strNumero}</TableCell>
                      <TableCell>
                        <span className="font-mono font-bold">{strCode}</span>
                      </TableCell>
                      <TableCell>{strDesignation}</TableCell>
                      <TableCell className="text-right font-semibold">
                        {formatValueWithDA(pdr.valeur)}
                      </TableCell>
                      <TableCell>{strEmplacement}</TableCell>
                      <TableCell>{strStock}</TableCell>
                      <TableCell>{strRef}</TableCell>
                      <TableCell className="text-right no-print">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(pdr)}
                            title="Modifier"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(pdr.code)}
                            title="Supprimer"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {/* Total Row */}
                <TableRow className="bg-gray-100 font-bold">
                  <TableCell colSpan={4} className="text-right">
                    TOTAL
                  </TableCell>
                  <TableCell className="text-right font-bold text-lg">
                    {formatValueWithDA(
                      pdrs.reduce((sum, pdr) => sum + (pdr.valeur || 0), 0),
                    )}
                  </TableCell>
                  <TableCell colSpan={3}></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          {/* Export Buttons */}
          <div className="flex gap-3 mt-6 no-print">
            <Button
              onClick={exportPDF}
              variant="outline"
              className="flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              Imprimer / PDF
            </Button>
            <Button
              onClick={exportExcel}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Sheet className="w-4 h-4" />
              Télécharger Excel
            </Button>
          </div>
        </>
      )}

      <EditPdrDialog
        pdr={selectedPdr}
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSuccess={handleEditSuccess}
      />

      {/* Image Viewer Dialog with Navigation */}
      <Dialog open={isImageDialogOpen} onOpenChange={setIsImageDialogOpen}>
        <DialogOverlay />
        <DialogContent className="max-w-4xl max-h-[85vh] p-4">
          <DialogTitle className="sr-only">Image PDR agrandie</DialogTitle>
          <div className="flex flex-col items-center justify-center w-full h-full gap-4">
            {/* Navigation and Image Container */}
            <div className="flex items-center justify-center gap-4 w-full h-full">
              {/* Previous Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={goToPreviousImage}
                disabled={currentImageIndex <= 0}
                className="text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-8 h-8" />
              </Button>

              {/* Image Display */}
              <div className="flex flex-col items-center justify-center">
                {/* Loading Spinner */}
                {isImageLoading && (
                  <div className="absolute flex items-center justify-center">
                    <Loader className="w-8 h-8 animate-spin text-gray-400" />
                  </div>
                )}

                {/* Image - Always Display (placeholder if empty) */}
                {selectedImage ? (
                  <img
                    src={selectedImage}
                    alt="Image PDR agrandie"
                    className="max-w-full max-h-[65vh] object-contain"
                    onLoad={handleImageLoadComplete}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "https://res.cloudinary.com/dtrz3i2f5/image/upload/v1739457347/next-app-pdr-2026/empty_qswmu1.png";
                      handleImageLoadComplete();
                    }}
                  />
                ) : (
                  <img
                    src="https://res.cloudinary.com/dtrz3i2f5/image/upload/v1739457347/next-app-pdr-2026/empty_qswmu1.png"
                    alt="Image non disponible"
                    className="max-w-full max-h-[65vh] object-contain"
                    onLoad={handleImageLoadComplete}
                  />
                )}

                {/* PDR Information */}
                {currentImageIndex >= 0 && pdrs[currentImageIndex] && (
                  <div className="mt-4 text-center w-full max-w-100">
                    <p className="text-sm font-semibold text-gray-800 mb-2">
                      {pdrs[currentImageIndex].designation_pdr || "N/A"}
                    </p>
                    <div className="text-xs text-gray-600 space-y-1">
                      <p>
                        <span className="font-medium">Stock Actuel:</span>{" "}
                        {pdrs[currentImageIndex].stock_actuel || "N/A"}
                      </p>
                      <p>
                        <span className="font-medium">Emplacement:</span>{" "}
                        {pdrs[currentImageIndex].emplacement || "N/A"}
                      </p>
                    </div>
                  </div>
                )}

                {/* Image Counter */}
                <span className="text-sm text-gray-500 mt-3">
                  {currentImageIndex + 1} / {pdrs.length}
                </span>
              </div>

              {/* Next Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={goToNextImage}
                disabled={currentImageIndex >= pdrs.length - 1}
                className="text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-8 h-8" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
