"use client";

import { useState } from "react";
import { MapPin, Phone, Clock, FileText, Store, Cloud, Flame, ChevronLeft, ChevronRight, X } from "lucide-react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";

type StorageProvider = "firebase" | "s3" | "unknown";

function detectStorageProvider(url: string | null | undefined): StorageProvider {
  if (!url) return "unknown";
  if (url.includes("storage.googleapis.com") || url.startsWith("gs://")) return "firebase";
  if (url.includes(".amazonaws.com") || url.includes(".r2.cloudflarestorage.com") || url.startsWith("s3://")) return "s3";
  return "unknown";
}

function StorageProviderBadge({ url }: { url: string | null | undefined }) {
  const provider = detectStorageProvider(url);
  if (provider === "unknown" || !url) return null;
  const isFirebase = provider === "firebase";
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold shadow border backdrop-blur-sm ${isFirebase ? "bg-orange-500/90 border-orange-400/60 text-white" : "bg-sky-600/90 border-sky-500/60 text-white"}`}>
      {isFirebase ? <Flame className="w-3 h-3" /> : <Cloud className="w-3 h-3" />}
      {isFirebase ? "Firebase" : "AWS S3"}
    </span>
  );
}

function ImageGallery({ images, restaurantName }: { images: string[]; restaurantName: string }) {
  const [active, setActive] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);

  if (!images.length) {
    return (
      <div className="w-full h-64 sm:h-80 flex flex-col items-center justify-center text-gray-400 bg-gray-100 dark:bg-zinc-900">
        <Store className="w-16 h-16 mb-2 opacity-50" />
        <span className="text-sm font-medium">No Images Provided</span>
      </div>
    );
  }

  const prev = () => setActive((i) => (i - 1 + images.length) % images.length);
  const next = () => setActive((i) => (i + 1) % images.length);

  return (
    <>
      {/* Main carousel */}
      <div className="relative w-full h-64 sm:h-80 bg-gray-100 dark:bg-zinc-900 overflow-hidden group">
        <Image
          key={active}
          src={images[active]}
          alt={`${restaurantName} — image ${active + 1}`}
          fill
          className="object-cover transition-opacity duration-300"
          onClick={() => setFullscreen(true)}
          style={{ cursor: "zoom-in" }}
        />

        {/* Navigation arrows — only when >1 image */}
        {images.length > 1 && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); prev(); }}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-black/30 hover:bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); next(); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-black/30 hover:bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Dot indicators bottom-centre */}
        {images.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex gap-1.5">
            {images.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActive(idx)}
                className={`w-2 h-2 rounded-full transition-all ${idx === active ? "bg-white scale-125" : "bg-white/50"} cursor-pointer`}
              />
            ))}
          </div>
        )}

        {/* Counter top-left */}
        {images.length > 1 && (
          <div className="absolute top-3 left-3 z-10 bg-black/40 text-white text-xs font-semibold px-2 py-1 rounded-full backdrop-blur-sm">
            {active + 1} / {images.length}
          </div>
        )}
      </div>

      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div className="flex gap-2 px-4 py-3 overflow-x-auto bg-gray-50 dark:bg-zinc-900/50 border-b border-gray-100 dark:border-zinc-800">
          {images.map((src, idx) => (
            <button
              key={idx}
              onClick={() => setActive(idx)}
              className={`relative flex-none w-16 h-12 rounded-lg overflow-hidden ring-2 transition-all ${idx === active ? "ring-orange-500" : "ring-transparent opacity-60 hover:opacity-100"} cursor-pointer`}
            >
              <Image src={src} alt={`Thumb ${idx + 1}`} fill className="object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* Fullscreen overlay */}
      {fullscreen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4 backdrop-blur-sm"
          onClick={() => setFullscreen(false)}
        >
          <button
            className="absolute top-5 right-5 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition"
            onClick={(e) => { e.stopPropagation(); setFullscreen(false); }}
          >
            <X className="w-7 h-7" />
          </button>

          {images.length > 1 && (
            <>
              <button onClick={(e) => { e.stopPropagation(); prev(); }} className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition">
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button onClick={(e) => { e.stopPropagation(); next(); }} className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition">
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          <div className="relative w-full h-full max-w-5xl max-h-[85vh]" onClick={(e) => e.stopPropagation()}>
            <Image src={images[active]} alt="Fullscreen" fill className="object-contain rounded-xl" />
          </div>

          <div className="absolute bottom-5 text-white/60 text-sm font-medium">
            {active + 1} / {images.length}
          </div>
        </div>
      )}
    </>
  );
}

export function RestaurantView({ restaurant }: { restaurant: any }) {
  if (!restaurant) return null;

  const images: string[] = restaurant.images ?? (restaurant.image ? [restaurant.image] : []);
  const primaryImage = images[0];

  return (
    <div className="bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
      {/* Gallery header */}
      <div className="relative border-b border-gray-100 dark:border-zinc-800">
        <ImageGallery images={images} restaurantName={restaurant.name} />

        {/* Status badge top-right */}
        <div className="absolute top-4 right-4 z-10">
          <Badge
            variant={restaurant.isOpen ? "default" : "secondary"}
            className={restaurant.isOpen
              ? "bg-green-600 hover:bg-green-700 text-white border-none shadow-md px-3 py-1 text-sm font-bold"
              : "bg-gray-800 text-gray-100 hover:bg-gray-700 border-none shadow-md px-3 py-1 text-sm font-bold"
            }
          >
            {restaurant.isOpen ? "OPEN" : "CLOSED"}
          </Badge>
        </div>
      </div>

      <div className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
          <div className="space-y-5 flex-1">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
              {restaurant.name}
            </h2>

            {restaurant.description && (
              <div className="flex gap-3 text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-zinc-900/50 p-4 rounded-xl">
                <FileText className="w-5 h-5 shrink-0 mt-0.5 text-gray-400" />
                <p className="leading-relaxed text-xs sm:text-base">{restaurant.description}</p>
              </div>
            )}

            <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300 font-medium">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-orange-50 dark:bg-orange-950/30 flex items-center justify-center">
                <Phone className="w-2 h-2 sm:w-5 sm:h-5 text-orange-600 dark:text-orange-500" />
              </div>
              <span className="text-sm sm:text-lg">{restaurant.phone || "No phone number"}</span>
            </div>

            <div className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-red-50 dark:bg-red-950/30 flex items-center justify-center shrink-0">
                <MapPin className="w-2 h-2 sm:w-5 sm:h-5 text-red-600 dark:text-red-500" />
              </div>
              <div className="pt-2">
                <p className="font-medium text-sm sm:text-lg leading-snug">
                  {restaurant.location?.formattedAddress || "No address provided"}
                </p>
                {restaurant.location?.latitude && restaurant.location?.longitude && (
                  <p className="text-xs sm:text-sm text-gray-500 mt-1 font-mono">
                    {restaurant.location.latitude}, {restaurant.location.longitude}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Store details panel */}
          <div className="w-full sm:w-72 shrink-0 bg-gray-50 dark:bg-zinc-900 rounded-2xl p-6 border border-gray-100 dark:border-zinc-800">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-5 flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-500" /> Store Details
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-zinc-800">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Verification</span>
                <Badge variant="outline" className={restaurant.isVerified
                  ? "text-green-700 border-green-200 bg-green-50 dark:bg-green-950/30 dark:border-green-900/50"
                  : "text-amber-700 border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-900/50"}>
                  {restaurant.isVerified ? "Verified" : "Pending"}
                </Badge>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-zinc-800">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</span>
                <span className={restaurant.isOpen ? "font-semibold text-green-600 dark:text-green-500" : "font-semibold text-gray-600 dark:text-gray-400"}>
                  {restaurant.isOpen ? "Accepting Orders" : "Offline"}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-zinc-800">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Images</span>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{images.length}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Created</span>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {new Date(restaurant.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
