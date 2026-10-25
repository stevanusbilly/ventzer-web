import './Workflow.css';

const steps = [
	{
		no: '01',
		image: '/images/workflow/template.png',
		title: 'Pilih Template',
		desc: 'Pilih template undangan sesuai tema pernikahan Anda.',
	},
	{
		no: '02',
		image: '/images/workflow/form.png',
		title: 'Lengkapi Data',
		desc: 'Isi data mempelai, acara, galeri, cerita, dan informasi lainnya.',
	},
	{
		no: '03',
		image: '/images/workflow/share.png',
		title: 'Sebarkan Undangan',
		desc: 'Bagikan undangan digital ke tamu melalui WhatsApp.',
	},
	{
		no: '04',
		image: '/images/workflow/rsvp.png',
		title: 'Pantau RSVP',
		desc: 'Lihat konfirmasi kehadiran tamu secara realtime.',
	},
];

const Workflow = () => {
	return (
		<section className='landing-workflow'>
			<div className='landing-workflow__container'>
				<span className='section-tag'>Cara Kerja</span>

				<h2>
					Hanya <span>4 Langkah</span> Mudah
				</h2>

				<div className='workflow-grid'>
					{steps.map((step) => (
						<div className='workflow-card'>
							<img
								src={step.image}
								alt={step.title}
								className='workflow-image'
							/>

							<div className='workflow-number'>{step.no}</div>
							<h3>{step.title}</h3>
							<p>{step.desc}</p>
						</div>
					))}
				</div>
			</div>
		</section>
	);
};

export default Workflow;
