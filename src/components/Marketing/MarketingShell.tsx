import React, { ReactNode } from "react";
import Navbar from "../common/Navbar/Navbar";
import Footer from "../common/Footer/Footer";
import "./marketing.css";

const MarketingShell: React.FC<{ children: ReactNode }> = ({ children }) => (
	<>
		<Navbar />
		<div className="mkt">{children}</div>
		<Footer />
	</>
);

export default MarketingShell;
