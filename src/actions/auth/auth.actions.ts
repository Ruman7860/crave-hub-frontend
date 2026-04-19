"use server";
import { getToken, removeToken, storeToken } from "@/lib/auth-utils";
import { cookies } from "next/headers";

const login = async (data: any) => {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_AUTH_SERVICE}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    })

    const result = await res.json();

    // Explicitly set the cookie on the browser using Next.js cookies API
    if (res.ok && result.accessToken) {
      await storeToken(result.accessToken);
    }

    return result;
  } catch (error) {
    console.log("Error while Login -> ", error);
    throw error;
  }
};

const getMe = async () => {
  try {
    const token = await getToken();

    const headers: HeadersInit = {
      "Content-Type": "application/json"
    };

    if (token) {
      // headers["Cookie"] = `token=${token}`;
      headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(`${process.env.NEXT_PUBLIC_AUTH_SERVICE}/api/auth/me`, {
      method: "GET",
      headers
    })
    const result = await res.json();
    return result;
  } catch (error) {
    console.log("Error while getting me -> ", error);
    throw error;
  }
}

const signup = async (data: any) => {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_AUTH_SERVICE}/api/auth/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    })

    const result = await res.json();
    // For signup, the backend currently does not return a token.
    // It returns { message, data: user }
    return result;
  } catch (error) {
    console.log("Error while Signup -> ", error);
    throw error;
  }
};

const logout = async () => {
  try {
    await removeToken();
    return { success: true };
  } catch (error) {
    console.log("Error while Logout -> ", error);
    throw error;
  }
}

export {
  login,
  signup,
  getMe,
  logout,
}