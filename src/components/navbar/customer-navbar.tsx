"use client";

import Link from "next/link";
import { Search, MapPin, ShoppingBag, User, LogOut, FileText, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { logout } from "@/actions/auth/auth.actions";
import Image from "next/image";

export function CustomerNavbar({ user }: { user: any }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b backdrop-blur-md bg-white/80 dark:bg-zinc-950/80 border-gray-100 dark:border-gray-800 shadow-sm transition-all">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Left: Logo */}
        <div className="flex items-center gap-2 shrink-0">
          <Link href="/home" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-xl bg-orange-600 flex items-center justify-center text-white font-bold text-xl group-hover:scale-105 transition-transform shadow-lg shadow-orange-500/20">
              C
            </div>
            <span className="font-bold text-xl tracking-tight text-gray-900 dark:text-gray-100">
              Crave Hub
            </span>
          </Link>
        </div>

        {/* Center: Search & Location (Hidden on strict mobile) */}
        <div className="hidden md:flex flex-1 max-w-xl mx-8 items-center gap-2">
          <div className="flex w-full items-center h-11 bg-gray-50/50 dark:bg-muted/50 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden hover:border-orange-200 focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-500/20 transition-all">
            <div className="flex shrink-0 items-center pl-3 pr-2 text-gray-500 gap-1 border-r border-gray-200 dark:border-gray-700 bg-gray-100/30">
              <MapPin className="h-4 w-4 text-orange-600" />
              <span className="text-sm font-medium">New York</span>
            </div>
            <div className="flex-1 flex items-center px-3">
              <Search className="h-4 w-4 text-gray-400 mr-2 shrink-0" />
              <input
                type="text"
                placeholder="Search for restaurants, cuisine or a dish"
                className="w-full bg-transparent outline-none text-sm placeholder:text-gray-400 dark:text-gray-200"
              />
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          <Link href="/orders" className="hidden sm:flex text-gray-600 hover:text-orange-600 dark:text-gray-300 dark:hover:text-orange-500 text-sm font-semibold transition-colors">
            Orders
          </Link>

          <Link href="/cart" className="relative p-2 text-gray-600 hover:text-orange-600 dark:text-gray-300 transition-colors group">
            <ShoppingBag className="h-5 w-5 group-hover:scale-110 transition-transform" />
            <span className="absolute top-0 right-0 flex items-center justify-center h-4 w-4 text-[10px] font-bold text-white bg-orange-600 rounded-full border-2 border-white dark:border-zinc-950">
              3
            </span>
          </Link>

          <div className="relative group ml-2">
            <button className="flex items-center justify-center w-9 h-9 rounded-full bg-gray-100 dark:bg-zinc-800 border-2 border-transparent hover:border-gray-200 dark:hover:border-zinc-700 transition-all">
              {user.image ? (
                <Image
                  src={user.image}
                  alt={user.name}
                  width={32}
                  height={32}
                  className="rounded-full"
                />
              ) : (
                <User className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              )}
            </button>
            {/* Simple Dropdown Hover */}
            <div className="absolute right-0 top-full z-50 mt-1 w-48 bg-white dark:bg-zinc-900 rounded-xl shadow-xl border border-gray-100 dark:border-gray-800 invisible opacity-0 group-hover:opacity-100 group-hover:visible transition-all translate-y-1 group-hover:translate-y-0 origin-top-right">
              <div className="p-2 flex flex-col gap-1">
                <Link href="/profile" className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-800 rounded-lg transition-colors">
                  <User className="h-4 w-4" /> Profile
                </Link>
                <Link href="/orders" className="sm:hidden flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-800 rounded-lg transition-colors">
                  <FileText className="h-4 w-4" /> Orders
                </Link>
                <div className="h-px bg-gray-100 dark:bg-gray-800 my-1" />
                <button onClick={logout} className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors w-full text-left">
                  <LogOut className="h-4 w-4" /> Logout
                </button>
              </div>
            </div>
          </div>

          <button
            className="md:hidden p-2 text-gray-600"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Mobile Search Bar Expansion */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 dark:border-gray-800 p-4 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md">
          <div className="flex w-full items-center h-11 bg-gray-50 dark:bg-muted/50 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
            <div className="flex-1 flex items-center px-3">
              <Search className="h-4 w-4 text-gray-400 mr-2 shrink-0" />
              <input
                type="text"
                placeholder="Search for restaurants or dishes"
                className="w-full bg-transparent outline-none text-sm placeholder:text-gray-400"
              />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
