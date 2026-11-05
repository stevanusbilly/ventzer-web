const DAYS = [
	"Minggu",
	"Senin",
	"Selasa",
	"Rabu",
	"Kamis",
	"Jumat",
	"Sabtu",
];
const MONTHS = [
	"Januari",
	"Februari",
	"Maret",
	"April",
	"Mei",
	"Juni",
	"Juli",
	"Agustus",
	"September",
	"Oktober",
	"November",
	"Desember",
];

export const getImageUrl = (path?: string | null): string => {
	if (!path) return "";
	if (
		path.startsWith("http://") ||
		path.startsWith("https://") ||
		path.startsWith("blob:") ||
		path.startsWith("data:")
	) {
		return path;
	}
	const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:3000/api";
	const baseUrl = apiUrl.replace(/\/api\/?$/, "");
	return `${baseUrl}${path.startsWith("/") ? "" : "/"}${path}`;
};

export const parseDate = (value?: string | null): Date | null => {
	if (!value) return null;
	const date = new Date(value);
	return Number.isNaN(date.getTime()) ? null : date;
};

export const formatLongDate = (value?: string | null): string => {
	const date = parseDate(value);
	if (!date) return "";
	return `${DAYS[date.getDay()]}, ${String(date.getDate()).padStart(2, "0")} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
};

export const formatShortDate = (value?: string | null): string => {
	const date = parseDate(value);
	if (!date) return "";
	return `${String(date.getDate()).padStart(2, "0")} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
};

export const formatDotDate = (value?: string | null): string => {
	const date = parseDate(value);
	if (!date) return "";
	const day = String(date.getDate()).padStart(2, "0");
	const month = String(date.getMonth() + 1).padStart(2, "0");
	return `${day} . ${month} . ${date.getFullYear()}`;
};

export const formatTime = (value?: string | null): string => {
	if (!value) return "";
	return value.substring(0, 5);
};

export const toGoogleCalendarUrl = (
	title: string,
	start?: string | null,
	location?: string,
): string => {
	const date = parseDate(start);
	if (!date) return "";
	const end = new Date(date.getTime() + 3 * 60 * 60 * 1000);
	const stamp = (d: Date) =>
		d
			.toISOString()
			.replace(/[-:]/g, "")
			.replace(/\.\d{3}Z$/, "Z");
	const params = new URLSearchParams({
		action: "TEMPLATE",
		text: title,
		dates: `${stamp(date)}/${stamp(end)}`,
		location: location || "",
	});
	return `https://calendar.google.com/calendar/render?${params.toString()}`;
};

export const youtubeEmbedUrl = (url?: string | null): string => {
	if (!url) return "";
	const match = url.match(
		/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([A-Za-z0-9_-]{6,})/,
	);
	return match?.[1] ? `https://www.youtube.com/embed/${match[1]}` : url;
};
