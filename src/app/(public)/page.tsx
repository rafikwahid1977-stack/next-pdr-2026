"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Logique de connexion ici
    console.log("Login attempt:", { username, password });
    setIsLoading(false);
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
