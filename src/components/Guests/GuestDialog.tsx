import React, { useEffect, useRef, useState } from "react";
import { Dialog } from "primereact/dialog";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { Tag } from "primereact/tag";
import { confirmDialog } from "primereact/confirmdialog";
import { guestService } from "../../services/guestService";
import { exportService } from "../../services/exportService";
import GuestForm from "./GuestForm";
import BulkUpload from "./BulkUpload";
import { Event, Guest } from "../../types";
import { useAuth } from "../../contexts/AuthContext";
import { buildInvitationUrl } from "../../utils/invitationLink";
import { copyText } from "../../utils/copyText";
import { getApiErrorMessage, getApiSuccessMessage } from "../../utils/apiError";

interface GuestDialogProps {
	event: Event;
	onHide: () => void;
}

const GuestDialog: React.FC<GuestDialogProps> = ({ event, onHide }) => {
	const [guests, setGuests] = useState<Guest[]>([]);
	const [loading, setLoading] = useState(true);
	const [showForm, setShowForm] = useState(false);
	const [showBulkUpload, setShowBulkUpload] = useState(false);
	const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
	const { canMutate } = useAuth();
	const toast = useRef<Toast>(null);

	useEffect(() => {
		void loadGuests();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [event.id]);

	const loadGuests = async (): Promise<void> => {
		setLoading(true);
		try {
			const response = await guestService.getByEvent(event.id);
			setGuests(response);
		} catch (error: unknown) {
			showError(getApiErrorMessage(error, "Gagal memuat tamu"));
		} finally {
			setLoading(false);
		}
	};

	const showError = (message: string): void => {
		toast.current?.show({
			severity: "error",
			summary: "Error",
			detail: message,
			life: 3000,
		});
	};

	const showSuccess = (message: string): void => {
		toast.current?.show({
			severity: "success",
			summary: "Berhasil",
			detail: message,
			life: 3000,
		});
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
					void loadGuests();
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
			void loadGuests();
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
		const link = buildInvitationUrl(guest.qrToken);
		const copied = await copyText(link);
		if (copied) {
			showSuccess("Link undangan disalin");
			return;
		}
		toast.current?.show({
			severity: "warn",
			summary: "Salin manual",
			detail: link,
			life: 8000,
		});
	};

	const handleFormSuccess = (message: string): void => {
		setShowForm(false);
		showSuccess(message);
		void loadGuests();
	};

	const handleBulkUploadSuccess = (): void => {
		setShowBulkUpload(false);
		void loadGuests();
	};

	const handleExport = async (): Promise<void> => {
		try {
			const blob = await exportService.exportGuestsToExcel(event.id);
			const url = window.URL.createObjectURL(blob);
			const link = document.createElement("a");
			link.href = url;
			link.download = `guests-event-${event.id}.xlsx`;
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
		<Dialog
			header={`Tamu — ${event.name}`}
			visible
			style={{ width: "90vw", maxWidth: "72rem" }}
			onHide={onHide}
			contentStyle={{ overflowY: "auto", maxHeight: "75vh" }}
		>
			<Toast ref={toast} />
			{canMutate && (
				<div className="flex justify-content-end gap-2 mb-3 flex-wrap">
					<Button
						label="Export Excel"
						icon="pi pi-file-excel"
						className="p-button-outlined p-button-success"
						onClick={() => void handleExport()}
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
				</div>
			)}
			<DataTable
				value={guests}
				loading={loading}
				emptyMessage="Belum ada tamu"
				responsiveLayout="scroll"
			>
				<Column field="name" header="Nama" sortable filter />
				<Column field="email" header="Email" sortable filter />
				<Column field="phone" header="Telepon" sortable filter />
				<Column
					field="rsvpStatus"
					header="RSVP"
					sortable
					filter
					body={statusBodyTemplate}
				/>
				<Column field="max_guest" header="Max guest" sortable filter />
				<Column field="rsvpJumlah" header="Jumlah RSVP" sortable filter />
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
					eventId={event.id}
					onSuccess={handleFormSuccess}
					onHide={() => setShowForm(false)}
				/>
			)}
			{showBulkUpload && (
				<BulkUpload
					eventId={event.id}
					onSuccess={handleBulkUploadSuccess}
					onHide={() => setShowBulkUpload(false)}
				/>
			)}
		</Dialog>
	);
};

export default GuestDialog;
