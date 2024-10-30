// src/pages/LandingPage.jsx
import { Helmet } from 'react-helmet';
import React from "react";
import '../assets/css/landing-page.css';

const LandingPage = () => {
    return (
        <div className="landing-page">
            <Helmet>
                <title>SBO Fee Collection Management System</title>
            </Helmet>
            <nav className="landing-page__nav">
                <div className="landing-page__nav__logo"><a href="#">Learning</a></div>
                <ul className="landing-page__nav__links">
                    <li className="landing-page__link"><a href="#">Home</a></li>
                    <li className="landing-page__link"><a href="#">About Us</a></li>
                    <li className="landing-page__link"><a href="#">Services</a></li>
                    <li className="landing-page__link"><a href="#">Courses</a></li>
                    <li className="landing-page__link"><a href="#">Blog</a></li>
                    <li className="landing-page__link"><a href="#" className="landing-page__nav__btn">Register</a></li>
                </ul>
            </nav>
            <section className="landing-page__container">
                <div className="landing-page__content-container">
                    <h1>
                        Register Now<br />
                        <span className="landing-page__heading--1">SBO Fee Collection</span><br />
                        <span className="landing-page__heading--2">Management System</span>
                    </h1>
                    <p>
                        Simplify your Fee Management with Our fee collection System. 
                        Our platform makes fee collection easy and efficient, providing a 
                        straightforward way to track payments and manage financial records. 
                        Enjoy a user-friendly experience that helps COT-SBO stay organized 
                        and keep everything on track.
                    </p>
                    <form>
                        <input type="text" placeholder="What do you want to learn" />
                        <button type="submit">Search Course</button>
                    </form>
                </div>
                <div className="landing-page__image-container">
                    <img src="assets/header-1.jpg" alt="header" />
                    <img src="assets/header-2.jpg" alt="header" />
                    <div className="landing-page__image-content">
                        <ul>
                            <li>Get 30% off on every 1st month</li>
                            <li>Expert teachers</li>
                        </ul>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default LandingPage;