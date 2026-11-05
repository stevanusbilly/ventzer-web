import React, { useState } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Message } from "primereact/message";
import { categoryTemplateService } from "../../services/categoryTemplateService";
import { CategoryTemplate } from "../../types";
import { getApiErrorMessage, getApiSuccessMessage } from "../../utils/apiError";

interface CategoryTemplateFormProps {
	categoryTemplate: CategoryTemplate | null;
	onSuccess: (message: string) => void;
	onHide: () => void;
}

const CategoryTemplateForm: React.FC<CategoryTemplateFormProps> = ({
	categoryTemplate,
	onSuccess,
	onHide,
}) => {
	const [formData, setFormData] = useState<Omit<CategoryTemplate, "id">>({
		name: categoryTemplate?.name || "",
	});
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	const handleSubmit = async (e: React.FormEvent): Promise<void> => {
		e.preventDefault();
		setLoading(true);
		setError("");
		try {
			const result = categoryTemplate
				? await categoryTemplateService.upd(categoryTemplate.id, formData)
				: await categoryTemplateService.ins(formData);
			onSuccess(
				getApiSuccessMessage(
					result,
					categoryTemplate
						? "Kategori template diperbarui"
						: "Kategori template ditambahkan",
				),
			);
		} catch (err: unknown) {
			setError(getApiErrorMessage(err, "Gagal menyimpan kategori template"));
		} finally {
			setLoading(false);
		}
	};

	return (
		<Dialog
			header={categoryTemplate ? "Ubah kategori template" : "Buat kategori template"}
			visible={true}
			style={{ width: "50vw" }}
			onHide={onHide}
		>
			<form onSubmit={handleSubmit} className="p-fluid">
				{error && (
					<Message
						severity="error"
						text={error}
						className="w-full mb-3"
						style={{ whiteSpace: "break-spaces" }}
					/>
				)}
				<div className="field">
					<label htmlFor="category-template-name">Nama kategori</label>
					<InputText
						id="category-template-name"
						value={formData.name}
						onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
							setFormData({ name: e.target.value })
						}
						required
					/>
				</div>
				<Button
					type="submit"
					label={categoryTemplate ? "Simpan kategori" : "Buat kategori"}
					loading={loading}
					className="mt-2"
				/>
			</form>
		</Dialog>
	);
};

export default CategoryTemplateForm;
