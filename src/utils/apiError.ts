import { isProduction } from "../config/env";

type ApiErrorBody = {
	message?: string;
	error?: string;
	details?: string[];
	debug?: string;
};

function normalizeErrorData(raw: unknown): ApiErrorBody | undefined {
	if (raw == null) {
		return undefined;
	}
	if (typeof raw === "string") {
		const trimmed = raw.trim();
		if (!trimmed) {
			return undefined;
		}
		try {
			const parsed: unknown = JSON.parse(trimmed);
			if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
				return parsed as ApiErrorBody;
			}
		} catch {
			return { message: trimmed };
		}
		return undefined;
	}
	if (typeof raw === "object" && !Array.isArray(raw)) {
		return raw as ApiErrorBody;
	}
	return undefined;
}

function getBody(error: unknown): ApiErrorBody | undefined {
	const err = error as { response?: { data?: unknown; status?: number } };
	return normalizeErrorData(err.response?.data);
}

/** Normalizes axios error bodies (e.g. Blob from responseType: blob) for getApiErrorMessage. */
export async function normalizeAxiosError(error: unknown): Promise<void> {
	const err = error as { response?: { data?: unknown } };
	const data = err.response?.data;
	if (!(data instanceof Blob)) {
		if (typeof data === "string") {
			const normalized = normalizeErrorData(data);
			if (normalized && err.response) {
				err.response.data = normalized;
			}
		}
		return;
	}
	try {
		const text = await data.text();
		const normalized = normalizeErrorData(text);
		if (normalized && err.response) {
			err.response.data = normalized;
		}
	} catch {
		// keep original blob if parsing fails
	}
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
		if (!isProduction && data.debug) {
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

type ApiSuccessBody = {
	message?: string;
	imported?: number;
	skipped?: unknown[];
};

export function getApiSuccessMessage(
	data: unknown,
	fallback: string,
): string {
	if (data == null) {
		return fallback;
	}
	if (typeof data === "object" && !Array.isArray(data)) {
		const body = data as ApiSuccessBody;
		if (typeof body.message === "string" && body.message.trim()) {
			return body.message;
		}
		if (typeof body.imported === "number") {
			const skipCount = Array.isArray(body.skipped) ? body.skipped.length : 0;
			if (skipCount > 0) {
				return `${body.imported} tamu diimpor, ${skipCount} baris dilewati`;
			}
			return `${body.imported} tamu berhasil diimpor`;
		}
	}
	return fallback;
}
