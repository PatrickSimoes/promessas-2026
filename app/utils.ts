const DAY_MS = 24 * 60 * 60 * 1000;

export function formatShortDate(ts: number): string {
  const d = new Date(ts);
  const now = new Date();
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  if (d.getFullYear() === now.getFullYear()) return `${dd}/${mm}`;
  return `${dd}/${mm}/${String(d.getFullYear()).slice(-2)}`;
}

export function daysUntil(ts: number): number {
  const today = startOfDay(Date.now());
  const target = startOfDay(ts);
  return Math.round((target - today) / DAY_MS);
}

function startOfDay(ts: number): number {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export function deadlineLabel(ts: number): string {
  const days = daysUntil(ts);
  if (days === 0) return 'hoje';
  if (days === 1) return 'amanhã';
  if (days === -1) return 'ontem';
  if (days > 1 && days <= 7) return `em ${days}d`;
  if (days < -1) return `${Math.abs(days)}d atrás`;
  return formatShortDate(ts);
}

/** Parse a "DD/MM/AAAA" or "DD/MM/AA" string into a timestamp at noon local time. */
export function parseManualDate(input: string): number | null {
  const cleaned = input.trim();
  const match = cleaned.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2}|\d{4})$/);
  if (!match) return null;
  const day = parseInt(match[1], 10);
  const month = parseInt(match[2], 10);
  let year = parseInt(match[3], 10);
  if (match[3].length === 2) year += 2000;
  if (month < 1 || month > 12) return null;
  if (day < 1 || day > 31) return null;
  const d = new Date(year, month - 1, day, 12, 0, 0, 0);
  if (d.getDate() !== day || d.getMonth() !== month - 1) return null;
  return d.getTime();
}

/** Format ts as "DD/MM/AAAA" for the manual input default value. */
export function formatManualDate(ts: number): string {
  const d = new Date(ts);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  return `${dd}/${mm}/${d.getFullYear()}`;
}

/** Auto-format raw user input as DD/MM/AAAA while typing. */
export function maskDateInput(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

export function addDays(ts: number, days: number): number {
  const d = new Date(ts);
  d.setDate(d.getDate() + days);
  d.setHours(12, 0, 0, 0);
  return d.getTime();
}

export function endOfYear(ts: number): number {
  const d = new Date(ts);
  return new Date(d.getFullYear(), 11, 31, 12, 0, 0, 0).getTime();
}
