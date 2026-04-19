import { atomWithStorage } from "jotai/utils";

export type LocationState = {
  lat: number | null
  lng: number | null
  address: string | null
  city: string | null
  cachedAt: number | null  // timestamp in ms
}

const defaultLocation: LocationState = {
  lat: null,
  lng: null,
  address: null,
  city: null,
  cachedAt: null,
}

export const locationAtom = atomWithStorage<LocationState>('user-location', defaultLocation)