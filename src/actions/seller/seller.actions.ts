"use server";
import { getToken } from "@/lib/auth-utils";
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

    return result;
  } catch (error) {
    console.error("Error while getting restaurant -> ", error);
    throw error;
  }
};

export const createRestaurant = async (formData: FormData) => {
  try {
    const token = await getToken();
    if (!token) return { error: "Unauthorized", statusCode: 401 };

    console.log("token",token);

    const res = await fetch(`${process.env.NEXT_PUBLIC_RESTAURANT_SERVICE}/api/restaurant`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`
      },
      body: formData
    });

    console.log("res -> ",res);

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

export const getMenu = async () => {
  try {
    const token = await getToken();
    if (!token) return { error: "Unauthorized", statusCode: 401 };

    const res = await fetch(`${process.env.NEXT_PUBLIC_RESTAURANT_SERVICE}/api/menu`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`
      },
    });

    return await res.json();
  } catch (error) {
    console.error("Error while getting menu -> ", error);
    throw error;
  }
};

export const getMenuItem = async (id: string) => {
  try {
    const token = await getToken();
    if (!token) return { error: "Unauthorized", statusCode: 401 };

    const res = await fetch(`${process.env.NEXT_PUBLIC_RESTAURANT_SERVICE}/api/menu/items/${id}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`
      },
    });

    return await res.json();
  } catch (error) {
    console.error("Error while getting menu item -> ", error);
    throw error;
  }
};

export const createMenuCategory = async (data: Record<string, unknown>) => {
  try {
    const token = await getToken();
    if (!token) return { error: "Unauthorized", statusCode: 401 };

    const res = await fetch(`${process.env.NEXT_PUBLIC_RESTAURANT_SERVICE}/api/menu/categories`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });

    const result = await res.json();

    if (res.ok) {
      revalidatePath("/menu");
      revalidatePath("/menu/items/new");
    }

    return result;
  } catch (error) {
    console.error("Error while creating menu category -> ", error);
    throw error;
  }
};

export const updateMenuCategory = async (id: string, data: Record<string, unknown>) => {
  try {
    const token = await getToken();
    if (!token) return { error: "Unauthorized", statusCode: 401 };

    const res = await fetch(`${process.env.NEXT_PUBLIC_RESTAURANT_SERVICE}/api/menu/categories/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });

    const result = await res.json();

    if (res.ok) {
      revalidatePath("/menu");
      revalidatePath(`/menu/items/${id}/edit`);
    }

    return result;
  } catch (error) {
    console.error("Error while updating menu category -> ", error);
    throw error;
  }
};

export const deleteMenuCategory = async (id: string) => {
  try {
    const token = await getToken();
    if (!token) return { error: "Unauthorized", statusCode: 401 };

    const res = await fetch(`${process.env.NEXT_PUBLIC_RESTAURANT_SERVICE}/api/menu/categories/${id}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`
      },
    });

    const result = await res.json();

    if (res.ok) {
      revalidatePath("/menu");
    }

    return result;
  } catch (error) {
    console.error("Error while deleting menu category -> ", error);
    throw error;
  }
};

export const createMenuItem = async (formData: FormData) => {
  try {
    const token = await getToken();
    if (!token) return { error: "Unauthorized", statusCode: 401 };

    const res = await fetch(`${process.env.NEXT_PUBLIC_RESTAURANT_SERVICE}/api/menu/items`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`
      },
      body: formData
    });

    const result = await res.json();

    if (res.ok) {
      revalidatePath("/menu");
    }

    return result;
  } catch (error) {
    console.error("Error while creating menu item -> ", error);
    throw error;
  }
};

export const updateMenuItem = async (id: string, formData: FormData) => {
  try {
    const token = await getToken();
    if (!token) return { error: "Unauthorized", statusCode: 401 };

    const res = await fetch(`${process.env.NEXT_PUBLIC_RESTAURANT_SERVICE}/api/menu/items/${id}`, {
      method: "PATCH",
      headers: {
        "Authorization": `Bearer ${token}`
      },
      body: formData
    });

    const result = await res.json();

    if (res.ok) {
      revalidatePath("/menu");
    }

    return result;
  } catch (error) {
    console.error("Error while updating menu item -> ", error);
    throw error;
  }
};

export const deleteMenuItem = async (id: string) => {
  try {
    const token = await getToken();
    if (!token) return { error: "Unauthorized", statusCode: 401 };

    const res = await fetch(`${process.env.NEXT_PUBLIC_RESTAURANT_SERVICE}/api/menu/items/${id}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`
      },
    });

    const result = await res.json();

    if (res.ok) {
      revalidatePath("/menu");
    }

    return result;
  } catch (error) {
    console.error("Error while deleting menu item -> ", error);
    throw error;
  }
};
