import { atom } from "jotai";
import { CartResponse } from "@/components/custom/customer/customer-types";

export type CartState = {
  cart: CartResponse | null;
  isLoading: boolean;
  isMutating: boolean;
  error: string | null;
  hydrated: boolean;
};

export const cartAtom = atom<CartState>({
  cart: null,
  isLoading: false,
  isMutating: false,
  error: null,
  hydrated: false,
});
