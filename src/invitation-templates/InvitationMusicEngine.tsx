import React from "react";
import "./InvitationMusicEngine.css";

type InvitationMusicEngineProps = {
	kind: "audio" | "youtube";
	musicUrl: string;
	youtubeEmbed: string;
	playing: boolean;
	keepMounted?: boolean;
	audioRef: React.RefObject<HTMLAudioElement | null>;
	youtubeRef?: React.RefObject<HTMLIFrameElement | null>;
	onMusicError: () => void;
};

const InvitationMusicEngine: React.FC<InvitationMusicEngineProps> = ({
	kind,
	musicUrl,
	youtubeEmbed,
	playing,
	keepMounted = false,
	audioRef,
	youtubeRef,
	onMusicError,
}) => {
	if (kind === "youtube") {
		if (!youtubeEmbed || (!playing && !keepMounted)) {
			return null;
		}
		return (
			<iframe
				ref={youtubeRef}
				className="invitation-music-frame"
				title="Musik undangan"
				src={youtubeEmbed}
				allow="autoplay; encrypted-media"
				onLoad={(event) => {
					event.currentTarget.contentWindow?.postMessage(
						JSON.stringify({ event: "listening", id: 1 }),
						"*",
					);
				}}
			/>
		);
	}

	if (!musicUrl) {
		return null;
	}

	return (
		<audio
			key={musicUrl}
			ref={audioRef}
			src={musicUrl}
			loop
			preload="auto"
			playsInline
			onError={onMusicError}
		/>
	);
};

export default InvitationMusicEngine;
