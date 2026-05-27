import { getActiveCart } from "@/actions/customer/cart.actions";
import { getAddresses } from "@/actions/customer/address.actions";
import { CheckoutClient } from "@/components/custom/customer/checkout/checkout-client";
import { redirect } from "next/navigation";

export default async function CheckoutPage() {
  const [cartResult, addressResult] = await Promise.all([
    getActiveCart(),
    getAddresses(),
  ]);

  const cart = cartResult && !("error" in cartResult) ? cartResult : null;
  const addresses =
    addressResult && !("error" in addressResult) ? addressResult : [];

  if (!cart || !cart.items.length) redirect("/cart");

  return <CheckoutClient cart={cart} addresses={addresses} />;
}
