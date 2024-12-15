import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user } = useAuth();
    const navigate = useNavigate();

    console.log('Current user:', user);
    console.log('Allowed roles:', allowedRoles);

    if (!user) {
        console.log('No user found, redirecting to login');
        return <Navigate to="/sbo-fee-collection/login" replace />;
    }

    const userRole = user.position.toLowerCase();
    const normalizedAllowedRoles = allowedRoles.map(role => role.toLowerCase());

    if (!normalizedAllowedRoles.includes(userRole)) {
        console.log(`User role not allowed: ${userRole}`);
        return <Navigate to="/sbo-fee-collection/login" replace />;
    }

    return children;
};

export default ProtectedRoute; 