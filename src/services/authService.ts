import api from "./api";
import {
	LoginCredentials,
	RegisterData,
	AuthResponse,
	User,
} from "../types";

type VerifySendResponse = {
	message: string;
	previewCode?: string;
	user?: User;
};

type VerifyConfirmResponse = {
	message: string;
	user: User;
};

export const authService = {
	login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
		const response = await api.post<AuthResponse>("/auth/login", credentials);
		return response.data;
	},

	register: async (userData: RegisterData): Promise<AuthResponse> => {
		const response = await api.post<AuthResponse>("/auth/register", userData);
		return response.data;
	},

	loginGoogle: async (idToken: string): Promise<AuthResponse> => {
		const response = await api.post<AuthResponse>("/auth/google", { idToken });
		return response.data;
	},

	me: async (): Promise<User> => {
		const response = await api.get<{ user: User }>("/auth/me");
		return response.data.user;
	},

	sendEmailCode: async (): Promise<VerifySendResponse> => {
		const response = await api.post<VerifySendResponse>("/auth/verify/email/send");
		return response.data;
	},

	confirmEmail: async (code: string): Promise<VerifyConfirmResponse> => {
		const response = await api.post<VerifyConfirmResponse>("/auth/verify/email", { code });
		return response.data;
	},

	sendPhoneCode: async (phone?: string): Promise<VerifySendResponse> => {
		const response = await api.post<VerifySendResponse>("/auth/verify/phone/send", { phone });
		return response.data;
	},

	confirmPhone: async (code: string): Promise<VerifyConfirmResponse> => {
		const response = await api.post<VerifyConfirmResponse>("/auth/verify/phone", { code });
		return response.data;
	},
};
