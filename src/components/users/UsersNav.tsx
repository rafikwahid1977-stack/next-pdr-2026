"use client";

import React from "react";
import Link from "next/link";

export function UsersNav() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-gray-900">
              Machines
            </Link>
          </div>
          <div className="hidden md:flex space-x-8">
            <Link
              href="/users"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              Machines
            </Link>
            <Link
              href="/admin/dashboard"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              Admin
            </Link>
          </div>
          <button className="md:hidden p-2">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </div>
    </nav>
  );
}
