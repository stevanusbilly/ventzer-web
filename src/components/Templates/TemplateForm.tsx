import React, { useEffect, useState } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";
import { Button } from "primereact/button";
import { Message } from "primereact/message";
import { templateService } from "../../services/templateService";
import { categoryTemplateService } from "../../services/categoryTemplateService";
import { CategoryTemplate, Template } from "../../types";
import { getApiErrorMessage, getApiSuccessMessage } from "../../utils/apiError";

interface TemplateFormProps {
	template: Template | null;
	onSuccess: (message: string) => void;
	onHide: () => void;
}

const TemplateForm: React.FC<TemplateFormProps> = ({
	template,
	onSuccess,
	onHide,
}) => {
	const [formData, setFormData] = useState({
		name: template?.name || "",
		categoryTemplateId: template?.categoryTemplateId || 0,
	});
	const [categories, setCategories] = useState<CategoryTemplate[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	useEffect(() => {
		void categoryTemplateService.list().then(setCategories).catch(() => {
			setError("Gagal memuat kategori template");
		});
	}, []);

	const handleSubmit = async (e: React.FormEvent): Promise<void> => {
		e.preventDefault();
		setLoading(true);
		setError("");
		try {
			const result = template
				? await templateService.upd(template.id, formData)
				: await templateService.ins(formData);
			onSuccess(
				getApiSuccessMessage(
					result,
					template ? "Template diperbarui" : "Template ditambahkan",
				),
			);
		} catch (err: unknown) {
			setError(getApiErrorMessage(err, "Gagal menyimpan template"));
		} finally {
			setLoading(false);
		}
	};

	return (
		<Dialog
			header={template ? "Ubah template" : "Buat template"}
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
					<label htmlFor="categoryTemplateId">Kategori</label>
					<Dropdown
						id="categoryTemplateId"
						value={formData.categoryTemplateId || null}
						options={categories.map((item) => ({
							label: item.name,
							value: item.id,
						}))}
						onChange={(e: DropdownChangeEvent) =>
							setFormData((prev) => ({
								...prev,
								categoryTemplateId: Number(e.value || 0),
							}))
						}
						filter
						required
						placeholder="Pilih kategori"
					/>
				</div>
				<div className="field">
					<label htmlFor="name">Nama template</label>
					<InputText
						id="name"
						value={formData.name}
						onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
							setFormData((prev) => ({ ...prev, name: e.target.value }))
						}
						required
					/>
				</div>
				<Button
					type="submit"
					label={template ? "Simpan template" : "Buat template"}
					loading={loading}
					className="mt-2"
				/>
			</form>
		</Dialog>
	);
};

export default TemplateForm;
