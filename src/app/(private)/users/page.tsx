import React from "react";
import { getAllMachinesWithPieces } from "@/actions/machines";
import { UsersNav } from "@/components/users/UsersNav";
import { MachinesGrid } from "@/components/users/MachinesGrid";

interface MachineWithPieces {
  numero: number;
  nom_machine: string;
  img_machine: string | null;
  designation_complete: string;
  pieces_count: number;
}

async function UsersPage() {
  let machines: MachineWithPieces[] = [];
  let error: string | null = null;

  try {
    const result = await getAllMachinesWithPieces();
    if (result.success && result.data && result.data.length > 0) {
      machines = result.data as MachineWithPieces[];
      // Log les machines et leurs images
      console.log("Machines reçues:", machines.length);
      machines.forEach((m) => {
        console.log(`Machine #${m.numero}: img_machine = ${m.img_machine}`);
      });
    } else if (!result.success) {
      error = result.error || "Erreur lors du chargement des machines";
    }
  } catch (err) {
    console.error("Error fetching machines:", err);
    error = "Erreur lors du chargement des machines";
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <UsersNav />
      <main className="py-8">
        {error && (
          <div className="max-w-7xl mx-auto px-4 py-12">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}
        {!error && machines.length > 0 && <MachinesGrid machines={machines} />}
        {!error && machines.length === 0 && (
          <div className="max-w-7xl mx-auto px-4 py-12 text-center">
            <p className="text-gray-500 text-lg">Aucune machine disponible</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default UsersPage;
