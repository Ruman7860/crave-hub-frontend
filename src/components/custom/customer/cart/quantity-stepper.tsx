"use client";

import { Minus, Plus } from "lucide-react";

export function QuantityStepper({
  quantity,
  onChange,
  disabled,
}: {
  quantity: number;
  onChange: (quantity: number) => void;
  disabled?: boolean;
}) {
  if (quantity <= 0) {
    return (
      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange(1)}
        className="h-9 min-w-24 rounded-xl border border-orange-200 bg-white px-4 text-sm font-black text-orange-600 shadow-sm transition hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        ADD
      </button>
    );
  }

  return (
    <div className="grid h-9 min-w-24 grid-cols-3 overflow-hidden rounded-xl border border-orange-200 bg-white text-orange-600 shadow-sm">
      <button type="button" onClick={() => onChange(quantity - 1)} className="flex items-center justify-center transition hover:bg-orange-50">
        <Minus className="size-4" />
      </button>
      <span className="flex items-center justify-center text-sm font-black">{quantity}</span>
      <button type="button" onClick={() => onChange(quantity + 1)} className="flex items-center justify-center transition hover:bg-orange-50">
        <Plus className="size-4" />
      </button>
    </div>
  );
}
