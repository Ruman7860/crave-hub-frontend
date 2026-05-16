"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import type React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAtomValue } from "jotai/react";
import { cartAtom } from "@/atoms/cart.atom";
import { searchRestaurants } from "@/actions/customer/customer.actions";
import { useSharedLocation } from "@/hooks/use-shared-location";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Restaurant } from "../customer-types";
import {
  EmptyState,
  estimateDelivery,
  RestaurantCard,
  RestaurantCardSkeleton,
} from "../common/customer-ui";
import { Clock3, Flame, Leaf, Search, SlidersHorizontal, Sparkles, Star, TrendingUp } from "lucide-react";

type SortKey = "nearby" | "fast" | "popular";
type FilterKey = "all" | "open" | "veg" | "fast";

const filters: { key: FilterKey; label: string; icon: React.ElementType }[] = [
  { key: "all", label: "All", icon: SlidersHorizontal },
  { key: "open", label: "Open now", icon: Sparkles },
  { key: "veg", label: "Pure veg", icon: Leaf },
  { key: "fast", label: "Fast delivery", icon: Clock3 },
];

export function CustomerHomeClient({ initialRestaurants }: { initialRestaurants: Restaurant[] }) {
  const searchParams = useSearchParams();
  const { location } = useSharedLocation();
  const cart = useAtomValue(cartAtom);
  const [restaurants, setRestaurants] = useState(initialRestaurants);
  const [query, setQuery] = useState(searchParams.get("search") ?? "");
  const [activeFilter, setActiveFilter] = useState<FilterKey>("all");
  const [sort, setSort] = useState<SortKey>("nearby");
  const [visibleCount, setVisibleCount] = useState(12);
  const [error, setError] = useState<string | null>(null);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setRecentSearches(JSON.parse(window.localStorage.getItem("crave-hub-recent-searches") ?? "[]") as string[]);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      startTransition(async () => {
        setError(null);
        const result = await searchRestaurants(query, {
          latitude: location.lat,
          longitude: location.lng,
          isOpen: activeFilter === "open" ? true : undefined,
          radiusKm: 20,
        });

        console.log("Res Results -> ",result)

        if (!Array.isArray(result)) {
          setError(result.error ?? "Unable to search restaurants");
          return;
        }

        setRestaurants(result);
        setVisibleCount(12);
      });
    }, 350);

    return () => window.clearTimeout(timer);
  }, [query, activeFilter, location.lat, location.lng]);

  const sortedRestaurants = useMemo(() => {
    const next = [...restaurants];

    if (activeFilter === "fast") {
      next.sort((a, b) => (a.distanceMeters ?? 999999) - (b.distanceMeters ?? 999999));
    }

    if (activeFilter === "veg") {
      next.sort((a, b) => Number(b.description?.toLowerCase().includes("veg")) - Number(a.description?.toLowerCase().includes("veg")));
    }

    if (sort === "fast") next.sort((a, b) => estimateDelivery(a.distanceMeters).localeCompare(estimateDelivery(b.distanceMeters)));
    if (sort === "popular") next.sort((a, b) => b.name.length - a.name.length);
    if (sort === "nearby") next.sort((a, b) => (a.distanceMeters ?? 999999) - (b.distanceMeters ?? 999999));

    return next;
  }, [activeFilter, restaurants, sort]);

  const visibleRestaurants = sortedRestaurants.slice(0, visibleCount);
  const openRestaurants = sortedRestaurants.filter((restaurant) => restaurant.isOpen);
  const fastRestaurants = sortedRestaurants.filter((restaurant) => (restaurant.distanceMeters ?? 0) < 6000);
  const vegRestaurants = sortedRestaurants.filter((restaurant) => restaurant.description?.toLowerCase().includes("veg") || restaurant.name.toLowerCase().includes("veg"));

  const submitSearch = (value: string) => {
    setQuery(value);
    if (value.trim()) {
      const next = [value.trim(), ...recentSearches.filter((item) => item !== value.trim())].slice(0, 5);
      window.localStorage.setItem("crave-hub-recent-searches", JSON.stringify(next));
      setRecentSearches(next);
    }
  };

  return (
    <div className="mx-auto max-w-7xl pb-24">
      <section className="relative overflow-hidden rounded-[2rem] bg-zinc-950 px-5 py-7 text-white shadow-2xl sm:px-8 lg:px-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(249,115,22,0.42),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.22),transparent_30%)]" />
        <div className="relative grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-orange-100">
              <Flame className="size-3.5" /> Crave Hub Express
            </span>
            <h1 className="mt-5 max-w-3xl text-4xl font-black leading-tight sm:text-5xl">
              Food that reaches before the craving cools.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-zinc-200 sm:text-base">
              Discover verified restaurants within 20 km, scan menus fast, and build your cart without leaving the flow.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <div className="flex h-13 flex-1 items-center rounded-2xl bg-white px-4 text-zinc-950 shadow-xl">
                <Search className="mr-3 size-5 text-orange-600" />
                <input
                  value={query}
                  onChange={(event) => submitSearch(event.target.value)}
                  placeholder="Search restaurants or dishes"
                  className="w-full bg-transparent text-sm font-semibold outline-none placeholder:text-zinc-400"
                />
              </div>
              {/* <select
                value={sort}
                onChange={(event) => setSort(event.target.value as SortKey)}
                className="h-13 rounded-2xl border border-white/10 bg-white/10 px-4 text-sm font-bold text-white outline-none"
              >
                <option className="text-zinc-950" value="nearby">Nearest first</option>
                <option className="text-zinc-950" value="fast">Fast delivery</option>
                <option className="text-zinc-950" value="popular">Popular</option>
              </select> */}
            </div>
            {recentSearches.length ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {recentSearches.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setQuery(item)}
                    className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-zinc-200 transition hover:bg-white/20"
                  >
                    {item}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
          {/* <div className="grid grid-cols-2 gap-3">
            {[
              ["Restaurants", sortedRestaurants.length],
              ["Open now", openRestaurants.length],
              ["Fast picks", fastRestaurants.length],
              ["Pure veg", vegRestaurants.length],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
                <p className="text-3xl font-black">{value}</p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-zinc-300">{label}</p>
              </div>
            ))}
          </div> */}
        </div>
      </section>

      <div className="sticky top-16 z-30 -mx-4 mt-5 overflow-x-auto border-y border-orange-100 bg-orange-50/85 px-4 py-3 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/80 sm:mx-0 sm:rounded-2xl sm:border">
        <div className="flex min-w-max items-center gap-2">
          {filters.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              type="button"
              onClick={() => setActiveFilter(key)}
              className={cn(
                "inline-flex h-10 items-center gap-2 rounded-full border px-4 text-sm font-bold transition",
                activeFilter === key
                  ? "border-orange-600 bg-orange-600 text-white shadow-lg shadow-orange-600/20"
                  : "border-white bg-white text-zinc-700 hover:border-orange-200 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200",
              )}
            >
              <Icon className="size-4" /> {label}
            </button>
          ))}
        </div>
      </div>

      {error ? (
        <div className="mt-6">
          <EmptyState icon="error" title="Could not load restaurants" description={error} />
        </div>
      ) : null}

      {isPending ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => <RestaurantCardSkeleton key={index} />)}
        </div>
      ) : visibleRestaurants.length ? (
        <>
          <DiscoverySection title="Nearby Restaurants" icon={Star} restaurants={visibleRestaurants} />
          <DiscoverySection title="Recommended" icon={Sparkles} restaurants={openRestaurants.slice(0, 8)} compact />
          <DiscoverySection title="Fast Delivery" icon={Clock3} restaurants={fastRestaurants.slice(0, 8)} compact />
          <DiscoverySection title="Trending" icon={TrendingUp} restaurants={sortedRestaurants.slice().reverse().slice(0, 8)} compact />

          {visibleCount < sortedRestaurants.length ? (
            <div className="mt-8 flex justify-center">
              <Button onClick={() => setVisibleCount((count) => count + 8)} className="h-11 rounded-full bg-zinc-950 px-6 text-white hover:bg-orange-600">
                Load more restaurants
              </Button>
            </div>
          ) : null}
        </>
      ) : (
        <div className="mt-6">
          <EmptyState
            title="No restaurants found nearby"
            description="Try a different search, switch filters, or refresh your location to discover more places."
          />
        </div>
      )}

      {cart.items.length ? (
        <Link href="/cart" className="fixed inset-x-4 bottom-4 z-40 mx-auto flex max-w-xl items-center justify-between rounded-2xl bg-zinc-950 px-5 py-4 text-white shadow-2xl sm:bottom-6">
          <div>
            <p className="text-sm font-bold">{cart.items.reduce((sum, item) => sum + item.quantity, 0)} items in cart</p>
            <p className="text-xs text-zinc-300">{cart.restaurant?.name}</p>
          </div>
          <span className="text-sm font-black text-orange-300">View cart</span>
        </Link>
      ) : null}
    </div>
  );
}

function DiscoverySection({
  title,
  icon: Icon,
  restaurants,
  compact,
}: {
  title: string;
  icon: React.ElementType;
  restaurants: Restaurant[];
  compact?: boolean;
}) {
  if (!restaurants.length) return null;

  return (
    <section className="mt-8">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="inline-flex items-center gap-2 text-xl font-black text-zinc-950 dark:text-zinc-50">
          <Icon className="size-5 text-orange-600" /> {title}
        </h2>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {restaurants.map((restaurant) => (
          <RestaurantCard key={`${title}-${restaurant.id}`} restaurant={restaurant} compact={compact} />
        ))}
      </div>
    </section>
  );
}
