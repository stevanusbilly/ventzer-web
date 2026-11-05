import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { eventService } from "../../services/eventService";
import { weddingService } from "../../services/weddingService";
import { eventPhotoService } from "../../services/eventPhotoService";
import { eventLocationService } from "../../services/eventLocationService";
import { giftService } from "../../services/giftService";
import { guestMessageService } from "../../services/guestMessageService";
import { eventSettingService } from "../../services/eventSettingService";
import {
	Event,
	EventLocation,
	EventPhoto,
	EventSetting,
	Gift,
	GuestMessage,
	Wedding,
} from "../../types";
import { ClassicInvitationTemplate } from "../../invitation-templates/classic-tsx";
import { BronzeInvitationTemplate } from "../../invitation-templates/bronze-tsx";
import { isBronzeTemplate } from "../../invitation-templates/isBronzeTemplate";
import { ChinesePremiumTemplate } from "../../invitation-templates/chinese-premium";
import { isChinesePremiumTemplate } from "../../invitation-templates/isChinesePremiumTemplate";

const EventPreviewTsx: React.FC = () => {
	const { id } = useParams();
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [event, setEvent] = useState<Event | null>(null);
	const [wedding, setWedding] = useState<Wedding | null>(null);
	const [locations, setLocations] = useState<EventLocation[]>([]);
	const [gifts, setGifts] = useState<Gift[]>([]);
	const [messages, setMessages] = useState<GuestMessage[]>([]);
	const [setting, setSetting] = useState<EventSetting | null>(null);
	const [photos, setPhotos] = useState<{
		cover: EventPhoto | null;
		opening: EventPhoto | null;
		background: EventPhoto | null;
		quote: EventPhoto | null;
		profilBride: EventPhoto | null;
		profilGroom: EventPhoto | null;
		saveTheDate: EventPhoto | null;
		akhir: EventPhoto | null;
		gallery: EventPhoto[];
		loveStory: EventPhoto[];
	}>({
		cover: null,
		opening: null,
		background: null,
		quote: null,
		profilBride: null,
		profilGroom: null,
		saveTheDate: null,
		akhir: null,
		gallery: [],
		loveStory: [],
	});

	useEffect(() => {
		const load = async (): Promise<void> => {
			if (!id) {
				setError("Event tidak valid");
				setLoading(false);
				return;
			}
			try {
				const eventId = Number(id);
				const eventData = await eventService.getById(eventId);
				setEvent(eventData);

				const [
					weddingData,
					locationData,
					giftData,
					messageData,
					cover,
					opening,
					background,
					quote,
					profilBride,
					profilGroom,
					saveTheDate,
					akhir,
					gallery,
					loveStory,
				] = await Promise.all([
					weddingService.getByEvent(eventId).catch(() => null),
					eventLocationService.getByEvent(eventId).catch(() => []),
					giftService.getByEvent(eventId).catch(() => []),
					guestMessageService.getByEvent(eventId).catch(() => []),
					eventPhotoService.getCoverByEvent(eventId),
					eventPhotoService.getOpeningByEvent(eventId),
					eventPhotoService.getBackgroundByEvent(eventId),
					eventPhotoService.getQuoteByEvent(eventId),
					eventPhotoService.getProfilBrideByEvent(eventId),
					eventPhotoService.getProfilGroomByEvent(eventId),
					eventPhotoService.getSaveTheDateByEvent(eventId),
					eventPhotoService.getFotoAkhirByEvent(eventId),
					eventPhotoService.listGalleryByEvent(eventId),
					eventPhotoService.listLoveStoryByEvent(eventId),
				]);

				setWedding(weddingData);
				setLocations(locationData);
				setGifts(giftData);
				setMessages(messageData);
				setPhotos({
					cover,
					opening,
					background,
					quote,
					profilBride,
					profilGroom,
					saveTheDate,
					akhir,
					gallery: gallery || [],
					loveStory: loveStory || [],
				});

				try {
					setSetting(await eventSettingService.getByEvent(eventId));
				} catch {
					setSetting(null);
				}
			} catch {
				setError("Gagal memuat preview undangan");
			} finally {
				setLoading(false);
			}
		};

		void load();
	}, [id]);

	if (loading) {
		return (
			<div className="flex justify-content-center align-items-center min-h-screen">
				<p>Memuat template TSX...</p>
			</div>
		);
	}

	if (!event) {
		return (
			<div className="flex justify-content-center align-items-center min-h-screen p-4">
				<p>{error || "Event tidak ditemukan"}</p>
			</div>
		);
	}

	const Template = isChinesePremiumTemplate(event)
		? ChinesePremiumTemplate
		: isBronzeTemplate(event)
			? BronzeInvitationTemplate
			: ClassicInvitationTemplate;

	return (
		<Template
			event={event}
			wedding={wedding}
			locations={locations}
			gifts={gifts}
			messages={messages}
			photos={photos}
			guestName="Preview"
			setting={{
				maxGaleriFoto: setting?.maxGaleriFoto,
				fotoProfil: setting ? Number(setting.fotoProfil) === 1 : true,
				socialMedia: setting ? Number(setting.socialMedia) === 1 : true,
				rsvp: setting ? Number(setting.rsvp) === 1 : true,
				video: setting ? Number(setting.video) === 1 : true,
				addToCalendar: setting ? Number(setting.addToCalendar) === 1 : true,
				loveStory: setting ? Number(setting.loveStory) === 1 : true,
			}}
			mode="preview"
		/>
	);
};

export default EventPreviewTsx;
