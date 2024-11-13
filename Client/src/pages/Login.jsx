// src/pages/Login.jsx
import { Helmet } from 'react-helmet';
import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../assets/css/login.css';
import ReCAPTCHA from 'react-google-recaptcha';
import GoogleSignInButton from '../pages/googlelogin';
import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { auth } from '../pages/firebase/firebaseConfig';
import { useAuth } from '../context/AuthContext';


const Login = () => {
    const { setUser } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [recaptchaToken, setRecaptchaToken] = useState(null);
    const navigate = useNavigate();




    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await axios.post('http://localhost:8000/api/login', {
                email,
                password,
                recaptchaToken
            });

            const userDetails = {
                _id: response.data.userId,
                email: response.data.email,
                position: response.data.position,
                loginLogId: response.data.loginLogId,
                sessionExpiry: new Date().getTime() + (60 * 60 * 1000) // 1 hour from now
            };

            localStorage.setItem('userDetails', JSON.stringify(userDetails));
            setUser(userDetails); // Update the auth context

            const { position } = response.data;
            if (position === 'admin') {
                navigate('/admin/dashboard');
            } else if (position === 'officer') {
                navigate('/officer/dashboard');
            } else if (position === 'Treasurer') {
                navigate('/treasurer/dashboard');
            } else if (position === 'governor') {
                navigate('/governor-dashboard');
            }
        } catch (error) {
            console.error('Login error:', error);
            setMessage('Invalid email or password.');
        } finally {
            setLoading(false);
        }
    };





    const handleGoogle = async () => {
        await signOut(auth);

        const provider = new GoogleAuthProvider();
        provider.setCustomParameters({ prompt: 'select_account' });

        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;

            if (user && user.email) {
                console.log('Email sent to backend:', user.email); // Log the email sent

                const response = await axios.post('http://localhost:8000/api/auth/verify-google-users', {
                    email: user.email
                });

                console.log('Backend response:', response.data); // Log the response data

                if (response.data.authorized) {
                    const { position, userDetails } = response.data;
                    // Store user details in localStorage
                    localStorage.setItem('userDetails', JSON.stringify(userDetails));

                    // Navigate based on position
                    if (position === 'treasurer') {
                        navigate('/treasurer/dashboard');
                    }
                    // ... rest of your navigation logic
                } else {
                    setMessage('Access denied. Only authorized users can log in.');
                }
            } else {
                setMessage('Google sign-in failed. No user email found.');
            }
        } catch (error) {
            console.error('Google sign-in error:', error);
            setMessage('Google sign-in failed. Please try again.');
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

    const handleLogout = async () => {
        try {
            // Assuming you have the userId and userModel stored in your client
            const response = await axios.post('http://localhost:8000/api/logout', {
                userId: storedUserId,
                userModel: storedUserModel
            });
            console.log(response.data.message); // Should log "Logout successful"
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const handleLoginSuccess = (response) => {
        const userDetails = {
            _id: response.data._id,
            email: response.data.email,
            position: response.data.position,
            loginLogId: response.data.loginLogId
        };
        localStorage.setItem('userDetails', JSON.stringify(userDetails));
        if (!response.data || !response.data.userDetails) {
            console.error('Invalid login response:', response);
            return;
        }

        // Store the complete userDetails object
        localStorage.setItem('userDetails', JSON.stringify({
            _id: response.data.userDetails._id,
            email: response.data.userDetails.email,
            position: response.data.userDetails.position,
            loginLogId: response.data.userDetails.loginLogId
        }));

        // Log the stored details for debugging
        const storedDetails = localStorage.getItem('userDetails');
        console.log('Stored user details:', storedDetails);
    };

    return (
        <div className="login-body">
            <Helmet>
                <title></title>
            </Helmet>
            <div className="login-container">
                <div className="text-center">
                    <img src="../images/COT-Logo.jpg" alt="COT Logo" className="logo" />
                </div>
                <h2>LOGIN</h2>

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
export default Login;
