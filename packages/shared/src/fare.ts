const FLAT_RATES: Record<string, number> = {
  jfk: 4500,
  laguardia: 5500,
};

const BASE_FARE_CENTS = 500;
const PER_MILE_CENTS = 250;
const PER_MINUTE_CENTS = 40;
const MIN_FARE_CENTS = 800;

export interface FareQuote {
  fare_cents: number;
  flat_rate_key: string | null;
}

export function quoteFare(params: {
  dropoffAddress: string;
  miles: number;
  minutes: number;
}): FareQuote {
  const key = matchFlatRate(params.dropoffAddress);
  if (key) return { fare_cents: FLAT_RATES[key]!, flat_rate_key: key };

  const metered = BASE_FARE_CENTS
    + Math.round(params.miles * PER_MILE_CENTS)
    + Math.round(params.minutes * PER_MINUTE_CENTS);

  return { fare_cents: Math.max(metered, MIN_FARE_CENTS), flat_rate_key: null };
}

function matchFlatRate(dropoff: string): string | null {
  const s = dropoff.toLowerCase();
  if (s.includes("jfk")) return "jfk";
  if (s.includes("laguardia") || s.includes("lga")) return "laguardia";
  return null;
}

export function formatFare(cents: number): string {
  if (!Number.isFinite(cents) || cents < 0) return "—";
  return `$${(cents / 100).toFixed(2)}`;
}
