/**
 * Format a number as currency string: $96,228.00
 */
export function formatCurrency(value) {
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "$0.00";
  return "$" + num.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Parse a currency string back to a number
 */
export function parseCurrency(str) {
  if (typeof str === "number") return str;
  const cleaned = String(str).replace(/[^0-9.\-]/g, "");
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}
