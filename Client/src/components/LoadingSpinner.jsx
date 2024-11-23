import React from 'react';
import '../assets/css/LoadingSpinner.css';

const LoadingSpinner = ({ text = "Loading", icon = "circle-notch", subtext }) => {
    // Determine the appropriate icon and color based on the loading context
    const getIconConfig = () => {
        switch (icon) {
            case 'users':
                return { icon: 'users', color: '#FF8C00', animation: 'users-pulse' };
            case 'user-shield':
                return { icon: 'user-shield', color: '#FF8C00', animation: 'shield-pulse' };
            case 'user-graduate':
                return { icon: 'user-graduate', color: '#FF8C00', animation: 'student-pulse' };
            case 'history':
                return { icon: 'history', color: '#FF8C00', animation: 'history-spin' };
            default:
                return { icon: 'circle-notch', color: '#FF8C00', animation: 'spin' };
        }
    };

    const iconConfig = getIconConfig();

    return (
        <div className="loading-container">
            <div className="loading-content">
                <div className="loading-icons">
                    <div className="icon-wrapper">
                        <i className={`fas fa-${iconConfig.icon} loading-icon ${iconConfig.animation}`}
                            style={{ color: iconConfig.color }} />
                    </div>
                    <div className="spinner-ring"></div>
                </div>
                <div className="loading-text">
                    {text.split('').map((char, index) => (
                        <span key={index}>{char}</span>
                    ))}
                    <span>.</span>
                    <span>.</span>
                    <span>.</span>
                </div>
                {subtext && (
                    <div className="loading-subtext">
                        {subtext}
                    </div>
                )}
            </div>
        </div>
    );
};

export default LoadingSpinner; 