import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
	plugins: [
		react({
			compiler: true,
		}),
	],
	envPrefix: ["VITE_", "REACT_APP_"],
	server: {
		host: true,
		port: 3001,
		strictPort: true,
	},
	preview: {
		host: true,
		port: Number(process.env.PORT) || 4173,
		strictPort: false,
		allowedHosts: true,
	},
	build: {
		outDir: "dist",
		sourcemap: true,
	},
	optimizeDeps: {
		include: ["html5-qrcode"],
	},
});
