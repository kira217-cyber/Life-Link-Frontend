import { format, formatDistanceToNowStrict, isValid, parseISO } from "date-fns";

/** Parses an API date string, tolerating the nulls the contract allows. */
function toDate(value: string | Date | null | undefined): Date | null {
  if (!value) return null;
  const date = typeof value === "string" ? parseISO(value) : value;
  return isValid(date) ? date : null;
}

export function formatDate(value: string | Date | null | undefined, fallback = "—"): string {
  const date = toDate(value);
  return date ? format(date, "d MMM yyyy") : fallback;
}

export function formatDateTime(value: string | Date | null | undefined, fallback = "—"): string {
  const date = toDate(value);
  return date ? format(date, "d MMM yyyy, h:mm a") : fallback;
}

/** "3 days ago" / "in 2 hours" — used wherever recency matters more than the date. */
export function formatRelative(value: string | Date | null | undefined, fallback = "—"): string {
  const date = toDate(value);
  if (!date) return fallback;
  return formatDistanceToNowStrict(date, { addSuffix: true });
}

/**
 * Money arrives in the smallest currency unit. Dividing happens here and
 * nowhere else, so no arithmetic upstream ever touches a fractional amount.
 */
export function formatMoney(minorUnits: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
    minimumFractionDigits: 2,
  }).format(minorUnits / 100);
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}

export function formatDistanceKm(km: number | null | undefined): string {
  if (km === null || km === undefined) return "Distance unknown";
  return km < 1 ? "Under 1 km away" : `${km.toFixed(1)} km away`;
}

/** Initials for an avatar fallback, capped at two letters. */
export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

/** Masks a phone number down to its last three digits. */
export function maskPhone(phone: string | null | undefined): string {
  if (!phone) return "—";
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 4) return "•••";
  return `${"•".repeat(Math.max(3, digits.length - 3))}${digits.slice(-3)}`;
}

export function pluralise(count: number, singular: string, plural = `${singular}s`): string {
  return `${count} ${count === 1 ? singular : plural}`;
}
