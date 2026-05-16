import { atomWithStorage } from "jotai/utils";

export type CartRestaurant = {
  id: string;
  name: string;
  image?: string | null;
};

export type CartItem = {
  id: string;
  restaurantId: string;
  name: string;
  image?: string | null;
  price: number;
  discountedPrice?: number | null;
  isVeg?: boolean | null;
  quantity: number;
};

export type CartState = {
  restaurant: CartRestaurant | null;
  items: CartItem[];
  updatedAt: number | null;
};

export const emptyCart: CartState = {
  restaurant: null,
  items: [],
  updatedAt: null,
};

export const cartAtom = atomWithStorage<CartState>("crave-hub-cart", emptyCart);
