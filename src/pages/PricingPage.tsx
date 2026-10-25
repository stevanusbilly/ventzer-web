import Navbar from '../components/common/Navbar/Navbar';
import Footer from '../components/common/Footer/Footer';

import PricingHero from '../components/Pricing/PricingHero';
import PackageSection from '../components/Pricing/PackageSection/PackageSection';
import Container from '../components/common/Container/Container';

const PricingPage = () => {
	return (
		<>
			<Navbar />
			<PricingHero />
			<Container>
				<PackageSection
					title='Silver Package'
					price='Rp199.000'
					image='https://images.unsplash.com/photo-1519741497674-611481863552?w=900'
				/>

				<PackageSection
					title='Gold Package'
					price='Rp399.000'
					image='https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=900'
					reverse
				/>

				<PackageSection
					title='Platinum Package'
					price='Custom'
					image='https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=900'
				/>
			</Container>
			<Footer />
		</>
	);
};

export default PricingPage;
