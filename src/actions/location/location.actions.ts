"use server";
import { getToken } from "@/lib/auth-utils";

export interface LocationType {
  lat: number;
  lng: number;
}

const getUserLocation = async (body: LocationType) => {
  try {
    const { lat, lng } = body;
    const token = await getToken();
    const res = await fetch(`${process.env.NEXT_PUBLIC_UTILS_SERVICE}/api/location/reverse-geocode?lat=${lat}&lng=${lng}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    if (res.ok) {
      return res.json();
    }
  } catch (error) {
    console.error("Error while getting user location -> ", error);
    throw error;
  }
}

export {
  getUserLocation
}