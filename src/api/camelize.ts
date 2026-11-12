/** Converts snake_case keys to camelCase, recursively. */
type CamelCase<S extends string> = S extends `${infer H}_${infer T}`
  ? `${H}${Capitalize<CamelCase<T>>}`
  : S;

export type Camelize<T> = T extends readonly (infer U)[]
  ? Camelize<U>[]
  : T extends Date
    ? T
    : T extends object
      ? { [K in keyof T as K extends string ? CamelCase<K> : K]: Camelize<T[K]> }
      : T;

const toCamel = (key: string) => key.replace(/_([a-z0-9])/g, (_, c: string) => c.toUpperCase());

export function camelize<T>(value: T): Camelize<T> {
  if (Array.isArray(value)) return value.map((v) => camelize(v)) as Camelize<T>;
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[toCamel(k)] = camelize(v);
    }
    return out as Camelize<T>;
  }
  return value as Camelize<T>;
}

/** Builds "?a=1&b=2", skipping empty values. */
export function queryString(query: Record<string, string | number | undefined | null>): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null && value !== "") params.set(key, String(value));
  }
  const s = params.toString();
  return s ? `?${s}` : "";
}
