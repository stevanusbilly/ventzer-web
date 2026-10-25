import React, { useEffect, useState } from "react";
import { Dialog } from "primereact/dialog";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { assignmentService } from "../../services/assignmentService";
import { userService } from "../../services/userService";
import { User, Event } from "../../types";
import { getApiErrorMessage } from "../../utils/apiError";

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

	const handleAssign = async (): Promise<void> => {
		if (!selectedUserId) return;
		try {
			await assignmentService.assignUserToEvent(event.id, selectedUserId);
			setSelectedUserId(null);
			await load();
		} catch (err) {
			setError(getApiErrorMessage(err, "Gagal assign panitia"));
		}
	};

	const handleRemove = async (userId: number): Promise<void> => {
		try {
			await assignmentService.removeUserFromEvent(event.id, userId);
			await load();
		} catch (err) {
			setError(getApiErrorMessage(err, "Gagal menghapus assignment"));
		}
	};

	return (
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
	);
};

export default EventAssignmentDialog;
