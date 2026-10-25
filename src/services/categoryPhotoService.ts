import api from "./api";
import { CategoryPhoto } from "../types";

export const categoryPhotoService = {
	list: async (): Promise<CategoryPhoto[]> => {
		const response = await api.get<CategoryPhoto[]>("/category_photo");
		return response.data;
	},
	get: async (id: number): Promise<CategoryPhoto> => {
		const response = await api.get<CategoryPhoto>(`/category_photo/${id}`);
		return response.data;
	},
	ins: async (eventData: Omit<CategoryPhoto, "id">): Promise<CategoryPhoto> => {
		const response = await api
			.post<CategoryPhoto>("/category_photo", eventData);
		return response.data;
	},
	upd: async (id: number, eventData: Partial<CategoryPhoto>): Promise<CategoryPhoto> => {
		const response = await api
			.put<CategoryPhoto>(`/category_photo/${id}`, eventData);
		return response.data;
	},
	del: (id: number): Promise<void> => {
		return api.delete(`/category_photo/${id}`);
	},
};
