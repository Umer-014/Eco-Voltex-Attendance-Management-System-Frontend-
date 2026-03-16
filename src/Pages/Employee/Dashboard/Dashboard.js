import React, { useEffect, useState } from "react";
import { checkIn, checkOut, getAttendance } from "../../../api/attendanceApi";
import "./Dashboard.css";

const EmployeeDashboard = () => {
  const [attendance, setAttendance] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCheckIn = async () => {
    setLoading(true);
    try {
      const data = await checkIn();
      setAttendance(data.attendance);
      setMessage(data.message);
    } catch (err) {
      setMessage(err.message);
    }
    setLoading(false);
  };

  const handleCheckOut = async () => {
    setLoading(true);
    try {
      const data = await checkOut();
      setAttendance(data.attendance);
      setMessage(data.message);
    } catch (err) {
      setMessage(err.message);
    }
    setLoading(false);
  };

  const fetchTodayAttendance = async () => {
    setLoading(true);
    try {
      const records = await getAttendance();
      const today = new Date().toDateString();
      const todayRecord = records.find(
        (att) => new Date(att.date).toDateString() === today
      );
      setAttendance(todayRecord || null);
    } catch (err) {
      setMessage(err.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTodayAttendance();
  }, []);

  const statusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "present":
        return "status-present";
      case "absent":
        return "status-absent";
      case "late":
        return "status-late";
      default:
        return "status-default";
    }
  };

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Employee Dashboard</h1>

      {message && <div className="message-box">{message}</div>}

      <div className="attendance-card">
        <h2 className="attendance-title">Today's Attendance</h2>

        {attendance ? (
          <div className="attendance-info">
            <p><strong>Date:</strong> {new Date(attendance.date).toLocaleDateString()}</p>
            <p><strong>Day:</strong> {attendance.day}</p>
            <p><strong>Check-In:</strong> {attendance.checkIn ? new Date(attendance.checkIn).toLocaleTimeString() : "-"}</p>
            <p><strong>Check-Out:</strong> {attendance.checkOut ? new Date(attendance.checkOut).toLocaleTimeString() : "-"}</p>
            <p><strong>Working Hours:</strong> {attendance.workingHours ? attendance.workingHours.toFixed(2) : "-"}</p>
            <p>
              <strong>Status:</strong>{" "}
              <span className={`status-badge ${statusColor(attendance.status)}`}>
                {attendance.status || "-"}
              </span>
            </p>
          </div>
        ) : (
          <p className="no-record">No attendance record for today.</p>
        )}

        <div className="button-group">
          <button
            onClick={handleCheckIn}
            disabled={attendance?.checkIn || loading}
            className={`btn check-in-btn ${
              attendance?.checkIn || loading ? "disabled" : ""
            }`}
          >
            {loading && !attendance?.checkIn ? "Processing..." : "Check In"}
          </button>

          <button
            onClick={handleCheckOut}
            disabled={!attendance?.checkIn || attendance?.checkOut || loading}
            className={`btn check-out-btn ${
              !attendance?.checkIn || attendance?.checkOut || loading ? "disabled" : ""
            }`}
          >
            {loading && attendance?.checkIn && !attendance?.checkOut ? "Processing..." : "Check Out"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;