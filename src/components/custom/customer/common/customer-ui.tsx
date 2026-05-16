"use client";

import Link from "next/link";
import type React from "react";
import { AlertCircle, Clock3, MapPin, Search, Utensils } from "lucide-react";
import { cn } from "@/lib/utils";
import { Restaurant } from "../customer-types";

export function formatDistance(distanceMeters?: number) {
  if (distanceMeters === undefined || distanceMeters === null) return "Nearby";
  if (distanceMeters < 1000) return `${Math.max(100, Math.round(distanceMeters / 50) * 50)} m`;
  return `${(distanceMeters / 1000).toFixed(distanceMeters > 9500 ? 0 : 1)} km`;
}

export function estimateDelivery(distanceMeters?: number) {
  const km = Math.max(1, (distanceMeters ?? 3500) / 1000);
  const min = Math.round(18 + km * 3);
  return `${min}-${min + 8} min`;
}

export function cuisineSummary(restaurant: Restaurant) {
  const source = `${restaurant.description ?? ""} ${restaurant.name}`.toLowerCase();
  const cuisines = [
    "Biryani",
    "North Indian",
    "Pizza",
    "Burgers",
    "Chinese",
    "Desserts",
    "South Indian",
    "Cafe",
  ].filter((item) => source.includes(item.toLowerCase().split(" ")[0]));

  return cuisines.length ? cuisines.slice(0, 3).join(" • ") : "Fresh meals • Local favourites";
}

export function VegMark({ isVeg }: { isVeg?: boolean | null }) {
  return (
    <span
      className={cn(
        "inline-flex size-4 items-center justify-center rounded-[3px] border bg-white",
        isVeg === false ? "border-red-600" : "border-green-600",
      )}
      title={isVeg === false ? "Non-vegetarian" : "Vegetarian"}
    >
      <span className={cn("size-2 rounded-full", isVeg === false ? "bg-red-600" : "bg-green-600")} />
    </span>
  );
}

export function RestaurantImage({ restaurant, className }: { restaurant: Restaurant; className?: string }) {
  const image = restaurant.images?.[0];

  return (
    <div
      className={cn(
        "relative overflow-hidden bg-linear-to-br from-orange-100 via-rose-100 to-yellow-100",
        className,
      )}
    >
      {image ? (
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
          style={{ backgroundImage: `url("${image}")` }}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <Utensils className="size-10 text-orange-500" />
        </div>
      )}
      <div className="absolute inset-0 bg-linear-to-t from-black/45 via-black/5 to-transparent" />
      <span
        className={cn(
          "absolute left-3 top-3 rounded-full px-2.5 py-1 text-xs font-bold shadow-sm",
          restaurant.isOpen ? "bg-emerald-50 text-emerald-700" : "bg-zinc-900/85 text-white",
        )}
      >
        {restaurant.isOpen ? "Open" : "Closed"}
      </span>
    </div>
  );
}

export function RestaurantCard({ restaurant, compact = false }: { restaurant: Restaurant; compact?: boolean }) {
  return (
    <Link
      href={`/restaurants/${restaurant.id}`}
      className="group block overflow-hidden rounded-2xl border border-white/80 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-zinc-800 dark:bg-zinc-950"
    >
      <RestaurantImage restaurant={restaurant} className={compact ? "h-36" : "h-44"} />
      <div className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-base font-extrabold text-zinc-950 dark:text-zinc-50">{restaurant.name}</h3>
            <p className="mt-1 line-clamp-1 text-sm text-zinc-500">{cuisineSummary(restaurant)}</p>
          </div>
          {/* <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2 py-1 text-xs font-bold text-white">
            <Star className="size-3 fill-current" /> 4.{restaurant.name.length % 8}
          </span> */}
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-zinc-600 dark:text-zinc-300">
          <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-2.5 py-1 text-orange-700">
            <Clock3 className="size-3.5" /> {estimateDelivery(restaurant.distanceMeters)}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2.5 py-1 dark:bg-zinc-800">
            <MapPin className="size-3.5" /> {formatDistance(restaurant.distanceMeters)}
          </span>
          {/* <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-emerald-700">
            <Leaf className="size-3.5" /> Veg picks
          </span> */}
        </div>
        <div className="flex items-center justify-between border-t border-zinc-100 pt-3 text-xs text-zinc-500 dark:border-zinc-800">
          {/* <span className="inline-flex items-center gap-1 font-semibold text-orange-700">
            <Sparkles className="size-3.5" /> Bestseller menu
          </span> */}
          <span>{restaurant.isVerified ? "Verified" : "New"}</span>
        </div>
      </div>
    </Link>
  );
}

export function EmptyState({
  icon = "search",
  title,
  description,
  action,
}: {
  icon?: "search" | "error";
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  const Icon = icon === "error" ? AlertCircle : Search;

  return (
    <div className="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-dashed border-orange-200 bg-white/80 p-8 text-center dark:border-zinc-800 dark:bg-zinc-950/80">
      <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-orange-100 text-orange-700">
        <Icon className="size-7" />
      </div>
      <h3 className="text-xl font-extrabold text-zinc-950 dark:text-zinc-50">{title}</h3>
      <p className="mt-2 max-w-md text-sm text-zinc-500">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function RestaurantCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/80 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <div className="h-44 animate-pulse bg-zinc-200 dark:bg-zinc-800" />
      <div className="space-y-3 p-4">
        <div className="h-5 w-2/3 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-4 w-full animate-pulse rounded bg-zinc-100 dark:bg-zinc-800" />
        <div className="flex gap-2">
          <div className="h-7 w-24 animate-pulse rounded-full bg-zinc-100 dark:bg-zinc-800" />
          <div className="h-7 w-20 animate-pulse rounded-full bg-zinc-100 dark:bg-zinc-800" />
        </div>
      </div>
    </div>
  );
}
