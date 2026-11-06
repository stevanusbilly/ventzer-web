/// <reference types="vite/client" />

interface ImportMetaEnv {
	readonly VITE_API_URL?: string;
	readonly VITE_FRONTEND_URL?: string;
	readonly VITE_GOOGLE_CLIENT_ID?: string;
	readonly VITE_DEV_PORT?: string;
	readonly VITE_WHATSAPP_NUMBER?: string;
	readonly VITE_WHATSAPP_TEXT?: string;
	readonly REACT_APP_API_URL?: string;
	readonly REACT_APP_FRONTEND_URL?: string;
	readonly REACT_APP_GOOGLE_CLIENT_ID?: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
