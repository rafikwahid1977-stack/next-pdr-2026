"use server";
import supabaseConfig from "../../config/supabase-config";
import { IElectro } from "@/interfaces";

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
 * Generate next intervention code with format: XXXX-MM-YY
 * XXXX: 4-digit counter (0001-9999)
 * MM: month from created date
 * YY: year from created date (last 2 digits)
 */
async function generateInterventionCode(): Promise<string> {
  try {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const year = String(now.getFullYear()).slice(-2);

    // Query all interventions for current month/year
    const { data: interventions, error } = await supabaseConfig
      .from("table_electro")
      .select("code_intervention")
      .like("code_intervention", `%-${month}-${year}`);

    if (error) throw error;

    // Extract counter numbers and find the maximum
    let maxCounter = 0;
    if (interventions && interventions.length > 0) {
      maxCounter = Math.max(
        ...interventions.map((item: any) => {
          const match = item.code_intervention.match(/^(\d{4})-/);
          return match ? parseInt(match[1], 10) : 0;
        }),
      );
    }

    // Increment counter and format it
    const nextCounter = (maxCounter + 1).toString().padStart(4, "0");
    return `${nextCounter}-${month}-${year}`;
  } catch (error) {
    console.error("Error generating intervention code:", error);
    throw error;
  }
}

/**
 * Add a new electrical intervention to table_electro
 */
export async function addElectroInterv(
  data: Omit<IElectro, "id" | "code_intervention" | "created_at">,
) {
  try {
    // Generate the intervention code
    const code_intervention = await generateInterventionCode();

    // Prepare photos - send as array (Supabase will handle PostgreSQL array format)
    let photosValue: string[] = [];
    if (
      Array.isArray(data.photos_intervention) &&
      data.photos_intervention.length > 0
    ) {
      photosValue = data.photos_intervention;
    }

    // Prepare insert object - match Supabase column names (all lowercase)
    const insertData: any = {
      observation: data.observation,
      code_intervention: code_intervention,
      machine: data.machine && data.machine.trim() ? data.machine.trim() : "",
      partie_machine:
        data.partie_machine && data.partie_machine.trim()
          ? data.partie_machine.trim()
          : "",
      intervention:
        data.intervention && data.intervention.trim()
          ? data.intervention.trim()
          : "",
      photos_intervention: photosValue,
      pieces:
        Array.isArray(data.pieces) && data.pieces.length > 0 ? data.pieces : [],
    };

    // Insert without select first
    const { error } = await supabaseConfig
      .from("table_electro")
      .insert([insertData]);

    if (error) {
      console.error("Supabase insert error:", error);
      throw error;
    }

    // Fetch the newly inserted record
    const { data: result, error: selectError } = await supabaseConfig
      .from("table_electro")
      .select("*")
      .eq("code_intervention", code_intervention)
      .order("created_at", { ascending: false })
      .limit(1);

    if (selectError) throw selectError;

    // Ensure photos_intervention is always an array
    if (result && result.length > 0) {
      result.forEach((item: any) => {
        if (!Array.isArray(item.photos_intervention)) {
          item.photos_intervention = [];
        }
      });
    }

    return { success: true, data: result || [] };
  } catch (error) {
    console.error("Error adding electrical intervention:", error);
    return { success: false, error: getErrorMessage(error) };
  }
}

/**
 * Get all electrical interventions from table_electro
 */
export async function getElectroInterventions() {
  try {
    const { data: interventions, error } = await supabaseConfig
      .from("table_electro")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    // Ensure photos_intervention is always an array
    if (interventions && interventions.length > 0) {
      interventions.forEach((item: any) => {
        if (!Array.isArray(item.photos_intervention)) {
          item.photos_intervention = [];
        }
      });
    }

    return { success: true, data: interventions || [] };
  } catch (error) {
    console.error("Error fetching electrical interventions:", error);
    return { success: false, error: getErrorMessage(error), data: [] };
  }
}
