import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function parseAmount(amount: string | number | null | undefined): number {
  if (amount === null || amount === undefined) return 0;
  if (typeof amount === 'number') return amount;
  const parsed = parseFloat(amount.replace(/[^0-9.-]/g, ''));
  return isNaN(parsed) ? 0 : parsed;
}

export function formatAmount(amount: string | number | null | undefined): string {
  const num = parseAmount(amount);
  return `$${num.toFixed(2)}`;
}
