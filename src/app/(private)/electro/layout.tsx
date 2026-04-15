"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { FiMenu, FiX } from "react-icons/fi";
import { useAuth } from "@/hooks/useAuth";
import { useWelcomeToast } from "@/hooks/useWelcomeToast";

function ElectroLayout({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const { user } = useAuth();

  // Afficher le toast de bienvenue
  useWelcomeToast();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (response.ok) {
        toast.success("Déconnexion réussie");
        router.push("/");
      } else {
        toast.error("Erreur lors de la déconnexion");
      }
    } catch (error) {
      toast.error("Erreur serveur");
    }
  };

  const isMecanoUser = ["Boualem", "Sadek", "Youcef"].includes(
    user?.username || "",
  );

  // Menu ElectroNav - toujours afficher les trois options
  const electroMenuItems = [
    { label: "Electro", href: "/electro" },
    { label: "PDR's", href: "/machines?from=electro" },
    { label: "Interventions Mecano", href: "/mecano?from=electro" },
  ];

  const menuItems = electroMenuItems;

  const navBgColor = "bg-slate-900 text-white";
  const navBorderColor = "border-slate-700";
  const navHoverColor = "hover:bg-slate-700";

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <nav
        className={`${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } fixed inset-y-0 left-0 z-50 w-64 ${navBgColor} shadow-lg transition-transform duration-300 ease-in-out lg:static lg:translate-x-0`}
      >
        <div className="flex flex-col h-full">
          <div
            className={`flex items-center justify-between p-6 border-b ${navBorderColor}`}
          >
            <h1 className="text-xl font-bold">Electro</h1>
            <button
              onClick={toggleMenu}
              className={`lg:hidden text-white hover:text-gray-200`}
            >
              <FiX size={24} />
            </button>
          </div>

          <ul className="flex-1 overflow-y-auto py-4">
            {menuItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`block px-6 py-3 ${navHoverColor} transition-colors duration-200`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className={`p-6 border-t ${navBorderColor}`}>
            <button
              onClick={handleLogout}
              className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </nav>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-6 py-4 flex items-center justify-between">
            <button
              onClick={toggleMenu}
              className="lg:hidden text-gray-700 hover:text-gray-900"
            >
              <FiMenu size={24} />
            </button>
            <h2 className="text-2xl font-bold text-gray-800">Electro</h2>
            <div className="w-8" />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}

export default ElectroLayout;
