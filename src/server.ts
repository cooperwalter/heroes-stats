import handler, { createServerEntry } from "@tanstack/react-start/server-entry";
import { getApiToken } from "./lib/env";

getApiToken();

export default createServerEntry({
	fetch(request) {
		return handler.fetch(request);
	},
});
