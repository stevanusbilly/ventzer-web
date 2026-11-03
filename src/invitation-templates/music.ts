import { useEffect, useRef, useState } from "react";
import { getImageUrl } from "./classic-tsx/utils";

export const DEFAULT_INVITATION_MUSIC = "/music/default.wav";

type InvitationMode = "preview" | "live";

type EventMusicFields = {
	music_url?: string | null;
	musicUrl?: string | null;
	autoplay_music?: number | null;
	autoplayMusic?: number | null;
};

export type InvitationMusicKind = "audio" | "youtube";

export type ResolvedInvitationMusic = {
	kind: InvitationMusicKind;
	src: string;
	isCustom: boolean;
};

const YOUTUBE_ID =
	/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/)|youtube-nocookie\.com\/embed\/)([A-Za-z0-9_-]{6,})/;

const normalizeMusicInput = (raw?: string | null): string => {
	const value = String(raw || "").trim();
	if (!value) {
		return "";
	}
	if (value.startsWith("//")) {
		return `https:${value}`;
	}
	if (/^https?:\/\//i.test(value) || value.startsWith("blob:") || value.startsWith("data:")) {
		return value;
	}
	if (value.startsWith("www.")) {
		return `https://${value}`;
	}
	return getImageUrl(value);
};

export const getYoutubeVideoId = (url?: string | null): string => {
	const match = String(url || "").match(YOUTUBE_ID);
	return match?.[1] || "";
};

export const resolveInvitationMusic = (
	event?: EventMusicFields | null,
): ResolvedInvitationMusic => {
	const raw = String(event?.music_url || event?.musicUrl || "").trim();
	if (!raw) {
		return { kind: "audio", src: DEFAULT_INVITATION_MUSIC, isCustom: false };
	}

	const src = normalizeMusicInput(raw);
	const youtubeId = getYoutubeVideoId(src) || getYoutubeVideoId(raw);
	if (youtubeId) {
		return { kind: "youtube", src: youtubeId, isCustom: true };
	}
	return { kind: "audio", src, isCustom: true };
};

export const getYoutubeMusicEmbed = (videoId: string): string => {
	const params = new URLSearchParams({
		autoplay: "1",
		loop: "1",
		playlist: videoId,
		controls: "0",
		disablekb: "1",
		fs: "0",
		modestbranding: "1",
		playsinline: "1",
		rel: "0",
	});
	return `https://www.youtube-nocookie.com/embed/${videoId}?${params.toString()}`;
};

export const shouldAutoplayMusic = (event?: EventMusicFields | null): boolean => {
	const flag = event?.autoplay_music ?? event?.autoplayMusic;
	return Number(flag) !== 0;
};

export const useInvitationMusic = (
	event?: EventMusicFields | null,
	mode: InvitationMode = "preview",
) => {
	const audioRef = useRef<HTMLAudioElement>(null);
	const [playing, setPlaying] = useState(false);
	const [resolved, setResolved] = useState(() => resolveInvitationMusic(event));

	useEffect(() => {
		setResolved(resolveInvitationMusic(event));
		setPlaying(false);
	}, [event?.music_url, event?.musicUrl]);

	const play = async (): Promise<void> => {
		if (resolved.kind === "youtube") {
			setPlaying(true);
			return;
		}
		const node = audioRef.current;
		if (!node || !resolved.src) {
			return;
		}
		try {
			await node.play();
			setPlaying(true);
		} catch {
			setPlaying(false);
		}
	};

	const startMusic = async (): Promise<void> => {
		if (mode === "live" && !shouldAutoplayMusic(event)) {
			return;
		}
		await play();
	};

	const toggleMusic = async (): Promise<void> => {
		if (resolved.kind === "youtube") {
			setPlaying((current) => !current);
			return;
		}
		const node = audioRef.current;
		if (!node) {
			return;
		}
		if (!node.paused && playing) {
			node.pause();
			setPlaying(false);
			return;
		}
		await play();
	};

	return {
		audioRef,
		kind: resolved.kind,
		musicUrl: resolved.src,
		youtubeEmbed: resolved.kind === "youtube" ? getYoutubeMusicEmbed(resolved.src) : "",
		playing,
		showControl: Boolean(resolved.src),
		startMusic,
		toggleMusic,
		onMusicError: () => {
			setPlaying(false);
		},
	};
};
