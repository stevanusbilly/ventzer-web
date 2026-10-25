import api from "./api";
import { EventSetting } from "../types";

export const eventSettingService = {
	getByEvent: async (eventId: number): Promise<EventSetting> => {
		const response = await api.get<EventSetting>(`/event_setting/event/${eventId}`);
		return response.data;
	},
	get: async (id: number): Promise<EventSetting> => {
		const response = await api.get<EventSetting>(`/event_setting/${id}`);
		return response.data;
	},
	ins: async (eventData: Omit<EventSetting, "id">): Promise<EventSetting> => {
		const response = await api
			.post<EventSetting>("/event_setting", eventData);
		return response.data;
	},
};
