"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { FiMenu, FiX } from "react-icons/fi";
import { useAuth } from "@/hooks/useAuth";
import { useWelcomeToast } from "@/hooks/useWelcomeToast";

interface MecanoLayoutContentProps {
  children: React.ReactNode;
}

export function MecanoLayoutContent({ children }: MecanoLayoutContentProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showElectroNav, setShowElectroNav] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  // Afficher le toast de bienvenue
  useWelcomeToast();

  // Check if coming from electro
  useEffect(() => {
    const fromElectro = searchParams.get("from") === "electro";
    setShowElectroNav(fromElectro);
  }, [searchParams]);

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

  // Menu ElectroNav - quand on vient de electro
  const electroMenuItems = [
    { label: "Electro", href: "/electro" },
    { label: "PDR's", href: "/machines?from=electro" },
    { label: "Interventions Mecano", href: "/mecano?from=electro" },
  ];

  const menuItems = showElectroNav
    ? electroMenuItems
    : [
        { label: "Mecano", href: "/mecano" },
        { label: "PDR's", href: "/mecano/voir-pdrs" },
        { label: "Permanances Électro", href: "/mecano/permanences-electro" },
      ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <nav
        className={`${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } fixed inset-y-0 left-0 z-50 w-64 ${
          showElectroNav
            ? "bg-slate-900 text-white border-slate-700"
            : "bg-gray-200 text-gray-900 border-gray-300"
        } shadow-lg transition-transform duration-300 ease-in-out lg:static lg:translate-x-0`}
      >
        <div className="flex flex-col h-full">
          <div
            className={`flex items-center justify-between p-6 border-b ${
              showElectroNav ? "border-slate-700" : "border-gray-300"
            }`}
          >
            <h1 className="text-xl font-bold">
              {showElectroNav ? "Electro" : "Mecano"}
            </h1>
            <button
              onClick={toggleMenu}
              className={`lg:hidden ${
                showElectroNav
                  ? "text-white hover:text-gray-200"
                  : "text-gray-900 hover:text-gray-700"
              }`}
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
                  className={`block px-6 py-3 transition-colors duration-200 ${
                    showElectroNav
                      ? "hover:bg-slate-700 text-white"
                      : "hover:bg-gray-300 text-gray-900"
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          <div
            className={`p-6 border-t ${
              showElectroNav ? "border-slate-700" : "border-gray-300"
            }`}
          >
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
            <h2 className="text-2xl font-bold text-gray-800">
              {showElectroNav ? "Electro" : "Mecano"}
            </h2>
            <div className="w-8" />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
