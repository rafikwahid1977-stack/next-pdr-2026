"use client";

export const dynamic = "force-dynamic";

import React from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  FiUsers,
  FiTool,
  FiClipboard,
  FiSettings,
  FiFileText,
  FiUser,
} from "react-icons/fi";

interface DashboardCard {
  id: string;
  title: string;
  description: string;
  href: string;
  icon: React.ComponentType<{ size: number; className?: string }>;
  color: string;
}

const dashboardItems: DashboardCard[] = [
  {
    id: "fournisseurs",
    title: "Fournisseurs",
    description: "Gérer les fournisseurs et leurs informations",
    href: "/admin/dashboard/fournisseurs",
    icon: FiUsers,
    color: "bg-blue-100",
  },
  {
    id: "interventions",
    title: "Interventions",
    description: "Suivi des interventions et des opérations",
    href: "/admin/dashboard/interventions",
    icon: FiTool,
    color: "bg-orange-100",
  },
  {
    id: "machines",
    title: "Machines",
    description: "Inventaire et gestion des machines",
    href: "/admin/dashboard/machines",
    icon: FiSettings,
    color: "bg-purple-100",
  },
  {
    id: "pdrs",
    title: "PDRs",
    description: "Rapports de diagnostic et de réparation",
    href: "/admin/dashboard/pdrs",
    icon: FiFileText,
    color: "bg-green-100",
  },
  {
    id: "programmes",
    title: "Programmes",
    description: "Gestion des programmes de maintenance",
    href: "/admin/dashboard/programmes",
    icon: FiClipboard,
    color: "bg-red-100",
  },
  {
    id: "user-profile",
    title: "Profil Utilisateur",
    description: "Paramètres et informations du profil",
    href: "/admin/dashboard/user-profile",
    icon: FiUser,
    color: "bg-indigo-100",
  },
];

function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-gray-900">
          Bienvenue au Dashboard
        </h1>
        <p className="text-gray-600 mt-2">
          Gérez tous les aspects de votre système de maintenance
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dashboardItems.map((item) => {
          const IconComponent = item.icon;
          return (
            <Link key={item.id} href={item.href}>
              <Card className="h-full hover:shadow-lg transition-shadow duration-300 cursor-pointer hover:border-gray-400">
                <CardHeader>
                  <div
                    className={`w-16 h-16 ${item.color} rounded-lg flex items-center justify-center mb-4`}
                  >
                    <IconComponent size={32} className="text-gray-700" />
                  </div>
                  <CardTitle className="text-xl">{item.title}</CardTitle>
                  <CardDescription>{item.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    Cliquez pour accéder à cette section →
                  </p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default DashboardPage;
