export function formatMoney(
  amount: number,
  currency?: string,
  options?: { signed?: boolean }
): string {
  const ccy = currency ?? "INR";
  const signed = options?.signed ?? false;
  
  const prefix = signed && amount > 0 ? "+" : "";
  const formattedAmount = Math.abs(amount);
  
  try {
    return prefix + new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: ccy,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(formattedAmount);
  } catch {
    return prefix + new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(formattedAmount);
  }
}

export function pct(numerator: number, denominator: number): number {
  if (denominator === 0) return 0;
  return Math.round((numerator / denominator) * 100);
}

export function formatDate(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function formatDay(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

export function formatCompact(amount: number, _currency?: string): string {
  if (amount >= 1_000_000) return (amount / 1_000_000).toFixed(1) + "M";
  if (amount >= 1_000) return (amount / 1_000).toFixed(1) + "K";
  return amount.toString();
}

export function relativeDay(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diff = d.getTime() - now.getTime();
  const days = Math.round(diff / (1000 * 60 * 60 * 24));
  
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  if (days === -1) return "Yesterday";
  if (days > 0) return `In ${days} days`;
  return `${Math.abs(days)} days ago`;
}

export function monthKey(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}