export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function trendFromDelta(delta: number): "UP" | "DOWN" | "STABLE" {
  if (delta > 0) return "UP";
  if (delta < 0) return "DOWN";
  return "STABLE";
}

export function deterministicId(prefix: string, sequence: number): string {
  return `${prefix}-${String(sequence).padStart(5, "0")}`;
}
