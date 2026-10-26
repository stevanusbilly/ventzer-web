import api from "./api";
import { Event, EventSummary } from "../types";

export const eventService = {
	getAll: async (): Promise<Event[]> => {
		const response = await api.get<Event[]>("/events");
		return response.data;
	},
	getByUser: async (userId: number): Promise<Event[]> => {
		const response = await api.get<Event[]>(`/events/user/${userId}`);
		return response.data;
	},
	getCount: async (): Promise<{ count: number }> => {
		const response = await api.get<{ count: number }>("/events/getCount");
		return response.data;
	},
	getById: async (id: number): Promise<Event> => {
		const response = await api.get<Event>(`/events/${id}`);
		return response.data;
	},
	getSummary: async (id: number): Promise<EventSummary> => {
		const response = await api.get<EventSummary>(`/events/${id}/summary`);
		return response.data;
	},
	create: async (
		eventData: Omit<Event, "id">,
	): Promise<{ message?: string; data: { id: number } }> => {
		const response = await api.post<{
			message?: string;
			data: { id: number };
		}>("/events", eventData);
		return response.data;
	},
	update: async (
		id: number,
		eventData: Partial<Event>,
	): Promise<{ message?: string }> => {
		const response = await api.put<{ message?: string }>(
			`/events/${id}`,
			eventData,
		);
		return response.data;
	},
	delete: async (id: number): Promise<{ message?: string }> => {
		const response = await api.delete<{ message?: string }>(`/events/${id}`);
		return response.data;
	},
};
