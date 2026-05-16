"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MenuCategory, MenuItem, Restaurant, RestaurantMenu, INR_FORMATTER } from "../customer-types";
import {
  cuisineSummary,
  estimateDelivery,
  formatDistance,
  RestaurantImage,
  VegMark,
} from "../common/customer-ui";
import { QuantityStepper } from "../cart/quantity-stepper";
import { useCartActions } from "../cart/use-cart-actions";
import { Clock3, MapPin, Search, ShoppingBag, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type Group = MenuCategory & { items: MenuItem[] };

export function RestaurantDetailsClient({
  restaurant,
  menu,
}: {
  restaurant: Restaurant;
  menu: RestaurantMenu;
}) {
  const { cart, isMutating, addItem, updateQuantity } = useCartActions();
  const [activeCategory, setActiveCategory] = useState(menu.categories[0]?.id ?? "all");
  const [query, setQuery] = useState("");
  const [switchPrompt, setSwitchPrompt] = useState<{
    menuItemId: string;
    currentRestaurant: string;
    nextRestaurant: string;
  } | null>(null);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  const groups = useMemo<Group[]>(() => {
    const categories = menu.categories.length
      ? menu.categories
      : [{ id: "uncategorized", restaurantId: restaurant.id, name: "Recommended", description: null, displayOrder: 0, createdAt: "" }];

    return categories
      .map((category) => ({
        ...category,
        items: menu.items
          .filter((item) => (item.categoryId ?? "uncategorized") === category.id)
          .filter((item) => {
            const text = `${item.name} ${item.description ?? ""}`.toLowerCase();
            return text.includes(query.toLowerCase());
          }),
      }))
      .filter((group) => group.items.length > 0);
  }, [menu.categories, menu.items, query, restaurant.id]);

  const cartItemForMenuItem = (menuItemId: string) => cart?.items.find((item) => item.menuItemId === menuItemId) ?? null;
  const cartQuantity = (menuItemId: string) => cartItemForMenuItem(menuItemId)?.quantity ?? 0;
  const cartCount = cart?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0;

  const handleAddItem = async (menuItemId: string, forceReplace = false) => {
    const result = await addItem(menuItemId, forceReplace);

    if (!result.ok && result.error.code === "RESTAURANT_SWITCH_REQUIRED") {
      setSwitchPrompt({
        menuItemId,
        currentRestaurant: result.error.currentRestaurant?.name ?? "your current restaurant",
        nextRestaurant: result.error.nextRestaurant?.name ?? restaurant.name,
      });
    } else {
      setSwitchPrompt(null);
    }
  };

  const scrollToCategory = (id: string) => {
    setActiveCategory(id);
    sectionRefs.current[id]?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="mx-auto max-w-7xl pb-24">
      <section className="overflow-hidden rounded-[2rem] border border-white/80 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <div className="grid lg:grid-cols-[1fr_420px]">
          <div className="p-5 sm:p-8">
            <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-wide text-orange-700">
              {/* <span>Verified restaurant</span>
              <span className="text-zinc-300">•</span> */}
              <Badge className={`${restaurant.isOpen ? 'bg-green-800':'bg-red-900'}`}>{restaurant.isOpen ? "Open now" : "Closed for delivery"}</Badge>
            </div>
            <h1 className="mt-3 text-4xl font-black tracking-tight text-zinc-950 dark:text-zinc-50">{restaurant.name}</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-500">{restaurant.description ?? cuisineSummary(restaurant)}</p>
            <div className="mt-6 flex flex-wrap gap-3 text-sm font-bold text-zinc-700 dark:text-zinc-200">
              {/* <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-2 text-emerald-700">
                <Star className="size-4 fill-current" /> 4.{restaurant.name.length % 8}
              </span> */}
              <span className="inline-flex items-center gap-2 rounded-full bg-orange-50 px-3 py-2 text-orange-700">
                <Clock3 className="size-4" /> {estimateDelivery(restaurant.distanceMeters)}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-zinc-100 px-3 py-2 dark:bg-zinc-800">
                <MapPin className="size-4" /> {formatDistance(restaurant.distanceMeters)}
              </span>
            </div>
            <p className="mt-5 flex items-start gap-2 text-sm text-zinc-500">
              <MapPin className="mt-0.5 size-4 shrink-0 text-orange-600" />
              {restaurant.location.formattedAddress ?? "Address available after checkout"}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 p-3 lg:grid-cols-1">
            {/* Need to implement carasoul */}
            <RestaurantImage restaurant={restaurant} className="h-52 rounded-3xl lg:h-full" />
            {restaurant.images?.slice(1, 2).map((image) => (
              <div key={image} className="h-52 rounded-3xl bg-cover bg-center lg:hidden" style={{ backgroundImage: `url("${image}")` }} />
            ))}
          </div>
        </div>
      </section>

      <div className="sticky top-16 z-30 mt-5 rounded-2xl border border-orange-100 bg-orange-50/90 p-3 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/90">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="flex h-11 flex-1 items-center rounded-xl border border-white bg-white px-3 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <Search className="mr-2 size-4 text-orange-600" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search inside this menu"
              className="w-full bg-transparent text-sm font-semibold outline-none placeholder:text-zinc-400"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto">
            {groups.map((group) => (
              <button
                key={group.id}
                type="button"
                onClick={() => scrollToCategory(group.id)}
                className={cn(
                  "h-10 shrink-0 rounded-full px-4 text-sm font-bold transition",
                  activeCategory === group.id ? "bg-zinc-950 text-white" : "bg-white text-zinc-700 hover:bg-orange-100 dark:bg-zinc-900 dark:text-zinc-200",
                )}
              >
                {group.name} ({group.items.length})
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[250px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-36 rounded-2xl border border-white/80 bg-white p-3 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            {groups.map((group) => (
              <button
                key={group.id}
                type="button"
                onClick={() => scrollToCategory(group.id)}
                className={cn(
                  "flex w-full items-center justify-between rounded-xl px-3 py-3 text-left text-sm font-bold transition",
                  activeCategory === group.id ? "bg-orange-600 text-white" : "text-zinc-600 hover:bg-orange-50 dark:text-zinc-300 dark:hover:bg-zinc-900",
                )}
              >
                {group.name}
                <span>{group.items.length}</span>
              </button>
            ))}
          </div>
        </aside>

        <main className="space-y-6">
          {groups.map((group) => (
            <section
              key={group.id}
              ref={(node) => {
                sectionRefs.current[group.id] = node;
              }}
              className="scroll-mt-36 rounded-2xl border border-white/80 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 sm:p-5"
            >
              <div className="mb-4">
                <h2 className="text-xl font-black text-zinc-950 dark:text-zinc-50">{group.name}</h2>
                {group.description ? <p className="mt-1 text-sm text-zinc-500">{group.description}</p> : null}
              </div>
              <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {group.items.map((item) => (
                  <MenuItemCard
                    key={item.id}
                    item={item}
                    restaurant={restaurant}
                    quantity={cartQuantity(item.id)}
                    disabled={isMutating}
                    onAdd={() => handleAddItem(item.id)}
                    onQuantityChange={(quantity) => {
                      const cartItem = cartItemForMenuItem(item.id);
                      if (cartItem) void updateQuantity(cartItem.id, quantity);
                    }}
                  />
                ))}
              </div>
            </section>
          ))}
        </main>
      </div>

      {cartCount ? (
        <Link href="/cart" className="fixed inset-x-4 bottom-4 z-40 mx-auto flex max-w-xl items-center justify-between rounded-2xl bg-zinc-950 px-5 py-4 text-white shadow-2xl">
          <div>
            <p className="text-sm font-bold">{cartCount} items selected</p>
            <p className="text-xs text-zinc-300">{cart?.restaurant.name}</p>
          </div>
          <span className="inline-flex items-center gap-2 text-sm font-black text-orange-300">
            <ShoppingBag className="size-4" /> View cart
          </span>
        </Link>
      ) : null}

      {switchPrompt ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 p-4 sm:items-center">
          <div className="w-full max-w-md rounded-3xl bg-white p-5 shadow-2xl animate-in fade-in zoom-in-95 duration-200 dark:bg-zinc-950">
            <h3 className="text-xl font-black text-zinc-950 dark:text-zinc-50">Start a new cart?</h3>
            <p className="mt-2 text-sm leading-6 text-zinc-500">
              Your cart has items from {switchPrompt.currentRestaurant}. Adding this will clear that cart and start a new one from {switchPrompt.nextRestaurant}.
            </p>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <Button variant="outline" className="h-11 rounded-2xl" onClick={() => setSwitchPrompt(null)}>
                Keep old cart
              </Button>
              <Button
                className="h-11 rounded-2xl bg-orange-600 text-white hover:bg-orange-700"
                onClick={() => handleAddItem(switchPrompt.menuItemId, true)}
              >
                Replace cart
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function MenuItemCard({
  item,
  restaurant,
  quantity,
  disabled,
  onAdd,
  onQuantityChange,
}: {
  item: MenuItem;
  restaurant: Restaurant;
  quantity: number;
  disabled: boolean;
  onAdd: () => void;
  onQuantityChange: (quantity: number) => void;
}) {
  const price = item.discountedPrice ?? item.price;

  return (
    <article className={cn("grid gap-4 py-5 sm:grid-cols-[1fr_150px]", !item.isAvailable && "opacity-60")}>
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <VegMark isVeg={item.isVeg} />
          {item.isBestseller ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-2 py-1 text-xs font-black text-orange-700">
              <Sparkles className="size-3" /> Bestseller
            </span>
          ) : null}
        </div>
        <h3 className="mt-2 text-base font-black text-zinc-950 dark:text-zinc-50">{item.name}</h3>
        <div className="mt-1 flex items-baseline gap-2">
          <span className="font-extrabold text-zinc-950 dark:text-zinc-50">{INR_FORMATTER.format(price)}</span>
          {item.discountedPrice ? <span className="text-sm text-zinc-400 line-through">{INR_FORMATTER.format(item.price)}</span> : null}
        </div>
        {item.description ? <p className="mt-2 line-clamp-2 text-sm leading-6 text-zinc-500">{item.description}</p> : null}
        {!item.isAvailable ? <p className="mt-2 text-xs font-bold text-red-600">Currently unavailable</p> : null}
      </div>
      <div className="relative h-32 overflow-hidden rounded-2xl bg-orange-100 sm:h-36">
        {item.image ? (
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url("${item.image}")` }} />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-orange-600">
            <Sparkles className="size-8" />
          </div>
        )}
        <div className="absolute inset-x-0 bottom-3 flex justify-center">
          <QuantityStepper
            quantity={quantity}
            disabled={disabled || !item.isAvailable || !restaurant.isOpen}
            onChange={(nextQuantity) => (quantity === 0 ? onAdd() : onQuantityChange(nextQuantity))}
          />
        </div>
      </div>
    </article>
  );
}
