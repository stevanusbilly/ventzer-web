import React, { useState, useEffect, useRef } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { Checkbox } from "primereact/checkbox";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { eventService } from "../../services/eventService";
import EventForm from "./EventForm";
import EventAssignmentDialog from "./EventAssignmentDialog";
import { Event } from "../../types";
import { useAuth } from "../../contexts/AuthContext";

const EventList: React.FC = () => {
	const [events, setEvents] = useState<Event[]>([]);
	const [loading, setLoading] = useState(true);
	const [showForm, setShowForm] = useState(false);
	const [showAssignment, setShowAssignment] = useState(false);
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
		} catch {
			showError("Gagal memuat event");
		} finally {
			setLoading(false);
		}
	};

	const showError = (message: string): void => {
		toast.current?.show({ severity: "error", summary: "Error", detail: message, life: 3000 });
	};

	const showSuccess = (message: string): void => {
		toast.current?.show({ severity: "success", summary: "Berhasil", detail: message, life: 3000 });
	};

	const deleteEvent = async (id: number): Promise<void> => {
		try {
			await eventService.delete(id);
			showSuccess("Event dihapus");
			loadEvents();
		} catch {
			showError("Gagal menghapus event");
		}
	};

	const actionBodyTemplate = (rowData: Event): React.ReactNode => (
		<div className="flex gap-1">
			{canMutate && (
				<Button
					icon="pi pi-pencil"
					className="p-button-rounded p-button-success p-button-text"
					onClick={() => {
						setSelectedEvent(rowData);
						setShowForm(true);
					}}
				/>
			)}
			<Button
				icon="pi pi-calendar"
				className="p-button-rounded p-button-info p-button-text"
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
			<div className="flex justify-content-between align-items-center mb-4">
				<h2>Manajemen Event</h2>
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
			<DataTable value={events} loading={loading} paginator rows={10} emptyMessage="Tidak ada event">
				<Column field="name" header="Nama" sortable />
				<Column field="templateName" header="Template" />
				<Column field="userName" header="Pemilik" />
				<Column
					field="date"
					header="Tanggal"
					body={(row: Event) => new Date(row.date).toLocaleString("id-ID")}
				/>
				<Column field="dresscode" header="Dresscode" />
				<Column
					field="autoplay_music"
					header="Autoplay"
					body={(row: Event) => (
						<Checkbox checked={row.autoplay_music === 1} disabled />
					)}
				/>
				<Column body={actionBodyTemplate} header="Aksi" />
			</DataTable>
			{showForm && (
				<EventForm
					event={selectedEvent}
					onSuccess={() => {
						setShowForm(false);
						loadEvents();
					}}
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
		</div>
	);
};

export default EventList;
