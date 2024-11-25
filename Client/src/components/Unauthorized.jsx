import React from 'react';
import { useNavigate } from 'react-router-dom';

const Unauthorized = () => {
    const navigate = useNavigate();

    return (
        <div className="d-flex align-items-center justify-content-center" style={{ height: '100vh' }}>
            <div className="text-center">
                <h1 className="display-1 fw-bold">403</h1>
                <p className="fs-3">Access Denied</p>
                <p className="lead">
                    You do not have permission to access this resource.
                </p>
                <button
                    className="btn btn-primary"
                    onClick={() => navigate(-1)}
                >
                    Go Back
                </button>
            </div>
        </div>
    );
};

export default Unauthorized; 