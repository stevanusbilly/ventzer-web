import React, { useEffect, useRef, useState } from "react";
import { Dialog } from "primereact/dialog";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { Message } from "primereact/message";
import { Toast } from "primereact/toast";
import { FileUpload, FileUploadSelectEvent } from "primereact/fileupload";
import { Image } from "primereact/image";
import { confirmDialog } from "primereact/confirmdialog";
import moment from "moment";
import { eventPhotoService } from "../../services/eventPhotoService";
import { categoryPhotoService } from "../../services/categoryPhotoService";
import { CategoryPhoto, Event, EventPhoto } from "../../types";
import { useAuth } from "../../contexts/AuthContext";
import { getApiErrorMessage, getApiSuccessMessage } from "../../utils/apiError";
import { isLoveStoryCategory } from "../../utils/loveStory";

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

const emptyPhoto = (event: Event): Omit<EventPhoto, "id"> => ({
	eventId: event.id,
	eventName: event.name,
	categoryPhotoId: 0,
	categoryPhotoName: "",
	name: "",
	date: "",
	keterangan: "",
	pathImage: "",
	order: 0,
});

interface EventPhotoDialogProps {
	event: Event;
	onHide: () => void;
}

const EventPhotoDialog: React.FC<EventPhotoDialogProps> = ({ event, onHide }) => {
	const { canMutate } = useAuth();
	const [items, setItems] = useState<EventPhoto[]>([]);
	const [categories, setCategories] = useState<CategoryPhoto[]>([]);
	const [loading, setLoading] = useState(false);
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState("");
	const [editing, setEditing] = useState<EventPhoto | null>(null);
	const [formData, setFormData] = useState<Omit<EventPhoto, "id">>(emptyPhoto(event));
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [previewUrl, setPreviewUrl] = useState("");
	const [isReplacing, setIsReplacing] = useState(false);
	const fileUploadRef = useRef<FileUpload>(null);
	const toast = useRef<Toast>(null);

	const loadItems = async (): Promise<void> => {
		setLoading(true);
		try {
			const response = await eventPhotoService.getByEvent(event.id);
			setItems(response);
		} catch (err: unknown) {
			showError(getApiErrorMessage(err, "Gagal memuat foto"));
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		loadItems();
		if (canMutate) {
			categoryPhotoService
				.list()
				.then(setCategories)
				.catch((err: unknown) =>
					showError(getApiErrorMessage(err, "Gagal memuat kategori foto")),
				);
		}
		resetForm();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [event.id, canMutate]);

	useEffect(() => {
		return () => {
			if (previewUrl) {
				URL.revokeObjectURL(previewUrl);
			}
		};
	}, [previewUrl]);

	const showError = (message: string): void => {
		toast.current?.show({
			severity: "error",
			summary: "Error",
			detail: message,
			life: 3000,
		});
	};

	const showSuccess = (message: string): void => {
		toast.current?.show({
			severity: "success",
			summary: "Berhasil",
			detail: message,
			life: 3000,
		});
	};

	const clearFile = (): void => {
		setSelectedFile(null);
		if (previewUrl) {
			URL.revokeObjectURL(previewUrl);
			setPreviewUrl("");
		}
		fileUploadRef.current?.clear();
	};

	const resetForm = (): void => {
		setEditing(null);
		setFormData(emptyPhoto(event));
		setIsReplacing(false);
		clearFile();
		setError("");
	};

	const selectedCategoryName =
		categories.find((row) => row.id === formData.categoryPhotoId)?.name ||
		formData.categoryPhotoName;
	const showStoryFields = isLoveStoryCategory(selectedCategoryName);

	const handleChange = (
		field: keyof Omit<EventPhoto, "id">,
		value: string | number,
	): void => {
		setFormData((prev) => {
			if (field !== "categoryPhotoId") {
				return { ...prev, [field]: value };
			}
			const nextName = categories.find((row) => row.id === value)?.name || "";
			if (isLoveStoryCategory(nextName)) {
				return {
					...prev,
					categoryPhotoId: Number(value),
					categoryPhotoName: nextName,
					order: prev.order || 1,
				};
			}
			return {
				...prev,
				categoryPhotoId: Number(value),
				categoryPhotoName: nextName,
				date: "",
				keterangan: "",
				order: 0,
			};
		});
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

	const handleEdit = (row: EventPhoto): void => {
		setEditing(row);
		setFormData({
			eventId: event.id,
			eventName: event.name,
			categoryPhotoId: row.categoryPhotoId || 0,
			categoryPhotoName: row.categoryPhotoName || "",
			name: row.name || "",
			date: row.date || "",
			keterangan: row.keterangan || "",
			pathImage: row.pathImage || "",
			order: row.order || 1,
		});
		setIsReplacing(false);
		clearFile();
		setError("");
	};

	const handleSubmit = async (e: React.FormEvent): Promise<void> => {
		e.preventDefault();
		if (!editing && !selectedFile) {
			setError("Silakan pilih gambar terlebih dahulu.");
			return;
		}
		setSubmitting(true);
		setError("");
		try {
			const data = new FormData();
			data.append("eventId", String(event.id));
			data.append("categoryPhotoId", String(formData.categoryPhotoId));
			data.append("name", formData.name);
			data.append(
				"date",
				showStoryFields && formData.date
					? moment(formData.date).format("YYYY-MM-DD")
					: "",
			);
			data.append("keterangan", showStoryFields ? formData.keterangan : "");
			data.append("order", String(showStoryFields ? formData.order || 1 : 0));
			if (selectedFile) {
				data.append("pathImage", selectedFile);
			} else {
				data.append("pathImage", formData.pathImage || "");
			}
			const result = editing
				? await eventPhotoService.upd(editing.id, data)
				: await eventPhotoService.ins(data);
			showSuccess(
				getApiSuccessMessage(
					result,
					editing ? "Foto diperbarui" : "Foto ditambahkan",
				),
			);
			resetForm();
			await loadItems();
		} catch (err: unknown) {
			setError(getApiErrorMessage(err, "Gagal menyimpan foto"));
		} finally {
			setSubmitting(false);
		}
	};

	const handleDelete = (row: EventPhoto): void => {
		confirmDialog({
			message: `Hapus foto "${row.name}"?`,
			header: "Konfirmasi",
			icon: "pi pi-exclamation-triangle",
			accept: async () => {
				try {
					const data = await eventPhotoService.del(row.id);
					showSuccess(getApiSuccessMessage(data, "Foto dihapus"));
					if (editing?.id === row.id) {
						resetForm();
					}
					await loadItems();
				} catch (err: unknown) {
					showError(getApiErrorMessage(err, "Gagal menghapus foto"));
				}
			},
		});
	};

	return (
		<Dialog
			header={`Foto — ${event.name}`}
			visible
			style={{ width: "80vw", maxWidth: "64rem" }}
			onHide={onHide}
			contentStyle={{ overflowY: "auto", maxHeight: "75vh" }}
		>
			<Toast ref={toast} />
			{canMutate && (
			<form onSubmit={handleSubmit} className="p-fluid mb-4">
				{error && (
					<Message
						severity="error"
						text={error}
						className="w-full mb-3"
						style={{ whiteSpace: "break-spaces" }}
					/>
				)}
				<div className="grid">
					<div className="col-12 md:col-6 field">
						<label htmlFor="photoCategory">Kategori</label>
						<Dropdown
							id="photoCategory"
							value={formData.categoryPhotoId}
							options={categories.map((el) => ({
								label: el.name,
								value: el.id,
							}))}
							onChange={(e: DropdownChangeEvent) =>
								handleChange("categoryPhotoId", e.value)
							}
							filter
							required
							placeholder="Pilih kategori"
						/>
					</div>
					<div className="col-12 md:col-6 field">
						<label htmlFor="photoName">{showStoryFields ? "Judul" : "Nama"}</label>
						<InputText
							id="photoName"
							value={formData.name}
							onChange={(e) => handleChange("name", e.target.value)}
							required
						/>
					</div>
					{showStoryFields && (
						<>
					<div className="col-12 md:col-6 field">
						<label htmlFor="photoDate">Tanggal</label>
						<Calendar
							id="photoDate"
							value={formData.date ? new Date(formData.date) : null}
							onChange={(e) =>
								handleChange(
									"date",
									e.value ? moment(e.value as Date).format("YYYY-MM-DD") : "",
								)
							}
							dateFormat="dd/mm/yy"
							required
						/>
					</div>
					<div className="col-12 md:col-6 field">
						<label htmlFor="photoOrder">Urutan</label>
						<InputText
							id="photoOrder"
							keyfilter="int"
							value={String(formData.order || 1)}
							onChange={(e) => handleChange("order", Number(e.target.value) || 0)}
							required
						/>
					</div>
					<div className="col-12 field">
						<label htmlFor="keterangan">Keterangan</label>
						<InputTextarea
							id="keterangan"
							value={formData.keterangan}
							rows={5}
							onChange={(e) => handleChange("keterangan", e.target.value)}
							required
						/>
					</div>
						</>
					)}
					<div className="col-12 field">
						<label className="font-semibold block mb-2">Foto</label>
						{editing && formData.pathImage && !isReplacing ? (
							<div className="flex align-items-center gap-3 flex-wrap p-3 border-1 surface-border border-round">
								<Image
									src={getImageUrl(formData.pathImage)}
									alt={formData.name}
									width="120"
									preview
									imageClassName="border-round"
									imageStyle={{ maxHeight: "90px" }}
								/>
								<Button
									type="button"
									label="Ganti gambar"
									icon="pi pi-refresh"
									className="p-button-outlined p-button-sm"
									onClick={() => setIsReplacing(true)}
								/>
							</div>
						) : (
							<div className="flex flex-column gap-2">
								{editing && isReplacing && (
									<Button
										type="button"
										label="Batal ganti"
										className="p-button-text p-button-sm w-auto"
										onClick={() => {
											setIsReplacing(false);
											clearFile();
										}}
									/>
								)}
								<FileUpload
									ref={fileUploadRef}
									name="pathImage"
									accept="image/*"
									maxFileSize={10000000}
									mode="basic"
									auto={false}
									chooseLabel="Pilih gambar"
									onSelect={handleFileSelect}
								/>
								{previewUrl && (
									<Image
										src={previewUrl}
										alt="Preview"
										width="120"
										preview
										imageClassName="border-round"
										imageStyle={{ maxHeight: "90px" }}
									/>
								)}
							</div>
						)}
					</div>
				</div>
				<div className="flex justify-content-end gap-2">
					{editing && (
						<Button
							type="button"
							label="Batal edit"
							className="p-button-text"
							onClick={resetForm}
						/>
					)}
					<Button
						type="submit"
						label={editing ? "Perbarui foto" : "Tambah foto"}
						icon={editing ? "pi pi-save" : "pi pi-plus"}
						loading={submitting}
					/>
				</div>
			</form>
			)}

			<h3 className="mt-0 mb-3">Daftar foto event</h3>
			<DataTable
				value={items}
				loading={loading}
				paginator
				rows={5}
				emptyMessage="Belum ada foto untuk event ini"
			>
				<Column
					header="Gambar"
					body={(row: EventPhoto) =>
						row.pathImage ? (
							<Image
								src={getImageUrl(row.pathImage)}
								alt={row.name}
								width="60"
								preview
								imageClassName="border-round"
								imageStyle={{ height: "45px", width: "60px" }}
							/>
						) : (
							"-"
						)
					}
				/>
				<Column field="categoryPhotoName" header="Kategori" sortable filter />
				<Column field="name" header="Nama" sortable filter />
				<Column
					field="date"
					header="Tanggal"
					body={(row: EventPhoto) =>
						row.date ? moment(row.date).format("DD/MM/YYYY") : "-"
					}
				/>
				<Column field="keterangan" header="Keterangan" sortable filter />
				<Column field="order" header="Urutan" sortable filter />
				{canMutate && (
				<Column
					header="Aksi"
					body={(row: EventPhoto) => (
						<div className="flex gap-1">
							<Button
								icon="pi pi-pencil"
								className="p-button-rounded p-button-success p-button-text"
								onClick={() => handleEdit(row)}
							/>
							<Button
								icon="pi pi-trash"
								className="p-button-rounded p-button-danger p-button-text"
								onClick={() => handleDelete(row)}
							/>
						</div>
					)}
				/>
				)}
			</DataTable>
		</Dialog>
	);
};

export default EventPhotoDialog;
