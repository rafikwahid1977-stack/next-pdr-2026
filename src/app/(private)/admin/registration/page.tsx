"use client";

export const dynamic = "force-dynamic";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { registerUser } from "@/actions/users";
import { IUser } from "@/interfaces";

interface RegistrationForm {
  username: string;
  password: string;
  role: "user" | "admin";
}

function RegisterPage() {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RegistrationForm>({
    defaultValues: {
      role: "user",
    },
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const roleValue = watch("role");

  const onSubmit = async (data: RegistrationForm) => {
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const result = await registerUser({
        username: data.username,
        password: data.password,
        role: data.role,
        status: "active",
      } as Partial<IUser>);

      if (result.success) {
        setMessage(result.message);
        // Reset form
        setTimeout(() => {
          window.location.href = "/admin/dashboard";
        }, 2000);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError("Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            Ajouter Utilisateur
          </h1>
          <Link href="/" className="text-sm text-blue-600 hover:text-blue-800">
            ← Home
          </Link>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Username Field */}
          <div>
            <Label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Username
            </Label>
            <Input
              id="username"
              type="text"
              placeholder="Entrez le nom d'utilisateur"
              required
              {...register("username", {
                required: "Username est obligatoire",
              })}
              className={errors.username ? "border-red-500" : ""}
            />
            {errors.username && (
              <span className="text-sm text-red-600">
                {errors.username.message}
              </span>
            )}
          </div>

          {/* Password Field */}
          <div>
            <Label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Password
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="Entrez le mot de passe"
              required
              {...register("password", {
                required: "Password est obligatoire",
              })}
              className={errors.password ? "border-red-500" : ""}
            />
            {errors.password && (
              <span className="text-sm text-red-600">
                {errors.password.message}
              </span>
            )}
          </div>

          {/* Role Field */}
          <div>
            <Label
              htmlFor="role"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Role
            </Label>
            <Select
              value={roleValue}
              onValueChange={(value) =>
                setValue("role", value as "user" | "admin")
              }
            >
              <SelectTrigger className={errors.role ? "border-red-500" : ""}>
                <SelectValue placeholder="Sélectionner un rôle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
            {errors.role && (
              <span className="text-sm text-red-600">
                {errors.role.message}
              </span>
            )}
          </div>

          {/* Messages */}
          {message && (
            <div className="p-3 bg-green-100 text-green-700 rounded text-sm">
              {message}
            </div>
          )}
          {error && (
            <div className="p-3 bg-red-100 text-red-700 rounded text-sm">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-700 hover:bg-blue-800 text-white font-medium py-2 rounded"
          >
            {loading ? "Chargement..." : "Register"}
          </Button>
        </form>
      </div>
    </div>
  );
}

export default RegisterPage;
