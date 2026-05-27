"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ShieldCheck, CreditCard } from "lucide-react";

type PaymentHandlerProps = {
  orderId: string;
  paymentDetails: {
    provider: string;
    providerOrderId: string;
    amount: number;
    currency: string;
    key?: string;
    clientSecret?: string;
  };
};

export function PaymentHandler({ orderId, paymentDetails }: PaymentHandlerProps) {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "processing" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (paymentDetails.provider === "RAZORPAY") {
      loadRazorpay();
    } else if (paymentDetails.provider === "STRIPE") {
      loadStripe();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadRazorpay() {
    // Check if script already loaded
    if (!window.Razorpay) {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;

      await new Promise<void>((resolve, reject) => {
        script.onload = () => resolve();
        script.onerror = () => reject(new Error("Failed to load Razorpay SDK"));
        document.body.appendChild(script);
      }).catch(() => {
        setStatus("error");
        setErrorMsg("Failed to load payment gateway. Please try again.");
        return;
      });
    }

    if (!window.Razorpay) {
      setStatus("error");
      setErrorMsg("Payment gateway unavailable.");
      return;
    }

    setStatus("processing");

    const options = {
      key: paymentDetails.key || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "",
      amount: paymentDetails.amount,
      currency: paymentDetails.currency,
      order_id: paymentDetails.providerOrderId,
      name: "CraveHub",
      description: "Food Order Payment",
      theme: { color: "#ea580c" },
      handler: () => {
        // Frontend callback — backend webhook decides actual success
        router.push(`/orders/${orderId}?status=verifying`);
      },
      modal: {
        ondismiss: () => {
          setStatus("error");
          setErrorMsg("Payment was cancelled. You can retry from your orders page.");
        },
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  }

  async function loadStripe() {
    try {
      setStatus("processing");

      const { loadStripe: loadStripeFn } = await import("@stripe/stripe-js");
      const stripe = await loadStripeFn(
        process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ""
      );

      if (!stripe || !paymentDetails.clientSecret) {
        setStatus("error");
        setErrorMsg("Failed to initialize Stripe. Please try again.");
        return;
      }

      const { error } = await stripe.confirmPayment({
        clientSecret: paymentDetails.clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/orders/${orderId}?status=verifying`,
        },
      });

      if (error) {
        setStatus("error");
        setErrorMsg(error.message || "Payment failed. Please try again.");
      }
    } catch {
      setStatus("error");
      setErrorMsg("Failed to process payment. Please try again.");
    }
  }

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center justify-center py-20">
      <div className="w-full rounded-2xl border border-white/80 bg-white p-8 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        {status === "loading" ? (
          <>
            <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-orange-100 dark:bg-orange-950/40">
              <Loader2 className="size-8 animate-spin text-orange-600" />
            </div>
            <h2 className="text-xl font-black text-zinc-950 dark:text-zinc-50">
              Loading Payment
            </h2>
            <p className="mt-2 text-sm text-zinc-500">
              Initializing secure payment gateway...
            </p>
          </>
        ) : status === "processing" ? (
          <>
            <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-orange-100 dark:bg-orange-950/40">
              <ShieldCheck className="size-8 text-orange-600" />
            </div>
            <h2 className="text-xl font-black text-zinc-950 dark:text-zinc-50">
              Complete Payment
            </h2>
            <p className="mt-2 text-sm text-zinc-500">
              Complete the payment in the popup window. Do not close this page.
            </p>
            <div className="mt-6 flex items-center justify-center gap-2 text-sm font-semibold text-orange-600">
              <CreditCard className="size-4" />
              {paymentDetails.provider === "RAZORPAY" ? "Razorpay" : "Stripe"} Secure Checkout
            </div>
          </>
        ) : (
          <>
            <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-red-100 dark:bg-red-950/40">
              <CreditCard className="size-8 text-red-600" />
            </div>
            <h2 className="text-xl font-black text-zinc-950 dark:text-zinc-50">
              Payment Issue
            </h2>
            <p className="mt-2 text-sm text-zinc-500">{errorMsg}</p>
            <div className="mt-6 flex justify-center gap-3">
              <button
                onClick={() => router.push(`/orders/${orderId}`)}
                className="rounded-full border border-zinc-200 px-5 py-2.5 text-sm font-bold text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300"
              >
                View Order
              </button>
              <button
                onClick={() => {
                  setStatus("loading");
                  setErrorMsg("");
                  if (paymentDetails.provider === "RAZORPAY") {
                    loadRazorpay();
                  } else {
                    loadStripe();
                  }
                }}
                className="rounded-full bg-orange-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-orange-700"
              >
                Retry Payment
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
