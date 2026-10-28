import React, { useState, useEffect } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { giftService } from "../../services/giftService";
import { eventService } from "../../services/eventService";
import { useRef } from "react";
import GiftForm from "./GiftForm";
import { Event, Gift } from "../../types";
import { useAuth } from "../../contexts/AuthContext";
import { getApiErrorMessage, getApiSuccessMessage } from "../../utils/apiError";

const GiftList: React.FC = () => {
	const [gift, setGift] = useState<Gift[]>([]);
	const [events, setEvents] = useState<Event[]>([]);
	const [selectedFilterEvent, setSelectedFilterEvent] = useState<number>(0);
	const [loading, setLoading] = useState<boolean>(true);
	const [showForm, setShowForm] = useState<boolean>(false);
	const [selectedGift, setSelectedGift] = useState<Gift | null>(null);
	const { user, canMutate } = useAuth();
	const toast = useRef<Toast>(null);

	useEffect(() => {
		loadEvents();
	}, []);

	useEffect(() => {
		loadGift();
	}, [selectedFilterEvent])

	const loadGift = async (): Promise<void> => {
		try {
			const response = await giftService.getByEvent(selectedFilterEvent);
			setGift(response);
		} catch (error: unknown) {
			showError(getApiErrorMessage(error, "Gagal memuat hadiah"));
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

	const handleInsert = (): void => {
		setSelectedGift(null);
		setShowForm(true);
	};

	const handleEdit = (gift: Gift): void => {
		setSelectedGift(gift);
		setShowForm(true);
	};

	const handleDelete = (gift: Gift): void => {
		confirmDialog({
			message: "Are you sure you want to delete this gift?",
			header: "Confirm Deletion",
			icon: "pi pi-exclamation-triangle",
			accept: () => deleteGift(gift.id),
		});
	};

	const handleFormSuccess = (message: string): void => {
		setShowForm(false);
		showSuccess(message);
		loadGift();
	};

	const deleteGift = async (id: number): Promise<void> => {
		try {
			const data = await giftService.del(id);
			showSuccess(getApiSuccessMessage(data, "Hadiah dihapus"));
			loadGift();
		} catch (error: unknown) {
			showError(getApiErrorMessage(error, "Gagal menghapus hadiah"));
		}
	};

	const actionBodyGift = (rowData: Gift): React.ReactNode => {
		if (!canMutate) {
			return null;
		}
		return (
			<div className="flex gap-1">
				<Button
					icon="pi pi-pencil"
					className="p-button-rounded p-button-success p-button-text"
					onClick={() => handleEdit(rowData)}
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

			<div className="flex justify-content-between align-items-center mb-4">
				<h2>Gift Management</h2>
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
					{canMutate && (
						<Button label="Create Gift" icon="pi pi-plus" onClick={handleInsert} />
					)}
				</div>
			</div>

			<DataTable
				value={gift}
				loading={loading}
				paginator
				rows={10}
				rowsPerPageOptions={[5, 10, 25, 50]}
				emptyMessage="No gift found"
			>
				<Column
					field="eventName"
					header="Event"
					sortable
					filter
					filterPlaceholder="Search by Event"
				/>
				<Column
					field="name"
					header="Name"
					sortable
					filter
					filterPlaceholder="Search by Name"
				/>
				<Column
					field="nomor"
					header="Nomor"
					sortable
					filter
					filterPlaceholder="Search by Nomor"
				/>
				<Column
					field="provider"
					header="Provider"
					sortable
					filter
					filterPlaceholder="Search by Provider"
				/>
				{canMutate && <Column body={actionBodyGift} header="Actions" />}
			</DataTable>

			{showForm && (
				<GiftForm
					gift={selectedGift}
					onSuccess={handleFormSuccess}
					onHide={() => setShowForm(false)}
				/>
			)}
		</div>
	);
};

export default GiftList;
