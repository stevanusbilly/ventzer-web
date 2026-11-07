import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd(), "");
	const devPort = Number(env.VITE_DEV_PORT) || 3001;
	const previewPort = Number(env.PORT) || 4173;

	return {
		plugins: [
			react({
				compiler: true,
			}),
		],
		envPrefix: ["VITE_", "REACT_APP_"],
		server: {
			host: true,
			port: devPort,
			strictPort: true,
		},
		preview: {
			host: true,
			port: previewPort,
			strictPort: false,
			allowedHosts: true,
		},
		build: {
			outDir: "dist",
			sourcemap: false,
		},
		optimizeDeps: {
			include: ["html5-qrcode"],
		},
	};
});
