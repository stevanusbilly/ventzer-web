import React, { useState } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Message } from "primereact/message";
import { templateService } from "../../services/templateService";
import { Template } from "../../types";
import { getApiErrorMessage } from "../../utils/apiError";

interface TemplateFormProps {
	template: Template | null;
	onSuccess: () => void;
	onHide: () => void;
}

const TemplateForm: React.FC<TemplateFormProps> = ({ template, onSuccess, onHide }) => {
	const [formData, setFormData] = useState<Omit<Template, "id">>({
		name: template?.name || "",
	});
	const [loading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState<string>("");

	const handleSubmit = async (e: React.FormEvent): Promise<void> => {
		e.preventDefault();
		setLoading(true);
		setError("");

		try {
			if (template) {
				await templateService.upd(template.id, formData);
			} else {
				await templateService.ins(formData);
			}
			onSuccess();
		} catch (error: unknown) {
			setError(getApiErrorMessage(error, "Gagal menyimpan template"));
		} finally {
			setLoading(false);
		}
	};

	const handleChange = (
		field: keyof Omit<Template, "id">,
		value: string | Date
	): void => {
		setFormData((prev) => ({ ...prev, [field]: value }));
	};

	return (
		<Dialog
			header={template ? "Edit Template" : "Create Template"}
			visible={true}
			style={{ width: "50vw" }}
			onHide={onHide}
		>
			<form onSubmit={handleSubmit} className="p-fluid">
				{error && (
					<Message severity="error" text={error} className="w-full mb-3" style={{whiteSpace: "break-spaces"}} />
				)}
				<div className="field">
					<label htmlFor="name">Template Name</label>
					<InputText
						id="name"
						value={formData.name}
						onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
							handleChange("name", e.target.value)
						}
						required
					/>
				</div>

				<Button
					type="submit"
					label={template ? "Update Template" : "Create Template"}
					loading={loading}
					className="mt-2"
				/>
			</form>
		</Dialog>
	);
};

export default TemplateForm;
