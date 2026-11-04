import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { eventService } from "../../services/eventService";
import { eventLocationService } from "../../services/eventLocationService";
import { weddingService } from "../../services/weddingService";
import { guestService } from "../../services/guestService";
import { checkinService } from "../../services/checkinService";
import { Event, EventLocation, Guest, Wedding, CheckinTableInfo } from "../../types";
import { extractQrTokenFromScan } from "../../utils/invitationLink";
import { getApiErrorMessage } from "../../utils/apiError";
import { useAuth } from "../../contexts/AuthContext";
import { printGuestGiftSticker } from "./printGuestSticker";
import UsherLiveScanner from "./UsherLiveScanner";
import UsherFlorals from "./UsherFlorals";
import "./UsherPage.css";

type UsherTab = "scan" | "guests" | "info";

type UsherGuestCard = {
	id: number;
	name: string;
	rsvpJumlah?: number | null;
	tableName?: string | null;
	alreadyCheckedIn?: boolean;
	checkedAt?: string;
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

const formatEventDate = (value?: string): string => {
	if (!value) {
		return "Tanggal menyusul";
	}
	return new Date(value).toLocaleDateString("id-ID", {
		weekday: "long",
		day: "numeric",
		month: "long",
		year: "numeric",
	});
};

const formatTime = (value?: string | null): string => {
	if (!value) {
		return new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
	}
	return new Date(value).toLocaleTimeString("id-ID", {
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
	});
};

const UsherPage: React.FC = () => {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const { user } = useAuth();
	const eventId = Number(id);
	const [event, setEvent] = useState<Event | null>(null);
	const [wedding, setWedding] = useState<Wedding | null>(null);
	const [locations, setLocations] = useState<EventLocation[]>([]);
	const [guests, setGuests] = useState<Guest[]>([]);
	const [recent, setRecent] = useState<Guest[]>([]);
	const [token, setToken] = useState("");
	const [search, setSearch] = useState("");
	const [showManual, setShowManual] = useState(false);
	const [scanExpanded, setScanExpanded] = useState(false);
	const [tab, setTab] = useState<UsherTab>("scan");
	const [busy, setBusy] = useState(false);
	const [printBusyId, setPrintBusyId] = useState<number | null>(null);
	const [error, setError] = useState("");
	const [current, setCurrent] = useState<UsherGuestCard | null>(null);
	const lastScanRef = useRef({ token: "", at: 0 });

	const couple = wedding
		? `${wedding.namaPanggilanGroom || "Groom"} & ${wedding.namaPanggilanBride || "Bride"}`
		: event?.name || "Wedding Usher";
	const venue = locations[0]
		? locations[0].location || locations[0].name
		: "Lokasi menyusul";
	const stats = useMemo(() => {
		const total = guests.length;
		const checkedIn = guests.filter((guest) => guest.checkedIn).length;
		return {
			total,
			checkedIn,
			pending: Math.max(0, total - checkedIn),
		};
	}, [guests]);
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
			const [eventData, guestData, recentData, locationData] = await Promise.all([
				eventService.getById(eventId),
				guestService.getByEvent(eventId),
				checkinService.getRecent(eventId, 8),
				eventLocationService.getByEvent(eventId).catch(() => []),
			]);
			setEvent(eventData);
			setGuests(guestData);
			setRecent(recentData);
			setLocations(locationData);
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
		checkedAt: fallback?.checkedInAt || fallback?.checkedIn || new Date().toISOString(),
		statusText: alreadyCheckedIn ? "Tamu sudah check-in" : "Check-in berhasil!",
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
		if (busy) {
			return;
		}

		lastScanRef.current = { token: parsedToken, at: now };
		setBusy(true);
		setError("");
		setTab("scan");
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
				setError("");
				return;
			}
			setError(getApiErrorMessage(err, "Gagal menerima tamu"));
		} finally {
			setBusy(false);
		}
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
				<p className="usher-empty">Event tidak valid</p>
			</div>
		);
	}

	return (
		<div className={`usher-page${scanExpanded ? " scan-expanded" : ""}`}>
			<aside className="usher-nav">
				<div className="usher-nav-brand">
					<span className="usher-nav-mark">
						<i className="pi pi-heart" />
					</span>
					<div>
						<small>Wedding Event</small>
						<strong>Usher Desk</strong>
					</div>
				</div>
				<nav>
					<button
						type="button"
						className={tab === "scan" ? "active" : ""}
						onClick={() => setTab("scan")}
					>
						<i className="pi pi-qrcode" />
						Check-in
					</button>
					<button
						type="button"
						className={tab === "guests" ? "active" : ""}
						onClick={() => setTab("guests")}
					>
						<i className="pi pi-users" />
						Daftar Tamu
					</button>
					<button
						type="button"
						className={tab === "info" ? "active" : ""}
						onClick={() => setTab("info")}
					>
						<i className="pi pi-info-circle" />
						Info Event
					</button>
					<button type="button" onClick={() => navigate("/events")}>
						<i className="pi pi-sign-out" />
						Kembali
					</button>
				</nav>
			</aside>

			<main className="usher-shell">
				<UsherFlorals />
				<header className="usher-hero">
					<div>
						<p className="usher-kicker">The Wedding of</p>
						<h1>{couple}</h1>
						<span className="usher-heart" aria-hidden="true" />
					</div>
					<div className="usher-hero-meta">
						<p>
							<i className="pi pi-calendar" />
							{formatEventDate(event?.date)}
						</p>
						<p>
							<i className="pi pi-map-marker" />
							{venue}
						</p>
					</div>
					<div className="usher-user">
						<i className="pi pi-user" />
						<span>{user?.name || "Panitia"}</span>
					</div>
				</header>

				{tab === "scan" && (
					<div className="usher-grid">
						<section className="usher-col">
							<article className="usher-card">
								<h2>Ringkasan Event</h2>
								<div className="usher-stats">
									<div>
										<i className="pi pi-users" />
										<strong>{stats.total}</strong>
										<span>Total tamu</span>
									</div>
									<div>
										<i className="pi pi-check-circle" />
										<strong>{stats.checkedIn}</strong>
										<span>Sudah check-in</span>
									</div>
									<div>
										<i className="pi pi-clock" />
										<strong>{stats.pending}</strong>
										<span>Belum check-in</span>
									</div>
								</div>
							</article>
							<article className="usher-card">
								<div className="usher-card-head">
									<h2>Check-in terbaru</h2>
									<button type="button" onClick={() => setTab("guests")}>
										Lihat semua
									</button>
								</div>
								<div className="usher-recent">
									{recent.length === 0 && <p className="usher-empty">Belum ada tamu yang check-in.</p>}
									{recent.map((row) => (
										<div className="usher-recent-row" key={row.id}>
											<span className="usher-avatar">{row.name.slice(0, 1)}</span>
											<div>
												<p>{row.name}</p>
												<small>{formatTime(row.checkedInAt || row.checkedIn)}</small>
											</div>
											<em>Hadir</em>
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
							</article>
							<p className="usher-thanks">
								Terima kasih telah hadir
								<br />
								di hari bahagia kami
								<span className="usher-heart" />
							</p>
						</section>

						<section className="usher-col scan">
							<article className="usher-card usher-scan-card">
								<div className="usher-card-head dark">
									<h2>
										<i className="pi pi-qrcode" />
										Scan QR Code Tamu
									</h2>
									<div className="usher-scan-tools">
										<button type="button" onClick={() => setShowManual((open) => !open)}>
											<i className="pi pi-pencil" />
										</button>
										<button type="button" onClick={() => setScanExpanded((open) => !open)}>
											<i className={`pi ${scanExpanded ? "pi-window-minimize" : "pi-window-maximize"}`} />
										</button>
									</div>
								</div>
								<div className="usher-scan-stage">
									<UsherLiveScanner
										active={tab === "scan"}
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
								</div>
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
								{error && <p className="usher-scan-toast">{error}</p>}
							</article>

							{current && (
								<article className={`usher-result ${current.alreadyCheckedIn ? "info" : "ok"}`}>
									<p className="usher-result-label">
										<i className="pi pi-check-circle" />
										{current.statusText}
									</p>
									<h3>{current.name}</h3>
									<div className="usher-result-meta">
										<span>
											<i className="pi pi-th-large" />
											{current.tableName ? `Meja ${current.tableName}` : "Meja belum ditentukan"}
										</span>
										<span>
											<i className="pi pi-clock" />
											{formatTime(current.checkedAt)}
										</span>
										<span>
											<i className="pi pi-check" />
											Hadir
										</span>
									</div>
									<div className="usher-result-actions">
										<Button
											label="Print stiker kado"
											icon="pi pi-print"
											onClick={() => void handlePrint(current)}
											loading={printBusyId === current.id}
										/>
									</div>
								</article>
							)}
						</section>
					</div>
				)}

				{tab === "guests" && (
					<article className="usher-card usher-wide">
						<div className="usher-card-head">
							<h2>Daftar tamu</h2>
							<InputText
								className="usher-search"
								value={search}
								onChange={(e) => setSearch(e.target.value)}
								placeholder="Cari nama / email / telepon"
							/>
						</div>
						<div className="usher-guest-grid">
							{filteredGuests.length === 0 && <p className="usher-empty">Tidak ada tamu.</p>}
							{filteredGuests.map((row) => (
								<div className="usher-guest-row" key={row.id}>
									<span className="usher-avatar">{row.name.slice(0, 1)}</span>
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
									/>
								</div>
							))}
						</div>
					</article>
				)}

				{tab === "info" && (
					<article className="usher-card usher-wide">
						<h2>Informasi event</h2>
						<div className="usher-info-grid">
							<p>
								<strong>Event</strong>
								{event?.name || "-"}
							</p>
							<p>
								<strong>Tanggal</strong>
								{formatEventDate(event?.date)}
							</p>
							<p>
								<strong>Dresscode</strong>
								{event?.dresscode || "-"}
							</p>
						</div>
						<h3>Lokasi</h3>
						{locations.length === 0 && <p className="usher-empty">Belum ada lokasi.</p>}
						{locations.map((row) => (
							<div className="usher-location" key={row.id}>
								<strong>{row.name}</strong>
								<span>{row.location}</span>
								<small>{row.alamat}</small>
							</div>
						))}
					</article>
				)}
			</main>
		</div>
	);
};

export default UsherPage;
