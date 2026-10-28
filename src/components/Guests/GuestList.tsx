import React, { useState, useEffect, useRef } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { Tag } from "primereact/tag";
import { InputText } from "primereact/inputtext";
import { Calendar } from "primereact/calendar";
import { guestService } from "../../services/guestService";
import { eventService } from "../../services/eventService";
import { exportService } from "../../services/exportService";
import GuestForm from "./GuestForm";
import BulkUpload from "./BulkUpload";
import { Guest, Event } from "../../types";
import { useAuth } from "../../contexts/AuthContext";
import { buildInvitationUrl } from "../../utils/invitationLink";
import { getApiErrorMessage, getApiSuccessMessage } from "../../utils/apiError";
import { lastNDaysRange, toDateQueryParams } from "../../utils/dateRange";

const RSVP_OPTIONS = [
	{ label: "Semua status", value: "" },
	{ label: "Pending", value: "pending" },
	{ label: "Accepted", value: "accepted" },
	{ label: "Declined", value: "declined" },
];

const GuestList: React.FC = () => {
	const [guests, setGuests] = useState<Guest[]>([]);
	const [events, setEvents] = useState<Event[]>([]);
	const [selectedFilterEvent, setSelectedFilterEvent] = useState<number>(0);
	const [dateRange, setDateRange] = useState<(Date | null)[]>([null, null]);
	const [searchQuery, setSearchQuery] = useState("");
	const [rsvpFilter, setRsvpFilter] = useState("");
	const [loading, setLoading] = useState(true);
	const [showForm, setShowForm] = useState(false);
	const [showBulkUpload, setShowBulkUpload] = useState(false);
	const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
	const { user, canMutate } = useAuth();
	const toast = useRef<Toast>(null);

	useEffect(() => {
		loadEvents();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		const timer = window.setTimeout(() => {
			loadGuests();
		}, 350);
		return () => window.clearTimeout(timer);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selectedFilterEvent, searchQuery, rsvpFilter, dateRange]);

	const handleEventFilterChange = (eventId: number): void => {
		setSelectedFilterEvent(eventId);
		if (eventId === 0 && !dateRange[0]) {
			setDateRange(lastNDaysRange(30));
		}
	};

	const loadGuests = async (): Promise<void> => {
		if (!selectedFilterEvent && !dateRange[0]) {
			setGuests([]);
			setLoading(false);
			return;
		}
		setLoading(true);
		try {
			const params = {
				q: searchQuery || undefined,
				rsvpStatus: rsvpFilter || undefined,
				...toDateQueryParams(dateRange),
			};
			const response = await guestService.getByEvent(selectedFilterEvent, params);
			setGuests(response);
		} catch (error: unknown) {
			showError(getApiErrorMessage(error, "Gagal memuat tamu"));
		} finally {
			setLoading(false);
		}
	};

	const loadEvents = async (): Promise<void> => {
		try {
			const response =
				user?.role === "admin"
					? await eventService.getAll()
					: await eventService.getByUser(user?.id || 0);
			setEvents(response);
			if (response.length > 0) {
				setSelectedFilterEvent(response[0].id);
			}
		} catch (error: unknown) {
			showError(getApiErrorMessage(error, "Gagal memuat event"));
		}
	};

	const showError = (message: string): void => {
		toast.current?.show({ severity: "error", summary: "Error", detail: message, life: 3000 });
	};

	const showSuccess = (message: string): void => {
		toast.current?.show({ severity: "success", summary: "Berhasil", detail: message, life: 3000 });
	};

	const handleDelete = (guest: Guest): void => {
		confirmDialog({
			message: "Hapus tamu ini?",
			header: "Konfirmasi",
			icon: "pi pi-exclamation-triangle",
			accept: async () => {
				try {
					const data = await guestService.delete(guest.id);
					showSuccess(getApiSuccessMessage(data, "Tamu dihapus"));
					loadGuests();
				} catch (err) {
					showError(getApiErrorMessage(err, "Gagal menghapus tamu"));
				}
			},
		});
	};

	const handleRegenerateToken = async (guest: Guest): Promise<void> => {
		try {
			const data = await guestService.regenerateToken(guest.id);
			showSuccess(getApiSuccessMessage(data, "Token QR diperbarui"));
			loadGuests();
		} catch (err) {
			showError(getApiErrorMessage(err, "Gagal regenerate token"));
		}
	};

	const handleDownloadQR = async (guest: Guest): Promise<void> => {
		try {
			const blob = await guestService.getQRCode(guest.id);
			const url = window.URL.createObjectURL(blob);
			const link = document.createElement("a");
			link.href = url;
			link.download = `qr-${guest.name}.png`;
			link.click();
			link.remove();
		} catch (error: unknown) {
			showError(getApiErrorMessage(error, "Gagal unduh QR"));
		}
	};

	const handleCopyLink = async (guest: Guest): Promise<void> => {
		if (!guest.qrToken) {
			showError("Token undangan tidak tersedia");
			return;
		}
		const link = buildInvitationUrl(guest.eventId, guest.qrToken);
		try {
			await navigator.clipboard.writeText(link);
			showSuccess("Link undangan disalin");
		} catch {
			showError(link);
		}
	};

	const handleFormSuccess = (message: string): void => {
		setShowForm(false);
		showSuccess(message);
		loadGuests();
	};

	const handleBulkUploadSuccess = (): void => {
		setShowBulkUpload(false);
		loadGuests();
	};

	const handleExport = async (): Promise<void> => {
		if (!selectedFilterEvent) {
			showError("Pilih event tertentu untuk export");
			return;
		}
		try {
			const blob = await exportService.exportGuestsToExcel(selectedFilterEvent);
			const url = window.URL.createObjectURL(blob);
			const link = document.createElement("a");
			link.href = url;
			link.download = `guests-event-${selectedFilterEvent}.xlsx`;
			link.click();
			link.remove();
		} catch (err) {
			showError(getApiErrorMessage(err, "Export gagal"));
		}
	};

	const statusBodyTemplate = (rowData: Guest): React.ReactNode => {
		const severity = {
			accepted: "success",
			pending: "warning",
			declined: "danger",
		}[rowData.rsvpStatus] as "success" | "warning" | "danger";
		return <Tag value={rowData.rsvpStatus} severity={severity} />;
	};

	const actionBodyTemplate = (rowData: Guest): React.ReactNode => {
		if (!canMutate) {
			return null;
		}
		return (
			<div className="flex gap-1 flex-wrap">
				<Button
					icon="pi pi-pencil"
					className="p-button-rounded p-button-success p-button-text"
					onClick={() => {
						setSelectedGuest(rowData);
						setShowForm(true);
					}}
				/>
				<Button
					icon="pi pi-link"
					className="p-button-rounded p-button-secondary p-button-text"
					onClick={() => handleCopyLink(rowData)}
				/>
				<Button
					icon="pi pi-download"
					className="p-button-rounded p-button-help p-button-text"
					onClick={() => handleDownloadQR(rowData)}
				/>
				<Button
					icon="pi pi-refresh"
					className="p-button-rounded p-button-info p-button-text"
					onClick={() => handleRegenerateToken(rowData)}
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
				<h2 className="m-0">Manajemen Tamu</h2>
				<div className="flex gap-2 flex-wrap">
					<Dropdown
						value={selectedFilterEvent}
						options={[
							{ label: "Semua event", value: 0 },
							...events.map((e) => ({ label: e.name, value: e.id })),
						]}
						onChange={(e: DropdownChangeEvent) => handleEventFilterChange(e.value)}
						className="w-14rem"
						filter
					/>
					<Calendar
						value={dateRange}
						onChange={(e) =>
							setDateRange((e.value as (Date | null)[]) || [null, null])
						}
						selectionMode="range"
						readOnlyInput
						dateFormat="dd/mm/yy"
						placeholder="Tanggal dibuat: dari — sampai"
						showButtonBar
						hideOnRangeSelection
						className="w-18rem"
					/>
					<InputText
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						placeholder="Cari nama/email/telepon"
					/>
					<Dropdown
						value={rsvpFilter}
						options={RSVP_OPTIONS}
						onChange={(e: DropdownChangeEvent) => setRsvpFilter(e.value)}
						className="w-10rem"
					/>
					{canMutate && (
						<>
							<Button
								label="Export Excel"
								icon="pi pi-file-excel"
								className="p-button-outlined p-button-success"
								onClick={handleExport}
							/>
							<Button
								label="Bulk Upload"
								icon="pi pi-upload"
								className="p-button-outlined"
								onClick={() => setShowBulkUpload(true)}
							/>
							<Button
								label="Tambah Tamu"
								icon="pi pi-plus"
								onClick={() => {
									setSelectedGuest(null);
									setShowForm(true);
								}}
							/>
						</>
					)}
				</div>
			</div>

			<DataTable value={guests} loading={loading} emptyMessage="Tidak ada tamu">
				<Column field="name" header="Nama" sortable filter />
				<Column field="email" header="Email" sortable filter />
				<Column field="phone" header="Telepon" sortable filter />
				<Column field="eventName" header="Event" sortable filter />
				<Column field="rsvpStatus" header="RSVP" sortable filter body={statusBodyTemplate} />
				<Column field="rsvpJumlah" header="Jumlah" sortable filter />
				<Column
					field="checkedIn"
					header="Check-in"
					body={(row: Guest) =>
						row.checkedIn
							? new Date(row.checkedIn).toLocaleString("id-ID")
							: "-"
					}
					sortable
				/>
				{canMutate && (
					<Column body={actionBodyTemplate} header="Aksi" style={{ width: "14rem" }} />
				)}
			</DataTable>

			{showForm && (
				<GuestForm
					guest={selectedGuest}
					onSuccess={handleFormSuccess}
					onHide={() => setShowForm(false)}
				/>
			)}
			{showBulkUpload && (
				<BulkUpload
					onSuccess={handleBulkUploadSuccess}
					onHide={() => setShowBulkUpload(false)}
				/>
			)}
		</div>
	);
};

export default GuestList;
