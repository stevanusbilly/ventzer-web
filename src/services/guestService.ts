import api from "./api";
import { Guest } from "../types";

export interface GuestListParams {
	dateFrom?: string;
	dateTo?: string;
}

export const guestService = {
	getByEvent: async (
		eventId: number,
		params?: GuestListParams,
	): Promise<Guest[]> => {
		const response = await api.get<Guest[]>(`/guests/event/${eventId}`, {
			params,
		});
		return response.data;
	},
	getRecent: async (eventId?: number, limit = 10): Promise<Guest[]> => {
		const response = await api.get<Guest[]>("/guests/recent", {
			params: {
				limit,
				...(eventId ? { eventId } : {}),
			},
		});
		return response.data;
	},
	getCount: async (eventId?: number): Promise<{ count: number }> => {
		const response = await api.get<{ count: number }>("/guests/getCount", {
			params: eventId ? { eventId } : undefined,
		});
		return response.data;
	},
	add: async (
		eventId: number,
		guestData: Omit<Guest, "id" | "qrToken" | "eventId">,
	): Promise<{ message?: string; guest: Guest }> => {
		const response = await api.post<{ message?: string; guest: Guest }>(
			`/guests/${eventId}`,
			guestData,
		);
		return response.data;
	},
	update: async (
		guestId: number,
		eventId: number,
		guestData: Partial<Guest>,
	): Promise<{ message?: string; guest: Guest }> => {
		const response = await api.put<{ message?: string; guest: Guest }>(
			`/guests/${guestId}/${eventId}`,
			guestData,
		);
		return response.data;
	},
	delete: async (id: number): Promise<{ message?: string }> => {
		const response = await api.delete<{ message?: string }>(`/guests/${id}`);
		return response.data;
	},
	regenerateToken: async (
		id: number,
	): Promise<{ message?: string; token: string }> => {
		const response = await api.post<{ message?: string; token: string }>(
			`/guests/${id}/regen-token`,
		);
		return response.data;
	},
	getQRCode: async (id: number): Promise<Blob> => {
		const response = await api.get(`/guests/${id}/qr.png`, {
			responseType: "blob",
		});
		return response.data;
	},
	bulkUpload: (
		eventId: number,
		file: File,
	): Promise<{ imported: number; skipped?: { row: number; reason: string }[] }> => {
		const formData = new FormData();
		formData.append("file", file);
		return api
			.post(`/guests/bulk/${eventId}`, formData, {
				headers: { "Content-Type": "multipart/form-data" },
			})
			.then((response) => response.data);
	},
};
