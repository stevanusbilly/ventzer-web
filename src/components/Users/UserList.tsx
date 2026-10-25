import React, { useState, useEffect } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { userService } from "../../services/userService";
import { useRef } from "react";
import UserForm from "./UserForm";
import { User } from "../../types";

const UserList: React.FC = () => {
	const [users, setUsers] = useState<User[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [showForm, setShowForm] = useState<boolean>(false);
	const [selectedUser, setSelectedUser] = useState<User | null>(null);
	const toast = useRef<Toast>(null);

	useEffect(() => {
		loadUsers();
	}, []);

	const loadUsers = async (): Promise<void> => {
		try {
			const response = await userService.list();
			setUsers(response);
		} catch (error) {
			showError("Failed to load users");
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
		setSelectedUser(null);
		setShowForm(true);
	};

	const handleEdit = (user: User): void => {
		setSelectedUser(user);
		setShowForm(true);
	};

	const handleDelete = (user: User): void => {
		confirmDialog({
			message: "Are you sure you want to delete this user?",
			header: "Confirm Deletion",
			icon: "pi pi-exclamation-triangle",
			accept: () => deleteUser(user.id),
		});
	};

	const deleteUser = async (id: number): Promise<void> => {
		try {
			await userService.del(id);
			showSuccess("User deleted successfully");
			loadUsers();
		} catch (error) {
			showError("Failed to delete user");
		}
	};

	const handleFormSubmit = (): void => {
		setShowForm(false);
		loadUsers();
	};

	const actionBodyUser = (rowData: User): React.ReactNode => {
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
				<h2>Users Management</h2>
				<Button label="Create User" icon="pi pi-plus" onClick={handleInsert} />
			</div>

			<DataTable
				value={users}
				loading={loading}
				paginator
				rows={10}
				rowsPerPageOptions={[5, 10, 25, 50]}
				emptyMessage="No users found"
			>
				<Column
					field="username"
					header="Username"
					sortable
					filter
					filterPlaceholder="Search by Username"
				/>
				<Column
					field="name"
					header="Name"
					sortable
					filter
					filterPlaceholder="Search by Name"
				/>
				<Column
					field="email"
					header="Email"
					sortable
					filter
					filterPlaceholder="Search by Email"
				/>
				<Column
					field="role"
					header="Role"
					sortable
					filter
					filterPlaceholder="Search by Role"
				/>
				<Column body={actionBodyUser} header="Actions" />
			</DataTable>

			{showForm && (
				<UserForm
					user={selectedUser}
					onSuccess={handleFormSubmit}
					onHide={() => setShowForm(false)}
				/>
			)}
		</div>
	);
};

export default UserList;
