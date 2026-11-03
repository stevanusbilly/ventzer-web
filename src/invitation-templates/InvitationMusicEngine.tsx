import React from "react";
import "./InvitationMusicEngine.css";

type InvitationMusicEngineProps = {
	kind: "audio" | "youtube";
	musicUrl: string;
	youtubeEmbed: string;
	playing: boolean;
	audioRef: React.RefObject<HTMLAudioElement | null>;
	onMusicError: () => void;
};

const InvitationMusicEngine: React.FC<InvitationMusicEngineProps> = ({
	kind,
	musicUrl,
	youtubeEmbed,
	playing,
	audioRef,
	onMusicError,
}) => {
	if (kind === "youtube") {
		if (!playing || !youtubeEmbed) {
			return null;
		}
		return (
			<iframe
				className="invitation-music-frame"
				title="Musik undangan"
				src={youtubeEmbed}
				allow="autoplay; encrypted-media"
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
