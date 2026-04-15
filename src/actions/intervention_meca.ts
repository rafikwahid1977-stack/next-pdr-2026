"use server";
import supabaseConfig from "../../config/supabase-config";
import { IMecano } from "@/interfaces";

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
 * Generate next intervention code with format: Meca-XXXX-MM-YY
 * Meca: prefix
 * XXXX: 4-digit counter (0001-9999)
 * MM: month from created date
 * YY: year from created date (last 2 digits)
 */
async function generateMecanoInterventionCode(): Promise<string> {
  try {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const year = String(now.getFullYear()).slice(-2);

    // Query all interventions for current month/year
    const { data: interventions, error } = await supabaseConfig
      .from("table_mecano")
      .select("code_intervention")
      .like("code_intervention", `Meca-%-${month}-${year}`);

    if (error) throw error;

    // Extract counter numbers and find the maximum
    let maxCounter = 0;
    if (interventions && interventions.length > 0) {
      maxCounter = Math.max(
        ...interventions.map((item: any) => {
          const match = item.code_intervention.match(/^Meca-(\d{4})-/);
          return match ? parseInt(match[1], 10) : 0;
        }),
      );
    }

    // Increment counter and format it
    const nextCounter = (maxCounter + 1).toString().padStart(4, "0");
    return `Meca-${nextCounter}-${month}-${year}`;
  } catch (error) {
    console.error("Error generating mecano intervention code:", error);
    throw error;
  }
}

/**
 * Add a new mechanical intervention to table_mecano
 */
export async function addMecanoInterv(
  data: Omit<IMecano, "id" | "code_intervention" | "created_at">,
) {
  try {
    // Generate the intervention code
    const code_intervention = await generateMecanoInterventionCode();

    // Prepare images - send as array (Supabase will handle PostgreSQL array format)
    let imgsValue: string[] = [];
    if (
      Array.isArray(data.imgs_intervention) &&
      data.imgs_intervention.length > 0
    ) {
      imgsValue = data.imgs_intervention;
    }

    // Prepare insert object - match Supabase column names (all lowercase)
    const insertData: any = {
      code_intervention: code_intervention,
      machine: data.machine && data.machine.trim() ? data.machine.trim() : "",
      partie_machine:
        data.partie_machine && data.partie_machine.trim()
          ? data.partie_machine.trim()
          : "",
      description:
        data.description && data.description.trim()
          ? data.description.trim()
          : "",
      imgs_intervention: imgsValue,
      pieces:
        Array.isArray(data.pieces) && data.pieces.length > 0 ? data.pieces : [],
      user: data.user && data.user.trim() ? data.user.trim() : "",
    };

    // Insert without select first
    const { error } = await supabaseConfig
      .from("table_mecano")
      .insert([insertData]);

    if (error) {
      console.error("Supabase insert error:", error);
      throw error;
    }

    // Fetch the newly inserted record
    const { data: result, error: selectError } = await supabaseConfig
      .from("table_mecano")
      .select("*")
      .eq("code_intervention", code_intervention)
      .order("created_at", { ascending: false })
      .limit(1);

    if (selectError) throw selectError;

    // Ensure imgs_intervention is always an array
    if (result && result.length > 0) {
      result.forEach((item: any) => {
        if (!Array.isArray(item.imgs_intervention)) {
          item.imgs_intervention = [];
        }
      });
    }

    return { success: true, data: result || [] };
  } catch (error) {
    console.error("Error adding mechanical intervention:", error);
    return { success: false, error: getErrorMessage(error) };
  }
}

/**
 * Get all mechanical interventions from table_mecano
 */
export async function getMecanoInterventions() {
  try {
    const { data: interventions, error } = await supabaseConfig
      .from("table_mecano")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    // Ensure imgs_intervention is always an array
    if (interventions && interventions.length > 0) {
      interventions.forEach((item: any) => {
        if (!Array.isArray(item.imgs_intervention)) {
          item.imgs_intervention = [];
        }
      });
    }

    return { success: true, data: interventions || [] };
  } catch (error) {
    console.error("Error fetching mechanical interventions:", error);
    return { success: false, error: getErrorMessage(error), data: [] };
  }
}
