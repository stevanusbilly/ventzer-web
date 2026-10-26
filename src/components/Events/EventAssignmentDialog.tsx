import React, { useEffect, useRef, useState } from "react";
import { Dialog } from "primereact/dialog";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Toast } from "primereact/toast";
import { assignmentService } from "../../services/assignmentService";
import { userService } from "../../services/userService";
import { User, Event } from "../../types";
import { getApiErrorMessage, getApiSuccessMessage } from "../../utils/apiError";

interface EventAssignmentDialogProps {
	event: Event;
	visible: boolean;
	onHide: () => void;
}

const EventAssignmentDialog: React.FC<EventAssignmentDialogProps> = ({
	event,
	visible,
	onHide,
}) => {
	const [users, setUsers] = useState<User[]>([]);
	const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
	const [assignments, setAssignments] = useState<any[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const toast = useRef<Toast>(null);

	const load = async (): Promise<void> => {
		setLoading(true);
		setError("");
		try {
			const [userList, assignmentData] = await Promise.all([
				userService.list(),
				assignmentService.getEventAssignments(event.id),
			]);
			setUsers(userList);
			setAssignments(assignmentData.assignments || []);
		} catch (err) {
			setError(getApiErrorMessage(err, "Gagal memuat assignment"));
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		if (visible) {
			load();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [visible, event.id]);

	const showSuccess = (message: string): void => {
		toast.current?.show({
			severity: "success",
			summary: "Berhasil",
			detail: message,
			life: 3000,
		});
	};

	const handleAssign = async (): Promise<void> => {
		if (!selectedUserId) return;
		try {
			setError("");
			const data = await assignmentService.assignUserToEvent(
				event.id,
				selectedUserId,
			);
			showSuccess(getApiSuccessMessage(data, "Panitia berhasil ditugaskan"));
			setSelectedUserId(null);
			await load();
		} catch (err) {
			setError(getApiErrorMessage(err, "Gagal assign panitia"));
		}
	};

	const handleRemove = async (userId: number): Promise<void> => {
		try {
			setError("");
			const data = await assignmentService.removeUserFromEvent(
				event.id,
				userId,
			);
			showSuccess(getApiSuccessMessage(data, "Panitia dihapus dari event"));
			await load();
		} catch (err) {
			setError(getApiErrorMessage(err, "Gagal menghapus assignment"));
		}
	};

	return (
		<>
			<Toast ref={toast} />
		<Dialog
			header={`Panitia — ${event.name}`}
			visible={visible}
			style={{ width: "40rem" }}
			onHide={onHide}
		>
			{error && <p className="text-red-500">{error}</p>}
			<div className="flex gap-2 align-items-end mb-4">
				<div className="flex-1">
					<label className="block mb-2">Tambah panitia</label>
					<Dropdown
						value={selectedUserId}
						options={users.map((u) => ({
							label: `${u.name} (${u.role})`,
							value: u.id,
						}))}
						onChange={(e: DropdownChangeEvent) => setSelectedUserId(e.value)}
						placeholder="Pilih user"
						className="w-full"
						filter
					/>
				</div>
				<Button label="Assign" icon="pi pi-user-plus" onClick={handleAssign} />
			</div>
			<DataTable value={assignments} loading={loading} emptyMessage="Belum ada panitia">
				<Column field="name" header="Nama" />
				<Column field="email" header="Email" />
				<Column field="role" header="Role" />
				<Column
					header=""
					body={(row) => (
						<Button
							icon="pi pi-trash"
							className="p-button-text p-button-danger"
							onClick={() => handleRemove(row.userId)}
						/>
					)}
				/>
			</DataTable>
		</Dialog>
		</>
	);
};

export default EventAssignmentDialog;
