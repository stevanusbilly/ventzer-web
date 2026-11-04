import {
	Event,
	EventLocation,
	EventPhoto,
	Gift,
	GuestMessage,
	Wedding,
} from "../../types";

export type BronzeInvitationMode = "preview" | "live";

export type BronzeInvitationSetting = {
	maxGaleriFoto?: number;
	fotoProfil?: boolean;
	socialMedia?: boolean;
	rsvp?: boolean;
	video?: boolean;
	addToCalendar?: boolean;
	loveStory?: boolean;
};

export type BronzeInvitationPhotos = {
	cover?: EventPhoto | null;
	opening?: EventPhoto | null;
	background?: EventPhoto | null;
	quote?: EventPhoto | null;
	profilBride?: EventPhoto | null;
	profilGroom?: EventPhoto | null;
	saveTheDate?: EventPhoto | null;
	akhir?: EventPhoto | null;
	gallery: EventPhoto[];
	loveStory: EventPhoto[];
};

export type BronzeInvitationRsvpPayload = {
	kehadiran: 1 | 2;
	jumlahKehadiran?: number;
};

export type BronzeInvitationProps = {
	event: Event;
	wedding: Wedding | null;
	locations: EventLocation[];
	gifts: Gift[];
	messages: GuestMessage[];
	photos: BronzeInvitationPhotos;
	guestId?: number;
	guestName: string;
	guestRsvpStatus?: string;
	guestRsvpJumlah?: number | null;
	guestMaxGuest?: number | null;
	guestHasSentMessage?: boolean;
	setting?: BronzeInvitationSetting;
	mode?: BronzeInvitationMode;
	onRsvp?: (payload: BronzeInvitationRsvpPayload) => Promise<void> | void;
	onSendMessage?: (message: string) => Promise<void> | void;
};
