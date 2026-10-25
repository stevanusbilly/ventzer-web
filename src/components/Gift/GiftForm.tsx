import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";
import { Button } from "primereact/button";
import { Message } from "primereact/message";
import { Calendar } from "primereact/calendar";
import { giftService } from "../../services/giftService";
import { eventService } from "../../services/eventService";
import { Event, Gift } from "../../types";
import { useAuth } from "../../contexts/AuthContext";
import moment from 'moment';
import { getApiErrorMessage } from "../../utils/apiError";

interface GiftFormProps {
	gift: Gift | null;
	onSuccess: () => void;
	onHide: () => void;
}

const GiftForm: React.FC<GiftFormProps> = ({ gift, onSuccess, onHide }) => {
	const [formData, setFormData] = useState<Omit<Gift, "id">>({
		eventId: gift?.eventId || 0,
		eventName: gift?.eventName || "",
		name: gift?.name || "",
		nomor: gift?.nomor || "",
		provider: gift?.provider || "",
	});
	const [event, setEvent] = useState<Event[]>([]);
	const [loading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState<string>("");
	const { user } = useAuth();

	useEffect(() => {
		loadEvent();
	}, []);

	const loadEvent = async (): Promise<void> => {
		try {
			let response = [];
			if (user?.role === 'admin') {
				response = await eventService.getAll();
			} else {
				response = await eventService.getByUser(user?.id ? user.id : 0);
			}
			setEvent(response);
		} catch (error) {
			console.error("Failed to load events:", error);
		}
	};

	const handleSubmit = async (e: React.FormEvent): Promise<void> => {
		e.preventDefault();
		setLoading(true);
		setError("");

		try {
			if (gift) {
				await giftService.upd(gift.id, formData);
			} else {
				await giftService.ins(formData);
			}
			onSuccess();
		} catch (error: unknown) {
			setError(getApiErrorMessage(error, "Gagal menyimpan hadiah"));
		} finally {
			setLoading(false);
		}
	};

	const handleChange = (
		field: keyof Omit<Gift, "id">,
		value: string | Date
	): void => {
		setFormData((prev) => ({ ...prev, [field]: value }));
	};

	return (
		<Dialog
			header={gift ? "Edit Gift" : "Create Gift"}
			visible={true}
			style={{ width: "50vw" }}
			onHide={onHide}
		>
			<form onSubmit={handleSubmit} className="p-fluid">
				{error && (
					<Message severity="error" text={error} className="w-full mb-3" style={{whiteSpace: "break-spaces"}} />
				)}
				<div className="field">
					<label htmlFor="eventId">Event</label>
					<Dropdown
						id="eventId"
						value={formData.eventId}
						options={event.map((el) => ({
							label: el.name,
							value: el.id,
						}))}
						onChange={(e: DropdownChangeEvent) =>
							handleChange("eventId", e.value)
						}
						filter
						required
						placeholder="Select an event"
					/>
				</div>

				<div className="field">
					<label htmlFor="name">Name</label>
					<InputText
						id="name"
						value={formData.name}
						onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
							handleChange("name", e.target.value)
						}
						required
					/>
				</div>

				<div className="field">
					<label htmlFor="nomor">Nomor</label>
					<InputText
						id="nomor"
						value={formData.nomor}
						onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
							handleChange("nomor", e.target.value)
						}
						required
					/>
				</div>

				<div className="field">
					<label htmlFor="provider">Provider</label>
					<InputText
						id="provider"
						value={formData.provider}
						onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
							handleChange("provider", e.target.value)
						}
						required
					/>
				</div>

				<Button
					type="submit"
					label={gift ? "Update Gift" : "Create Gift"}
					loading={loading}
					className="mt-2"
				/>
			</form>
		</Dialog>
	);
};

export default GiftForm;
