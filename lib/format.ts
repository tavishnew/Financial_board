const CURRENCY_SYMBOLS: Record<string, string> = {
  INR: "₹",
  USD: "$",
  EUR: "€",
  GBP: "£",
};

export function currencySymbol(code: string): string {
  return CURRENCY_SYMBOLS[code] ?? code + " ";
}

export function formatMoney(amount: number, currency = "INR", opts?: { signed?: boolean }): string {
  const sym = currencySymbol(currency);
  const abs = Math.abs(amount);
  const formatted = abs.toLocaleString("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  if (opts?.signed) {
    const sign = amount < 0 ? "−" : amount > 0 ? "+" : "";
    return `${sign}${sym}${formatted}`;
  }
  return `${sym}${formatted}`;
}

export function formatCompact(amount: number, currency = "INR"): string {
  const sym = currencySymbol(currency);
  const formatted = Math.abs(amount).toLocaleString("en-IN", {
    notation: "compact",
    maximumFractionDigits: 1,
  });
  return `${sym}${formatted}`;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatDay(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

export function monthKey(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function monthLabel(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", { month: "short", year: "2-digit" });
}

export function relativeDay(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diff = Math.floor((now.setHours(0, 0, 0, 0) - new Date(d).setHours(0, 0, 0, 0)) / 86400000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  if (diff > 1 && diff < 7) return `${diff}d ago`;
  return formatDay(iso);
}

export function pct(part: number, whole: number): number {
  if (whole === 0) return 0;
  return Math.min(100, Math.round((part / whole) * 100));
}
