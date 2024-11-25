import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const PermissionWrapper = ({ requiredPermission, permissionLevel = 'edit', children }) => {
    const [hasPermission, setHasPermission] = useState(false);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const checkPermission = async () => {
            try {
                const token = localStorage.getItem('token');
                const userDetails = JSON.parse(localStorage.getItem('userDetails'));
                const response = await axios.get(
                    `http://localhost:8000/api/permissions/${userDetails._id}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                const permissions = response.data.data || {};
                const permission = permissions[requiredPermission];

                if (permissionLevel === 'edit' && permission !== 'edit') {
                    navigate('/unauthorized');
                    return;
                }

                if (permissionLevel === 'view' && permission === 'denied') {
                    navigate('/unauthorized');
                    return;
                }

                setHasPermission(true);
            } catch (error) {
                console.error('Permission check failed:', error);
                navigate('/unauthorized');
            } finally {
                setLoading(false);
            }
        };

        checkPermission();
    }, [requiredPermission, permissionLevel, navigate]);

    if (loading) {
        return <div>Loading...</div>;
    }

    return hasPermission ? children : null;
};

export default PermissionWrapper; 