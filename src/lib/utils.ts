export function generateId(): string {
  return Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(timestamp: number): string {
  return new Intl.DateTimeFormat("en-NG", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(timestamp));
}

export function generateRef(): string {
  return "SS-" + Math.random().toString(36).substring(2, 10).toUpperCase();
}

export function verifyBvn(bvn: string): { valid: boolean; reason?: string } {
  if (bvn === "00000000000") {
    return { valid: false, reason: "BVN not found in records" };
  }
  if (bvn === "11111111111") {
    return { valid: false, reason: "BVN flagged — contact support" };
  }
  if (bvn.length !== 11 || !/^\d+$/.test(bvn)) {
    return { valid: false, reason: "Invalid BVN format. Must be 11 digits." };
  }
  return { valid: true };
}

export const AML_THRESHOLD = 500_000;
export const TRANSACTION_LIMIT = 1_000_000;
