import React from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import "./EmployeeLayout.css";

const EmployeeLayout = () => {
  const location = useLocation();
  const name = localStorage.getItem("name");

  const hour = new Date().getHours();
  let greeting = "Welcome";

  if (hour < 12) greeting = "Good Morning";
  else if (hour < 18) greeting = "Good Afternoon";
  else greeting = "Good Evening";

  return (
    <div className="layout">
      {/* Sidebar */}
      <div className="sidebar">
        <h2 className="logo">Eco Voltex</h2>

        <nav>
          <Link
            to="/employee/dashboard"
            className={
              location.pathname === "/employee/dashboard" ? "active" : ""
            }
          >
            Dashboard
          </Link>

          <Link
            to="/employee/attendance"
            className={
              location.pathname === "/employee/attendance" ? "active" : ""
            }
          >
            My Attendance
          </Link>
        </nav>
      </div>

      {/* Main Section */}
      <div className="main">
        {/* Topbar */}
        <div className="topbar">
          <h3>
            {greeting}, {name} 👋
          </h3>

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

        {/* Content */}
        <div className="content">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default EmployeeLayout;
