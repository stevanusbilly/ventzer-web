import React, { useState, useEffect, useRef } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { Checkbox } from "primereact/checkbox";
import { Calendar } from "primereact/calendar";
import { ConfirmDialog } from "primereact/confirmdialog";
import { eventService } from "../../services/eventService";
import EventForm from "./EventForm";
import EventManageDialog from "./EventManageDialog";
import { Event } from "../../types";
import { useAuth } from "../../contexts/AuthContext";
import { getApiErrorMessage } from "../../utils/apiError";
import { currentMonthRange, toDateQueryParams } from "../../utils/dateRange";

const EventList: React.FC = () => {
	const [events, setEvents] = useState<Event[]>([]);
	const [dateRange, setDateRange] = useState<(Date | null)[]>(currentMonthRange());
	const [loading, setLoading] = useState(true);
	const [showForm, setShowForm] = useState(false);
	const [showManage, setShowManage] = useState(false);
	const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
	const { user, isAdmin, canMutate } = useAuth();
	const toast = useRef<Toast>(null);

	useEffect(() => {
		void loadEvents();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [dateRange]);

	const loadEvents = async (): Promise<Event[]> => {
		const params = toDateQueryParams(dateRange);
		if (!params.dateFrom && !params.dateTo) {
			setEvents([]);
			setLoading(false);
			return [];
		}
		setLoading(true);
		try {
			const response =
				user?.role === "admin"
					? await eventService.getAll(params)
					: await eventService.getByUser(user?.id || 0, params);
			setEvents(response);
			return response;
		} catch (error: unknown) {
			showError(getApiErrorMessage(error, "Gagal memuat event"));
			return [];
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

	const handleFormSuccess = (message: string): void => {
		setShowForm(false);
		showSuccess(message);
		void loadEvents();
	};

	const handleManageChanged = async (message?: string): Promise<void> => {
		if (message) {
			showSuccess(message);
		}
		const next = await loadEvents();
		if (!selectedEvent) {
			return;
		}
		const fresh = next.find((item) => item.id === selectedEvent.id);
		if (fresh) {
			setSelectedEvent(fresh);
			return;
		}
		setShowManage(false);
		setSelectedEvent(null);
	};

	const actionBodyTemplate = (rowData: Event): React.ReactNode => (
		<Button
			label="Kelola"
			icon="pi pi-th-large"
			className="p-button-outlined"
			onClick={() => {
				setSelectedEvent(rowData);
				setShowManage(true);
			}}
		/>
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
				value={events}
				loading={loading}
				paginator
				rows={10}
				emptyMessage={
					dateRange[0]
						? "Tidak ada event pada rentang tanggal ini"
						: "Pilih rentang tanggal untuk menampilkan event"
				}
			>
				<Column field="name" header="Nama" sortable filter />
				<Column field="templateName" header="Template" sortable filter />
				<Column field="userName" header="Pemilik" sortable filter />
				<Column
					field="date"
					header="Tanggal"
					body={(row: Event) => new Date(row.date).toLocaleString("id-ID")}
					sortable
					filter
				/>
				<Column field="max_pack" header="Max pack" sortable filter />
				<Column field="dresscode" header="Dresscode" sortable filter />
				<Column
					field="autoplay_music"
					header="Autoplay"
					body={(row: Event) => (
						<Checkbox checked={row.autoplay_music === 1} disabled />
					)}
					sortable
				/>
				{canMutate && (
					<Column body={actionBodyTemplate} header="Aksi" style={{ width: "9rem" }} />
				)}
			</DataTable>
			{showForm && (
				<EventForm
					event={selectedEvent}
					onSuccess={handleFormSuccess}
					onHide={() => setShowForm(false)}
				/>
			)}
			{showManage && selectedEvent && (
				<EventManageDialog
					event={selectedEvent}
					onHide={() => setShowManage(false)}
					onChanged={handleManageChanged}
					onError={showError}
				/>
			)}
		</div>
	);
};

export default EventList;
