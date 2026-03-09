"use server";

import supabaseConfig from "../../config/supabase-config";
import { IPdr } from "@/interfaces";

/**
 * Helper function to convert error to string
 */
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === "string") {
    return error;
  }
  if (error && typeof error === "object" && "message" in error) {
    return (error as any).message;
  }
  return JSON.stringify(error);
}

/**
 * Add a new PDR
 */
export async function addPdr(data: IPdr) {
  try {
    const { data: result, error } = await supabaseConfig
      .from("table_pdrs")
      .insert([
        {
          Numero: data.numero,
          code: data.code,
          DESIGNATION_PDR: data.designation_pdr,
          Valeur: data.valeur,
          EMPLACEMENT: data.emplacement,
          "Stock Actuel": data.stock_actuel,
          Machine: data.machine,
          Ref: data.reference,
          image_Pdr: data.images_Pdr?.length > 0 ? data.images_Pdr[0] : null,
        },
      ])
      .select();

    if (error) throw error;
    return { success: true, data: result };
  } catch (error) {
    console.error("Error adding PDR:", error);
    return { success: false, error: getErrorMessage(error) };
  }
}

/**
 * Edit an existing PDR
 */
export async function editPdr(code: number, data: Partial<IPdr>) {
  try {
    const updateData: Record<string, unknown> = {};

    if (data.numero !== undefined) updateData.Numero = data.numero;
    if (data.designation_pdr !== undefined)
      updateData.DESIGNATION_PDR = data.designation_pdr;
    if (data.valeur !== undefined) updateData.Valeur = data.valeur;
    if (data.emplacement !== undefined)
      updateData.EMPLACEMENT = data.emplacement;
    if (data.stock_actuel !== undefined)
      updateData["Stock Actuel"] = data.stock_actuel;
    if (data.machine !== undefined) updateData.Machine = data.machine;
    if (data.reference !== undefined) updateData.Ref = data.reference;
    if (data.images_Pdr?.length) updateData.image_Pdr = data.images_Pdr[0];

    const { data: result, error } = await supabaseConfig
      .from("table_pdrs")
      .update(updateData)
      .eq("code", code)
      .select();

    if (error) throw error;
    return { success: true, data: result };
  } catch (error) {
    console.error("Error editing PDR:", error);
    return { success: false, error: getErrorMessage(error) };
  }
}

/**
 * Delete a PDR
 */
export async function deletePdr(code: number) {
  try {
    const { error } = await supabaseConfig
      .from("table_pdrs")
      .delete()
      .eq("code", code);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error("Error deleting PDR:", error);
    return { success: false, error: getErrorMessage(error) };
  }
}

/**
 * Helper function to get value from object with case-insensitive key lookup
 */
function getFieldValue(obj: any, ...possibleFieldNames: string[]): any {
  for (const fieldName of possibleFieldNames) {
    if (fieldName in obj) {
      console.log(`getFieldValue: Found "${fieldName}" = ${obj[fieldName]}`);
      return obj[fieldName];
    }
  }
  console.log(
    `getFieldValue: No field found from [${possibleFieldNames.join(", ")}] in obj with keys [${Object.keys(obj).join(", ")}]`,
  );
  return null;
}

/**
 * Get all PDRs for a specific machine
 */
export async function getPdrOfMachine(machine: string) {
  try {
    console.log("Fetching PDRs for machine:", machine);

    // Get all PDRs
    const { data: allData, error: allError } = await supabaseConfig
      .from("table_pdrs")
      .select("*");

    if (allError) {
      console.error("Error fetching all PDRs:", allError);
      throw allError;
    }

    if (!allData || allData.length === 0) {
      console.log("No PDRs found");
      return {
        success: true,
        data: [],
      };
    }

    // Find the machine field name from the first row
    const firstRow = allData[0];
    console.log("First row keys:", Object.keys(firstRow));
    console.log("First row data:", firstRow);

    const machineFieldNames = [
      "Machine",
      "machine",
      "nom_machine",
      "nom_Machine",
    ];

    let machineFieldName = null;
    for (const fieldName of machineFieldNames) {
      if (fieldName in firstRow) {
        machineFieldName = fieldName;
        break;
      }
    }

    if (!machineFieldName) {
      console.error(
        "Machine field not found. Available fields:",
        Object.keys(firstRow),
      );
      return {
        success: false,
        error: "Champ machine non trouvé dans la table",
        data: [],
      };
    }

    console.log(`Using machine field: ${machineFieldName}`);

    // Filter PDRs by machine (case-insensitive)
    const filteredData = allData.filter(
      (pdr: any) =>
        pdr[machineFieldName]?.toString().toLowerCase() ===
        machine.toLowerCase(),
    );

    console.log("PDRs filtered:", filteredData.length);
    if (filteredData.length > 0) {
      console.log("First filtered PDR:", filteredData[0]);
    }

    return {
      success: true,
      data:
        filteredData && filteredData.length > 0
          ? filteredData.map((pdr: any) => {
              const transformed = {
                code: getFieldValue(pdr, "code") || null,
                numero:
                  getFieldValue(pdr, "Numero", "numero", "NUMERO") || null,
                designation_pdr:
                  getFieldValue(
                    pdr,
                    "DESIGNATION_PDR",
                    "designation_pdr",
                    "Designation_Pdr",
                  ) || null,
                valeur:
                  getFieldValue(pdr, "Valeur", "valeur", "VALEUR") || null,
                emplacement:
                  getFieldValue(
                    pdr,
                    "EMPLACEMENT",
                    "emplacement",
                    "Emplacement",
                  ) || null,
                stock_actuel:
                  getFieldValue(
                    pdr,
                    "Stock Actuel",
                    "stock_actuel",
                    "StockActuel",
                  ) || null,
                machine: getFieldValue(pdr, machineFieldName) || machine,
                reference:
                  getFieldValue(pdr, "Ref", "reference", "Reference") || null,
                images_Pdr: (() => {
                  const imageUrl = getFieldValue(
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
                  console.log(
                    `Image field for code ${pdr.code || "unknown"}:`,
                    imageUrl,
                  );
                  return imageUrl ? [imageUrl] : [];
                })(),
              };
              console.log("Transformed PDR:", transformed);
              return transformed;
            })
          : [],
    };
  } catch (error) {
    console.error("Error fetching PDRs for machine:", error);
    return { success: false, error: getErrorMessage(error), data: [] };
  }
}

/**
 * Get all PDRs (for debugging)
 */
export async function getAllPdrs() {
  try {
    const { data, error } = await supabaseConfig.from("table_pdrs").select("*");

    if (error) throw error;

    console.log("All PDRs with raw data:", data);

    return {
      success: true,
      data: data.map((pdr) => ({
        code: getFieldValue(pdr, "code") || null,
        numero: getFieldValue(pdr, "Numero", "numero", "NUMERO") || null,
        designation_pdr:
          getFieldValue(
            pdr,
            "DESIGNATION_PDR",
            "designation_pdr",
            "Designation_Pdr",
          ) || null,
        valeur: getFieldValue(pdr, "Valeur", "valeur", "VALEUR") || null,
        emplacement:
          getFieldValue(pdr, "EMPLACEMENT", "emplacement", "Emplacement") ||
          null,
        stock_actuel:
          getFieldValue(pdr, "Stock Actuel", "stock_actuel", "StockActuel") ||
          null,
        machine:
          getFieldValue(pdr, "Machine", "machine", "nom_machine") || null,
        reference: getFieldValue(pdr, "Ref", "reference", "Reference") || null,
        images_Pdr: (() => {
          const imageUrl = getFieldValue(
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
          return imageUrl ? [imageUrl] : [];
        })(),
      })) as IPdr[],
    };
  } catch (error) {
    console.error("Error fetching all PDRs:", error);
    return { success: false, error: getErrorMessage(error), data: [] };
  }
}

/**
 * Get table columns info (for debugging)
 */
export async function getTableColumnsInfo() {
  try {
    const { data, error } = await supabaseConfig
      .from("table_pdrs")
      .select("*")
      .limit(1);

    if (error) {
      console.error("Error fetching table columns:", error);
      throw error;
    }

    if (!data || data.length === 0) {
      console.log("No data found in table_pdrs");
      return {
        success: true,
        data: [],
      };
    }

    const columns = Object.keys(data[0]);
    console.log("Table columns:", columns);
    console.log("Sample row:", data[0]);

    return {
      success: true,
      data: columns,
    };
  } catch (error) {
    console.error("Error fetching table columns:", error);
    return { success: false, error: getErrorMessage(error), data: [] };
  }
}

/**
 * Get unique machine names from PDRs (for debugging)
 */
export async function getUniqueMachineNamesFromPdrs() {
  try {
    // First, get all data to find the machine column
    const { data: allData, error: allError } = await supabaseConfig
      .from("table_pdrs")
      .select("*");

    if (allError) throw allError;

    if (!allData || allData.length === 0) {
      console.log("No PDRs found in table_pdrs");
      return {
        success: true,
        data: [],
      };
    }

    // Try to find the machine field name
    const firstRow = allData[0];
    const machineFieldNames = [
      "Machine",
      "machine",
      "nom_machine",
      "nom_Machine",
    ];

    let machineFieldName = null;
    for (const fieldName of machineFieldNames) {
      if (fieldName in firstRow) {
        machineFieldName = fieldName;
        break;
      }
    }

    if (!machineFieldName) {
      console.log(
        "Machine field not found. Available fields:",
        Object.keys(firstRow),
      );
      return {
        success: true,
        data: [],
      };
    }

    const uniqueNames = [
      ...new Set(allData.map((row: any) => row[machineFieldName])),
    ];
    console.log(
      `Unique machine names (field: ${machineFieldName}):`,
      uniqueNames,
    );

    return {
      success: true,
      data: uniqueNames,
    };
  } catch (error) {
    console.error("Error fetching unique machine names:", error);
    return { success: false, error: getErrorMessage(error), data: [] };
  }
}

/**
 * Get a single PDR by code
 */
export async function getOnePdr(code: number) {
  try {
    const { data, error } = await supabaseConfig
      .from("table_pdrs")
      .select("*")
      .eq("code", code)
      .single();

    if (error) throw error;

    return {
      success: true,
      data: {
        code: data.code,
        numero: data.Numero,
        designation_pdr: data.DESIGNATION_PDR,
        valeur: data.Valeur,
        emplacement: data.EMPLACEMENT,
        stock_actuel: data["Stock Actuel"],
        machine: data.Machine,
        reference: data.Ref,
        images_Pdr: data.image_Pdr ? [data.image_Pdr] : [],
      } as IPdr,
    };
  } catch (error) {
    console.error("Error fetching PDR:", error);
    return { success: false, error: getErrorMessage(error) };
  }
}
