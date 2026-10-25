import React, { useState, useEffect } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from 'primereact/inputtextarea';
import { Calendar } from "primereact/calendar";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { Checkbox } from "primereact/checkbox";
import { Message } from "primereact/message";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { eventService } from "../../services/eventService";
import { eventSettingService } from "../../services/eventSettingService";
import { useRef } from "react";
import { Event, EventSetting } from "../../types";
import { useAuth } from "../../contexts/AuthContext";
import { getApiErrorMessage } from "../../utils/apiError";

const EventSettingList: React.FC = () => {
	const [events, setEvents] = useState<Event[]>([]);
	const [setting, setSetting] = useState<EventSetting | null>();
	const [selectedFilterEvent, setSelectedFilterEvent] = useState<number>(0);
	const [loading, setLoading] = useState<boolean>(true);
	const { user } = useAuth();
	const toast = useRef<Toast>(null);
	const [error, setError] = useState<string>("");
	const [formData, setFormData] = useState<Omit<EventSetting, "id">>({
		eventId: setting?.eventId || selectedFilterEvent,
		eventName: setting?.eventName || "",
		maxGaleriFoto: setting?.maxGaleriFoto || 5,
		fotoProfil: setting?.fotoProfil || 0,
		socialMedia: setting?.socialMedia || 0,
		rsvp: setting?.rsvp || 0,
		video: setting?.video || 0,
		addToCalendar: setting?.addToCalendar || 0,
		loveStory: setting?.loveStory || 0,
	});

	useEffect(() => {
		loadEvents();
	}, []);

	useEffect(() => {
		loadWedding();
	}, [selectedFilterEvent]);

	useEffect(() => {
		setFormData({
			eventId: setting?.eventId || selectedFilterEvent,
			eventName: setting?.eventName || "",
			maxGaleriFoto: setting?.maxGaleriFoto || 5,
			fotoProfil: setting?.fotoProfil || 0,
			socialMedia: setting?.socialMedia || 0,
			rsvp: setting?.rsvp || 0,
			video: setting?.video || 0,
			addToCalendar: setting?.addToCalendar || 0,
			loveStory: setting?.loveStory || 0,
		})
	}, [setting]);

	const loadEvents = async (): Promise<void> => {
		try {
			let response = [];
			if (user?.role === 'admin') {
				response = await eventService.getAll();
			} else {
				response = await eventService.getByUser(user?.id ? user.id : 0);
			}
			setEvents(response);

			if (response.length > 0) {
				handleChange("eventId", response[0].id)
				setSelectedFilterEvent(response[0].id);
			};
		} catch (error) {
			showError("Failed to load events");
		} finally {
			setLoading(false);
		}
	};

	const loadWedding = async (): Promise<void> => {
		try {
			if (selectedFilterEvent === 0) return;
			
			const response = await eventSettingService.getByEvent(selectedFilterEvent)
			setSetting(response);
		} catch (error) {
			setSetting(null)
		} finally {
			setLoading(false);
		}
	};

	const showError = (message: string): void => {
		if (toast.current) {
			toast.current.show({
				severity: "error",
				summary: "Error",
				detail: message,
				life: 3000,
			});
		}
	};

	const showSuccess = (message: string): void => {
		if (toast.current) {
			toast.current.show({
				severity: "success",
				summary: "Success",
				detail: message,
				life: 3000,
			});
		}
	};

	const handleChange = (
		field: keyof Omit<EventSetting, "id">,
		value: string | Date | number
	): void => {
		setFormData((prev) => ({ ...prev, [field]: value }));
	};

	const handleSubmit = async (e: React.FormEvent): Promise<void> => {
		e.preventDefault();
		setLoading(true);

		try {
			await eventSettingService.ins(formData);
			showSuccess("Data saved successfully");
		} catch (error: unknown) {
			setError(getApiErrorMessage(error, "Gagal menyimpan pengaturan"));
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="card">
			<Toast ref={toast} />
			<ConfirmDialog />

			<div className="flex justify-content-between align-items-center mb-4">
				<h2>Setting Management</h2>
				<div className="flex gap-2">
					<div className="flex align-items-center gap-2">
						<label htmlFor="eventFilter" className="font-semibold text-color-secondary">
							Pilih Event:
						</label>
						<Dropdown
							id="eventFilter"
							value={selectedFilterEvent}
							options={events.map((event) => ({
								label: event.name,
								value: event.id
							}))}
							onChange={(e: DropdownChangeEvent) => {
								setSelectedFilterEvent(e.value)
							}}
							placeholder="Pilih Event"
							className="w-14rem"
							filter
						/>
					</div>
				</div>
			</div>
				
			<form onSubmit={handleSubmit} className="p-fluid">
				{error && (
					<Message severity="error" text={error} className="w-full mb-3" style={{whiteSpace: "break-spaces"}} />
				)}
				<div className="field">
					<label htmlFor="maxGaleriFoto">Max Galeri Foto</label>
					<InputText
						id="maxGaleriFoto"
						keyfilter="int"
						value={formData.maxGaleriFoto.toString()}
						onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
							handleChange("maxGaleriFoto", e.target.value)
						}
						required
					/>
				</div>

				<div className="grid">
					<div className="field col-12 md:col-6 lg:col-4">
						<div className="flex align-items-center">
							<Checkbox inputId="fotoProfil" name="fotoProfil" value="1" 
								onChange={e => handleChange("fotoProfil", e.checked ? 1 : 0)} 
								checked={formData.fotoProfil === 1 ? true : false} />
							<label htmlFor="fotoProfil" className="ml-2">Foto Profil</label>
						</div>
					</div>
					
					<div className="field col-12 md:col-6 lg:col-4">
						<div className="flex align-items-center">
							<Checkbox inputId="socialMedia" name="socialMedia" value="1" 
								onChange={e => handleChange("socialMedia", e.checked ? 1 : 0)} 
								checked={formData.socialMedia === 1 ? true : false} />
							<label htmlFor="socialMedia" className="ml-2">Social Media</label>
						</div>
					</div>

					<div className="field col-12 md:col-6 lg:col-4">
						<div className="flex align-items-center">
							<Checkbox inputId="rsvp" name="rsvp" value="1" 
								onChange={e => handleChange("rsvp", e.checked ? 1 : 0)} 
								checked={formData.rsvp === 1 ? true : false} />
							<label htmlFor="rsvp" className="ml-2">RSVP</label>
						</div>
					</div>

					<div className="field col-12 md:col-6 lg:col-4">
						<div className="flex align-items-center">
							<Checkbox inputId="video" name="video" value="1" 
								onChange={e => handleChange("video", e.checked ? 1 : 0)} 
								checked={formData.video === 1 ? true : false} />
							<label htmlFor="video" className="ml-2">Video</label>
						</div>
					</div>

					<div className="field col-12 md:col-6 lg:col-4">
						<div className="flex align-items-center">
							<Checkbox inputId="addToCalendar" name="addToCalendar" value="1" 
								onChange={e => handleChange("addToCalendar", e.checked ? 1 : 0)} 
								checked={formData.addToCalendar === 1 ? true : false} />
							<label htmlFor="addToCalendar" className="ml-2">Add To Calendar</label>
						</div>
					</div>

					<div className="field col-12 md:col-6 lg:col-4">
						<div className="flex align-items-center">
							<Checkbox inputId="loveStory" name="loveStory" value="1" 
								onChange={e => handleChange("loveStory", e.checked ? 1 : 0)} 
								checked={formData.loveStory === 1 ? true : false} />
							<label htmlFor="loveStory" className="ml-2">Love Story</label>
						</div>
					</div>

				</div>

				<Button
					type="submit"
					label="Submit"
					loading={loading}
					className="mt-2"
				/>
			</form>

		</div>
	);
};

export default EventSettingList;
