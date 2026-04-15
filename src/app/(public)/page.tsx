"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";

function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { user } = useAuth();

  // Rediriger les utilisateurs connectés vers leur page d'accueil
  // Ils ne peuvent retourner à la page publique que via le bouton de déconnexion
  useEffect(() => {
    if (user?.username) {
      // L'utilisateur est déjà connecté, le rediriger vers sa page d'accueil
      if (user.username === "Boudjellah") {
        router.push("/electro");
      } else if (["Boualem", "Sadek", "Youcef"].includes(user.username)) {
        router.push("/mecano");
      } else {
        router.push("/machines");
      }
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || "Erreur lors de la connexion");
        setIsLoading(false);
        return;
      }

      toast.success("Connexion réussie!");

      // Redirect based on username or role
      if (username === "Boudjellah") {
        router.push("/electro");
      } else if (["Boualem", "Sadek", "Youcef"].includes(username)) {
        router.push("/mecano");
      } else if (username === "Ryad") {
        // Ryad - accès aux pages admin uniquement
        router.push("/admin/dashboard");
      } else {
        const role = data.data?.user?.role;
        if (role === "admin") {
          router.push("/admin/dashboard");
        } else {
          router.push("/machines");
        }
      }
    } catch (error) {
      toast.error("Erreur serveur");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Moitié gauche - Formulaire */}
      <div className="w-full md:w-1/3 flex items-center justify-center bg-white p-4 md:p-8 py-8 md:py-0">
        <div className="w-full max-w-md">
          <h1 className="text-2xl md:text-3xl font-bold mb-8">Connexion</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Champ Utilisateur */}
            <div className="space-y-2">
              <Label htmlFor="username">Utilisateur</Label>
              <Input
                id="username"
                type="text"
                placeholder="Entrez votre utilisateur"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>

            {/* Champ Mot de passe */}
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                placeholder="Entrez votre mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>

            {/* Bouton de connexion */}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Connexion..." : "Se connecter"}
            </Button>
          </form>
        </div>
      </div>

      {/* Moitié droite - Image */}
      <div className="w-full md:w-2/3 bg-gray-100 h-48 md:h-auto">
        <img
          src="https://res.cloudinary.com/dtrz3i2f5/image/upload/v1770804294/next-app-pdr-2026/HomePage_tcxzbn.jpg"
          alt="HomePage"
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  );
}

export default LoginPage;
