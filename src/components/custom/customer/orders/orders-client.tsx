"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { EmptyState } from "../common/customer-ui";
import { Order, OrderStatus, INR_FORMATTER } from "../customer-types";
import {
  Clock,
  ChefHat,
  CheckCircle2,
  XCircle,
  Truck,
  Package,
  CreditCard,
  ShoppingBag,
  ChevronRight,
  AlertTriangle,
} from "lucide-react";

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; icon: React.ElementType }> = {
  PENDING_PAYMENT: { label: "Awaiting Payment", color: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300", icon: CreditCard },
  PAYMENT_FAILED: { label: "Payment Failed", color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300", icon: XCircle },
  PLACED: { label: "Order Placed", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300", icon: CheckCircle2 },
  CONFIRMED: { label: "Confirmed", color: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300", icon: CheckCircle2 },
  PREPARING: { label: "Preparing", color: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300", icon: ChefHat },
  READY_FOR_PICKUP: { label: "Ready", color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300", icon: Package },
  OUT_FOR_DELIVERY: { label: "On the way", color: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300", icon: Truck },
  DELIVERED: { label: "Delivered", color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300", icon: CheckCircle2 },
  CANCELLED: { label: "Cancelled", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300", icon: XCircle },
  REFUNDED: { label: "Refunded", color: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300", icon: CreditCard },
};

export function OrdersClient({ initialOrders }: { initialOrders: Order[] }) {
  const [filter, setFilter] = useState<"all" | "active" | "past">("all");

  const filteredOrders = initialOrders.filter((order) => {
    if (filter === "active") return !["DELIVERED", "CANCELLED", "REFUNDED", "PAYMENT_FAILED"].includes(order.status);
    if (filter === "past") return ["DELIVERED", "CANCELLED", "REFUNDED", "PAYMENT_FAILED"].includes(order.status);
    return true;
  });

  if (initialOrders.length === 0) {
    return (
      <EmptyState
        title="No orders yet"
        description="When you place your first order, it will appear here."
        action={
          <Button asChild className="rounded-full bg-orange-600 px-5 text-white hover:bg-orange-700">
            <Link href="/home">Browse restaurants</Link>
          </Button>
        }
      />
    );
  }

  return (
    <div className="mx-auto max-w-3xl pb-8">
      <h1 className="mb-6 text-2xl font-black text-zinc-950 dark:text-zinc-50">
        Your Orders
      </h1>

      <div className="mb-6 flex gap-2">
        {(["all", "active", "past"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-semibold capitalize transition-all",
              filter === tab
                ? "bg-zinc-950 text-white dark:bg-white dark:text-zinc-950"
                : "bg-white text-zinc-600 hover:bg-zinc-100 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filteredOrders.map((order) => (
          <OrderCard key={order.id} order={order} />
        ))}
        {filteredOrders.length === 0 && (
          <div className="rounded-2xl bg-white p-8 text-center dark:bg-zinc-950">
            <p className="text-sm text-zinc-500">No orders in this category</p>
          </div>
        )}
      </div>
    </div>
  );
}

function OrderCard({ order }: { order: Order }) {
  const status = STATUS_CONFIG[order.status];
  const StatusIcon = status.icon;
  const date = new Date(order.createdAt);

  return (
    <Link
      href={`/orders/${order.id}`}
      className="group block rounded-2xl border border-white/80 bg-white p-4 shadow-sm transition-all hover:shadow-md hover:border-orange-200 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700 sm:p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <ShoppingBag className="size-4 text-orange-600" />
            <h3 className="truncate font-bold text-zinc-950 dark:text-zinc-50">
              {order.restaurantName}
            </h3>
          </div>
          <p className="mt-1 text-xs text-zinc-400">
            {date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
            {" · "}
            {date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold", status.color)}>
            <StatusIcon className="size-3" />
            {status.label}
          </span>
          <ChevronRight className="size-4 text-zinc-400 transition-transform group-hover:translate-x-0.5" />
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-zinc-100 pt-3 dark:border-zinc-800">
        <span className="text-sm text-zinc-500">
          {order.items.length} item{order.items.length !== 1 ? "s" : ""}
        </span>
        <span className="font-bold text-zinc-950 dark:text-zinc-50">
          {INR_FORMATTER.format(order.totalAmount)}
        </span>
      </div>
    </Link>
  );
}

export { STATUS_CONFIG };
