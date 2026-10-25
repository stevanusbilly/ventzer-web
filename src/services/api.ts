import axios, { AxiosInstance, AxiosResponse } from "axios";

const API_BASE_URL =
	process.env.REACT_APP_API_URL || "http://localhost:3000/api";

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
	(error) => {
		const hadToken = !!localStorage.getItem("token");
		if (error.response?.status === 401 && hadToken) {
			localStorage.removeItem("token");
			localStorage.removeItem("userData");
			if (window.location.pathname !== "/login") {
				window.location.href = "/login";
			}
		}
		return Promise.reject(error);
	},
);

export default api;
