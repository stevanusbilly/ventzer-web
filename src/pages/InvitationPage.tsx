import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { Message } from "primereact/message";
import { Toast } from "primereact/toast";
import { invitationService } from "../services/invitationService";
import { EventPhoto, GuestMessage, InvitationData } from "../types";
import { getApiErrorMessage, getApiSuccessMessage } from "../utils/apiError";
import { ClassicInvitationTemplate } from "../invitation-templates/classic-tsx";
import { ClassicInvitationPhotos } from "../invitation-templates/classic-tsx/types";

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
});

const InvitationPage: React.FC = () => {
	const { eventId, token } = useParams<{ eventId: string; token: string }>();
	const [data, setData] = useState<InvitationData | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const toast = useRef<Toast>(null);

	const load = async (): Promise<void> => {
		if (!eventId || !token) {
			setError("Link undangan tidak valid");
			setLoading(false);
			return;
		}
		try {
			const response = await invitationService.getInvitation(
				Number(eventId),
				token,
			);
			setData(response);
			setError("");
		} catch (err) {
			setError(getApiErrorMessage(err, "Undangan tidak ditemukan"));
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		void load();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [eventId, token]);

	const handleRsvp = async (payload: {
		kehadiran: 1 | 2;
		jumlahKehadiran?: number;
	}): Promise<void> => {
		if (!eventId || !token) return;
		try {
			const result = await invitationService.submitRsvp(Number(eventId), token, {
				kehadiran: payload.kehadiran,
				jumlahKehadiran:
					payload.kehadiran === 1 ? payload.jumlahKehadiran || 1 : 0,
			});
			toast.current?.show({
				severity: "success",
				summary: "Berhasil",
				detail: getApiSuccessMessage(
					result,
					payload.kehadiran === 1
						? "Terima kasih, kehadiran Anda tercatat."
						: "Terima kasih atas konfirmasinya.",
				),
				life: 3000,
			});
			await load();
		} catch (err) {
			toast.current?.show({
				severity: "error",
				summary: "Gagal",
				detail: getApiErrorMessage(err, "Gagal menyimpan RSVP"),
				life: 4000,
			});
		}
	};

	const handleMessage = async (message: string): Promise<void> => {
		if (!eventId || !token) return;
		try {
			const result = await invitationService.submitMessage(
				Number(eventId),
				token,
				{ message },
			);
			toast.current?.show({
				severity: "success",
				summary: "Berhasil",
				detail: getApiSuccessMessage(result, "Ucapan Anda berhasil dikirim."),
				life: 3000,
			});
			await load();
		} catch (err) {
			toast.current?.show({
				severity: "error",
				summary: "Gagal",
				detail: getApiErrorMessage(err, "Gagal mengirim ucapan"),
				life: 4000,
			});
		}
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
		guestId: 0,
		guestName: row.guestName,
		message: row.message,
		published: 1,
		createdAt: row.createdAt,
	}));

	return (
		<>
			<Toast ref={toast} />
			<ClassicInvitationTemplate
				event={data.event}
				wedding={data.wedding}
				locations={data.locations}
				gifts={data.gifts}
				messages={messages}
				photos={toTemplatePhotos(data.photos)}
				guestName={data.guest.name}
				guestRsvpStatus={data.guest.rsvpStatus}
				guestRsvpJumlah={data.guest.rsvpJumlah}
				setting={data.setting}
				mode="live"
				onRsvp={handleRsvp}
				onSendMessage={handleMessage}
			/>
		</>
	);
};

export default InvitationPage;
