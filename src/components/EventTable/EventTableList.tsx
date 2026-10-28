import React, { useState, useEffect } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { eventTableService } from "../../services/eventTableService";
import { eventService } from "../../services/eventService";
import { useRef } from "react";
import EventTableForm from "./EventTableForm";
import EventTableGuestDialog from "./EventTableGuestDialog";
import { Event, EventTable } from "../../types";
import { useAuth } from "../../contexts/AuthContext";
import { getApiErrorMessage, getApiSuccessMessage } from "../../utils/apiError";

const EventTableList: React.FC = () => {
	const [eventTable, setEventTable] = useState<EventTable[]>([]);
	const [events, setEvents] = useState<Event[]>([]);
	const [selectedFilterEvent, setSelectedFilterEvent] = useState<number>(0);
	const [loading, setLoading] = useState<boolean>(true);
	const [showForm, setShowForm] = useState<boolean>(false);
	const [selectedEventTable, setSelectedEventTable] = useState<EventTable | null>(null);
	const [showGuestDialog, setShowGuestDialog] = useState<boolean>(false);
	const [tableForGuests, setTableForGuests] = useState<EventTable | null>(null);
	const { user, canMutate } = useAuth();
	const toast = useRef<Toast>(null);

	useEffect(() => {
		loadEvents();
	}, []);

	useEffect(() => {
		loadEventTable();
	}, [selectedFilterEvent])

	const loadEventTable = async (): Promise<void> => {
		try {
			const response = await eventTableService.getByEvent(selectedFilterEvent);
			setEventTable(response);
		} catch (error: unknown) {
			showError(getApiErrorMessage(error, "Gagal memuat meja"));
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
			if (response.length > 0) {
				setSelectedFilterEvent(response[0].id);
			}
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
		setSelectedEventTable(null);
		setShowForm(true);
	};

	const handleEdit = (eventTable: EventTable): void => {
		setSelectedEventTable(eventTable);
		setShowForm(true);
	};

	const handleDelete = (eventTable: EventTable): void => {
		confirmDialog({
			message: "Are you sure you want to delete this table?",
			header: "Confirm Deletion",
			icon: "pi pi-exclamation-triangle",
			accept: () => deleteEventTable(eventTable.id),
		});
	};

	const handleFormSuccess = (message: string): void => {
		setShowForm(false);
		showSuccess(message);
		loadEventTable();
	};

	const deleteEventTable = async (id: number): Promise<void> => {
		try {
			const data = await eventTableService.del(id);
			showSuccess(getApiSuccessMessage(data, "Meja dihapus"));
			loadEventTable();
		} catch (error: unknown) {
			showError(getApiErrorMessage(error, "Gagal menghapus meja"));
		}
	};

	const handleManageGuests = (table: EventTable): void => {
		setTableForGuests(table);
		setShowGuestDialog(true);
	};

	const actionBodyEventTable = (rowData: EventTable): React.ReactNode => {
		return (
			<div className="flex gap-1">
				<Button
					icon="pi pi-users"
					className="p-button-rounded p-button-info p-button-text"
					onClick={() => handleManageGuests(rowData)}
					tooltip="Tamu meja"
					tooltipOptions={{ position: "top" }}
				/>
				{canMutate && (
					<>
						<Button
							icon="pi pi-pencil"
							className="p-button-rounded p-button-success p-button-text"
							onClick={() => handleEdit(rowData)}
							tooltip="Edit Table"
							tooltipOptions={{ position: "top" }}
						/>
						<Button
							icon="pi pi-trash"
							className="p-button-rounded p-button-danger p-button-text"
							onClick={() => handleDelete(rowData)}
							tooltip="Delete Table"
							tooltipOptions={{ position: "top" }}
						/>
					</>
				)}
			</div>
		);
	};

	return (
		<div className="card">
			<Toast ref={toast} />
			<ConfirmDialog />

			<div className="flex justify-content-between align-items-center mb-4">
				<h2>Table Management</h2>
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
					{canMutate && (
						<Button label="Create Table" icon="pi pi-plus" onClick={handleInsert} />
					)}
				</div>
			</div>

			<DataTable
				value={eventTable}
				loading={loading}
				paginator
				rows={10}
				rowsPerPageOptions={[5, 10, 25, 50]}
				emptyMessage="No table found"
			>
				<Column
					field="eventName"
					header="Event"
					sortable
					filter
					filterPlaceholder="Search by Event"
				/>
				<Column
					field="kategori"
					header="Kategori"
					sortable
					filter
					filterPlaceholder="Search by Kategori"
				/>
				<Column
					field="menu"
					header="Menu"
					sortable
					filter
					filterPlaceholder="Search by Menu"
				/>
				<Column
					field="note"
					header="Note"
					sortable
					filter
					filterPlaceholder="Search by Note"
				/>
				<Column
					field="jumlahKursi"
					header="Jumlah Kursi"
					sortable
					filter
					filterPlaceholder="Search by Jumlah Kursi"
				/>
				<Column
					field="jumlahGuest"
					header="Jumlah Guest"
					sortable
					filter
					filterPlaceholder="Search by Jumlah Guest"
				/>
				<Column body={actionBodyEventTable} header="Actions" />
			</DataTable>

			{showForm && (
				<EventTableForm
					eventTable={selectedEventTable}
					onSuccess={handleFormSuccess}
					onHide={() => setShowForm(false)}
				/>
			)}

			<EventTableGuestDialog
				visible={showGuestDialog}
				eventTable={tableForGuests}
				onHide={() => setShowGuestDialog(false)}
				onSuccess={() => loadEventTable()}
			/>
		</div>
	);
};

export default EventTableList;
