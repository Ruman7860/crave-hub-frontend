"use server";

import { getToken } from "@/lib/auth-utils";
import { CartResponse } from "@/components/custom/customer/customer-types";

const restaurantBaseUrl = process.env.NEXT_PUBLIC_RESTAURANT_SERVICE;

type CartActionError = {
  error: string;
  statusCode: number;
  code?: string;
  currentRestaurant?: { id: string; name: string };
  nextRestaurant?: { id: string; name: string };
};

async function authHeaders(contentType = true) {
  const token = await getToken();
  if (!token) return null;

  return {
    ...(contentType ? { "Content-Type": "application/json" } : {}),
    Authorization: `Bearer ${token}`,
  };
}

async function parseCartResponse(res: Response): Promise<CartResponse | CartActionError | null> {
  if (res.status === 204) return null;
  const result = await res.json().catch(() => null);

  if (!res.ok) {
    const payload = typeof result?.message === "object" ? result.message : result;
    return {
      error: payload?.message ?? result?.message ?? "Cart request failed",
      statusCode: res.status,
      code: payload?.code,
      currentRestaurant: payload?.currentRestaurant,
      nextRestaurant: payload?.nextRestaurant,
    };
  }

  return result as CartResponse | null;
}

export async function getActiveCart() {
  const headers = await authHeaders(false);
  if (!headers) return { error: "Unauthorized", statusCode: 401 };

  const res = await fetch(`${restaurantBaseUrl}/api/cart`, {
    method: "GET",
    headers,
    cache: "no-store",
  });

  return parseCartResponse(res);
}

export async function addCartItem(menuItemId: string, quantity = 1, forceReplace = false) {
  const headers = await authHeaders();
  if (!headers) return { error: "Unauthorized", statusCode: 401 };

  const res = await fetch(`${restaurantBaseUrl}/api/cart/items`, {
    method: "POST",
    headers,
    body: JSON.stringify({ menuItemId, quantity, forceReplace }),
    cache: "no-store",
  });

  return parseCartResponse(res);
}

export async function updateCartItemQuantity(itemId: string, quantity: number) {
  const headers = await authHeaders();
  if (!headers) return { error: "Unauthorized", statusCode: 401 };

  const res = await fetch(`${restaurantBaseUrl}/api/cart/items/${itemId}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify({ quantity }),
    cache: "no-store",
  });

  return parseCartResponse(res);
}

export async function incrementCartItem(itemId: string) {
  const headers = await authHeaders();
  if (!headers) return { error: "Unauthorized", statusCode: 401 };

  const res = await fetch(`${restaurantBaseUrl}/api/cart/items/${itemId}/increment`, {
    method: "POST",
    headers,
    cache: "no-store",
  });

  return parseCartResponse(res);
}

export async function decrementCartItem(itemId: string) {
  const headers = await authHeaders();
  if (!headers) return { error: "Unauthorized", statusCode: 401 };

  const res = await fetch(`${restaurantBaseUrl}/api/cart/items/${itemId}/decrement`, {
    method: "POST",
    headers,
    cache: "no-store",
  });

  return parseCartResponse(res);
}

export async function removeCartItem(itemId: string) {
  const headers = await authHeaders(false);
  if (!headers) return { error: "Unauthorized", statusCode: 401 };

  const res = await fetch(`${restaurantBaseUrl}/api/cart/items/${itemId}`, {
    method: "DELETE",
    headers,
    cache: "no-store",
  });

  return parseCartResponse(res);
}

export async function clearActiveCart() {
  const headers = await authHeaders(false);
  if (!headers) return { error: "Unauthorized", statusCode: 401 };

  const res = await fetch(`${restaurantBaseUrl}/api/cart`, {
    method: "DELETE",
    headers,
    cache: "no-store",
  });

  if (!res.ok) {
    const result = await res.json().catch(() => null);
    return { error: result?.message ?? "Unable to clear cart", statusCode: res.status };
  }

  return { success: true };
}

export async function validateActiveCart() {
  const headers = await authHeaders(false);
  if (!headers) return { error: "Unauthorized", statusCode: 401 };

  const res = await fetch(`${restaurantBaseUrl}/api/cart/validate`, {
    method: "POST",
    headers,
    cache: "no-store",
  });

  return res.json();
}
