"use server";

import { getToken, storeToken } from "@/lib/auth-utils";
import { cookies } from "next/headers";

const addUserRole = async (roleData: { role: string, id: string }) => {
    try {
        const token = await getToken();
        const res = await fetch(`${process.env.NEXT_PUBLIC_AUTH_SERVICE}/api/auth/add-role`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(roleData)
        });
        if(res.ok){
            const result = await res.json();
            // setting access token to cookies
            await storeToken(result.accessToken);
            return result;
        }
    } catch (error) {
        console.error("Error while adding user role -> ", error);
        throw error;
    }
}

const selectRole = async (roleData: { role: string, id: string }) => {
    return await addUserRole(roleData);
}

export {
    addUserRole,
    selectRole
}