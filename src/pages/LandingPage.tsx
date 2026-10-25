import Navbar from "../components/common/Navbar/Navbar";
import Footer from "../components/common/Footer/Footer";
import Hero from "../components/Landing/Hero";
import Features from "../components/Landing/Features";
import About from "../components/Landing/About";
import Statistics from "../components/Landing/Statistics";
import Showcase from "../components/Landing/Showcase";
import CTA from "../components/Landing/CTA";
import DesignPreview from "../components/Landing/DesignPreview";
import DashboardShowcase from "../components/Landing/DashboardShowcase";
import FAQ from '../components/Landing/FAQ';

const LandingPage = () => {
    return (
        <>
            <Navbar />
            <Hero />
            <Statistics />
            <DesignPreview />
            <Features />
            <About />
            <DashboardShowcase />
            <Showcase />
            <FAQ />
            <CTA />
            <Footer />
        </>
    );
};

export default LandingPage;