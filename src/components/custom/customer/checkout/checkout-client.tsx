"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  Address,
  CartResponse,
  INR_FORMATTER,
} from "../customer-types";
import { VegMark } from "../common/customer-ui";
import { AddressCard } from "../address/address-card";
import { PaymentHandler } from "./payment-handler";
import { initiateCheckout } from "@/actions/customer/checkout.actions";
import {
  ArrowLeft,
  Bike,
  CreditCard,
  Loader2,
  MapPin,
  Plus,
  ReceiptText,
  ShieldCheck,
  ShoppingBag,
  StickyNote,
} from "lucide-react";

type PaymentProvider = "RAZORPAY" | "STRIPE";

export function CheckoutClient({
  cart,
  addresses,
}: {
  cart: CartResponse;
  addresses: Address[];
}) {
  const router = useRouter();
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    addresses.find((a) => a.isDefault)?.id ?? addresses[0]?.id ?? null
  );
  const [paymentProvider, setPaymentProvider] = useState<PaymentProvider>("RAZORPAY");
  const [notes, setNotes] = useState("");
  const [isPending, startTransition] = useTransition();
  const [paymentData, setPaymentData] = useState<{
    orderId: string;
    paymentDetails: {
      provider: string;
      providerOrderId: string;
      amount: number;
      currency: string;
      key?: string;
      clientSecret?: string;
    };
  } | null>(null);

  const selectedAddress = addresses.find((a) => a.id === selectedAddressId);

  function handlePay() {
    if (!selectedAddressId) {
      toast.error("Please select a delivery address");
      return;
    }

    startTransition(async () => {
      const result = await initiateCheckout({
        restaurantId: cart.restaurantId,
        addressId: selectedAddressId,
        paymentProvider: paymentProvider,
        notes: notes || undefined,
      });

      if ("error" in result) {
        toast.error(result.error);
        return;
      }

      setPaymentData(result);
    });
  }

  if (paymentData) {
    return (
      <PaymentHandler
        orderId={paymentData.orderId}
        paymentDetails={paymentData.paymentDetails}
      />
    );
  }

  return (
    <div className="mx-auto max-w-4xl pb-28">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.back()}
          className="rounded-full"
        >
          <ArrowLeft className="size-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-black text-zinc-950 dark:text-zinc-50">
            Checkout
          </h1>
          <p className="text-sm text-zinc-500">{cart.restaurant.name}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          {/* Section 1: Delivery Address */}
          <section className="rounded-2xl border border-white/80 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="flex items-center gap-2 text-lg font-black text-zinc-950 dark:text-zinc-50">
                <MapPin className="size-5 text-orange-600" />
                Delivery Address
              </h2>
              <Button
                asChild
                variant="outline"
                size="sm"
                className="rounded-full text-xs"
              >
                <Link href="/addresses">
                  <Plus className="size-3.5" />
                  Manage
                </Link>
              </Button>
            </div>

            {addresses.length === 0 ? (
              <div className="rounded-xl border border-dashed border-orange-200 bg-orange-50/50 p-6 text-center dark:border-zinc-700 dark:bg-zinc-900">
                <MapPin className="mx-auto size-8 text-orange-400" />
                <p className="mt-2 text-sm font-semibold text-zinc-600 dark:text-zinc-300">
                  No delivery addresses saved
                </p>
                <Button
                  asChild
                  size="sm"
                  className="mt-3 rounded-full bg-orange-600 text-white hover:bg-orange-700"
                >
                  <Link href="/addresses">Add Address</Link>
                </Button>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {addresses.map((address) => (
                  <AddressCard
                    key={address.id}
                    address={address}
                    selectable
                    selected={selectedAddressId === address.id}
                    onSelect={() => setSelectedAddressId(address.id)}
                  />
                ))}
              </div>
            )}
          </section>

          {/* Section 2: Cart Items */}
          <section className="rounded-2xl border border-white/80 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-black text-zinc-950 dark:text-zinc-50">
              <ShoppingBag className="size-5 text-orange-600" />
              Order Summary
              <span className="ml-auto text-sm font-semibold text-zinc-400">
                {cart.items.reduce((sum, i) => sum + i.quantity, 0)} items
              </span>
            </h2>

            <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {cart.items.map((item) => {
                const price = item.discountedPrice ?? item.price;
                return (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 py-3"
                  >
                    <VegMark isVeg={item.isVeg} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-bold text-zinc-950 dark:text-zinc-50">
                        {item.itemName}
                      </p>
                      <p className="text-sm text-zinc-500">
                        × {item.quantity}
                      </p>
                    </div>
                    <p className="text-sm font-bold text-zinc-950 dark:text-zinc-50">
                      {INR_FORMATTER.format(price * item.quantity)}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Section 3: Payment Provider */}
          <section className="rounded-2xl border border-white/80 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-black text-zinc-950 dark:text-zinc-50">
              <CreditCard className="size-5 text-orange-600" />
              Payment Method
            </h2>

            <div className="grid gap-3 sm:grid-cols-2">
              {(
                [
                  {
                    id: "RAZORPAY" as const,
                    name: "Razorpay",
                    desc: "UPI, Cards, Wallets, Net Banking",
                    color: "text-blue-600",
                  },
                  {
                    id: "STRIPE" as const,
                    name: "Stripe",
                    desc: "Cards, Apple Pay, Google Pay",
                    color: "text-indigo-600",
                  },
                ] as const
              ).map((provider) => (
                <button
                  key={provider.id}
                  type="button"
                  onClick={() => setPaymentProvider(provider.id)}
                  className={cn(
                    "flex items-center gap-3 rounded-xl border p-4 text-left transition-all duration-200",
                    paymentProvider === provider.id
                      ? "border-orange-500 bg-orange-50/80 ring-2 ring-orange-500/20 dark:bg-orange-950/20"
                      : "border-zinc-200 hover:border-zinc-300 dark:border-zinc-700"
                  )}
                >
                  <div
                    className={cn(
                      "flex size-10 items-center justify-center rounded-lg",
                      paymentProvider === provider.id
                        ? "bg-orange-100 dark:bg-orange-900/30"
                        : "bg-zinc-100 dark:bg-zinc-800"
                    )}
                  >
                    <CreditCard className={cn("size-5", provider.color)} />
                  </div>
                  <div>
                    <p className="font-bold text-zinc-950 dark:text-zinc-50">
                      {provider.name}
                    </p>
                    <p className="text-xs text-zinc-500">{provider.desc}</p>
                  </div>
                  {paymentProvider === provider.id ? (
                    <span className="ml-auto flex size-5 items-center justify-center rounded-full bg-orange-600 text-white">
                      <svg
                        viewBox="0 0 12 12"
                        className="size-3"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M2 6l3 3 5-5" />
                      </svg>
                    </span>
                  ) : null}
                </button>
              ))}
            </div>
          </section>

          {/* Section 4: Notes */}
          <section className="rounded-2xl border border-white/80 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            <h2 className="mb-3 flex items-center gap-2 text-lg font-black text-zinc-950 dark:text-zinc-50">
              <StickyNote className="size-5 text-orange-600" />
              Delivery Notes
              <span className="text-sm font-normal text-zinc-400">(optional)</span>
            </h2>
            <Input
              placeholder="Any special instructions for delivery..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="rounded-xl"
            />
          </section>
        </div>

        {/* Sidebar: Bill */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border border-white/80 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            <h2 className="flex items-center gap-2 text-lg font-black text-zinc-950 dark:text-zinc-50">
              <ReceiptText className="size-5 text-orange-600" />
              Bill Details
            </h2>

            <div className="mt-4 space-y-3 text-sm">
              <PriceRow label="Item total" value={cart.pricing.itemTotal} />
              {cart.pricing.discount ? (
                <PriceRow label="Discount" value={-cart.pricing.discount} positive />
              ) : null}
              <PriceRow
                label="Delivery fee"
                value={cart.pricing.deliveryFee}
                free={cart.pricing.deliveryFee === 0}
              />
              <PriceRow label="Platform fee" value={cart.pricing.platformFee} />
              <PriceRow label="Taxes" value={cart.pricing.taxes} />
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-zinc-100 pt-4 text-lg font-black dark:border-zinc-800">
              <span>To Pay</span>
              <span>{INR_FORMATTER.format(cart.pricing.total)}</span>
            </div>

            {cart.pricing.deliveryFee === 0 ? (
              <div className="mt-4 rounded-2xl bg-emerald-50 p-3 text-sm font-semibold text-emerald-800">
                <Bike className="mr-2 inline size-4" />
                Free delivery applied!
              </div>
            ) : null}

            {/* Delivery address summary */}
            {selectedAddress ? (
              <div className="mt-4 rounded-xl border border-zinc-100 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-900">
                <p className="text-xs font-semibold text-zinc-400">
                  Delivering to
                </p>
                <p className="mt-1 text-sm font-bold text-zinc-950 dark:text-zinc-50">
                  {selectedAddress.label ?? "Address"} • {selectedAddress.fullName}
                </p>
                <p className="mt-0.5 text-xs text-zinc-500 line-clamp-2">
                  {selectedAddress.addressLine1}, {selectedAddress.city}
                </p>
              </div>
            ) : null}

            <Button
              onClick={handlePay}
              disabled={isPending || !selectedAddressId || addresses.length === 0}
              className="mt-5 h-12 w-full rounded-2xl bg-orange-600 text-base font-black text-white hover:bg-orange-700"
            >
              {isPending ? (
                <Loader2 className="size-5 animate-spin" />
              ) : (
                <ShieldCheck className="size-5" />
              )}
              {isPending ? "Processing..." : `Pay ${INR_FORMATTER.format(cart.pricing.total)}`}
            </Button>

            <p className="mt-3 text-center text-xs text-zinc-400">
              <ShieldCheck className="mr-1 inline size-3" />
              Secure payment powered by {paymentProvider === "RAZORPAY" ? "Razorpay" : "Stripe"}
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

function PriceRow({
  label,
  value,
  positive,
  free,
}: {
  label: string;
  value: number;
  positive?: boolean;
  free?: boolean;
}) {
  return (
    <div className="flex items-center justify-between text-zinc-600 dark:text-zinc-300">
      <span>{label}</span>
      <span
        className={
          positive
            ? "font-bold text-emerald-700"
            : "font-bold text-zinc-950 dark:text-zinc-50"
        }
      >
        {free ? "FREE" : INR_FORMATTER.format(value)}
      </span>
    </div>
  );
}
