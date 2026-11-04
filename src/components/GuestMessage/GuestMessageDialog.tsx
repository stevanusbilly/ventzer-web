import React, { useEffect, useRef, useState } from "react";
import { Dialog } from "primereact/dialog";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { Tag } from "primereact/tag";
import { confirmDialog } from "primereact/confirmdialog";
import { guestMessageService } from "../../services/guestMessageService";
import { Event, GuestMessage } from "../../types";
import { useAuth } from "../../contexts/AuthContext";
import { getApiErrorMessage, getApiSuccessMessage } from "../../utils/apiError";

interface GuestMessageDialogProps {
	event: Event;
	onHide: () => void;
}

const GuestMessageDialog: React.FC<GuestMessageDialogProps> = ({ event, onHide }) => {
	const [messages, setMessages] = useState<GuestMessage[]>([]);
	const [loading, setLoading] = useState(true);
	const { canMutate } = useAuth();
	const toast = useRef<Toast>(null);

	useEffect(() => {
		void loadMessages();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [event.id]);

	const loadMessages = async (): Promise<void> => {
		setLoading(true);
		try {
			const response = await guestMessageService.getByEvent(event.id);
			setMessages(response);
		} catch (error: unknown) {
			showError(getApiErrorMessage(error, "Gagal memuat ucapan"));
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

	const handleDelete = (row: GuestMessage): void => {
		confirmDialog({
			message: "Hapus ucapan ini?",
			header: "Konfirmasi",
			icon: "pi pi-exclamation-triangle",
			accept: async () => {
				try {
					const data = await guestMessageService.del(row.id);
					showSuccess(getApiSuccessMessage(data, "Ucapan dihapus"));
					void loadMessages();
				} catch (error: unknown) {
					showError(getApiErrorMessage(error, "Gagal menghapus ucapan"));
				}
			},
		});
	};

	const togglePublished = async (row: GuestMessage): Promise<void> => {
		try {
			const next = Number(row.published) === 1 ? 0 : 1;
			const data = await guestMessageService.setPublished(row.id, next);
			showSuccess(
				getApiSuccessMessage(
					data,
					next === 1 ? "Ucapan ditampilkan" : "Ucapan disembunyikan",
				),
			);
			void loadMessages();
		} catch (error: unknown) {
			showError(getApiErrorMessage(error, "Gagal mengubah status ucapan"));
		}
	};

	const actionBodyTemplate = (row: GuestMessage): React.ReactNode => {
		if (!canMutate) {
			return null;
		}
		return (
			<div className="flex gap-1">
				<Button
					icon={Number(row.published) === 1 ? "pi pi-eye-slash" : "pi pi-eye"}
					className="p-button-rounded p-button-info p-button-text"
					tooltip={Number(row.published) === 1 ? "Sembunyikan" : "Tampilkan"}
					onClick={() => void togglePublished(row)}
				/>
				<Button
					icon="pi pi-trash"
					className="p-button-rounded p-button-danger p-button-text"
					tooltip="Hapus"
					onClick={() => handleDelete(row)}
				/>
			</div>
		);
	};

	return (
		<Dialog
			header={`Ucapan tamu — ${event.name}`}
			visible
			style={{ width: "90vw", maxWidth: "64rem" }}
			onHide={onHide}
			contentStyle={{ overflowY: "auto", maxHeight: "75vh" }}
		>
			<Toast ref={toast} />
			<DataTable
				value={messages}
				loading={loading}
				emptyMessage="Belum ada ucapan"
				responsiveLayout="scroll"
			>
				<Column field="guestName" header="Tamu" sortable filter />
				<Column field="message" header="Ucapan" sortable filter />
				<Column
					header="Status"
					body={(row: GuestMessage) => (
						<Tag
							value={Number(row.published) === 1 ? "Ditampilkan" : "Disembunyikan"}
							severity={Number(row.published) === 1 ? "success" : "warning"}
						/>
					)}
				/>
				<Column
					field="createdAt"
					header="Waktu"
					body={(row: GuestMessage) =>
						row.createdAt ? new Date(row.createdAt).toLocaleString("id-ID") : "-"
					}
					sortable
				/>
				{canMutate && (
					<Column body={actionBodyTemplate} header="Aksi" style={{ width: "8rem" }} />
				)}
			</DataTable>
		</Dialog>
	);
};

export default GuestMessageDialog;
