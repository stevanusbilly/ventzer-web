import {
	Event,
	EventLocation,
	EventPhoto,
	Gift,
	GuestMessage,
	Wedding,
} from "../../types";

export type ClassicInvitationMode = "preview" | "live";

export type ClassicInvitationSetting = {
	maxGaleriFoto?: number;
	fotoProfil?: boolean;
	socialMedia?: boolean;
	rsvp?: boolean;
	video?: boolean;
	addToCalendar?: boolean;
	loveStory?: boolean;
};

export type ClassicInvitationPhotos = {
	cover?: EventPhoto | null;
	opening?: EventPhoto | null;
	background?: EventPhoto | null;
	quote?: EventPhoto | null;
	profilBride?: EventPhoto | null;
	profilGroom?: EventPhoto | null;
	saveTheDate?: EventPhoto | null;
	akhir?: EventPhoto | null;
	gallery: EventPhoto[];
};

export type ClassicInvitationRsvpPayload = {
	kehadiran: 1 | 2;
	jumlahKehadiran?: number;
};

export type ClassicInvitationProps = {
	event: Event;
	wedding: Wedding | null;
	locations: EventLocation[];
	gifts: Gift[];
	messages: GuestMessage[];
	photos: ClassicInvitationPhotos;
	guestName: string;
	guestRsvpStatus?: string;
	guestRsvpJumlah?: number | null;
	setting?: ClassicInvitationSetting;
	mode?: ClassicInvitationMode;
	onRsvp?: (payload: ClassicInvitationRsvpPayload) => Promise<void> | void;
	onSendMessage?: (message: string) => Promise<void> | void;
};
