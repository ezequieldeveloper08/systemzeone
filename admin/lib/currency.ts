/**
 * Formats a numeric value or string of digits to Brazilian Real format: R$ 1.250,00
 */
export function formatCurrencyBRL(value: string | number | undefined | null): string {
  if (value === undefined || value === null || value === "") return ""
  
  // Extract only digits
  const stringValue = typeof value === "number" 
    ? value.toFixed(2).replace(".", "") 
    : String(value).replace(/\D/g, "")
    
  if (!stringValue) return ""
  
  const numericValue = parseFloat(stringValue) / 100
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(numericValue)
}

/**
 * Parses a BRL formatted currency string back to a raw number (ex: "R$ 1.250,00" -> 1250)
 */
export function parseCurrencyBRL(val: string | number | undefined | null): number {
  if (val === undefined || val === null || val === "") return 0
  if (typeof val === "number") return val
  
  const clean = val.replace(/\D/g, "")
  if (!clean) return 0
  
  return parseFloat(clean) / 100
}
