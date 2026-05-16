"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import * as z from "zod";
import { createMenuItem, updateMenuItem } from "@/actions/seller/seller.actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  ImagePlus,
  Leaf,
  Save,
  Star,
  Upload,
  UtensilsCrossed,
} from "lucide-react";
import { toast } from "sonner";
import {
  getErrorMessage,
  INR_FORMATTER,
  MenuCategory,
  MenuItem,
} from "./menu-types";

type MenuItemFormValues = {
  name: string;
  description: string;
  categoryId: string;
  price: string;
  discountedPrice: string;
  isAvailable: boolean;
  isVeg: "true" | "false";
  isBestseller: boolean;
  image: File | null | undefined;
};

const menuItemSchema = (isEditing: boolean) =>
  z.object({
    name: z.string().min(2, "Item name must be at least 2 characters."),
    description: z.string().max(1000, "Description must be under 1000 characters."),
    categoryId: z.string().min(1, "Please select a category."),
    price: z.string().min(1, "Price is required.").refine((value) => Number(value) > 0, "Price must be greater than 0."),
    discountedPrice: z.string(),
    isAvailable: z.boolean(),
    isVeg: z.enum(["true", "false"], { message: "Please choose veg or non-veg." }),
    isBestseller: z.boolean(),
    image: z.custom<File | null | undefined>((value) => {
      if (value === undefined || value === null) return true;
      return typeof File !== "undefined" && value instanceof File;
    }, "Please upload a valid image."),
  }).superRefine((data, ctx) => {
    if (!isEditing && !data.image) {
      ctx.addIssue({
        code: "custom",
        path: ["image"],
        message: "Menu item image is required.",
      });
    }

    if (data.discountedPrice && Number(data.discountedPrice) > Number(data.price)) {
      ctx.addIssue({
        code: "custom",
        path: ["discountedPrice"],
        message: "Discounted price cannot be greater than price.",
      });
    }
  });

function formatPrice(value: string | number | null | undefined) {
  const numberValue = Number(value || 0);
  return INR_FORMATTER.format(Number.isFinite(numberValue) ? numberValue : 0);
}

export function MenuItemFormClient({
  categories,
  initialData,
}: {
  categories: MenuCategory[];
  initialData?: MenuItem;
}) {
  const router = useRouter();
  const isEditing = Boolean(initialData);
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(initialData?.image ?? null);

  const form = useForm<MenuItemFormValues>({
    resolver: zodResolver(menuItemSchema(isEditing)),
    defaultValues: {
      name: initialData?.name ?? "",
      description: initialData?.description ?? "",
      categoryId: initialData?.categoryId ?? categories[0]?.id ?? "",
      price: initialData?.price ? String(initialData.price) : "",
      discountedPrice: initialData?.discountedPrice ? String(initialData.discountedPrice) : "",
      isAvailable: initialData?.isAvailable ?? true,
      isVeg: initialData?.isVeg === false ? "false" : "true",
      isBestseller: initialData?.isBestseller ?? false,
      image: null,
    },
  });

  const watched = form.watch();
  const selectedCategory = useMemo(
    () => categories.find((category) => category.id === watched.categoryId),
    [categories, watched.categoryId],
  );

  const onSubmit = async (data: MenuItemFormValues) => {
    setLoading(true);

    try {
      const formData = new FormData();
      formData.set("name", data.name.trim());
      formData.set("description", data.description?.trim() ?? "");
      formData.set("categoryId", data.categoryId);
      formData.set("price", data.price);
      formData.set("discountedPrice", data.discountedPrice ?? "");
      formData.set("isAvailable", data.isAvailable ? "true" : "false");
      formData.set("isVeg", data.isVeg);
      formData.set("isBestseller", data.isBestseller ? "true" : "false");
      if (data.image) formData.set("image", data.image);

      const result = initialData
        ? await updateMenuItem(initialData.id, formData)
        : await createMenuItem(formData);
      const error = getErrorMessage(result, "Failed to save menu item");

      if (error) {
        toast.error(error);
        return;
      }

      toast.success(initialData ? "Menu item updated" : "Menu item created");
      router.push("/menu");
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  if (categories.length === 0) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4 text-center">
        <div className="min-h-80 flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-8 dark:border-zinc-800 dark:bg-zinc-900/40">
          <UtensilsCrossed className="w-12 h-12 text-gray-300 mb-3" />
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Create a category first</h1>
          <p className="text-gray-500 mt-2 max-w-md">Menu items require a category. Add one from the menu dashboard, then come back to create items.</p>
          <Button onClick={() => router.push("/menu")} className="mt-5 bg-orange-600 hover:bg-orange-700 text-white">
            Back to Menu
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-2 px-4 sm:px-6 space-y-5">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button type="button" variant="outline" size="icon" onClick={() => router.push("/menu")} aria-label="Back to menu">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
              {isEditing ? "Edit Menu Item" : "Add Menu Item"}
            </h1>
            <p className="text-gray-500 mt-1">Manage item details, photo, pricing, and availability.</p>
          </div>
        </div>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-5 items-start">
        <div className="space-y-5">
          <Card className="shadow-sm pt-4">
            <CardHeader className="border-b border-gray-100 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-900/50">
              <CardTitle className="flex items-center gap-2 text-xl">
                <UtensilsCrossed className="w-5 h-5 text-orange-600" />
                Basic Information
              </CardTitle>
              <CardDescription>Details customers see while browsing your restaurant.</CardDescription>
            </CardHeader>
            <CardContent className="py-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Controller
                  name="name"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <div className="space-y-1.5">
                      <Label htmlFor="name">Item Name *</Label>
                      <Input
                        id="name"
                        {...field}
                        placeholder="e.g. Paneer Butter Masala"
                        className={fieldState.error ? "border-red-500 focus-visible:ring-red-500/20" : ""}
                      />
                      {fieldState.error && <p className="text-[13px] font-medium text-red-500 ml-1">{fieldState.error.message}</p>}
                    </div>
                  )}
                />

                <Controller
                  name="categoryId"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <div className="space-y-1.5">
                      <Label htmlFor="categoryId">Category *</Label>
                      <select
                        id="categoryId"
                        {...field}
                        className={cn(
                          "flex h-9 w-full rounded-md border border-input bg-white px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring dark:bg-zinc-950",
                          fieldState.error ? "border-red-500 focus-visible:ring-red-500/20" : "",
                        )}
                      >
                        <option value="">Select category</option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>{category.name}</option>
                        ))}
                      </select>
                      {fieldState.error && <p className="text-[13px] font-medium text-red-500 ml-1">{fieldState.error.message}</p>}
                    </div>
                  )}
                />
              </div>

              <Controller
                name="description"
                control={form.control}
                render={({ field, fieldState }) => (
                  <div className="space-y-1.5">
                    <Label htmlFor="description">Description</Label>
                    <textarea
                      id="description"
                      {...field}
                      rows={4}
                      placeholder="Ingredients, spice level, portion notes..."
                      className={cn(
                        "flex w-full rounded-md border border-input bg-white px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring dark:bg-zinc-950",
                        fieldState.error ? "border-red-500 focus-visible:ring-red-500/20" : "",
                      )}
                    />
                    {fieldState.error && <p className="text-[13px] font-medium text-red-500 ml-1">{fieldState.error.message}</p>}
                  </div>
                )}
              />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Controller
                  name="isVeg"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <div className="space-y-1.5">
                      <Label htmlFor="isVeg">Diet Type *</Label>
                      <select
                        id="isVeg"
                        {...field}
                        className={cn(
                          "flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring dark:bg-zinc-950",
                          fieldState.error ? "border-red-500 focus-visible:ring-red-500/20" : "",
                        )}
                      >
                        <option value="true">Veg</option>
                        <option value="false">Non-Veg</option>
                      </select>
                      {fieldState.error && <p className="text-[13px] font-medium text-red-500 ml-1">{fieldState.error.message}</p>}
                    </div>
                  )}
                />

                <Controller
                  name="isBestseller"
                  control={form.control}
                  render={({ field }) => (
                    <label className="flex items-center gap-3 px-4 h-10 mt-6 rounded-md border border-gray-200 dark:border-zinc-800 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={(event) => field.onChange(event.target.checked)}
                        className="w-[18px] h-[18px]"
                      />
                      <span className="text-sm font-medium">Bestseller</span>
                    </label>
                  )}
                />

                <Controller
                  name="isAvailable"
                  control={form.control}
                  render={({ field }) => (
                    <label className="flex items-center gap-3 px-4 h-10 mt-6 rounded-md border border-gray-200 dark:border-zinc-800 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={(event) => field.onChange(event.target.checked)}
                        className="w-[18px] h-[18px]"
                      />
                      <span className="text-sm font-medium">Available</span>
                    </label>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm pt-4">
            <CardHeader className="border-b border-gray-100 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-900/50">
              <CardTitle className="text-xl">Pricing</CardTitle>
              <CardDescription>Discounted price is optional and must stay below the main price.</CardDescription>
            </CardHeader>
            <CardContent className="py-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Controller
                  name="price"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <div className="space-y-1.5">
                      <Label htmlFor="price">Price *</Label>
                      <Input
                        id="price"
                        {...field}
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="249"
                        className={fieldState.error ? "border-red-500 focus-visible:ring-red-500/20" : ""}
                      />
                      {fieldState.error && <p className="text-[13px] font-medium text-red-500 ml-1">{fieldState.error.message}</p>}
                    </div>
                  )}
                />

                <Controller
                  name="discountedPrice"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <div className="space-y-1.5">
                      <Label htmlFor="discountedPrice">Discounted Price</Label>
                      <Input
                        id="discountedPrice"
                        {...field}
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="199"
                        className={fieldState.error ? "border-red-500 focus-visible:ring-red-500/20" : ""}
                      />
                      {fieldState.error && <p className="text-[13px] font-medium text-red-500 ml-1">{fieldState.error.message}</p>}
                    </div>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => router.push("/menu")} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-orange-600 hover:bg-orange-700 text-white">
              <Save className="w-4 h-4 mr-2" />
              {loading ? "Saving..." : isEditing ? "Save Changes" : "Create Item"}
            </Button>
          </div>
        </div>

        <div className="space-y-5 lg:sticky lg:top-24">
          <Card className="shadow-sm pt-4">
            <CardHeader className="border-b border-gray-100 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-900/50">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Upload className="w-5 h-5 text-orange-600" />
                Item Image
              </CardTitle>
              <CardDescription>One appetizing photo is required for new items.</CardDescription>
            </CardHeader>
            <CardContent className="pb-6">
              <Controller
                name="image"
                control={form.control}
                render={({ field: { onChange }, fieldState }) => (
                  <div className="space-y-3">
                    <div className={cn(
                      "relative h-64 rounded-xl overflow-hidden bg-gray-100 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800",
                      fieldState.error ? "border-red-500" : "",
                    )}>
                      {imagePreview ? (
                        <Image src={imagePreview} alt="Menu item preview" fill className="object-cover" />
                      ) : (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400">
                          <ImagePlus className="w-12 h-12 mb-2 opacity-50" />
                          <span className="text-sm font-medium">Upload food image</span>
                          <span className="text-xs opacity-70">JPG or PNG</span>
                        </div>
                      )}
                    </div>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(event) => {
                        const file = event.target.files?.[0] ?? null;
                        onChange(file);
                        setImagePreview(file ? URL.createObjectURL(file) : initialData?.image ?? null);
                      }}
                    />
                    {fieldState.error && <p className="text-[13px] font-medium text-red-500 ml-1">{fieldState.error.message}</p>}
                  </div>
                )}
              />
            </CardContent>
          </Card>

          <Card className="shadow-sm pt-4">
            <CardHeader className="border-b border-gray-100 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-900/50">
              <CardTitle className="text-xl">Live Preview</CardTitle>
              <CardDescription>How this item will scan in the menu list.</CardDescription>
            </CardHeader>
            <CardContent className="pb-6">
              <div className="rounded-2xl border border-gray-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-950">
                <div className="relative h-44 bg-gray-100 dark:bg-zinc-900">
                  {imagePreview ? (
                    <Image src={imagePreview} alt="Preview" fill className="object-cover" />
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-400">
                      <ImagePlus className="w-10 h-10 opacity-50" />
                    </div>
                  )}
                </div>
                <div className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="font-bold text-gray-900 dark:text-gray-100 leading-tight">
                        {watched.name || "Paneer Butter Masala"}
                      </h2>
                      <p className="text-xs font-medium text-gray-500 mt-1">{selectedCategory?.name ?? "Category"}</p>
                    </div>
                    <div className="text-right shrink-0">
                      {watched.discountedPrice ? (
                        <>
                          <p className="font-bold text-orange-600">{formatPrice(watched.discountedPrice)}</p>
                          <p className="text-xs text-gray-400 line-through">{formatPrice(watched.price)}</p>
                        </>
                      ) : (
                        <p className="font-bold text-gray-900 dark:text-gray-100">{formatPrice(watched.price)}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {watched.isBestseller && (
                      <Badge className="bg-orange-600 hover:bg-orange-700 text-white border-none">
                        <Star className="w-3 h-3 mr-1" />
                        Bestseller
                      </Badge>
                    )}
                    <Badge
                      variant="outline"
                      className={watched.isVeg === "true"
                        ? "bg-green-50 text-green-700 border-green-200"
                        : "bg-red-50 text-red-700 border-red-200"}
                    >
                      <Leaf className="w-3 h-3 mr-1" />
                      {watched.isVeg === "true" ? "Veg" : "Non-Veg"}
                    </Badge>
                    <Badge className={watched.isAvailable ? "bg-green-600 text-white border-none" : "bg-gray-800 text-gray-100 border-none"}>
                      {watched.isAvailable ? "Available" : "Out of Stock"}
                    </Badge>
                  </div>
                  {watched.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">{watched.description}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
}
