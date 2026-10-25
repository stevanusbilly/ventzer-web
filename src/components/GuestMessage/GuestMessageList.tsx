import React, { useState, useEffect } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { guestMessageService } from "../../services/guestMessageService";
import { eventService } from "../../services/eventService";
import { useRef } from "react";
import { Event, GuestMessage } from "../../types";
import { useAuth } from "../../contexts/AuthContext";

const GuestMessageList: React.FC = () => {
	const [guestMessage, setGuestMessage] = useState<GuestMessage[]>([]);
	const [events, setEvents] = useState<Event[]>([]);
	const [selectedFilterEvent, setSelectedFilterEvent] = useState<number>(0);
	const [loading, setLoading] = useState<boolean>(true);
	const { user } = useAuth();
	const toast = useRef<Toast>(null);

	useEffect(() => {
		loadEvents();
	}, []);

	useEffect(() => {
		loadGuestMessage();
	}, [selectedFilterEvent])

	const loadGuestMessage = async (): Promise<void> => {
		try {
			const response = await guestMessageService.getByEvent(selectedFilterEvent);
			setGuestMessage(response);
		} catch (error) {
			showError("Failed to load message");
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
			loadGuestMessage();
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

	const handleDelete = (guestMessage: GuestMessage): void => {
		confirmDialog({
			message: "Are you sure you want to delete this message?",
			header: "Confirm Deletion",
			icon: "pi pi-exclamation-triangle",
			accept: () => deleteGuestMessage(guestMessage.id),
		});
	};

	const deleteGuestMessage = async (id: number): Promise<void> => {
		try {
			await guestMessageService.del(id);
			showSuccess("Guest Message deleted successfully");
			loadGuestMessage();
		} catch (error) {
			showError("Failed to delete message");
		}
	};

	const actionBodyGuestMessage = (rowData: GuestMessage): React.ReactNode => {
		return (
			<div className="flex gap-1">
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
				<h2>Guest Message Management</h2>
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
				</div>
			</div>

			<DataTable
				value={guestMessage}
				loading={loading}
				paginator
				rows={10}
				rowsPerPageOptions={[5, 10, 25, 50]}
				emptyMessage="No message found"
			>
				<Column
					field="eventName"
					header="Event"
					sortable
					filter
					filterPlaceholder="Search by Event"
				/>
				<Column
					field="guestName"
					header="Guest"
					sortable
					filter
					filterPlaceholder="Search by Guest"
				/>
				<Column
					field="message"
					header="Message"
					sortable
					filter
					filterPlaceholder="Search by Message"
				/>
				<Column body={actionBodyGuestMessage} header="Actions" />
			</DataTable>
		</div>
	);
};

export default GuestMessageList;
