import { getMe } from "@/actions/auth/auth.actions";
import { getOrders } from "@/actions/customer/order.actions";
import { getRestaurantOrders } from "@/actions/seller/order.actions";
import { OrdersClient } from "@/components/custom/customer/orders/orders-client";
import { SellerOrdersClient } from "@/components/custom/seller/orders/seller-orders-client";
import { redirect } from "next/navigation";

export default async function OrdersPage() {
  const user = await getMe();
  if (user.error) redirect("/login");

  if (user.role === "SELLER") {
    const result = await getRestaurantOrders();
    const orders = result && !("error" in result) ? result.orders : [];
    return <SellerOrdersClient initialOrders={orders} user={user} />;
  }

  const result = await getOrders();
  const orders = result && !("error" in result) ? result.orders : [];
  return <OrdersClient initialOrders={orders} />;
}
