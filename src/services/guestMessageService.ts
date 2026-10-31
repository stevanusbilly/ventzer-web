import api from "./api";
import { GuestMessage } from "../types";

export interface GuestMessageListParams {
	dateFrom?: string;
	dateTo?: string;
}

export const guestMessageService = {
	getByEvent: async (
		eventId: number,
		params?: GuestMessageListParams,
	): Promise<GuestMessage[]> => {
		const response = await api.get<GuestMessage[]>(
			`/guest_message/event/${eventId}`,
			{ params },
		);
		return response.data;
	},
	del: async (id: number): Promise<{ message?: string }> => {
		const response = await api.delete<{ message?: string }>(
			`/guest_message/${id}`,
		);
		return response.data;
	},
	setPublished: async (
		id: number,
		published: number,
	): Promise<{ message?: string; published: number }> => {
		const response = await api.patch<{ message?: string; published: number }>(
			`/guest_message/${id}/publish`,
			{ published },
		);
		return response.data;
	},
};
