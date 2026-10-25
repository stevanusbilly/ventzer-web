import React, { useState, useEffect } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { templateService } from "../../services/templateService";
import { useRef } from "react";
import TemplateForm from "./TemplateForm";
import { Template } from "../../types";

const TemplateList: React.FC = () => {
	const [templates, setTemplates] = useState<Template[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [showForm, setShowForm] = useState<boolean>(false);
	const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
	const toast = useRef<Toast>(null);

	useEffect(() => {
		loadTemplates();
	}, []);

	const loadTemplates = async (): Promise<void> => {
		try {
			const response = await templateService.list();
			setTemplates(response);
		} catch (error) {
			showError("Failed to load templates");
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
		setSelectedTemplate(null);
		setShowForm(true);
	};

	const handleEdit = (template: Template): void => {
		setSelectedTemplate(template);
		setShowForm(true);
	};

	const handleDelete = (template: Template): void => {
		confirmDialog({
			message: "Are you sure you want to delete this template?",
			header: "Confirm Deletion",
			icon: "pi pi-exclamation-triangle",
			accept: () => deleteTemplate(template.id),
		});
	};

	const deleteTemplate = async (id: number): Promise<void> => {
		try {
			await templateService.del(id);
			showSuccess("Template deleted successfully");
			loadTemplates();
		} catch (error) {
			showError("Failed to delete template");
		}
	};

	const handleFormSubmit = (): void => {
		setShowForm(false);
		loadTemplates();
	};

	const actionBodyTemplate = (rowData: Template): React.ReactNode => {
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
				<h2>Templates Management</h2>
				<Button label="Create Template" icon="pi pi-plus" onClick={handleInsert} />
			</div>

			<DataTable
				value={templates}
				loading={loading}
				paginator
				rows={10}
				rowsPerPageOptions={[5, 10, 25, 50]}
				emptyMessage="No templates found"
			>
				<Column
					field="name"
					header="Name"
					sortable
					filter
					filterPlaceholder="Search by Name"
				/>
				<Column body={actionBodyTemplate} header="Actions" />
			</DataTable>

			{showForm && (
				<TemplateForm
					template={selectedTemplate}
					onSuccess={handleFormSubmit}
					onHide={() => setShowForm(false)}
				/>
			)}
		</div>
	);
};

export default TemplateList;
