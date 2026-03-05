import React from "react";
import Link from "next/link";
import { getPdrsForMachine } from "@/actions/machines";
import { UsersNav } from "@/components/users/UsersNav";
import { PdrsGallery } from "@/components/users/PdrsGallery";

interface Props {
  searchParams: Promise<{
    machineId?: string;
  }>;
}

export default async function PdrsPerMachinePage({ searchParams }: Props) {
  const { machineId } = await searchParams;

  // Validate machineId
  const machineIdNum = machineId ? parseInt(machineId) : null;
  const isValidMachineId =
    machineIdNum && !isNaN(machineIdNum) && machineIdNum > 0;

  if (!isValidMachineId) {
    return (
      <div className="min-h-screen bg-gray-50">
        <UsersNav />
        <main className="max-w-7xl mx-auto px-4 py-12">
          <div className="text-center">
            <p className="text-gray-600 mb-4">Aucune machine sélectionnée</p>
            <Link
              href="/users"
              className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Retour aux machines
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const result = await getPdrsForMachine(machineIdNum as number);

  if (!result.success) {
    return (
      <div className="min-h-screen bg-gray-50">
        <UsersNav />
        <main className="max-w-7xl mx-auto px-4 py-12">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-red-700">{result.error}</p>
          </div>
          <Link
            href="/users"
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retour aux machines
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <UsersNav />
      <main className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
          <Link
            href="/users"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 transition-colors"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Retour aux machines
          </Link>
        </div>
        <PdrsGallery
          pdrs={result.data}
          machineName={result.machine?.designation_complete || "Machine"}
        />
      </main>
    </div>
  );
}
