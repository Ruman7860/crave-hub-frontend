"use client";

import { useCallback, useEffect } from "react";
import { useAtom } from "jotai/react";
import { cartAtom } from "@/atoms/cart.atom";
import {
  addCartItem,
  clearActiveCart,
  decrementCartItem,
  getActiveCart,
  incrementCartItem,
  removeCartItem,
  updateCartItemQuantity,
  validateActiveCart,
} from "@/actions/customer/cart.actions";
import { CartResponse } from "../customer-types";

type CartActionError = {
  error: string;
  statusCode: number;
  code?: string;
  currentRestaurant?: { id: string; name: string };
  nextRestaurant?: { id: string; name: string };
};

function isCart(result: unknown): result is CartResponse {
  return Boolean(result && typeof result === "object" && "items" in result && "pricing" in result);
}

function isCartError(result: unknown): result is CartActionError {
  return Boolean(result && typeof result === "object" && "error" in result);
}

export function useCartActions() {
  const [state, setState] = useAtom(cartAtom);

  const applyResult = useCallback((result: unknown) => {
    if (isCart(result) || result === null) {
      setState((current) => ({
        ...current,
        cart: result,
        isLoading: false,
        isMutating: false,
        error: null,
        hydrated: true,
      }));
      return { ok: true as const, cart: result };
    }

    if (isCartError(result)) {
      setState((current) => ({
        ...current,
        isLoading: false,
        isMutating: false,
        error: result.error,
        hydrated: true,
      }));
      return { ok: false as const, error: result };
    }

    return { ok: false as const, error: { error: "Cart request failed", statusCode: 500 } };
  }, [setState]);

  const refreshCart = useCallback(async () => {
    setState((current) => ({ ...current, isLoading: !current.hydrated, error: null }));
    const result = await getActiveCart();
    return applyResult(result);
  }, [applyResult, setState]);

  useEffect(() => {
    if (state.hydrated || state.isLoading) return;
    void refreshCart();
  }, [refreshCart, state.hydrated, state.isLoading]);

  const addItem = async (menuItemId: string, forceReplace = false) => {
    setState((current) => ({ ...current, isMutating: true, error: null }));
    const result = await addCartItem(menuItemId, 1, forceReplace);
    console.log("Add Item",result);
    return applyResult(result);
  };

  const updateQuantity = async (cartItemId: string, quantity: number) => {
    const previousCart = state.cart;

    setState((current) => ({
      ...current,
      isMutating: true,
      cart: current.cart
        ? {
            ...current.cart,
            items: current.cart.items
              .map((item) => (item.id === cartItemId ? { ...item, quantity } : item))
              .filter((item) => item.quantity > 0),
          }
        : current.cart,
    }));

    const result = await updateCartItemQuantity(cartItemId, quantity);
    const applied = applyResult(result);

    if (!applied.ok) {
      setState((current) => ({ ...current, cart: previousCart }));
    }

    return applied;
  };

  const incrementItem = async (cartItemId: string) => {
    setState((current) => ({ ...current, isMutating: true, error: null }));
    return applyResult(await incrementCartItem(cartItemId));
  };

  const decrementItem = async (cartItemId: string) => {
    setState((current) => ({ ...current, isMutating: true, error: null }));
    return applyResult(await decrementCartItem(cartItemId));
  };

  const removeItem = async (cartItemId: string) => {
    setState((current) => ({ ...current, isMutating: true, error: null }));
    return applyResult(await removeCartItem(cartItemId));
  };

  const clearCart = async () => {
    setState((current) => ({ ...current, isMutating: true, error: null }));
    const result = await clearActiveCart();

    if ("success" in result) {
      setState((current) => ({
        ...current,
        cart: null,
        isMutating: false,
        error: null,
        hydrated: true,
      }));
      return { ok: true as const };
    }

    return applyResult(result);
  };

  const validateCart = async () => {
    setState((current) => ({ ...current, isMutating: true, error: null }));
    const result = await validateActiveCart();
    if (result?.cart) return applyResult(result.cart);
    setState((current) => ({ ...current, isMutating: false }));
    return result;
  };

  return {
    ...state,
    refreshCart,
    addItem,
    updateQuantity,
    incrementItem,
    decrementItem,
    removeItem,
    clearCart,
    validateCart,
  };
}
