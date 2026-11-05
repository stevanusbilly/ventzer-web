import React, { useEffect, useRef, useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { categoryTemplateService } from "../../services/categoryTemplateService";
import CategoryTemplateForm from "./CategoryTemplateForm";
import { CategoryTemplate } from "../../types";
import { getApiErrorMessage, getApiSuccessMessage } from "../../utils/apiError";

const CategoryTemplateList: React.FC = () => {
	const [items, setItems] = useState<CategoryTemplate[]>([]);
	const [loading, setLoading] = useState(true);
	const [showForm, setShowForm] = useState(false);
	const [selected, setSelected] = useState<CategoryTemplate | null>(null);
	const toast = useRef<Toast>(null);

	useEffect(() => {
		void loadItems();
	}, []);

	const loadItems = async (): Promise<void> => {
		try {
			const response = await categoryTemplateService.list();
			setItems(response);
		} catch (error: unknown) {
			showError(getApiErrorMessage(error, "Gagal memuat kategori template"));
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
			summary: "Success",
			detail: message,
			life: 3000,
		});
	};

	const deleteItem = async (id: number): Promise<void> => {
		try {
			const data = await categoryTemplateService.del(id);
			showSuccess(getApiSuccessMessage(data, "Kategori template dihapus"));
			void loadItems();
		} catch (error: unknown) {
			showError(getApiErrorMessage(error, "Gagal menghapus kategori template"));
		}
	};

	return (
		<div className="card">
			<Toast ref={toast} />
			<ConfirmDialog />
			<div className="flex justify-content-between align-items-center mb-4">
				<h2>Kategori Template</h2>
				<Button
					label="Buat kategori"
					icon="pi pi-plus"
					onClick={() => {
						setSelected(null);
						setShowForm(true);
					}}
				/>
			</div>
			<DataTable
				value={items}
				loading={loading}
				paginator
				rows={10}
				rowsPerPageOptions={[5, 10, 25, 50]}
				emptyMessage="Belum ada kategori template"
			>
				<Column
					field="name"
					header="Kategori"
					sortable
					filter
					filterPlaceholder="Cari kategori"
				/>
				<Column
					header="Aksi"
					body={(row: CategoryTemplate) => (
						<div className="flex gap-1">
							<Button
								icon="pi pi-pencil"
								className="p-button-rounded p-button-success p-button-text"
								onClick={() => {
									setSelected(row);
									setShowForm(true);
								}}
							/>
							<Button
								icon="pi pi-trash"
								className="p-button-rounded p-button-danger p-button-text"
								onClick={() =>
									confirmDialog({
										message: "Hapus kategori template ini?",
										header: "Konfirmasi",
										icon: "pi pi-exclamation-triangle",
										accept: () => void deleteItem(row.id),
									})
								}
							/>
						</div>
					)}
				/>
			</DataTable>
			{showForm && (
				<CategoryTemplateForm
					categoryTemplate={selected}
					onSuccess={(message) => {
						setShowForm(false);
						showSuccess(message);
						void loadItems();
					}}
					onHide={() => setShowForm(false)}
				/>
			)}
		</div>
	);
};

export default CategoryTemplateList;
