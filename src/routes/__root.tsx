import {
	createRootRoute,
	HeadContent,
	Link,
	Outlet,
	Scripts,
} from "@tanstack/react-router";
import type { ReactNode } from "react";
import { NavBar } from "~/components/NavBar";
import globalCss from "~/styles/global.css?url";

export const Route = createRootRoute({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{ name: "viewport", content: "width=device-width, initial-scale=1" },
			{ title: "NexusStats — Heroes of the Storm Statistics" },
		],
		links: [{ rel: "stylesheet", href: globalCss }],
	}),
	component: RootComponent,
	notFoundComponent: NotFoundPage,
});

function RootComponent() {
	return (
		<RootDocument>
			<NavBar />
			<Outlet />
		</RootDocument>
	);
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
	return (
		<html lang="en">
			<head>
				<HeadContent />
			</head>
			<body>
				{children}
				<Scripts />
			</body>
		</html>
	);
}

function NotFoundPage() {
	return (
		<div
			className="container"
			style={{ textAlign: "center", padding: "4rem 2rem" }}
		>
			<h1>404 — Page Not Found</h1>
			<p style={{ color: "var(--text-muted)", marginTop: "0.5rem" }}>
				The page you're looking for doesn't exist.
			</p>
			<Link
				to="/"
				search={{ mode: "sl", tier: "all" }}
				style={{ marginTop: "1.5rem", display: "inline-block" }}
			>
				Back to all heroes
			</Link>
		</div>
	);
}
