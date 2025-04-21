import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const checkSession = () => {
            try {
                const userDetails = localStorage.getItem('userDetails');
                const token = localStorage.getItem('token');

                if (userDetails && token) {
                    const parsedUser = JSON.parse(userDetails);
                    setUser(parsedUser);
                } else if (
                    !window.location.pathname.startsWith('/sbo-fee-collection')
                ) {
                    navigate('/sbo-fee-collection/login');
                }
            } catch (error) {
                console.error('Session check error:', error);
                localStorage.removeItem('userDetails');
                localStorage.removeItem('token');
                setUser(null);
                if (!window.location.pathname.startsWith('/sbo-fee-collection')) {
                    navigate('/sbo-fee-collection/login');
                }
            } finally {
                setLoading(false);
            }
        };

        checkSession();
    }, [navigate]);

    if (loading) {
        return null; // or a loading spinner
    }

    return (
        <AuthContext.Provider value={{ user, setUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext); 