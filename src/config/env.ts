const readEnv = (keys: (keyof ImportMetaEnv)[], fallback = ""): string => {
	for (const key of keys) {
		const value = import.meta.env[key];
		if (typeof value === "string" && value.trim()) {
			return value.trim();
		}
	}
	return fallback;
};

export const API_URL = readEnv(
	["VITE_API_URL", "REACT_APP_API_URL"],
	"http://localhost:3000/api",
);

export const FRONTEND_URL = readEnv([
	"VITE_FRONTEND_URL",
	"REACT_APP_FRONTEND_URL",
]);

export const GOOGLE_CLIENT_ID = readEnv([
	"VITE_GOOGLE_CLIENT_ID",
	"REACT_APP_GOOGLE_CLIENT_ID",
]);

export const WHATSAPP_NUMBER = readEnv(["VITE_WHATSAPP_NUMBER"]);

export const WHATSAPP_TEXT = readEnv(
	["VITE_WHATSAPP_TEXT"],
	"Halo VENTZER, saya ingin bertanya tentang undangan digital.",
);

export const isProduction = import.meta.env.PROD;
