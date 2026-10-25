import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";
import { Button } from "primereact/button";
import { Message } from "primereact/message";
import { Calendar } from "primereact/calendar";
import { eventLocationService } from "../../services/eventLocationService";
import { eventService } from "../../services/eventService";
import { Event, EventLocation } from "../../types";
import { useAuth } from "../../contexts/AuthContext";
import moment from 'moment';
import { getApiErrorMessage } from "../../utils/apiError";

interface EventLocationFormProps {
	eventLocation: EventLocation | null;
	onSuccess: () => void;
	onHide: () => void;
}

const EventLocationForm: React.FC<EventLocationFormProps> = ({ eventLocation, onSuccess, onHide }) => {
	const [formData, setFormData] = useState<Omit<EventLocation, "id">>({
		eventId: eventLocation?.eventId || 0,
		eventName: eventLocation?.eventName || "",
		name: eventLocation?.name || "",
		location: eventLocation?.location || "",
		alamat: eventLocation?.alamat || "",
		date: eventLocation?.date || "",
		startTime: eventLocation?.startTime || "",
		endTime: eventLocation?.endTime || "",
		urlMaps: eventLocation?.urlMaps || "",
		order: eventLocation?.order || 1,
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
			if (eventLocation) {
				await eventLocationService.upd(eventLocation.id, formData);
			} else {
				await eventLocationService.ins(formData);
			}
			onSuccess();
		} catch (error: unknown) {
			setError(getApiErrorMessage(error, "Gagal menyimpan lokasi"));
		} finally {
			setLoading(false);
		}
	};

	const handleChange = (
		field: keyof Omit<EventLocation, "id">,
		value: string | Date
	): void => {
		setFormData((prev) => ({ ...prev, [field]: value }));
	};

	return (
		<Dialog
			header={eventLocation ? "Edit Location" : "Create Location"}
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
					<label htmlFor="location">Location</label>
					<InputText
						id="location"
						value={formData.location}
						onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
							handleChange("location", e.target.value)
						}
						required
					/>
				</div>

				<div className="field">
					<label htmlFor="alamat">Alamat</label>
					<InputText
						id="alamat"
						value={formData.alamat}
						onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
							handleChange("alamat", e.target.value)
						}
						required
					/>
				</div>

				<div className="field">
					<label htmlFor="date">Date</label>
					<Calendar
						id="date"
						value={formData.date ? new Date(formData.date) : null}
						onChange={(e) => handleChange("date", e.value as Date)}
						required
					/>
				</div>
				<div className="grid">
					<div className="col-12 lg:col-6 field">
						<label htmlFor="startTime">Start Time</label>
						<Calendar
							id="startTime"
							value={formData.startTime ? new Date(`${moment().format('YYYY-MM-DD')} ${formData.startTime}`) : null}
							onChange={(e) => handleChange("startTime", moment(e.value).format('HH:mm'))}
							timeOnly
							hourFormat="24"
							required
						/>
					</div>

					<div className="col-12 lg:col-6 field">
						<label htmlFor="endTime">End Time</label>
						<Calendar
							id="endTime"
							value={formData.endTime ? new Date(`${moment().format('YYYY-MM-DD')} ${formData.endTime}`) : null}
							onChange={(e) => handleChange("endTime", moment(e.value).format('HH:mm'))}
							timeOnly
							hourFormat="24"
							required
						/>
					</div>

				</div>

				<div className="field">
					<label htmlFor="urlMaps">URL Map</label>
					<InputText
						id="urlMaps"
						value={formData.urlMaps}
						onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
							handleChange("urlMaps", e.target.value)
						}
						required
					/>
				</div>

				<div className="field">
					<label htmlFor="order">Order</label>
					<InputText
						id="order"
						keyfilter="int"
						value={formData.order.toString()}
						onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
							handleChange("order", e.target.value)
						}
						required
					/>
				</div>

				<Button
					type="submit"
					label={eventLocation ? "Update Location" : "Create Location"}
					loading={loading}
					className="mt-2"
				/>
			</form>
		</Dialog>
	);
};

export default EventLocationForm;
