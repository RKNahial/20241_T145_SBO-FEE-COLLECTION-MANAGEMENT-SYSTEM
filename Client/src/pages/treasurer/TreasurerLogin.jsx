import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ReCAPTCHA from 'react-google-recaptcha';
import '../../assets/css/login.css';
import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { auth } from '../treasurer/firebase/firebaseConfig';
import GoogleSignInButton from './googlelogin';

const AdminLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [recaptchaToken, setRecaptchaToken] = useState(null);
    const navigate = useNavigate();


    const handleGoogle = async () => {
        const provider = new GoogleAuthProvider();
        try {
            // Sign out any existing user session to ensure explicit sign-in
            if (auth.currentUser) {
                await signOut(auth);
            }

            // Trigger Google Sign-In
            const result = await signInWithPopup(auth, provider);
            const user = result.user;

            // Verify if the user is authorized as Treasurer
            const response = await axios.post('http://localhost:8000/treasurer/google/verify-treasurer', {
                email: user.email
            });

            if (response.data.authorized) {
                console.log('User authorized as Treasurer:', user);
                navigate('/treasurer/dashboard');
            } else {
                setMessage(response.data.message);
                setTimeout(() => setMessage(''), 3000);
            }
        } catch (error) {
            console.error('Google sign-in error:', error);
            setMessage('Google sign-in failed. Please try again.');
            setTimeout(() => setMessage(''), 3000);
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await axios.post('http://localhost:8000/treasurer/login', {
                email,
                password,
                recaptchaToken
            });
            console.log('Login successful:', response.data);
            navigate('/treasurer/dashboard');
        } catch (error) {
            console.error('Login error:', error);
            setMessage('Invalid email or password.');
            setTimeout(() => {
                setMessage('');
            }, 3000);
        } finally {
            setLoading(false);
        }
    };

    const togglePassword = () => {
        const passwordInput = document.getElementById('password');
        const toggleButton = document.querySelector('.toggle-password i');
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            toggleButton.classList.remove('fa-eye');
            toggleButton.classList.add('fa-eye-slash');
        } else {
            passwordInput.type = 'password';
            toggleButton.classList.remove('fa-eye-slash');
            toggleButton.classList.add('fa-eye');
        }
    };

    const onRecaptchaChange = (token) => {
        setRecaptchaToken(token);
    };

    return (
        <div className="login-body">
            <div className="login-container">
                <div className="text-center">
                    <img src="../images/COT-Logo.jpg" alt="COT Logo" className="logo" />
                </div>
                <h2>LOGIN AS TREASURER</h2>

                {message && (
                    <div className="alert alert-danger" role="alert">
                        {message}
                    </div>
                )}

                <form onSubmit={handleLogin}>
                    <div className="form-group">
                        <div className="input-icon-wrapper">
                            <input
                                type="email"
                                className="form-control login-form"
                                id="email"
                                name="email"
                                placeholder="Email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                            <i className="input-icon fas fa-user"></i>
                        </div>
                    </div>
                    <div className="form-group">
                        <div className="input-icon-wrapper">
                            <input
                                type="password"
                                className="form-control login-form"
                                id="password"
                                name="password"
                                placeholder="Password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <i className="input-icon fas fa-lock"></i>
                            <button type="button" className="toggle-password" onClick={togglePassword}>
                                <i className="fas fa-eye"></i>
                            </button>
                        </div>
                    </div>

                    <ReCAPTCHA
                        sitekey="6LcfaG0qAAAAAFTykOtXdpsqkS9ZUeALt2CgFmId"
                        onChange={onRecaptchaChange}
                    />

                    <button type="submit" className="btn btn-primary" disabled={loading || !recaptchaToken}>
                        <i className="fas fa-sign-in-alt mr-2"></i> {loading ? 'Logging in...' : 'LOGIN'}
                    </button>
                </form>

                <div className="divider">
                    <span>or continue with</span>
                </div>
                <GoogleSignInButton
                    onClick={handleGoogle}
                    disabled={loading}
                />
            </div>
        </div>
    );
};

export default AdminLogin;