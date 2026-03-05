"use client";

import { useEffect, useState } from "react";
import { getAllMachines } from "@/actions/machines";
import {
  getUniqueMachineNamesFromPdrs,
  getAllPdrs,
  getTableColumnsInfo,
} from "@/actions/pdrs";

export default function DiagnosticPage() {
  const [machines, setMachines] = useState<any[]>([]);
  const [machineNamesInPdrs, setMachineNamesInPdrs] = useState<any[]>([]);
  const [allPdrs, setAllPdrs] = useState<any[]>([]);
  const [tableColumns, setTableColumns] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const newErrors: Record<string, string> = {};

      try {
        const machinesResult = await getAllMachines();
        if (!machinesResult.success) {
          newErrors.machines = machinesResult.error || "Erreur unknown";
        }
        setMachines(
          machinesResult.success && machinesResult.data
            ? machinesResult.data
            : [],
        );
      } catch (e) {
        newErrors.machines = String(e);
      }

      try {
        const columnsResult = await getTableColumnsInfo();
        if (!columnsResult.success) {
          newErrors.columns = columnsResult.error || "Erreur unknown";
        }
        setTableColumns(
          columnsResult.success && columnsResult.data ? columnsResult.data : [],
        );
      } catch (e) {
        newErrors.columns = String(e);
      }

      try {
        const pdrMachinesResult = await getUniqueMachineNamesFromPdrs();
        if (!pdrMachinesResult.success) {
          newErrors.machineNames = pdrMachinesResult.error || "Erreur unknown";
        }
        setMachineNamesInPdrs(
          pdrMachinesResult.success && pdrMachinesResult.data
            ? pdrMachinesResult.data
            : [],
        );
      } catch (e) {
        newErrors.machineNames = String(e);
      }

      try {
        const allPdrsResult = await getAllPdrs();
        if (!allPdrsResult.success) {
          newErrors.pdrs = allPdrsResult.error || "Erreur unknown";
        }
        setAllPdrs(
          allPdrsResult.success && allPdrsResult.data ? allPdrsResult.data : [],
        );
      } catch (e) {
        newErrors.pdrs = String(e);
      }

      setErrors(newErrors);
      setLoading(false);
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-lg">Chargement du diagnostic...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-3xl font-bold">Diagnostic PDRs et Machines</h1>

      {Object.keys(errors).length > 0 && (
        <div className="border border-red-300 bg-red-50 p-4 rounded-lg">
          <h3 className="font-bold text-red-800 mb-2">Erreurs détectées:</h3>
          <div className="space-y-2">
            {Object.entries(errors).map(([key, error]) => (
              <div key={key} className="text-sm text-red-700">
                <span className="font-bold">{key}:</span> {error}
              </div>
            ))}
          </div>
        </div>
      )}

      <div
        className={`border p-4 rounded-lg ${tableColumns.length === 0 ? "bg-yellow-50" : "bg-green-50"}`}
      >
        <h2 className="text-xl font-bold mb-4">
          Colonnes de la table_pdrs ({tableColumns.length})
        </h2>
        {tableColumns.length === 0 ? (
          <div className="text-yellow-700">
            ⚠️ Aucune colonne trouvée. Vérifiez que la table existe et contient
            des données.
          </div>
        ) : (
          <div className="space-y-1 text-sm font-mono">
            {tableColumns.map((col) => (
              <div key={col} className="p-2 bg-white rounded border">
                <span className="font-bold">{col}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div
          className={`border p-4 rounded-lg ${machines.length === 0 ? "bg-yellow-50" : ""}`}
        >
          <h2 className="text-xl font-bold mb-4">
            Machines ({machines.length})
          </h2>
          {machines.length === 0 ? (
            <div className="text-yellow-700">⚠️ Aucune machine trouvée</div>
          ) : (
            <div className="space-y-2 text-sm">
              {machines.map((machine) => (
                <div
                  key={machine.nom_machine}
                  className="p-2 bg-blue-50 rounded"
                >
                  <div className="font-mono">{machine.nom_machine}</div>
                  <div className="text-xs text-gray-600">
                    {machine.designation_complete}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div
          className={`border p-4 rounded-lg ${machineNamesInPdrs.length === 0 ? "bg-yellow-50" : ""}`}
        >
          <h2 className="text-xl font-bold mb-4">
            Valeurs Machine dans PDRs ({machineNamesInPdrs.length})
          </h2>
          {machineNamesInPdrs.length === 0 ? (
            <div className="text-yellow-700">
              ⚠️ Aucune valeur machine trouvée dans les PDRs
            </div>
          ) : (
            <div className="space-y-2 text-sm">
              {machineNamesInPdrs.map((name) => (
                <div key={name} className="p-2 bg-green-50 rounded font-mono">
                  {name || "(vide)"}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div
        className={`border p-4 rounded-lg ${allPdrs.length === 0 ? "bg-yellow-50" : ""}`}
      >
        <h2 className="text-xl font-bold mb-4">
          Tous les PDRs ({allPdrs.length})
        </h2>
        {allPdrs.length === 0 ? (
          <div className="text-yellow-700">
            ⚠️ Aucun PDR trouvé dans la table
          </div>
        ) : (
          <div className="space-y-3 text-sm">
            {allPdrs.slice(0, 10).map((pdr) => (
              <div key={pdr.code} className="p-3 bg-gray-50 rounded border">
                <div className="font-mono">
                  Code: {pdr.code} | Machine: "{pdr.machine}"
                </div>
                <div className="text-xs text-gray-600">
                  {pdr.designation_pdr} - Ref: {pdr.reference}
                </div>
              </div>
            ))}
            {allPdrs.length > 10 && (
              <div className="text-gray-500">
                ... et {allPdrs.length - 10} autres PDRs
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
