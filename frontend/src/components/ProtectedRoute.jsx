import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  // If user is already authenticated in state or localStorage, render immediately with 0 delay
  if (isAuthenticated || user || localStorage.getItem('user')) {
    return children;
  }

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1rem',
          backgroundColor: '#FFF8F2',
        }}
      >
        <div
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            border: '3px solid #FFE5DC',
            borderTopColor: '#F45B55',
            animation: 'spin 0.8s linear infinite',
          }}
        />
        <p style={{ color: '#72787B', fontWeight: 600, fontSize: '0.92rem' }}>
          Loading Recipe Stash...
        </p>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return <Navigate to="/login" state={{ from: location }} replace />;
};

export default ProtectedRoute;
