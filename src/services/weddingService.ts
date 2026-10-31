import api from "./api";
import { Wedding } from "../types";

export const weddingService = {
	getByEvent: async (eventId: number): Promise<Wedding> => {
		const response = await api.get<Wedding>(`/wedding/event/${eventId}`);
		return response.data;
	},
	ins: async (eventData: Omit<Wedding, "id">): Promise<Wedding> => {
		const response = await api
			.post<Wedding>("/wedding", eventData);
		return response.data;
	},
};
