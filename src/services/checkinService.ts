import api from "./api";
import { CheckinRequest, CheckinResponse } from "../types";

export const checkinService = {
	checkin: async (checkinData: CheckinRequest): Promise<CheckinResponse> => {
		const response = await api.post<CheckinResponse>("/checkin", checkinData);
		return response.data;
	},
	getCount: async (eventId?: number): Promise<{ count: number }> => {
		const response = await api.get<{ count: number }>("/checkin/getCount", {
			params: eventId ? { eventId } : undefined,
		});
		return response.data;
	},
};
