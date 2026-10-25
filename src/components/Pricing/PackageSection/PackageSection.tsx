import './PackageSection.css';

interface PackageSectionProps {
	title: string;
	price: string;
	image: string;
	reverse?: boolean;
}

const PackageSection = ({
	title,
	price,
	image,
	reverse = false,
}: PackageSectionProps) => {
	return (
		<section className={`package-section ${reverse ? 'reverse' : ''}`}>
			<div className='package-image'>
				<img src={image} alt={title} />
			</div>

			<div className='package-content'>
				<h2>{title}</h2>
				<h3>{price}</h3>
				<ul>
					<li>Unlimited Guest</li>
					<li>QR Check-In</li>
					<li>RSVP Management</li>
					<li>Guest Dashboard</li>
					<li>Wedding Report</li>
				</ul>
			</div>
		</section>
	);
};

export default PackageSection;
