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

const send = async (res, file, status = 200) => {
	const ext = path.extname(file).toLowerCase();
	const body = await fs.readFile(file);
	res.writeHead(status, {
		"Content-Type": mime[ext] || "application/octet-stream",
		"Cache-Control":
			ext === ".html" ? "no-cache" : "public, max-age=31536000, immutable",
	});
	res.end(body);
};

const server = http.createServer(async (req, res) => {
	try {
		const url = new URL(req.url || "/", "http://localhost");
		let relative = decodeURIComponent(url.pathname);
		if (relative.includes("\0")) {
			res.writeHead(400).end();
			return;
		}
		if (relative.endsWith("/")) {
			relative += "index.html";
		}
		const candidate = path.resolve(dist, `.${relative}`);
		if (candidate !== dist && !candidate.startsWith(`${dist}${path.sep}`)) {
			res.writeHead(403).end();
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
		res.writeHead(500).end("Server error");
	}
});

server.listen(port, host, () => {
	console.log(`Frontend running on http://${host}:${port}`);
});
