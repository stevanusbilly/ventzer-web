import React, { useEffect, useMemo, useState } from "react";
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
import { useInvitationMusic } from "../music";
import InvitationMusicEngine from "../InvitationMusicEngine";
import InvitationFlourish from "../InvitationFlourish";
import LoveStoryTimeline from "../LoveStoryTimeline";
import "./ClassicInvitationTemplate.css";

const SectionHead: React.FC<{ kicker: string; title: string }> = ({ kicker, title }) => (
	<header className="cit-head">
		<p className="cit-kicker">{kicker}</p>
		<h2 className="cit-section-title">{title}</h2>
		<InvitationFlourish className="cit-flourish" />
	</header>
);

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
	guestMaxGuest,
	guestHasSentMessage = false,
	setting,
	mode = "preview",
	onRsvp,
	onSendMessage,
}) => {
	const flags = { ...defaultSetting, ...setting };
	const [opened, setOpened] = useState(false);
	const [copiedId, setCopiedId] = useState<number | null>(null);
	const maxGuestCount = Math.max(1, Number(guestMaxGuest) || 1);
	const [jumlah, setJumlah] = useState(
		Math.min(maxGuestCount, guestRsvpJumlah && guestRsvpJumlah > 0 ? guestRsvpJumlah : 1),
	);
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
	const {
		audioRef,
		youtubeRef,
		kind,
		musicUrl,
		youtubeEmbed,
		playing,
		keepMounted,
		showControl,
		startMusic,
		toggleMusic,
		onMusicError,
	} = useInvitationMusic(event, mode);
	const countdown = useCountdown(event.date);

	useEffect(() => {
		if (guestRsvpJumlah && guestRsvpJumlah > 0) {
			setJumlah(Math.min(maxGuestCount, guestRsvpJumlah));
		}
	}, [guestRsvpJumlah, maxGuestCount]);

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
		await startMusic();
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

	const alreadySent =
		guestHasSentMessage ||
		Boolean(guestId && publishedMessages.some((row) => row.guestId === guestId));

	const handleMessage = async (): Promise<void> => {
		if (!onSendMessage || !ucapan.trim() || mode === "preview" || alreadySent) return;
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

			<InvitationMusicEngine
				kind={kind}
				musicUrl={musicUrl}
				youtubeEmbed={youtubeEmbed}
				playing={playing}
				keepMounted={keepMounted}
				audioRef={audioRef}
				youtubeRef={youtubeRef}
				onMusicError={onMusicError}
			/>

			<section
				className="cit-cover"
				style={coverUrl ? { backgroundImage: `url("${coverUrl}")` } : undefined}
			>
				<div className="cit-cover-inner">
					<div className="cit-cover-frame">
						<p className="cit-kicker">The Wedding Of</p>
						<h1>
							{bride}
							<span className="cit-amp">&amp;</span>
							{groom}
						</h1>
						<InvitationFlourish className="cit-flourish cit-flourish-light" />
						<p className="cit-cover-date">{formatShortDate(event.date)}</p>
						<p className="cit-guest">Kepada Yth.</p>
						<p className="cit-guest-name">{guestName}</p>
						<button type="button" className="cit-open-btn" onClick={openInvitation}>
							Buka Undangan
						</button>
					</div>
				</div>
			</section>

			<div className="cit-shell">
				<aside
					className="cit-side"
					style={sideUrl ? { backgroundImage: `url("${sideUrl}")` } : undefined}
				/>
				<main className="cit-main">
					<section className="cit-section">
						<SectionHead kicker="Undangan Pernikahan" title={`${bride} & ${groom}`} />
						<p className="cit-lead">
							{wedding?.openingText || "Dengan hormat mengundang Anda hadir dalam hari bahagia kami."}
						</p>
						<p className="cit-body cit-body-gap">
							{event.name}
							<br />
							{formatLongDate(event.date)}
						</p>
						{event.dresscode && (
							<p className="cit-chip">Dress code · {event.dresscode}</p>
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
							<SectionHead kicker="Sebuah Ayat" title="Quote" />
							<p className="cit-quote">{wedding.quote}</p>
						</section>
					)}

					<section className="cit-section">
						<SectionHead kicker="Mempelai" title="The Bride & The Groom" />
						<div className="cit-couple">
							<article className="cit-person">
								{flags.fotoProfil && photos.profilBride && (
									<img src={getImageUrl(photos.profilBride.pathImage)} alt={bride} />
								)}
								<p className="cit-kicker">The Bride</p>
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
							<span className="cit-couple-and" aria-hidden="true">
								&amp;
							</span>
							<article className="cit-person">
								{flags.fotoProfil && photos.profilGroom && (
									<img src={getImageUrl(photos.profilGroom.pathImage)} alt={groom} />
								)}
								<p className="cit-kicker">The Groom</p>
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

					{flags.loveStory && (photos.loveStory || []).length > 0 && (
						<LoveStoryTimeline items={photos.loveStory} />
					)}

					{locations.length > 0 && (
						<section className="cit-section">
							<SectionHead kicker="Save The Date" title="Waktu & Tempat" />
							<div className="cit-loc-grid">
								{locations.map((loc) => (
									<article key={loc.id} className="cit-card">
										<p className="cit-kicker">{loc.name}</p>
										<h4>{loc.location}</h4>
										<ul className="cit-meta-list">
											<li>{formatLongDate(loc.date)}</li>
											<li>
												{formatTime(loc.startTime)}
												{loc.endTime ? ` — ${formatTime(loc.endTime)}` : ""} WIB
											</li>
											<li>{loc.alamat}</li>
										</ul>
										{loc.urlMaps && (
											<a className="cit-btn" href={loc.urlMaps} target="_blank" rel="noreferrer">
												Lihat Lokasi
											</a>
										)}
									</article>
								))}
							</div>
							{flags.addToCalendar && calendarUrl && (
								<a className="cit-btn-ghost" href={calendarUrl} target="_blank" rel="noreferrer">
									Tambah ke Kalender
								</a>
							)}
						</section>
					)}

					<section className="cit-section">
						<SectionHead kicker="Countdown" title="Menuju Hari Bahagia" />
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
							<SectionHead kicker="Gallery" title="Momen Kami" />
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
							<SectionHead kicker="Video" title="Tonton Kisah Kami" />
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
							<SectionHead kicker="Wedding Gift" title="Amplop Digital" />
							<div className="cit-loc-grid">
								{gifts.map((gift) => (
									<article key={gift.id} className="cit-card cit-gift-card">
										<p className="cit-kicker">{gift.provider}</p>
										<h4>{gift.name}</h4>
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
							</div>
						</section>
					)}

					{flags.rsvp && (
						<section className="cit-section">
							<SectionHead kicker="RSVP" title="Konfirmasi Kehadiran" />
							<div className="cit-paper">
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
									max={maxGuestCount}
									value={jumlah}
									onChange={(e) =>
										setJumlah(
											Math.min(
												maxGuestCount,
												Math.max(1, Number(e.target.value) || 1),
											),
										)
									}
									disabled={mode === "preview"}
									required
								/>
								<small>
									Maksimal {maxGuestCount} orang, termasuk Anda. Wajib diisi jika hadir.
								</small>
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
							</div>
						</section>
					)}

					<section className="cit-section">
						<SectionHead kicker="Wishes" title="Ucapan & Doa" />
						<div className="cit-paper">
						{alreadySent && mode === "live" ? (
							<p className="cit-note">
								Ucapan Anda sudah terkirim. Setiap tamu hanya dapat mengirim satu ucapan.
							</p>
						) : (
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
						)}
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
						</div>
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
						<p className="cit-kicker cit-kicker-light">Terima kasih</p>
						<h2 className="cit-section-title cit-title-light">
							{bride} &amp; {groom}
						</h2>
						<InvitationFlourish className="cit-flourish cit-flourish-light" />
						<p>Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Anda berkenan hadir.</p>
					</section>
				</main>
			</div>

			{showControl && (
				<button
					type="button"
					className={`cit-music ${playing ? "is-playing" : ""}`}
					onClick={() => void toggleMusic()}
					aria-label={playing ? "Matikan musik" : "Nyalakan musik"}
				>
					<i className={playing ? "pi pi-volume-up" : "pi pi-volume-off"} />
				</button>
			)}
		</div>
	);
};

export default ClassicInvitationTemplate;
