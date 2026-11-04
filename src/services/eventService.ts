import api from "./api";
import { Event, EventSummary } from "../types";

export interface EventListParams {
	dateFrom?: string;
	dateTo?: string;
	eventId?: number;
}

export const eventService = {
	getAll: async (params?: EventListParams): Promise<Event[]> => {
		const response = await api.get<Event[]>("/events", { params });
		return response.data;
	},
	getByUser: async (
		userId: number,
		params?: EventListParams,
	): Promise<Event[]> => {
		const response = await api.get<Event[]>(`/events/user/${userId}`, {
			params,
		});
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
	getRecap: async (params?: EventListParams): Promise<EventSummary> => {
		const response = await api.get<EventSummary>("/events/recap", { params });
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
