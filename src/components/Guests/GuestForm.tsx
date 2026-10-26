import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";
import { Button } from "primereact/button";
import { guestService } from "../../services/guestService";
import { eventService } from "../../services/eventService";
import { Guest, Event } from "../../types";
import { Message } from "primereact/message";
import { useAuth } from "../../contexts/AuthContext";
import { getApiErrorMessage, getApiSuccessMessage } from "../../utils/apiError";

interface GuestFormProps {
	guest: Guest | null;
	onSuccess: (message: string) => void;
	onHide: () => void;
}

const GuestForm: React.FC<GuestFormProps> = ({ guest, onSuccess, onHide }) => {
	const [formData, setFormData] = useState({
		eventId: guest?.eventId || 0,
		name: guest?.name || "",
		phone: guest?.phone || "",
		email: guest?.email || "",
		rsvpStatus: guest?.rsvpStatus || ("pending" as Guest["rsvpStatus"]),
	});
	const [events, setEvents] = useState<Event[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const { user } = useAuth();

	useEffect(() => {
		const loadEvents = async (): Promise<void> => {
			const response =
				user?.role === "admin"
					? await eventService.getAll()
					: await eventService.getByUser(user?.id || 0);
			setEvents(response);
			if (!guest && response.length > 0 && !formData.eventId) {
				setFormData((prev) => ({ ...prev, eventId: response[0].id }));
			}
		};
		loadEvents().catch((err: unknown) =>
			setError(getApiErrorMessage(err, "Gagal memuat daftar event")),
		);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const handleSubmit = async (e: React.FormEvent): Promise<void> => {
		e.preventDefault();
		setLoading(true);
		setError("");
		try {
			const result = guest
				? await guestService.update(guest.id, formData.eventId, formData)
				: await guestService.add(formData.eventId, formData);
			onSuccess(
				getApiSuccessMessage(
					result,
					guest ? "Tamu diperbarui" : "Tamu ditambahkan",
				),
			);
		} catch (err) {
			setError(getApiErrorMessage(err, "Gagal menyimpan tamu"));
		} finally {
			setLoading(false);
		}
	};

	return (
		<Dialog
			header={guest ? "Edit Tamu" : "Tambah Tamu"}
			visible
			style={{ width: "32rem" }}
			onHide={onHide}
		>
			<form onSubmit={handleSubmit} className="p-fluid">
				{error && <Message severity="error" text={error} className="w-full mb-3" />}
				<div className="field">
					<label htmlFor="eventId">Event</label>
					<Dropdown
						id="eventId"
						value={formData.eventId}
						options={events.map((event) => ({
							label: event.name,
							value: event.id,
						}))}
						onChange={(e: DropdownChangeEvent) =>
							setFormData((prev) => ({ ...prev, eventId: e.value }))
						}
						filter
						required
					/>
				</div>
				<div className="field">
					<label htmlFor="name">Nama</label>
					<InputText
						id="name"
						value={formData.name}
						onChange={(e) =>
							setFormData((prev) => ({ ...prev, name: e.target.value }))
						}
						required
					/>
				</div>
				<div className="field">
					<label htmlFor="email">Email</label>
					<InputText
						id="email"
						type="email"
						value={formData.email}
						onChange={(e) =>
							setFormData((prev) => ({ ...prev, email: e.target.value }))
						}
					/>
				</div>
				<div className="field">
					<label htmlFor="phone">Telepon</label>
					<InputText
						id="phone"
						value={formData.phone}
						onChange={(e) =>
							setFormData((prev) => ({ ...prev, phone: e.target.value }))
						}
					/>
				</div>
				<div className="field">
					<label htmlFor="rsvpStatus">Status RSVP</label>
					<Dropdown
						id="rsvpStatus"
						value={formData.rsvpStatus}
						options={[
							{ label: "Pending", value: "pending" },
							{ label: "Accepted", value: "accepted" },
							{ label: "Declined", value: "declined" },
						]}
						onChange={(e: DropdownChangeEvent) =>
							setFormData((prev) => ({ ...prev, rsvpStatus: e.value }))
						}
					/>
				</div>
				<Button type="submit" label="Simpan" loading={loading} className="mt-3" />
			</form>
		</Dialog>
	);
};

export default GuestForm;
