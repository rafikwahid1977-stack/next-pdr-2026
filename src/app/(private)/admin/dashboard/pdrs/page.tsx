import React from "react";
import { getAllMachines } from "@/actions/machines";
import { PdrsPageContent } from "@/components/pdr/PdrsPageContent";

async function PdrsPage() {
  const machinesResult = await getAllMachines();

  const machines =
    machinesResult.success && machinesResult.data ? machinesResult.data : [];

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-4xl font-bold">Gestion des PDRs</h1>
        <p className="text-gray-600 mt-2">
          Affichage des pièces de rechange par machine
        </p>
      </div>

      <PdrsPageContent machines={machines} />
    </div>
  );
}

export default PdrsPage;
