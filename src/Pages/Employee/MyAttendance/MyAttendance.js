import React, { useEffect, useState, useMemo } from "react";
import { getAttendance } from "../../../api/attendanceApi"; // Adjust path if needed
import "./MyAttendance.css";

const MyAttendance = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const fetchAttendance = async () => {
    try {
      // Mock data for testing if API is unavailable, otherwise use your API
      const data = await getAttendance(); 
      setRecords(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching attendance:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  const filteredRecords = useMemo(() => {
    return records
      .filter((item) => {
        const matchesSearch =
          (item.date || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
          (item.day || "").toLowerCase().includes(searchTerm.toLowerCase());

        const matchesFilter =
          filterStatus === "all" ||
          (item.status || "").toLowerCase() === filterStatus;

        return matchesSearch && matchesFilter;
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [records, searchTerm, filterStatus]);

  const stats = useMemo(() => {
    const present = records.filter((r) => r.status?.toLowerCase() === "present").length;
    const late = records.filter((r) => r.status?.toLowerCase() === "late").length;
    const absent = records.filter((r) => r.status?.toLowerCase() === "absent").length;
    return { present, late, absent, total: records.length };
  }, [records]);

  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case "present": return "status-badge present";
      case "late": return "status-badge late";
      case "absent": return "status-badge absent";
      default: return "status-badge";
    }
  };

  return (
    <div className="attendance-page">
      <div className="page-header">
        <h1>My Attendance</h1>
      </div>

      {/* Stats Cards */}
      <div className="stats-container">
        <div className="stat-card present">
          <div className="stat-icon">✓</div>
          <div>
            <div className="stat-number">{stats.present}</div>
            <div className="stat-label">Present</div>
          </div>
        </div>
        <div className="stat-card late">
          <div className="stat-icon">🕒</div>
          <div>
            <div className="stat-number">{stats.late}</div>
            <div className="stat-label">Late</div>
          </div>
        </div>
        <div className="stat-card absent">
          <div className="stat-icon">✕</div>
          <div>
            <div className="stat-number">{stats.absent}</div>
            <div className="stat-label">Absent</div>
          </div>
        </div>
        <div className="stat-card total">
          <div className="stat-icon">📅</div>
          <div>
            <div className="stat-number">{stats.total}</div>
            <div className="stat-label">Total Days</div>
          </div>
        </div>
      </div>

      <div className="attendance-card">
        <div className="toolbar">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search by date or day..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
              aria-label="Search attendance records"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
            aria-label="Filter by status"
          >
            <option value="all">All Records</option>
            <option value="present">Present Only</option>
            <option value="late">Late Only</option>
            <option value="absent">Absent Only</option>
          </select>
        </div>

        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading attendance records...</p>
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="empty-state">
            <p>No attendance records found</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="attendance-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Day</th>
                  <th>Check-In</th>
                  <th>Check-Out</th>
                  <th>Status</th>
                  <th>Hours Worked</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((item) => (
                  <tr key={item._id || item.date}>
                    {/* Added data-label for mobile view targeting */}
                    <td data-label="Date">
                      {new Date(item.date).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td data-label="Day">{item.day}</td>
                    <td data-label="Check-In">
                      {item.checkIn
                        ? new Date(item.checkIn).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "—"}
                    </td>
                    <td data-label="Check-Out">
                      {item.checkOut
                        ? new Date(item.checkOut).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "—"}
                    </td>
                    <td data-label="Status">
                      <span className={getStatusClass(item.status)}>
                        {item.status || "—"}
                      </span>
                    </td>
                    <td data-label="Hours Worked">
                      {item.workingHours ? `${item.workingHours.toFixed(1)} hrs` : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyAttendance;