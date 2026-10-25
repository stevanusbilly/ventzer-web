import React, { useState, useRef } from "react";
import { Dialog } from "primereact/dialog";
import { FileUpload, FileUploadSelectEvent } from "primereact/fileupload";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { guestService } from "../../services/guestService";
import { eventService } from "../../services/eventService";
import { Event } from "../../types";
import { getApiErrorMessage } from "../../utils/apiError";

interface BulkUploadProps {
	onSuccess: () => void;
	onHide: () => void;
}

const BulkUpload: React.FC<BulkUploadProps> = ({ onSuccess, onHide }) => {
	const [selectedEvent, setSelectedEvent] = useState<number>(0);
	const [events, setEvents] = useState<Event[]>([]);
	const [uploading, setUploading] = useState<boolean>(false);
	const fileUploadRef = useRef<FileUpload>(null);
	const toast = useRef<Toast>(null);

	React.useEffect(() => {
		loadEvents();
	}, []);

	const loadEvents = async (): Promise<void> => {
		try {
			const response = await eventService.getAll();
			setEvents(response);
		} catch (error) {
			console.error("Failed to load events:", error);
		}
	};

	const handleUpload = async (event: FileUploadSelectEvent): Promise<void> => {
		const file = event.files[0];
		if (!file || !selectedEvent) {
			showError("Please select an event and an Excel file");
			return;
		}

		// Validasi file type - EXCEL ONLY
		const validExtensions = [".xlsx", ".xls"];
		const fileExtension = file.name
			.toLowerCase()
			.substring(file.name.lastIndexOf("."));

		if (!validExtensions.includes(fileExtension)) {
			showError("Please select an Excel file (.xlsx, .xls only)");
			return;
		}

		setUploading(true);

		try {
			const result = await guestService.bulkUpload(selectedEvent, file);
			const skipped = result.skipped?.length || 0;
			showSuccess(
				`Berhasil import ${result.imported} tamu${skipped ? `, ${skipped} baris dilewati` : ""}`,
			);
			onSuccess();
			if (fileUploadRef.current) {
				fileUploadRef.current.clear();
			}
		} catch (error: unknown) {
			showError(getApiErrorMessage(error, "Gagal upload tamu dari Excel"));
		} finally {
			setUploading(false);
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

	const downloadExcelTemplate = (): void => {
		// Create Excel template content
		const excelTemplateContent = `name,email,phone,rsvpStatus
John Doe,john@example.com,08123456789,pending
Jane Smith,jane@example.com,08198765432,accepted
Bob Johnson,bob@example.com,08155555555,declined

# Instructions:
# 1. Save this as Excel file (.xlsx)
# 2. Fill in guest data
# 3. RSVP Status options: pending, accepted, declined
# 4. Upload using the form above`;

		const blob = new Blob([excelTemplateContent], { type: "text/plain" });
		const url = window.URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.href = url;
		link.setAttribute("download", "guests_template.txt");
		document.body.appendChild(link);
		link.click();
		link.remove();
	};

	return (
		<>
			<Toast ref={toast} />
			<Dialog
				header="Bulk Upload Guests - Excel Only"
				visible={true}
				style={{ width: "50vw" }}
				onHide={onHide}
				className="bulk-upload-dialog"
			>
				<div className="field">
					<label htmlFor="event">Select Event</label>
					<Dropdown
						id="event"
						value={selectedEvent}
						options={events.map((event) => ({
							label: event.name,
							value: event.id,
						}))}
						onChange={(e: DropdownChangeEvent) => setSelectedEvent(e.value)}
						placeholder="Select an event"
						className="w-full"
						required
					/>
				</div>

				<div className="field mt-3">
					<label>Upload Excel File (.xlsx, .xls)</label>
					<FileUpload
						ref={fileUploadRef}
						name="file"
						accept=".xlsx,.xls"
						maxFileSize={1000000}
						chooseLabel="Select Excel File"
						uploadLabel="Upload"
						cancelLabel="Cancel"
						customUpload
						onSelect={handleUpload}
						emptyTemplate={
							<p className="m-0">
								Drag and drop Excel files (.xlsx, .xls) here to upload.
							</p>
						}
						disabled={uploading || !selectedEvent}
					/>
					<small className="text-500">Only Excel files are supported</small>
				</div>

				<div className="mt-3">
					<h4>Excel Format Requirements:</h4>
					<div className="surface-100 p-3 border-round">
						<p>
							<strong>Columns must be in this order:</strong>
						</p>
						<ul className="mt-0 mb-2">
							<li>
								<code>name</code> - Guest full name
							</li>
							<li>
								<code>email</code> - Email address
							</li>
							<li>
								<code>phone</code> - Phone number
							</li>
							<li>
								<code>rsvpStatus</code> - pending, accepted, or declined
							</li>
						</ul>
						<p className="mb-0">
							<strong>First row must be header row</strong>
						</p>
					</div>

					<Button
						label="Download Excel Template Guide"
						icon="pi pi-download"
						className="p-button-outlined p-button-help mt-2"
						onClick={downloadExcelTemplate}
					/>
				</div>

				<div className="flex justify-content-end gap-2 mt-4">
					<Button
						label="Close"
						icon="pi pi-times"
						className="p-button-text"
						onClick={onHide}
						disabled={uploading}
					/>
				</div>
			</Dialog>
		</>
	);
};

export default BulkUpload;
