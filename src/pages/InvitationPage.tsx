import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Message } from "primereact/message";
import { invitationService } from "../services/invitationService";
import { EventPhoto, GuestMessage, InvitationData } from "../types";
import { getApiErrorMessage } from "../utils/apiError";
import { ClassicInvitationTemplate } from "../invitation-templates/classic-tsx";
import { ClassicInvitationPhotos } from "../invitation-templates/classic-tsx/types";
import { BronzeInvitationTemplate } from "../invitation-templates/bronze-tsx";
import { isBronzeTemplate } from "../invitation-templates/isBronzeTemplate";
import { LOVE_STORY_CATEGORY } from "../utils/loveStory";

const findPhoto = (photos: EventPhoto[], category: string): EventPhoto | null =>
	photos.find((photo) => photo.categoryPhotoName === category) || null;

const toTemplatePhotos = (photos: EventPhoto[]): ClassicInvitationPhotos => ({
	cover: findPhoto(photos, "Cover Undangan"),
	opening: findPhoto(photos, "Opening"),
	background: findPhoto(photos, "Background Undangan"),
	quote: findPhoto(photos, "Foto Quote"),
	profilBride: findPhoto(photos, "Foto Profil Bride"),
	profilGroom: findPhoto(photos, "Foto Profil Groom"),
	saveTheDate: findPhoto(photos, "Foto Save The Date"),
	akhir: findPhoto(photos, "Foto Akhir"),
	gallery: photos.filter((photo) => photo.categoryPhotoName === "Gallery"),
	loveStory: photos
		.filter((photo) => photo.categoryPhotoName === LOVE_STORY_CATEGORY)
		.sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0) || a.id - b.id),
});

const InvitationPage: React.FC = () => {
	const { token } = useParams<{ token: string }>();
	const [data, setData] = useState<InvitationData | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	useEffect(() => {
		const load = async (): Promise<void> => {
			if (!token) {
				setError("Link undangan tidak valid");
				setLoading(false);
				return;
			}
			try {
				const response = await invitationService.getInvitation(token);
				setData(response);
				setError("");
			} catch (err) {
				setError(getApiErrorMessage(err, "Undangan tidak ditemukan"));
			} finally {
				setLoading(false);
			}
		};

		void load();
	}, [token]);

	const handleRsvp = async (payload: {
		kehadiran: 1 | 2;
		jumlahKehadiran?: number;
	}): Promise<void> => {
		if (!token) {
			throw new Error("Link undangan tidak valid");
		}
		const result = await invitationService.submitRsvp(token, {
			kehadiran: payload.kehadiran,
			jumlahKehadiran:
				payload.kehadiran === 1 ? payload.jumlahKehadiran || 1 : 0,
		});
		setData((prev) => {
			if (!prev || !result.guest) {
				return prev;
			}
			return {
				...prev,
				guest: {
					...prev.guest,
					rsvpStatus: result.guest.rsvpStatus,
					rsvpJumlah: result.guest.rsvpJumlah,
				},
			};
		});
	};

	const handleMessage = async (message: string): Promise<void> => {
		if (!token) {
			throw new Error("Link undangan tidak valid");
		}
		const result = await invitationService.submitMessage(token, { message });
		setData((prev) => {
			if (!prev || !result.data) {
				return prev;
			}
			return {
				...prev,
				guest: {
					...prev.guest,
					hasSentMessage: true,
				},
				messages: [
					result.data,
					...prev.messages.filter((row) => row.id !== result.data?.id),
				],
			};
		});
	};

	if (loading) {
		return (
			<div className="flex justify-content-center align-items-center min-h-screen">
				<p>Memuat undangan...</p>
			</div>
		);
	}

	if (!data) {
		return (
			<div className="flex justify-content-center align-items-center min-h-screen p-4">
				<Message severity="error" text={error || "Undangan tidak ditemukan"} />
			</div>
		);
	}

	const messages: GuestMessage[] = data.messages.map((row) => ({
		id: row.id,
		eventId: data.event.id,
		eventName: data.event.name,
		guestId: row.guestId,
		guestName: row.guestName,
		message: row.message,
		published: 1,
		createdAt: row.createdAt,
	}));

	const Template = isBronzeTemplate(data.event)
		? BronzeInvitationTemplate
		: ClassicInvitationTemplate;

	return (
		<Template
			event={data.event}
			wedding={data.wedding}
			locations={data.locations}
			gifts={data.gifts}
			messages={messages}
			photos={toTemplatePhotos(data.photos)}
			guestId={data.guest.id}
			guestName={data.guest.name}
			guestRsvpStatus={data.guest.rsvpStatus}
			guestRsvpJumlah={data.guest.rsvpJumlah}
			guestMaxGuest={data.guest.max_guest}
			guestHasSentMessage={Boolean(data.guest.hasSentMessage)}
			setting={data.setting}
			mode="live"
			onRsvp={handleRsvp}
			onSendMessage={handleMessage}
		/>
	);
};

export default InvitationPage;
