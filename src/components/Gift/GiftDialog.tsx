import React, { useEffect, useRef, useState } from "react";
import { Dialog } from "primereact/dialog";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { confirmDialog } from "primereact/confirmdialog";
import { giftService } from "../../services/giftService";
import GiftForm from "./GiftForm";
import { Event, Gift } from "../../types";
import { useAuth } from "../../contexts/AuthContext";
import { getApiErrorMessage, getApiSuccessMessage } from "../../utils/apiError";

interface GiftDialogProps {
	event: Event;
	onHide: () => void;
}

const GiftDialog: React.FC<GiftDialogProps> = ({ event, onHide }) => {
	const [gifts, setGifts] = useState<Gift[]>([]);
	const [loading, setLoading] = useState(true);
	const [showForm, setShowForm] = useState(false);
	const [selectedGift, setSelectedGift] = useState<Gift | null>(null);
	const { canMutate } = useAuth();
	const toast = useRef<Toast>(null);

	useEffect(() => {
		void loadGifts();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [event.id]);

	const loadGifts = async (): Promise<void> => {
		setLoading(true);
		try {
			const response = await giftService.getByEvent(event.id);
			setGifts(response);
		} catch (error: unknown) {
			showError(getApiErrorMessage(error, "Gagal memuat amplop digital"));
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

	const handleDelete = (gift: Gift): void => {
		confirmDialog({
			message: "Hapus rekening amplop digital ini?",
			header: "Konfirmasi",
			icon: "pi pi-exclamation-triangle",
			accept: async () => {
				try {
					const data = await giftService.del(gift.id);
					showSuccess(getApiSuccessMessage(data, "Amplop digital dihapus"));
					void loadGifts();
				} catch (error: unknown) {
					showError(getApiErrorMessage(error, "Gagal menghapus amplop digital"));
				}
			},
		});
	};

	const handleFormSuccess = (message: string): void => {
		setShowForm(false);
		showSuccess(message);
		void loadGifts();
	};

	const actionBodyTemplate = (rowData: Gift): React.ReactNode => {
		if (!canMutate) {
			return null;
		}
		return (
			<div className="flex gap-1">
				<Button
					icon="pi pi-pencil"
					className="p-button-rounded p-button-success p-button-text"
					tooltip="Ubah"
					onClick={() => {
						setSelectedGift(rowData);
						setShowForm(true);
					}}
				/>
				<Button
					icon="pi pi-trash"
					className="p-button-rounded p-button-danger p-button-text"
					tooltip="Hapus"
					onClick={() => handleDelete(rowData)}
				/>
			</div>
		);
	};

	return (
		<Dialog
			header={`Amplop digital — ${event.name}`}
			visible
			style={{ width: "90vw", maxWidth: "56rem" }}
			onHide={onHide}
			contentStyle={{ overflowY: "auto", maxHeight: "75vh" }}
		>
			<Toast ref={toast} />
			{canMutate && (
				<div className="flex justify-content-end mb-3">
					<Button
						label="Tambah rekening"
						icon="pi pi-plus"
						onClick={() => {
							setSelectedGift(null);
							setShowForm(true);
						}}
					/>
				</div>
			)}
			<DataTable
				value={gifts}
				loading={loading}
				emptyMessage="Belum ada rekening amplop digital"
				responsiveLayout="scroll"
			>
				<Column field="name" header="Nama" sortable filter />
				<Column field="provider" header="Bank / e-wallet" sortable filter />
				<Column field="nomor" header="Nomor" sortable filter />
				{canMutate && (
					<Column body={actionBodyTemplate} header="Aksi" style={{ width: "8rem" }} />
				)}
			</DataTable>
			{showForm && (
				<GiftForm
					gift={selectedGift}
					eventId={event.id}
					eventName={event.name}
					onSuccess={handleFormSuccess}
					onHide={() => setShowForm(false)}
				/>
			)}
		</Dialog>
	);
};

export default GiftDialog;
