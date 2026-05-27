"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { VegMark } from "../common/customer-ui";
import { Order, OrderStatus, INR_FORMATTER } from "../customer-types";
import { STATUS_CONFIG } from "./orders-client";
import { cancelOrder } from "@/actions/customer/order.actions";
import { useSocket } from "@/hooks/use-socket";
import { toast } from "sonner";
import {
  ArrowLeft,
  MapPin,
  Phone,
  Store,
  Loader2,
  ShieldCheck,
  Clock,
} from "lucide-react";

const STATUS_STEPS: OrderStatus[] = [
  "PLACED",
  "CONFIRMED",
  "PREPARING",
  "READY_FOR_PICKUP",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
];

export function OrderDetailClient({ order: initialOrder }: { order: Order }) {
  const [order, setOrder] = useState(initialOrder);
  const [isCancelling, setIsCancelling] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const isVerifying = searchParams.get("status") === "verifying";

  const { on } = useSocket("/orders", "user", order.userId);

  useEffect(() => {
    const cleanup = on("ORDER_STATUS_UPDATED", (updatedOrder: Order) => {
      if (updatedOrder.id === order.id) {
        setOrder(updatedOrder);
        toast.success(`Order status updated to ${STATUS_CONFIG[updatedOrder.status]?.label}`);
      }
    });
    return cleanup;
  }, [on, order.id]);

  const handleCancel = useCallback(async () => {
    setIsCancelling(true);
    try {
      const result = await cancelOrder(order.id);
      if (result && "error" in result) {
        toast.error(result.error);
      } else {
        toast.success("Order cancelled");
        setOrder((prev) => ({ ...prev, status: "CANCELLED", paymentStatus: prev.paymentStatus }));
      }
    } finally {
      setIsCancelling(false);
    }
  }, [order.id]);

  const canCancel = order.status === "PENDING_PAYMENT" || order.status === "PLACED";
  const status = STATUS_CONFIG[order.status];
  const StatusIcon = status.icon;
  const currentStepIndex = STATUS_STEPS.indexOf(order.status);
  const showProgress = currentStepIndex >= 0;

  return (
    <div className="mx-auto max-w-3xl pb-8">
      <button
        onClick={() => router.push("/orders")}
        className="mb-4 flex items-center gap-1 text-sm font-semibold text-zinc-500 transition hover:text-zinc-900 dark:hover:text-zinc-200"
      >
        <ArrowLeft className="size-4" /> Back to orders
      </button>

      {/* Verifying Payment Banner */}
      {isVerifying && order.status === "PENDING_PAYMENT" && (
        <div className="mb-4 flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/30">
          <Loader2 className="size-5 animate-spin text-amber-600" />
          <div>
            <p className="font-bold text-amber-900 dark:text-amber-200">Verifying payment...</p>
            <p className="text-sm text-amber-700 dark:text-amber-400">
              Your payment is being verified. This usually takes a few seconds.
            </p>
          </div>
        </div>
      )}

      {/* Order Header */}
      <div className="rounded-2xl border border-white/80 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-black text-zinc-950 dark:text-zinc-50">Order Details</h1>
            <p className="mt-1 text-xs text-zinc-400 font-mono">#{order.id.slice(0, 8)}</p>
          </div>
          <span className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold", status.color)}>
            <StatusIcon className="size-3.5" />
            {status.label}
          </span>
        </div>

        {/* Progress Stepper */}
        {showProgress && (
          <div className="mt-6">
            <div className="flex items-center justify-between">
              {STATUS_STEPS.map((step, i) => {
                const isCompleted = i <= currentStepIndex;
                const isCurrent = i === currentStepIndex;
                const stepConfig = STATUS_CONFIG[step];
                const Icon = stepConfig.icon;
                return (
                  <div key={step} className="flex flex-1 items-center">
                    <div className="flex flex-col items-center gap-1">
                      <div
                        className={cn(
                          "flex size-8 items-center justify-center rounded-full transition-all",
                          isCompleted
                            ? "bg-emerald-500 text-white"
                            : "bg-zinc-100 text-zinc-400 dark:bg-zinc-800"
                        )}
                      >
                        <Icon className="size-4" />
                      </div>
                      <span
                        className={cn(
                          "hidden text-[10px] font-semibold sm:block",
                          isCurrent ? "text-emerald-600" : "text-zinc-400"
                        )}
                      >
                        {stepConfig.label}
                      </span>
                    </div>
                    {i < STATUS_STEPS.length - 1 && (
                      <div
                        className={cn(
                          "mx-1 h-0.5 flex-1",
                          i < currentStepIndex ? "bg-emerald-500" : "bg-zinc-200 dark:bg-zinc-700"
                        )}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Restaurant Info */}
      <div className="mt-4 rounded-2xl border border-white/80 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <h2 className="flex items-center gap-2 font-bold text-zinc-950 dark:text-zinc-50">
          <Store className="size-4 text-orange-600" /> Restaurant
        </h2>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">{order.restaurantName}</p>
        {order.restaurantPhone && (
          <p className="mt-1 flex items-center gap-1 text-sm text-zinc-400">
            <Phone className="size-3" /> {order.restaurantPhone}
          </p>
        )}
      </div>

      {/* Items */}
      <div className="mt-4 rounded-2xl border border-white/80 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <h2 className="font-bold text-zinc-950 dark:text-zinc-50">Items</h2>
        <div className="mt-3 divide-y divide-zinc-100 dark:divide-zinc-800">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center justify-between gap-3 py-3">
              <div className="flex items-center gap-2 min-w-0">
                <VegMark isVeg={item.isVeg} />
                <span className="truncate text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                  {item.itemName}
                </span>
                <span className="text-xs text-zinc-400">×{item.quantity}</span>
              </div>
              <span className="shrink-0 text-sm font-bold text-zinc-900 dark:text-zinc-100">
                {INR_FORMATTER.format((item.discountedPrice ?? item.price) * item.quantity)}
              </span>
            </div>
          ))}
        </div>

        {/* Bill */}
        <div className="mt-4 space-y-2 border-t border-zinc-100 pt-4 text-sm dark:border-zinc-800">
          <div className="flex justify-between text-zinc-500"><span>Subtotal</span><span className="font-semibold text-zinc-800 dark:text-zinc-200">{INR_FORMATTER.format(order.subtotal)}</span></div>
          {order.discountAmount > 0 && <div className="flex justify-between text-emerald-600"><span>Discount</span><span className="font-semibold">-{INR_FORMATTER.format(order.discountAmount)}</span></div>}
          <div className="flex justify-between text-zinc-500"><span>Delivery Fee</span><span className="font-semibold text-zinc-800 dark:text-zinc-200">{order.deliveryFee === 0 ? "FREE" : INR_FORMATTER.format(order.deliveryFee)}</span></div>
          <div className="flex justify-between text-zinc-500"><span>Platform Fee</span><span className="font-semibold text-zinc-800 dark:text-zinc-200">{INR_FORMATTER.format(order.platformFee)}</span></div>
          <div className="flex justify-between text-zinc-500"><span>Taxes</span><span className="font-semibold text-zinc-800 dark:text-zinc-200">{INR_FORMATTER.format(order.taxAmount)}</span></div>
          <div className="flex justify-between border-t border-zinc-100 pt-3 text-base font-black dark:border-zinc-800">
            <span>Total</span>
            <span>{INR_FORMATTER.format(order.totalAmount)}</span>
          </div>
        </div>
      </div>

      {/* Delivery Address */}
      <div className="mt-4 rounded-2xl border border-white/80 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <h2 className="flex items-center gap-2 font-bold text-zinc-950 dark:text-zinc-50">
          <MapPin className="size-4 text-orange-600" /> Delivery Address
        </h2>
        <div className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
          <p className="font-semibold">{order.deliveryFullName}</p>
          <p>{order.deliveryAddressLine1}</p>
          {order.deliveryAddressLine2 && <p>{order.deliveryAddressLine2}</p>}
          <p>{order.deliveryCity}, {order.deliveryState} {order.deliveryPostalCode}</p>
          <p className="mt-1 flex items-center gap-1 text-zinc-400">
            <Phone className="size-3" /> {order.deliveryPhone}
          </p>
        </div>
      </div>

      {/* Payment Info */}
      <div className="mt-4 rounded-2xl border border-white/80 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <h2 className="flex items-center gap-2 font-bold text-zinc-950 dark:text-zinc-50">
          <ShieldCheck className="size-4 text-orange-600" /> Payment
        </h2>
        <div className="mt-2 grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-zinc-400">Method</span>
            <p className="font-semibold text-zinc-800 dark:text-zinc-200">{order.paymentMethod || "—"}</p>
          </div>
          <div>
            <span className="text-zinc-400">Status</span>
            <p className="font-semibold text-zinc-800 dark:text-zinc-200">{order.paymentStatus}</p>
          </div>
          {order.paymentReferenceId && (
            <div className="col-span-2">
              <span className="text-zinc-400">Reference</span>
              <p className="font-mono text-xs text-zinc-600 dark:text-zinc-400">{order.paymentReferenceId}</p>
            </div>
          )}
        </div>
      </div>

      {/* Timestamps */}
      <div className="mt-4 rounded-2xl border border-white/80 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <h2 className="flex items-center gap-2 font-bold text-zinc-950 dark:text-zinc-50">
          <Clock className="size-4 text-orange-600" /> Timeline
        </h2>
        <p className="mt-2 text-sm text-zinc-500">
          Ordered on{" "}
          {new Date(order.createdAt).toLocaleString("en-IN", {
            day: "numeric", month: "long", year: "numeric",
            hour: "2-digit", minute: "2-digit",
          })}
        </p>
      </div>

      {/* Cancel Button */}
      {canCancel && (
        <Button
          variant="outline"
          onClick={handleCancel}
          disabled={isCancelling}
          className="mt-6 w-full rounded-2xl border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-900 dark:hover:bg-red-950/30"
        >
          {isCancelling ? <Loader2 className="size-4 animate-spin" /> : null}
          Cancel Order
        </Button>
      )}
    </div>
  );
}
