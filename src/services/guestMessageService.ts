import api from "./api";
import { GuestMessage } from "../types";

export const guestMessageService = {
	list: async (): Promise<GuestMessage[]> => {
		const response = await api.get<GuestMessage[]>("/guest_message");
		return response.data;
	},
	get: async (id: number): Promise<GuestMessage> => {
		const response = await api.get<GuestMessage>(`/guest_message/${id}`);
		return response.data;
	},
	getByEvent: async (eventId: number): Promise<GuestMessage[]> => {
		const response = await api.get<GuestMessage[]>(
			`/guest_message/event/${eventId}`,
		);
		return response.data;
	},
	ins: async (payload: {
		eventId: number;
		guestId: number;
		message: string;
	}): Promise<void> => {
		await api.post("/guest_message", payload);
	},
	upd: async (
		id: number,
		payload: { eventId: number; guestId: number; message: string },
	): Promise<void> => {
		await api.put(`/guest_message/${id}`, payload);
	},
	del: (id: number): Promise<void> => {
		return api.delete(`/guest_message/${id}`);
	},
};
