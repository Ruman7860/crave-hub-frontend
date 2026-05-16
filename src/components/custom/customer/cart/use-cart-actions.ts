"use client";

import { useSetAtom } from "jotai/react";
import { cartAtom, CartRestaurant } from "@/atoms/cart.atom";
import { MenuItem } from "../customer-types";

export function useCartActions() {
  const setCart = useSetAtom(cartAtom);

  const addItem = (restaurant: CartRestaurant, item: MenuItem) => {
    setCart((cart) => {
      const isDifferentRestaurant = cart.restaurant && cart.restaurant.id !== restaurant.id;

      if (isDifferentRestaurant) {
        const shouldSwitch = window.confirm(
          `Your cart has items from ${cart.restaurant?.name}. Start a new cart from ${restaurant.name}?`,
        );
        if (!shouldSwitch) return cart;
      }

      const currentItems = isDifferentRestaurant ? [] : cart.items;
      const existing = currentItems.find((cartItem) => cartItem.id === item.id);
      const nextItems = existing
        ? currentItems.map((cartItem) =>
            cartItem.id === item.id ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem,
          )
        : [
            ...currentItems,
            {
              id: item.id,
              restaurantId: item.restaurantId,
              name: item.name,
              image: item.image,
              price: item.price,
              discountedPrice: item.discountedPrice,
              isVeg: item.isVeg,
              quantity: 1,
            },
          ];

      return {
        restaurant,
        items: nextItems,
        updatedAt: Date.now(),
      };
    });
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    setCart((cart) => {
      const items = cart.items
        .map((item) => (item.id === itemId ? { ...item, quantity } : item))
        .filter((item) => item.quantity > 0);

      return {
        restaurant: items.length ? cart.restaurant : null,
        items,
        updatedAt: Date.now(),
      };
    });
  };

  const clearCart = () => {
    setCart({ restaurant: null, items: [], updatedAt: Date.now() });
  };

  return { addItem, updateQuantity, clearCart };
}
