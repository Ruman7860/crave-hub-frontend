"use server";

import { getToken } from "@/lib/auth-utils";
import {
  Restaurant,
  RestaurantFilters,
  RestaurantMenu,
} from "@/components/custom/customer/customer-types";

const restaurantBaseUrl = process.env.NEXT_PUBLIC_RESTAURANT_SERVICE;

function buildRestaurantQuery(filters: RestaurantFilters = {}) {
  const params = new URLSearchParams();

  if (filters.search?.trim()) params.set("search", filters.search.trim());
  if (filters.isOpen !== undefined) params.set("isOpen", String(filters.isOpen));
  if (typeof filters.latitude === "number") params.set("latitude", String(filters.latitude));
  if (typeof filters.longitude === "number") params.set("longitude", String(filters.longitude));
  if (filters.radiusKm) params.set("radiusKm", String(filters.radiusKm));

  return params.toString();
}

async function authHeaders() {
  const token = await getToken();
  if (!token) return null;

  return {
    Authorization: `Bearer ${token}`,
  };
}

export async function getNearbyRestaurants(filters: RestaurantFilters = {}) {
  const headers = await authHeaders();
  if (!headers) return { error: "Unauthorized", statusCode: 401 };

  const query = buildRestaurantQuery({ ...filters, radiusKm: filters.radiusKm ?? 20 });
  console.log("query -> ",query,`${restaurantBaseUrl}/api/restaurant${query ? `?${query}` : ""}`);
  const res = await fetch(`${restaurantBaseUrl}/api/restaurant${query ? `?${query}` : ""}`, {
    method: "GET",
    headers,
    cache: "no-store",
  });

  if (!res.ok) return { error: "Unable to load restaurants", statusCode: res.status };

  return (await res.json()) as Restaurant[];
}

export async function searchRestaurants(search: string, filters: RestaurantFilters = {}) {
  console.log("Search ->",{search,filters})
  return getNearbyRestaurants({ ...filters, search, radiusKm: filters.radiusKm ?? 20 });
}

export async function getRestaurantDetails(id: string) {
  const headers = await authHeaders();
  if (!headers) return { error: "Unauthorized", statusCode: 401 };

  const res = await fetch(`${restaurantBaseUrl}/api/restaurant/${id}`, {
    method: "GET",
    headers,
    cache: "no-store",
  });

  if (!res.ok) return { error: "Restaurant not found", statusCode: res.status };

  return (await res.json()) as Restaurant;
}

export async function getRestaurantMenu(restaurantId: string) {
  const headers = await authHeaders();
  if (!headers) return { error: "Unauthorized", statusCode: 401 };

  const res = await fetch(`${restaurantBaseUrl}/api/menu/restaurant/${restaurantId}`, {
    method: "GET",
    headers,
    cache: "no-store",
  });

  if (!res.ok) return { error: "Unable to load menu", statusCode: res.status };

  return (await res.json()) as RestaurantMenu;
}
