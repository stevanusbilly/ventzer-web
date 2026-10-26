import api from "./api";
import { Template } from "../types";

export const templateService = {
	list: async (): Promise<Template[]> => {
		const response = await api.get<Template[]>("/templates");
		return response.data;
	},
	get: async (id: number): Promise<Template> => {
		const response = await api.get<Template>(`/templates/${id}`);
		return response.data;
	},
	ins: async (eventData: Omit<Template, "id">): Promise<Template> => {
		const response = await api
			.post<Template>("/templates", eventData);
		return response.data;
	},
	upd: async (id: number, eventData: Partial<Template>): Promise<Template> => {
		const response = await api
			.put<Template>(`/templates/${id}`, eventData);
		return response.data;
	},
	del: async (id: number): Promise<{ message?: string }> => {
		const response = await api.delete<{ message?: string }>(`/templates/${id}`);
		return response.data;
	},
};
