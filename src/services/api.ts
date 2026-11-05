import axios, { AxiosInstance, AxiosResponse } from "axios";
import { API_URL } from "../config/env";
import { normalizeAxiosError } from "../utils/apiError";

const API_BASE_URL = API_URL;

const api: AxiosInstance = axios.create({
	baseURL: API_BASE_URL,
	timeout: 30_000,
});

api.interceptors.request.use(
	(config) => {
		const token = localStorage.getItem("token");
		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}
		return config;
	},
	(error) => Promise.reject(error),
);

api.interceptors.response.use(
	(response: AxiosResponse) => response,
	async (error) => {
		await normalizeAxiosError(error);
		const hadToken = !!localStorage.getItem("token");
		if (error.response?.status === 401 && hadToken) {
			let role: string | undefined;
			try {
				const raw = localStorage.getItem("userData");
				if (raw) {
					role = JSON.parse(raw)?.role;
				}
			} catch {
				role = undefined;
			}
			localStorage.removeItem("token");
			localStorage.removeItem("userData");
			const target =
				role === "admin" || role === "panitia" ? "/admin" : "/login";
			if (window.location.pathname !== target) {
				window.location.href = target;
			}
		}
		return Promise.reject(error);
	},
);

export default api;
