import api from "./api";
import { EventTable } from "../types";

export const eventTableService = {
	getByEvent: async (eventId: number): Promise<EventTable[]> => {
		const response = await api.get<EventTable[]>(`/event_table/event/${eventId}`);
		return response.data;
	},
	ins: async (eventData: Omit<EventTable, "id">): Promise<EventTable> => {
		const response = await api
			.post<EventTable>("/event_table", eventData);
		return response.data;
	},
	upd: async (id: number, eventData: Partial<EventTable>): Promise<EventTable> => {
		const response = await api
			.put<EventTable>(`/event_table/${id}`, eventData);
		return response.data;
	},
	del: async (id: number): Promise<{ message?: string }> => {
		const response = await api.delete<{ message?: string }>(
			`/event_table/${id}`,
		);
		return response.data;
	},
};
