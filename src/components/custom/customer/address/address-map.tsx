"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Crosshair, Loader2 } from "lucide-react";

// Leaflet CSS is loaded via <link> in the head
const LEAFLET_CSS = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";

type AddressMapProps = {
  latitude: number;
  longitude: number;
  onLocationChange: (lat: number, lng: number) => void;
};

export function AddressMap({ latitude, longitude, onLocationChange }: AddressMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [isReady, setIsReady] = useState(false);

  const updateMarker = useCallback(
    (lat: number, lng: number, L: typeof import("leaflet")) => {
      if (!mapInstanceRef.current) return;

      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng]);
      } else {
        const icon = L.icon({
          iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
          iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
          shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41],
        });

        markerRef.current = L.marker([lat, lng], {
          draggable: true,
          icon,
        }).addTo(mapInstanceRef.current);

        markerRef.current.on("dragend", () => {
          const pos = markerRef.current?.getLatLng();
          if (pos) {
            onLocationChange(pos.lat, pos.lng);
          }
        });
      }

      mapInstanceRef.current.setView([lat, lng], mapInstanceRef.current.getZoom());
    },
    [onLocationChange]
  );

  useEffect(() => {
    // Inject Leaflet CSS
    if (!document.querySelector(`link[href="${LEAFLET_CSS}"]`)) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = LEAFLET_CSS;
      document.head.appendChild(link);
    }

    let mounted = true;

    async function initMap() {
      const L = (await import("leaflet")).default;

      if (!mounted || !mapRef.current || mapInstanceRef.current) return;

      const map = L.map(mapRef.current, {
        center: [latitude, longitude],
        zoom: latitude === 20.5937 && longitude === 78.9629 ? 5 : 15,
        zoomControl: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;

      // Place initial marker
      updateMarker(latitude, longitude, L);

      // Click to place marker
      map.on("click", (e: L.LeafletMouseEvent) => {
        updateMarker(e.latlng.lat, e.latlng.lng, L);
        onLocationChange(e.latlng.lat, e.latlng.lng);
      });

      setIsReady(true);
    }

    initMap();

    return () => {
      mounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
      }
    };
    // Only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync marker when lat/lng props change externally
  useEffect(() => {
    if (!isReady) return;

    async function sync() {
      const L = (await import("leaflet")).default;
      updateMarker(latitude, longitude, L);
    }
    sync();
  }, [latitude, longitude, isReady, updateMarker]);

  function handleLocateMe() {
    if (!navigator.geolocation) {
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const L = (await import("leaflet")).default;
        const { latitude: lat, longitude: lng } = pos.coords;
        onLocationChange(lat, lng);
        updateMarker(lat, lng, L);
        mapInstanceRef.current?.setView([lat, lng], 16);
        setIsLocating(false);
      },
      () => {
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  return (
    <div className="relative overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-700">
      <div ref={mapRef} className="h-[280px] w-full" />
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleLocateMe}
        disabled={isLocating}
        className="absolute bottom-3 right-3 z-[1000] rounded-full bg-white shadow-lg dark:bg-zinc-900"
      >
        {isLocating ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Crosshair className="size-4" />
        )}
        {isLocating ? "Locating..." : "My Location"}
      </Button>
    </div>
  );
}
