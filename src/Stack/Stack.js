import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import Login from "../Pages/Login/Login";

// Employee
import EmployeeLayout from "../Pages/Employee/EmployeeLayout/EmployeeLayout";
import Dashboard from "../Pages/Employee/Dashboard/Dashboard";
import MyAttendance from "../Pages/Employee/MyAttendance/MyAttendance";
import RequestLeave from "../Pages/Employee/RequestLeave/RequestLeave";
import MyLeaves from "../Pages/Employee/MyLeaves/MyLeaves";

// Admin
import AdminLayout from "../Pages/Admin/AdminLayout/AdminLayout";
import AdminDashboard from "../Pages/Admin/Dashboard/AdminDashboard";
import AllAttendance from "../Pages/Admin/AllAttendance/AllAttendance";
import Employees from "../Pages/Admin/Employees/Employees";
import RightToWork from "../Pages/Admin/RightToWork/RightToWork";
import StaffDirectory from "../Pages/Admin/StaffDirectory/StaffDirectory";
import StaffDetail from "../Pages/Admin/StaffDirectory/StaffDetail";
import LeaveManagement from "../Pages/Admin/LeaveManagement/LeaveManagement";


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
          <Route path="request-leave" element={<RequestLeave />} />
          <Route path="my-leaves" element={<MyLeaves />} />
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
          <Route index element={<AdminDashboard />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="attendance" element={<AllAttendance />} />
          <Route path="employees" element={<Employees />} />
          <Route path="right-to-work" element={<RightToWork />} />
          <Route path="staff-directory" element={<StaffDirectory />} />
          <Route path="staff/:id" element={<StaffDetail />} />
          <Route path="leave-management" element={<LeaveManagement />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default Stack;