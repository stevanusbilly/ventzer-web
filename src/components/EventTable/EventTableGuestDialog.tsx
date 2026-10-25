import React, { useState, useEffect, useRef } from "react";
import { Dialog } from "primereact/dialog";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";
import { Toast } from "primereact/toast";
import { Tag } from "primereact/tag";
import { Message } from "primereact/message";
import { confirmDialog } from "primereact/confirmdialog";
import { eventTableGuestService } from "../../services/eventTableGuestService";
import { guestService } from "../../services/guestService";
import { EventTable, EventTableGuest, Guest } from "../../types";
import { getApiErrorMessage } from "../../utils/apiError";

interface EventTableGuestDialogProps {
	visible: boolean;
	eventTable: EventTable | null;
	onHide: () => void;
	onSuccess: () => void;
}

const EventTableGuestDialog: React.FC<EventTableGuestDialogProps> = ({
	visible,
	eventTable,
	onHide,
	onSuccess,
}) => {
	const [tableGuests, setTableGuests] = useState<EventTableGuest[]>([]);
	const [availableGuests, setAvailableGuests] = useState<Guest[]>([]);
	const [loading, setLoading] = useState<boolean>(false);
	const [showForm, setShowForm] = useState<boolean>(false);
	const [selectedTableGuest, setSelectedTableGuest] = useState<EventTableGuest | null>(null);

	const [formData, setFormData] = useState<{ guestId: number; jumlah: number }>({
		guestId: 0,
		jumlah: 1,
	});
	const [formSubmitting, setFormSubmitting] = useState<boolean>(false);
	const [formError, setFormError] = useState<string>("");

	const toast = useRef<Toast>(null);

	useEffect(() => {
		if (visible && eventTable) {
			loadData();
		}
	}, [visible, eventTable]);

	const loadData = async (): Promise<void> => {
		if (!eventTable) return;
		setLoading(true);
		try {
			const [guestsRes, eventGuestsRes] = await Promise.all([
				eventTableGuestService.getByTable(eventTable.id),
				guestService.getByEvent(eventTable.eventId),
			]);
			setTableGuests(guestsRes);
			setAvailableGuests(eventGuestsRes);
		} catch (error) {
			showError("Failed to load table guests");
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

	const handleOpenAddForm = (): void => {
		setSelectedTableGuest(null);
		setFormData({
			guestId: 0,
			jumlah: 1,
		});
		setFormError("");
		setShowForm(true);
	};

	const handleOpenEditForm = (item: EventTableGuest): void => {
		setSelectedTableGuest(item);
		setFormData({
			guestId: item.guestId,
			jumlah: item.jumlah,
		});
		setFormError("");
		setShowForm(true);
	};

	const handleDelete = (item: EventTableGuest): void => {
		confirmDialog({
			message: `Are you sure you want to remove ${item.guestName || "this guest"} from this table?`,
			header: "Confirm Deletion",
			icon: "pi pi-exclamation-triangle",
			accept: async () => {
				try {
					await eventTableGuestService.del(item.id);
					showSuccess("Guest removed from table successfully");
					loadData();
					onSuccess();
				} catch (error) {
					showError("Failed to delete table guest");
				}
			},
		});
	};

	const handleFormSubmit = async (e: React.FormEvent): Promise<void> => {
		e.preventDefault();
		if (!eventTable) return;

		if (!formData.guestId || formData.guestId <= 0) {
			setFormError("Please select a guest");
			return;
		}

		if (!formData.jumlah || formData.jumlah <= 0) {
			setFormError("Jumlah must be at least 1");
			return;
		}

		setFormSubmitting(true);
		setFormError("");

		try {
			if (selectedTableGuest) {
				await eventTableGuestService.upd(selectedTableGuest.id, {
					eventId: eventTable.eventId,
					tableId: eventTable.id,
					guestId: formData.guestId,
					jumlah: Number(formData.jumlah),
				});
				showSuccess("Table guest updated successfully");
			} else {
				await eventTableGuestService.ins({
					eventId: eventTable.eventId,
					tableId: eventTable.id,
					guestId: formData.guestId,
					jumlah: Number(formData.jumlah),
					eventName: eventTable.eventName,
					tableName: eventTable.kategori,
					guestName: "",
				});
				showSuccess("Guest assigned to table successfully");
			}
			setShowForm(false);
			loadData();
			onSuccess();
		} catch (error: unknown) {
			setFormError(getApiErrorMessage(error, "Gagal menyimpan tamu meja"));
		} finally {
			setFormSubmitting(false);
		}
	};

	const totalJumlahGuests = tableGuests.reduce(
		(sum, item) => sum + Number(item.jumlah || 0),
		0
	);
	const jumlahKursi = eventTable?.jumlahKursi || 0;
	const sisaKursi = jumlahKursi - totalJumlahGuests;

	const actionBodyTemplate = (rowData: EventTableGuest): React.ReactNode => {
		return (
			<div className="flex gap-1">
				<Button
					icon="pi pi-pencil"
					className="p-button-rounded p-button-success p-button-text"
					onClick={() => handleOpenEditForm(rowData)}
					tooltip="Edit"
				/>
				<Button
					icon="pi pi-trash"
					className="p-button-rounded p-button-danger p-button-text"
					onClick={() => handleDelete(rowData)}
					tooltip="Delete"
				/>
			</div>
		);
	};

	return (
		<Dialog
			header={`Detail Guests - Table: ${eventTable?.kategori || ""} (${eventTable?.eventName || ""})`}
			visible={visible}
			style={{ width: "65vw" }}
			onHide={onHide}
		>
			<Toast ref={toast} />

			<div className="surface-card p-3 border-round border-1 surface-border mb-3">
				<div className="flex flex-wrap justify-content-between align-items-center gap-3">
					<div className="flex align-items-center gap-4">
						<div>
							<span className="text-500 font-medium block text-xs uppercase">Kapasitas Kursi</span>
							<span className="text-xl font-bold text-900">{jumlahKursi}</span>
						</div>
						<div>
							<span className="text-500 font-medium block text-xs uppercase">Total Guest Terisi</span>
							<span className="text-xl font-bold text-primary">{totalJumlahGuests}</span>
						</div>
						<div>
							<span className="text-500 font-medium block text-xs uppercase">Sisa Kursi</span>
							<Tag
								value={sisaKursi >= 0 ? `${sisaKursi} Kursi` : `Lebih ${Math.abs(sisaKursi)} Kursi`}
								severity={sisaKursi > 0 ? "success" : sisaKursi === 0 ? "warning" : "danger"}
								className="text-sm font-semibold"
							/>
						</div>
					</div>
					<Button
						label="Add Guest to Table"
						icon="pi pi-plus"
						className="p-button-primary p-button-sm"
						onClick={handleOpenAddForm}
					/>
				</div>
			</div>

			<DataTable
				value={tableGuests}
				loading={loading}
				paginator
				rows={5}
				rowsPerPageOptions={[5, 10, 20]}
				emptyMessage="No guests assigned to this table yet"
				responsiveLayout="scroll"
			>
				<Column
					header="No"
					body={(_rowData, { rowIndex }) => rowIndex + 1}
					style={{ width: "4rem" }}
				/>
				<Column field="guestName" header="Guest Name" sortable />
				<Column field="jumlah" header="Jumlah" sortable style={{ width: "8rem" }} />
				<Column body={actionBodyTemplate} header="Actions" style={{ width: "8rem" }} />
			</DataTable>

			{/* Sub-Dialog: Add / Edit Table Guest */}
			<Dialog
				header={selectedTableGuest ? "Edit Table Guest" : "Add Guest to Table"}
				visible={showForm}
				style={{ width: "35vw" }}
				onHide={() => setShowForm(false)}
			>
				<form onSubmit={handleFormSubmit} className="p-fluid">
					{formError && (
						<Message
							severity="error"
							text={formError}
							className="w-full mb-3"
							style={{ whiteSpace: "break-spaces" }}
						/>
					)}

					<div className="field">
						<label htmlFor="guestId" className="font-semibold">
							Guest
						</label>
						<Dropdown
							id="guestId"
							value={formData.guestId}
							options={availableGuests.map((g) => ({
								label: `${g.name} (${g.rsvpStatus || "pending"})`,
								value: g.id,
							}))}
							onChange={(e: DropdownChangeEvent) =>
								setFormData((prev) => ({ ...prev, guestId: e.value }))
							}
							placeholder="Select a guest"
							filter
							required
						/>
					</div>

					<div className="field">
						<label htmlFor="jumlah" className="font-semibold">
							Jumlah
						</label>
						<InputText
							id="jumlah"
							keyfilter="int"
							value={String(formData.jumlah)}
							onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
								setFormData((prev) => ({
									...prev,
									jumlah: parseInt(e.target.value) || 0,
								}))
							}
							required
						/>
					</div>

					<div className="flex justify-content-end gap-2 mt-4">
						<Button
							type="button"
							label="Cancel"
							icon="pi pi-times"
							className="p-button-text"
							onClick={() => setShowForm(false)}
						/>
						<Button
							type="submit"
							label={selectedTableGuest ? "Update" : "Save"}
							icon="pi pi-check"
							loading={formSubmitting}
						/>
					</div>
				</form>
			</Dialog>
		</Dialog>
	);
};

export default EventTableGuestDialog;
