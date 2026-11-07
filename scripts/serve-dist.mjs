import http from "node:http";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dist = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "dist");
const port = Number(process.env.PORT) || 3000;
const host = process.env.HOST || "0.0.0.0";

const mime = {
	".css": "text/css; charset=utf-8",
	".eot": "application/vnd.ms-fontobject",
	".html": "text/html; charset=utf-8",
	".ico": "image/x-icon",
	".jpg": "image/jpeg",
	".jpeg": "image/jpeg",
	".js": "text/javascript; charset=utf-8",
	".json": "application/json; charset=utf-8",
	".map": "application/json",
	".mp3": "audio/mpeg",
	".otf": "font/otf",
	".png": "image/png",
	".svg": "image/svg+xml",
	".ttf": "font/ttf",
	".txt": "text/plain; charset=utf-8",
	".wav": "audio/wav",
	".webmanifest": "application/manifest+json",
	".webp": "image/webp",
	".woff": "font/woff",
	".woff2": "font/woff2",
};

const apiOrigin = (() => {
	try {
		return new URL(String(process.env.VITE_API_URL || "")).origin;
	} catch {
		return "";
	}
})();

// Frontend memuat: font Google, Google Sign-In, gambar/musik/video dari URL event (https).
const csp = [
	"default-src 'self'",
	"script-src 'self' https://accounts.google.com",
	"style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://accounts.google.com",
	"font-src 'self' data: https://fonts.gstatic.com",
	"img-src 'self' data: blob: https:",
	"media-src 'self' blob: https:",
	"frame-src https:",
	`connect-src 'self' ${apiOrigin || "https:"} https://accounts.google.com`,
	"object-src 'none'",
	"base-uri 'self'",
	"form-action 'self'",
	"frame-ancestors 'none'",
].join("; ");

const securityHeaders = {
	"Content-Security-Policy": csp,
	"Strict-Transport-Security": "max-age=31536000; includeSubDomains",
	"X-Content-Type-Options": "nosniff",
	"X-Frame-Options": "DENY",
	"Referrer-Policy": "strict-origin-when-cross-origin",
	"Permissions-Policy": "camera=(self), microphone=(), geolocation=()",
};

const cacheControl = (file, ext) => {
	if (ext === ".html") {
		return "no-cache";
	}
	// Hanya berkas ber-hash di /assets yang aman di-cache lama.
	if (file.startsWith(`${dist}${path.sep}assets${path.sep}`)) {
		return "public, max-age=31536000, immutable";
	}
	return "public, max-age=3600";
};

const send = async (res, file, status = 200) => {
	const ext = path.extname(file).toLowerCase();
	const body = await fs.readFile(file);
	res.writeHead(status, {
		...securityHeaders,
		"Content-Type": mime[ext] || "application/octet-stream",
		"Cache-Control": cacheControl(file, ext),
	});
	res.end(body);
};

const server = http.createServer(async (req, res) => {
	try {
		const url = new URL(req.url || "/", "http://localhost");
		let relative = decodeURIComponent(url.pathname);
		if (relative.includes("\0")) {
			res.writeHead(400, securityHeaders).end();
			return;
		}
		if (relative.endsWith("/")) {
			relative += "index.html";
		}
		const candidate = path.resolve(dist, `.${relative}`);
		if (candidate !== dist && !candidate.startsWith(`${dist}${path.sep}`)) {
			res.writeHead(403, securityHeaders).end();
			return;
		}
		try {
			const stat = await fs.stat(candidate);
			if (stat.isDirectory()) {
				await send(res, path.join(candidate, "index.html"));
				return;
			}
			await send(res, candidate);
		} catch {
			await send(res, path.join(dist, "index.html"));
		}
	} catch {
		res.writeHead(500, securityHeaders).end("Server error");
	}
});

server.listen(port, host, () => {
	console.log(`Frontend running on http://${host}:${port}`);
});
