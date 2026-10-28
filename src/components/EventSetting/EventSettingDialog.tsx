import React, { useEffect, useRef, useState } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Checkbox } from "primereact/checkbox";
import { Button } from "primereact/button";
import { Message } from "primereact/message";
import { Toast } from "primereact/toast";
import { eventSettingService } from "../../services/eventSettingService";
import { Event, EventSetting } from "../../types";
import { useAuth } from "../../contexts/AuthContext";
import { getApiErrorMessage, getApiSuccessMessage } from "../../utils/apiError";

const emptySetting = (event: Event): Omit<EventSetting, "id"> => ({
	eventId: event.id,
	eventName: event.name,
	maxGaleriFoto: 5,
	fotoProfil: 0,
	socialMedia: 0,
	rsvp: 0,
	video: 0,
	addToCalendar: 0,
	loveStory: 0,
});

interface EventSettingDialogProps {
	event: Event;
	onHide: () => void;
}

const EventSettingDialog: React.FC<EventSettingDialogProps> = ({
	event,
	onHide,
}) => {
	const { canMutate } = useAuth();
	const [formData, setFormData] = useState<Omit<EventSetting, "id">>(
		emptySetting(event),
	);
	const [loading, setLoading] = useState(false);
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState("");
	const toast = useRef<Toast>(null);

	useEffect(() => {
		const loadSetting = async (): Promise<void> => {
			setLoading(true);
			try {
				const response = await eventSettingService.getByEvent(event.id);
				setFormData({
					eventId: event.id,
					eventName: event.name,
					maxGaleriFoto: response.maxGaleriFoto,
					fotoProfil: response.fotoProfil,
					socialMedia: response.socialMedia,
					rsvp: response.rsvp,
					video: response.video,
					addToCalendar: response.addToCalendar,
					loveStory: response.loveStory,
				});
			} catch {
				setFormData(emptySetting(event));
			} finally {
				setLoading(false);
			}
		};
		void loadSetting();
	}, [event]);

	const handleChange = (
		field: keyof Omit<EventSetting, "id">,
		value: string | number,
	): void => {
		setFormData((prev) => ({ ...prev, [field]: value }));
	};

	const handleSubmit = async (e: React.FormEvent): Promise<void> => {
		e.preventDefault();
		if (!canMutate) return;
		setSubmitting(true);
		setError("");
		try {
			const data = await eventSettingService.ins({
				...formData,
				eventId: event.id,
				eventName: event.name,
				maxGaleriFoto: Number(formData.maxGaleriFoto) || 0,
			});
			toast.current?.show({
				severity: "success",
				summary: "Berhasil",
				detail: getApiSuccessMessage(data, "Pengaturan event disimpan"),
				life: 3000,
			});
		} catch (err: unknown) {
			setError(getApiErrorMessage(err, "Gagal menyimpan pengaturan"));
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<Dialog
			header={`Setting — ${event.name}`}
			visible
			style={{ width: "80vw", maxWidth: "40rem" }}
			onHide={onHide}
			contentStyle={{ overflowY: "auto", maxHeight: "75vh" }}
		>
			<Toast ref={toast} />
			<form onSubmit={handleSubmit} className="p-fluid">
				{error && (
					<Message
						severity="error"
						text={error}
						className="w-full mb-3"
						style={{ whiteSpace: "break-spaces" }}
					/>
				)}
				{loading && <p className="text-500">Memuat pengaturan...</p>}
				<div className="field">
					<label htmlFor="maxGaleriFoto">Max Galeri Foto</label>
					<InputText
						id="maxGaleriFoto"
						keyfilter="int"
						value={String(formData.maxGaleriFoto)}
						onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
							handleChange("maxGaleriFoto", Number(e.target.value) || 0)
						}
						required
						disabled={!canMutate || loading}
					/>
				</div>
				<div className="grid">
					<div className="field col-12 md:col-6">
						<div className="flex align-items-center">
							<Checkbox
								inputId="fotoProfil"
								onChange={(e) => handleChange("fotoProfil", e.checked ? 1 : 0)}
								checked={formData.fotoProfil === 1}
								disabled={!canMutate || loading}
							/>
							<label htmlFor="fotoProfil" className="ml-2">
								Foto Profil
							</label>
						</div>
					</div>
					<div className="field col-12 md:col-6">
						<div className="flex align-items-center">
							<Checkbox
								inputId="socialMedia"
								onChange={(e) => handleChange("socialMedia", e.checked ? 1 : 0)}
								checked={formData.socialMedia === 1}
								disabled={!canMutate || loading}
							/>
							<label htmlFor="socialMedia" className="ml-2">
								Social Media
							</label>
						</div>
					</div>
					<div className="field col-12 md:col-6">
						<div className="flex align-items-center">
							<Checkbox
								inputId="rsvp"
								onChange={(e) => handleChange("rsvp", e.checked ? 1 : 0)}
								checked={formData.rsvp === 1}
								disabled={!canMutate || loading}
							/>
							<label htmlFor="rsvp" className="ml-2">
								RSVP
							</label>
						</div>
					</div>
					<div className="field col-12 md:col-6">
						<div className="flex align-items-center">
							<Checkbox
								inputId="video"
								onChange={(e) => handleChange("video", e.checked ? 1 : 0)}
								checked={formData.video === 1}
								disabled={!canMutate || loading}
							/>
							<label htmlFor="video" className="ml-2">
								Video
							</label>
						</div>
					</div>
					<div className="field col-12 md:col-6">
						<div className="flex align-items-center">
							<Checkbox
								inputId="addToCalendar"
								onChange={(e) =>
									handleChange("addToCalendar", e.checked ? 1 : 0)
								}
								checked={formData.addToCalendar === 1}
								disabled={!canMutate || loading}
							/>
							<label htmlFor="addToCalendar" className="ml-2">
								Add To Calendar
							</label>
						</div>
					</div>
					<div className="field col-12 md:col-6">
						<div className="flex align-items-center">
							<Checkbox
								inputId="loveStory"
								onChange={(e) => handleChange("loveStory", e.checked ? 1 : 0)}
								checked={formData.loveStory === 1}
								disabled={!canMutate || loading}
							/>
							<label htmlFor="loveStory" className="ml-2">
								Love Story
							</label>
						</div>
					</div>
				</div>
				{canMutate && (
					<Button
						type="submit"
						label="Simpan"
						loading={submitting}
						disabled={loading}
						className="mt-2"
					/>
				)}
			</form>
		</Dialog>
	);
};

export default EventSettingDialog;
