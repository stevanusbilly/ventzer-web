import React, { useEffect, useRef, useState } from "react";
import { Dialog } from "primereact/dialog";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Calendar } from "primereact/calendar";
import { Message } from "primereact/message";
import { Toast } from "primereact/toast";
import { confirmDialog } from "primereact/confirmdialog";
import moment from "moment";
import { eventLocationService } from "../../services/eventLocationService";
import { Event, EventLocation } from "../../types";
import { useAuth } from "../../contexts/AuthContext";
import { getApiErrorMessage, getApiSuccessMessage } from "../../utils/apiError";

const emptyLocation = (event: Event): Omit<EventLocation, "id"> => ({
	eventId: event.id,
	eventName: event.name,
	name: "",
	location: "",
	alamat: "",
	date: "",
	startTime: "",
	endTime: "",
	urlMaps: "",
	order: 1,
});

interface EventLocationDialogProps {
	event: Event;
	onHide: () => void;
}

const EventLocationDialog: React.FC<EventLocationDialogProps> = ({
	event,
	onHide,
}) => {
	const { canMutate } = useAuth();
	const [items, setItems] = useState<EventLocation[]>([]);
	const [loading, setLoading] = useState(false);
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState("");
	const [editing, setEditing] = useState<EventLocation | null>(null);
	const [formData, setFormData] = useState<Omit<EventLocation, "id">>(
		emptyLocation(event),
	);
	const toast = useRef<Toast>(null);

	const loadItems = async (): Promise<void> => {
		setLoading(true);
		try {
			const response = await eventLocationService.getByEvent(event.id);
			setItems(response);
		} catch (err: unknown) {
			showError(getApiErrorMessage(err, "Gagal memuat lokasi"));
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		loadItems();
		resetForm();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [event.id]);

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

	const resetForm = (): void => {
		setEditing(null);
		setFormData(emptyLocation(event));
		setError("");
	};

	const handleChange = (
		field: keyof Omit<EventLocation, "id">,
		value: string | number,
	): void => {
		setFormData((prev) => ({ ...prev, [field]: value }));
	};

	const handleEdit = (row: EventLocation): void => {
		setEditing(row);
		setFormData({
			eventId: event.id,
			eventName: event.name,
			name: row.name || "",
			location: row.location || "",
			alamat: row.alamat || "",
			date: row.date || "",
			startTime: row.startTime || "",
			endTime: row.endTime || "",
			urlMaps: row.urlMaps || "",
			order: row.order || 1,
		});
		setError("");
	};

	const handleSubmit = async (e: React.FormEvent): Promise<void> => {
		e.preventDefault();
		setSubmitting(true);
		setError("");
		const payload: Omit<EventLocation, "id"> = {
			...formData,
			eventId: event.id,
			eventName: event.name,
			date: formData.date
				? moment(formData.date).format("YYYY-MM-DD")
				: "",
			order: Number(formData.order) || 1,
		};
		try {
			const result = editing
				? await eventLocationService.upd(editing.id, payload)
				: await eventLocationService.ins(payload);
			showSuccess(
				getApiSuccessMessage(
					result,
					editing ? "Lokasi diperbarui" : "Lokasi ditambahkan",
				),
			);
			resetForm();
			await loadItems();
		} catch (err: unknown) {
			setError(getApiErrorMessage(err, "Gagal menyimpan lokasi"));
		} finally {
			setSubmitting(false);
		}
	};

	const handleDelete = (row: EventLocation): void => {
		confirmDialog({
			message: `Hapus lokasi "${row.name}"?`,
			header: "Konfirmasi",
			icon: "pi pi-exclamation-triangle",
			accept: async () => {
				try {
					const data = await eventLocationService.del(row.id);
					showSuccess(getApiSuccessMessage(data, "Lokasi dihapus"));
					if (editing?.id === row.id) {
						resetForm();
					}
					await loadItems();
				} catch (err: unknown) {
					showError(getApiErrorMessage(err, "Gagal menghapus lokasi"));
				}
			},
		});
	};

	return (
		<Dialog
			header={`Lokasi — ${event.name}`}
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
						<label htmlFor="locName">Nama</label>
						<InputText
							id="locName"
							value={formData.name}
							onChange={(e) => handleChange("name", e.target.value)}
							required
						/>
					</div>
					<div className="col-12 md:col-6 field">
						<label htmlFor="location">Lokasi</label>
						<InputText
							id="location"
							value={formData.location}
							onChange={(e) => handleChange("location", e.target.value)}
							required
						/>
					</div>
					<div className="col-12 field">
						<label htmlFor="alamat">Alamat</label>
						<InputText
							id="alamat"
							value={formData.alamat}
							onChange={(e) => handleChange("alamat", e.target.value)}
							required
						/>
					</div>
					<div className="col-12 md:col-4 field">
						<label htmlFor="locDate">Tanggal</label>
						<Calendar
							id="locDate"
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
					<div className="col-12 md:col-4 field">
						<label htmlFor="startTime">Jam mulai</label>
						<Calendar
							id="startTime"
							value={
								formData.startTime
									? new Date(
											`${moment().format("YYYY-MM-DD")} ${formData.startTime}`,
										)
									: null
							}
							onChange={(e) =>
								handleChange("startTime", moment(e.value).format("HH:mm"))
							}
							timeOnly
							hourFormat="24"
							required
						/>
					</div>
					<div className="col-12 md:col-4 field">
						<label htmlFor="endTime">Jam selesai</label>
						<Calendar
							id="endTime"
							value={
								formData.endTime
									? new Date(
											`${moment().format("YYYY-MM-DD")} ${formData.endTime}`,
										)
									: null
							}
							onChange={(e) =>
								handleChange("endTime", moment(e.value).format("HH:mm"))
							}
							timeOnly
							hourFormat="24"
							required
						/>
					</div>
					<div className="col-12 md:col-8 field">
						<label htmlFor="urlMaps">URL Map</label>
						<InputText
							id="urlMaps"
							value={formData.urlMaps}
							onChange={(e) => handleChange("urlMaps", e.target.value)}
							required
						/>
					</div>
					<div className="col-12 md:col-4 field">
						<label htmlFor="locOrder">Urutan</label>
						<InputText
							id="locOrder"
							keyfilter="int"
							value={String(formData.order)}
							onChange={(e) => handleChange("order", Number(e.target.value) || 0)}
							required
						/>
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
						label={editing ? "Perbarui lokasi" : "Tambah lokasi"}
						icon={editing ? "pi pi-save" : "pi pi-plus"}
						loading={submitting}
					/>
				</div>
			</form>
			)}

			<h3 className="mt-0 mb-3">Daftar lokasi event</h3>
			<DataTable
				value={items}
				loading={loading}
				paginator
				rows={5}
				emptyMessage="Belum ada lokasi untuk event ini"
			>
				<Column field="name" header="Nama" sortable filter />
				<Column field="location" header="Lokasi" sortable filter />
				<Column field="alamat" header="Alamat" sortable filter />
				<Column
					field="date"
					header="Tanggal"
					body={(row: EventLocation) =>
						row.date ? moment(row.date).format("DD/MM/YYYY") : "-"
					}
				/>
				<Column field="startTime" header="Mulai" sortable filter />
				<Column field="endTime" header="Selesai" sortable filter />
				<Column field="order" header="Urutan" sortable filter />
				{canMutate && (
				<Column
					header="Aksi"
					body={(row: EventLocation) => (
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

export default EventLocationDialog;
