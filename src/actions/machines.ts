"use server";

import supabaseConfig from "../../config/supabase-config";
import { IMachine } from "@/interfaces";

/**
 * Add a new machine
 */
export async function addMachine(data: IMachine) {
  try {
    const { data: result, error } = await supabaseConfig
      .from("machines")
      .insert([
        {
          numero: data.numero,
          nom_machine: data.nom_machine,
          img_machine: data.img_machine,
          Designation_Complete: data.designation_complete,
        },
      ])
      .select();

    if (error) throw error;
    return { success: true, data: result };
  } catch (error) {
    console.error("Error adding machine:", error);
    return { success: false, error: String(error) };
  }
}

/**
 * Edit an existing machine
 */
export async function editMachine(
  nom_machine: string,
  data: Partial<IMachine>,
) {
  try {
    const updateData: Record<string, unknown> = {};

    if (data.numero !== undefined) updateData.numero = data.numero;
    if (data.nom_machine !== undefined)
      updateData.nom_machine = data.nom_machine;
    if (data.img_machine !== undefined)
      updateData.img_machine = data.img_machine;
    if (data.designation_complete !== undefined)
      updateData.Designation_Complete = data.designation_complete;

    const { data: result, error } = await supabaseConfig
      .from("machines")
      .update(updateData)
      .eq("nom_machine", nom_machine)
      .select();

    if (error) throw error;
    return { success: true, data: result };
  } catch (error) {
    console.error("Error editing machine:", error);
    return { success: false, error: String(error) };
  }
}

/**
 * Delete a machine
 */
export async function deleteMachine(nom_machine: string) {
  try {
    const { error } = await supabaseConfig
      .from("machines")
      .delete()
      .eq("nom_machine", nom_machine);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error("Error deleting machine:", error);
    return { success: false, error: String(error) };
  }
}

/**
 * Get a machine by name
 */
export async function getByMachine(nom_machine: string) {
  try {
    const { data, error } = await supabaseConfig
      .from("machines")
      .select("*")
      .eq("nom_machine", nom_machine)
      .single();

    if (error) throw error;

    return {
      success: true,
      data: {
        numero: data.numero,
        nom_machine: data.nom_machine,
        img_machine: data.img_machine,
        designation_complete: data.Designation_Complete,
      } as IMachine,
    };
  } catch (error) {
    console.error("Error fetching machine:", error);
    return { success: false, error: String(error) };
  }
}

/**
 * Get all machines
 */
export async function getAllMachines() {
  try {
    const { data, error } = await supabaseConfig.from("machines").select("*");

    if (error) throw error;

    return {
      success: true,
      data: data.map((machine) => ({
        numero: machine.numero,
        nom_machine: machine.nom_machine,
        img_machine: machine.img_machine,
        designation_complete: machine.Designation_Complete,
      })) as IMachine[],
    };
  } catch (error) {
    console.error("Error fetching all machines:", error);
    return { success: false, error: String(error) };
  }
}

/**
 * Get all machines with pieces count
 */
export async function getAllMachinesWithPieces(): Promise<{
  success: boolean;
  data: Array<{
    numero: number;
    nom_machine: string;
    img_machine: string | null;
    designation_complete: string;
    pieces_count: number;
  }>;
  error?: string;
}> {
  try {
    const { data: machines, error: machinesError } = await supabaseConfig
      .from("machines")
      .select("*")
      .order("numero", { ascending: true });

    if (machinesError) throw machinesError;

    // Récupérer tous les PDRs avec tous les champs pour détecter le nom de la colonne machine
    const { data: allPdrs, error: pdrsError } = await supabaseConfig
      .from("table_pdrs")
      .select("*");

    if (pdrsError) {
      console.error("Error fetching PDRs:", pdrsError);
      throw pdrsError;
    }

    // Détecter le nom de la colonne machine
    let machineColumnName: string | null = null;
    const possibleColumnNames = [
      "Machine",
      "machine",
      "nom_machine",
      "nom_Machine",
    ];

    if (allPdrs && allPdrs.length > 0) {
      const firstPdr = allPdrs[0];
      for (const columnName of possibleColumnNames) {
        if (columnName in firstPdr) {
          machineColumnName = columnName;
          break;
        }
      }
    }

    // Créer un map des comptages de pièces par machine
    const pieceCountMap = new Map<string, number>();

    if (allPdrs && Array.isArray(allPdrs) && machineColumnName) {
      allPdrs.forEach((pdr: any) => {
        const machineName = pdr[machineColumnName!];
        if (machineName) {
          pieceCountMap.set(
            machineName,
            (pieceCountMap.get(machineName) || 0) + 1,
          );
        }
      });
    }

    // Mapper les machines avec le nombre de pièces
    const DEFAULT_MACHINE_IMAGE =
      "https://res.cloudinary.com/dtrz3i2f5/image/upload/v1739457347/next-app-pdr-2026/empty_qswmu1.png";

    console.log("getAllMachinesWithPieces - Machines count:", machines.length);
    const machinesWithPieces = machines.map((machine) => {
      const rawUrl = machine.img_machine?.trim() || null;
      const imgUrl =
        rawUrl && rawUrl.length > 0 ? rawUrl.trimEnd() : DEFAULT_MACHINE_IMAGE;
      console.log(
        `Machine #${machine.numero}: img_machine = ${machine.img_machine}, using: ${imgUrl ? "custom URL" : "default"}`,
      );
      return {
        numero: machine.numero,
        nom_machine: machine.nom_machine,
        img_machine: imgUrl,
        designation_complete: machine.Designation_Complete,
        pieces_count: pieceCountMap.get(machine.nom_machine) || 0,
      };
    });

    return {
      success: true,
      data: machinesWithPieces,
    };
  } catch (error) {
    console.error("Error fetching machines with pieces:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      data: [],
      error: errorMessage || "Erreur inconnue lors du chargement des machines",
    };
  }
}

/** * Helper function to get field value from object with multiple possible field names
 */
function getFieldValue(obj: any, ...possibleFieldNames: string[]): any {
  for (const fieldName of possibleFieldNames) {
    if (fieldName in obj) {
      console.log(`getFieldValue: Found "${fieldName}" = ${obj[fieldName]}`);
      return obj[fieldName];
    }
  }
  console.log(
    `getFieldValue: No field found from [${possibleFieldNames.join(", ")}]. Available keys: [${Object.keys(obj).join(", ")}]`,
  );
  return null;
}

/** * Get all PDRs for a specific machine with images
 */
export async function getPdrsForMachine(machineId: number) {
  try {
    // Validate machineId
    if (!machineId || isNaN(machineId) || machineId <= 0) {
      return {
        success: false,
        error: "ID machine invalide",
        data: [],
        machine: null,
      };
    }

    // First get the machine by numero
    const { data: machine, error: machineError } = await supabaseConfig
      .from("machines")
      .select("*")
      .eq("numero", machineId)
      .single();

    if (machineError) throw machineError;

    // Get all PDRs to detect the machine column name
    const { data: allPdrs, error: pdrsError } = await supabaseConfig
      .from("table_pdrs")
      .select("*");

    if (pdrsError) throw pdrsError;

    if (!allPdrs || allPdrs.length === 0) {
      return {
        success: true,
        data: [],
        machine: {
          numero: machine.numero,
          nom_machine: machine.nom_machine,
          designation_complete: machine.Designation_Complete,
        },
      };
    }

    // Log available columns
    console.log("Available columns in table_pdrs:", Object.keys(allPdrs[0]));
    console.log("First PDR sample:", JSON.stringify(allPdrs[0], null, 2));

    // Debug: check image field specifically
    const firstPdr = allPdrs[0];
    const imageFieldCandidates = [
      "images_Pdr",
      "image_Pdr",
      "image_pdr",
      "imagePdr",
      "IMAGE_PDR",
      "Image",
      "image",
      "Img",
      "img",
    ];
    console.log("Image field check:");
    imageFieldCandidates.forEach((field) => {
      console.log(
        `  ${field}: ${firstPdr[field] !== undefined ? firstPdr[field] || "EMPTY/NULL" : "MISSING"}`,
      );
    });

    // Detect machine column name
    let machineColumnName: string | null = null;
    const possibleColumnNames = [
      "Machine",
      "machine",
      "nom_machine",
      "nom_Machine",
    ];

    if (allPdrs && allPdrs.length > 0) {
      const firstPdr = allPdrs[0];
      for (const columnName of possibleColumnNames) {
        if (columnName in firstPdr) {
          machineColumnName = columnName;
          break;
        }
      }
    }

    if (!machineColumnName) {
      return { success: false, error: "Machine column not found", data: [] };
    }

    // Filter PDRs for this machine
    const machinePdrs = allPdrs.filter(
      (pdr: any) =>
        pdr[machineColumnName!]?.toString().toLowerCase() ===
        machine.nom_machine.toLowerCase(),
    );

    // Transform PDRs to include all required information
    const pdrsWithImages = machinePdrs
      .map((pdr: any) => {
        // Use getFieldValue helper to find fields from multiple possible column names
        const image_url = getFieldValue(
          pdr,
          "image_Pdr",
          "images_Pdr",
          "image_pdr",
          "imagePdr",
          "IMAGE_PDR",
          "IMAGE",
          "Image",
          "image",
          "Img",
          "img",
        );

        const stock_actuel =
          getFieldValue(
            pdr,
            "Stock Actuel",
            "stock_actuel",
            "StockActuel",
            "STOCK_ACTUEL",
          ) || 0;

        const emplacement = getFieldValue(
          pdr,
          "EMPLACEMENT",
          "emplacement",
          "Emplacement",
          "EMPL",
        );

        const reference = getFieldValue(
          pdr,
          "Ref",
          "reference",
          "Reference",
          "REFERENCE",
          "REF",
        );

        const numero = getFieldValue(pdr, "Numero", "numero", "NUMERO");

        const designation_pdr = getFieldValue(
          pdr,
          "DESIGNATION_PDR",
          "designation_pdr",
          "Designation_Pdr",
          "designation_Pdr",
        );

        return {
          code: pdr.code,
          numero,
          designation_pdr,
          image_url,
          stock_actuel,
          emplacement,
          reference,
        };
      })
      // Sort by numero in ascending order
      .sort((a, b) => {
        const numA = a.numero || 0;
        const numB = b.numero || 0;
        return numA - numB;
      });

    console.log("PDRs with images:", pdrsWithImages.slice(0, 3));

    return {
      success: true,
      data: pdrsWithImages,
      machine: {
        numero: machine.numero,
        nom_machine: machine.nom_machine,
        designation_complete: machine.Designation_Complete,
      },
    };
  } catch (error) {
    console.error("Error fetching PDRs for machine:", error);
    return {
      success: false,
      error: String(error),
      data: [],
      machine: null,
    };
  }
}

/**
 * Search for PDRs by code, designation_pdr, or reference
 */
export async function searchPdrs(searchTerm: string): Promise<{
  success: boolean;
  data: Array<{
    code: number;
    numero: number;
    designation_pdr: string;
    image_url: string | null;
    stock_actuel: number;
    emplacement: string | null;
    reference: string | null;
    nom_machine: string;
  }>;
  error?: string;
}> {
  try {
    if (!searchTerm || searchTerm.trim().length < 4) {
      return {
        success: true,
        data: [],
      };
    }

    const trimmedSearch = searchTerm.trim().toLowerCase();

    // Get all PDRs
    const { data: allPdrs, error: pdrsError } = await supabaseConfig
      .from("table_pdrs")
      .select("*");

    if (pdrsError) throw pdrsError;

    if (!allPdrs || allPdrs.length === 0) {
      return {
        success: true,
        data: [],
      };
    }

    // Filter PDRs based on search term
    const filteredPdrs = allPdrs.filter((pdr: any) => {
      const code = String(pdr.code || "").toLowerCase();
      const designation = String(
        pdr.DESIGNATION_PDR ||
          pdr.designation_pdr ||
          pdr.Designation_Pdr ||
          pdr.designation_Pdr ||
          "",
      ).toLowerCase();
      const reference = String(
        pdr.Ref ||
          pdr.reference ||
          pdr.Reference ||
          pdr.REFERENCE ||
          pdr.REF ||
          "",
      ).toLowerCase();

      return (
        code.includes(trimmedSearch) ||
        designation.includes(trimmedSearch) ||
        reference.includes(trimmedSearch)
      );
    });

    // Map filtered PDRs to result format
    const results = filteredPdrs
      .map((pdr: any) => {
        const image_url = getFieldValue(
          pdr,
          "image_Pdr",
          "images_Pdr",
          "image_pdr",
          "imagePdr",
          "IMAGE_PDR",
          "IMAGE",
          "Image",
          "image",
          "Img",
          "img",
        );

        const stock_actuel =
          getFieldValue(
            pdr,
            "Stock Actuel",
            "stock_actuel",
            "StockActuel",
            "STOCK_ACTUEL",
          ) || 0;

        const emplacement = getFieldValue(
          pdr,
          "EMPLACEMENT",
          "emplacement",
          "Emplacement",
          "EMPL",
        );

        const reference = getFieldValue(
          pdr,
          "Ref",
          "reference",
          "Reference",
          "REFERENCE",
          "REF",
        );

        const numero = getFieldValue(pdr, "Numero", "numero", "NUMERO");

        const designation_pdr = getFieldValue(
          pdr,
          "DESIGNATION_PDR",
          "designation_pdr",
          "Designation_Pdr",
          "designation_Pdr",
        );

        const nom_machine = getFieldValue(
          pdr,
          "Machine",
          "machine",
          "nom_machine",
          "nom_Machine",
        );

        return {
          code: pdr.code,
          numero,
          designation_pdr,
          image_url,
          stock_actuel,
          emplacement,
          reference,
          nom_machine: nom_machine || "",
        };
      })
      .sort((a, b) => {
        const numA = a.numero || 0;
        const numB = b.numero || 0;
        return numA - numB;
      });

    return {
      success: true,
      data: results,
    };
  } catch (error) {
    console.error("Error searching PDRs:", error);
    return {
      success: false,
      data: [],
      error: String(error),
    };
  }
}
