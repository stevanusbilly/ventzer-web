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
	del: (id: number): Promise<void> => {
		return api.delete(`/users/${id}`);
	},
};
