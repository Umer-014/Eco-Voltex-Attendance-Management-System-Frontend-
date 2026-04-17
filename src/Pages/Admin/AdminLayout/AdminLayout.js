import React, { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import "./AdminLayout.css";

const AdminLayout = () => {
  const location = useLocation();
  const name = localStorage.getItem("name") || "Admin";

  const hour = new Date().getHours();
  let greeting = hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening";

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  const capitalize = (text) =>
  text ? text.charAt(0).toUpperCase() + text.slice(1) : "";

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <div className={`admin-sidebar ${isSidebarOpen ? "open" : ""}`}>
        <h2 className="logo">Eco Voltex</h2>
        <nav>
          <Link
            to="/admin/dashboard"
            className={location.pathname.includes("/admin/dashboard") || location.pathname === "/admin" ? "active" : ""}
            onClick={closeSidebar}
          >
            Dashboard
          </Link>
          <Link
            to="/admin/attendance"
            className={location.pathname.includes("/admin/attendance") ? "active" : ""}
            onClick={closeSidebar}
          >
            All Attendance
          </Link>
          <Link
            to="/admin/leave-management"
            className={location.pathname.includes("/admin/leave-management") ? "active" : ""}
            onClick={closeSidebar}
          >
            Leave Management
          </Link>

          <Link
            to="/admin/staff-directory"
            className={location.pathname.includes("/admin/staff-directory") ? "active" : ""}
            onClick={closeSidebar}
          >
            Staff Directory
          </Link>

          <Link
            to="/admin/employees"
            className={location.pathname.includes("/admin/employees") ? "active" : ""}
            onClick={closeSidebar}
          >
            Employees Creation
          </Link>
          <Link
            to="/admin/right-to-work"
            className={location.pathname.includes("/admin/right-to-work") ? "active" : ""}
            onClick={closeSidebar}
          >
            Check Right to Work
          </Link>

        </nav>
      </div>

      {/* Mobile Overlay */}
      {isSidebarOpen && <div className="admin-overlay active" onClick={closeSidebar}></div>}

      {/* Main Content */}
      <div className="admin-main">
        <div className="admin-topbar" style={{background: "gray"}}>
          <div className="admin-topbar-left">
            <button className="admin-hamburger" onClick={toggleSidebar}>
              <span></span>
              <span></span>
              <span></span>
            </button>
            <h3  style={{color: "white"}}>
              {capitalize(greeting)}, {capitalize(name)} 👋
            </h3>
          </div>

          <button
            className="admin-logout-btn"
            onClick={() => {
              localStorage.clear();
              window.location.href = "/";
            }}
          >
            Logout
          </button>
        </div>

        <div className="content">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;