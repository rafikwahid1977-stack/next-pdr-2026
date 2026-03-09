"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Card } from "@/components/ui/card";

interface MachineWithPieces {
  numero: number;
  nom_machine: string;
  img_machine: string | null;
  designation_complete: string;
  pieces_count: number;
}

const DEFAULT_IMAGE =
  "https://res.cloudinary.com/dtrz3i2f5/image/upload/v1739457347/next-app-pdr-2026/empty_qswmu1.png";

export function MachinesGrid({ machines }: { machines: MachineWithPieces[] }) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Effectuer le log juste une fois au montage
    if (machines.length > 0) {
      console.log("MachinesGrid mounted with machines:", machines.length);
      machines.slice(0, 3).forEach((m) => {
        console.log(`Machine #${m.numero}: img_machine = ${m.img_machine}`);
      });
    }

    // Attendre un court délai pour assurer que tous les assets sont chargés
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const handleImageLoad = (numero: number) => {
    console.log(`Image loaded for machine ${numero}`);
  };

  const handleImageError = (numero: number) => {
    console.error(`Image failed to load for machine ${numero}`);
  };

  if (isLoading) {
    return (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Chargement des machines...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h2 className="text-3xl font-bold text-gray-900 mb-8">
        Galerie de Machines
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {machines.map((machine, index) => {
          const displayUrl = machine.img_machine || DEFAULT_IMAGE;
          console.log(
            `Rendering Machine #${machine.numero} with image: ${displayUrl.substring(0, 60)}...`,
          );
          return (
            <Card
              key={machine.numero}
              className="overflow-hidden hover:shadow-lg transition-shadow duration-300"
            >
              <Link
                href={`/users/pdrsPerMachine?machineId=${machine.numero}`}
                className="block"
              >
                <div className="aspect-square relative bg-gray-200 overflow-hidden group cursor-pointer">
                  <Image
                    src={displayUrl}
                    alt={
                      machine.designation_complete ||
                      `Machine ${machine.numero}`
                    }
                    fill
                    className="object-contain group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                    priority={index < 4}
                    onLoad={() => handleImageLoad(machine.numero)}
                    onError={() => handleImageError(machine.numero)}
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300" />
                </div>
              </Link>
              <div className="p-4">
                <div className="mb-4 pb-4 border-b border-gray-200">
                  <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">
                    Désignation
                  </p>
                  <h3 className="font-bold text-gray-900 text-sm sm:text-base line-clamp-3">
                    {machine.designation_complete}
                  </h3>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs sm:text-sm">
                    <span className="text-gray-600">Machine #</span>
                    <span className="font-medium text-gray-900">
                      {machine.numero}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs sm:text-sm">
                    <span className="text-gray-600">Pièces</span>
                    <span className="font-medium text-blue-600">
                      {machine.pieces_count}
                    </span>
                  </div>
                </div>
                <Link
                  href={`/users/pdrsPerMachine?machineId=${machine.numero}`}
                  className="mt-4 w-full inline-block text-center bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  Voir les pièces
                </Link>
              </div>
            </Card>
          );
        })}
      </div>
      {machines.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Aucune machine trouvée</p>
        </div>
      )}
    </section>
  );
}
