// frontend/src/components/auth/AuthGuard.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../common/LoadingSpinner';

const AuthGuard = ({ children }) => {
  const { user, loading } = useAuth();
  
  console.log('AuthGuard - Loading:', loading, 'User:', user?.email);
  
  if (loading) {
    return <LoadingSpinner text="Checking authentication..." />;
  }
  
  if (!user) {
    console.log('AuthGuard - No user, redirecting to login');
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

export default AuthGuard;