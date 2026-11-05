import { useMemo } from "react";
import {
	ADDONS,
	CATALOG_ITEMS,
	CUSTOM_RSVP,
	GUESTBOOK_PACKAGE,
	HOME_PILLARS,
	HOME_PRODUCTS,
	HOME_QUOTES,
	HOME_TRUST,
	LIVE_STREAM_PACKAGES,
	MARKETING_FAQS,
	MarketingPackage,
	ORDER_STEPS,
	RSVP_PACKAGES,
	STARTER_FEATURES,
} from "../data/marketing";
import { useI18n } from "./I18nContext";
import { Locale } from "./locale";

export type MarketingContent = {
	starterFeatures: string[];
	rsvpPackages: MarketingPackage[];
	customRsvp: MarketingPackage;
	addons: typeof ADDONS;
	guestbook: MarketingPackage;
	livePackages: MarketingPackage[];
	catalog: typeof CATALOG_ITEMS;
	orderSteps: typeof ORDER_STEPS;
	homeProducts: typeof HOME_PRODUCTS;
	quotes: typeof HOME_QUOTES;
	pillars: typeof HOME_PILLARS;
	trust: string[];
	faqs: typeof MARKETING_FAQS;
};

const EN_STARTER = [
	"Guest name on the invite",
	"Easy invitation sharing",
	"Photo gallery",
	"Maps / location",
	"Music / backsound",
	"Digital envelope",
	"Wishes column",
];

const EN_RSVP: MarketingPackage[] = [
	{
		...RSVP_PACKAGES[0],
		name: "Bronze Package",
		eyebrow: "Digital invitation",
		description:
			"A minimal design with the core features, ideal for formal or informal celebrations.",
		features: ["Starter features", "Up to 5 gallery photos"],
	},
	{
		...RSVP_PACKAGES[1],
		name: "Silver Package",
		eyebrow: "Digital invitation",
		description: "For invitations that need more variety and a stronger impression.",
		features: [
			"Starter features",
			"Up to 10 gallery photos",
			"Couple profile photos",
			"Couple social media",
		],
	},
	{
		...RSVP_PACKAGES[2],
		name: "Gold Package",
		eyebrow: "Digital invitation",
		description: "A striking design with features that help you and your guests.",
		features: [
			"Starter features",
			"Up to 20 gallery photos",
			"Couple profile photos",
			"Couple social media",
			"RSVP / attendance confirmation",
			"Prewedding video player",
		],
		badge: "Most requested",
	},
	{
		...RSVP_PACKAGES[3],
		name: "Diamond Package",
		eyebrow: "Digital invitation",
		description: "The fullest package for invitations that feel personal through the event day.",
		features: [
			"Starter features",
			"Up to 25 gallery photos",
			"Couple profile photos",
			"Couple social media",
			"RSVP / attendance confirmation",
			"Prewedding video player",
			"Add to Calendar",
			"Love Story",
		],
	},
];

const EN_CUSTOM: MarketingPackage = {
	...CUSTOM_RSVP,
	name: "Custom Design",
	eyebrow: "Design by request",
	description: "Create the most unique invitation, with every VENTZER feature included.",
	features: [
		"All Diamond features",
		"Design made to request",
		"Direct consultation with the team",
		"Revisions until the design is final",
	],
};

const EN_ADDONS = [
	{
		title: "Custom Domain",
		detail:
			"Use your couple name, for example raditjanimenikah.com. Our team will help set it up.",
		price: "Contact the team",
	},
	{
		title: "Express delivery",
		detail: "Need it faster than regular? We deliver in 24 working hours.",
		price: "+ Rp 50.000",
	},
];

const EN_GUESTBOOK: MarketingPackage = {
	...GUESTBOOK_PACKAGE,
	name: "Digital Guest Book",
	eyebrow: "Event day",
	description:
		"On-site guest system: invitations, RSVP, QR, seating, digital envelope, and crew support.",
};

const EN_LIVE: MarketingPackage[] = [
	{
		...LIVE_STREAM_PACKAGES[0],
		description: "Live event broadcast with crew, modem, and a recorded file.",
		bonus: "Free Basic digital invitation",
	},
	{
		...LIVE_STREAM_PACKAGES[1],
		description: "Complete streaming package plus an Intimate digital invitation.",
		bonus: "Free Intimate digital invitation",
	},
	{
		...LIVE_STREAM_PACKAGES[2],
		description: "Premium streaming with a digital guest book included.",
		bonus: "Free digital guest book",
	},
];

const EN_CATALOG = CATALOG_ITEMS.map((item) => {
	const tags: Record<string, string> = {
		Elegan: "Elegant",
		Botanical: "Botanical",
		Tradisional: "Traditional",
		Premium: "Premium",
	};
	return { ...item, tag: tags[item.tag] || item.tag };
});

const EN_STEPS = [
	{
		no: "01",
		title: "Choose a package & design",
		desc: "Pick a digital invitation, guest book, or live streaming. Choose a template from the catalog.",
	},
	{
		no: "02",
		title: "Send details & consult",
		desc: "Share couple, event, and reference details. No down payment — pay once.",
	},
	{
		no: "03",
		title: "We build it",
		desc: "Regular delivery is 3–5 working days. Need it faster? Express in 24 hours + Rp 50,000.",
	},
	{
		no: "04",
		title: "Revise until final",
		desc: "Unlimited revisions until the design is approved. Support stays through the event day.",
	},
	{
		no: "05",
		title: "Send invitations",
		desc: "Share via WhatsApp with each guest name. RSVP, wishes, and attendance stay on the dashboard.",
	},
];

const EN_PRODUCTS: typeof HOME_PRODUCTS = [
	{
		...HOME_PRODUCTS[0],
		title: "Digital Invitation",
		kicker: "Invitation website",
		summary:
			"Build a complete invitation website with an elegant theme. Guests open a page that greets them by name, then share it on WhatsApp in one tap.",
		imageAlt: "A couple viewing a digital invitation on a phone",
		features: [
			{
				title: "Guest names",
				icon: "pi pi-user",
				desc: "Every invite feels personal. Guests open a page that greets them by name, not a mass blast.",
			},
			{
				title: "WhatsApp sharing",
				icon: "pi pi-send",
				desc: "Share the invitation link in one tap. No printing hundreds of cards or waiting at the print shop.",
			},
			{
				title: "Gallery & Love Story",
				icon: "pi pi-images",
				desc: "Photos, prewedding video, and your story flow in one elegant sequence.",
			},
			{
				title: "Maps & music",
				icon: "pi pi-map-marker",
				desc: "Guests open the venue location instantly. Backsound makes the invite feel alive from the first screen.",
			},
			{
				title: "Digital envelope",
				icon: "pi pi-wallet",
				desc: "Guests send a gift without hunting for account numbers. Everything lands neatly on the dashboard.",
			},
			{
				title: "RSVP & wishes",
				icon: "pi pi-comments",
				desc: "Attendance and messages arrive automatically. Ready to read whenever you need them before the day.",
			},
		],
	},
	{
		...HOME_PRODUCTS[1],
		title: "Digital Guest Book",
		kicker: "On site, event day",
		summary:
			"Guests do not queue to write their names. RSVP becomes an entry QR, scanned at the door, seats are found instantly, and records stay tidy.",
		imageAlt: "Reception and guest welcome",
		features: [
			{
				title: "RSVP & QR Code",
				icon: "pi pi-qrcode",
				desc: "Guests confirm attendance, then receive a QR as their venue ticket.",
			},
			{
				title: "Guest reception",
				icon: "pi pi-tablet",
				desc: "Ushers scan the QR on a tablet. Fast check-in, no wet guest book or long lines.",
			},
			{
				title: "Table & seat",
				icon: "pi pi-th-large",
				desc: "Guests know their table and seat immediately. The floor plan lives on the dashboard, not taped paper.",
			},
			{
				title: "Welcome screen",
				icon: "pi pi-desktop",
				desc: "Guest names appear at check-in. The welcome feels warm and modern.",
			},
			{
				title: "Crew & devices",
				icon: "pi pi-users",
				desc: "Tablet, modem, and technical crew are on site so the guest flow stays smooth.",
			},
			{
				title: "E-gift & angpao QR",
				icon: "pi pi-gift",
				desc: "Digital envelopes and printed angpao QR. Guests can give a gift without confusion.",
			},
		],
	},
	{
		...HOME_PRODUCTS[2],
		title: "Live Streaming",
		kicker: "Virtual broadcast",
		summary:
			"Broadcast the ceremony and reception for family who cannot attend. Stream on YouTube or Instagram, with a recording you can keep.",
		imageAlt: "A wedding moment ready to stream",
		features: [
			{
				title: "YouTube / Instagram",
				icon: "pi pi-video",
				desc: "The stream goes to platforms the family already uses, with no extra app.",
			},
			{
				title: "Camera movement",
				icon: "pi pi-camera",
				desc: "The camera follows the moment, not a stiff locked-off angle.",
			},
			{
				title: "Wedding frame",
				icon: "pi pi-stop",
				desc: "A custom wedding frame makes the stream feel like a film, not a raw recording.",
			},
			{
				title: "Full record",
				icon: "pi pi-download",
				desc: "The entire broadcast is recorded. The memory can be watched again anytime.",
			},
			{
				title: "Live cam to screen",
				icon: "pi pi-desktop",
				desc: "Guests at the venue watch the same screen as family at home.",
			},
			{
				title: "Crew & modem",
				icon: "pi pi-wifi",
				desc: "The team and backup connection come on site, so the stream does not depend on hotel Wi-Fi.",
			},
		],
	},
];

const EN_QUOTES = [
	{
		quote:
			"The invitation felt so personal. Our parents read the love story to the end, and RSVP stayed tidy on the dashboard.",
		couple: "Sari & Bagas",
		place: "Bandung",
	},
	{
		quote:
			"The door queue disappeared. Guests scanned a QR, names appeared, seats were found. The digital guest book is what we valued most.",
		couple: "Lila & Arya",
		place: "Jakarta",
	},
	{
		quote:
			"Aunts and uncles out of town watched the ceremony from home. The stream was smooth, and the recording was complete to keep.",
		couple: "Nia & Farhan",
		place: "Surabaya",
	},
];

const EN_PILLARS = [
	{
		...HOME_PILLARS[0],
		desc: "Invite guests personally, collect attendance, and watch everything from one dashboard.",
	},
	{
		...HOME_PILLARS[1],
		desc: "Manage the guest list, tables, and RSVP status without scattered spreadsheets.",
	},
	{
		...HOME_PILLARS[2],
		desc: "Scan QR at the door, greet guests, and record attendance in real time.",
	},
	{
		...HOME_PILLARS[3],
		desc: "Broadcast the event to YouTube or Instagram, with a recording for family far away.",
	},
];

const EN_TRUST = [
	"One platform, every event",
	"Invitation, RSVP, check-in",
	"Realtime guest management",
	"Live streaming ready",
	"Invitation themes stay flexible",
];

const EN_FAQS = [
	{
		question: "How long does production take?",
		answer:
			"Regular packages take 3–5 working days, custom design 5–7 working days. Timing can shift with the queue. Express is available with an extra Rp 50,000 for 24 working hours.",
	},
	{
		question: "Do revisions cost extra?",
		answer: "No. Revisions are free and we support you through the event day.",
	},
	{
		question: "How long does the invitation stay active?",
		answer:
			"It stays active for 6 months after the event day. Before the event, the invitation stays active at no extra cost.",
	},
	{
		question: "How far in advance should we order?",
		answer:
			"Ideally about a month before the event. If it is urgent, we can still help, including less than a day with the express package.",
	},
	{
		question: "Can this be used for events other than weddings?",
		answer: "Yes. Tell us what the invitation needs, and the team will adapt it.",
	},
	{
		question: "Can the invitation use a language other than Indonesian?",
		answer: "Yes. Tell us which language you want on the invitation.",
	},
];

const ID_CONTENT: MarketingContent = {
	starterFeatures: STARTER_FEATURES,
	rsvpPackages: RSVP_PACKAGES,
	customRsvp: CUSTOM_RSVP,
	addons: ADDONS,
	guestbook: GUESTBOOK_PACKAGE,
	livePackages: LIVE_STREAM_PACKAGES,
	catalog: CATALOG_ITEMS,
	orderSteps: ORDER_STEPS,
	homeProducts: HOME_PRODUCTS,
	quotes: HOME_QUOTES,
	pillars: HOME_PILLARS,
	trust: HOME_TRUST,
	faqs: MARKETING_FAQS,
};

const EN_CONTENT: MarketingContent = {
	starterFeatures: EN_STARTER,
	rsvpPackages: EN_RSVP,
	customRsvp: EN_CUSTOM,
	addons: EN_ADDONS,
	guestbook: EN_GUESTBOOK,
	livePackages: EN_LIVE,
	catalog: EN_CATALOG,
	orderSteps: EN_STEPS,
	homeProducts: EN_PRODUCTS,
	quotes: EN_QUOTES,
	pillars: EN_PILLARS,
	trust: EN_TRUST,
	faqs: EN_FAQS,
};

export const getMarketing = (locale: Locale): MarketingContent =>
	locale === "en" ? EN_CONTENT : ID_CONTENT;

export const useMarketing = (): MarketingContent => {
	const { locale } = useI18n();
	return useMemo(() => getMarketing(locale), [locale]);
};
