import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectCurrentUser, selectIsAuthenticated } from '../features/auth/authSlice';

export default function AdminRoute({ children }) {
  const user = useSelector(selectCurrentUser);
  const isAuth = useSelector(selectIsAuthenticated);
  if (!isAuth) return <Navigate to="/login" replace />;
  if (!user || (user.role !== 'admin' && user.role !== 'staff'))
    return <Navigate to="/customer/dashboard" replace />;
  return children;
}
