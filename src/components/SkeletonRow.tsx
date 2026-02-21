import "./SkeletonRow.css";

export function SkeletonRow() {
	return (
		<div className="skeleton-row">
			<div className="skeleton-bar skeleton-bar--sm" />
			<div className="skeleton-bar skeleton-bar--lg" />
			<div className="skeleton-bar skeleton-bar--md" />
			<div className="skeleton-bar skeleton-bar--md" />
			<div className="skeleton-bar skeleton-bar--sm" />
		</div>
	);
}
