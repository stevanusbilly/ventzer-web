import api from "./api";

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
