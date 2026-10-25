type ApiErrorBody = {
	message?: string;
	error?: string;
	details?: string[];
	debug?: string;
};

function getBody(error: unknown): ApiErrorBody | undefined {
	const err = error as { response?: { data?: ApiErrorBody; status?: number } };
	return err.response?.data;
}

export function getApiErrorMessage(
	error: unknown,
	fallback = "Terjadi kesalahan",
): string {
	const err = error as {
		response?: { data?: ApiErrorBody; status?: number };
		code?: string;
		message?: string;
	};
	const data = getBody(error);
	const status = err.response?.status;

	if (data?.details && Array.isArray(data.details) && data.details.length > 0) {
		return data.details.join("\n");
	}

	if (typeof data?.message === "string" && data.message.trim()) {
		if (process.env.NODE_ENV !== "production" && data.debug) {
			return `${data.message} (${data.debug})`;
		}
		return data.message;
	}

	if (typeof data?.error === "string" && data.error.trim()) {
		return data.error;
	}

	if (status === 429) {
		return "Terlalu banyak request. Coba lagi sebentar.";
	}

	if (!err.response) {
		if (err.code === "ECONNABORTED") {
			return "Request timeout. Periksa koneksi atau coba lagi.";
		}
		return "Tidak dapat terhubung ke server. Pastikan backend berjalan.";
	}

	return fallback;
}
