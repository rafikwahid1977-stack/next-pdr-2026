"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function PdrPerMachine() {
  const router = useRouter();

  useEffect(() => {
    // Rediriger vers la page machines
    router.push("/machines");
  }, [router]);

  return <div>Redirection...</div>;
}
