import api from "./api";
import { User } from "../types";

export const userService = {
	list: async (): Promise<User[]> => {
		const response = await api.get<User[]>("/users");
        return response.data;
	},
	get: async (id: number): Promise<User> => {
		const response = await api.get<User>(`/users/${id}`);
        return response.data;
	},
	ins: async (userData: Omit<User, "id">): Promise<User> => {
		const response = await api.post<User>("/users", userData);
        return response.data;
	},
	upd: async (id: number, userData: Partial<User>): Promise<User> => {
		const response = await api
            .put<User>(`/users/${id}`, userData);
        return response.data;
	},
	del: async (id: number): Promise<{ message?: string }> => {
		const response = await api.delete<{ message?: string }>(`/users/${id}`);
		return response.data;
	},
	getMe: async (): Promise<User> => {
		const response = await api.get<User>("/users/me");
		return response.data;
	},
	updMe: async (payload: {
		name: string;
		email?: string;
		change_password?: number;
		password?: string;
	}): Promise<{ message?: string; user: User }> => {
		const response = await api.put<{ message?: string; user: User }>(
			"/users/me",
			payload,
		);
		return response.data;
	},
};
