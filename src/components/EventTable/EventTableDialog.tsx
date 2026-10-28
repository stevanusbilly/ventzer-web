import React, { useEffect, useRef, useState } from "react";
import { Dialog } from "primereact/dialog";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { confirmDialog } from "primereact/confirmdialog";
import { eventTableService } from "../../services/eventTableService";
import EventTableForm from "./EventTableForm";
import EventTableGuestDialog from "./EventTableGuestDialog";
import { Event, EventTable } from "../../types";
import { useAuth } from "../../contexts/AuthContext";
import { getApiErrorMessage, getApiSuccessMessage } from "../../utils/apiError";

interface EventTableDialogProps {
	event: Event;
	onHide: () => void;
}

const EventTableDialog: React.FC<EventTableDialogProps> = ({ event, onHide }) => {
	const { canMutate } = useAuth();
	const [tables, setTables] = useState<EventTable[]>([]);
	const [loading, setLoading] = useState(false);
	const [showForm, setShowForm] = useState(false);
	const [selectedTable, setSelectedTable] = useState<EventTable | null>(null);
	const [showGuestDialog, setShowGuestDialog] = useState(false);
	const [tableForGuests, setTableForGuests] = useState<EventTable | null>(null);
	const toast = useRef<Toast>(null);

	const loadTables = async (): Promise<void> => {
		setLoading(true);
		try {
			const response = await eventTableService.getByEvent(event.id);
			setTables(response);
		} catch (error: unknown) {
			toast.current?.show({
				severity: "error",
				summary: "Error",
				detail: getApiErrorMessage(error, "Gagal memuat meja"),
				life: 3000,
			});
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		void loadTables();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [event.id]);

	const handleFormSuccess = (message: string): void => {
		setShowForm(false);
		toast.current?.show({
			severity: "success",
			summary: "Berhasil",
			detail: message,
			life: 3000,
		});
		void loadTables();
	};

	const deleteTable = async (id: number): Promise<void> => {
		try {
			const data = await eventTableService.del(id);
			toast.current?.show({
				severity: "success",
				summary: "Berhasil",
				detail: getApiSuccessMessage(data, "Meja dihapus"),
				life: 3000,
			});
			void loadTables();
		} catch (error: unknown) {
			toast.current?.show({
				severity: "error",
				summary: "Error",
				detail: getApiErrorMessage(error, "Gagal menghapus meja"),
				life: 3000,
			});
		}
	};

	const actionBody = (row: EventTable): React.ReactNode => (
		<div className="flex gap-1">
			<Button
				icon="pi pi-users"
				className="p-button-rounded p-button-info p-button-text"
				tooltip="Tamu meja"
				onClick={() => {
					setTableForGuests(row);
					setShowGuestDialog(true);
				}}
			/>
			{canMutate && (
				<>
					<Button
						icon="pi pi-pencil"
						className="p-button-rounded p-button-success p-button-text"
						tooltip="Edit meja"
						onClick={() => {
							setSelectedTable(row);
							setShowForm(true);
						}}
					/>
					<Button
						icon="pi pi-trash"
						className="p-button-rounded p-button-danger p-button-text"
						tooltip="Hapus meja"
						onClick={() =>
							confirmDialog({
								message: "Hapus meja ini?",
								header: "Konfirmasi",
								icon: "pi pi-exclamation-triangle",
								accept: () => deleteTable(row.id),
							})
						}
					/>
				</>
			)}
		</div>
	);

	return (
		<Dialog
			header={`Meja — ${event.name}`}
			visible
			style={{ width: "90vw", maxWidth: "72rem" }}
			onHide={onHide}
			contentStyle={{ overflowY: "auto", maxHeight: "75vh" }}
		>
			<Toast ref={toast} />
			{canMutate && (
				<div className="flex justify-content-end mb-3">
					<Button
						label="Tambah Meja"
						icon="pi pi-plus"
						onClick={() => {
							setSelectedTable(null);
							setShowForm(true);
						}}
					/>
				</div>
			)}
			<DataTable
				value={tables}
				loading={loading}
				emptyMessage="Belum ada meja"
				responsiveLayout="scroll"
			>
				<Column
					field="kategori"
					header="Kategori"
					sortable
					filter
					filterPlaceholder="Cari kategori"
				/>
				<Column
					field="menu"
					header="Menu"
					filter
					filterPlaceholder="Cari menu"
				/>
				<Column
					field="note"
					header="Catatan"
					filter
					filterPlaceholder="Cari catatan"
				/>
				<Column field="jumlahKursi" header="Kursi" sortable />
				<Column field="jumlahGuest" header="Tamu" sortable />
				<Column body={actionBody} header="Aksi" style={{ width: "10rem" }} />
			</DataTable>

			{showForm && (
				<EventTableForm
					event={event}
					eventTable={selectedTable}
					onSuccess={handleFormSuccess}
					onHide={() => setShowForm(false)}
				/>
			)}

			<EventTableGuestDialog
				visible={showGuestDialog}
				eventTable={tableForGuests}
				onHide={() => setShowGuestDialog(false)}
				onSuccess={() => loadTables()}
			/>
		</Dialog>
	);
};

export default EventTableDialog;
