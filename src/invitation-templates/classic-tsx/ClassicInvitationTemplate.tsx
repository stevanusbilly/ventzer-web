import React, { useEffect, useMemo, useState } from "react";
import { ClassicInvitationProps } from "./types";
import { getApiErrorMessage } from "../../utils/apiError";
import {
	formatDotDate,
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

const SectionHead: React.FC<{ kicker: string; title: string; light?: boolean }> = ({
	kicker,
	title,
	light,
}) => (
	<header className={`cit-head ${light ? "cit-head-light" : ""}`}>
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
	const couple = `${bride} & ${groom}`;
	const monogram = `${bride.charAt(0).toUpperCase()} · ${groom.charAt(0).toUpperCase()}`;
	const coverUrl = getImageUrl(photos.cover?.pathImage || photos.opening?.pathImage);
	const sideUrl = getImageUrl(photos.background?.pathImage || photos.opening?.pathImage);
	const openingUrl = getImageUrl(photos.opening?.pathImage || photos.cover?.pathImage);
	const gallery = photos.gallery.slice(0, flags.maxGaleriFoto || 8);
	const calendarUrl = toGoogleCalendarUrl(
		event.name || `The Wedding of ${couple}`,
		event.date,
		locations[0]?.alamat,
	);
	const prewedding = youtubeEmbedUrl(wedding?.urlVideoPrewedding);
	const streaming = youtubeEmbedUrl(wedding?.urlVideoStreaming);
	const dotDate = formatDotDate(event.date) || formatShortDate(event.date);

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
			{mode === "preview" && <div className="cit-preview-badge">Classic Ivory</div>}

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
					<div className="cit-cover-arch">
						<span className="cit-monogram">{monogram}</span>
						<p className="cit-kicker cit-kicker-light">The Wedding Of</p>
						<h1>
							{bride}
							<span className="cit-amp">&amp;</span>
							{groom}
						</h1>
						<InvitationFlourish className="cit-flourish cit-flourish-light" />
						<p className="cit-cover-date">{dotDate}</p>
						<div className="cit-guest-plaque">
							<p className="cit-guest">Kepada Yth. Bapak/Ibu/Saudara/i</p>
							<p className="cit-guest-name">{guestName}</p>
						</div>
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
				>
					<div className="cit-side-inner">
						<span className="cit-monogram cit-monogram-light">{monogram}</span>
						<p className="cit-side-kicker">The Wedding of</p>
						<p className="cit-side-names">{couple}</p>
						<p className="cit-side-date">{dotDate}</p>
					</div>
				</aside>

				<main className="cit-main">
					<section
						className={`cit-hero ${openingUrl ? "has-photo" : ""}`}
						style={openingUrl ? { backgroundImage: `url("${openingUrl}")` } : undefined}
					>
						<div className="cit-hero-frame">
							<p className="cit-scroll-hint">
								<span>↓</span>
								Scroll Kebawah
							</p>
							<p className="cit-kicker">The Wedding of</p>
							<h2 className="cit-hero-names">{couple}</h2>
							<InvitationFlourish className="cit-flourish" />
							<p className="cit-hero-date">{dotDate}</p>
							<p className="cit-lead">
								{wedding?.openingText ||
									"Dengan memohon rahmat dan ridho Tuhan Yang Maha Esa, kami mengundang Bapak/Ibu/Saudara/i untuk hadir dalam hari bahagia kami."}
							</p>
							{event.dresscode && (
								<p className="cit-chip">Dress code · {event.dresscode}</p>
							)}
						</div>
					</section>

					{wedding?.quote && (
						<section
							className="cit-section cit-section-quote"
							style={
								photos.quote
									? {
											backgroundImage: `linear-gradient(rgba(251,247,239,0.92), rgba(246,238,224,0.94)), url("${getImageUrl(photos.quote.pathImage)}")`,
											backgroundSize: "cover",
											backgroundPosition: "center",
										}
									: undefined
							}
						>
							<div className="cit-quote-card">
								<span className="cit-monogram">{monogram}</span>
								<p className="cit-quote">“{wedding.quote}”</p>
								<InvitationFlourish className="cit-flourish" />
							</div>
						</section>
					)}

					<section className="cit-section">
						<SectionHead kicker="The Beloved Couple" title="Mempelai" />
						<div className="cit-couple">
							<article className="cit-person">
								{flags.fotoProfil && photos.profilBride && (
									<div className="cit-portrait-arch">
										<img src={getImageUrl(photos.profilBride.pathImage)} alt={bride} />
									</div>
								)}
								<p className="cit-kicker">The Bride</p>
								<h3>{wedding?.namaLengkapBride || bride}</h3>
								<p className="cit-body">{wedding?.bioBride}</p>
								{flags.socialMedia && wedding?.sosmedBride && (
									<a
										className="cit-social"
										href={wedding.sosmedBride}
										target="_blank"
										rel="noreferrer"
									>
										<i className="pi pi-instagram" aria-hidden="true" />
										<span>Instagram</span>
									</a>
								)}
							</article>
							<span className="cit-couple-and" aria-hidden="true">
								&amp;
							</span>
							<article className="cit-person">
								{flags.fotoProfil && photos.profilGroom && (
									<div className="cit-portrait-arch">
										<img src={getImageUrl(photos.profilGroom.pathImage)} alt={groom} />
									</div>
								)}
								<p className="cit-kicker">The Groom</p>
								<h3>{wedding?.namaLengkapGroom || groom}</h3>
								<p className="cit-body">{wedding?.bioGroom}</p>
								{flags.socialMedia && wedding?.sosmedGroom && (
									<a
										className="cit-social"
										href={wedding.sosmedGroom}
										target="_blank"
										rel="noreferrer"
									>
										<i className="pi pi-instagram" aria-hidden="true" />
										<span>Instagram</span>
									</a>
								)}
							</article>
						</div>
					</section>

					{flags.loveStory && (photos.loveStory || []).length > 0 && (
						<LoveStoryTimeline items={photos.loveStory} />
					)}

					{locations.length > 0 && (
						<section className="cit-section cit-section-warm">
							<SectionHead kicker="Save The Date" title="Rangkaian Acara" />
							<p className="cit-date-banner">{formatLongDate(event.date)}</p>
							<div className="cit-loc-grid">
								{locations.map((loc) => (
									<article key={loc.id} className="cit-card cit-loc-card">
										<span className="cit-loc-tag">{loc.name}</span>
										<p className="cit-loc-time">
											{formatTime(loc.startTime)}
											{loc.endTime ? ` – ${formatTime(loc.endTime)}` : ""} WIB
										</p>
										<p className="cit-loc-date">{formatLongDate(loc.date)}</p>
										<div className="cit-loc-divider" />
										<h4>{loc.location}</h4>
										<p className="cit-loc-address">{loc.alamat}</p>
										{loc.urlMaps && (
											<a className="cit-btn" href={loc.urlMaps} target="_blank" rel="noreferrer">
												<i className="pi pi-map-marker" aria-hidden="true" />
												<span>Lihat Lokasi</span>
											</a>
										)}
									</article>
								))}
							</div>
							{flags.addToCalendar && calendarUrl && (
								<a className="cit-btn-ghost" href={calendarUrl} target="_blank" rel="noreferrer">
									<i className="pi pi-calendar-plus" aria-hidden="true" />
									<span>Simpan ke Kalender</span>
								</a>
							)}
						</section>
					)}

					<section className="cit-section">
						<SectionHead kicker="Counting Down" title="Menuju Hari Bahagia" />
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
						<section className="cit-section cit-section-warm">
							<SectionHead kicker="Our Moments" title="Galeri" />
							<div className="cit-gallery">
								{gallery.map((photo) => (
									<figure key={photo.id} className="cit-gallery-item">
										<img
											src={getImageUrl(photo.pathImage)}
											alt={photo.name || "Gallery"}
										/>
									</figure>
								))}
							</div>
						</section>
					)}

					{flags.video && (prewedding || streaming) && (
						<section className="cit-section">
							<SectionHead kicker="Motion Picture" title="Kisah dalam Layar" />
							<div className="cit-video-stack">
								{prewedding && (
									<iframe className="cit-video" title="Prewedding" src={prewedding} allowFullScreen />
								)}
								{streaming && (
									<iframe className="cit-video" title="Streaming" src={streaming} allowFullScreen />
								)}
							</div>
						</section>
					)}

					{flags.rsvp && (
						<section className="cit-section cit-section-warm">
							<SectionHead kicker="RSVP" title="Konfirmasi Kehadiran" />
							<p className="cit-lead cit-lead-Space">
								Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila
								Bapak/Ibu/Saudara/i berkenan hadir untuk memberikan doa restu.
							</p>
							<div className="cit-paper">
								<p className="cit-body">
									Untuk <strong>{guestName}</strong> · Status:{" "}
									<strong>{rsvpStatusLabel(guestRsvpStatus)}</strong>
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

					{gifts.length > 0 && (
						<section className="cit-section">
							<SectionHead kicker="Wedding Gift" title="Tanda Kasih" />
							<p className="cit-lead cit-lead-Space">
								Bagi keluarga dan sahabat yang ingin mengirimkan tanda kasih, dapat
								melalui rekening berikut:
							</p>
							<div className="cit-loc-grid">
								{gifts.map((gift) => (
									<article key={gift.id} className="cit-card cit-gift-card">
										<div className="cit-gift-top">
											<span className="cit-kicker">{gift.provider}</span>
											<i className="pi pi-credit-card" aria-hidden="true" />
										</div>
										<p className="cit-gift-label">Nomor Rekening</p>
										<p className="cit-gift-num">{gift.nomor}</p>
										<h4>a.n. {gift.name}</h4>
										<button
											type="button"
											className="cit-btn"
											onClick={() => copyGift(gift.id, gift.nomor)}
										>
											<i className="pi pi-copy" aria-hidden="true" />
											<span>{copiedId === gift.id ? "Tersalin" : "Salin Nomor"}</span>
										</button>
									</article>
								))}
							</div>
						</section>
					)}

					<section className="cit-section cit-section-warm">
						<SectionHead kicker="Wishes & Prayers" title="Tinggalkan Pesan & Doa" />
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
										placeholder="Tulis doa terbaik untuk kedua mempelai..."
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

					<footer
						className="cit-closing"
						style={
							photos.akhir
								? {
										backgroundImage: `linear-gradient(180deg, rgba(31, 25, 19, 0.58), rgba(22, 18, 13, 0.88)), url("${getImageUrl(photos.akhir.pathImage)}")`,
									}
								: undefined
						}
					>
						<div className="cit-closing-inner">
							<span className="cit-monogram cit-monogram-light">{monogram}</span>
							<p className="cit-closing-line">
								Two souls become one, two hearts beat as one
							</p>
							<h2 className="cit-section-title cit-title-light">{couple}</h2>
							<InvitationFlourish className="cit-flourish cit-flourish-light" />
							<p className="cit-closing-thanks">Thank you</p>
						</div>
					</footer>
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
