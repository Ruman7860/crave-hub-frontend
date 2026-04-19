const getUserPosition = (): Promise<{
  lat: number;
  lng: number;
}> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject("Geolocation not supported");
    }

    navigator.geolocation.getCurrentPosition((pos) => {
      resolve({
        lat: pos.coords.latitude,
        lng: pos.coords.longitude
      })
    },(err) => reject(err))
  })
}

// lib/location-utils.ts
const LOCATION_TTL_MS = 30 * 60 * 1000 // 30 minutes

function isLocationStale(cachedAt: number | null): boolean {
  if (cachedAt === null) return true
  return Date.now() - cachedAt > LOCATION_TTL_MS
}

export {
  getUserPosition,
  isLocationStale
}