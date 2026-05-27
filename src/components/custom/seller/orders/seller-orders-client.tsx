"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { VegMark } from "../../customer/common/customer-ui";
import { Order, OrderStatus, INR_FORMATTER } from "../../customer/customer-types";
import { getMine } from "@/actions/seller/seller.actions";
import { updateOrderStatus } from "@/actions/seller/order.actions";
import { useSocket } from "@/hooks/use-socket";
import { toast } from "sonner";
import {
  Wifi,
  WifiOff,
  ChefHat,
  CheckCircle2,
  XCircle,
  Truck,
  Package,
  Clock,
  Loader2,
  ShoppingBag,
  Bell,
} from "lucide-react";

type FilterTab = "all" | "new" | "in_progress" | "completed";

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  PENDING_PAYMENT: { label: "Awaiting Payment", color: "bg-amber-100 text-amber-800", icon: Clock },
  PAYMENT_FAILED: { label: "Payment Failed", color: "bg-red-100 text-red-800", icon: XCircle },
  PLACED: { label: "New Order", color: "bg-blue-100 text-blue-800", icon: Bell },
  CONFIRMED: { label: "Confirmed", color: "bg-indigo-100 text-indigo-800", icon: CheckCircle2 },
  PREPARING: { label: "Preparing", color: "bg-amber-100 text-amber-800", icon: ChefHat },
  READY_FOR_PICKUP: { label: "Ready", color: "bg-emerald-100 text-emerald-800", icon: Package },
  OUT_FOR_DELIVERY: { label: "On the way", color: "bg-cyan-100 text-cyan-800", icon: Truck },
  DELIVERED: { label: "Delivered", color: "bg-emerald-100 text-emerald-700", icon: CheckCircle2 },
  CANCELLED: { label: "Cancelled", color: "bg-red-100 text-red-700", icon: XCircle },
  REFUNDED: { label: "Refunded", color: "bg-zinc-100 text-zinc-700", icon: XCircle },
};

const NEXT_STATUS: Record<string, string> = {
  PLACED: "CONFIRMED",
  CONFIRMED: "PREPARING",
  PREPARING: "READY_FOR_PICKUP",
  READY_FOR_PICKUP: "OUT_FOR_DELIVERY",
  OUT_FOR_DELIVERY: "DELIVERED",
};

const NEXT_STATUS_LABEL: Record<string, string> = {
  PLACED: "Accept Order",
  CONFIRMED: "Start Preparing",
  PREPARING: "Mark Ready",
  READY_FOR_PICKUP: "Out for Delivery",
  OUT_FOR_DELIVERY: "Mark Delivered",
};

export function SellerOrdersClient({
  initialOrders,
  user,
}: {
  initialOrders: Order[];
  user: { id: string; name?: string; role?: string };
}) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [filter, setFilter] = useState<FilterTab>("all");
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [newOrderIds, setNewOrderIds] = useState<Set<string>>(new Set());
  const audioRef = useRef<AudioContext | null>(null);

  // Fetch restaurant ID
  useEffect(() => {
    getMine().then((res) => {
      if (res && !("error" in res)) {
        setRestaurantId(res.id);
      }
    });
  }, []);

  const { isConnected, on } = useSocket("/orders", "restaurant", restaurantId);

  // Play notification sound
  const playNotificationSound = useCallback(() => {
    try {
      if (!audioRef.current) audioRef.current = new AudioContext();
      const ctx = audioRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.5);
    } catch {}
  }, []);

  // Listen for new orders
  useEffect(() => {
    const cleanup1 = on("NEW_ORDER", (newOrder: Order) => {
      setOrders((prev) => [newOrder, ...prev.filter((o) => o.id !== newOrder.id)]);
      setNewOrderIds((prev) => new Set(prev).add(newOrder.id));
      playNotificationSound();
      toast.success("🔔 New order received!", { duration: 5000 });
      setTimeout(() => setNewOrderIds((prev) => { const next = new Set(prev); next.delete(newOrder.id); return next; }), 5000);
    });

    const cleanup2 = on("ORDER_STATUS_UPDATED", (updated: Order) => {
      setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
    });

    const cleanup3 = on("ORDER_CANCELLED", ({ orderId }: { orderId: string }) => {
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: "CANCELLED" as OrderStatus } : o))
      );
      toast.info("Order cancelled");
    });

    return () => { cleanup1(); cleanup2(); cleanup3(); };
  }, [on, playNotificationSound]);

  const handleStatusUpdate = useCallback(async (orderId: string, newStatus: string) => {
    setUpdatingOrderId(orderId);
    try {
      const result = await updateOrderStatus(orderId, newStatus);
      if (result && "error" in result) {
        toast.error(result.error);
      } else if (result) {
        setOrders((prev) => prev.map((o) => (o.id === orderId ? result : o)));
        toast.success(`Order updated to ${STATUS_CONFIG[newStatus]?.label}`);
      }
    } finally {
      setUpdatingOrderId(null);
    }
  }, []);

  const filteredOrders = orders.filter((order) => {
    if (filter === "new") return order.status === "PLACED";
    if (filter === "in_progress") return ["CONFIRMED", "PREPARING", "READY_FOR_PICKUP", "OUT_FOR_DELIVERY"].includes(order.status);
    if (filter === "completed") return ["DELIVERED", "CANCELLED", "REFUNDED"].includes(order.status);
    return true;
  });

  const newCount = orders.filter((o) => o.status === "PLACED").length;
  const activeCount = orders.filter((o) => ["CONFIRMED", "PREPARING", "READY_FOR_PICKUP", "OUT_FOR_DELIVERY"].includes(o.status)).length;

  return (
    <div className="mx-auto max-w-4xl pb-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-zinc-950 dark:text-zinc-50">Orders</h1>
          <p className="mt-1 text-sm text-zinc-500">Manage incoming orders in real-time</p>
        </div>
        <div className="flex items-center gap-2">
          {isConnected ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">
              <Wifi className="size-3" /> Live
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-800 dark:bg-red-900/30 dark:text-red-300">
              <WifiOff className="size-3" /> Disconnected
            </span>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="mb-6 flex gap-2 overflow-x-auto">
        {([
          { key: "all", label: "All" },
          { key: "new", label: `New (${newCount})` },
          { key: "in_progress", label: `In Progress (${activeCount})` },
          { key: "completed", label: "Completed" },
        ] as { key: FilterTab; label: string }[]).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={cn(
              "shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-all",
              filter === tab.key
                ? "bg-zinc-950 text-white dark:bg-white dark:text-zinc-950"
                : "bg-white text-zinc-600 hover:bg-zinc-100 dark:bg-zinc-900 dark:text-zinc-300"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Orders List */}
      <div className="space-y-3">
        {filteredOrders.map((order) => {
          const isNew = newOrderIds.has(order.id);
          const status = STATUS_CONFIG[order.status] || STATUS_CONFIG.PLACED;
          const StatusIcon = status.icon;
          const nextStatus = NEXT_STATUS[order.status];
          const nextLabel = NEXT_STATUS_LABEL[order.status];
          const date = new Date(order.createdAt);
          const isUpdating = updatingOrderId === order.id;

          return (
            <div
              key={order.id}
              className={cn(
                "rounded-2xl border bg-white p-5 shadow-sm transition-all dark:bg-zinc-950",
                isNew
                  ? "animate-pulse border-orange-300 ring-2 ring-orange-200 dark:border-orange-700 dark:ring-orange-900"
                  : "border-white/80 dark:border-zinc-800"
              )}
            >
              {/* Order Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="size-4 text-orange-600" />
                    <span className="font-mono text-xs text-zinc-400">#{order.id.slice(0, 8)}</span>
                  </div>
                  <p className="mt-1 text-sm font-bold text-zinc-900 dark:text-zinc-100">
                    {order.deliveryFullName}
                  </p>
                  <p className="text-xs text-zinc-400">
                    {date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                    {" · "}
                    {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold", status.color)}>
                    <StatusIcon className="size-3" />
                    {status.label}
                  </span>
                  <span className="text-lg font-black text-zinc-900 dark:text-zinc-100">
                    {INR_FORMATTER.format(order.totalAmount)}
                  </span>
                </div>
              </div>

              {/* Items Summary */}
              <div className="mt-3 border-t border-zinc-100 pt-3 dark:border-zinc-800">
                <div className="flex flex-wrap gap-2">
                  {order.items.map((item) => (
                    <span
                      key={item.id}
                      className="inline-flex items-center gap-1 rounded-lg bg-zinc-50 px-2 py-1 text-xs font-medium text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
                    >
                      <VegMark isVeg={item.isVeg} />
                      {item.itemName} ×{item.quantity}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              {nextStatus && (
                <div className="mt-4">
                  <Button
                    onClick={() => handleStatusUpdate(order.id, nextStatus)}
                    disabled={isUpdating}
                    className="w-full rounded-xl bg-orange-600 font-bold text-white hover:bg-orange-700"
                  >
                    {isUpdating ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
                    {nextLabel}
                  </Button>
                </div>
              )}
            </div>
          );
        })}

        {filteredOrders.length === 0 && (
          <div className="rounded-2xl bg-white p-12 text-center dark:bg-zinc-950">
            <ShoppingBag className="mx-auto size-12 text-zinc-200 dark:text-zinc-700" />
            <p className="mt-3 font-bold text-zinc-500">No orders here</p>
            <p className="text-sm text-zinc-400">Orders will appear here in real-time</p>
          </div>
        )}
      </div>
    </div>
  );
}
