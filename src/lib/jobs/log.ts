/** Structured one-line logs for the Railway jobs (JSON is searchable there). */
export function jobLog(
  job: string,
  event: string,
  data: Record<string, unknown> = {},
): void {
  console.log(JSON.stringify({ at: new Date().toISOString(), job, event, ...data }));
}

/** Run `fn` over `items` with at most `limit` in flight. */
export async function mapLimit<T, R>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<R>,
): Promise<R[]> {
  const out: R[] = new Array(items.length);
  let next = 0;
  async function worker() {
    while (next < items.length) {
      const i = next++;
      out[i] = await fn(items[i]);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return out;
}
