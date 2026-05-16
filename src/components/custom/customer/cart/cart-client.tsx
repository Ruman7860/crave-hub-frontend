"use client";

import Link from "next/link";
import { useAtomValue } from "jotai/react";
import { cartAtom } from "@/atoms/cart.atom";
import { Button } from "@/components/ui/button";
import { EmptyState, VegMark } from "../common/customer-ui";
import { INR_FORMATTER } from "../customer-types";
import { QuantityStepper } from "./quantity-stepper";
import { useCartActions } from "./use-cart-actions";
import { Bike, ReceiptText, ShoppingBag, Trash2 } from "lucide-react";

export function getCartPricing(items: { price: number; discountedPrice?: number | null; quantity: number }[]) {
  const itemTotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + (item.discountedPrice ?? item.price) * item.quantity, 0);
  const discount = itemTotal - subtotal;
  const deliveryFee = subtotal > 499 || subtotal === 0 ? 0 : 39;
  const platformFee = subtotal === 0 ? 0 : 6;
  const taxes = subtotal === 0 ? 0 : Math.round(subtotal * 0.05);
  const total = subtotal + deliveryFee + platformFee + taxes;

  return { itemTotal, subtotal, discount, deliveryFee, platformFee, taxes, total };
}

export function CartClient({ mode = "cart" }: { mode?: "cart" | "checkout" }) {
  const cart = useAtomValue(cartAtom);
  const { updateQuantity, clearCart } = useCartActions();
  const pricing = getCartPricing(cart.items);

  if (!cart.items.length) {
    return (
      <EmptyState
        title="Your cart is waiting"
        description="Add something delicious from nearby restaurants and your checkout will be ready here."
        action={<Button asChild className="rounded-full bg-orange-600 px-5 text-white hover:bg-orange-700"><Link href="/home">Browse restaurants</Link></Button>}
      />
    );
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-6 pb-24 lg:grid-cols-[1fr_380px]">
      <section className="rounded-2xl border border-white/80 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 sm:p-6">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-black text-zinc-950 dark:text-zinc-50">{mode === "checkout" ? "Checkout" : "Your Cart"}</h1>
            <p className="mt-1 text-sm text-zinc-500">{cart.restaurant?.name}</p>
          </div>
          <Button variant="outline" onClick={clearCart} className="rounded-full">
            <Trash2 className="size-4" /> Clear
          </Button>
        </div>

        {mode === "checkout" ? <AddressSelection /> : null}

        <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {cart.items.map((item) => (
            <article key={item.id} className="grid grid-cols-[1fr_auto] gap-4 py-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <VegMark isVeg={item.isVeg} />
                  <h3 className="truncate font-black text-zinc-950 dark:text-zinc-50">{item.name}</h3>
                </div>
                <p className="mt-1 text-sm font-bold text-zinc-700 dark:text-zinc-200">
                  {INR_FORMATTER.format(item.discountedPrice ?? item.price)}
                  {item.discountedPrice ? <span className="ml-2 text-zinc-400 line-through">{INR_FORMATTER.format(item.price)}</span> : null}
                </p>
              </div>
              <QuantityStepper quantity={item.quantity} onChange={(quantity) => updateQuantity(item.id, quantity)} />
            </article>
          ))}
        </div>
      </section>

      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-2xl border border-white/80 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="flex items-center gap-2 text-lg font-black text-zinc-950 dark:text-zinc-50">
            <ReceiptText className="size-5 text-orange-600" /> Bill details
          </h2>
          <div className="mt-4 space-y-3 text-sm">
            <PriceRow label="Item total" value={pricing.itemTotal} />
            {pricing.discount ? <PriceRow label="Discount" value={-pricing.discount} positive /> : null}
            <PriceRow label="Delivery fee" value={pricing.deliveryFee} free={pricing.deliveryFee === 0} />
            <PriceRow label="Platform fee" value={pricing.platformFee} />
            <PriceRow label="Taxes" value={pricing.taxes} />
          </div>
          <div className="mt-5 flex items-center justify-between border-t border-zinc-100 pt-4 text-lg font-black dark:border-zinc-800">
            <span>To pay</span>
            <span>{INR_FORMATTER.format(pricing.total)}</span>
          </div>
          <div className="mt-4 rounded-2xl bg-emerald-50 p-3 text-sm font-semibold text-emerald-800">
            <Bike className="mr-2 inline size-4" /> Free delivery above ₹499.
          </div>
          {mode === "checkout" ? (
            <Button className="mt-5 h-12 w-full rounded-2xl bg-orange-600 text-base font-black text-white hover:bg-orange-700">
              Place order
            </Button>
          ) : (
            <Button asChild className="mt-5 h-12 w-full rounded-2xl bg-zinc-950 text-base font-black text-white hover:bg-orange-600">
              <Link href="/checkout"><ShoppingBag className="size-5" /> Proceed to checkout</Link>
            </Button>
          )}
        </div>
      </aside>
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
