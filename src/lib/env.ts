export const HEROESPROFILE_API_BASE_URL = "https://api.heroesprofile.com";

export function getApiToken(): string {
	const token = process.env.HEROESPROFILE_API_TOKEN;
	if (!token) {
		throw new Error(
			"HEROESPROFILE_API_TOKEN environment variable is required but not set.",
		);
	}
	return token;
}
