import { getPatches } from "./api";
import type { ApiResult, PatchesResponse } from "./types";

export async function resolveLatestPatch(): Promise<{
	currentPatch: string;
	previousPatch: string | null;
}> {
	const result: ApiResult<PatchesResponse> = await getPatches();

	if (result.error) {
		throw new Error(result.message);
	}

	const data = result.data;

	if (!data) {
		throw new Error("No patch data returned");
	}

	const majorKeys = Object.keys(data).sort((a, b) => {
		const [aMajor, aMinor] = a.split(".").map(Number);
		const [bMajor, bMinor] = b.split(".").map(Number);
		if (bMajor !== aMajor) return bMajor - aMajor;
		return bMinor - aMinor;
	});

	const latestMajor = majorKeys[0];
	const minorPatches = data[latestMajor].sort((a, b) => {
		const aParts = a.split(".").map(Number);
		const bParts = b.split(".").map(Number);
		for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
			const diff = (bParts[i] ?? 0) - (aParts[i] ?? 0);
			if (diff !== 0) return diff;
		}
		return 0;
	});

	const currentPatch = minorPatches[0];
	const previousPatch = minorPatches.length > 1 ? minorPatches[1] : null;

	return { currentPatch, previousPatch };
}
