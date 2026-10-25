import api from "./api";
import { AssignedEventsResponse } from "../types";

export const assignmentService = {
	assignUserToEvent: (eventId: number, userId: number): Promise<void> => {
		return api.post(`/assignments/events/${eventId}/users/${userId}`);
	},
	getEventAssignments: async (
		eventId: number,
	): Promise<{ event: unknown; assignments: unknown[] }> => {
		const response = await api.get(
			`/assignments/events/${eventId}/assignments`,
		);
		return response.data;
	},
	getUserAssignedEvents: async (): Promise<AssignedEventsResponse> => {
		const response = await api.get<AssignedEventsResponse>(
			"/assignments/users/me/events",
		);
		return response.data;
	},
	removeUserFromEvent: (eventId: number, userId: number): Promise<void> => {
		return api.delete(`/assignments/events/${eventId}/users/${userId}`);
	},
};
