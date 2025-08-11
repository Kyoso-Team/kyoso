export const time = {
  minutes: (minutes: number): number => minutes * 60 * 1000,
  hours: (hours: number): number => hours * 60 * 60 * 1000,
  days: (days: number): number => days * 24 * 60 * 60 * 1000
};

export function serializeToConsole(v: any): string {
  if (v === null) return 'null';
  if (v === undefined) return 'undefined';
  if (v instanceof Date) return v.toISOString();
  if (typeof v === 'bigint') return v.toString() + 'n';
  if (typeof v === 'string') return `"${v}"`;
  if (typeof v === 'number') return v.toString();
  if (typeof v === 'boolean') return v ? 'true' : 'false';
  if (Array.isArray(v)) return `[${v.map(serializeToConsole).join(', ')}]`;
  if (typeof v === 'object') {
    return `{${Object.entries(v)
      .map(([key, value]): string => `${key}: ${serializeToConsole(value)}`)
      .join(', ')}}`;
  }
  return String(v);
}
