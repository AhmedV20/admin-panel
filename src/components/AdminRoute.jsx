import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const AdminRoute = () => {
  const token = localStorage.getItem('aToken');

  if (!token) {
    return <Navigate to="/login" />;
  }

  try {
    const decodedToken = jwtDecode(token);
    const userRole = decodedToken.role || decodedToken['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];

    if (userRole !== 'Admin') {
      return <Navigate to="/login" />;
    }
  } catch (error) {
    console.error("Invalid token:", error);
    return <Navigate to="/login" />;
  }

  return <Outlet />;
};

export default AdminRoute; 