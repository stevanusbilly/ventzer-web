import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { Button } from "primereact/button";
import { Checkbox } from "primereact/checkbox";
import { Message } from "primereact/message";
import { eventService } from "../../services/eventService";
import { templateService } from "../../services/templateService";
import { userService } from "../../services/userService";
import { Event, Template, User } from "../../types";
import { getApiErrorMessage, getApiSuccessMessage } from "../../utils/apiError";

interface EventFormProps {
	event: Event | null;
	onSuccess: (message: string) => void;
	onHide: () => void;
}

const EventForm: React.FC<EventFormProps> = ({ event, onSuccess, onHide }) => {
	const [formData, setFormData] = useState<Omit<Event, "id">>({
		templateId: event?.templateId || 0,
		userId: event?.userId || 0,
		userName: event?.userName || "",
		templateName: event?.templateName || "",
		name: event?.name || "",
		date: event?.date || "",
		music_url: event?.music_url || "",
		autoplay_music: event?.autoplay_music || 0,
		dresscode: event?.dresscode || "",
	});
	const [templates, setTemplates] = useState<Template[]>([]);
	const [users, setUsers] = useState<User[]>([]);
	const [loading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState<string>("");

	const handleSubmit = async (e: React.FormEvent): Promise<void> => {
		e.preventDefault();
		setLoading(true);

		try {
			const result = event
				? await eventService.update(event.id, formData)
				: await eventService.create(formData);
			onSuccess(
				getApiSuccessMessage(
					result,
					event ? "Event diperbarui" : "Event ditambahkan",
				),
			);
		} catch (error: unknown) {
			setError(getApiErrorMessage(error, "Gagal menyimpan event"));
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		loadTemplates();
		loadUsers();
	}, []);

	const loadTemplates = async (): Promise<void> => {
		try {
			const response = await templateService.list();
			setTemplates(response);
		} catch (error) {
			console.error("Failed to load events:", error);
		}
	};

	const loadUsers = async (): Promise<void> => {
		try {
			const response = await userService.list();
			setUsers(response);
		} catch (error) {
			console.error("Failed to load events:", error);
		}
	};

	const handleChange = (
		field: keyof Omit<Event, "id">,
		value: string | Date | number
	): void => {
		setFormData((prev) => ({ ...prev, [field]: value }));
	};

	return (
		<Dialog
			header={event ? "Edit Event" : "Create Event"}
			visible={true}
			style={{ width: "50vw" }}
			onHide={onHide}
		>
			<form onSubmit={handleSubmit} className="p-fluid">
				{error && (
					<Message severity="error" text={error} className="w-full mb-3" style={{whiteSpace: "break-spaces"}} />
				)}
				<div className="field">
					<label htmlFor="templateId">Template</label>
					<Dropdown
						id="templateId"
						value={formData.templateId}
						options={templates.map((template) => ({
							label: template.name,
							value: template.id,
						}))}
						onChange={(e: DropdownChangeEvent) =>
							handleChange("templateId", e.value)
						}
						filter
						required
						placeholder="Select an template"
					/>
				</div>

				<div className="field">
					<label htmlFor="name">Event Name</label>
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
					<label htmlFor="userId">Pemilik Event</label>
					<Dropdown
						id="userId"
						value={formData.userId}
						options={users.map((user) => ({
							label: user.name,
							value: user.id,
						}))}
						onChange={(e: DropdownChangeEvent) =>
							handleChange("userId", e.value)
						}
						filter
						required
						placeholder="Select an user"
					/>
				</div>

				<div className="field">
					<label htmlFor="date">Date and Time</label>
					<Calendar
						id="date"
						value={formData.date ? new Date(formData.date) : null}
						onChange={(e) => handleChange("date", e.value as Date)}
						showTime
						hourFormat="24"
						required
					/>
				</div>

				<div className="field">
					<label htmlFor="dresscode">Dress Code</label>
					<InputText
						id="dresscode"
						value={formData.dresscode}
						onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
							handleChange("dresscode", e.target.value)
						}
					/>
				</div>

				<div className="field">
					<label htmlFor="music_url">Music URL</label>
					<InputText
						id="music_url"
						value={formData.music_url}
						onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
							handleChange("music_url", e.target.value)
						}
					/>
				</div>

				<div className="field">
					<div className="flex align-items-center">
						<Checkbox inputId="autoplay_music" name="autoplay_music" value="1" 
							onChange={e => handleChange("autoplay_music", e.checked ? 1 : 0)} 
							checked={formData.autoplay_music === 1 ? true : false} />
						<label htmlFor="autoplay_music" className="ml-2">Autoplay Music</label>
					</div>
				</div>

				<Button
					type="submit"
					label={event ? "Update Event" : "Create Event"}
					loading={loading}
					className="mt-2"
				/>
			</form>
		</Dialog>
	);
};

export default EventForm;
