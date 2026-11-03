import React, { useEffect, useMemo, useState } from "react";
import { BronzeInvitationProps } from "./types";
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
import "./BronzeInvitationTemplate.css";

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
		kind,
		musicUrl,
		youtubeEmbed,
		playing,
		showControl,
		startMusic,
		toggleMusic,
		onMusicError,
	} = useInvitationMusic(event, mode);
	const countdown = useCountdown(event.date);

	const bride = wedding?.namaPanggilanBride || "Bride";
	const groom = wedding?.namaPanggilanGroom || "Groom";
	const couple = `${bride} & ${groom}`;
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
			{mode === "preview" && <div className="bit-preview-badge">Preview Bronze TSX</div>}

			<InvitationMusicEngine
				kind={kind}
				musicUrl={musicUrl}
				youtubeEmbed={youtubeEmbed}
				playing={playing}
				audioRef={audioRef}
				onMusicError={onMusicError}
			/>

			<section
				className="bit-cover"
				style={coverUrl ? { backgroundImage: `url("${coverUrl}")` } : undefined}
				onClick={openInvitation}
			>
				<div className="bit-cover-inner">
					<p className="bit-guest">Dear, {guestName}</p>
					<p className="bit-invite-line">{wedding?.openingText || "You Are Invited!"}</p>
					<p className="bit-cover-kicker">The Wedding Celebration of</p>
					<h1>{couple}</h1>
					<button type="button" className="bit-open-btn" onClick={openInvitation}>
						Open Invitation
					</button>
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
					<p className="bit-side-copy">The Wedding of {couple}</p>
				</aside>

				<main className="bit-main">
					<section
						className="bit-opening"
						style={openingUrl ? { backgroundImage: `url("${openingUrl}")` } : undefined}
					>
						<div className="bit-opening-inner">
							<p>The Wedding of</p>
							<p className="bit-opening-names">{couple}</p>
							<div className="bit-rule" />
							<p>{formatShortDate(event.date)}</p>
						</div>
					</section>

					{wedding?.quote && (
						<section className="bit-section bit-section-forest">
							<p className="bit-quote">{wedding.quote}</p>
						</section>
					)}

					<section className="bit-section bit-section-forest-alt">
						<article className="bit-person-card">
							{flags.fotoProfil && photos.profilBride && (
								<img src={getImageUrl(photos.profilBride.pathImage)} alt={bride} />
							)}
							<h3>{wedding?.namaLengkapBride || bride}</h3>
							<p>{wedding?.bioBride}</p>
							{flags.socialMedia && wedding?.sosmedBride && (
								<p>
									<a href={wedding.sosmedBride} target="_blank" rel="noreferrer">
										Instagram
									</a>
								</p>
							)}
						</article>
						<article className="bit-person-card">
							{flags.fotoProfil && photos.profilGroom && (
								<img src={getImageUrl(photos.profilGroom.pathImage)} alt={groom} />
							)}
							<h3>{wedding?.namaLengkapGroom || groom}</h3>
							<p>{wedding?.bioGroom}</p>
							{flags.socialMedia && wedding?.sosmedGroom && (
								<p>
									<a href={wedding.sosmedGroom} target="_blank" rel="noreferrer">
										Instagram
									</a>
								</p>
							)}
						</article>
					</section>

					{flags.loveStory && wedding?.loveStory && (
						<section className="bit-section bit-section-moss">
							<p className="bit-loc-title">Love Story</p>
							<p className="bit-quote">{wedding.loveStory}</p>
						</section>
					)}

					{locations.length > 0 && (
						<section className="bit-section bit-section-moss">
							<div className="bit-loc-wrap">
								{locations.map((loc) => (
									<article key={loc.id}>
										<p className="bit-loc-title">{loc.name}</p>
										<div className="bit-loc-card">
											<h4>{formatLongDate(loc.date)}</h4>
											<p>
												{formatTime(loc.startTime)}
												{loc.endTime ? ` — ${formatTime(loc.endTime)}` : ""} WIB
											</p>
											<h3>{loc.location}</h3>
											<p>{loc.alamat}</p>
										</div>
										{loc.urlMaps && (
											<p>
												<a className="bit-btn" href={loc.urlMaps} target="_blank" rel="noreferrer">
													Lihat Lokasi
												</a>
											</p>
										)}
									</article>
								))}
							</div>
							{flags.addToCalendar && calendarUrl && (
								<p style={{ marginTop: "1.2rem" }}>
									<a className="bit-btn-ghost" href={calendarUrl} target="_blank" rel="noreferrer">
										Tambah ke Kalender
									</a>
								</p>
							)}
						</section>
					)}

					{gifts.length > 0 && (
						<section className="bit-section bit-section-soft">
							<p className="bit-loc-title">Amplop Online</p>
							<p className="bit-quote">
								Bagi keluarga dan sahabat yang ingin mengirimkan hadiah, silakan mengirimkannya melalui tautan berikut:
							</p>
							<div style={{ marginTop: "1.4rem" }}>
								{gifts.map((gift) => (
									<article key={gift.id} className="bit-gift-card">
										<p>
											{gift.name}
											<br />
											{gift.provider}
										</p>
										<div className="bit-rule" style={{ background: "#000", margin: "0.7rem auto" }} />
										<p className="bit-gift-num">{gift.nomor}</p>
										<button type="button" className="bit-btn" onClick={() => copyGift(gift.id, gift.nomor)}>
											{copiedId === gift.id ? "Tersalin" : "Copy"}
										</button>
									</article>
								))}
							</div>
						</section>
					)}

					<section className="bit-section bit-section-soft">
						<p className="bit-loc-title">Hari yang ditunggu</p>
						<div className="bit-countdown">
							<div className="bit-count-box">
								<strong>{countdown.days}</strong>
								<span>Day</span>
							</div>
							<div className="bit-count-box">
								<strong>{countdown.hours}</strong>
								<span>Hour</span>
							</div>
							<div className="bit-count-box">
								<strong>{countdown.minutes}</strong>
								<span>Min</span>
							</div>
							<div className="bit-count-box">
								<strong>{countdown.seconds}</strong>
								<span>Sec</span>
							</div>
						</div>
						{featured && (
							<>
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
							</>
						)}
					</section>

					{flags.video && (prewedding || streaming) && (
						<section className="bit-section bit-section-moss">
							<p className="bit-loc-title">Video</p>
							{prewedding && (
								<iframe className="bit-video" title="Prewedding" src={prewedding} allowFullScreen />
							)}
							{streaming && (
								<iframe className="bit-video" title="Streaming" src={streaming} allowFullScreen />
							)}
						</section>
					)}

					<section className="bit-section bit-section-cream">
						<p className="bit-section-title">Tinggalkan pesan/doa untuk kami</p>
						<div className="bit-form">
							{flags.rsvp && (
								<>
									<p className="bit-note" style={{ marginTop: 0 }}>
										Untuk {guestName}. Status: {rsvpStatusLabel(guestRsvpStatus)}
										{guestRsvpStatus === "accepted" && guestRsvpJumlah
											? ` (${guestRsvpJumlah} orang)`
											: ""}
									</p>
									<label htmlFor="bit-kehadiran">Kehadiran?</label>
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
											className="bit-btn"
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
								</>
							)}
							{alreadySent && mode === "live" ? (
								<p className="bit-note">
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
										placeholder="Tulis pesan"
										disabled={mode === "preview"}
									/>
									<div className="bit-actions">
										<button
											type="button"
											className="bit-btn"
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
						</div>
						{mode === "preview" && (
							<p className="bit-note">Mode preview: RSVP dan ucapan tidak dikirim.</p>
						)}
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
										className="bit-btn"
										style={{ marginTop: "1rem", background: "#282828", color: "#fff" }}
										onClick={() => setMessagesExpanded(true)}
									>
										Lihat lebih banyak
									</button>
								)}
							</>
						)}
					</section>

					<footer className="bit-footer">
						<p>Merupakan suatu kehormatan apabila Anda berkenan hadir.</p>
						<p>{couple}</p>
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
