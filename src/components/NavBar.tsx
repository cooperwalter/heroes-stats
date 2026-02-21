import { Link } from "@tanstack/react-router";
import "./NavBar.css";

export function NavBar() {
	return (
		<nav className="navbar">
			<div className="navbar-inner container">
				<Link
					to="/"
					search={{ mode: "sl", tier: "all" }}
					className="navbar-brand"
				>
					<span className="navbar-brand-accent">Nexus</span>
					<span className="navbar-brand-text">Stats</span>
				</Link>
				<div className="navbar-links">
					<Link
						to="/"
						search={{ mode: "sl", tier: "all" }}
						className="navbar-link"
						activeProps={{ className: "navbar-link navbar-link-active" }}
						activeOptions={{ exact: true }}
					>
						Heroes
					</Link>
				</div>
			</div>
		</nav>
	);
}
