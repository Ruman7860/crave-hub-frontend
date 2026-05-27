"use server";

import { getToken } from "@/lib/auth-utils";
import { Order } from "@/components/custom/customer/customer-types";

const restaurantBaseUrl = process.env.NEXT_PUBLIC_RESTAURANT_SERVICE;

type OrderActionError = {
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

export async function getOrders(
  page = 1,
  limit = 20
): Promise<{ orders: Order[]; total: number } | OrderActionError> {
  const headers = await authHeaders(false);
  if (!headers) return { error: "Unauthorized", statusCode: 401 };

  const res = await fetch(
    `${restaurantBaseUrl}/api/orders?page=${page}&limit=${limit}`,
    {
      method: "GET",
      headers,
      cache: "no-store",
    }
  );

  const result = await res.json().catch(() => null);

  if (!res.ok) {
    return {
      error: result?.message ?? "Failed to fetch orders",
      statusCode: res.status,
    };
  }

  return result as { orders: Order[]; total: number };
}

export async function getOrderById(id: string): Promise<Order | OrderActionError> {
  const headers = await authHeaders(false);
  if (!headers) return { error: "Unauthorized", statusCode: 401 };

  const res = await fetch(`${restaurantBaseUrl}/api/orders/${id}`, {
    method: "GET",
    headers,
    cache: "no-store",
  });

  const result = await res.json().catch(() => null);

  if (!res.ok) {
    return {
      error: result?.message ?? "Failed to fetch order",
      statusCode: res.status,
    };
  }

  return result as Order;
}

export async function cancelOrder(id: string): Promise<Order | OrderActionError> {
  const headers = await authHeaders();
  if (!headers) return { error: "Unauthorized", statusCode: 401 };

  const res = await fetch(`${restaurantBaseUrl}/api/orders/${id}/cancel`, {
    method: "POST",
    headers,
    cache: "no-store",
  });

  const result = await res.json().catch(() => null);

  if (!res.ok) {
    return {
      error: result?.message ?? "Failed to cancel order",
      statusCode: res.status,
    };
  }

  return result as Order;
}
