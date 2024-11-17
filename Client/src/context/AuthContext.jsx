import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        // Check for existing session on component mount
        const checkSession = () => {
            const userDetails = localStorage.getItem('userDetails');
            if (userDetails) {
                const parsedUser = JSON.parse(userDetails);
                const currentTime = new Date().getTime();

                if (parsedUser.sessionExpiry && currentTime < parsedUser.sessionExpiry) {
                    setUser(parsedUser);
                } else {
                    // Session expired
                    localStorage.removeItem('userDetails');
                    setUser(null);
                }
            }
        };

        checkSession();
    }, []);

    return (
        <AuthContext.Provider value={{ user, setUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext); 