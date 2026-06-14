export function countRentalDays(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 1;
  const diff = end.getTime() - start.getTime();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
  return Math.max(1, days);
}

export function calculateRentalTotal(
  dailyRate: number,
  startDate: string,
  endDate: string,
): {days: number; subtotal: number; total: number} {
  const days = countRentalDays(startDate, endDate);
  const subtotal = dailyRate * days;
  return {days, subtotal, total: subtotal};
}

export function formatGel(amount: number): string {
  return `₾${amount.toFixed(0)}`;
}

export function getDefaultDateRange(): {start: string; end: string} {
  const start = new Date();
  start.setDate(start.getDate() + 1);
  const end = new Date(start);
  end.setDate(end.getDate() + 2);
  return {
    start: start.toISOString().split('T')[0]!,
    end: end.toISOString().split('T')[0]!,
  };
}

export function isDateRangeValid(startDate: string, endDate: string): boolean {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return start >= today && end >= start;
}
