"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Address } from "../customer-types";
import { AddressCard } from "./address-card";
import {
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from "@/actions/customer/address.actions";
import {
  Loader2,
  MapPin,
  Plus,
  MapPinned,
} from "lucide-react";
import dynamic from "next/dynamic";

const AddressMap = dynamic(() => import("./address-map").then((m) => m.AddressMap), {
  ssr: false,
  loading: () => (
    <div className="flex h-[280px] items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800">
      <Loader2 className="size-6 animate-spin text-orange-500" />
    </div>
  ),
});

type AddressFormData = {
  label: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  latitude: number;
  longitude: number;
};

const emptyForm: AddressFormData = {
  label: "",
  fullName: "",
  phone: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  country: "India",
  postalCode: "",
  latitude: 20.5937,
  longitude: 78.9629,
};

export function AddressManagementClient({
  initialAddresses,
}: {
  initialAddresses: Address[];
}) {
  const [addresses, setAddresses] = useState<Address[]>(initialAddresses);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [form, setForm] = useState<AddressFormData>(emptyForm);
  const [isPending, startTransition] = useTransition();

  function openCreate() {
    setEditingAddress(null);
    setForm(emptyForm);
    setDialogOpen(true);
  }

  function openEdit(address: Address) {
    setEditingAddress(address);
    setForm({
      label: address.label ?? "",
      fullName: address.fullName,
      phone: address.phone,
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2 ?? "",
      city: address.city,
      state: address.state,
      country: address.country,
      postalCode: address.postalCode,
      latitude: address.latitude,
      longitude: address.longitude,
    });
    setDialogOpen(true);
  }

  function handleLocationChange(lat: number, lng: number) {
    setForm((prev) => ({ ...prev, latitude: lat, longitude: lng }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!form.fullName || !form.phone || !form.addressLine1 || !form.city || !form.state || !form.postalCode) {
      toast.error("Please fill in all required fields");
      return;
    }

    startTransition(async () => {
      const payload = {
        label: form.label || null,
        fullName: form.fullName,
        phone: form.phone,
        addressLine1: form.addressLine1,
        addressLine2: form.addressLine2 || null,
        city: form.city,
        state: form.state,
        country: form.country,
        postalCode: form.postalCode,
        latitude: form.latitude,
        longitude: form.longitude,
      };

      if (editingAddress) {
        const result = await updateAddress(editingAddress.id, payload);
        if ("error" in result) {
          toast.error(result.error);
          return;
        }
        setAddresses((prev) =>
          prev.map((a) => (a.id === result.id ? result : a))
        );
        toast.success("Address updated");
      } else {
        const result = await createAddress(payload);
        if ("error" in result) {
          toast.error(result.error);
          return;
        }
        setAddresses((prev) => [...prev, result]);
        toast.success("Address added");
      }
      setDialogOpen(false);
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      const result = await deleteAddress(id);
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      setAddresses((prev) => prev.filter((a) => a.id !== id));
      toast.success("Address removed");
    });
  }

  function handleSetDefault(id: string) {
    startTransition(async () => {
      const result = await setDefaultAddress(id);
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      setAddresses((prev) =>
        prev.map((a) => ({
          ...a,
          isDefault: a.id === id,
        }))
      );
      toast.success("Default address updated");
    });
  }

  return (
    <div className="mx-auto max-w-4xl pb-10">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-xl bg-orange-100 text-orange-600 dark:bg-orange-950/50">
            <MapPinned className="size-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-zinc-950 dark:text-zinc-50">
              My Addresses
            </h1>
            <p className="text-sm text-zinc-500">
              {addresses.length} saved address{addresses.length !== 1 ? "es" : ""}
            </p>
          </div>
        </div>
        <Button
          onClick={openCreate}
          className="rounded-full bg-orange-600 text-white hover:bg-orange-700"
        >
          <Plus className="size-4" />
          Add Address
        </Button>
      </div>

      {/* Address Cards */}
      {addresses.length === 0 ? (
        <div className="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-dashed border-orange-200 bg-white/80 p-8 text-center dark:border-zinc-800 dark:bg-zinc-950/80">
          <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-orange-100 text-orange-700">
            <MapPin className="size-7" />
          </div>
          <h3 className="text-xl font-extrabold text-zinc-950 dark:text-zinc-50">
            No addresses saved
          </h3>
          <p className="mt-2 max-w-md text-sm text-zinc-500">
            Add your first delivery address to get started with ordering.
          </p>
          <Button
            onClick={openCreate}
            className="mt-5 rounded-full bg-orange-600 text-white hover:bg-orange-700"
          >
            <Plus className="size-4" />
            Add your first address
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {addresses.map((address) => (
            <AddressCard
              key={address.id}
              address={address}
              onEdit={() => openEdit(address)}
              onDelete={() => handleDelete(address.id)}
              onSetDefault={() => handleSetDefault(address.id)}
              disabled={isPending}
            />
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-black">
              {editingAddress ? "Edit Address" : "Add New Address"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Map */}
            <div>
              <Label className="mb-2 block text-sm font-semibold">
                Pin location on map
              </Label>
              <AddressMap
                latitude={form.latitude}
                longitude={form.longitude}
                onLocationChange={handleLocationChange}
              />
            </div>

            {/* Label */}
            <div>
              <Label htmlFor="label" className="text-sm font-semibold">
                Label <span className="text-zinc-400">(optional)</span>
              </Label>
              <div className="mt-1.5 flex gap-2">
                {["Home", "Work", "Other"].map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => setForm((p) => ({ ...p, label: l }))}
                    className={cn(
                      "rounded-full border px-4 py-1.5 text-sm font-semibold transition-all",
                      form.label === l
                        ? "border-orange-600 bg-orange-50 text-orange-700 dark:bg-orange-950/30"
                        : "border-zinc-200 text-zinc-500 hover:border-zinc-300 dark:border-zinc-700"
                    )}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>

            {/* Name + Phone */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="fullName" className="text-sm font-semibold">
                  Full Name *
                </Label>
                <Input
                  id="fullName"
                  value={form.fullName}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, fullName: e.target.value }))
                  }
                  className="mt-1.5"
                  placeholder="John Doe"
                  required
                />
              </div>
              <div>
                <Label htmlFor="phone" className="text-sm font-semibold">
                  Phone *
                </Label>
                <Input
                  id="phone"
                  value={form.phone}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, phone: e.target.value }))
                  }
                  className="mt-1.5"
                  placeholder="+91 98765 43210"
                  required
                />
              </div>
            </div>

            {/* Address Lines */}
            <div>
              <Label htmlFor="addressLine1" className="text-sm font-semibold">
                Address Line 1 *
              </Label>
              <Input
                id="addressLine1"
                value={form.addressLine1}
                onChange={(e) =>
                  setForm((p) => ({ ...p, addressLine1: e.target.value }))
                }
                className="mt-1.5"
                placeholder="House/Flat No, Building, Street"
                required
              />
            </div>
            <div>
              <Label htmlFor="addressLine2" className="text-sm font-semibold">
                Address Line 2{" "}
                <span className="text-zinc-400">(optional)</span>
              </Label>
              <Input
                id="addressLine2"
                value={form.addressLine2}
                onChange={(e) =>
                  setForm((p) => ({ ...p, addressLine2: e.target.value }))
                }
                className="mt-1.5"
                placeholder="Landmark, Area"
              />
            </div>

            {/* City, State, PostalCode */}
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <Label htmlFor="city" className="text-sm font-semibold">
                  City *
                </Label>
                <Input
                  id="city"
                  value={form.city}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, city: e.target.value }))
                  }
                  className="mt-1.5"
                  required
                />
              </div>
              <div>
                <Label htmlFor="state" className="text-sm font-semibold">
                  State *
                </Label>
                <Input
                  id="state"
                  value={form.state}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, state: e.target.value }))
                  }
                  className="mt-1.5"
                  required
                />
              </div>
              <div>
                <Label htmlFor="postalCode" className="text-sm font-semibold">
                  PIN Code *
                </Label>
                <Input
                  id="postalCode"
                  value={form.postalCode}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, postalCode: e.target.value }))
                  }
                  className="mt-1.5"
                  required
                />
              </div>
            </div>

            {/* Submit */}
            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
                className="rounded-full"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                className="rounded-full bg-orange-600 text-white hover:bg-orange-700"
              >
                {isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : null}
                {editingAddress ? "Update Address" : "Save Address"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
