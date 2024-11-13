import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const userDetails = localStorage.getItem('userDetails');
        if (userDetails) {
            const parsed = JSON.parse(userDetails);
            const currentTime = new Date().getTime();

            if (parsed.sessionExpiry && currentTime < parsed.sessionExpiry) {
                setUser(parsed);
            } else {
                localStorage.removeItem('userDetails');
            }
        }
    }, []);

    return (
        <AuthContext.Provider value={{ user, setUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext); 