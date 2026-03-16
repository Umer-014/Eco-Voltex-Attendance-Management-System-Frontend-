import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "../Pages/Login/Login";
import EmployeeDashboard from "../Pages/Employee/Dashboard/Dashboard";
import ProtectedRoute from "./ProtectedRoute";

const Stack = () => {
  return (
    <Router>
      <Routes>
        {/* Route Definitions */}
        <Route path="/" element={<Login />} />
        <Route
          path="/EmployeeDashboard"
          element={
            <ProtectedRoute role="employee">
              <EmployeeDashboard />
            </ProtectedRoute>
          }
        />

      </Routes>
    </Router>
  );
};

export default Stack;
