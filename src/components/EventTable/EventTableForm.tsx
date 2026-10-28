import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from 'primereact/inputtextarea';
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";
import { Button } from "primereact/button";
import { Message } from "primereact/message";
import { Calendar } from "primereact/calendar";
import { eventTableService } from "../../services/eventTableService";
import { eventService } from "../../services/eventService";
import { Event, EventTable } from "../../types";
import { useAuth } from "../../contexts/AuthContext";
import moment from 'moment';
import { getApiErrorMessage, getApiSuccessMessage } from "../../utils/apiError";

interface EventTableFormProps {
	event?: Event;
	eventTable: EventTable | null;
	onSuccess: (message: string) => void;
	onHide: () => void;
}

const EventTableForm: React.FC<EventTableFormProps> = ({
	event: lockedEvent,
	eventTable,
	onSuccess,
	onHide,
}) => {
	const [formData, setFormData] = useState<Omit<EventTable, "id">>({
		eventId: lockedEvent?.id || eventTable?.eventId || 0,
		eventName: lockedEvent?.name || eventTable?.eventName || "",
		kategori: eventTable?.kategori || "",
		menu: eventTable?.menu || "",
		note: eventTable?.note || "",
		jumlahKursi: eventTable?.jumlahKursi || 1,
		jumlahGuest: eventTable?.jumlahGuest || 0,
	});
	const [event, setEvent] = useState<Event[]>([]);
	const [loading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState<string>("");
	const { user } = useAuth();

	useEffect(() => {
		if (!lockedEvent) {
			void loadEvent();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [lockedEvent]);

	const loadEvent = async (): Promise<void> => {
		try {
			const response =
				user?.role === "admin"
					? await eventService.getAll()
					: await eventService.getByUser(user?.id ? user.id : 0);
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
			const payload = {
				...formData,
				eventId: lockedEvent?.id || formData.eventId,
				eventName: lockedEvent?.name || formData.eventName,
				jumlahKursi: Number(formData.jumlahKursi) || 1,
			};
			const result = eventTable
				? await eventTableService.upd(eventTable.id, payload)
				: await eventTableService.ins(payload);
			onSuccess(
				getApiSuccessMessage(
					result,
					eventTable ? "Meja diperbarui" : "Meja ditambahkan",
				),
			);
		} catch (error: unknown) {
			setError(getApiErrorMessage(error, "Gagal menyimpan meja"));
		} finally {
			setLoading(false);
		}
	};

	const handleChange = (
		field: keyof Omit<EventTable, "id">,
		value: string | Date
	): void => {
		setFormData((prev) => ({ ...prev, [field]: value }));
	};

	return (
		<Dialog
			header={eventTable ? "Edit Table" : "Create Table"}
			visible={true}
			style={{ width: "50vw" }}
			onHide={onHide}
		>
			<form onSubmit={handleSubmit} className="p-fluid">
				{error && (
					<Message severity="error" text={error} className="w-full mb-3" style={{whiteSpace: "break-spaces"}} />
				)}
				{!lockedEvent && (
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
				)}

				<div className="field">
					<label htmlFor="kategori">Kategori</label>
					<InputText
						id="kategori"
						value={formData.kategori}
						onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
							handleChange("kategori", e.target.value)
						}
						required
					/>
				</div>

				<div className="field">
					<label htmlFor="menu">Menu</label>
					<InputTextarea
						id="menu"
						value={formData.menu}
						rows={5}
						onChange={(e) =>
							handleChange("menu", e.target.value)
						}
					/>
				</div>

				<div className="field">
					<label htmlFor="note">Note</label>
					<InputTextarea
						id="note"
						value={formData.note}
						rows={5}
						onChange={(e) =>
							handleChange("note", e.target.value)
						}
					/>
				</div>

				<div className="field">
					<label htmlFor="jumlahKursi">Jumlah Kursi</label>
					<InputText
						id="jumlahKursi"
						keyfilter="int"
						value={formData.jumlahKursi.toString()}
						onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
							handleChange("jumlahKursi", e.target.value)
						}
						required
					/>
				</div>

				<Button
					type="submit"
					label={eventTable ? "Update Table" : "Create Table"}
					loading={loading}
					className="mt-2"
				/>
			</form>
		</Dialog>
	);
};

export default EventTableForm;
