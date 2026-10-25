import './DesignPreview.css';

const designs = [
	{
		image: 'https://picsum.photos/380/700?random=1',
		title: 'Elegant White',
	},
	{
		image: 'https://picsum.photos/380/700?random=2',
		title: 'Luxury Gold',
	},
	{
		image: 'https://picsum.photos/380/700?random=3',
		title: 'Minimalist',
	},
];

const DesignPreview = () => {
	return (
		<section className='design-preview'>
			<div className='landing-container'>
				<span className='section-tag'>Premium Wedding Templates</span>

				<h2>
					Lebih dari 300+
					<br />
					Design Premium
				</h2>

				<p>
					Pilih template favoritmu dan sesuaikan dengan tema pernikahan yang
					kamu impikan.
				</p>

				<button className='design-button'>Lihat Semua Design →</button>

				<div className='design-stack'>
					{designs.map((design, index) => (
						<div key={index} className={`design-card card-${index + 1}`}>
							<img src={design.image} alt={design.title} />

							<div className='design-title'>{design.title}</div>
						</div>
					))}
				</div>
			</div>
		</section>
	);
};

export default DesignPreview;
