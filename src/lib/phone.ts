export function normalizeEgyptPhone(input: string): string | null {
  let digits = input.replace(/[^\d]/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (digits.startsWith("20") && digits.length === 12) digits = digits.slice(2);
  if (digits.startsWith("0")) digits = digits.slice(1);
  if (!/^1[0125]\d{8}$/.test(digits)) return null;
  return `20${digits}`;
}

export function displayEgyptPhone(normalized: string) {
  if (normalized.startsWith("20") && normalized.length === 12) return `0${normalized.slice(2)}`;
  return normalized;
}

export function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}
