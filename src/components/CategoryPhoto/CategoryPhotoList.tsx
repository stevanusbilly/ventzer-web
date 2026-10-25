import React, { useState, useEffect } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { categoryPhotoService } from "../../services/categoryPhotoService";
import { useRef } from "react";
import CategoryPhotoForm from "./CategoryPhotoForm";
import { CategoryPhoto } from "../../types";

const CategoryPhotoList: React.FC = () => {
	const [categoryPhoto, setCategoryPhoto] = useState<CategoryPhoto[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [showForm, setShowForm] = useState<boolean>(false);
	const [selectedCategoryPhoto, setSelectedCategoryPhoto] = useState<CategoryPhoto | null>(null);
	const toast = useRef<Toast>(null);

	useEffect(() => {
		loadCategoryPhoto();
	}, []);

	const loadCategoryPhoto = async (): Promise<void> => {
		try {
			const response = await categoryPhotoService.list();
			setCategoryPhoto(response);
		} catch (error) {
			showError("Failed to load Category Photo");
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
		setSelectedCategoryPhoto(null);
		setShowForm(true);
	};

	const handleEdit = (categoryPhoto: CategoryPhoto): void => {
		setSelectedCategoryPhoto(categoryPhoto);
		setShowForm(true);
	};

	const handleDelete = (categoryPhoto: CategoryPhoto): void => {
		confirmDialog({
			message: "Are you sure you want to delete this Category Photo?",
			header: "Confirm Deletion",
			icon: "pi pi-exclamation-triangle",
			accept: () => deleteCategoryPhoto(categoryPhoto.id),
		});
	};

	const deleteCategoryPhoto = async (id: number): Promise<void> => {
		try {
			await categoryPhotoService.del(id);
			showSuccess("Category Photo deleted successfully");
			loadCategoryPhoto();
		} catch (error) {
			showError("Failed to delete Category Photo");
		}
	};

	const handleFormSubmit = (): void => {
		setShowForm(false);
		loadCategoryPhoto();
	};

	const actionBodyCategoryPhoto = (rowData: CategoryPhoto): React.ReactNode => {
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
				<h2>Category Photo Management</h2>
				<Button label="Create Category Photo" icon="pi pi-plus" onClick={handleInsert} />
			</div>

			<DataTable
				value={categoryPhoto}
				loading={loading}
				paginator
				rows={10}
				rowsPerPageOptions={[5, 10, 25, 50]}
				emptyMessage="No Category Photo found"
			>
				<Column
					field="name"
					header="Name"
					sortable
					filter
					filterPlaceholder="Search by Name"
				/>
				<Column body={actionBodyCategoryPhoto} header="Actions" />
			</DataTable>

			{showForm && (
				<CategoryPhotoForm
					categoryPhoto={selectedCategoryPhoto}
					onSuccess={handleFormSubmit}
					onHide={() => setShowForm(false)}
				/>
			)}
		</div>
	);
};

export default CategoryPhotoList;
