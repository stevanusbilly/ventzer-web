import api from "./api";
import { CategoryTemplate } from "../types";

export const categoryTemplateService = {
	list: async (): Promise<CategoryTemplate[]> => {
		const response = await api.get<CategoryTemplate[]>("/category_template");
		return response.data;
	},
	ins: async (
		payload: Omit<CategoryTemplate, "id">,
	): Promise<CategoryTemplate> => {
		const response = await api.post<CategoryTemplate>(
			"/category_template",
			payload,
		);
		return response.data;
	},
	upd: async (
		id: number,
		payload: Partial<CategoryTemplate>,
	): Promise<CategoryTemplate> => {
		const response = await api.put<CategoryTemplate>(
			`/category_template/${id}`,
			payload,
		);
		return response.data;
	},
	del: async (id: number): Promise<{ message?: string }> => {
		const response = await api.delete<{ message?: string }>(
			`/category_template/${id}`,
		);
		return response.data;
	},
};
