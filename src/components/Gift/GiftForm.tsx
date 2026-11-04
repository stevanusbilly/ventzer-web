import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";
import { Button } from "primereact/button";
import { Message } from "primereact/message";
import { giftService } from "../../services/giftService";
import { eventService } from "../../services/eventService";
import { Event, Gift } from "../../types";
import { useAuth } from "../../contexts/AuthContext";
import { getApiErrorMessage, getApiSuccessMessage } from "../../utils/apiError";

interface GiftFormProps {
	gift: Gift | null;
	eventId?: number;
	eventName?: string;
	onSuccess: (message: string) => void;
	onHide: () => void;
}

const GiftForm: React.FC<GiftFormProps> = ({
	gift,
	eventId,
	eventName,
	onSuccess,
	onHide,
}) => {
	const lockedEventId = eventId || gift?.eventId || 0;
	const [formData, setFormData] = useState<Omit<Gift, "id">>({
		eventId: lockedEventId,
		eventName: eventName || gift?.eventName || "",
		name: gift?.name || "",
		nomor: gift?.nomor || "",
		provider: gift?.provider || "",
	});
	const [events, setEvents] = useState<Event[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const { user } = useAuth();

	useEffect(() => {
		if (lockedEventId) {
			return;
		}
		const loadEvents = async (): Promise<void> => {
			try {
				const response =
					user?.role === "admin"
						? await eventService.getAll()
						: await eventService.getByUser(user?.id || 0);
				setEvents(response);
			} catch (loadError) {
				console.error("Failed to load events:", loadError);
			}
		};
		void loadEvents();
	}, [lockedEventId, user?.id, user?.role]);

	const handleSubmit = async (e: React.FormEvent): Promise<void> => {
		e.preventDefault();
		setLoading(true);
		setError("");

		try {
			const result = gift
				? await giftService.upd(gift.id, formData)
				: await giftService.ins(formData);
			onSuccess(
				getApiSuccessMessage(
					result,
					gift ? "Amplop digital diperbarui" : "Amplop digital ditambahkan",
				),
			);
		} catch (submitError: unknown) {
			setError(getApiErrorMessage(submitError, "Gagal menyimpan amplop digital"));
		} finally {
			setLoading(false);
		}
	};

	const handleChange = (field: keyof Omit<Gift, "id">, value: string | number): void => {
		setFormData((prev) => ({ ...prev, [field]: value }));
	};

	return (
		<Dialog
			header={gift ? "Ubah rekening" : "Tambah rekening"}
			visible
			style={{ width: "92vw", maxWidth: "32rem" }}
			onHide={onHide}
		>
			<form onSubmit={handleSubmit} className="p-fluid">
				{error && (
					<Message
						severity="error"
						text={error}
						className="w-full mb-3"
						style={{ whiteSpace: "break-spaces" }}
					/>
				)}
				{!lockedEventId && (
					<div className="field">
						<label htmlFor="eventId">Event</label>
						<Dropdown
							id="eventId"
							value={formData.eventId}
							options={events.map((el) => ({
								label: el.name,
								value: el.id,
							}))}
							onChange={(e: DropdownChangeEvent) => handleChange("eventId", e.value)}
							filter
							required
							placeholder="Pilih event"
						/>
					</div>
				)}
				<div className="field">
					<label htmlFor="name">Nama pemilik</label>
					<InputText
						id="name"
						value={formData.name}
						onChange={(e) => handleChange("name", e.target.value)}
						required
					/>
				</div>
				<div className="field">
					<label htmlFor="provider">Bank / e-wallet</label>
					<InputText
						id="provider"
						value={formData.provider}
						onChange={(e) => handleChange("provider", e.target.value)}
						required
					/>
				</div>
				<div className="field">
					<label htmlFor="nomor">Nomor</label>
					<InputText
						id="nomor"
						value={formData.nomor}
						onChange={(e) => handleChange("nomor", e.target.value)}
						required
					/>
				</div>
				<Button
					type="submit"
					label={gift ? "Simpan" : "Tambah"}
					loading={loading}
					className="mt-2"
				/>
			</form>
		</Dialog>
	);
};

export default GiftForm;
