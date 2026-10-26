import React, { useState, useEffect } from "react";
import { Card } from "primereact/card";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Message } from "primereact/message";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Tag } from "primereact/tag";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";
import { checkinService } from "../../services/checkinService";
import { guestService } from "../../services/guestService";
import { eventService } from "../../services/eventService";
import { Guest, Event } from "../../types";
import QRCodeScanner from "./QRCodeScanner";
import { useAuth } from "../../contexts/AuthContext";
import {
	extractEventIdFromScan,
	extractQrTokenFromScan,
} from "../../utils/invitationLink";
import { getApiErrorMessage } from "../../utils/apiError";

const CheckIn: React.FC = () => {
	const { user, canMutate, isAdmin } = useAuth();
	const [token, setToken] = useState("");
	const [eventId, setEventId] = useState(0);
	const [events, setEvents] = useState<Event[]>([]);
	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState<{
		type: "success" | "error" | "info";
		text: string;
	} | null>(null);
	const [recentCheckIns, setRecentCheckIns] = useState<Guest[]>([]);
	const [showScanner, setShowScanner] = useState(false);
	const [scanLoading, setScanLoading] = useState(false);

	useEffect(() => {
		loadEvents();
	}, [user?.id]);

	useEffect(() => {
		if (eventId) {
			loadRecentCheckIns();
		}
	}, [eventId]);

	const loadEvents = async (): Promise<void> => {
		try {
			const response =
				user?.role === "admin"
					? await eventService.getAll()
					: await eventService.getByUser(user?.id || 0);
			setEvents(response);
			if (response.length > 0) {
				setEventId(response[0].id);
			}
		} catch (error) {
			console.error("Failed to load events:", error);
		}
	};

	const loadRecentCheckIns = async (): Promise<void> => {
		try {
			const response = await guestService.getByEvent(eventId);
			setRecentCheckIns(
				response
					.filter((g) => g.checkedIn)
					.sort(
						(a, b) =>
							new Date(b.checkedIn || 0).getTime() -
							new Date(a.checkedIn || 0).getTime(),
					)
					.slice(0, 10),
			);
		} catch (error) {
			console.error("Failed to load check-ins:", error);
		}
	};

	const handleCheckIn = async (tokenValue: string, eventIdOverride?: number): Promise<void> => {
		const targetEventId = eventIdOverride || eventId;
		const parsedToken = extractQrTokenFromScan(tokenValue);

		if (!parsedToken.trim() || !targetEventId) {
			setMessage({
				type: "error",
				text: "Pilih event dan masukkan token/QR yang valid",
			});
			return;
		}

		setScanLoading(true);
		setMessage(null);

		try {
			const response = await checkinService.checkin({
				token: parsedToken,
				eventId: targetEventId,
				scanLocation: "Main Entrance",
			});
			const table = response.guest?.table;
			const tableInfo = table?.tableName
				? ` Meja: ${table.tableName}${table.jumlah ? ` (${table.jumlah} orang)` : ""}.`
				: "";
			setMessage({
				type: "success",
				text: `${response.message} — ${response.guest?.name}${tableInfo}`,
			});
			setToken("");
			loadRecentCheckIns();
		} catch (error: unknown) {
			const err = error as { response?: { status?: number; data?: { guest?: { name?: string } } } };
			if (err.response?.status === 409) {
				setMessage({
					type: "info",
					text: getApiErrorMessage(error, "Tamu sudah check-in"),
				});
			} else {
				setMessage({
					type: "error",
					text: getApiErrorMessage(error, "Check-in gagal"),
				});
			}
		} finally {
			setScanLoading(false);
			setLoading(false);
		}
	};

	const handleManualCheckIn = async (e: React.FormEvent): Promise<void> => {
		e.preventDefault();
		if (!canMutate) return;
		setLoading(true);
		await handleCheckIn(token);
	};

	const handleUndo = async (row: Guest): Promise<void> => {
		if (!isAdmin || !eventId) return;
		try {
			const data = await checkinService.undo(row.id, eventId);
			setMessage({
				type: "success",
				text: data.message || `Check-in ${row.name} dibatalkan`,
			});
			loadRecentCheckIns();
		} catch (error: unknown) {
			setMessage({
				type: "error",
				text: getApiErrorMessage(error, "Gagal membatalkan check-in"),
			});
		}
	};

	const handleScanSuccess = async (decodedText: string): Promise<void> => {
		setShowScanner(false);
		const scannedEventId = extractEventIdFromScan(decodedText);
		if (scannedEventId) {
			setEventId(scannedEventId);
		}
		await handleCheckIn(decodedText, scannedEventId || eventId);
	};

	const statusBodyTemplate = (rowData: Guest): React.ReactNode => {
		const severity = {
			accepted: "success",
			pending: "warning",
			declined: "danger",
		}[rowData.rsvpStatus] as "success" | "warning" | "danger";
		return <Tag value={rowData.rsvpStatus} severity={severity} />;
	};

	return (
		<div className="card">
			<h2>Guest Check-in</h2>
			{!canMutate && (
				<Message
					severity="info"
					text="Akun viewer hanya melihat ringkasan check-in."
					className="w-full mb-3"
				/>
			)}
			<div className="grid">
				{canMutate && (
				<div className="col-12 md:col-6">
					<Card className="mt-3">
						{message && (
							<Message
								severity={message.type}
								text={message.text}
								className="w-full mb-3"
							/>
						)}
						<form onSubmit={handleManualCheckIn} className="p-fluid">
							<div className="field">
								<label htmlFor="event">Event</label>
								<Dropdown
									id="event"
									value={eventId}
									options={events.map((event) => ({
										label: event.name,
										value: event.id,
									}))}
									onChange={(e: DropdownChangeEvent) => setEventId(e.value)}
									className="w-full"
									required
								/>
							</div>
							<div className="field">
								<label htmlFor="token">Token / QR</label>
								<div className="p-inputgroup">
									<InputText
										id="token"
										value={token}
										onChange={(e) => setToken(e.target.value)}
										placeholder="Token atau hasil scan URL undangan"
										required
									/>
									<Button
										icon="pi pi-camera"
										type="button"
										onClick={() => setShowScanner(true)}
										loading={scanLoading}
									/>
								</div>
							</div>
							<Button
								type="submit"
								label="Check-in"
								icon="pi pi-check-circle"
								loading={loading}
								className="w-full mt-3"
							/>
						</form>
					</Card>
				</div>
				)}
				<div className={canMutate ? "col-12 md:col-6" : "col-12"}>
					<Card title="Check-in Terbaru" className="mt-3">
						<div className="field mb-3">
							<label htmlFor="summaryEvent">Event</label>
							<Dropdown
								id="summaryEvent"
								value={eventId}
								options={events.map((event) => ({
									label: event.name,
									value: event.id,
								}))}
								onChange={(e: DropdownChangeEvent) => setEventId(e.value)}
								className="w-full"
								placeholder="Pilih event"
							/>
						</div>
						<DataTable value={recentCheckIns} emptyMessage="Belum ada check-in">
							<Column field="name" header="Nama" />
							<Column field="rsvpStatus" header="RSVP" body={statusBodyTemplate} />
							<Column
								field="checkedIn"
								header="Waktu"
								body={(row: Guest) =>
									row.checkedIn
										? new Date(row.checkedIn).toLocaleString("id-ID")
										: "-"
								}
							/>
							{isAdmin && (
								<Column
									header="Aksi"
									body={(row: Guest) =>
										row.checkedIn ? (
											<Button
												icon="pi pi-replay"
												className="p-button-rounded p-button-warning p-button-text"
												tooltip="Batalkan check-in"
												onClick={() => handleUndo(row)}
											/>
										) : null
									}
								/>
							)}
						</DataTable>
					</Card>
				</div>
			</div>
			<QRCodeScanner
				visible={showScanner}
				onHide={() => setShowScanner(false)}
				onScanSuccess={handleScanSuccess}
			/>
		</div>
	);
};

export default CheckIn;
