export function sumBy<T>(arr: T[], selector: (x: T) => number): number {
  return arr.reduce((s, x) => s + (Number(selector(x)) || 0), 0);
}

export function groupCount<T, K extends string | number>(
  arr: T[],
  key: (x: T) => K
): Record<K, number> {
  return arr.reduce(
    (acc: Record<K, number>, x) => {
      const k = key(x);
      acc[k] = (acc[k] || 0) + 1;
      return acc;
    },
    {} as Record<K, number>
  );
}

export function groupSum<T, K extends string | number>(
  arr: T[],
  key: (x: T) => K,
  value: (x: T) => number
): Record<K, number> {
  return arr.reduce(
    (acc: Record<K, number>, x) => {
      const k = key(x);
      acc[k] = (acc[k] || 0) + (Number(value(x)) || 0);
      return acc;
    },
    {} as Record<K, number>
  );
}

export function averageBy<T>(arr: T[], selector: (x: T) => number): number {
  if (arr.length === 0) return 0;
  return sumBy(arr, selector) / arr.length;
}

