import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user } = useAuth();

    // Debug logs
    console.log('Current user:', user);
    console.log('Allowed roles:', allowedRoles);

    if (!user) {
        console.log('No user found, redirecting to login');
        return <Navigate to="/sbo-fee-collection/login" replace />;
    }

    if (!allowedRoles.includes(user.position)) {
        console.log('User role not allowed:', user.position);
        return <Navigate to="/sbo-fee-collection/login" replace />;
    }

    console.log('Access granted for role:', user.position);
    return children;
};

export default ProtectedRoute; 