import api from "./api";
import {
	LoginCredentials,
	RegisterData,
	AuthResponse,
} from "../types";

export const authService = {
	login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
		const response = await api
			.post<AuthResponse>("/auth/login", credentials);
		return response.data;
	},

	register: async (userData: RegisterData): Promise<AuthResponse> => {
		try {
			const response = await api
				.post<AuthResponse>("/auth/register", userData);
			return response.data;
		} catch (error) {
			console.log("Register service error:", error);
			throw error;
		}
	},
};
