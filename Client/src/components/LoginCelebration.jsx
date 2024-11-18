import React, { useState, useEffect } from 'react';
import Confetti from 'react-confetti';

const LoginCelebration = () => {
    const [showConfetti, setShowConfetti] = useState(() => {
        // Check if celebration has already been shown
        const hasShown = localStorage.getItem('celebrationShown');
        if (!hasShown) {
            localStorage.setItem('celebrationShown', 'true');
            return true;
        }
        return false;
    });

    const [windowDimension, setWindowDimension] = useState({
        width: window.innerWidth,
        height: window.innerHeight
    });

    useEffect(() => {
        if (showConfetti) {
            const timeout = setTimeout(() => {
                setShowConfetti(false);
            }, 5000);

            const handleResize = () => {
                setWindowDimension({
                    width: window.innerWidth,
                    height: window.innerHeight
                });
            };

            window.addEventListener('resize', handleResize);

            return () => {
                clearTimeout(timeout);
                window.removeEventListener('resize', handleResize);
            };
        }
    }, [showConfetti]);

    return showConfetti ? (
        <Confetti
            width={windowDimension.width}
            height={windowDimension.height}
            recycle={true}
            numberOfPieces={200}
            gravity={0.3}
            colors={['#FF8C00', '#FFB84D', '#FFA500', '#FFD700', '#FFFF00']}
        />
    ) : null;
};

export default LoginCelebration; 