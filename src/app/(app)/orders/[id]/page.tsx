import { getOrderById } from "@/actions/customer/order.actions";
import { OrderDetailClient } from "@/components/custom/customer/orders/order-detail-client";
import { redirect } from "next/navigation";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getOrderById(id);

  if (!order || "error" in order) redirect("/orders");

  return <OrderDetailClient order={order} />;
}
