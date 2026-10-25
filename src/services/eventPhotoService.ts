import api from "./api";
import { EventPhoto } from "../types";

export const eventPhotoService = {
	list: async (): Promise<EventPhoto[]> => {
		const response = await api.get<EventPhoto[]>("/event_photo");
		return response.data;
	},
	get: async (id: number): Promise<EventPhoto> => {
		const response = await api.get<EventPhoto>(`/event_photo/${id}`);
		return response.data;
	},
	getByEvent: async (eventId: number): Promise<EventPhoto[]> => {
		const response = await api.get<EventPhoto[]>(`/event_photo/event/${eventId}`);
		return response.data;
	},
	listGalleryByEvent: async (eventId: number): Promise<EventPhoto[] | null> => {
		const response = await api.get<EventPhoto[]>(`/event_photo/gallery/event/${eventId}`)
			.catch(error => {
				return null;
			});
		if (response) return response.data;
		return null;
	},
	getQuoteByEvent: async (eventId: number): Promise<EventPhoto | null> => {
		const response = await api.get<EventPhoto>(`/event_photo/quote/event/${eventId}`)
			.catch(error => {
				return null;
			});
		if (response) return response.data;
		return null;
	},
	getProfilBrideByEvent: async (eventId: number): Promise<EventPhoto | null> => {
		const response = await api.get<EventPhoto>(`/event_photo/profil_bride/event/${eventId}`)
			.catch(error => {
				return null;
			});
		if (response) return response.data;
		return null;
	},
	getProfilGroomByEvent: async (eventId: number): Promise<EventPhoto | null> => {
		const response = await api.get<EventPhoto>(`/event_photo/profil_groom/event/${eventId}`)
			.catch(error => {
				return null;
			});
		if (response) return response.data;
		return null;
	},
	getSaveTheDateByEvent: async (eventId: number): Promise<EventPhoto | null> => {
		const response = await api.get<EventPhoto>(`/event_photo/save_the_date/event/${eventId}`)
			.catch(error => {
				return null;
			});
		if (response) return response.data;
		return null;
	},
	getFotoAkhirByEvent: async (eventId: number): Promise<EventPhoto | null> => {
		const response = await api.get<EventPhoto>(`/event_photo/akhir/event/${eventId}`)
			.catch(error => {
				return null;
			});
		if (response) return response.data;
		return null;
	},
	
	getCoverByEvent: async (eventId: number): Promise<EventPhoto | null> => {
		const response = await api.get<EventPhoto>(`/event_photo/cover/event/${eventId}`)
			.catch(error => {
				return null;
			});
		if (response) return response.data;
		return null;
	},
	getOpeningByEvent: async (eventId: number): Promise<EventPhoto | null> => {
		const response = await api.get<EventPhoto>(`/event_photo/opening/event/${eventId}`)
			.catch(error => {
				return null;
			});
		if (response) return response.data;
		return null;
	},
	getBackgroundByEvent: async (eventId: number): Promise<EventPhoto | null> => {
		const response = await api.get<EventPhoto>(`/event_photo/background/event/${eventId}`)
			.catch(error => {
				return null;
			});
		if (response) return response.data;
		return null;
	},
	ins: async (eventData: FormData | Omit<EventPhoto, "id">): Promise<EventPhoto> => {
		const response = await api.post<EventPhoto>("/event_photo", eventData, {
			headers:
				eventData instanceof FormData
					? { "Content-Type": "multipart/form-data" }
					: undefined,
		});
		return response.data;
	},
	upd: async (
		id: number,
		eventData: FormData | Partial<EventPhoto>
	): Promise<EventPhoto> => {
		const response = await api.put<EventPhoto>(
			`/event_photo/${id}`,
			eventData,
			{
				headers:
					eventData instanceof FormData
						? { "Content-Type": "multipart/form-data" }
						: undefined,
			}
		);
		return response.data;
	},
	del: (id: number): Promise<void> => {
		return api.delete(`/event_photo/${id}`);
	},
};
