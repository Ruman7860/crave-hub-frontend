"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, MapPin, RefreshCw } from "lucide-react";
import { LocationState } from "@/atoms/location.atom";

type NavbarLocationDropdownProps = {
  location: LocationState;
  isRefreshing: boolean;
  onRefresh: () => Promise<void> | void;
  buttonClassName?: string;
  dropdownClassName?: string;
  textClassName?: string;
  iconClassName?: string;
};

export function NavbarLocationDropdown({
  location,
  isRefreshing,
  onRefresh,
  buttonClassName,
  dropdownClassName,
  textClassName,
  iconClassName,
}: NavbarLocationDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={
          buttonClassName ??
          "flex h-11 shrink-0 items-center gap-1 border-r border-gray-200 bg-gray-100/30 pl-3 pr-2 text-gray-500 transition-colors hover:bg-gray-200/40 dark:border-gray-700"
        }
      >
        <MapPin className={iconClassName ?? "h-4 w-4 shrink-0 text-orange-600"} />
        <span className={textClassName ?? "max-w-25 truncate text-sm font-medium"}>
          {location.city ?? "Locating..."}
        </span>
        <ChevronDown
          className={`h-3 w-3 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div
          className={
            dropdownClassName ??
            "absolute left-0 top-full z-60 mt-2 w-72 rounded-xl border border-gray-100 bg-white p-4 shadow-xl dark:border-gray-800 dark:bg-zinc-900"
          }
        >
          <div className="mb-3 flex items-start justify-between gap-2">
            <div className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-orange-600" />
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {location.city ?? "Unknown"}
                </p>
                <p className="mt-0.5 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
                  {location.address ?? "No address available"}
                </p>
              </div>
            </div>
          </div>

          {location.cachedAt && (
            <p className="mb-3 text-[11px] text-gray-400">
              Updated {getRelativeTime(location.cachedAt)}
            </p>
          )}

          <button
            type="button"
            onClick={() => {
              onRefresh();
              setIsOpen(false);
            }}
            disabled={isRefreshing}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-orange-50 px-3 py-2 text-sm font-medium text-orange-600 transition-colors hover:bg-orange-100 disabled:opacity-50 dark:bg-orange-950/30 dark:hover:bg-orange-950/50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
            {isRefreshing ? "Detecting location..." : "Refresh location"}
          </button>
        </div>
      )}
    </div>
  );
}

type MobileLocationStripProps = {
  location: LocationState;
  isRefreshing: boolean;
  onRefresh: () => Promise<void> | void;
  className?: string;
};

export function MobileLocationStrip({
  location,
  isRefreshing,
  onRefresh,
  className,
}: MobileLocationStripProps) {
  return (
    <div className={className ?? "flex items-center justify-between px-1"}>
      <div className="flex items-center gap-2">
        <MapPin className="h-4 w-4 text-orange-600" />
        <div>
          <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
            {location.city ?? "Locating..."}
          </p>
          <p className="max-w-55 truncate text-xs text-gray-400">
            {location.address ?? ""}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onRefresh}
        aria-label="Refresh location"
        disabled={isRefreshing}
        className="rounded-lg p-1.5 text-orange-600 transition-colors hover:bg-orange-50 dark:hover:bg-orange-950/30"
      >
        <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
      </button>
    </div>
  );
}

function getRelativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);

  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  return `${Math.floor(hours / 24)}d ago`;
}
