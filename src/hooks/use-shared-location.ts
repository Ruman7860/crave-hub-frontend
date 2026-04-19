"use client";

import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import { useAtom } from "jotai/react";
import { LocationState, locationAtom } from "@/atoms/location.atom";
import { getUserLocation, LocationType } from "@/actions/location/location.actions";
import { getUserPosition, isLocationStale } from "@/lib/location-utils";

async function fetchAndStoreLocation(
  setLocation: Dispatch<SetStateAction<LocationState>>,
  setIsRefreshing: Dispatch<SetStateAction<boolean>>,
) {
  try {
    setIsRefreshing(true);
    const { lat, lng }: LocationType = await getUserPosition();
    const locationData = await getUserLocation({ lat, lng });

    setLocation({
      lat,
      lng,
      address: locationData?.address ?? null,
      city: locationData?.city ?? null,
      cachedAt: Date.now(),
    });
  } catch (error) {
    console.error("Location fetch failed:", error);
  } finally {
    setIsRefreshing(false);
  }
}

export function useSharedLocation() {
  const [location, setLocation] = useAtom(locationAtom);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const hasFetched = useRef(false);

  const refreshLocation = async () => {
    await fetchAndStoreLocation(setLocation, setIsRefreshing);
  };

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    if (location.lat !== null && !isLocationStale(location.cachedAt)) {
      return;
    }

    void fetchAndStoreLocation(setLocation, setIsRefreshing);
  }, [location.lat, location.cachedAt, setLocation]);

  return {
    location,
    isRefreshing,
    refreshLocation,
  };
}
