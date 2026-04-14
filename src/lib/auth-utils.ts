"use server";
import { cookies } from "next/headers";
const getToken = async () => {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value
    return token;
}

const storeToken = async (token: string) => {
    const cookieStore = await cookies();
    cookieStore.set("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 1000 * 60 * 60 * 24 * 15 // 15 days
    });
}

const removeToken = async () => {
    const cookieStore = await cookies();
    cookieStore.delete("token");
}

export {
    getToken,
    storeToken,
    removeToken
}