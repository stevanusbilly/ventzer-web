export function getFrontendBaseUrl(): string {
	const env = process.env.REACT_APP_FRONTEND_URL;
	if (env && env.trim()) {
		return env.replace(/\/$/, "");
	}
	if (typeof window !== "undefined") {
		return window.location.origin;
	}
	return "";
}

export function buildInvitationUrl(eventId: number, token: string): string {
	const base = getFrontendBaseUrl();
	return `${base}/invitation/${eventId}/${encodeURIComponent(token)}`;
}

/** Ambil qrToken dari URL undangan atau kembalikan teks scan mentah. */
export function extractQrTokenFromScan(decodedText: string): string {
	const trimmed = decodedText.trim();
	if (!trimmed) {
		return "";
	}

	try {
		const url = new URL(trimmed);
		const parts = url.pathname.split("/").filter(Boolean);
		const invIdx = parts.indexOf("invitation");
		if (invIdx >= 0 && parts[invIdx + 2]) {
			return decodeURIComponent(parts[invIdx + 2]);
		}
		if (invIdx >= 0 && parts[invIdx + 1] && !parts[invIdx + 2]) {
			return decodeURIComponent(parts[invIdx + 1]);
		}
	} catch {
		// bukan URL
	}

	return trimmed;
}

export function extractEventIdFromScan(decodedText: string): number | null {
	try {
		const url = new URL(decodedText.trim());
		const parts = url.pathname.split("/").filter(Boolean);
		const invIdx = parts.indexOf("invitation");
		if (invIdx >= 0 && parts[invIdx + 1]) {
			const id = Number(parts[invIdx + 1]);
			return Number.isInteger(id) && id > 0 ? id : null;
		}
	} catch {
		return null;
	}
	return null;
}
