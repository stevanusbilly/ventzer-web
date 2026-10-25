export type UserRole = "admin" | "panitia" | "viewer";

export interface User {
	id: number;
	username: string;
	name: string;
	password?: string;
	change_password?: number;
	email?: string;
	role: UserRole;
}

export interface CategoryPhoto {
	id: number;
	name: string;
}

export interface Template {
	id: number;
	name: string;
}

export interface Event {
	id: number;
	templateId: number;
	userId: number;
	userName: string;
	templateName: string;
	name: string;
	date: string;
	music_url: string;
	autoplay_music: number;
	dresscode: string;
}

export interface EventSummary {
	totalGuests: number;
	pending: number;
	accepted: number;
	declined: number;
	checkedIn: number;
}

export interface EventLocation {
	id: number;
	eventId: number;
	eventName: string;
	name: string;
	location: string;
	alamat: string;
	date: string;
	startTime: string;
	endTime: string;
	urlMaps: string;
	order: number;
}

export interface EventSetting {
	id: number;
	eventId: number;
	eventName: string;
	maxGaleriFoto: number;
	fotoProfil: number;
	socialMedia: number;
	rsvp: number;
	video: number;
	addToCalendar: number;
	loveStory: number;
}

export interface Gift {
	id: number;
	eventId: number;
	eventName: string;
	name: string;
	nomor: string;
	provider: string;
}

export interface EventTable {
	id: number;
	eventId: number;
	eventName: string;
	kategori: string;
	menu: string;
	note: string;
	jumlahKursi: number;
	jumlahGuest: number;
}

export interface EventTableGuest {
	id: number;
	eventId: number;
	eventName: string;
	tableId: number;
	tableName: string;
	guestId: number;
	guestName: string;
	jumlah: number;
}

export interface GuestMessage {
	id: number;
	eventId: number;
	eventName: string;
	guestId: number;
	guestName: string;
	message: string;
	createdAt?: string;
}

export interface EventPhoto {
	id: number;
	eventId: number;
	eventName: string;
	categoryPhotoId: number;
	categoryPhotoName: string;
	name: string;
	date: string;
	keterangan: string;
	pathImage: string;
	order: number;
}

export interface Wedding {
	id: number;
	eventId: number;
	namaLengkapBride: string;
	namaLengkapGroom: string;
	namaPanggilanBride: string;
	namaPanggilanGroom: string;
	bioBride: string;
	bioGroom: string;
	sosmedBride: string;
	sosmedGroom: string;
	quote: string;
	openingText: string;
	loveStory: string;
	urlVideoPrewedding: string;
	urlVideoStreaming: string;
}

export interface Guest {
	id: number;
	eventId: number;
	eventName?: string;
	name: string;
	phone?: string;
	email?: string;
	rsvpStatus: "pending" | "accepted" | "declined";
	rsvpAt?: string | null;
	rsvpJumlah?: number | null;
	qrToken: string;
	checkedIn?: string | null;
	checkedInAt?: string | null;
}

export interface LoginCredentials {
	username: string;
	password: string;
}

export interface RegisterData {
	username: string;
	name: string;
	email: string;
	password: string;
	role: string;
}

export interface AuthResponse {
	message?: string;
	token: string;
	user: User;
}

export interface CheckinRequest {
	token: string;
	eventId: number | string;
	scanLocation?: string;
}

export interface CheckinTableInfo {
	tableId?: number;
	tableName?: string;
	jumlah?: number;
}

export interface CheckinResponse {
	message: string;
	guest?: {
		id: number;
		name: string;
		email?: string;
		phone?: string;
		event?: string;
		checkedIn?: string;
		checkedInAt?: string;
		table?: CheckinTableInfo | null;
	};
}

export interface InvitationGuest {
	id: number;
	name: string;
	rsvpStatus: string;
	rsvpJumlah?: number | null;
	rsvpAt?: string | null;
	table?: CheckinTableInfo | null;
}

export interface InvitationSetting {
	maxGaleriFoto: number;
	fotoProfil: boolean;
	socialMedia: boolean;
	rsvp: boolean;
	video: boolean;
	addToCalendar: boolean;
	loveStory: boolean;
}

export interface InvitationData {
	event: Event;
	setting: InvitationSetting;
	wedding: Wedding | null;
	locations: EventLocation[];
	photos: EventPhoto[];
	gifts: Gift[];
	messages: { id: number; guestName: string; message: string; createdAt?: string }[];
	guest: InvitationGuest;
}

export interface EventAssignmentUser {
	id: number;
	userId: number;
	username: string;
	name: string;
	email?: string;
	role: UserRole;
	createdAt?: string;
}

export interface AssignedEventsResponse {
	userId: number;
	assignedEvents: {
		id: number;
		name: string;
		date: string;
		createdAt?: string;
		assignedAt?: string | null;
	}[];
}
