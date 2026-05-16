"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { EmptyState, VegMark } from "../common/customer-ui";
import { CartItem, INR_FORMATTER } from "../customer-types";
import { QuantityStepper } from "./quantity-stepper";
import { useCartActions } from "./use-cart-actions";
import {
  AlertTriangle,
  Bike,
  ChevronDown,
  Loader2,
  ReceiptText,
  RefreshCw,
  ShoppingBag,
  Trash2,
} from "lucide-react";

export function CartClient({ mode = "cart" }: { mode?: "cart" | "checkout" }) {
  const { cart, isLoading, isMutating, error, updateQuantity, clearCart, validateCart } = useCartActions();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const hasBlockingIssue = useMemo(
    () => Boolean(cart?.validation.issues.some((issue) => issue.status !== "price_changed")),
    [cart?.validation.issues],
  );

  if (isLoading) {
    return <CartSkeleton />;
  }

  if (!cart?.items.length) {
    return (
      <EmptyState
        title="Your cart is waiting"
        description="Add something delicious from nearby restaurants and your checkout will be ready here."
        action={<Button asChild className="rounded-full bg-orange-600 px-5 text-white hover:bg-orange-700"><Link href="/home">Browse restaurants</Link></Button>}
      />
    );
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-6 pb-28 lg:grid-cols-[1fr_380px]">
      <section className="rounded-2xl border border-white/80 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 sm:p-6">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-2xl font-black text-zinc-950 dark:text-zinc-50">{mode === "checkout" ? "Checkout" : "Your Cart"}</h1>
            <p className="mt-1 truncate text-sm text-zinc-500">{cart.restaurant.name}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => validateCart()} disabled={isMutating} className="rounded-full">
              {isMutating ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />}
              Validate
            </Button>
            <Button variant="outline" onClick={clearCart} disabled={isMutating} className="rounded-full">
              <Trash2 className="size-4" /> Clear
            </Button>
          </div>
        </div>

        {error ? (
          <div className="mb-4 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-semibold text-red-700">
            {error}
          </div>
        ) : null}

        {!cart.validation.isValid ? (
          <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            <p className="font-black">Some cart items need attention</p>
            <p className="mt-1">Review unavailable items or price changes before checkout.</p>
          </div>
        ) : null}

        {mode === "checkout" ? <AddressSelection /> : null}

        <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {cart.items.map((item) => (
            <CartItemRow
              key={item.id}
              item={item}
              disabled={isMutating}
              onQuantityChange={(quantity) => updateQuantity(item.id, quantity)}
            />
          ))}
        </div>
      </section>

      <aside className="hidden lg:block lg:sticky lg:top-24 lg:self-start">
        <BillCard
          mode={mode}
          disabled={isMutating || hasBlockingIssue || !cart.validation.isValid}
          cart={cart}
        />
      </aside>

      <button
        type="button"
        onClick={() => setDrawerOpen(true)}
        className="fixed inset-x-4 bottom-4 z-40 flex items-center justify-between rounded-2xl bg-zinc-950 px-5 py-4 text-white shadow-2xl lg:hidden"
      >
        <span>
          <span className="block text-left text-sm font-bold">{cart.items.reduce((sum, item) => sum + item.quantity, 0)} items</span>
          <span className="block text-left text-xs text-zinc-300">{INR_FORMATTER.format(cart.pricing.total)} total</span>
        </span>
        <span className="inline-flex items-center gap-2 text-sm font-black text-orange-300">
          View bill <ChevronDown className="size-4 rotate-180" />
        </span>
      </button>

      {drawerOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close cart drawer"
            className="absolute inset-0 bg-black/40"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="absolute inset-x-0 bottom-0 rounded-t-3xl bg-white p-4 shadow-2xl animate-in slide-in-from-bottom duration-200 dark:bg-zinc-950">
            <BillCard
              mode={mode}
              disabled={isMutating || hasBlockingIssue || !cart.validation.isValid}
              cart={cart}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}

function CartItemRow({
  item,
  disabled,
  onQuantityChange,
}: {
  item: CartItem;
  disabled: boolean;
  onQuantityChange: (quantity: number) => void;
}) {
  const displayPrice = item.discountedPrice ?? item.price;
  const hasIssue = item.status !== "valid";

  return (
    <article className={cn("grid grid-cols-[1fr_auto] gap-4 py-4 transition", hasIssue && "rounded-2xl bg-amber-50/70 px-3 dark:bg-amber-950/20")}>
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <VegMark isVeg={item.isVeg} />
          <h3 className="truncate font-black text-zinc-950 dark:text-zinc-50">{item.itemName}</h3>
        </div>
        <p className="mt-1 text-sm font-bold text-zinc-700 dark:text-zinc-200">
          {INR_FORMATTER.format(displayPrice)}
          {item.discountedPrice ? <span className="ml-2 text-zinc-400 line-through">{INR_FORMATTER.format(item.price)}</span> : null}
        </p>
        {hasIssue ? (
          <p className="mt-2 flex items-center gap-1 text-xs font-bold text-amber-700">
            <AlertTriangle className="size-3.5" />
            {item.message}
            {item.status === "price_changed" && item.currentPrice ? ` Current: ${INR_FORMATTER.format(item.currentDiscountedPrice ?? item.currentPrice)}` : ""}
          </p>
        ) : null}
      </div>
      <QuantityStepper quantity={item.quantity} disabled={disabled} onChange={onQuantityChange} />
    </article>
  );
}

function BillCard({
  cart,
  mode,
  disabled,
}: {
  cart: NonNullable<ReturnType<typeof useCartActions>["cart"]>;
  mode: "cart" | "checkout";
  disabled: boolean;
}) {
  return (
    <div className="rounded-2xl border border-white/80 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <h2 className="flex items-center gap-2 text-lg font-black text-zinc-950 dark:text-zinc-50">
        <ReceiptText className="size-5 text-orange-600" /> Bill details
      </h2>
      <div className="mt-4 space-y-3 text-sm">
        <PriceRow label="Item total" value={cart.pricing.itemTotal} />
        {cart.pricing.discount ? <PriceRow label="Discount" value={-cart.pricing.discount} positive /> : null}
        <PriceRow label="Delivery fee" value={cart.pricing.deliveryFee} free={cart.pricing.deliveryFee === 0} />
        <PriceRow label="Platform fee" value={cart.pricing.platformFee} />
        <PriceRow label="Taxes" value={cart.pricing.taxes} />
      </div>
      <div className="mt-5 flex items-center justify-between border-t border-zinc-100 pt-4 text-lg font-black dark:border-zinc-800">
        <span>To pay</span>
        <span>{INR_FORMATTER.format(cart.pricing.total)}</span>
      </div>
      <div className="mt-4 rounded-2xl bg-emerald-50 p-3 text-sm font-semibold text-emerald-800">
        <Bike className="mr-2 inline size-4" /> Free delivery above ₹499.
      </div>
      {mode === "checkout" ? (
        <Button disabled={disabled} className="mt-5 h-12 w-full rounded-2xl bg-orange-600 text-base font-black text-white hover:bg-orange-700">
          Place order
        </Button>
      ) : (
        <Button asChild={!disabled} disabled={disabled} className="mt-5 h-12 w-full rounded-2xl bg-zinc-950 text-base font-black text-white hover:bg-orange-600">
          {disabled ? <span><ShoppingBag className="size-5" /> Resolve cart issues</span> : <Link href="/checkout"><ShoppingBag className="size-5" /> Proceed to checkout</Link>}
        </Button>
      )}
    </div>
  );
}

function PriceRow({ label, value, positive, free }: { label: string; value: number; positive?: boolean; free?: boolean }) {
  return (
    <div className="flex items-center justify-between text-zinc-600 dark:text-zinc-300">
      <span>{label}</span>
      <span className={positive ? "font-bold text-emerald-700" : "font-bold text-zinc-950 dark:text-zinc-50"}>
        {free ? "FREE" : INR_FORMATTER.format(value)}
      </span>
    </div>
  );
}

function AddressSelection() {
  return (
    <div className="mb-5 grid gap-3 sm:grid-cols-2">
      {[
        ["Home", "Current saved home address"],
        ["Work", "Office delivery instructions"],
      ].map(([label, address], index) => (
        <label key={label} className="flex cursor-pointer gap-3 rounded-2xl border border-orange-100 bg-orange-50/60 p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <input type="radio" name="address" defaultChecked={index === 0} className="mt-1 accent-orange-600" />
          <span>
            <span className="block font-black text-zinc-950 dark:text-zinc-50">{label}</span>
            <span className="mt-1 block text-sm text-zinc-500">{address}</span>
          </span>
        </label>
      ))}
    </div>
  );
}

function CartSkeleton() {
  return (
    <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1fr_380px]">
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="h-8 w-44 animate-pulse rounded bg-zinc-200" />
        <div className="mt-6 space-y-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-16 animate-pulse rounded-2xl bg-zinc-100" />
          ))}
        </div>
      </div>
      <div className="hidden h-72 animate-pulse rounded-2xl bg-white shadow-sm lg:block" />
    </div>
  );
}
