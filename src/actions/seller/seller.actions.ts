"use server";
import { getToken, storeToken } from "@/lib/auth-utils";
import { revalidatePath } from "next/cache";

export const getMine = async () => {
  try {
    const token = await getToken();
    if (!token) return { error: "Unauthorized", statusCode: 401 };

    const res = await fetch(`${process.env.NEXT_PUBLIC_RESTAURANT_SERVICE}/api/restaurant/me`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`
      },
    });

    const result = await res.json();

    
    
    // When the backend generates a new token because the restaurantId was missing
    if (result.accessToken && result.restaurant) {
      await storeToken(result.accessToken);
      return result.restaurant;
    }

    return result; // If no new token, the backend either returned the restaurant or an error
  } catch (error) {
    console.error("Error while getting restaurant -> ", error);
    throw error;
  }
};

export const createRestaurant = async (formData: FormData) => {
  try {
    const token = await getToken();
    if (!token) return { error: "Unauthorized", statusCode: 401 };

    const res = await fetch(`${process.env.NEXT_PUBLIC_RESTAURANT_SERVICE}/api/restaurant`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`
      },
      body: formData
    });

    const result = await res.json();
    
    if (res.ok) {
      revalidatePath("/dashboard");
    }
    return result;
  } catch (error) {
    console.error("Error while creating restaurant -> ", error);
    throw error;
  }
};

export const updateRestaurant = async (id: string, formData: FormData) => {
  try {
    const token = await getToken();
    if (!token) return { error: "Unauthorized", statusCode: 401 };

    const res = await fetch(`${process.env.NEXT_PUBLIC_RESTAURANT_SERVICE}/api/restaurant/${id}`, {
      method: "PATCH",
      headers: {
        "Authorization": `Bearer ${token}`
      },
      body: formData
    });

    const result = await res.json();

    if (res.ok) {
      revalidatePath("/dashboard");
    }
    return result;
  } catch (error) {
    console.error("Error while updating restaurant -> ", error);
    throw error;
  }
};
