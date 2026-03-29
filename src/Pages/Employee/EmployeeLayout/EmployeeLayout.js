import React, { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import "./EmployeeLayout.css";

const EmployeeLayout = () => {
  const location = useLocation();
  const name = localStorage.getItem("name") || "Employee";

  const hour = new Date().getHours();
  let greeting = "Welcome";
  if (hour < 12) greeting = "Good Morning";
  else if (hour < 18) greeting = "Good Afternoon";
  else greeting = "Good Evening";

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="layout">
      {/* Sidebar - slides in on mobile */}
      <div className={`sidebar ${isSidebarOpen ? "open" : ""}`}>
        <h2 className="logo">Eco Voltex</h2>

        <nav>
          <Link
            to="/employee/dashboard"
            className={
              location.pathname === "/employee/dashboard" ? "active" : ""
            }
            onClick={closeSidebar}
          >
            Dashboard
          </Link>

          <Link
            to="/employee/attendance"
            className={
              location.pathname === "/employee/attendance" ? "active" : ""
            }
            onClick={closeSidebar}
          >
            My Attendance
          </Link>
        </nav>
      </div>

      {/* Mobile Overlay (click to close) */}
      {isSidebarOpen && (
        <div className="overlay active" onClick={closeSidebar}></div>
      )}

      {/* Main Section */}
      <div className="main">
        {/* Topbar */}
        <div className="topbar">
          <div className="topbar-left">
            {/* Hamburger - only visible on mobile */}
            <button className="hamburger" onClick={toggleSidebar} aria-label="Toggle menu">
              <span></span>
              <span></span>
              <span></span>
            </button>

            <h3>
              {greeting}, {name} 👋
            </h3>
          </div>

          <button
            className="logout-btn"
            onClick={() => {
              localStorage.clear();
              window.location.href = "/";
            }}
          >
            Logout
          </button>
        </div>

        {/* Content Area */}
        <div className="content">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default EmployeeLayout;