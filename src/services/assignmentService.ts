import api from "./api";
import { AssignedEventsResponse } from "../types";

export const assignmentService = {
	assignUserToEvent: async (
		eventId: number,
		userId: number,
	): Promise<{ message?: string }> => {
		const response = await api.post<{ message?: string }>(
			`/assignments/events/${eventId}/users/${userId}`,
		);
		return response.data;
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
	removeUserFromEvent: async (
		eventId: number,
		userId: number,
	): Promise<{ message?: string }> => {
		const response = await api.delete<{ message?: string }>(
			`/assignments/events/${eventId}/users/${userId}`,
		);
		return response.data;
	},
};
