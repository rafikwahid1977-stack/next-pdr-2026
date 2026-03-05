"use client";

import React, { useState, useMemo } from "react";
import { IMachine } from "@/interfaces";
import { PdrTableForMachine } from "./PdrTableForMachine";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";

interface PdrsPageContentProps {
  machines: IMachine[];
}

export function PdrsPageContent({ machines }: PdrsPageContentProps) {
  const [displayedCount, setDisplayedCount] = useState(1);

  // Sort machines by numero in ascending order
  const sortedMachines = useMemo(() => {
    return [...machines].sort((a, b) => a.numero - b.numero);
  }, [machines]);

  // Get machines to display
  const displayedMachines = useMemo(() => {
    return sortedMachines.slice(0, displayedCount);
  }, [sortedMachines, displayedCount]);

  const hasMoreMachines = displayedCount < sortedMachines.length;

  const loadMoreMachines = () => {
    setDisplayedCount((prev) => prev + 1);
  };

  if (sortedMachines.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        Aucune machine disponible
      </div>
    );
  }

  return (
    <>
      <div className="space-y-12">
        {displayedMachines.map((machine) => (
          <PdrTableForMachine
            key={machine.nom_machine}
            machineName={machine.nom_machine}
            machineDesignation={machine.designation_complete}
          />
        ))}
      </div>

      {/* Load More Button */}
      {hasMoreMachines && (
        <div className="flex justify-center mt-12">
          <Button
            onClick={loadMoreMachines}
            variant="outline"
            className="flex items-center gap-2"
            size="lg"
          >
            <ChevronDown className="w-4 h-4" />
            Charger le tableau suivant ({displayedCount} /{" "}
            {sortedMachines.length})
          </Button>
        </div>
      )}

      {/* All Loaded Message */}
      {!hasMoreMachines && sortedMachines.length > 0 && (
        <div className="text-center py-8 text-gray-500 mt-12">
          <p>Tous les tableaux ont été chargés</p>
        </div>
      )}
    </>
  );
}
