export type PatchesResponse = Record<string, string[]>;

export interface Hero {
	id: number;
	name: string;
	short_name: string;
	role: string;
	new_role: string;
	type: string;
	attribute_id: string;
}

export type HeroesResponse = Record<string, Hero>;

export interface HeroStats {
	wins: number;
	losses: number;
	games_played: number;
	win_rate: number;
	popularity: number;
	ban_rate: number;
	pick_rate: number;
	bans: number;
}

export type HeroStatsResponse = Record<string, HeroStats>;

export interface TalentDetail {
	games_played: number;
	wins: number;
	losses: number;
	win_rate: number;
	popularity: number;
}

export type TalentDetailsResponse = Record<
	string,
	Record<string, Record<string, TalentDetail>>
>;

export interface TalentBuild {
	win_rate: number;
	games_played?: number;
	build_talents: string[];
}

export type TalentBuildsResponse = Record<string, TalentBuild[]>;

export interface TalentMeta {
	talent_id: number;
	title: string;
	description: string;
	level: string;
	hotkey: string;
	icon: string;
}

export type TalentMetaResponse = Record<string, TalentMeta[]>;

export type ApiResult<T> =
	| { data: T; error?: undefined }
	| { error: string; message: string; status?: number; data?: undefined };
