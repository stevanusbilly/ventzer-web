import React, { useState } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Message } from "primereact/message";
import { categoryPhotoService } from "../../services/categoryPhotoService";
import { CategoryPhoto } from "../../types";
import { getApiErrorMessage, getApiSuccessMessage } from "../../utils/apiError";

interface CategoryPhotoFormProps {
	categoryPhoto: CategoryPhoto | null;
	onSuccess: (message: string) => void;
	onHide: () => void;
}

const TemplateForm: React.FC<CategoryPhotoFormProps> = ({ categoryPhoto, onSuccess, onHide }) => {
	const [formData, setFormData] = useState<Omit<CategoryPhoto, "id">>({
		name: categoryPhoto?.name || "",
	});
	const [loading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState<string>("");

	const handleSubmit = async (e: React.FormEvent): Promise<void> => {
		e.preventDefault();
		setLoading(true);
		setError("");

		try {
			const result = categoryPhoto
				? await categoryPhotoService.upd(categoryPhoto.id, formData)
				: await categoryPhotoService.ins(formData);
			onSuccess(
				getApiSuccessMessage(
					result,
					categoryPhoto ? "Kategori foto diperbarui" : "Kategori foto ditambahkan",
				),
			);
		} catch (error: unknown) {
			setError(getApiErrorMessage(error, "Gagal menyimpan kategori foto"));
		} finally {
			setLoading(false);
		}
	};

	const handleChange = (
		field: keyof Omit<CategoryPhoto, "id">,
		value: string | Date
	): void => {
		setFormData((prev) => ({ ...prev, [field]: value }));
	};

	return (
		<Dialog
			header={categoryPhoto ? "Edit Category Photo" : "Create Category Photo"}
			visible={true}
			style={{ width: "50vw" }}
			onHide={onHide}
		>
			<form onSubmit={handleSubmit} className="p-fluid">
				{error && (
					<Message severity="error" text={error} className="w-full mb-3" style={{whiteSpace: "break-spaces"}} />
				)}
				<div className="field">
					<label htmlFor="name">Category Photo Name</label>
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
					label={categoryPhoto ? "Update Category Photo" : "Create Category Photo"}
					loading={loading}
					className="mt-2"
				/>
			</form>
		</Dialog>
	);
};

export default TemplateForm;
