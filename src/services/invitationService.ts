import axios from "axios";
import { InvitationData } from "../types";

const API_BASE_URL =
	process.env.REACT_APP_API_URL || "http://localhost:3000/api";

const publicApi = axios.create({
	baseURL: API_BASE_URL,
	timeout: 30_000,
});

export const invitationService = {
	getInvitation: async (
		eventId: number,
		token: string,
	): Promise<InvitationData> => {
		const response = await publicApi.get<InvitationData>(
			`/invitation/${eventId}/${encodeURIComponent(token)}`,
		);
		return response.data;
	},

	submitRsvp: async (
		eventId: number,
		token: string,
		payload: { kehadiran: 1 | 2; jumlahKehadiran?: number },
	): Promise<void> => {
		await publicApi.post(
			`/invitation/${eventId}/${encodeURIComponent(token)}/rsvp`,
			payload,
		);
	},

	submitMessage: async (
		eventId: number,
		token: string,
		payload: {
			message: string;
			kehadiran?: 1 | 2;
			jumlahKehadiran?: number;
		},
	): Promise<void> => {
		await publicApi.post(
			`/invitation/${eventId}/${encodeURIComponent(token)}/message`,
			payload,
		);
	},
};
