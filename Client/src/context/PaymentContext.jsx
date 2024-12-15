import React, { createContext, useContext, useState } from 'react';

const PaymentContext = createContext();

export const PaymentProvider = ({ children }) => {
    const [paymentUpdate, setPaymentUpdate] = useState(0);

    const triggerPaymentUpdate = () => {
        setPaymentUpdate(prev => prev + 1);
    };

    return (
        <PaymentContext.Provider value={{ paymentUpdate, triggerPaymentUpdate }}>
            {children}
        </PaymentContext.Provider>
    );
};

export const usePayment = () => useContext(PaymentContext); 