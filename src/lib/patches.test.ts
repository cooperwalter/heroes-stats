import { describe, expect, it, vi } from "vitest";
import type { ApiResult, PatchesResponse } from "./types";

vi.mock("~/lib/api", () => ({
	getPatches: vi.fn(),
}));

describe("resolveLatestPatch", () => {
	it("returns the latest minor patch as currentPatch when multiple minor patches exist within the latest major version", async () => {
		const { getPatches } = await import("~/lib/api");
		vi.mocked(getPatches).mockResolvedValue({
			data: {
				"2.55": ["2.55.2.90457", "2.55.3.90702", "2.55.3.90876"],
			},
		});
		const { resolveLatestPatch } = await import("./patches");
		const result = await resolveLatestPatch();
		expect(result.currentPatch).toBe("2.55.3.90876");
	});

	it("returns the second-latest minor patch as previousPatch when multiple minor patches exist", async () => {
		const { getPatches } = await import("~/lib/api");
		vi.mocked(getPatches).mockResolvedValue({
			data: {
				"2.55": ["2.55.2.90457", "2.55.3.90702", "2.55.3.90876"],
			},
		});
		const { resolveLatestPatch } = await import("./patches");
		const result = await resolveLatestPatch();
		expect(result.previousPatch).toBe("2.55.3.90702");
	});

	it("returns previousPatch as null when only one minor patch exists in the latest major version", async () => {
		const { getPatches } = await import("~/lib/api");
		vi.mocked(getPatches).mockResolvedValue({
			data: {
				"2.55": ["2.55.3.90876"],
			},
		});
		const { resolveLatestPatch } = await import("./patches");
		const result = await resolveLatestPatch();
		expect(result.previousPatch).toBeNull();
	});

	it("selects the highest major version key when multiple major versions exist", async () => {
		const { getPatches } = await import("~/lib/api");
		vi.mocked(getPatches).mockResolvedValue({
			data: {
				"2.53": ["2.53.1.80000"],
				"2.54": ["2.54.1.85000"],
				"2.55": ["2.55.3.90876"],
			},
		});
		const { resolveLatestPatch } = await import("./patches");
		const result = await resolveLatestPatch();
		expect(result.currentPatch).toBe("2.55.3.90876");
	});

	it("sorts minor patches in descending order correctly", async () => {
		const { getPatches } = await import("~/lib/api");
		vi.mocked(getPatches).mockResolvedValue({
			data: {
				"2.55": ["2.55.3.90876", "2.55.2.90457", "2.55.3.90702"],
			},
		});
		const { resolveLatestPatch } = await import("./patches");
		const result = await resolveLatestPatch();
		expect(result.currentPatch).toBe("2.55.3.90876");
		expect(result.previousPatch).toBe("2.55.3.90702");
	});

	it("throws an error when the API returns an empty patch object with no versions", async () => {
		const { getPatches } = await import("~/lib/api");
		vi.mocked(getPatches).mockResolvedValue({
			data: {},
		});
		const { resolveLatestPatch } = await import("./patches");
		await expect(resolveLatestPatch()).rejects.toThrow(
			"Patch data contains no versions",
		);
	});

	it("throws an error when the API returns an error result", async () => {
		const { getPatches } = await import("~/lib/api");
		const errorResult: ApiResult<PatchesResponse> = {
			error: "upstream_error",
			message: "Service unavailable",
		};
		vi.mocked(getPatches).mockResolvedValue(errorResult);
		const { resolveLatestPatch } = await import("./patches");
		await expect(resolveLatestPatch()).rejects.toThrow("Service unavailable");
	});
});
