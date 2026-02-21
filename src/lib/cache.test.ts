import { describe, expect, it, vi } from "vitest";
import { buildCacheKey, get, set } from "./cache";

describe("get", () => {
	it("returns undefined for a key that has never been set", () => {
		expect(get("nonexistent-key")).toBeUndefined();
	});

	it("returns undefined for an entry whose TTL has expired", () => {
		vi.useFakeTimers();
		set("expiring-key", "value", 1000);
		vi.advanceTimersByTime(1001);
		expect(get("expiring-key")).toBeUndefined();
		vi.useRealTimers();
	});
});

describe("set and get", () => {
	it("returns the stored value after set", () => {
		set("my-key", { hello: "world" }, 60000);
		expect(get("my-key")).toEqual({ hello: "world" });
	});

	it("overwrites existing entries with the same key", () => {
		set("overwrite-key", "first", 60000);
		set("overwrite-key", "second", 60000);
		expect(get("overwrite-key")).toBe("second");
	});
});

describe("buildCacheKey", () => {
	it("formats as functionName:key1=value1&key2=value2 with params sorted alphabetically", () => {
		const result = buildCacheKey("myFn", {
			zebra: "z",
			apple: "a",
			mango: "m",
		});
		expect(result).toBe("myFn:apple=a&mango=m&zebra=z");
	});

	it("filters out params with undefined values", () => {
		const result = buildCacheKey("myFn", {
			defined: "yes",
			missing: undefined,
		});
		expect(result).toBe("myFn:defined=yes");
	});

	it("returns functionName: when all params are undefined", () => {
		const result = buildCacheKey("myFn", { a: undefined, b: undefined });
		expect(result).toBe("myFn:");
	});
});
