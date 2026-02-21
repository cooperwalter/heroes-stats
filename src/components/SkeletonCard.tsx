import "./SkeletonCard.css";

export function SkeletonCard() {
	return (
		<div className="skeleton-card">
			<div className="skeleton-card-bar skeleton-card-bar--label" />
			<div className="skeleton-card-bar skeleton-card-bar--value" />
		</div>
	);
}
