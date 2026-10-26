import React, { useEffect, useState } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Button } from "primereact/button";
import { Message } from "primereact/message";
import { ProgressSpinner } from "primereact/progressspinner";
import { weddingService } from "../../services/weddingService";
import { Event, Wedding } from "../../types";
import { getApiErrorMessage, getApiSuccessMessage } from "../../utils/apiError";

const emptyWedding = (eventId: number): Omit<Wedding, "id"> => ({
	eventId,
	namaLengkapBride: "",
	namaLengkapGroom: "",
	namaPanggilanBride: "",
	namaPanggilanGroom: "",
	bioBride: "",
	bioGroom: "",
	sosmedBride: "",
	sosmedGroom: "",
	quote: "",
	openingText: "",
	loveStory: "",
	urlVideoPrewedding: "",
	urlVideoStreaming: "",
});

interface WeddingFormProps {
	event: Event;
	onSuccess: (message: string) => void;
	onHide: () => void;
}

const WeddingForm: React.FC<WeddingFormProps> = ({ event, onSuccess, onHide }) => {
	const [formData, setFormData] = useState<Omit<Wedding, "id">>(emptyWedding(event.id));
	const [loading, setLoading] = useState(false);
	const [fetching, setFetching] = useState(true);
	const [error, setError] = useState("");

	useEffect(() => {
		const loadWedding = async (): Promise<void> => {
			setFetching(true);
			setError("");
			try {
				const response = await weddingService.getByEvent(event.id);
				setFormData({
					eventId: event.id,
					namaLengkapBride: response.namaLengkapBride || "",
					namaLengkapGroom: response.namaLengkapGroom || "",
					namaPanggilanBride: response.namaPanggilanBride || "",
					namaPanggilanGroom: response.namaPanggilanGroom || "",
					bioBride: response.bioBride || "",
					bioGroom: response.bioGroom || "",
					sosmedBride: response.sosmedBride || "",
					sosmedGroom: response.sosmedGroom || "",
					quote: response.quote || "",
					openingText: response.openingText || "",
					loveStory: response.loveStory || "",
					urlVideoPrewedding: response.urlVideoPrewedding || "",
					urlVideoStreaming: response.urlVideoStreaming || "",
				});
			} catch {
				setFormData(emptyWedding(event.id));
			} finally {
				setFetching(false);
			}
		};
		loadWedding();
	}, [event.id]);

	const handleChange = (
		field: keyof Omit<Wedding, "id">,
		value: string,
	): void => {
		setFormData((prev) => ({ ...prev, [field]: value }));
	};

	const handleSubmit = async (e: React.FormEvent): Promise<void> => {
		e.preventDefault();
		setLoading(true);
		setError("");
		try {
			const data = await weddingService.ins({ ...formData, eventId: event.id });
			onSuccess(getApiSuccessMessage(data, "Data wedding disimpan"));
		} catch (err: unknown) {
			setError(getApiErrorMessage(err, "Gagal menyimpan data wedding"));
		} finally {
			setLoading(false);
		}
	};

	return (
		<Dialog
			header={`Data Wedding — ${event.name}`}
			visible
			style={{ width: "70vw", maxWidth: "56rem" }}
			onHide={onHide}
			contentStyle={{ overflowY: "auto", maxHeight: "70vh" }}
		>
			{fetching ? (
				<div className="flex justify-content-center py-5">
					<ProgressSpinner />
				</div>
			) : (
				<form onSubmit={handleSubmit} className="p-fluid">
					{error && (
						<Message
							severity="error"
							text={error}
							className="w-full mb-3"
							style={{ whiteSpace: "break-spaces" }}
						/>
					)}
					<div className="grid">
						<div className="col-12 lg:col-6">
							<div className="field">
								<label htmlFor="namaLengkapGroom">Nama Lengkap Groom</label>
								<InputText
									id="namaLengkapGroom"
									value={formData.namaLengkapGroom}
									onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
										handleChange("namaLengkapGroom", e.target.value)
									}
									required
								/>
							</div>
							<div className="field">
								<label htmlFor="namaPanggilanGroom">Nama Panggilan Groom</label>
								<InputText
									id="namaPanggilanGroom"
									value={formData.namaPanggilanGroom}
									onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
										handleChange("namaPanggilanGroom", e.target.value)
									}
								/>
							</div>
							<div className="field">
								<label htmlFor="bioGroom">Bio Groom</label>
								<InputTextarea
									id="bioGroom"
									value={formData.bioGroom}
									rows={5}
									onChange={(e) => handleChange("bioGroom", e.target.value)}
								/>
							</div>
							<div className="field">
								<label htmlFor="sosmedGroom">Social Media Groom</label>
								<InputText
									id="sosmedGroom"
									value={formData.sosmedGroom}
									onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
										handleChange("sosmedGroom", e.target.value)
									}
								/>
							</div>
						</div>
						<div className="col-12 lg:col-6">
							<div className="field">
								<label htmlFor="namaLengkapBride">Nama Lengkap Bride</label>
								<InputText
									id="namaLengkapBride"
									value={formData.namaLengkapBride}
									onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
										handleChange("namaLengkapBride", e.target.value)
									}
									required
								/>
							</div>
							<div className="field">
								<label htmlFor="namaPanggilanBride">Nama Panggilan Bride</label>
								<InputText
									id="namaPanggilanBride"
									value={formData.namaPanggilanBride}
									onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
										handleChange("namaPanggilanBride", e.target.value)
									}
								/>
							</div>
							<div className="field">
								<label htmlFor="bioBride">Bio Bride</label>
								<InputTextarea
									id="bioBride"
									value={formData.bioBride}
									rows={5}
									onChange={(e) => handleChange("bioBride", e.target.value)}
								/>
							</div>
							<div className="field">
								<label htmlFor="sosmedBride">Social Media Bride</label>
								<InputText
									id="sosmedBride"
									value={formData.sosmedBride}
									onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
										handleChange("sosmedBride", e.target.value)
									}
								/>
							</div>
						</div>
					</div>
					<div className="field">
						<label htmlFor="quote">Quote</label>
						<InputTextarea
							id="quote"
							value={formData.quote}
							rows={5}
							onChange={(e) => handleChange("quote", e.target.value)}
						/>
					</div>
					<div className="field">
						<label htmlFor="openingText">Teks Opening</label>
						<InputText
							id="openingText"
							value={formData.openingText}
							onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
								handleChange("openingText", e.target.value)
							}
						/>
					</div>
					<div className="field">
						<label htmlFor="loveStory">Love Story</label>
						<InputTextarea
							id="loveStory"
							value={formData.loveStory}
							rows={5}
							onChange={(e) => handleChange("loveStory", e.target.value)}
						/>
					</div>
					<div className="field">
						<label htmlFor="urlVideoPrewedding">URL Video Prewedding</label>
						<InputText
							id="urlVideoPrewedding"
							value={formData.urlVideoPrewedding}
							onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
								handleChange("urlVideoPrewedding", e.target.value)
							}
						/>
					</div>
					<div className="field">
						<label htmlFor="urlVideoStreaming">URL Video Streaming</label>
						<InputText
							id="urlVideoStreaming"
							value={formData.urlVideoStreaming}
							onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
								handleChange("urlVideoStreaming", e.target.value)
							}
						/>
					</div>
					<div className="flex justify-content-end gap-2 mt-3">
						<Button
							type="button"
							label="Batal"
							className="p-button-text"
							onClick={onHide}
						/>
						<Button type="submit" label="Simpan" loading={loading} />
					</div>
				</form>
			)}
		</Dialog>
	);
};

export default WeddingForm;
