import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import Login from "../Pages/Login/Login";

// Employee
import EmployeeLayout from "../Pages/Employee/EmployeeLayout/EmployeeLayout";
import Dashboard from "../Pages/Employee/Dashboard/Dashboard";
import MyAttendance from "../Pages/Employee/MyAttendance/MyAttendance";

// Admin
import AdminLayout from "../Pages/Admin/AdminLayout/AdminLayout";

import ProtectedRoute from "./ProtectedRoute";

const Stack = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />

        {/* Employee Routes */}
        <Route
          path="/employee"
          element={
            <ProtectedRoute role="employee">
              <EmployeeLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="attendance" element={<MyAttendance />} />
        </Route>

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute role="admin">
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          
        </Route>

      </Routes>
    </Router>
  );
};

export default Stack;