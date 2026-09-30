"use client";

import { Search, X } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQueryParams } from "@/hooks/use-query-params";
import { cn } from "@/lib/utils";

/**
 * Search box wired to the URL, debounced.
 *
 * Every keystroke writing to the address bar would flood the history and fire
 * a request per character; waiting for a pause does neither. The input keeps
 * its own value meanwhile so typing never feels laggy.
 */
export function SearchFilter({
  paramKey = "search",
  placeholder = "Search…",
  className,
}: {
  paramKey?: string;
  placeholder?: string;
  className?: string;
}) {
  const { get, setParams } = useQueryParams();
  const fromUrl = get(paramKey);
  const [value, setValue] = useState(fromUrl);
  const [seenInUrl, setSeenInUrl] = useState(fromUrl);

  // Follow the URL when it changes from somewhere else — Clear filters, the
  // back button — without fighting what is being typed. Adjusting during
  // render rather than in an effect is React's own recommendation for this:
  // it re-renders before the browser paints, so no stale frame is shown.
  if (fromUrl !== seenInUrl) {
    setSeenInUrl(fromUrl);
    setValue(fromUrl);
  }

  useEffect(() => {
    if (value === fromUrl) return;
    const timer = setTimeout(() => setParams({ [paramKey]: value }), 350);
    return () => clearTimeout(timer);
  }, [value, fromUrl, paramKey, setParams]);

  return (
    <div className={cn("relative w-full sm:max-w-xs", className)}>
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="pl-9"
      />
    </div>
  );
}

export interface FilterOption {
  value: string;
  label: string;
}

/** A dropdown filter that lives in the URL. */
export function SelectFilter({
  paramKey,
  label,
  options,
  allLabel = "All",
  className,
}: {
  paramKey: string;
  label: string;
  options: FilterOption[];
  allLabel?: string;
  className?: string;
}) {
  const { get, setParams } = useQueryParams();
  const current = get(paramKey);

  return (
    <Select
      value={current || "__all__"}
      onValueChange={(next) => setParams({ [paramKey]: next === "__all__" ? null : next })}
    >
      <SelectTrigger className={cn("w-full sm:w-44", className)} aria-label={label}>
        <SelectValue placeholder={label} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="__all__">{allLabel}</SelectItem>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

/** Appears only once something is filtered, so it is never dead weight. */
export function ClearFilters({ className }: { className?: string }) {
  const { hasFilters, clearAll } = useQueryParams();
  if (!hasFilters) return null;

  return (
    <Button variant="ghost" onClick={clearAll} className={cn("gap-1.5", className)}>
      <X className="size-4" />
      Clear filters
    </Button>
  );
}

/** The row the three sit in — wraps on a phone rather than scrolling sideways. */
export function FilterBar({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">{children}</div>;
}
