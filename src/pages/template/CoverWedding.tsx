import React, { useRef, useState } from 'react';
import './CoverWedding.css';
import LeftPage from './LeftPage';

type CoverWeddingProps = {
	backgroundUrl?: string;
	musicUrl?: string;

	// Data yang nanti berasal dari DB
	guestName: string;
	groomName: string;
	brideName: string;
};

export default function CoverWedding({
	backgroundUrl = '',
	musicUrl = '',

	guestName,
	groomName,
	brideName,
}: CoverWeddingProps) {
	const [opened, setOpened] = useState(false);
	const audioRef = useRef<HTMLAudioElement>(null);

	const handleOpen = async () => {
		setOpened(true);

		if (audioRef.current && musicUrl) {
			try {
				await audioRef.current.play();
			} catch (error) {
				console.warn('Music playback was blocked by the browser.', error);
			}
		}
	};

	return (
		<div className={`wedding-invitation ${opened ? 'opened' : ''}`}>
			{musicUrl && <audio ref={audioRef} src={musicUrl} loop preload='auto' />}

			{/* =========================
			    COVER
			    ========================= */}
			<section className='wedding-cover'>
				{/* Background dari parameter */}
				<div
					className='wedding-cover__background'
					style={{
						backgroundImage: backgroundUrl
							? `url("${backgroundUrl}")`
							: undefined,
					}}
				/>

				<div className='wedding-cover__overlay' />

				<div className='wedding-cover__content'>
					{/* =========================
					    NAMA TAMU
					    ========================= */}
					<div className='wedding-cover__guest'>
						<div className='guest-title'>Dear, {guestName}</div>

						<div className='guest-subtitle'>You Are Invited!</div>
					</div>

					{/* =========================
					    NAMA MEMPELAI
					    ========================= */}
					<div className='wedding-cover__couple'>
						<div className='couple-label'>The Wedding Celebration of</div>

						<h1>
							{groomName}
							<span>&amp;</span>
							{brideName}
						</h1>
					</div>

					{/* =========================
					    OPEN INVITATION
					    ========================= */}
					<button
						type='button'
						className='wedding-cover__button'
						onClick={handleOpen}
					>
						<span className='wedding-cover__envelope' aria-hidden='true'>
							♢
						</span>

						<span>Open Invitation</span>
					</button>
				</div>
			</section>

			{/* =========================
			    PAGE SETELAH COVER
			    ========================= */}
			<section className='wedding-main'>
				<LeftPage
					leftBackgroundUrl={backgroundUrl}
					weddingTitle={`The Wedding of ${groomName} & ${brideName}`}
				/>
			</section>
		</div>
	);
}
