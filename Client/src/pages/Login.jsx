// src/pages/Login.jsx
import { Helmet } from 'react-helmet';
import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../assets/css/login.css';
import ReCAPTCHA from 'react-google-recaptcha';
import GoogleSignInButton from '../pages/googlelogin';
import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { auth } from '../pages/firebase/firebaseConfig';
import { useAuth } from '../context/AuthContext';
import OTPVerificationModal from '../components/OTPVerificationModal';

const Login = () => {
    const { setUser } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [recaptchaToken, setRecaptchaToken] = useState(null);
    const navigate = useNavigate();
    const [keepSignedIn, setKeepSignedIn] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [otpCode, setOtpCode] = useState('');
    const [verifying, setVerifying] = useState(false);
    const [otpVerified, setOtpVerified] = useState(false);
    const [showOTPModal, setShowOTPModal] = useState(false);
    const [recaptchaExpiry, setRecaptchaExpiry] = useState(null);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    const SuccessModal = ({ isOpen, onClose }) => {
        if (!isOpen) return null;
        
        return (
            <div className="success-modal-overlay">
                <div className="success-modal">
                    <div className="success-checkmark">
                        <div className="check-icon">
                            <span className="icon-line line-tip"></span>
                            <span className="icon-line line-long"></span>
                            <div className="icon-circle"></div>
                            <div className="icon-fix"></div>
                        </div>
                    </div>
                    <h2>Login Successful!</h2>
                    <p>Welcome back!</p>
                </div>
            </div>
        );
    };

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

                localStorage.setItem('token', response.data.token);
                localStorage.setItem('userDetails', JSON.stringify(userDetails));
                setUser(userDetails);

                // Show success modal
                setShowSuccessModal(true);
                
                // Navigate after a short delay
                setTimeout(() => {
                    setShowSuccessModal(false);
                    const position = (response.data.position || '').toLowerCase().trim();

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
                            setMessage('Invalid user position');
                            console.error('Unknown position:', position);
                    }
                }, 2000);
            }
        } catch (error) {
            console.error('Login error:', error);
            if (error.response?.status === 401) {
                setMessage('Invalid email or password. Please try again.');
            } else {
                setMessage(error.response?.data?.message || 'An error occurred during login.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleGoogle = async () => {
        try {
            await signOut(auth);
            const provider = new GoogleAuthProvider();
            provider.setCustomParameters({
                prompt: 'select_account'
            });

            try {
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
                            _id: response.data.userId,
                            email: user.email,
                            position: response.data.position,
                            loginLogId: response.data.loginLogId,
                            picture: user.photoURL,
                            imageUrl: user.photoURL,
                            sessionExpiry: new Date().getTime() + (keepSignedIn ? 24 : 1) * 60 * 60 * 1000
                        };

                        localStorage.setItem('userDetails', JSON.stringify(userDetails));
                        setUser(userDetails);

                        const position = response.data.position.toLowerCase();
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
                                setMessage('Invalid user position');
                                console.error('Unknown position:', position);
                        }
                    } else {
                        setMessage(response.data.message || 'Access denied. Only authorized users can log in.');
                    }
                }
            } catch (popupError) {
                if (popupError.code === 'auth/popup-closed-by-user') {
                    console.log('Sign-in popup closed by user');
                    return;
                }
                throw popupError;
            }
        } catch (error) {
            console.error('Google login error:', error);
            setMessage(error.response?.data?.message || 'Failed to login with Google. Please try again.');
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
        if (token) {
            setRecaptchaToken(token);
            setShowOTPModal(true);

            const expiryTime = new Date().getTime() + (5 * 60 * 1000);
            setRecaptchaExpiry(expiryTime);

            setTimeout(() => {
                setRecaptchaToken(null);
                setRecaptchaExpiry(null);
                setShowOTPModal(false);
                setOtpVerified(false);
                if (window.grecaptcha) {
                    window.grecaptcha.reset();
                }
                setMessage('reCAPTCHA expired. Please verify again.');
            }, 5 * 60 * 1000);
        }
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

        localStorage.setItem('userDetails', JSON.stringify({
            _id: response.data.userDetails._id,
            email: response.data.userDetails.email,
            position: response.data.userDetails.position,
            loginLogId: response.data.userDetails.loginLogId
        }));

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
                imageUrl: response.profileObj.imageUrl,
                picture: response.profileObj.imageUrl,
                email: response.profileObj.email,
                name: response.profileObj.name,
            };
            localStorage.setItem('userDetails', JSON.stringify(userDetails));
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
                    imageUrl: googleData.picture,
                    picture: googleData.picture,
                    loginLogId: response.data.loginLogId
                };

                localStorage.setItem('userDetails', JSON.stringify(userDetails));
            }
        } catch (error) {
            console.error('Login error:', error);
        }
    };

    useEffect(() => {
        let expiryCheck;
        if (recaptchaExpiry) {
            expiryCheck = setInterval(() => {
                const currentTime = new Date().getTime();
                if (currentTime > recaptchaExpiry) {
                    setRecaptchaToken(null);
                    setRecaptchaExpiry(null);
                    setShowOTPModal(false);
                    setOtpVerified(false);
                    if (window.grecaptcha) {
                        window.grecaptcha.reset();
                    }
                    setMessage('reCAPTCHA expired. Please verify again.');
                    clearInterval(expiryCheck);
                }
            }, 1000);
        }

        return () => {
            if (expiryCheck) {
                clearInterval(expiryCheck);
            }
        };
    }, [recaptchaExpiry]);

    return (
        <>
            <Helmet>
                <title>Login | Fee Collection Management System</title>
            </Helmet>
            <div className="login-body">
                <div className="login-container">
                    <div className="text-center">
                        <img src="../images/COT-Logo.jpg" alt="COT Logo" className="logo" />
                    </div>
                    <h2>LOGIN</h2>

                    {message && (
                        <div className={`alert ${message.includes('success') ? 'alert-success' : 'alert-danger'}`}>
                            {message}
                        </div>
                    )}

                    <form id="loginForm" onSubmit={handleLogin}>
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
                            onExpired={() => {
                                setRecaptchaToken(null);
                                setRecaptchaExpiry(null);
                                setShowOTPModal(false);
                                setOtpVerified(false);
                                setMessage('reCAPTCHA expired. Please verify again.');
                            }}
                        />

                        <OTPVerificationModal
                            show={showOTPModal}
                            onClose={() => setShowOTPModal(false)}
                            onVerificationComplete={() => setOtpVerified(true)}
                            phoneNumber={phoneNumber}
                            setPhoneNumber={setPhoneNumber}
                            otpSent={otpSent}
                            setOtpSent={setOtpSent}
                            otpCode={otpCode}
                            setOtpCode={setOtpCode}
                            loading={loading}
                            setLoading={setLoading}
                            verifying={verifying}
                            setVerifying={setVerifying}
                            setOtpVerified={setOtpVerified}
                            setMessage={setMessage}
                        />

                        <button type="submit" className="btn btn-primary login-button" disabled={loading || !recaptchaToken || !otpVerified}>
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
                <SuccessModal isOpen={showSuccessModal} onClose={() => setShowSuccessModal(false)} />
            </div>
        </>
    );
};
export default Login;