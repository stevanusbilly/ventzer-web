import React, { useState, useEffect } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { Tag } from "primereact/tag";
import { Calendar } from "primereact/calendar";
import { guestMessageService } from "../../services/guestMessageService";
import { eventService } from "../../services/eventService";
import { useRef } from "react";
import { Event, GuestMessage } from "../../types";
import { useAuth } from "../../contexts/AuthContext";
import { getApiErrorMessage, getApiSuccessMessage } from "../../utils/apiError";
import { lastNDaysRange, toDateQueryParams } from "../../utils/dateRange";

const GuestMessageList: React.FC = () => {
	const [guestMessage, setGuestMessage] = useState<GuestMessage[]>([]);
	const [events, setEvents] = useState<Event[]>([]);
	const [selectedFilterEvent, setSelectedFilterEvent] = useState<number>(0);
	const [dateRange, setDateRange] = useState<(Date | null)[]>([null, null]);
	const [loading, setLoading] = useState<boolean>(true);
	const { user, canMutate } = useAuth();
	const toast = useRef<Toast>(null);

	useEffect(() => {
		loadEvents();
	}, []);

	useEffect(() => {
		loadGuestMessage();
	}, [selectedFilterEvent, dateRange]);

	const handleEventFilterChange = (eventId: number): void => {
		setSelectedFilterEvent(eventId);
		if (eventId === 0 && !dateRange[0]) {
			setDateRange(lastNDaysRange(30));
		}
	};

	const loadGuestMessage = async (): Promise<void> => {
		if (!selectedFilterEvent && !dateRange[0]) {
			setGuestMessage([]);
			setLoading(false);
			return;
		}
		setLoading(true);
		try {
			const response = await guestMessageService.getByEvent(
				selectedFilterEvent,
				toDateQueryParams(dateRange),
			);
			setGuestMessage(response);
		} catch (error: unknown) {
			showError(getApiErrorMessage(error, "Gagal memuat ucapan"));
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
			const data = await guestMessageService.del(id);
			showSuccess(getApiSuccessMessage(data, "Ucapan dihapus"));
			loadGuestMessage();
		} catch (error: unknown) {
			showError(getApiErrorMessage(error, "Gagal menghapus ucapan"));
		}
	};

	const togglePublished = async (row: GuestMessage): Promise<void> => {
		try {
			const next = Number(row.published) === 1 ? 0 : 1;
			const data = await guestMessageService.setPublished(row.id, next);
			showSuccess(getApiSuccessMessage(data, next === 1 ? "Ucapan ditampilkan" : "Ucapan disembunyikan"));
			loadGuestMessage();
		} catch (error: unknown) {
			showError(getApiErrorMessage(error, "Gagal mengubah status ucapan"));
		}
	};

	const actionBodyGuestMessage = (rowData: GuestMessage): React.ReactNode => {
		if (!canMutate) {
			return null;
		}
		return (
			<div className="flex gap-1">
				<Button
					icon={Number(rowData.published) === 1 ? "pi pi-eye-slash" : "pi pi-eye"}
					className="p-button-rounded p-button-info p-button-text"
					tooltip={Number(rowData.published) === 1 ? "Sembunyikan" : "Tampilkan"}
					onClick={() => togglePublished(rowData)}
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

			<div className="flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
				<h2>Guest Message Management</h2>
				<div className="flex gap-2 flex-wrap">
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
								handleEventFilterChange(e.value)
							}}
							placeholder="Pilih Event"
							className="w-14rem"
							filter
						/>
					</div>
					<Calendar
						value={dateRange}
						onChange={(e) =>
							setDateRange((e.value as (Date | null)[]) || [null, null])
						}
						selectionMode="range"
						readOnlyInput
						dateFormat="dd/mm/yy"
						placeholder="Tanggal: dari — sampai"
						showButtonBar
						hideOnRangeSelection
						className="w-18rem"
					/>
				</div>
			</div>

			<DataTable
				value={guestMessage}
				loading={loading}
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
				<Column
					header="Status"
					body={(row: GuestMessage) => (
						<Tag
							value={Number(row.published) === 1 ? "Ditampilkan" : "Disembunyikan"}
							severity={Number(row.published) === 1 ? "success" : "warning"}
						/>
					)}
				/>
				{canMutate && <Column body={actionBodyGuestMessage} header="Actions" />}
			</DataTable>
		</div>
	);
};

export default GuestMessageList;
