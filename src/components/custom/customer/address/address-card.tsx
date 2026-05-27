"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Address } from "../customer-types";
import {
  Edit3,
  Home,
  Briefcase,
  MapPin,
  Star,
  Trash2,
} from "lucide-react";

type AddressCardProps = {
  address: Address;
  selected?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onSetDefault?: () => void;
  onSelect?: () => void;
  disabled?: boolean;
  selectable?: boolean;
};

const labelIcons: Record<string, React.ReactNode> = {
  Home: <Home className="size-3.5" />,
  Work: <Briefcase className="size-3.5" />,
};

export function AddressCard({
  address,
  selected,
  onEdit,
  onDelete,
  onSetDefault,
  onSelect,
  disabled,
  selectable,
}: AddressCardProps) {
  const Wrapper = selectable ? "button" : "div";

  return (
    <Wrapper
      type={selectable ? "button" : undefined}
      onClick={selectable ? onSelect : undefined}
      className={cn(
        "relative flex flex-col gap-3 rounded-2xl border p-4 text-left transition-all duration-200",
        selectable && "cursor-pointer",
        selected
          ? "border-orange-500 bg-orange-50/80 ring-2 ring-orange-500/20 dark:bg-orange-950/20"
          : "border-white/80 bg-white shadow-sm hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950",
        disabled && "pointer-events-none opacity-50"
      )}
    >
      {/* Top row: label + default badge */}
      <div className="flex items-center gap-2">
        {address.label ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-100 px-2.5 py-1 text-xs font-bold text-orange-700 dark:bg-orange-950/40 dark:text-orange-400">
            {labelIcons[address.label] ?? <MapPin className="size-3.5" />}
            {address.label}
          </span>
        ) : null}
        {address.isDefault ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
            <Star className="size-3 fill-current" />
            Default
          </span>
        ) : null}
        {selected ? (
          <span className="ml-auto inline-flex size-5 items-center justify-center rounded-full bg-orange-600 text-white">
            <svg viewBox="0 0 12 12" className="size-3" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M2 6l3 3 5-5" />
            </svg>
          </span>
        ) : null}
      </div>

      {/* Name and phone */}
      <div>
        <p className="font-bold text-zinc-950 dark:text-zinc-50">
          {address.fullName}
        </p>
        <p className="text-sm text-zinc-500">{address.phone}</p>
      </div>

      {/* Address text */}
      <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
        {address.addressLine1}
        {address.addressLine2 ? `, ${address.addressLine2}` : ""}
        <br />
        {address.city}, {address.state} - {address.postalCode}
      </p>

      {/* Actions */}
      {(onEdit || onDelete || onSetDefault) && !selectable ? (
        <div className="flex items-center gap-2 border-t border-zinc-100 pt-3 dark:border-zinc-800">
          {onEdit ? (
            <Button
              variant="outline"
              size="sm"
              onClick={onEdit}
              disabled={disabled}
              className="rounded-full text-xs"
            >
              <Edit3 className="size-3.5" />
              Edit
            </Button>
          ) : null}
          {onSetDefault && !address.isDefault ? (
            <Button
              variant="outline"
              size="sm"
              onClick={onSetDefault}
              disabled={disabled}
              className="rounded-full text-xs"
            >
              <Star className="size-3.5" />
              Set Default
            </Button>
          ) : null}
          {onDelete ? (
            <Button
              variant="outline"
              size="sm"
              onClick={onDelete}
              disabled={disabled}
              className="ml-auto rounded-full text-xs text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400"
            >
              <Trash2 className="size-3.5" />
              Delete
            </Button>
          ) : null}
        </div>
      ) : null}
    </Wrapper>
  );
}
