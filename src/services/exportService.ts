import api from "./api";

export const exportService = {
	exportGuestsToExcel: (eventId: number): Promise<Blob> => {
		return api
			.get(`/export/event/${eventId}/guests`, { responseType: "blob" })
			.then((response) => response.data);
	},
};
