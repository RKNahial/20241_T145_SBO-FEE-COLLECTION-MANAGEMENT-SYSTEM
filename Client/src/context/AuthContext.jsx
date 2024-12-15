import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();
    const [initialCheckDone, setInitialCheckDone] = useState(false);

    useEffect(() => {
        const checkSession = () => {
            const userDetails = localStorage.getItem('userDetails');
            const token = localStorage.getItem('token');

            if (userDetails && token) {
                const parsedUser = JSON.parse(userDetails);
                const currentTime = new Date().getTime();

                if (parsedUser.sessionExpiry && currentTime < parsedUser.sessionExpiry) {
                    setUser(parsedUser);



                    if (!initialCheckDone) {
                        switch (parsedUser.position.toLowerCase().trim()) {
                            case 'officer':

                                navigate('/officer/dashboard');
                                break;
                            case 'admin':
                                navigate('/admin/dashboard');
                                break;
                            case 'treasurer':
                                navigate('/treasurer/dashboard');
                                break;
                            case 'governor':
                                navigate('/governor/dashboard');
                                break;
                        }
                    }
                } else {
                    localStorage.removeItem('userDetails');
                    localStorage.removeItem('token');
                    setUser(null);
                }
            }
            setInitialCheckDone(true);
        };

        checkSession();
    }, [navigate, initialCheckDone]);

    return (
        <AuthContext.Provider value={{ user, setUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext); 