import api from "./api";
import { CheckinRequest, CheckinResponse, Guest } from "../types";

export const checkinService = {
	checkin: async (checkinData: CheckinRequest): Promise<CheckinResponse> => {
		const response = await api.post<CheckinResponse>("/checkin", checkinData);
		return response.data;
	},
	getRecent: async (eventId?: number, limit = 10): Promise<Guest[]> => {
		const response = await api.get<Guest[]>("/checkin/recent", {
			params: {
				limit,
				...(eventId ? { eventId } : {}),
			},
		});
		return response.data;
	},
	getCount: async (eventId?: number): Promise<{ count: number }> => {
		const response = await api.get<{ count: number }>("/checkin/getCount", {
			params: eventId ? { eventId } : undefined,
		});
		return response.data;
	},
	undo: async (
		guestId: number,
		eventId: number,
	): Promise<{ message?: string }> => {
		const response = await api.post<{ message?: string }>("/checkin/undo", {
			guestId,
			eventId,
		});
		return response.data;
	},
};
