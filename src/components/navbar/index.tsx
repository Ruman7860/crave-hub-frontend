"use client";

import { CustomerNavbar } from "./customer-navbar";
import { SellerNavbar } from "./seller-navbar";
import { RiderNavbar } from "./rider-navbar";

export type Role = "CUSTOMER" | "SELLER" | "RIDER" | string;

export interface NavbarUser {
  name?: string | null;
  image?: string | null;
}

export interface NavbarProps {
  role?: Role;
  user: NavbarUser;
}

export function Navbar({ role, user }: NavbarProps) {
  if (!role) return null;

  switch (role.toUpperCase()) {
    case "CUSTOMER":
      return <CustomerNavbar user={user} />;
    case "SELLER":
      return <SellerNavbar user={user} />;
    case "RIDER":
      return <RiderNavbar user={user} />;
    default:
      return <CustomerNavbar user={user} />; // Fallback to customer
  }
}
