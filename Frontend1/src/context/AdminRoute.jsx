import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext.jsx';
import PropTypes from 'prop-types';

export const AdminRoute = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#69DC9E]"></div>
      </div>
    );
  }

  // Sprawdzamy, czy użytkownik jest zalogowany i ma odpowiednią rolę
  if (!user || (user.role !== 'admin' && user.role !== 'moderator')) {
    return <Navigate to="/403" replace />;
  }

  return <>{children}</>;
};

AdminRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

export default AdminRoute;