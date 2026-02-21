export function getWinRateColor(winRate: number): string {
	if (winRate > 52) return "green";
	if (winRate >= 48) return "yellow";
	return "red";
}

export function formatNumber(n: number): string {
	return new Intl.NumberFormat().format(n);
}

export function formatPercent(n: number): string {
	return `${n.toFixed(1)}%`;
}
