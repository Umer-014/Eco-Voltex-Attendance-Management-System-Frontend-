import React, { useEffect, useState } from "react";
import { checkIn, checkOut, getAttendance } from "../../../api/attendanceApi";
import "./Dashboard.css";

// 🎯 Motivational Quotes
const quotes = [
  "Success is not final, failure is not fatal: it is the courage to continue that counts.",
  "Push yourself, because no one else is going to do it for you.",
  "Great things never come from comfort zones.",
  "Dream it. Wish it. Do it.",
  "Stay positive, work hard, make it happen.",
  "Don’t watch the clock; do what it does. Keep going.",
  "Your limitation—it’s only your imagination.",
  "Hard work beats talent when talent doesn’t work hard.",
];

const EmployeeDashboard = () => {
  const [attendance, setAttendance] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ New states for date & quote
  const [todayDate, setTodayDate] = useState("");
  const [quote, setQuote] = useState("");

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

    const today = new Date();

    // 📅 Format date (UK style)
    const formattedDate = today.toLocaleDateString("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    setTodayDate(formattedDate);

    // 💬 Daily quote (same for whole day)
    const dayIndex = today.getDate(); // 1–31
    const randomQuote = quotes[dayIndex % quotes.length];

    setQuote(randomQuote);
  }, []);

  // ✅ CHECK IN
  const handleCheckIn = async () => {
    if (isBeforeEightAM()) {
      setMessage("Check-in is only allowed after 8:00 AM.");
      return;
    }

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

  // ⏰ Check if current time is before 8:00 AM
  const isBeforeEightAM = () => {
    const now = new Date();
    const hours = now.getHours();
    return hours < 8;
  };

  return (
    <div className="dashboard-container">
      {/* ✅ Date + Quote */}
      <div className="dashboard-header">
        <h2 className="today-date">{todayDate}</h2>
        <p className="quote-heading">"Today's Quote"</p>
        <p className="quote">"{quote}"</p>
      </div>

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
            disabled={loading || isAbsent || isCheckedIn || isBeforeEightAM()}
            className={`btn check-in-btn ${
              loading || isAbsent || isCheckedIn || isBeforeEightAM()
                ? "disabled"
                : ""
            }`}
          >
            {isBeforeEightAM()
              ? "Available after 8:00 AM"
              : loading && !isCheckedIn
                ? "Processing..."
                : "Check In"}
            {isBeforeEightAM() && (
              <p className="status-message warning">
                You can check in only after <b>8:00 AM</b>.
              </p>
            )}
          </button>

          <button
            onClick={handleCheckOut}
            disabled={loading || isAbsent || !isCheckedIn || isCheckedOut}
            className={`btn check-out-btn ${
              loading || isAbsent || !isCheckedIn || isCheckedOut
                ? "disabled"
                : ""
            }`}
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
