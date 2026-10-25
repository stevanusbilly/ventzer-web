import { useState } from 'react';
import './FAQ.css';

interface FAQItem {
	question: string;
	answer: string;
}

const faqItems: FAQItem[] = [
	{
		question: 'Apa itu Wedding Management System?',
		answer:
			'Wedding Management System adalah platform untuk membantu mengelola kebutuhan acara pernikahan, mulai dari undangan digital, data tamu, RSVP, hingga QR Check-In.',
	},
	{
		question: 'Apakah saya bisa memilih desain undangan sendiri?',
		answer:
			'Ya. Anda dapat memilih desain undangan yang tersedia dan menyesuaikannya dengan kebutuhan acara Anda.',
	},
	{
		question: 'Bagaimana cara mengirim undangan kepada tamu?',
		answer:
			'Undangan dapat dibagikan secara digital kepada tamu melalui WhatsApp maupun media sosial.',
	},
	{
		question: 'Apakah RSVP tamu dapat dipantau?',
		answer:
			'Ya. Status RSVP tamu dapat dipantau melalui sistem sehingga Anda dapat mengetahui jumlah tamu yang mengonfirmasi kehadiran.',
	},
	{
		question: 'Bagaimana sistem QR Check-In bekerja?',
		answer:
			'Tamu menunjukkan QR Code yang diterima melalui undangan. QR Code kemudian dipindai oleh crew untuk memvalidasi dan mencatat kehadiran tamu.',
	},
	{
		question: 'Apakah data tamu bisa di-export?',
		answer:
			'Data tamu dapat dikelola melalui sistem dan dapat disiapkan untuk kebutuhan laporan atau export sesuai fitur paket yang digunakan.',
	},
];

const FAQ = () => {
	const [activeIndex, setActiveIndex] = useState<number | null>(null);

	const toggleFAQ = (index: number) => {
		setActiveIndex((current) => (current === index ? null : index));
	};

	return (
		<section className='landing-faq' id='faq'>
			<div className='landing-faq__container'>
				<div className='landing-faq__header'>
					<span className='section-tag'>FAQ</span>

					<h2>
						Pertanyaan yang <span>Sering Ditanyakan</span>
					</h2>

					<p>
						Temukan jawaban dari beberapa pertanyaan yang sering ditanyakan
						mengenai layanan kami.
					</p>
				</div>

				<div className='faq-list'>
					{faqItems.map((item, index) => {
						const isActive = activeIndex === index;

						return (
							<div
								key={item.question}
								className={`faq-item ${isActive ? 'active' : ''}`}
							>
								<button
									type='button'
									className='faq-question'
									onClick={() => toggleFAQ(index)}
									aria-expanded={isActive}
								>
									<span>{item.question}</span>

									<span className='faq-icon'>{isActive ? '−' : '+'}</span>
								</button>

								<div className={`faq-answer ${isActive ? 'open' : ''}`}>
									<p>{item.answer}</p>
								</div>
							</div>
						);
					})}
				</div>
			</div>
		</section>
	);
};

export default FAQ;
