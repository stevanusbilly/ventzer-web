import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { eventService } from "../../services/eventService";
import { weddingService } from "../../services/weddingService";
import { guestService } from "../../services/guestService";
import { checkinService } from "../../services/checkinService";
import { Event, Guest, Wedding, CheckinTableInfo } from "../../types";
import { extractQrTokenFromScan } from "../../utils/invitationLink";
import { getApiErrorMessage } from "../../utils/apiError";
import { printGuestGiftSticker } from "./printGuestSticker";
import UsherLiveScanner from "./UsherLiveScanner";
import "./UsherPage.css";

type UsherView = "scan" | "result";

type UsherGuestCard = {
	id: number;
	name: string;
	rsvpJumlah?: number | null;
	tableName?: string | null;
	alreadyCheckedIn?: boolean;
	statusText: string;
};

const getErrorGuest = (
	error: unknown,
): { id?: number; name?: string; table?: CheckinTableInfo | null } | undefined => {
	const err = error as {
		response?: {
			status?: number;
			data?: {
				guest?: { id?: number; name?: string; table?: CheckinTableInfo | null };
			};
		};
	};
	if (err.response?.status !== 409) {
		return undefined;
	}
	return err.response.data?.guest;
};

const UsherPage: React.FC = () => {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const eventId = Number(id);
	const [event, setEvent] = useState<Event | null>(null);
	const [wedding, setWedding] = useState<Wedding | null>(null);
	const [guests, setGuests] = useState<Guest[]>([]);
	const [recent, setRecent] = useState<Guest[]>([]);
	const [token, setToken] = useState("");
	const [search, setSearch] = useState("");
	const [showManual, setShowManual] = useState(false);
	const [showGuests, setShowGuests] = useState(false);
	const [view, setView] = useState<UsherView>("scan");
	const [busy, setBusy] = useState(false);
	const [printBusyId, setPrintBusyId] = useState<number | null>(null);
	const [error, setError] = useState("");
	const [current, setCurrent] = useState<UsherGuestCard | null>(null);
	const lastScanRef = useRef({ token: "", at: 0 });

	const couple = wedding
		? `${wedding.namaPanggilanBride || "Bride"} & ${wedding.namaPanggilanGroom || "Groom"}`
		: event?.name || "Wedding Usher";

	const filteredGuests = useMemo(() => {
		const q = search.trim().toLowerCase();
		if (!q) {
			return guests;
		}
		return guests.filter((guest) =>
			[guest.name, guest.email, guest.phone]
				.filter(Boolean)
				.some((value) => String(value).toLowerCase().includes(q)),
		);
	}, [guests, search]);

	useEffect(() => {
		if (!eventId) {
			setError("Event tidak valid");
			return;
		}
		void loadPage();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [eventId]);

	const loadPage = async (): Promise<void> => {
		try {
			const [eventData, guestData, recentData] = await Promise.all([
				eventService.getById(eventId),
				guestService.getByEvent(eventId),
				checkinService.getRecent(eventId, 8),
			]);
			setEvent(eventData);
			setGuests(guestData);
			setRecent(recentData);
			try {
				setWedding(await weddingService.getByEvent(eventId));
			} catch {
				setWedding(null);
			}
		} catch (err) {
			setError(getApiErrorMessage(err, "Gagal memuat halaman usher"));
		}
	};

	const toCard = (
		guest: {
			id: number;
			name: string;
			table?: CheckinTableInfo | null;
		},
		alreadyCheckedIn: boolean,
		fallback?: Guest,
	): UsherGuestCard => ({
		id: guest.id,
		name: guest.name,
		rsvpJumlah: fallback?.rsvpJumlah,
		tableName: guest.table?.tableName || null,
		alreadyCheckedIn,
		statusText: alreadyCheckedIn
			? "Tamu sudah check-in sebelumnya"
			: "Check-in berhasil",
	});

	const receiveGuest = async (rawToken: string): Promise<void> => {
		const parsedToken = extractQrTokenFromScan(rawToken);
		if (!parsedToken || !eventId) {
			setError("Barcode tidak dikenali. Coba scan ulang.");
			return;
		}

		const now = Date.now();
		if (
			lastScanRef.current.token === parsedToken &&
			now - lastScanRef.current.at < 2500
		) {
			return;
		}
		if (busy || view === "result") {
			return;
		}

		lastScanRef.current = { token: parsedToken, at: now };
		setBusy(true);
		setError("");
		try {
			const result = await checkinService.checkin({
				token: parsedToken,
				eventId,
				scanLocation: "Usher Desk",
			});
			if (!result.guest) {
				setError("Data tamu tidak ditemukan");
				return;
			}
			const fallback = guests.find((row) => row.id === result.guest?.id);
			setCurrent(toCard(result.guest, false, fallback));
			setView("result");
			setToken("");
			setShowManual(false);
			const [guestData, recentData] = await Promise.all([
				guestService.getByEvent(eventId),
				checkinService.getRecent(eventId, 8),
			]);
			setGuests(guestData);
			setRecent(recentData);
		} catch (err) {
			const already = getErrorGuest(err);
			if (already?.id && already.name) {
				const fallback = guests.find((row) => row.id === already.id);
				setCurrent(toCard({ ...already, name: already.name, id: already.id }, true, fallback));
				setView("result");
				setError("");
				return;
			}
			setError(getApiErrorMessage(err, "Gagal menerima tamu"));
		} finally {
			setBusy(false);
		}
	};

	const resumeScan = (): void => {
		setCurrent(null);
		setView("scan");
		setError("");
		setToken("");
	};

	const handlePrint = async (guest: { id: number; name: string; tableName?: string | null }): Promise<void> => {
		setPrintBusyId(guest.id);
		setError("");
		try {
			const qrBlob = await guestService.getQRCode(guest.id);
			await printGuestGiftSticker({
				guestName: guest.name,
				eventName: event?.name || "",
				couple,
				tableName: guest.tableName,
				qrBlob,
			});
		} catch (err) {
			setError(
				err instanceof Error
					? err.message
					: getApiErrorMessage(err, "Gagal mencetak stiker"),
			);
		} finally {
			setPrintBusyId(null);
		}
	};

	if (!eventId) {
		return (
			<div className="usher-page">
				<p className="usher-empty" style={{ padding: "2rem" }}>
					Event tidak valid
				</p>
			</div>
		);
	}

	return (
		<div className={`usher-page ${showGuests ? "panel-open" : ""}`}>
			<header className="usher-top">
				<div>
					<p className="usher-brand">Wedding Usher</p>
					<strong>{couple}</strong>
				</div>
				<div className="usher-actions">
					{view === "scan" && (
						<Button
							label={showManual ? "Tutup token" : "Token manual"}
							icon="pi pi-pencil"
							text
							onClick={() => setShowManual((open) => !open)}
						/>
					)}
					<Button
						label={showGuests ? "Tutup daftar" : "Daftar tamu"}
						icon="pi pi-users"
						text
						onClick={() => setShowGuests((open) => !open)}
					/>
					<Button
						label="Kembali"
						icon="pi pi-arrow-left"
						text
						onClick={() => navigate("/events")}
					/>
				</div>
			</header>

			<div className={`usher-stage ${error || showManual ? "has-footer" : ""}`}>
				{view === "scan" && (
					<>
						<UsherLiveScanner
							active={view === "scan"}
							paused={busy}
							onScan={(decoded) => {
								void receiveGuest(decoded);
							}}
						/>
						{busy && (
							<div className="usher-processing">
								<span className="usher-spinner" />
								<p>Memeriksa tamu…</p>
							</div>
						)}
						{(error || showManual) && (
							<div className="usher-stage-footer">
								{error && <p className="usher-scan-toast">{error}</p>}
								{showManual && (
									<div className="usher-manual">
										<InputText
											value={token}
											onChange={(e) => setToken(e.target.value)}
											placeholder="Tempel token undangan"
											onKeyDown={(e) => {
												if (e.key === "Enter") {
													e.preventDefault();
													void receiveGuest(token);
												}
											}}
										/>
										<Button
											label="Terima"
											icon="pi pi-check"
											onClick={() => void receiveGuest(token)}
											loading={busy}
											disabled={!token.trim()}
										/>
									</div>
								)}
							</div>
						)}
					</>
				)}

				{view === "result" && current && (
					<div className={`usher-guest-view ${current.alreadyCheckedIn ? "info" : "ok"}`}>
						<p className="label">{current.statusText}</p>
						<h2>{current.name}</h2>
						<div className="usher-meta">
							<p>
								<strong>Meja</strong>
								{current.tableName || "Belum ditentukan"}
							</p>
							<p>
								<strong>Jumlah RSVP</strong>
								{current.rsvpJumlah || "-"}
							</p>
						</div>
						{error && <p className="usher-scan-toast">{error}</p>}
						<div className="usher-guest-actions">
							<Button
								label="Print stiker kado"
								icon="pi pi-print"
								onClick={() => void handlePrint(current)}
								loading={printBusyId === current.id}
							/>
							<Button
								label="Scan tamu berikutnya"
								icon="pi pi-camera"
								outlined
								onClick={resumeScan}
							/>
						</div>
					</div>
				)}
			</div>

			{showGuests && (
				<aside className="usher-panel">
					<h2>Print stiker tamu</h2>
					<InputText
						className="usher-search"
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						placeholder="Cari nama / email / telepon"
					/>
					<div className="usher-list">
						{filteredGuests.length === 0 && (
							<p className="usher-empty">Tidak ada tamu.</p>
						)}
						{filteredGuests.map((row) => (
							<div className="usher-row" key={row.id}>
								<div>
									<p>{row.name}</p>
									<small>
										{row.checkedIn ? "Sudah check-in" : "Belum check-in"}
										{row.rsvpJumlah ? ` · ${row.rsvpJumlah} orang` : ""}
									</small>
								</div>
								<Button
									label="Print"
									icon="pi pi-print"
									size="small"
									outlined
									onClick={() => void handlePrint({ id: row.id, name: row.name })}
									loading={printBusyId === row.id}
									disabled={printBusyId === row.id}
								/>
							</div>
						))}
					</div>
					<h2>Check-in terbaru</h2>
					<div className="usher-list compact">
						{recent.length === 0 && (
							<p className="usher-empty">Belum ada tamu yang check-in.</p>
						)}
						{recent.map((row) => (
							<div className="usher-row" key={row.id}>
								<div>
									<p>{row.name}</p>
									<small>
										{row.checkedInAt
											? new Date(row.checkedInAt).toLocaleTimeString("id-ID")
											: "Baru saja"}
									</small>
								</div>
								<Button
									icon="pi pi-print"
									rounded
									text
									aria-label={`Print ${row.name}`}
									onClick={() => void handlePrint({ id: row.id, name: row.name })}
									loading={printBusyId === row.id}
								/>
							</div>
						))}
					</div>
				</aside>
			)}
		</div>
	);
};

export default UsherPage;
