"use server";

import { getToken } from "@/lib/auth-utils";
import { CheckoutResponse } from "@/components/custom/customer/customer-types";

const restaurantBaseUrl = process.env.NEXT_PUBLIC_RESTAURANT_SERVICE;

type CheckoutActionError = {
  error: string;
  statusCode: number;
};

async function authHeaders() {
  const token = await getToken();
  if (!token) return null;

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export async function initiateCheckout(data: {
  restaurantId: string;
  addressId: string;
  paymentProvider: string;
  notes?: string;
}): Promise<CheckoutResponse | CheckoutActionError> {
  const headers = await authHeaders();
  if (!headers) return { error: "Unauthorized", statusCode: 401 };

  const res = await fetch(`${restaurantBaseUrl}/api/checkout`, {
    method: "POST",
    headers,
    body: JSON.stringify(data),
    cache: "no-store",
  });

  const result = await res.json().catch(() => null);

  if (!res.ok) {
    return {
      error: result?.message ?? "Checkout failed",
      statusCode: res.status,
    };
  }

  return result as CheckoutResponse;
}
