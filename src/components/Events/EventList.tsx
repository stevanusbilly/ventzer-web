import React, { useState, useEffect, useMemo, useRef } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { Checkbox } from "primereact/checkbox";
import { Calendar } from "primereact/calendar";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { eventService } from "../../services/eventService";
import EventForm from "./EventForm";
import EventAssignmentDialog from "./EventAssignmentDialog";
import WeddingForm from "../Wedding/WeddingForm";
import EventLocationDialog from "../EventLocation/EventLocationDialog";
import EventPhotoDialog from "../EventPhoto/EventPhotoDialog";
import { Event } from "../../types";
import { useAuth } from "../../contexts/AuthContext";
import { getApiErrorMessage, getApiSuccessMessage } from "../../utils/apiError";

const startOfMonth = (date: Date): Date =>
	new Date(date.getFullYear(), date.getMonth(), 1);

const endOfMonth = (date: Date): Date =>
	new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);

const startOfDay = (date: Date): number =>
	new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();

const endOfDay = (date: Date): number =>
	new Date(
		date.getFullYear(),
		date.getMonth(),
		date.getDate(),
		23,
		59,
		59,
		999,
	).getTime();

const EventList: React.FC = () => {
	const now = new Date();
	const [events, setEvents] = useState<Event[]>([]);
	const [dateRange, setDateRange] = useState<(Date | null)[]>([
		startOfMonth(now),
		endOfMonth(now),
	]);
	const [loading, setLoading] = useState(true);
	const [showForm, setShowForm] = useState(false);
	const [showAssignment, setShowAssignment] = useState(false);
	const [showWedding, setShowWedding] = useState(false);
	const [showLocation, setShowLocation] = useState(false);
	const [showPhoto, setShowPhoto] = useState(false);
	const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
	const { user, isAdmin, canMutate } = useAuth();
	const toast = useRef<Toast>(null);

	useEffect(() => {
		loadEvents();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const loadEvents = async (): Promise<void> => {
		try {
			const response =
				user?.role === "admin"
					? await eventService.getAll()
					: await eventService.getByUser(user?.id || 0);
			setEvents(response);
		} catch (error: unknown) {
			showError(getApiErrorMessage(error, "Gagal memuat event"));
		} finally {
			setLoading(false);
		}
	};

	const filteredEvents = useMemo(() => {
		const from = dateRange[0];
		if (!from) {
			return [];
		}
		const fromTime = startOfDay(from);
		const toTime = dateRange[1] ? endOfDay(dateRange[1]) : endOfDay(from);
		return events.filter((event) => {
			const time = new Date(event.date).getTime();
			if (Number.isNaN(time)) {
				return false;
			}
			return time >= fromTime && time <= toTime;
		});
	}, [events, dateRange]);

	const showError = (message: string): void => {
		toast.current?.show({ severity: "error", summary: "Error", detail: message, life: 3000 });
	};

	const showSuccess = (message: string): void => {
		toast.current?.show({ severity: "success", summary: "Berhasil", detail: message, life: 3000 });
	};

	const handleFormSuccess = (message: string): void => {
		setShowForm(false);
		showSuccess(message);
		loadEvents();
	};

	const handleWeddingSuccess = (message: string): void => {
		setShowWedding(false);
		showSuccess(message);
	};

	const deleteEvent = async (id: number): Promise<void> => {
		try {
			const data = await eventService.delete(id);
			showSuccess(getApiSuccessMessage(data, "Event dihapus"));
			loadEvents();
		} catch (error: unknown) {
			showError(getApiErrorMessage(error, "Gagal menghapus event"));
		}
	};

	const actionBodyTemplate = (rowData: Event): React.ReactNode => (
		<div className="flex gap-1 flex-wrap">
			{canMutate && (
				<Button
					icon="pi pi-pencil"
					className="p-button-rounded p-button-success p-button-text"
					tooltip="Edit event"
					onClick={() => {
						setSelectedEvent(rowData);
						setShowForm(true);
					}}
				/>
			)}
			<Button
				icon="pi pi-heart"
				className="p-button-rounded p-button-help p-button-text"
				tooltip="Data wedding"
				onClick={() => {
					setSelectedEvent(rowData);
					setShowWedding(true);
				}}
			/>
			<Button
				icon="pi pi-map-marker"
				className="p-button-rounded p-button-secondary p-button-text"
				tooltip="Lokasi event"
				onClick={() => {
					setSelectedEvent(rowData);
					setShowLocation(true);
				}}
			/>
			<Button
				icon="pi pi-image"
				className="p-button-rounded p-button-info p-button-text"
				tooltip="Foto event"
				onClick={() => {
					setSelectedEvent(rowData);
					setShowPhoto(true);
				}}
			/>
			<Button
				icon="pi pi-eye"
				className="p-button-rounded p-button-info p-button-text"
				tooltip="Preview"
				onClick={() => window.open(`/events/preview/${rowData.id}`, "_blank")}
			/>
			{isAdmin && (
				<>
					<Button
						icon="pi pi-users"
						className="p-button-rounded p-button-warning p-button-text"
						onClick={() => {
							setSelectedEvent(rowData);
							setShowAssignment(true);
						}}
						tooltip="Assign panitia"
					/>
					<Button
						icon="pi pi-trash"
						className="p-button-rounded p-button-danger p-button-text"
						onClick={() =>
							confirmDialog({
								message: "Hapus event ini?",
								header: "Konfirmasi",
								accept: () => deleteEvent(rowData.id),
							})
						}
					/>
				</>
			)}
		</div>
	);

	return (
		<div className="card">
			<Toast ref={toast} />
			<ConfirmDialog />
			<div className="flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
				<h2 className="m-0">Manajemen Event</h2>
				<div className="flex align-items-center gap-2 flex-wrap">
					<label htmlFor="eventDateFilter" className="font-semibold white-space-nowrap">
						Tanggal event
					</label>
					<Calendar
						id="eventDateFilter"
						value={dateRange}
						onChange={(e) =>
							setDateRange((e.value as (Date | null)[]) || [null, null])
						}
						selectionMode="range"
						readOnlyInput
						dateFormat="dd/mm/yy"
						placeholder="Dari — sampai"
						showButtonBar
						hideOnRangeSelection
						className="w-18rem"
					/>
					{isAdmin && (
						<Button
							label="Buat Event"
							icon="pi pi-plus"
							onClick={() => {
								setSelectedEvent(null);
								setShowForm(true);
							}}
						/>
					)}
				</div>
			</div>
			<DataTable
				value={filteredEvents}
				loading={loading}
				paginator
				rows={10}
				emptyMessage={
					dateRange[0]
						? "Tidak ada event pada rentang tanggal ini"
						: "Pilih rentang tanggal untuk menampilkan event"
				}
			>
				<Column field="name" header="Nama" sortable filter/>
				<Column field="templateName" header="Template" sortable filter />
				<Column field="userName" header="Pemilik" sortable filter />
				<Column
					field="date"
					header="Tanggal"
					body={(row: Event) => new Date(row.date).toLocaleString("id-ID")}
					sortable
					filter
				/>
				<Column field="dresscode" header="Dresscode" sortable filter />
				<Column
					field="autoplay_music"
					header="Autoplay"
					body={(row: Event) => (
						<Checkbox checked={row.autoplay_music === 1} disabled />
					)}
					sortable
				/>
				<Column body={actionBodyTemplate} header="Aksi" />
			</DataTable>
			{showForm && (
				<EventForm
					event={selectedEvent}
					onSuccess={handleFormSuccess}
					onHide={() => setShowForm(false)}
				/>
			)}
			{showAssignment && selectedEvent && (
				<EventAssignmentDialog
					event={selectedEvent}
					visible={showAssignment}
					onHide={() => setShowAssignment(false)}
				/>
			)}
			{showWedding && selectedEvent && (
				<WeddingForm
					event={selectedEvent}
					onSuccess={handleWeddingSuccess}
					onHide={() => setShowWedding(false)}
				/>
			)}
			{showLocation && selectedEvent && (
				<EventLocationDialog
					event={selectedEvent}
					onHide={() => setShowLocation(false)}
				/>
			)}
			{showPhoto && selectedEvent && (
				<EventPhotoDialog
					event={selectedEvent}
					onHide={() => setShowPhoto(false)}
				/>
			)}
		</div>
	);
};

export default EventList;
