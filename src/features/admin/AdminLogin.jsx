// src/features/admin/AdminLogin.jsx
import React, { useState } from "react";
import "./login.css"; 
import axios from 'axios'; 

const AdminLogin = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');

    

    // const handleLogin = async (e) => {
    //     e.preventDefault();
    //     try {
    //         const response = await axios.post('/api/login', { username, password }); // Update with your API endpoint
    //         // Handle the response, e.g., redirect to dashboard or store token
    //         console.log('Login successful:', response.data);
    //         // Redirect to dashboard or set user state
    //     } catch (error) {
    //         console.error('Login error:', error);
    //         setMessage('Invalid username or password.'); // Update the message as per the API response
    //     }
    // };

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

    return (
        <div className="login-body">
            <div className="login-container">
                <div className="text-center">
                    <img src="../images/COT-Logo.jpg" alt="COT Logo" className="logo" />
                </div>
                <h2>LOGIN AS ADMIN</h2>

                {/* {message && (
                    <div className="alert alert-danger" role="alert">
                        {message}
                    </div>
                )} */}

                <form>
                    <div className="form-group">
                        <div className="input-icon-wrapper">
                            <input
                                type="text"
                                className="form-control"
                                id="username"
                                name="username"
                                placeholder="Username"
                                required
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                            <i className="input-icon fas fa-user"></i>
                        </div>
                    </div>
                    <div className="form-group">
                        <div className="input-icon-wrapper">
                            <input
                                type="password"
                                className="form-control"
                                id="password"
                                name="password"
                                placeholder="Password"
                                required
                                value={password}
                                // onChange={(e) => setPassword(e.target.value)}
                            />
                            <i className="input-icon fas fa-lock"></i>
                            <button type="button" className="toggle-password" onClick={togglePassword}>
                                <i className="fas fa-eye"></i>
                            </button>
                        </div>
                    </div>
                    <div className="g-recaptcha" data-sitekey=""></div>
                    <button type="submit" className="btn btn-primary">
                        <i className="fas fa-sign-in-alt mr-2"></i> LOGIN AS ADMIN
                    </button>
                </form>

                <div className="divider">
                    <span>or continue with</span>
                </div>

                <div className="g-signin2" data-onsuccess="onSignIn"></div>
            </div>
        </div>
    );
};

export default AdminLogin;