import React from 'react';
import './LeftPage.css';

type WeddingPageProps = {
	leftBackgroundUrl?: string;
	weddingTitle?: string;
};

export default function WeddingPage({
	leftBackgroundUrl,
	weddingTitle = '',
}: WeddingPageProps) {
	return (
		<main className='wedding-page'>
			<aside className='wedding-page__left'>
				<div
					className='wedding-page__left-background'
					style={{
						backgroundImage: leftBackgroundUrl
							? `url("${leftBackgroundUrl}")`
							: undefined,
					}}
				/>

				<div className='wedding-page__left-overlay' />

				<div className='wedding-page__left-content'>
					<div className='wedding-page__scroll'>
						<div className='wedding-page__scroll-icon' aria-hidden='true'>
							⌄
						</div>

						<div className='wedding-page__scroll-text'>Scroll Kebawah</div>
					</div>

					{weddingTitle && (
						<div className='wedding-page__left-title'>{weddingTitle}</div>
					)}
				</div>
			</aside>

			<section className='wedding-page__right'>
				<div className='wedding-page__right-content'>{/* Invitation */}</div>
			</section>
		</main>
	);
}
