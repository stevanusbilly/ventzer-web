import api from "./api";
import { EventLocation } from "../types";

export const eventLocationService = {
	list: async (): Promise<EventLocation[]> => {
		const response = await api.get<EventLocation[]>("/event_location");
		return response.data;
	},
	get: async (id: number): Promise<EventLocation> => {
		const response = await api.get<EventLocation>(`/event_location/${id}`);
		return response.data;
	},
	getByEvent: async (eventId: number): Promise<EventLocation[]> => {
		const response = await api.get<EventLocation[]>(`/event_location/event/${eventId}`);
		return response.data;
	},
	getByEventOnly: async (eventId: number): Promise<EventLocation[]> => {
		return eventLocationService.getByEvent(eventId);
	},
	ins: async (eventData: Omit<EventLocation, "id">): Promise<EventLocation> => {
		const response = await api
			.post<EventLocation>("/event_location", eventData);
		return response.data;
	},
	upd: async (id: number, eventData: Partial<EventLocation>): Promise<EventLocation> => {
		const response = await api
			.put<EventLocation>(`/event_location/${id}`, eventData);
		return response.data;
	},
	del: async (id: number): Promise<{ message?: string }> => {
		const response = await api.delete<{ message?: string }>(
			`/event_location/${id}`,
		);
		return response.data;
	},
};
