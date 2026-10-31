import axios from "axios";
import { InvitationData, InvitationMessage } from "../types";

const API_BASE_URL =
	process.env.REACT_APP_API_URL || "http://localhost:3000/api";

const publicApi = axios.create({
	baseURL: API_BASE_URL,
	timeout: 30_000,
});

const invitationPath = (token: string): string =>
	`/invitation/${encodeURIComponent(token)}`;

export const invitationService = {
	getInvitation: async (token: string): Promise<InvitationData> => {
		const response = await publicApi.get<InvitationData>(invitationPath(token));
		return response.data;
	},

	submitRsvp: async (
		token: string,
		payload: { kehadiran: 1 | 2; jumlahKehadiran?: number },
	): Promise<{
		message?: string;
		guest?: {
			id: number;
			name: string;
			rsvpStatus: string;
			rsvpJumlah: number;
		};
	}> => {
		const response = await publicApi.post<{
			message?: string;
			guest?: {
				id: number;
				name: string;
				rsvpStatus: string;
				rsvpJumlah: number;
			};
		}>(`${invitationPath(token)}/rsvp`, payload);
		return response.data;
	},

	submitMessage: async (
		token: string,
		payload: { message: string },
	): Promise<{ message?: string; data?: InvitationMessage }> => {
		const response = await publicApi.post<{
			message?: string;
			data?: InvitationMessage;
		}>(`${invitationPath(token)}/message`, payload);
		return response.data;
	},
};
