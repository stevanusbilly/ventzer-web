import api from "./api";
import { EventTableGuest } from "../types";

export const eventTableGuestService = {
	list: async (): Promise<EventTableGuest[]> => {
		const response = await api.get<EventTableGuest[]>("/event_table_guest");
		return response.data;
	},
	get: async (id: number): Promise<EventTableGuest> => {
		const response = await api.get<EventTableGuest>(`/event_table_guest/${id}`);
		return response.data;
	},
	getByEvent: async (eventId: number): Promise<EventTableGuest[]> => {
		const response = await api.get<EventTableGuest[]>(`/event_table_guest/event/${eventId}`);
		return response.data;
	},
	getByTable: async (tableId: number): Promise<EventTableGuest[]> => {
		const response = await api.get<EventTableGuest[]>(`/event_table_guest/table/${tableId}`);
		return response.data;
	},
	ins: async (eventData: Omit<EventTableGuest, "id">): Promise<EventTableGuest> => {
		const response = await api
			.post<EventTableGuest>("/event_table_guest", eventData);
		return response.data;
	},
	upd: async (id: number, eventData: Partial<EventTableGuest>): Promise<EventTableGuest> => {
		const response = await api
			.put<EventTableGuest>(`/event_table_guest/${id}`, eventData);
		return response.data;
	},
	del: (id: number): Promise<void> => {
		return api.delete(`/event_table_guest/${id}`);
	},
};
