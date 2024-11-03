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

            <section id="about" className='about' style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '2rem 0', marginBottom: '2rem'}}>
                <div className="container">
                    <div className="row align-items-center">
                        <div className="col-md-12 text-center">
                            <div className="titlepage">
                                <h2 className="landing-page__heading--2" style={{ fontSize: '1.95rem' }}>About Us</h2>
                            </div>
                        </div>
                    </div>
                    <div className="row align-items-center">
                        <div className="col-md-6">
                            <div className="about_box">
                                <span>We’re here to transform fee collection into a simple and transparent process for the student body organization.</span>
                            </div>
                            <div className="about_box">
                                <p>
                                The SBO Fee Collection Management System is designed for the College of Technology Student Body Organization (COT-SBO) to simplify and enhance fee management. 
                                Our user-friendly platform minimizes human error and ensures accurate tracking of student fees and payments. 
                                </p>
                            </div>
                            <div className="about_box">
                                <p>
                                We value integrity and efficiency, which is why our system incorporates distinct user roles with tailored permissions.
                                This structure not only secures financial data, which allows your organization to focus on serving our members better.
                                </p>
                            </div>
                        </div>
                        <div className="col-md-6">
                            <img src="public/images/org.jpg" alt="About Us" className="about-image" />
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