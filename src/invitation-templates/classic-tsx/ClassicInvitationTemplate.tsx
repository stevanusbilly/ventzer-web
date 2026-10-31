import React, { useEffect, useMemo, useRef, useState } from "react";
import { ClassicInvitationProps } from "./types";
import { getApiErrorMessage } from "../../utils/apiError";
import {
	formatLongDate,
	formatShortDate,
	formatTime,
	getImageUrl,
	parseDate,
	toGoogleCalendarUrl,
	youtubeEmbedUrl,
} from "./utils";
import "./ClassicInvitationTemplate.css";

const rsvpStatusLabel = (status?: string): string => {
	if (status === "accepted") return "Hadir";
	if (status === "declined") return "Tidak Hadir";
	return "Belum konfirmasi";
};

const defaultSetting = {
	fotoProfil: true,
	socialMedia: true,
	rsvp: true,
	video: true,
	addToCalendar: true,
	loveStory: true,
	maxGaleriFoto: 8,
};

const useCountdown = (target?: string | null) => {
	const [now, setNow] = useState(Date.now());
	useEffect(() => {
		const timer = window.setInterval(() => setNow(Date.now()), 1000);
		return () => window.clearInterval(timer);
	}, []);
	const date = parseDate(target);
	if (!date) {
		return { days: 0, hours: 0, minutes: 0, seconds: 0 };
	}
	const diff = Math.max(0, date.getTime() - now);
	return {
		days: Math.floor(diff / 86400000),
		hours: Math.floor((diff / 3600000) % 24),
		minutes: Math.floor((diff / 60000) % 60),
		seconds: Math.floor((diff / 1000) % 60),
	};
};

const ClassicInvitationTemplate: React.FC<ClassicInvitationProps> = ({
	event,
	wedding,
	locations,
	gifts,
	messages,
	photos,
	guestId,
	guestName,
	guestRsvpStatus,
	guestRsvpJumlah,
	setting,
	mode = "preview",
	onRsvp,
	onSendMessage,
}) => {
	const flags = { ...defaultSetting, ...setting };
	const [opened, setOpened] = useState(false);
	const [playing, setPlaying] = useState(false);
	const [copiedId, setCopiedId] = useState<number | null>(null);
	const [jumlah, setJumlah] = useState(guestRsvpJumlah || 1);
	const [ucapan, setUcapan] = useState("");
	const [rsvpBusy, setRsvpBusy] = useState(false);
	const [messageBusy, setMessageBusy] = useState(false);
	const [rsvpNotice, setRsvpNotice] = useState<{ ok: boolean; text: string } | null>(
		null,
	);
	const [messageNotice, setMessageNotice] = useState<{
		ok: boolean;
		text: string;
	} | null>(null);
	const audioRef = useRef<HTMLAudioElement>(null);
	const countdown = useCountdown(event.date);

	useEffect(() => {
		if (guestRsvpJumlah && guestRsvpJumlah > 0) {
			setJumlah(guestRsvpJumlah);
		}
	}, [guestRsvpJumlah]);

	const bride = wedding?.namaPanggilanBride || "Bride";
	const groom = wedding?.namaPanggilanGroom || "Groom";
	const coverUrl = getImageUrl(photos.cover?.pathImage || photos.opening?.pathImage);
	const sideUrl = getImageUrl(photos.background?.pathImage || photos.opening?.pathImage);
	const gallery = photos.gallery.slice(0, flags.maxGaleriFoto || 8);
	const calendarUrl = toGoogleCalendarUrl(
		event.name || `The Wedding of ${bride} & ${groom}`,
		event.date,
		locations[0]?.alamat,
	);
	const prewedding = youtubeEmbedUrl(wedding?.urlVideoPrewedding);
	const streaming = youtubeEmbedUrl(wedding?.urlVideoStreaming);

	const publishedMessages = useMemo(
		() => messages.filter((row) => row.published !== 0),
		[messages],
	);

	const openInvitation = async (): Promise<void> => {
		setOpened(true);
		if (audioRef.current && event.music_url) {
			try {
				await audioRef.current.play();
				setPlaying(true);
			} catch {
				setPlaying(false);
			}
		}
	};

	const toggleMusic = async (): Promise<void> => {
		if (!audioRef.current) return;
		if (playing) {
			audioRef.current.pause();
			setPlaying(false);
			return;
		}
		try {
			await audioRef.current.play();
			setPlaying(true);
		} catch {
			setPlaying(false);
		}
	};

	const copyGift = async (id: number, nomor: string): Promise<void> => {
		try {
			await navigator.clipboard.writeText(nomor);
			setCopiedId(id);
			window.setTimeout(() => setCopiedId(null), 1800);
		} catch {
			setCopiedId(null);
		}
	};

	const handleRsvp = async (kehadiran: 1 | 2): Promise<void> => {
		if (!onRsvp || mode === "preview") return;
		setRsvpBusy(true);
		setRsvpNotice(null);
		try {
			await onRsvp({
				kehadiran,
				jumlahKehadiran: kehadiran === 1 ? Number(jumlah) || 1 : 0,
			});
			setRsvpNotice({
				ok: true,
				text:
					kehadiran === 1
						? "Terima kasih, kehadiran Anda sudah tercatat."
						: "Terima kasih, konfirmasi tidak hadir sudah tercatat.",
			});
		} catch (err) {
			setRsvpNotice({
				ok: false,
				text: getApiErrorMessage(err, "Gagal menyimpan RSVP"),
			});
		} finally {
			setRsvpBusy(false);
		}
	};

	const handleMessage = async (): Promise<void> => {
		if (!onSendMessage || !ucapan.trim() || mode === "preview") return;
		setMessageBusy(true);
		setMessageNotice(null);
		try {
			await onSendMessage(ucapan.trim());
			setUcapan("");
			setMessageNotice({
				ok: true,
				text: "Ucapan Anda berhasil dikirim.",
			});
		} catch (err) {
			setMessageNotice({
				ok: false,
				text: getApiErrorMessage(err, "Gagal mengirim ucapan"),
			});
		} finally {
			setMessageBusy(false);
		}
	};

	return (
		<div className={`cit-root ${opened ? "cit-opened" : "cit-locked"}`}>
			{mode === "preview" && <div className="cit-preview-badge">Preview TSX</div>}

			{event.music_url && (
				<audio ref={audioRef} src={event.music_url} loop preload="auto" />
			)}

			<section
				className="cit-cover"
				style={coverUrl ? { backgroundImage: `url("${coverUrl}")` } : undefined}
			>
				<div className="cit-cover-inner">
					<p className="cit-kicker">The Wedding Of</p>
					<p className="cit-guest">Kepada Yth. {guestName}</p>
					<h1>
						{bride}
						<span className="cit-amp">&amp;</span>
						{groom}
					</h1>
					<p>{formatShortDate(event.date)}</p>
					<button type="button" className="cit-open-btn" onClick={openInvitation}>
						Buka Undangan
					</button>
				</div>
			</section>

			<div className="cit-shell">
				<aside
					className="cit-side"
					style={sideUrl ? { backgroundImage: `url("${sideUrl}")` } : undefined}
				/>
				<main className="cit-main">
					<section className="cit-section">
						<p className="cit-kicker" style={{ color: "#8a7347" }}>
							Undangan Pernikahan
						</p>
						<h2 className="cit-section-title cit-names">
							{bride} &amp; {groom}
						</h2>
						<div className="cit-ornament" />
						<p className="cit-lead">
							{wedding?.openingText || "Dengan hormat mengundang Anda hadir dalam hari bahagia kami."}
						</p>
						<p className="cit-body" style={{ marginTop: "1rem" }}>
							{event.name}
							<br />
							{formatLongDate(event.date)}
						</p>
						{event.dresscode && (
							<p className="cit-note">Dress code: {event.dresscode}</p>
						)}
					</section>

					{wedding?.quote && (
						<section
							className="cit-section"
							style={
								photos.quote
									? {
											backgroundImage: `linear-gradient(rgba(247,241,230,0.92), rgba(247,241,230,0.92)), url("${getImageUrl(photos.quote.pathImage)}")`,
											backgroundSize: "cover",
											backgroundPosition: "center",
										}
									: undefined
							}
						>
							<p className="cit-kicker" style={{ color: "#8a7347" }}>
								Quote
							</p>
							<p className="cit-quote">{wedding.quote}</p>
						</section>
					)}

					<section className="cit-section">
						<p className="cit-kicker" style={{ color: "#8a7347" }}>
							Mempelai
						</p>
						<h2 className="cit-section-title">The Bride &amp; The Groom</h2>
						<div className="cit-ornament" />
						<div className="cit-couple">
							<article className="cit-person">
								{flags.fotoProfil && photos.profilBride && (
									<img src={getImageUrl(photos.profilBride.pathImage)} alt={bride} />
								)}
								<p className="cit-kicker" style={{ color: "#8a7347" }}>
									The Bride
								</p>
								<h3>{wedding?.namaLengkapBride || bride}</h3>
								<p className="cit-body">{wedding?.bioBride}</p>
								{flags.socialMedia && wedding?.sosmedBride && (
									<p>
										<a href={wedding.sosmedBride} target="_blank" rel="noreferrer">
											Sosial media
										</a>
									</p>
								)}
							</article>
							<article className="cit-person">
								{flags.fotoProfil && photos.profilGroom && (
									<img src={getImageUrl(photos.profilGroom.pathImage)} alt={groom} />
								)}
								<p className="cit-kicker" style={{ color: "#8a7347" }}>
									The Groom
								</p>
								<h3>{wedding?.namaLengkapGroom || groom}</h3>
								<p className="cit-body">{wedding?.bioGroom}</p>
								{flags.socialMedia && wedding?.sosmedGroom && (
									<p>
										<a href={wedding.sosmedGroom} target="_blank" rel="noreferrer">
											Sosial media
										</a>
									</p>
								)}
							</article>
						</div>
					</section>

					{flags.loveStory && wedding?.loveStory && (
						<section className="cit-section">
							<p className="cit-kicker" style={{ color: "#8a7347" }}>
								Our Story
							</p>
							<h2 className="cit-section-title">Love Story</h2>
							<div className="cit-ornament" />
							<p className="cit-body">{wedding.loveStory}</p>
						</section>
					)}

					{locations.length > 0 && (
						<section className="cit-section">
							<p className="cit-kicker" style={{ color: "#8a7347" }}>
								Save The Date
							</p>
							<h2 className="cit-section-title">Waktu &amp; Tempat</h2>
							<div className="cit-ornament" />
							{locations.map((loc) => (
								<article key={loc.id} className="cit-card">
									<h4>{loc.name}</h4>
									<p>{formatLongDate(loc.date)}</p>
									<p>
										{formatTime(loc.startTime)}
										{loc.endTime ? ` — ${formatTime(loc.endTime)}` : ""} WIB
									</p>
									<p>
										<strong>{loc.location}</strong>
									</p>
									<p>{loc.alamat}</p>
									{loc.urlMaps && (
										<p style={{ marginTop: "0.8rem" }}>
											<a className="cit-btn" href={loc.urlMaps} target="_blank" rel="noreferrer">
												Lihat Lokasi
											</a>
										</p>
									)}
								</article>
							))}
							{flags.addToCalendar && calendarUrl && (
								<a className="cit-btn-ghost" href={calendarUrl} target="_blank" rel="noreferrer">
									Tambah ke Kalender
								</a>
							)}
						</section>
					)}

					<section className="cit-section">
						<p className="cit-kicker" style={{ color: "#8a7347" }}>
							Countdown
						</p>
						<h2 className="cit-section-title">Menuju Hari Bahagia</h2>
						<div className="cit-countdown">
							<div className="cit-count-box">
								<strong>{countdown.days}</strong>
								<span>Hari</span>
							</div>
							<div className="cit-count-box">
								<strong>{countdown.hours}</strong>
								<span>Jam</span>
							</div>
							<div className="cit-count-box">
								<strong>{countdown.minutes}</strong>
								<span>Menit</span>
							</div>
							<div className="cit-count-box">
								<strong>{countdown.seconds}</strong>
								<span>Detik</span>
							</div>
						</div>
					</section>

					{gallery.length > 0 && (
						<section className="cit-section">
							<p className="cit-kicker" style={{ color: "#8a7347" }}>
								Gallery
							</p>
							<h2 className="cit-section-title">Momen Kami</h2>
							<div className="cit-ornament" />
							<div className="cit-gallery">
								{gallery.map((photo) => (
									<img
										key={photo.id}
										src={getImageUrl(photo.pathImage)}
										alt={photo.name || "Gallery"}
									/>
								))}
							</div>
						</section>
					)}

					{flags.video && (prewedding || streaming) && (
						<section className="cit-section">
							<p className="cit-kicker" style={{ color: "#8a7347" }}>
								Video
							</p>
							<h2 className="cit-section-title">Tonton Kisah Kami</h2>
							{prewedding && (
								<iframe className="cit-video" title="Prewedding" src={prewedding} allowFullScreen />
							)}
							{streaming && (
								<iframe className="cit-video" title="Streaming" src={streaming} allowFullScreen />
							)}
						</section>
					)}

					{gifts.length > 0 && (
						<section className="cit-section">
							<p className="cit-kicker" style={{ color: "#8a7347" }}>
								Wedding Gift
							</p>
							<h2 className="cit-section-title">Amplop Digital</h2>
							<div className="cit-ornament" />
							{gifts.map((gift) => (
								<article key={gift.id} className="cit-card">
									<h4>{gift.name}</h4>
									<p>{gift.provider}</p>
									<p className="cit-gift-num">{gift.nomor}</p>
									<button
										type="button"
										className="cit-btn"
										onClick={() => copyGift(gift.id, gift.nomor)}
									>
										{copiedId === gift.id ? "Tersalin" : "Salin Nomor"}
									</button>
								</article>
							))}
						</section>
					)}

					{flags.rsvp && (
						<section className="cit-section">
							<p className="cit-kicker" style={{ color: "#8a7347" }}>
								RSVP
							</p>
							<h2 className="cit-section-title">Konfirmasi Kehadiran</h2>
							<div className="cit-ornament" />
							<p className="cit-body">
								Untuk {guestName}. Status: {rsvpStatusLabel(guestRsvpStatus)}
								{guestRsvpStatus === "accepted" && guestRsvpJumlah
									? ` (${guestRsvpJumlah} orang)`
									: ""}
							</p>
							<div className="cit-form">
								<label htmlFor="cit-jumlah">Jumlah orang yang hadir</label>
								<input
									id="cit-jumlah"
									type="number"
									min={1}
									max={50}
									value={jumlah}
									onChange={(e) => setJumlah(Number(e.target.value) || 1)}
									disabled={mode === "preview"}
								/>
								<div className="cit-actions">
									<button
										type="button"
										className="cit-btn"
										disabled={rsvpBusy || mode === "preview"}
										onClick={() => handleRsvp(1)}
									>
										Hadir
									</button>
									<button
										type="button"
										className="cit-btn-ghost"
										disabled={rsvpBusy || mode === "preview"}
										onClick={() => handleRsvp(2)}
									>
										Tidak Hadir
									</button>
								</div>
							</div>
							{rsvpNotice && (
								<p
									className={`cit-feedback ${rsvpNotice.ok ? "cit-feedback-ok" : "cit-feedback-err"}`}
								>
									{rsvpNotice.text}
								</p>
							)}
							{mode === "preview" && (
								<p className="cit-note">Mode preview: RSVP tidak dikirim.</p>
							)}
						</section>
					)}

					<section className="cit-section">
						<p className="cit-kicker" style={{ color: "#8a7347" }}>
							Wishes
						</p>
						<h2 className="cit-section-title">Ucapan &amp; Doa</h2>
						<div className="cit-ornament" />
						<div className="cit-form">
							<label htmlFor="cit-ucapan">Tulis ucapan sebagai {guestName}</label>
							<textarea
								id="cit-ucapan"
								rows={3}
								maxLength={255}
								value={ucapan}
								onChange={(e) => setUcapan(e.target.value)}
								placeholder="Tulis ucapan untuk mempelai..."
								disabled={mode === "preview"}
							/>
							<button
								type="button"
								className="cit-btn"
								disabled={messageBusy || mode === "preview" || !ucapan.trim()}
								onClick={handleMessage}
							>
								Kirim Ucapan
							</button>
						</div>
						{messageNotice && (
							<p
								className={`cit-feedback ${messageNotice.ok ? "cit-feedback-ok" : "cit-feedback-err"}`}
							>
								{messageNotice.text}
							</p>
						)}
						{mode === "preview" && (
							<p className="cit-note">Mode preview: ucapan tidak dikirim.</p>
						)}
						{publishedMessages.length > 0 && (
							<div className="cit-message-list">
								{publishedMessages.map((row) => (
									<article
										key={row.id}
										className={`cit-message ${guestId && row.guestId === guestId ? "cit-message-own" : ""}`}
									>
										<strong>
											{row.guestName}
											{guestId && row.guestId === guestId ? " (Anda)" : ""}
										</strong>
										<p>{row.message}</p>
									</article>
								))}
							</div>
						)}
					</section>

					<section
						className="cit-section"
						style={
							photos.akhir
								? {
										backgroundImage: `linear-gradient(rgba(27,36,28,0.72), rgba(27,36,28,0.86)), url("${getImageUrl(photos.akhir.pathImage)}")`,
										backgroundSize: "cover",
										backgroundPosition: "center",
										color: "#fffaf3",
									}
								: { background: "#1b241c", color: "#fffaf3" }
						}
					>
						<p className="cit-kicker">Terima kasih</p>
						<h2 className="cit-section-title" style={{ color: "#fffaf3" }}>
							{bride} &amp; {groom}
						</h2>
						<p>Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Anda berkenan hadir.</p>
					</section>
				</main>
			</div>

			{event.music_url && opened && (
				<button
					type="button"
					className="cit-music"
					onClick={toggleMusic}
					aria-label={playing ? "Pause musik" : "Putar musik"}
				>
					{playing ? "II" : "♪"}
				</button>
			)}
		</div>
	);
};

export default ClassicInvitationTemplate;
