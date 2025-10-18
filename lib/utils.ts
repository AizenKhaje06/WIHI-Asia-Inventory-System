import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatNumber(num: number): string {
  return num.toLocaleString("en-US")
}

export function formatCurrency(num: number): string {
  return `₱${formatNumber(num)}`
}
