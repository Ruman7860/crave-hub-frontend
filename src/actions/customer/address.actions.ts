"use server";

import { getToken } from "@/lib/auth-utils";
import { Address } from "@/components/custom/customer/customer-types";

const restaurantBaseUrl = process.env.NEXT_PUBLIC_RESTAURANT_SERVICE;

type AddressActionError = {
  error: string;
  statusCode: number;
};

async function authHeaders(contentType = true) {
  const token = await getToken();
  if (!token) return null;

  return {
    ...(contentType ? { "Content-Type": "application/json" } : {}),
    Authorization: `Bearer ${token}`,
  };
}

async function parseResponse<T>(res: Response): Promise<T | AddressActionError> {
  const result = await res.json().catch(() => null);

  if (!res.ok) {
    return {
      error: result?.message ?? "Request failed",
      statusCode: res.status,
    };
  }

  return result as T;
}

export async function getAddresses(): Promise<Address[] | AddressActionError> {
  const headers = await authHeaders(false);
  if (!headers) return { error: "Unauthorized", statusCode: 401 };

  const res = await fetch(`${restaurantBaseUrl}/api/address`, {
    method: "GET",
    headers,
    cache: "no-store",
  });

  return parseResponse<Address[]>(res);
}

export async function getAddressById(id: string): Promise<Address | AddressActionError> {
  const headers = await authHeaders(false);
  if (!headers) return { error: "Unauthorized", statusCode: 401 };

  const res = await fetch(`${restaurantBaseUrl}/api/address/${id}`, {
    method: "GET",
    headers,
    cache: "no-store",
  });

  return parseResponse<Address>(res);
}

export async function createAddress(
  data: Omit<Address, "id" | "userId" | "isDefault" | "createdAt" | "updatedAt">
): Promise<Address | AddressActionError> {
  const headers = await authHeaders();
  if (!headers) return { error: "Unauthorized", statusCode: 401 };

  const res = await fetch(`${restaurantBaseUrl}/api/address`, {
    method: "POST",
    headers,
    body: JSON.stringify(data),
    cache: "no-store",
  });

  return parseResponse<Address>(res);
}

export async function updateAddress(
  id: string,
  data: Partial<Omit<Address, "id" | "userId" | "createdAt" | "updatedAt">>
): Promise<Address | AddressActionError> {
  const headers = await authHeaders();
  if (!headers) return { error: "Unauthorized", statusCode: 401 };

  const res = await fetch(`${restaurantBaseUrl}/api/address/${id}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify(data),
    cache: "no-store",
  });

  return parseResponse<Address>(res);
}

export async function deleteAddress(id: string): Promise<{ success: boolean } | AddressActionError> {
  const headers = await authHeaders(false);
  if (!headers) return { error: "Unauthorized", statusCode: 401 };

  const res = await fetch(`${restaurantBaseUrl}/api/address/${id}`, {
    method: "DELETE",
    headers,
    cache: "no-store",
  });

  if (!res.ok) {
    const result = await res.json().catch(() => null);
    return { error: result?.message ?? "Unable to delete address", statusCode: res.status };
  }

  return { success: true };
}

export async function setDefaultAddress(id: string): Promise<Address | AddressActionError> {
  const headers = await authHeaders();
  if (!headers) return { error: "Unauthorized", statusCode: 401 };

  const res = await fetch(`${restaurantBaseUrl}/api/address/${id}/default`, {
    method: "PATCH",
    headers,
    cache: "no-store",
  });

  return parseResponse<Address>(res);
}
