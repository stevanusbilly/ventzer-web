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
import { weddingService } from "../../services/weddingService";
import { useRef } from "react";
import { Event, Wedding } from "../../types";
import { useAuth } from "../../contexts/AuthContext";
import { getApiErrorMessage } from "../../utils/apiError";

const WeddingList: React.FC = () => {
	const [events, setEvents] = useState<Event[]>([]);
	const [wedding, setWedding] = useState<Wedding | null>();
	const [selectedFilterEvent, setSelectedFilterEvent] = useState<number>(0);
	const [loading, setLoading] = useState<boolean>(true);
	const { user } = useAuth();
	const toast = useRef<Toast>(null);
	const [error, setError] = useState<string>("");
	const [formData, setFormData] = useState<Omit<Wedding, "id">>({
		eventId: wedding?.eventId || selectedFilterEvent,
		namaLengkapBride: wedding?.namaLengkapBride || "",
		namaLengkapGroom: wedding?.namaLengkapGroom || "",
		namaPanggilanBride: wedding?.namaPanggilanBride || "",
		namaPanggilanGroom: wedding?.namaPanggilanGroom || "",
		bioBride: wedding?.bioBride || "",
		bioGroom: wedding?.bioGroom || "",
		sosmedBride: wedding?.sosmedBride || "",
		sosmedGroom: wedding?.sosmedGroom || "",
		quote: wedding?.quote || "",
		openingText: wedding?.openingText || "",
		loveStory: wedding?.loveStory || "",
		urlVideoPrewedding: wedding?.urlVideoPrewedding || "",
		urlVideoStreaming: wedding?.urlVideoStreaming || "",
	});

	useEffect(() => {
		loadEvents();
	}, []);

	useEffect(() => {
		loadWedding();
	}, [selectedFilterEvent]);

	useEffect(() => {
		setFormData({
			eventId: wedding?.eventId || selectedFilterEvent,
			namaLengkapBride: wedding?.namaLengkapBride || "",
			namaLengkapGroom: wedding?.namaLengkapGroom || "",
			namaPanggilanBride: wedding?.namaPanggilanBride || "",
			namaPanggilanGroom: wedding?.namaPanggilanGroom || "",
			bioBride: wedding?.bioBride || "",
			bioGroom: wedding?.bioGroom || "",
			sosmedBride: wedding?.sosmedBride || "",
			sosmedGroom: wedding?.sosmedGroom || "",
			quote: wedding?.quote || "",
			openingText: wedding?.openingText || "",
			loveStory: wedding?.loveStory || "",
			urlVideoPrewedding: wedding?.urlVideoPrewedding || "",
			urlVideoStreaming: wedding?.urlVideoStreaming || ""
		})
	}, [wedding]);

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
			
			const response = await weddingService.getByEvent(selectedFilterEvent)
			setWedding(response);
		} catch (error) {
			setWedding(null)
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
		field: keyof Omit<Wedding, "id">,
		value: string | Date | number
	): void => {
		setFormData((prev) => ({ ...prev, [field]: value }));
	};

	const handleSubmit = async (e: React.FormEvent): Promise<void> => {
		e.preventDefault();
		setLoading(true);

		try {
			await weddingService.ins(formData);
			showSuccess("Data saved successfully");
		} catch (error: unknown) {
			setError(getApiErrorMessage(error, "Gagal menyimpan data wedding"));
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="card">
			<Toast ref={toast} />
			<ConfirmDialog />

			<div className="flex justify-content-between align-items-center mb-4">
				<h2>Wedding Management</h2>
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
				<div className="grid">
					<div className="col-12 lg:col-6">
						<div className="field">
							<label htmlFor="namaLengkapGroom">Nama Lengkap Groom</label>
							<InputText
								id="namaLengkapGroom"
								value={formData.namaLengkapGroom}
								onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
									handleChange("namaLengkapGroom", e.target.value)
								}
								required
							/>
						</div>

						<div className="field">
							<label htmlFor="namaPanggilanGroom">Nama Panggilan Groom</label>
							<InputText
								id="namaPanggilanGroom"
								value={formData.namaPanggilanGroom}
								onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
									handleChange("namaPanggilanGroom", e.target.value)
								}
							/>
						</div>
								
						<div className="field">
							<label htmlFor="bioGroom">Bio Groom</label>
							<InputTextarea
								id="bioGroom"
								value={formData.bioGroom}
								rows={5}
								onChange={(e) =>
									handleChange("bioGroom", e.target.value)
								}
							/>
						</div>

						<div className="field">
							<label htmlFor="sosmedGroom">Social Media Groom</label>
							<InputText
								id="sosmedGroom"
								value={formData.sosmedGroom}
								onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
									handleChange("sosmedGroom", e.target.value)
								}
							/>
						</div>
								
					</div>
					<div className="col-12 lg:col-6">
						<div className="field">
							<label htmlFor="namaLengkapBride">Nama Lengkap Bride</label>
							<InputText
								id="namaLengkapBride"
								value={formData.namaLengkapBride}
								onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
									handleChange("namaLengkapBride", e.target.value)
								}
								required
							/>
						</div>

						<div className="field">
							<label htmlFor="namaPanggilanBride">Nama Panggilan Bride</label>
							<InputText
								id="namaPanggilanBride"
								value={formData.namaPanggilanBride}
								onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
									handleChange("namaPanggilanBride", e.target.value)
								}
							/>
						</div>

						<div className="field">
							<label htmlFor="bioBride">Bio Bride</label>
							<InputTextarea
								id="bioBride"
								value={formData.bioBride}
								rows={5}
								onChange={(e) =>
									handleChange("bioBride", e.target.value)
								}
							/>
						</div>

						<div className="field">
							<label htmlFor="sosmedBride">Social Media Bride</label>
							<InputText
								id="sosmedBride"
								value={formData.sosmedBride}
								onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
									handleChange("sosmedBride", e.target.value)
								}
							/>
						</div>

					</div>
				</div>

				<div className="field">
					<label htmlFor="quote">Quote</label>
					<InputTextarea
						id="quote"
						value={formData.quote}
						rows={5}
						onChange={(e) =>
							handleChange("quote", e.target.value)
						}
					/>
				</div>

				<div className="field">
					<label htmlFor="openingText">Teks Opening</label>
					<InputText
						id="openingText"
						value={formData.openingText}
						onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
							handleChange("openingText", e.target.value)
						}
					/>
				</div>

				<div className="field">
					<label htmlFor="loveStory">Love Story</label>
					<InputTextarea
						id="loveStory"
						value={formData.loveStory}
						rows={5}
						onChange={(e) =>
							handleChange("loveStory", e.target.value)
						}
					/>
				</div>

				<div className="field">
					<label htmlFor="urlVideoPrewedding">URL Video Prewedding</label>
					<InputText
						id="urlVideoPrewedding"
						value={formData.urlVideoPrewedding}
						onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
							handleChange("urlVideoPrewedding", e.target.value)
						}
					/>
				</div>

				<div className="field">
					<label htmlFor="urlVideoStreaming">URL Video Streaming</label>
					<InputText
						id="urlVideoStreaming"
						value={formData.urlVideoStreaming}
						onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
							handleChange("urlVideoStreaming", e.target.value)
						}
					/>
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

export default WeddingList;
