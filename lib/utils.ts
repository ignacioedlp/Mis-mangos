import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats a number as Argentine Peso (ARS) currency
 * @param amount - The amount to format
 * @param options - Optional formatting options
 * @returns Formatted currency string (e.g., "$12.345,67 ARS")
 */
export function formatCurrency(
  amount: number, 
  options: {
    showCurrency?: boolean;
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
  } = {}
): string {
  const {
    showCurrency = true,
    minimumFractionDigits = 2,
    maximumFractionDigits = 2
  } = options;

  const formatter = new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits,
    maximumFractionDigits,
  });

  const formatted = formatter.format(amount);
  
  // If we don't want to show the currency symbol, remove it
  if (!showCurrency) {
    return formatted.replace(/\s?ARS$/, '').replace(/^\$\s?/, '');
  }
  
  return formatted;
}

/**
 * Formats a number as Argentine Peso without currency symbol
 * @param amount - The amount to format
 * @returns Formatted number string (e.g., "12.345,67")
 */
export function formatNumber(amount: number): string {
  return new Intl.NumberFormat('es-AR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Formats a percentage value
 * @param percentage - The percentage to format (0-100)
 * @returns Formatted percentage string (e.g., "85,5%")
 */
export function formatPercentage(percentage: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(percentage / 100);
}
