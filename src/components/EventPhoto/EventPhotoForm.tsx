import React, { useState, useEffect, useRef } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";
import { Button } from "primereact/button";
import { Message } from "primereact/message";
import { FileUpload, FileUploadSelectEvent } from "primereact/fileupload";
import { Image } from "primereact/image";
import { eventPhotoService } from "../../services/eventPhotoService";
import { eventService } from "../../services/eventService";
import { categoryPhotoService } from "../../services/categoryPhotoService";
import { CategoryPhoto, Event, EventPhoto } from "../../types";
import { useAuth } from "../../contexts/AuthContext";
import { getApiErrorMessage, getApiSuccessMessage } from "../../utils/apiError";

interface EventPhotoFormProps {
	eventPhoto: EventPhoto | null;
	onSuccess: (message: string) => void;
	onHide: () => void;
}

const EventPhotoForm: React.FC<EventPhotoFormProps> = ({ eventPhoto, onSuccess, onHide }) => {
	const [formData, setFormData] = useState<Omit<EventPhoto, "id">>({
		eventId: eventPhoto?.eventId || 0,
		eventName: eventPhoto?.eventName || "",
		categoryPhotoId: eventPhoto?.categoryPhotoId || 0,
		categoryPhotoName: eventPhoto?.categoryPhotoName || "",
		name: eventPhoto?.name || "",
		date: eventPhoto?.date || "",
		keterangan: eventPhoto?.keterangan || "",
		pathImage: eventPhoto?.pathImage || "",
		order: eventPhoto?.order || 1,
	});
	const [event, setEvent] = useState<Event[]>([]);
	const [categoryPhoto, setCategoryPhoto] = useState<CategoryPhoto[]>([]);
	const [loading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState<string>("");
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [previewUrl, setPreviewUrl] = useState<string>("");
	const [isReplacing, setIsReplacing] = useState<boolean>(false);
	const fileUploadRef = useRef<FileUpload>(null);
	const { user } = useAuth();

	useEffect(() => {
		loadEvent();
		loadCategoryPhoto();
	}, []);

	useEffect(() => {
		return () => {
			if (previewUrl) {
				URL.revokeObjectURL(previewUrl);
			}
		};
	}, [previewUrl]);

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

	const loadCategoryPhoto = async (): Promise<void> => {
		try {
			const response = await categoryPhotoService.list();
			setCategoryPhoto(response);
		} catch (error) {
			console.error("Failed to load category:", error);
		}
	};

	const getImageUrl = (path: string): string => {
		if (!path) return "";
		if (
			path.startsWith("http://") ||
			path.startsWith("https://") ||
			path.startsWith("blob:") ||
			path.startsWith("data:")
		) {
			return path;
		}
		const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:3000/api";
		const baseUrl = apiUrl.replace(/\/api\/?$/, "");
		return `${baseUrl}${path.startsWith("/") ? "" : "/"}${path}`;
	};

	const handleFileSelect = (e: FileUploadSelectEvent): void => {
		if (e.files && e.files.length > 0) {
			const file = e.files[0];
			setSelectedFile(file);
			if (previewUrl) {
				URL.revokeObjectURL(previewUrl);
			}
			setPreviewUrl(URL.createObjectURL(file));
		}
	};

	const handleRemoveSelectedFile = (): void => {
		setSelectedFile(null);
		if (previewUrl) {
			URL.revokeObjectURL(previewUrl);
			setPreviewUrl("");
		}
		if (fileUploadRef.current) {
			fileUploadRef.current.clear();
		}
	};

	const handleCancelReplace = (): void => {
		setIsReplacing(false);
		handleRemoveSelectedFile();
	};

	const handleSubmit = async (e: React.FormEvent): Promise<void> => {
		e.preventDefault();
		setLoading(true);
		setError("");

		// Validasi jika gambar belum ada saat create
		if (!eventPhoto && !selectedFile) {
			setError("Silakan pilih gambar terlebih dahulu.");
			setLoading(false);
			return;
		}

		try {
			const data = new FormData();
			data.append("eventId", String(formData.eventId));
			data.append("categoryPhotoId", String(formData.categoryPhotoId));
			data.append("name", formData.name);
			data.append("date", formData.date);
			data.append("keterangan", formData.keterangan);
			data.append("order", String(formData.order));

			if (selectedFile) {
				data.append("pathImage", selectedFile);
			} else {
				data.append("pathImage", formData.pathImage || "");
			}

			const result = eventPhoto
				? await eventPhotoService.upd(eventPhoto.id, data)
				: await eventPhotoService.ins(data);
			onSuccess(
				getApiSuccessMessage(
					result,
					eventPhoto ? "Foto diperbarui" : "Foto ditambahkan",
				),
			);
		} catch (error: unknown) {
			setError(getApiErrorMessage(error, "Gagal menyimpan foto"));
		} finally {
			setLoading(false);
		}
	};

	const handleChange = (
		field: keyof Omit<EventPhoto, "id">,
		value: string | Date | number
	): void => {
		setFormData((prev) => ({ ...prev, [field]: value }));
	};

	return (
		<Dialog
			header={eventPhoto ? "Edit Photo" : "Create Photo"}
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
					<label htmlFor="categoryPhotoId">Category</label>
					<Dropdown
						id="categoryPhotoId"
						value={formData.categoryPhotoId}
						options={categoryPhoto.map((el) => ({
							label: el.name,
							value: el.id,
						}))}
						onChange={(e: DropdownChangeEvent) =>
							handleChange("categoryPhotoId", e.value)
						}
						filter
						required
						placeholder="Select an category"
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
					<label htmlFor="date">Date</label>
					<InputText
						id="date"
						value={formData.date}
						onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
							handleChange("date", e.target.value)
						}
						required
					/>
				</div>

				<div className="field">
					<label htmlFor="keterangan">Keterangan</label>
					<InputText
						id="keterangan"
						value={formData.keterangan}
						onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
							handleChange("keterangan", e.target.value)
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

				<div className="field">
					<label htmlFor="pathImage" className="font-semibold block mb-2">
						Photo / Image
					</label>
					{eventPhoto && formData.pathImage && !isReplacing ? (
						<div className="flex flex-column gap-2 p-3 border-1 surface-border border-round surface-50">
							<span className="text-sm text-color-secondary font-medium">
								Last uploaded image:
							</span>
							<div className="flex align-items-center gap-3 flex-wrap">
								<Image
									src={getImageUrl(formData.pathImage)}
									alt={formData.name || "Last Uploaded"}
									width="160"
									preview
									imageClassName="border-round shadow-2 object-cover"
									imageStyle={{ maxHeight: "120px" }}
								/>
								<div className="flex flex-column gap-2">
									<span className="text-xs text-500 font-mono" style={{ wordBreak: "break-all" }}>
										{formData.pathImage}
									</span>
									<Button
										type="button"
										label="Replace Image"
										icon="pi pi-refresh"
										className="p-button-outlined p-button-sm p-button-warning w-auto"
										onClick={() => setIsReplacing(true)}
									/>
								</div>
							</div>
						</div>
					) : (
						<div className="flex flex-column gap-2">
							{eventPhoto && formData.pathImage && isReplacing && (
								<div className="flex justify-content-between align-items-center mb-1">
									<span className="text-sm text-orange-600 font-medium">
										Select replacement image:
									</span>
									<Button
										type="button"
										label="Cancel Replace"
										icon="pi pi-times"
										className="p-button-text p-button-sm p-button-secondary"
										onClick={handleCancelReplace}
									/>
								</div>
							)}
							<FileUpload
								ref={fileUploadRef}
								name="pathImage"
								accept="image/*"
								maxFileSize={10000000}
								mode="basic"
								auto={false}
								chooseLabel={
									selectedFile
										? "Change Selected Image"
										: isReplacing
										? "Choose New Image"
										: "Choose Image"
								}
								onSelect={handleFileSelect}
								className="w-full"
							/>
							{selectedFile && (
								<div className="flex align-items-center justify-content-between p-2 surface-100 border-round mt-1">
									<span className="text-sm font-medium text-700 truncate" style={{ maxWidth: "70%" }}>
										<i className="pi pi-image mr-2 text-primary"></i>
										{selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
									</span>
									<Button
										type="button"
										icon="pi pi-trash"
										className="p-button-rounded p-button-danger p-button-text p-button-sm"
										onClick={handleRemoveSelectedFile}
										tooltip="Remove file"
									/>
								</div>
							)}
							{previewUrl && (
								<div className="mt-2">
									<span className="text-xs text-color-secondary block mb-1">New image preview:</span>
									<Image
										src={previewUrl}
										alt="New Preview"
										width="160"
										preview
										imageClassName="border-round shadow-2 object-cover"
										imageStyle={{ maxHeight: "120px" }}
									/>
								</div>
							)}
						</div>
					)}
				</div>

				<Button
					type="submit"
					label={eventPhoto ? "Update Photo" : "Create Photo"}
					loading={loading}
					className="mt-2"
				/>
			</form>
		</Dialog>
	);
};

export default EventPhotoForm;
