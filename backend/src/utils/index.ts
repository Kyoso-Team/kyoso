export const time = {
  minutes: (minutes: number): number => minutes * 60 * 1000,
  hours: (hours: number): number => hours * 60 * 60 * 1000,
  days: (days: number): number => days * 24 * 60 * 60 * 1000
};
