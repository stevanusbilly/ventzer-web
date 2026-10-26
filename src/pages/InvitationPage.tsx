import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { InputNumber } from "primereact/inputnumber";
import { InputTextarea } from "primereact/inputtextarea";
import { Message } from "primereact/message";
import { Tag } from "primereact/tag";
import { invitationService } from "../services/invitationService";
import { InvitationData } from "../types";
import { getApiErrorMessage, getApiSuccessMessage } from "../utils/apiError";

const InvitationPage: React.FC = () => {
	const { eventId, token } = useParams<{ eventId: string; token: string }>();
	const [data, setData] = useState<InvitationData | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");
	const [jumlah, setJumlah] = useState<number>(1);
	const [message, setMessage] = useState("");
	const [submitting, setSubmitting] = useState(false);

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
			setJumlah(response.guest.rsvpJumlah || 1);
		} catch (err) {
			setError(getApiErrorMessage(err, "Undangan tidak ditemukan"));
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		load();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [eventId, token]);

	const handleRsvp = async (kehadiran: 1 | 2): Promise<void> => {
		if (!eventId || !token) return;
		setSubmitting(true);
		setError("");
		setSuccess("");
		try {
			const data = await invitationService.submitRsvp(Number(eventId), token, {
				kehadiran,
				jumlahKehadiran: kehadiran === 1 ? jumlah : 0,
			});
			setSuccess(
				getApiSuccessMessage(
					data,
					kehadiran === 1
						? "Terima kasih, kehadiran Anda tercatat."
						: "Terima kasih atas konfirmasinya.",
				),
			);
			await load();
		} catch (err) {
			setError(getApiErrorMessage(err, "Gagal menyimpan RSVP"));
		} finally {
			setSubmitting(false);
		}
	};

	const handleMessage = async (): Promise<void> => {
		if (!eventId || !token || !message.trim()) return;
		setSubmitting(true);
		setError("");
		try {
			const data = await invitationService.submitMessage(
				Number(eventId),
				token,
				{
					message: message.trim(),
				},
			);
			setMessage("");
			setSuccess(getApiSuccessMessage(data, "Ucapan Anda berhasil dikirim."));
			await load();
		} catch (err) {
			setError(getApiErrorMessage(err, "Gagal mengirim ucapan"));
		} finally {
			setSubmitting(false);
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

	const bride = data.wedding?.namaPanggilanBride || "Bride";
	const groom = data.wedding?.namaPanggilanGroom || "Groom";

	return (
		<div className="surface-ground min-h-screen p-4">
			<div className="max-w-4xl mx-auto flex flex-column gap-4">
				<Card className="shadow-2">
					<div className="text-center">
						<p className="text-500 m-0">Undangan Pernikahan</p>
						<h1 className="text-3xl font-bold text-900 mt-2">
							{groom} & {bride}
						</h1>
						<p className="text-lg text-700 mt-2">{data.event.name}</p>
						<p className="text-500">
							{new Date(data.event.date).toLocaleString("id-ID")}
						</p>
						<p className="mt-3">
							Kepada Yth. <strong>{data.guest.name}</strong>
						</p>
						<Tag
							value={data.guest.rsvpStatus}
							severity={
								data.guest.rsvpStatus === "accepted"
									? "success"
									: data.guest.rsvpStatus === "declined"
										? "danger"
										: "warning"
							}
							className="mt-2"
						/>
					</div>
				</Card>

				{error && <Message severity="error" text={error} className="w-full" />}
				{success && (
					<Message severity="success" text={success} className="w-full" />
				)}

				{data.setting.rsvp && (
					<Card title="Konfirmasi Kehadiran (RSVP)" className="shadow-1">
						<div className="flex flex-column gap-3">
							<div className="field">
								<label htmlFor="jumlah">Jumlah orang yang hadir</label>
								<InputNumber
									id="jumlah"
									value={jumlah}
									onValueChange={(e) => setJumlah(e.value || 1)}
									min={1}
									max={50}
									className="w-full"
								/>
							</div>
							<div className="flex gap-2 flex-wrap">
								<Button
									label="Hadir"
									icon="pi pi-check"
									loading={submitting}
									onClick={() => handleRsvp(1)}
								/>
								<Button
									label="Tidak Hadir"
									icon="pi pi-times"
									severity="secondary"
									outlined
									loading={submitting}
									onClick={() => handleRsvp(2)}
								/>
							</div>
						</div>
					</Card>
				)}

				{data.locations.length > 0 && (
					<Card title="Lokasi Acara" className="shadow-1">
						{data.locations.map((loc) => (
							<div key={loc.id} className="mb-3 pb-3 border-bottom-1 surface-border">
								<h4 className="m-0">{loc.name}</h4>
								<p className="m-0 mt-1">{loc.alamat}</p>
								<p className="text-500 text-sm m-0 mt-1">
									{loc.date} · {loc.startTime} - {loc.endTime}
								</p>
								{loc.urlMaps && (
									<a href={loc.urlMaps} target="_blank" rel="noreferrer">
										Buka di Maps
									</a>
								)}
							</div>
						))}
					</Card>
				)}

				{data.gifts.length > 0 && (
					<Card title="Amplop Digital" className="shadow-1">
						{data.gifts.map((gift) => (
							<div key={gift.id} className="mb-2">
								<strong>{gift.provider}</strong> — {gift.name}: {gift.nomor}
							</div>
						))}
					</Card>
				)}

				<Card title="Ucapan & Doa" className="shadow-1">
					<InputTextarea
						value={message}
						onChange={(e) => setMessage(e.target.value)}
						rows={3}
						className="w-full mb-3"
						maxLength={255}
						placeholder="Tulis ucapan untuk mempelai..."
					/>
					<Button
						label="Kirim Ucapan"
						icon="pi pi-send"
						loading={submitting}
						onClick={handleMessage}
					/>
					{data.messages.length > 0 && (
						<div className="mt-4">
							<h4>Ucapan Tamu</h4>
							{data.messages.slice(0, 10).map((m) => (
								<div key={m.id} className="mb-2 p-2 surface-100 border-round">
									<strong>{m.guestName}</strong>
									<p className="m-0 mt-1">{m.message}</p>
								</div>
							))}
						</div>
					)}
				</Card>
			</div>
		</div>
	);
};

export default InvitationPage;
