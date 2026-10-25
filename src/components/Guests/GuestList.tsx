import React, { useState, useEffect, useRef } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { Tag } from "primereact/tag";
import { InputText } from "primereact/inputtext";
import { guestService } from "../../services/guestService";
import { eventService } from "../../services/eventService";
import { exportService } from "../../services/exportService";
import GuestForm from "./GuestForm";
import BulkUpload from "./BulkUpload";
import { Guest, Event } from "../../types";
import { useAuth } from "../../contexts/AuthContext";
import { buildInvitationUrl } from "../../utils/invitationLink";
import { getApiErrorMessage } from "../../utils/apiError";

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
	const [searchQuery, setSearchQuery] = useState("");
	const [rsvpFilter, setRsvpFilter] = useState("");
	const [loading, setLoading] = useState(true);
	const [showForm, setShowForm] = useState(false);
	const [showBulkUpload, setShowBulkUpload] = useState(false);
	const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
	const { user, canMutate, isAdmin } = useAuth();
	const toast = useRef<Toast>(null);

	useEffect(() => {
		loadEvents();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		loadGuests();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selectedFilterEvent, searchQuery, rsvpFilter]);

	const loadGuests = async (): Promise<void> => {
		setLoading(true);
		try {
			const params = {
				q: searchQuery || undefined,
				rsvpStatus: rsvpFilter || undefined,
			};
			const response = await guestService.getByEvent(selectedFilterEvent, params);
			setGuests(response);
		} catch {
			showError("Gagal memuat tamu");
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
		} catch {
			showError("Gagal memuat event");
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
					await guestService.delete(guest.id);
					showSuccess("Tamu dihapus");
					loadGuests();
				} catch (err) {
					showError(getApiErrorMessage(err, "Gagal menghapus tamu"));
				}
			},
		});
	};

	const handleRegenerateToken = async (guest: Guest): Promise<void> => {
		try {
			await guestService.regenerateToken(guest.id);
			showSuccess("Token QR diperbarui");
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
		} catch {
			showError("Gagal unduh QR");
		}
	};

	const handleCopyLink = async (guest: Guest): Promise<void> => {
		const link = buildInvitationUrl(guest.eventId, guest.qrToken);
		try {
			await navigator.clipboard.writeText(link);
			showSuccess("Link undangan disalin");
		} catch {
			showError(link);
		}
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
			return (
				<Button
					icon="pi pi-link"
					className="p-button-rounded p-button-text"
					onClick={() => handleCopyLink(rowData)}
					tooltip="Salin link undangan"
				/>
			);
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
				{isAdmin && (
					<Button
						icon="pi pi-refresh"
						className="p-button-rounded p-button-info p-button-text"
						onClick={() => handleRegenerateToken(rowData)}
					/>
				)}
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
						onChange={(e: DropdownChangeEvent) => setSelectedFilterEvent(e.value)}
						className="w-14rem"
						filter
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

			<DataTable value={guests} loading={loading} paginator rows={10} emptyMessage="Tidak ada tamu">
				<Column field="name" header="Nama" sortable />
				<Column field="email" header="Email" />
				<Column field="phone" header="Telepon" />
				<Column field="eventName" header="Event" />
				<Column field="rsvpStatus" header="RSVP" body={statusBodyTemplate} />
				<Column field="rsvpJumlah" header="Jumlah" />
				<Column
					field="checkedIn"
					header="Check-in"
					body={(row: Guest) =>
						row.checkedIn
							? new Date(row.checkedIn).toLocaleString("id-ID")
							: "-"
					}
				/>
				<Column body={actionBodyTemplate} header="Aksi" style={{ width: "14rem" }} />
			</DataTable>

			{showForm && (
				<GuestForm
					guest={selectedGuest}
					onSuccess={() => {
						setShowForm(false);
						loadGuests();
					}}
					onHide={() => setShowForm(false)}
				/>
			)}
			{showBulkUpload && (
				<BulkUpload
					onSuccess={() => {
						setShowBulkUpload(false);
						loadGuests();
					}}
					onHide={() => setShowBulkUpload(false)}
				/>
			)}
		</div>
	);
};

export default GuestList;
