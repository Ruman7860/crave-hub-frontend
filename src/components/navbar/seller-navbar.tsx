"use client";

import Link from "next/link";
import { Store, LayoutDashboard, UtensilsCrossed, ClipboardList, TrendingUp, User, LogOut, Menu } from "lucide-react";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { logout } from "@/actions/auth/auth.actions";
import Image from "next/image";

export function SellerNavbar({ user }: { user: any }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Menu", href: "/menu", icon: UtensilsCrossed },
    { name: "Orders", href: "/orders", icon: ClipboardList },
    { name: "Analytics", href: "/analytics", icon: TrendingUp },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b backdrop-blur-md bg-white/80 dark:bg-zinc-950/80 border-gray-100 dark:border-gray-800 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] transition-all">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Left: Logo */}
        <div className="flex items-center gap-2 shrink-0 mr-8">
          <Link href="/dashboard" className="flex items-center gap-2 group">
             <div className="w-8 h-8 rounded-xl bg-gray-900 dark:bg-gray-100 flex items-center justify-center text-white dark:text-gray-900 font-bold text-xl group-hover:scale-105 transition-transform shadow-lg">
              <Store className="h-4 w-4" />
            </div>
            <span className="font-bold text-xl tracking-tight text-gray-900 dark:text-gray-100">
              Seller Hub
            </span>
          </Link>
        </div>

        {/* Center: Desktop Nav */}
        <nav className="hidden md:flex flex-1 items-center gap-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                  isActive 
                    ? "bg-gray-100 dark:bg-zinc-800 text-gray-900 dark:text-gray-100" 
                    : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-zinc-900/50"
                }`}
              >
                <Icon className="h-4 w-4" />
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Right: Profile Actions */}
        <div className="flex items-center gap-3">
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
            <div className="absolute right-0 top-full z-50 mt-1 w-48 bg-white dark:bg-zinc-900 rounded-xl shadow-xl border border-gray-100 dark:border-gray-800 invisible opacity-0 group-hover:opacity-100 group-hover:visible transition-all translate-y-1 group-hover:translate-y-0 origin-top-right">
              <div className="p-2 flex flex-col gap-1">
                <Link href="/profile" className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-800 rounded-lg transition-colors">
                  <User className="h-4 w-4" /> Profile
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

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 dark:border-gray-800 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md">
          <nav className="flex flex-col p-4 gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              const Icon = link.icon;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                    isActive 
                      ? "bg-gray-100 dark:bg-zinc-800 text-gray-900 dark:text-gray-100" 
                      : "text-gray-600 hover:text-gray-900 dark:text-gray-400"
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Icon className="h-5 w-5" />
                  {link.name}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}
