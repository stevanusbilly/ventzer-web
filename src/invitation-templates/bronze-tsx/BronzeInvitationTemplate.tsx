import React, { useEffect, useMemo, useState } from "react";
import { BronzeInvitationProps } from "./types";
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
import "./BronzeInvitationTemplate.css";

const SectionHead: React.FC<{ kicker: string; title: string; light?: boolean }> = ({
	kicker,
	title,
	light,
}) => (
	<header className={`bit-head ${light ? "bit-head-light" : ""}`}>
		<p className="bit-kicker">{kicker}</p>
		<h2 className="bit-section-title">{title}</h2>
		<InvitationFlourish className="bit-flourish" />
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

const BronzeInvitationTemplate: React.FC<BronzeInvitationProps> = ({
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
	const [kehadiran, setKehadiran] = useState<1 | 2>(
		guestRsvpStatus === "declined" ? 2 : 1,
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
	const [galleryIndex, setGalleryIndex] = useState(0);
	const [messagesExpanded, setMessagesExpanded] = useState(false);
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

	const bride = wedding?.namaPanggilanBride || "Bride";
	const groom = wedding?.namaPanggilanGroom || "Groom";
	const couple = `${bride} & ${groom}`;
	const monogram = `${bride.charAt(0).toUpperCase()} · ${groom.charAt(0).toUpperCase()}`;
	const coverUrl = getImageUrl(photos.cover?.pathImage || photos.opening?.pathImage);
	const sideUrl = getImageUrl(photos.background?.pathImage || photos.opening?.pathImage);
	const openingUrl = getImageUrl(photos.opening?.pathImage || photos.cover?.pathImage);
	const gallery = photos.gallery.slice(0, flags.maxGaleriFoto || 8);
	const featured = gallery[galleryIndex] || gallery[0];
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

	useEffect(() => {
		if (guestRsvpJumlah && guestRsvpJumlah > 0) {
			setJumlah(Math.min(maxGuestCount, guestRsvpJumlah));
		}
		if (guestRsvpStatus === "accepted") {
			setKehadiran(1);
		} else if (guestRsvpStatus === "declined") {
			setKehadiran(2);
		}
	}, [guestRsvpJumlah, guestRsvpStatus, maxGuestCount]);

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

	const handleRsvp = async (): Promise<void> => {
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
		<div className={`bit-root ${opened ? "bit-opened" : "bit-locked"}`}>
			{mode === "preview" && <div className="bit-preview-badge">Forest Bronze</div>}

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
				className="bit-cover"
				style={coverUrl ? { backgroundImage: `url("${coverUrl}")` } : undefined}
				onClick={openInvitation}
			>
				<div className="bit-cover-inner">
					<div className="bit-cover-frame">
						<span className="bit-monogram">{monogram}</span>
						<p className="bit-kicker">The Wedding Celebration</p>
						<h1>
							{bride}
							<span className="bit-amp">&amp;</span>
							{groom}
						</h1>
						<InvitationFlourish className="bit-flourish bit-flourish-light" />
						<p className="bit-cover-date">{dotDate}</p>
						<div className="bit-guest-plaque">
							<p className="bit-guest">Kepada Yth. Bapak/Ibu/Saudara/i</p>
							<p className="bit-guest-name">{guestName}</p>
						</div>
						<button type="button" className="bit-open-btn" onClick={openInvitation}>
							Buka Undangan
						</button>
					</div>
				</div>
			</section>

			<div className="bit-shell">
				<aside
					className="bit-side"
					style={sideUrl ? { backgroundImage: `url("${sideUrl}")` } : undefined}
				>
					<p className="bit-scroll-hint">
						<span>↓</span>
						Scroll Kebawah
					</p>
					<div className="bit-side-copy">
						<span className="bit-monogram">{monogram}</span>
						<p className="bit-side-kicker">The Wedding of</p>
						<p className="bit-side-names">{couple}</p>
						<p className="bit-side-date">{dotDate}</p>
					</div>
				</aside>

				<main className="bit-main">
					<section
						className="bit-opening"
						style={openingUrl ? { backgroundImage: `url("${openingUrl}")` } : undefined}
					>
						<div className="bit-opening-inner">
							<p className="bit-scroll-hint bit-scroll-mobile">
								<span>↓</span>
								Scroll Kebawah
							</p>
							<p className="bit-kicker">The Wedding of</p>
							<p className="bit-opening-names">{couple}</p>
							<InvitationFlourish className="bit-flourish bit-flourish-light" />
							<p className="bit-opening-date">{dotDate}</p>
							<p className="bit-opening-lead">
								{wedding?.openingText ||
									"Dengan memohon rahmat dan ridho Tuhan Yang Maha Esa, kami mengundang Bapak/Ibu/Saudara/i hadir dalam hari bahagia kami."}
							</p>
							{event.dresscode && (
								<span className="bit-chip">Dress code · {event.dresscode}</span>
							)}
						</div>
					</section>

					{wedding?.quote && (
						<section className="bit-section bit-section-forest">
							<div className="bit-quote-frame">
								<span className="bit-monogram">{monogram}</span>
								<p className="bit-quote">“{wedding.quote}”</p>
								<InvitationFlourish className="bit-flourish" />
							</div>
						</section>
					)}

					<section className="bit-section bit-section-forest-alt">
						<SectionHead kicker="The Beloved Couple" title="Mempelai" />
						<div className="bit-couple">
							<article className="bit-person-card">
								<p className="bit-kicker bit-kicker-dark">The Bride</p>
								{flags.fotoProfil && photos.profilBride && (
									<div className="bit-portrait-arch">
										<img src={getImageUrl(photos.profilBride.pathImage)} alt={bride} />
									</div>
								)}
								<h3>{wedding?.namaLengkapBride || bride}</h3>
								<p>{wedding?.bioBride}</p>
								{flags.socialMedia && wedding?.sosmedBride && (
									<a
										className="bit-social"
										href={wedding.sosmedBride}
										target="_blank"
										rel="noreferrer"
									>
										<i className="pi pi-instagram" aria-hidden="true" />
										<span>Instagram</span>
									</a>
								)}
							</article>
							<span className="bit-couple-and" aria-hidden="true">
								&amp;
							</span>
							<article className="bit-person-card">
								<p className="bit-kicker bit-kicker-dark">The Groom</p>
								{flags.fotoProfil && photos.profilGroom && (
									<div className="bit-portrait-arch">
										<img src={getImageUrl(photos.profilGroom.pathImage)} alt={groom} />
									</div>
								)}
								<h3>{wedding?.namaLengkapGroom || groom}</h3>
								<p>{wedding?.bioGroom}</p>
								{flags.socialMedia && wedding?.sosmedGroom && (
									<a
										className="bit-social"
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
						<section className="bit-section bit-section-moss">
							<SectionHead kicker="Save The Date" title="Rangkaian Acara" />
							<p className="bit-date-banner">{formatLongDate(event.date)}</p>
							<div className="bit-loc-grid">
								{locations.map((loc) => (
									<article key={loc.id} className="bit-loc-item">
										<span className="bit-loc-tag">{loc.name}</span>
										<p className="bit-loc-time">
											{formatTime(loc.startTime)}
											{loc.endTime ? ` – ${formatTime(loc.endTime)}` : ""} WIB
										</p>
										<p className="bit-loc-date">{formatLongDate(loc.date)}</p>
										<div className="bit-loc-divider" />
										<div className="bit-loc-card">
											<h3>{loc.location}</h3>
											<p>{loc.alamat}</p>
										</div>
										{loc.urlMaps && (
											<a className="bit-btn" href={loc.urlMaps} target="_blank" rel="noreferrer">
												<i className="pi pi-map-marker" aria-hidden="true" />
												<span>Lihat Lokasi</span>
											</a>
										)}
									</article>
								))}
							</div>
							{flags.addToCalendar && calendarUrl && (
								<p className="bit-calendar-wrap">
									<a className="bit-btn-ghost" href={calendarUrl} target="_blank" rel="noreferrer">
										<i className="pi pi-calendar-plus" aria-hidden="true" />
										<span>Simpan ke Kalender</span>
									</a>
								</p>
							)}
						</section>
					)}

					<section className="bit-section bit-section-soft">
						<SectionHead kicker="Counting Down" title="Menuju Hari Bahagia" />
						<div className="bit-countdown">
							<div className="bit-count-box">
								<strong>{countdown.days}</strong>
								<span>Hari</span>
							</div>
							<div className="bit-count-box">
								<strong>{countdown.hours}</strong>
								<span>Jam</span>
							</div>
							<div className="bit-count-box">
								<strong>{countdown.minutes}</strong>
								<span>Menit</span>
							</div>
							<div className="bit-count-box">
								<strong>{countdown.seconds}</strong>
								<span>Detik</span>
							</div>
						</div>
						{featured && (
							<div className="bit-gallery-shell">
								<div
									className="bit-gallery-main"
									style={{ backgroundImage: `url("${getImageUrl(featured.pathImage)}")` }}
								/>
								{gallery.length > 1 && (
									<div className="bit-gallery-thumbs">
										{gallery.map((photo, index) => (
											<button
												key={photo.id}
												type="button"
												className={index === galleryIndex ? "bit-active" : undefined}
												style={{ backgroundImage: `url("${getImageUrl(photo.pathImage)}")` }}
												onClick={() => setGalleryIndex(index)}
												aria-label={photo.name || `Foto ${index + 1}`}
											/>
										))}
									</div>
								)}
							</div>
						)}
					</section>

					{flags.video && (prewedding || streaming) && (
						<section className="bit-section bit-section-moss">
							<SectionHead kicker="Motion Picture" title="Kisah dalam Layar" />
							<div className="bit-video-stack">
								{prewedding && (
									<iframe className="bit-video" title="Prewedding" src={prewedding} allowFullScreen />
								)}
								{streaming && (
									<iframe className="bit-video" title="Streaming" src={streaming} allowFullScreen />
								)}
							</div>
						</section>
					)}

					{flags.rsvp && (
						<section className="bit-section bit-section-cream">
							<SectionHead kicker="RSVP" title="Konfirmasi Kehadiran" light />
							<p className="bit-lead-dark">
								Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila
								Bapak/Ibu/Saudara/i berkenan hadir untuk memberikan doa restu.
							</p>
							<div className="bit-paper">
								<div className="bit-form">
									<p className="bit-note bit-note-tight">
										Untuk <strong>{guestName}</strong> · Status:{" "}
										<strong>{rsvpStatusLabel(guestRsvpStatus)}</strong>
										{guestRsvpStatus === "accepted" && guestRsvpJumlah
											? ` (${guestRsvpJumlah} orang)`
											: ""}
									</p>
									<label htmlFor="bit-kehadiran">Kehadiran</label>
									<select
										id="bit-kehadiran"
										value={kehadiran}
										onChange={(e) => setKehadiran(Number(e.target.value) === 2 ? 2 : 1)}
										disabled={mode === "preview"}
									>
										<option value={1}>Hadir</option>
										<option value={2}>Tidak Hadir</option>
									</select>
									{kehadiran === 1 && (
										<>
											<label htmlFor="bit-jumlah">Jumlah Tamu</label>
											<input
												id="bit-jumlah"
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
										</>
									)}
									<div className="bit-actions">
										<button
											type="button"
											className="bit-btn bit-btn-dark"
											disabled={rsvpBusy || mode === "preview"}
											onClick={handleRsvp}
										>
											Konfirmasi Kehadiran
										</button>
									</div>
									{rsvpNotice && (
										<p
											className={`bit-feedback ${rsvpNotice.ok ? "bit-feedback-ok" : "bit-feedback-err"}`}
										>
											{rsvpNotice.text}
										</p>
									)}
									{mode === "preview" && (
										<p className="bit-note">Mode preview: RSVP tidak dikirim.</p>
									)}
								</div>
							</div>
						</section>
					)}

					{gifts.length > 0 && (
						<section className="bit-section bit-section-soft">
							<SectionHead kicker="Wedding Gift" title="Tanda Kasih" />
							<p className="bit-quote bit-quote-gap">
								Bagi keluarga dan sahabat yang ingin mengirimkan hadiah, silakan melalui rekening berikut:
							</p>
							<div className="bit-gift-grid">
								{gifts.map((gift) => (
									<article key={gift.id} className="bit-gift-card">
										<div className="bit-gift-top">
											<span className="bit-kicker bit-kicker-dark">{gift.provider}</span>
											<i className="pi pi-credit-card" aria-hidden="true" />
										</div>
										<p className="bit-gift-label">Nomor Rekening</p>
										<p className="bit-gift-num">{gift.nomor}</p>
										<h4>a.n. {gift.name}</h4>
										<button type="button" className="bit-btn bit-btn-dark" onClick={() => copyGift(gift.id, gift.nomor)}>
											<i className="pi pi-copy" aria-hidden="true" />
											<span>{copiedId === gift.id ? "Tersalin" : "Salin Nomor"}</span>
										</button>
									</article>
								))}
							</div>
						</section>
					)}

					<section className="bit-section bit-section-cream bit-section-wishes">
						<SectionHead kicker="Wishes & Prayers" title="Tinggalkan Pesan & Doa" light />
						<div className="bit-paper">
							<div className="bit-form">
								{alreadySent && mode === "live" ? (
									<p className="bit-note bit-note-tight">
										Ucapan Anda sudah terkirim. Setiap tamu hanya dapat mengirim satu ucapan.
									</p>
								) : (
									<>
										<label htmlFor="bit-ucapan">Tulis pesan sebagai {guestName}</label>
										<textarea
											id="bit-ucapan"
											rows={4}
											maxLength={255}
											value={ucapan}
											onChange={(e) => setUcapan(e.target.value)}
											placeholder="Tulis doa terbaik untuk kedua mempelai..."
											disabled={mode === "preview"}
										/>
										<div className="bit-actions">
											<button
												type="button"
												className="bit-btn bit-btn-dark"
												disabled={messageBusy || mode === "preview" || !ucapan.trim()}
												onClick={handleMessage}
											>
												Kirim Ucapan
											</button>
										</div>
									</>
								)}
								{messageNotice && (
									<p
										className={`bit-feedback ${messageNotice.ok ? "bit-feedback-ok" : "bit-feedback-err"}`}
									>
										{messageNotice.text}
									</p>
								)}
								{mode === "preview" && (
									<p className="bit-note">Mode preview: ucapan tidak dikirim.</p>
								)}
							</div>
						</div>
						{publishedMessages.length > 0 && (
							<>
								<div className={`bit-message-list ${messagesExpanded ? "bit-expanded" : ""}`}>
									{publishedMessages.map((row) => (
										<article
											key={row.id}
											className={`bit-message ${guestId && row.guestId === guestId ? "bit-message-own" : ""}`}
										>
											<strong>
												{row.guestName}
												{guestId && row.guestId === guestId ? " (Anda)" : ""}
											</strong>
											<p>{row.message}</p>
										</article>
									))}
								</div>
								{publishedMessages.length > 4 && !messagesExpanded && (
									<button
										type="button"
										className="bit-btn bit-btn-dark"
										onClick={() => setMessagesExpanded(true)}
									>
										Lihat lebih banyak
									</button>
								)}
							</>
						)}
					</section>

					<footer
						className="bit-footer"
						style={
							photos.akhir
								? {
										backgroundImage: `linear-gradient(180deg, rgba(20, 29, 22, 0.72), rgba(14, 21, 16, 0.92)), url("${getImageUrl(photos.akhir.pathImage)}")`,
									}
								: undefined
						}
					>
						<span className="bit-monogram">{monogram}</span>
						<p className="bit-footer-line">
							Two souls become one, two hearts beat as one
						</p>
						<p className="bit-footer-names">{couple}</p>
						<InvitationFlourish className="bit-flourish" />
						<p className="bit-footer-thanks">Thank you</p>
					</footer>
				</main>
			</div>

			{showControl && (
				<button
					type="button"
					className={`bit-music ${playing ? "is-playing" : ""}`}
					onClick={() => void toggleMusic()}
					aria-label={playing ? "Matikan musik" : "Nyalakan musik"}
				>
					<i className={playing ? "pi pi-volume-up" : "pi pi-volume-off"} />
				</button>
			)}
		</div>
	);
};

export default BronzeInvitationTemplate;
