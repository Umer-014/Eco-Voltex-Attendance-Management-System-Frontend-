import React, { useEffect, useState } from "react";
import { checkIn, checkOut, getAttendance } from "../../../api/attendanceApi";
import "./Dashboard.css";

const EmployeeDashboard = () => {
  const [attendance, setAttendance] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // 🔄 Fetch today's attendance
  const fetchTodayAttendance = async () => {
    try {
      const records = await getAttendance();
      const today = new Date().toDateString();

      const todayRecord = records.find(
        (att) => new Date(att.date).toDateString() === today,
      );

      setAttendance(todayRecord || null);
    } catch (err) {
      setMessage(err.message);
    }
  };

  useEffect(() => {
    fetchTodayAttendance();
  }, []);

  // ✅ CHECK IN
  const handleCheckIn = async () => {
    setLoading(true);
    try {
      const data = await checkIn();
      setMessage(data.message);
      await fetchTodayAttendance();
    } catch (err) {
      setMessage(err.message);
    }
    setLoading(false);
  };

  // ✅ CHECK OUT
  const handleCheckOut = async () => {
    setLoading(true);
    try {
      const data = await checkOut();
      setMessage(data.message);
      await fetchTodayAttendance();
    } catch (err) {
      setMessage(err.message);
    }
    setLoading(false);
  };

  // 🎯 STATUS LOGIC
  const status = attendance?.status || "";
  const isAbsent = status === "Absent";
  const isCheckedIn = !!attendance?.checkIn;
  const isCheckedOut = !!attendance?.checkOut;

  const statusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "present":
        return "status-present";
      case "late":
        return "status-late";
      case "absent":
        return "status-absent";
      default:
        return "status-default";
    }
  };

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Employee Dashboard</h1>

      {message && <div className="message-box">{message}</div>}

      <div className="dashboard-attendance-card">
        <h2 className="dashboard-attendance-title">Today's Attendance</h2>

        {/* ✅ Attendance Info */}
        {attendance ? (
          <div className="dashboard-attendance-info">
            <p>
              <strong>Date:</strong>{" "}
              {new Date(attendance.date).toLocaleDateString()}
            </p>

            <p>
              <strong>Day:</strong> {attendance.day}
            </p>

            <p>
              <strong>Check-In:</strong>{" "}
              {attendance.checkIn
                ? new Date(attendance.checkIn).toLocaleTimeString()
                : "-"}
            </p>

            <p>
              <strong>Check-Out:</strong>{" "}
              {attendance.checkOut
                ? new Date(attendance.checkOut).toLocaleTimeString()
                : "-"}
            </p>

            <p>
              <strong>Working Hours:</strong>{" "}
              {attendance.workingHours
                ? attendance.workingHours.toFixed(2)
                : "0"}
            </p>

            <p>
              <strong>Status:</strong>{" "}
              <span className={`dashboard-status-badge ${statusColor(status)}`}>
                {status || "-"}
              </span>
            </p>
          </div>
        ) : (
          <p className="dashboard-no-record">No attendance record for today.</p>
        )}

        {/* ✅ STATUS MESSAGES */}
        {isAbsent && (
          <p className="status-message error">
            You are marked <b>Absent</b> today (after 11:00 AM).
          </p>
        )}

        {status === "Late" && (
          <p className="status-message warning">
            You were marked <b>Late</b> today.
          </p>
        )}

        {/* ✅ BUTTONS */}
        <div className="dashboard-button-group">
          <button
            onClick={handleCheckIn}
            disabled={loading || isAbsent || isCheckedIn}
            className={`btn check-in-btn ${
              loading || isAbsent || isCheckedIn ? "disabled" : ""
            }`}
            aria-label="Check In"
          >
            {loading && !isCheckedIn ? "Processing..." : "Check In"}
          </button>

          <button
            onClick={handleCheckOut}
            disabled={loading || isAbsent || !isCheckedIn || isCheckedOut}
            className={`btn check-out-btn ${
              loading || isAbsent || !isCheckedIn || isCheckedOut
                ? "disabled"
                : ""
            }`}
            aria-label="Check Out"
          >
            {loading && isCheckedIn && !isCheckedOut
              ? "Processing..."
              : "Check Out"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;