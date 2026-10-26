import api from "./api";
import { Gift } from "../types";

export const giftService = {
	list: async (): Promise<Gift[]> => {
		const response = await api.get<Gift[]>("/gift");
		return response.data;
	},
	get: async (id: number): Promise<Gift> => {
		const response = await api.get<Gift>(`/gift/${id}`);
		return response.data;
	},
	getByEvent: async (eventId: number): Promise<Gift[]> => {
		const response = await api.get<Gift[]>(`/gift/event/${eventId}`);
		return response.data;
	},
	getByEventOnly: async (eventId: number): Promise<Gift[]> => {
		return giftService.getByEvent(eventId);
	},
	ins: async (eventData: Omit<Gift, "id">): Promise<Gift> => {
		const response = await api
			.post<Gift>("/gift", eventData);
		return response.data;
	},
	upd: async (id: number, eventData: Partial<Gift>): Promise<Gift> => {
		const response = await api
			.put<Gift>(`/gift/${id}`, eventData);
		return response.data;
	},
	del: async (id: number): Promise<{ message?: string }> => {
		const response = await api.delete<{ message?: string }>(`/gift/${id}`);
		return response.data;
	},
};
