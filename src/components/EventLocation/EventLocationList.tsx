import React, { useState, useEffect } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { eventLocationService } from "../../services/eventLocationService";
import { eventService } from "../../services/eventService";
import { useRef } from "react";
import EventLocationForm from "./EventLocationForm";
import { Event, EventLocation } from "../../types";
import { useAuth } from "../../contexts/AuthContext";

const EventLocationList: React.FC = () => {
	const [eventLocation, setEventLocation] = useState<EventLocation[]>([]);
	const [events, setEvents] = useState<Event[]>([]);
	const [selectedFilterEvent, setSelectedFilterEvent] = useState<number>(0);
	const [loading, setLoading] = useState<boolean>(true);
	const [showForm, setShowForm] = useState<boolean>(false);
	const [selectedEventLocation, setSelectedEventLocation] = useState<EventLocation | null>(null);
	const { user } = useAuth();
	const toast = useRef<Toast>(null);

	useEffect(() => {
		loadEvents();
	}, []);

	useEffect(() => {
		loadEventLocation();
	}, [selectedFilterEvent])

	const loadEventLocation = async (): Promise<void> => {
		try {
			const response = await eventLocationService.getByEvent(selectedFilterEvent);
			setEventLocation(response);
		} catch (error) {
			showError("Failed to load location");
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
			loadEventLocation();
		} catch (error) {
			showError("Failed to load events");
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
		setSelectedEventLocation(null);
		setShowForm(true);
	};

	const handleEdit = (eventLocation: EventLocation): void => {
		setSelectedEventLocation(eventLocation);
		setShowForm(true);
	};

	const handleDelete = (eventLocation: EventLocation): void => {
		confirmDialog({
			message: "Are you sure you want to delete this location?",
			header: "Confirm Deletion",
			icon: "pi pi-exclamation-triangle",
			accept: () => deleteEventLocation(eventLocation.id),
		});
	};

	const deleteEventLocation = async (id: number): Promise<void> => {
		try {
			await eventLocationService.del(id);
			showSuccess("Location deleted successfully");
			loadEventLocation();
		} catch (error) {
			showError("Failed to delete location");
		}
	};

	const handleFormSubmit = (): void => {
		setShowForm(false);
		loadEventLocation();
	};

	const actionBodyEventLocation = (rowData: EventLocation): React.ReactNode => {
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
				<h2>Location Management</h2>
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
					<Button label="Create Location" icon="pi pi-plus" onClick={handleInsert} />
				</div>
			</div>

			<DataTable
				value={eventLocation}
				loading={loading}
				paginator
				rows={10}
				rowsPerPageOptions={[5, 10, 25, 50]}
				emptyMessage="No location found"
			>
				<Column
					field="eventName"
					header="Event"
					sortable
					filter
					filterPlaceholder="Search by Event"
				/>
				<Column
					field="name"
					header="Name"
					sortable
					filter
					filterPlaceholder="Search by Name"
				/>
				<Column
					field="location"
					header="Location"
					sortable
					filter
					filterPlaceholder="Search by Location"
				/>
				<Column
					field="alamat"
					header="Alamat"
					sortable
					filter
					filterPlaceholder="Search by Alamat"
				/>
				<Column
					field="date"
					header="Date"
					sortable
					filter
					filterPlaceholder="Search by Date"
				/>
				<Column
					field="startTime"
					header="Start Time"
					sortable
					filter
					filterPlaceholder="Search by Start Time"
				/>
				<Column
					field="endTime"
					header="End Time"
					sortable
					filter
					filterPlaceholder="Search by End Time"
				/>
				<Column
					field="urlMaps"
					header="URL Map"
					sortable
					filter
					filterPlaceholder="Search by URL Map"
				/>
				<Column body={actionBodyEventLocation} header="Actions" />
			</DataTable>

			{showForm && (
				<EventLocationForm
					eventLocation={selectedEventLocation}
					onSuccess={handleFormSubmit}
					onHide={() => setShowForm(false)}
				/>
			)}
		</div>
	);
};

export default EventLocationList;
