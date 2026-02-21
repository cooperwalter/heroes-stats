interface CacheEntry {
	data: unknown;
	expiry: number;
}

const store = new Map<string, CacheEntry>();

export function get<T>(key: string): T | undefined {
	const entry = store.get(key);
	if (!entry) return undefined;
	if (Date.now() > entry.expiry) {
		store.delete(key);
		return undefined;
	}
	return entry.data as T;
}

export function set<T>(key: string, data: T, ttlMs: number): void {
	store.set(key, { data, expiry: Date.now() + ttlMs });
}

export function buildCacheKey(
	fn: string,
	params: Record<string, string | undefined>,
): string {
	const sorted = Object.entries(params)
		.filter(([, v]) => v !== undefined)
		.sort(([a], [b]) => a.localeCompare(b))
		.map(([k, v]) => `${k}=${v}`)
		.join("&");
	return `${fn}:${sorted}`;
}
