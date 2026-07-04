import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number, currency = "Bs."): string {
  return new Intl.NumberFormat("es-BO", {
    style: "currency",
    currency: currency === "Bs." ? "BOB" : "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value).replace("BOB", currency).replace("USD", currency)
}

export function formatNumber(value: number, decimals = 2): string {
  return new Intl.NumberFormat("es-BO", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value)
}

export function parseNumber(value: string): number {
  return parseFloat(value.replace(/[^0-9.-]/g, "")) || 0
}

export function roundTo(value: number, decimals = 2): number {
  const factor = Math.pow(10, decimals)
  return Math.round(value * factor) / factor
}

export function ceilTo(value: number, decimals = 0): number {
  const factor = Math.pow(10, decimals)
  return Math.ceil(value * factor) / factor
}