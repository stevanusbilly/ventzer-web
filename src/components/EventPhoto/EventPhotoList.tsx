import React, { useState, useEffect } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { eventPhotoService } from "../../services/eventPhotoService";
import { eventService } from "../../services/eventService";
import { useRef } from "react";
import EventPhotoForm from "./EventPhotoForm";
import { Event, EventPhoto } from "../../types";
import { useAuth } from "../../contexts/AuthContext";
import { Image } from "primereact/image";
import { getApiErrorMessage, getApiSuccessMessage } from "../../utils/apiError";

const EventPhotoList: React.FC = () => {
	const [eventPhoto, setEventPhoto] = useState<EventPhoto[]>([]);
	const [events, setEvents] = useState<Event[]>([]);
	const [selectedFilterEvent, setSelectedFilterEvent] = useState<number>(0);
	const [loading, setLoading] = useState<boolean>(true);
	const [showForm, setShowForm] = useState<boolean>(false);
	const [selectedEventPhoto, setSelectedEventPhoto] = useState<EventPhoto | null>(null);
	const { user } = useAuth();
	const toast = useRef<Toast>(null);

	useEffect(() => {
		loadEvents();
	}, []);

	useEffect(() => {
		loadEventPhoto();
	}, [selectedFilterEvent])

	const loadEventPhoto = async (): Promise<void> => {
		try {
			const response = await eventPhotoService.getByEvent(selectedFilterEvent);
			setEventPhoto(response);
		} catch (error: unknown) {
			showError(getApiErrorMessage(error, "Gagal memuat foto"));
		} finally {
			setLoading(false);
		}
	};

	const loadEvents = async (): Promise<void> => {
		try {
			let response = [];
			if (user?.role === 'admin') {
				response = await eventService.getAll();
			} else {
				response = await eventService.getByUser(user?.id ? user.id : 0);
			}
			setEvents(response);
			loadEventPhoto();
		} catch (error: unknown) {
			showError(getApiErrorMessage(error, "Gagal memuat event"));
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

	const handleInsert = (): void => {
		setSelectedEventPhoto(null);
		setShowForm(true);
	};

	const handleEdit = (eventPhoto: EventPhoto): void => {
		setSelectedEventPhoto(eventPhoto);
		setShowForm(true);
	};

	const handleDelete = (eventPhoto: EventPhoto): void => {
		confirmDialog({
			message: "Are you sure you want to delete this photo?",
			header: "Confirm Deletion",
			icon: "pi pi-exclamation-triangle",
			accept: () => deleteEventPhoto(eventPhoto.id),
		});
	};

	const handleFormSuccess = (message: string): void => {
		setShowForm(false);
		showSuccess(message);
		loadEventPhoto();
	};

	const deleteEventPhoto = async (id: number): Promise<void> => {
		try {
			const data = await eventPhotoService.del(id);
			showSuccess(getApiSuccessMessage(data, "Foto dihapus"));
			loadEventPhoto();
		} catch (error: unknown) {
			showError(getApiErrorMessage(error, "Gagal menghapus foto"));
		}
	};

	const imageBodyTemplate = (rowData: EventPhoto): React.ReactNode => {
		if (!rowData.pathImage) return "-";
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
		return (
			<Image
				src={getImageUrl(rowData.pathImage)}
				alt={rowData.name}
				width="60"
				preview
				imageClassName="border-round shadow-1 object-cover"
				imageStyle={{ height: "45px", width: "60px" }}
			/>
		);
	};

	const actionBodyEventPhoto = (rowData: EventPhoto): React.ReactNode => {
		return (
			<div className="flex gap-1">
				<Button
					icon="pi pi-pencil"
					className="p-button-rounded p-button-success p-button-text"
					onClick={() => handleEdit(rowData)}
				/>
				<Button
					icon="pi pi-trash"
					className="p-button-rounded p-button-danger p-button-text"
					onClick={() => handleDelete(rowData)}
				/>
			</div>
		);
	};

	return (
		<div className="card">
			<Toast ref={toast} />
			<ConfirmDialog />

			<div className="flex justify-content-between align-items-center mb-4">
				<h2>Photo Management</h2>
				<div className="flex gap-2">
					<div className="flex align-items-center gap-2">
						<label htmlFor="eventFilter" className="font-semibold text-color-secondary">
							Pilih Event:
						</label>
						<Dropdown
							id="eventFilter"
							value={selectedFilterEvent}
							options={[{
								label: 'Semua',
								value: 0,
							}].concat(events.map((event) => ({
								label: event.name,
								value: event.id
							})))}
							onChange={(e: DropdownChangeEvent) => {
								setSelectedFilterEvent(e.value)
							}}
							placeholder="Pilih Event"
							className="w-14rem"
							filter
						/>
					</div>
					<Button label="Create Photo" icon="pi pi-plus" onClick={handleInsert} />
				</div>
			</div>

			<DataTable
				value={eventPhoto}
				loading={loading}
				paginator
				rows={10}
				rowsPerPageOptions={[5, 10, 25, 50]}
				emptyMessage="No photo found"
			>
				<Column
					field="eventName"
					header="Event"
					sortable
					filter
					filterPlaceholder="Search by Event"
				/>
				<Column
					field="categoryPhotoName"
					header="Kategori"
					sortable
					filter
					filterPlaceholder="Search by Category"
				/>
				<Column
					field="name"
					header="Name"
					sortable
					filter
					filterPlaceholder="Search by Name"
				/>
				<Column
					field="date"
					header="Date"
					sortable
					filter
					filterPlaceholder="Search by Date"
				/>
				<Column
					field="keterangan"
					header="Keterangan"
					sortable
					filter
					filterPlaceholder="Search by Keterangan"
				/>
				<Column
					field="pathImage"
					header="Image"
					body={imageBodyTemplate}
					sortable
					filter
					filterPlaceholder="Search by Image"
				/>
				<Column
					field="order"
					header="Order"
					sortable
					filter
					filterPlaceholder="Search by Order"
				/>
				<Column body={actionBodyEventPhoto} header="Actions" />
			</DataTable>

			{showForm && (
				<EventPhotoForm
					eventPhoto={selectedEventPhoto}
					onSuccess={handleFormSuccess}
					onHide={() => setShowForm(false)}
				/>
			)}
		</div>
	);
};

export default EventPhotoList;
