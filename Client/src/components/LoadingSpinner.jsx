import React from 'react';
import '../assets/css/LoadingSpinner.css';

const LoadingSpinner = ({ text = "Loading", icon = "circle-notch", subtext }) => {
    // Determine the appropriate icon and color based on the loading context
    const getIconConfig = () => {
        switch (icon) {
            // OFFICER
            case 'users':
                return { icon: 'users', color: '#FF8C00', animation: 'users-pulse' };
            // ADMIN
            case 'user-shield':
                return { icon: 'user-shield', color: '#FF8C00', animation: 'shield-pulse' };
            // STUDENT
            case 'user-graduate':
                return { icon: 'user-graduate', color: '#FF8C00', animation: 'student-pulse' };
            // HISTORY
            case 'history':
                return { icon: 'history', color: '#FF8C00', animation: 'history-spin' };
            // COIN
            case 'coin':
                return { icon: 'coins', color: '#FF8C00', animation: 'coin-pulse' };
            // REPORTS
            case 'reports':
                return { icon: 'file-alt', color: '#FF8C00', animation: 'reports-pulse' };
            // CALENDAR
            case 'calendar':
                return { icon: 'calendar-alt', color: '#FF8C00', animation: 'calendar-pulse' };
            // ARCHIVED
            case 'archived':
                return { icon: 'archive', color: '#FF8C00', animation: 'archive-pulse' };
            // FILE
            case 'file':
                return { icon: 'file', color: '#FF8C00', animation: 'file-bounce' };
            // EMAIL
            case 'envelope':
                return { icon: 'envelope', color: '#FF8C00', animation: 'envelope-pulse' };
            // CONTROL
            case 'access':
                return { icon: 'lock', color: '#FF8C00', animation: 'access-pulse' };
            default:
                return { icon: 'circle-notch', color: '#FF8C00', animation: 'default-pulse' };
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