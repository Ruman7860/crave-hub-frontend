"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { createRestaurant, updateRestaurant } from "@/actions/seller/seller.actions";
import { Store, MapPin, Phone, FileText, Images as ImagesIcon, X, Maximize2, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import * as z from "zod";
import { useSharedLocation } from "@/hooks/use-shared-location";

const MAX_IMAGES = 5;

const restaurantSchema = z.object({
  name: z.string().min(2, "Restaurant name must be at least 2 characters."),
  description: z.string().optional(),
  phone: z.string().min(10, "Valid phone number is required."),
  isOpen: z.boolean(),
});

type RestaurantFormProps = {
  initialData?: any;
};

export function RestaurantFormClient({ initialData }: RestaurantFormProps) {
  const isEditing = !!initialData;
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Existing images from server (presigned URLs for display, editable)
  const [existingImages, setExistingImages] = useState<string[]>(
    initialData?.images ?? [],
  );
  // New local files picked by the user
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [newPreviews, setNewPreviews] = useState<string[]>([]);

  const [fullscreenSrc, setFullscreenSrc] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { location, isRefreshing, refreshLocation } = useSharedLocation();

  const form = useForm<z.infer<typeof restaurantSchema>>({
    resolver: zodResolver(restaurantSchema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      phone: initialData?.phone || "",
      isOpen: initialData?.isOpen ?? false,
    },
  });

  const totalImages = existingImages.length + newPreviews.length;

  const onSubmit = async (data: z.infer<typeof restaurantSchema>) => {
    setLoading(true);

    try {
      const formData = new FormData();
      formData.set("name", data.name);
      formData.set("description", data.description || "");
      formData.set("phone", data.phone);
      formData.set("isOpen", data.isOpen ? "true" : "false");

      if (location.lat && location.lng) {
        formData.set("latitude", location.lat.toString());
        formData.set("longitude", location.lng.toString());
        if (location.address) {
          formData.set("formattedAddress", location.address);
        }
      }

      // Append each new file under the multi-file field name
      newFiles.forEach((file) => formData.append("images", file));

      let result;
      if (isEditing) {
        result = await updateRestaurant(initialData.id, formData);
      } else {
        result = await createRestaurant(formData);
      }

      if (result?.error || result?.statusCode >= 400) {
        const errorMsg = Array.isArray(result.message)
          ? result.message.join(", ")
          : result.message || result.error;
        toast.error(errorMsg || "Failed to save restaurant");
      } else {
        toast.success(isEditing ? "Restaurant updated!" : "Restaurant created!");
        router.push("/dashboard");
      }
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(e.target.files ?? []);
    const remaining = MAX_IMAGES - existingImages.length - newFiles.length;
    const toAdd = picked.slice(0, remaining);

    setNewFiles((prev) => [...prev, ...toAdd]);
    setNewPreviews((prev) => [
      ...prev,
      ...toAdd.map((f) => URL.createObjectURL(f)),
    ]);

    // Reset so same file can be re-picked
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeExisting = (idx: number) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const removeNew = (idx: number) => {
    setNewPreviews((prev) => prev.filter((_, i) => i !== idx));
    setNewFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const allPreviews = [...existingImages, ...newPreviews];

  return (
    <>
      <Card className="w-full max-w-7xl pt-4 mx-auto shadow-sm">
        <CardHeader className="bg-gray-50/50 dark:bg-zinc-900/50 border-b border-gray-100 dark:border-zinc-800">
          <CardTitle className="text-2xl flex items-center gap-2">
            <Store className="w-6 h-6 text-orange-600" />
            {isEditing ? "Edit Restaurant" : "Create Restaurant"}
          </CardTitle>
          <CardDescription>
            {isEditing
              ? "Update your restaurant details and settings."
              : "Fill in the details to set up your new restaurant profile."}
          </CardDescription>
        </CardHeader>
        <CardContent className="py-6 sm:py-8">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* ── Name & Description ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <Controller
                  name="name"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <div className="space-y-1.5">
                      <Label htmlFor="name" className="text-gray-700 dark:text-gray-300">Restaurant Name *</Label>
                      <Input
                        id="name"
                        {...field}
                        placeholder="e.g. The Spicy Kitchen"
                        className={`bg-white dark:bg-zinc-950 ${fieldState.error ? "border-red-500 focus-visible:ring-red-500/20" : ""}`}
                      />
                      {fieldState.error && (
                        <p className="text-[13px] font-medium text-red-500 animate-in slide-in-from-top-1 ml-1">
                          {fieldState.error.message}
                        </p>
                      )}
                    </div>
                  )}
                />

                <Controller
                  name="description"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <div className="space-y-1.5">
                      <Label htmlFor="description" className="text-gray-700 dark:text-gray-300">Description</Label>
                      <div className="relative">
                        <FileText className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                        <textarea
                          id="description"
                          {...field}
                          rows={4}
                          placeholder="Tell customers about your restaurant..."
                          className={`flex w-full rounded-md border border-input bg-white dark:bg-zinc-950 px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 pl-10 pt-2.5 ${fieldState.error ? "border-red-500 focus-visible:ring-red-500/20" : ""}`}
                        />
                      </div>
                      {fieldState.error && (
                        <p className="text-[13px] font-medium text-red-500 animate-in slide-in-from-top-1 ml-1">
                          {fieldState.error.message}
                        </p>
                      )}
                    </div>
                  )}
                />
              </div>

              {/* ── Image Upload ── */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-gray-700 dark:text-gray-300">
                    Restaurant Images
                  </Label>
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    {totalImages}/{MAX_IMAGES} images
                  </span>
                </div>

                {/* Preview grid */}
                {allPreviews.length > 0 && (
                  <div className="grid grid-cols-3 gap-2">
                    {existingImages.map((src, idx) => (
                      <div key={`existing-${idx}`} className="relative h-28 rounded-xl overflow-hidden group bg-gray-100 dark:bg-zinc-900">
                        <Image src={src} alt={`Image ${idx + 1}`} fill className="object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <button
                            type="button"
                            className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 transition text-white"
                            onClick={() => setFullscreenSrc(src)}
                          >
                            <Maximize2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            className="p-1.5 rounded-full bg-red-500/80 hover:bg-red-500 transition text-white"
                            onClick={() => removeExisting(idx)}
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                    {newPreviews.map((src, idx) => (
                      <div key={`new-${idx}`} className="relative h-28 rounded-xl overflow-hidden group bg-gray-100 dark:bg-zinc-900 ring-2 ring-orange-400/50">
                        <Image src={src} alt={`New image ${idx + 1}`} fill className="object-cover" />
                        <div className="absolute top-1 right-1 bg-orange-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">NEW</div>
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <button
                            type="button"
                            className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 transition text-white"
                            onClick={() => setFullscreenSrc(src)}
                          >
                            <Maximize2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            className="p-1.5 rounded-full bg-red-500/80 hover:bg-red-500 transition text-white"
                            onClick={() => removeNew(idx)}
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Drop zone */}
                {totalImages < MAX_IMAGES && (
                  <div className="relative border-2 border-dashed border-gray-200 dark:border-zinc-800 rounded-xl h-28 hover:bg-gray-50 dark:hover:bg-zinc-900/50 transition-colors cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="flex flex-col items-center justify-center h-full text-gray-500 pointer-events-none gap-1">
                      <ImagesIcon className="w-8 h-8 opacity-40" />
                      <span className="text-sm font-medium">Click or drag images here</span>
                      <span className="text-xs opacity-60">PNG, JPG — up to {MAX_IMAGES} total</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ── Phone & Status ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              <Controller
                name="phone"
                control={form.control}
                render={({ field, fieldState }) => (
                  <div className="space-y-1.5">
                    <Label htmlFor="phone" className="text-gray-700 dark:text-gray-300">Phone Number *</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                      <Input
                        id="phone"
                        {...field}
                        placeholder="e.g. +1 234 567 890"
                        className={`pl-10 h-10 bg-white dark:bg-zinc-950 ${fieldState.error ? "border-red-500 focus-visible:ring-red-500/20" : ""}`}
                      />
                    </div>
                    {fieldState.error && (
                      <p className="text-[13px] font-medium text-red-500 animate-in slide-in-from-top-1 ml-1">
                        {fieldState.error.message}
                      </p>
                    )}
                  </div>
                )}
              />

              <Controller
                name="isOpen"
                control={form.control}
                render={({ field }) => (
                  <div className="space-y-1.5">
                    <Label className="invisible hidden sm:block">Status</Label>
                    <div className="flex items-center justify-between px-4 h-10 rounded-md border border-gray-200 dark:border-zinc-800 transition-colors hover:border-orange-200 dark:hover:border-orange-900/50">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          id="isOpen"
                          checked={field.value}
                          onChange={(e) => field.onChange(e.target.checked)}
                          className="w-[18px] h-[18px] rounded border-gray-300 text-orange-600 focus:ring-orange-600 cursor-pointer"
                        />
                        <Label htmlFor="isOpen" className="font-medium cursor-pointer text-sm text-gray-900 dark:text-gray-100">
                          Open for business
                        </Label>
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">Check the box to accept orders</span>
                    </div>
                  </div>
                )}
              />
            </div>

            {/* ── Location ── */}
            <div className="border-gray-100 dark:border-zinc-800">
              <h3 className="font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2 pb-2">
                <MapPin className="w-5 h-5 text-red-500" /> Store Location
              </h3>
              <div className="bg-gray-50 dark:bg-zinc-900/50 px-5 py-2 rounded-xl border border-gray-100 dark:border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <p className="text-base font-semibold text-gray-900 dark:text-gray-100">
                    {location.city ?? "Locating City..."}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {location.address ?? "Please wait while we determine your location or click update."}
                  </p>
                  {location.lat && location.lng && (
                    <p className="text-xs text-gray-400 font-mono mt-2 bg-white dark:bg-zinc-950 inline-block px-2 py-1 rounded border border-gray-200 dark:border-zinc-800">
                      Lat: {location.lat.toFixed(6)}, Lng: {location.lng.toFixed(6)}
                    </p>
                  )}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={refreshLocation}
                  disabled={isRefreshing}
                  className="shrink-0 shadow-sm bg-white dark:bg-zinc-950"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
                  Update Location
                </Button>
              </div>
            </div>

            {/* ── Actions ── */}
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={loading}
                className="w-24 border-gray-200 dark:border-zinc-800"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="w-32 bg-orange-600 hover:bg-orange-700 text-white"
              >
                {loading ? "Saving..." : isEditing ? "Save Changes" : "Create"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* ── Fullscreen preview ── */}
      {fullscreenSrc && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setFullscreenSrc(null)}
        >
          <button
            className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors bg-black/20 hover:bg-black/40 p-2 rounded-full"
            onClick={(e) => { e.stopPropagation(); setFullscreenSrc(null); }}
          >
            <X className="w-8 h-8" />
          </button>
          <div
            className="relative w-full h-full max-w-5xl max-h-[85vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={fullscreenSrc}
              alt="Fullscreen preview"
              fill
              className="object-contain rounded-lg"
            />
          </div>
        </div>
      )}
    </>
  );
}
