import React from 'react';
import './Navbar.css';
import { Link } from 'react-router-dom';

const Navbar: React.FC = () => {
	return (
		<header className='landing-navbar'>
			<div className='landing-navbar__container'>
				<a href='/' className='landing-navbar__logo'>
					<img
						src='https://nstory.id/wp-content/uploads/2026/01/logoNS-newcolor.png'
						alt='NStory'
					/>
				</a>

				<nav className='landing-navbar__menu'>
					<Link to='/'>Home</Link>
					<Link to='/pricing'>Pricing</Link>
					<Link to='/catalog'>Catalog Design</Link>
					<Link to='/order-process'>Order Process</Link>
				</nav>
			</div>
		</header>
	);
};

export default Navbar;
