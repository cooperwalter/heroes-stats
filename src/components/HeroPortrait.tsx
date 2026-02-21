import "./HeroPortrait.css";

interface HeroPortraitProps {
	name: string;
}

export function HeroPortrait({ name }: HeroPortraitProps) {
	const initials = name.slice(0, 2);
	return <div className="hero-portrait">{initials}</div>;
}
