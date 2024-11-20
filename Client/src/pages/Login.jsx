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
    const [keepSignedIn, setKeepSignedIn] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await axios.post('http://localhost:8000/api/login', {
                email,
                password,
                recaptchaToken,
                keepSignedIn
            });

            console.log('Server response:', response.data); // Debug log

            if (response.data.token) {
                const expiryTime = new Date().getTime() + (keepSignedIn ? 24 : 1) * 60 * 60 * 1000;

                const userDetails = {
                    _id: response.data.userId,
                    email: response.data.email,
                    position: response.data.position,
                    loginLogId: response.data.loginLogId,
                    sessionExpiry: expiryTime,
                    keepSignedIn: keepSignedIn
                };

                // Store authentication data
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('userDetails', JSON.stringify(userDetails));
                setUser(userDetails);

                // Get position and trim/lowercase for consistent comparison
                const position = (response.data.position || '').toLowerCase().trim();
                console.log('Position after processing:', position); // Debug log

                // Direct navigation based on position
                if (position === 'admin') {
                    navigate('/admin/dashboard');
                } else if (position === 'treasurer') {
                    navigate('/treasurer/dashboard');
                } else if (position === 'governor') {
                    navigate('/governor/dashboard');
                    console.log('Navigation attempted');

                } else if (position === 'officer') {

                    navigate('/officer/dashboard');
                } else {
                    console.error('Unknown position:', position);
                    setMessage('Invalid user position');
                }
            }
        } catch (error) {
            console.error('Login error:', error);
            setMessage(error.response?.data?.message || 'Invalid email or password.');
        } finally {
            setLoading(false);
        }
    };


    const handleGoogle = async () => {
        try {
            await signOut(auth);
            const provider = new GoogleAuthProvider();
            provider.setCustomParameters({
                prompt: 'select_account',
                access_type: 'offline'
            });

            const result = await signInWithPopup(auth, provider);
            const user = result.user;

            if (user && user.email) {
                const response = await axios.post('http://localhost:8000/api/auth/verify-google-users', {
                    email: user.email,
                    uid: user.uid,
                    displayName: user.displayName,
                    photoURL: user.photoURL
                });

                if (response.data.authorized) {
                    localStorage.setItem('token', response.data.token);

                    const userDetails = {
                        _id: user.uid,
                        email: user.email,
                        position: response.data.position,
                        loginLogId: response.data.loginLogId,
                        picture: user.photoURL,
                        imageUrl: user.photoURL,
                        sessionExpiry: new Date().getTime() + (keepSignedIn ? 24 : 1) * 60 * 60 * 1000 // 24 hours or 1 hour
                    };

                    // Store user details and complete login
                    localStorage.setItem('userDetails', JSON.stringify(userDetails));
                    setUser(userDetails);

                    if (userDetails.position.toLowerCase() === 'treasurer') {
                        navigate('/treasurer/dashboard');
                    }
                } else {
                    setMessage('Access denied. Only authorized users can log in.');
                }
            }
        } catch (error) {
            console.error('Google login error:', error);
            setMessage('Failed to login with Google');
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
            const response = await axios.post('http://localhost:8000/api/logout', {
                userId: storedUserId,
                userModel: storedUserModel
            });
            console.log(response.data.message);
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

    const completeLogin = (userDetails) => {
        if (!userDetails.picture && !userDetails.imageUrl) {
            userDetails.picture = userDetails.photoURL || null;
            userDetails.imageUrl = userDetails.photoURL || null;
        }

        localStorage.setItem('userDetails', JSON.stringify(userDetails));
        setUser(userDetails);

        // Handle navigation based on position
        const position = userDetails.position.toLowerCase().trim();

        switch (position) {
            case 'admin':
                navigate('/admin/dashboard');
                break;
            case 'treasurer':
                navigate('/treasurer/dashboard');
                break;
            case 'governor':
                navigate('/governor/dashboard');
                break;
            case 'officer':
                navigate('/officer/dashboard');
                break;
            default:
                console.error('Unknown position:', userDetails.position);
                setMessage('Invalid user position');
        }
    };

    const handleGoogleSuccess = async (response) => {
        try {
            const userDetails = {
                ...response.profileObj,
                imageUrl: response.profileObj.imageUrl, // Store Google profile image URL
                picture: response.profileObj.imageUrl,  // Store as both imageUrl and picture
                email: response.profileObj.email,
                name: response.profileObj.name,
                // ... other user details
            };
            localStorage.setItem('userDetails', JSON.stringify(userDetails));
            // ... rest of your login logic
        } catch (error) {
            console.error('Error during Google login:', error);
        }
    };

    const handleGoogleLogin = async (googleData) => {
        try {
            const response = await axios.post('http://localhost:8000/api/auth/google', {
                token: googleData.credential
            });

            if (response.data.success) {
                const userDetails = {
                    ...response.data.user,
                    imageUrl: googleData.picture, // Store Google profile picture URL
                    picture: googleData.picture,  // Backup storage
                    loginLogId: response.data.loginLogId
                };

                localStorage.setItem('userDetails', JSON.stringify(userDetails));
                // Rest of your login logic
            }
        } catch (error) {
            console.error('Login error:', error);
        }
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
                    <div className="form-group">
                        <div className="form-group">
                            <div className="form-check">
                                <input
                                    type="checkbox"
                                    className="form-check-input"
                                    id="keepSignedIn"
                                    checked={keepSignedIn}
                                    onChange={(e) => setKeepSignedIn(e.target.checked)}
                                />
                                <label className="form-check-label smaller-gray-text" htmlFor="keepSignedIn">
                                    Keep me signed in for 24 hours
                                </label>
                            </div>
                        </div>
                    </div>

                    <ReCAPTCHA
                        sitekey="6LcfaG0qAAAAAFTykOtXdpsqkS9ZUeALt2CgFmId"
                        onChange={onRecaptchaChange}
                    />

                    <button type="submit" className="btn btn-primary login-button" disabled={loading || !recaptchaToken}>
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
            {/* <ConsentModal
                isOpen={showConsentModal}
                onClose={() => setShowConsentModal(false)}
                onAccept={handleConsentAccept}
                onDecline={handleConsentDecline}
            /> */}
        </div>
    );
};
export default Login;
