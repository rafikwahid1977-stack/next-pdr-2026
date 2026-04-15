"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Menu, X, LogOut, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  const handleNavigate = (path: string) => {
    router.push(path);
    setIsOpen(false);
  };

  return (
    <>
      {/* Hamburger button for mobile */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 md:hidden inline-flex items-center justify-center p-2 rounded-lg bg-blue-700 text-white hover:bg-blue-800 transition-colors"
        aria-label="Toggle menu"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-blue-800 text-white shadow-lg transform transition-transform duration-300 z-40 ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        } md:translate-x-0 md:relative md:w-64 flex flex-col`}
      >
        {/* Header */}
        <div className="p-6 border-b border-blue-700">
          <div className="flex items-center gap-2">
            <Zap className="text-yellow-400" size={28} />
            <h1 className="text-xl font-bold">PDR App</h1>
          </div>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 p-4 space-y-2">
          <button
            onClick={() => handleNavigate("/machines")}
            className="w-full text-left px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors text-white font-medium"
          >
            🏭 Machines
          </button>
          <button
            onClick={() => handleNavigate("/machines")}
            className="w-full text-left px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors text-white font-medium"
          >
            📋 PDR's
          </button>
        </nav>

        {/* Logout button at bottom */}
        <div className="p-4 border-t border-blue-700">
          <Button
            onClick={handleLogout}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-medium flex items-center justify-center gap-2"
          >
            <LogOut size={18} />
            Déconnexion
          </Button>
        </div>
      </aside>
    </>
  );
}
