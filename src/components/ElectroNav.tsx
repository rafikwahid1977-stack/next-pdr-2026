"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

interface ElectroNavProps {
  showFromElectro?: boolean;
}

export function ElectroNav({ showFromElectro = false }: ElectroNavProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleElectroClick = () => {
    router.push("/electro");
  };

  const handlePdrsClick = () => {
    router.push("/machines?from=electro");
  };

  const handleMecanoClick = () => {
    router.push("/mecano?from=electro");
  };

  const currentPage = pathname.includes("electro")
    ? "electro"
    : pathname.includes("mecano")
      ? "mecano"
      : pathname.includes("machines")
        ? "machines"
        : "";

  return (
    <div className="flex gap-2 mb-6">
      <Button
        onClick={handleElectroClick}
        variant={currentPage === "electro" ? "default" : "outline"}
        className={
          currentPage === "electro" ? "bg-blue-600 hover:bg-blue-700" : ""
        }
      >
        Electro
      </Button>
      <Button
        onClick={handlePdrsClick}
        variant={currentPage === "machines" ? "default" : "outline"}
        className={
          currentPage === "machines" ? "bg-blue-600 hover:bg-blue-700" : ""
        }
      >
        PDR's
      </Button>
      <Button
        onClick={handleMecanoClick}
        variant={currentPage === "mecano" ? "default" : "outline"}
        className={
          currentPage === "mecano" ? "bg-blue-600 hover:bg-blue-700" : ""
        }
      >
        Interventions Mecano
      </Button>
    </div>
  );
}
