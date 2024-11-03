// src/pages/LandingPage.jsx
import { Helmet } from 'react-helmet';
import React from "react";
import { Link } from 'react-router-dom';
import '../assets/css/landing-page.css';

const LandingPage = () => {
    return (
        <div className="landing-page">
            <Helmet>
                <title>SBO Fee Collection Management System</title>
            </Helmet>
            <nav className="landing-page__nav">
                <div className="landing-page__nav__logo">
                    <Link to="/sbo-fee-collection">SBO Fee Collection Management System</Link>
                </div>
                <ul className="landing-page__nav__links">
                    <li className="landing-page__link">
                        <Link to="#about" onClick={() => window.scrollTo(0, document.getElementById('about').offsetTop)}>About Us</Link>
                    </li>
                    <li className="landing-page__link">
                        <Link to="#services" onClick={() => window.scrollTo(0, document.getElementById('services').offsetTop)}>Services</Link>
                    </li>
                    <li className="landing-page__link dropdown">
                        <a href="#" className="landing-page__nav__btn dropdown-toggle no-arrow" 
                           data-bs-toggle="dropdown" aria-expanded="false">
                            Login
                        </a>
                        <ul className="dropdown-menu">
                            <li><Link className="dropdown-item" to="/admin/login">Admin</Link></li>
                            <li><Link className="dropdown-item" to="/governor/login">Governor</Link></li>
                            <li><Link className="dropdown-item" to="/treasurer/login">Treasurer</Link></li>
                            <li><Link className="dropdown-item" to="/officer/login">Officer</Link></li>
                        </ul>
                    </li>
                </ul>
            </nav>

            <section className="landing-page__container">
                <div className="landing-page__content-container">
                    <h1>
                        <span style={{ fontSize: '2rem', paddingBottom: '2rem'}}>Start your Journey</span>
                        <br /><span className="landing-page__heading--1">Collect Fees</span><br />
                        <span className="landing-page__heading--2"  style={{ marginTop: '1.25rem', display: 'inline-block' }}>with a Click!</span>
                    </h1>
                    <p>
                        Simplify your fee management with our fee collection system. 
                        Our platform makes fee collection easy and efficient, providing a 
                        straightforward way to track payments and manage financial records. 
                    </p>
                </div>
                <div className="image">
                    <span className="image__bg"></span>
                    <img src="public/images/pic.png" alt="header" />
                </div>
            </section>

            <section id="about" className='about'>
                    <div className="container">
                    <div className="row">
                        <div className="col-md-12">
                        <div className="titlepage">
                            <h2 className="landing-page__heading--2" style={{ fontSize: '1.95rem', paddingBottom: '1.25rem' }}>About Us</h2>
                        </div>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-12">
                        <div className="about_box">
                            <span>01</span>
                            <p>
                            We prioritize convenience at every step of the rental process. 
                            With easy online booking and flexible pickup and drop-off options, 
                            renting a car with us is seamless and hassle-free. Our locations 
                            are strategically situated for maximum accessibility, ensuring that 
                            you can quickly get on the road and start your journey with minimal delay.
                            </p>
                        </div>
                        </div>
                        <div className="col-md-12">
                        <div className="about_box">
                            <span>02</span>
                            <p>
                            We offer a diverse fleet of vehicles to suit every need and preference. 
                            Whether you're embarking on a solo road trip, a family vacation, or a 
                            business excursion, we have the perfect car for you. From compact cars 
                            for urban adventures to spacious SUVs for outdoor escapades, our selection 
                            ensures that you'll find the ideal ride for any occasion.
                            </p>
                        </div>
                        </div>
                        <div className="col-md-12">
                        <div className="about_box">
                            <span>03</span>
                            <p>
                            Customer satisfaction is our top priority, and we go above and beyond 
                            to provide exceptional service and support. Our knowledgeable and friendly 
                            staff are always ready to assist you, whether you have questions about 
                            vehicle features, need assistance during your rental period, or require 
                            help resolving any issues. With our dedication to customer care, you can 
                            trust us to make your car rental experience smooth, enjoyable, and worry-free.
                            </p>
                        </div>
                        </div>
                    </div>
                </div>
            </section>


            <section id="services">
                <h2 className="landing-page__heading--2" style={{ fontSize: '1.95rem', paddingBottom: '1.25rem' }}>Our Services</h2>
                <p>We offer a range of services, including online fee collection, comprehensive reporting tools, and user-friendly interfaces for administrators.</p>
            </section>

        </div>
    );
};

export default LandingPage;