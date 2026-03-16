import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, role }) => {
  const token = localStorage.getItem("token");
  console.log("ProtectedRoute - token:", token, "required role:", role);
  const userRole = localStorage.getItem("role");


  // If no token → go to login
  if (!token) {
    return <Navigate to="/" />;
  }

  // If role mismatch → go to login
  if (role && role !== userRole) {
    return <Navigate to="/" />;
  }

  return children;
};

export default ProtectedRoute;