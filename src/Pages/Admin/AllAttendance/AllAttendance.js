import React, { useEffect, useState, useMemo } from "react";
import { getAttendance } from "../../../api/attendanceApi";
import { Download } from "lucide-react";
import "./AllAttendance.css";

const AllAttendance = () => {
  const [records, setRecords] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchAllAttendance = async () => {
    try {
      const data = await getAttendance();
      setRecords(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllAttendance();
  }, []);

  const filteredRecords = useMemo(() => {
    return records
      .filter((rec) => {
        const matchesSearch = 
          rec.employeeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          rec.day?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === "all" || rec.status?.toLowerCase() === statusFilter;

        let matchesDate = true;
        if (dateFrom || dateTo) {
          const recDate = new Date(rec.date);
          if (dateFrom) matchesDate = matchesDate && recDate >= new Date(dateFrom);
          if (dateTo) matchesDate = matchesDate && recDate <= new Date(dateTo);
        }

        return matchesSearch && matchesStatus && matchesDate;
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [records, searchTerm, statusFilter, dateFrom, dateTo]);

  const exportToCSV = () => {
    const headers = ["Employee", "Date", "Day", "Check-In", "Check-Out", "Status", "Hours"];
    const rows = filteredRecords.map(r => [
      r.employeeName,
      new Date(r.date).toLocaleDateString(),
      r.day,
      r.checkIn ? new Date(r.checkIn).toLocaleTimeString() : "",
      r.checkOut ? new Date(r.checkOut).toLocaleTimeString() : "",
      r.status,
      r.workingHours ? r.workingHours.toFixed(2) : "0"
    ]);

    let csv = headers.join(",") + "\n";
    rows.forEach(row => {
      csv += row.map(field => `"${field}"`).join(",") + "\n";
    });

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `attendance_${new Date().toISOString().slice(0,10)}.csv`;
    link.click();
  };

  return (
    <div className="all-attendance-page">
      <div className="page-header">
        <h1>All Attendance Records</h1>
        <button onClick={exportToCSV} className="export-btn">
          <Download size={18} /> Export CSV
        </button>
      </div>

      <div className="filters">
        <input
          type="text"
          placeholder="Search employee or day..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />

        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="filter-select">
          <option value="all">All Status</option>
          <option value="present">Present</option>
          <option value="late">Late</option>
          <option value="absent">Absent</option>
        </select>

        <input
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          className="date-input"
        />
        <input
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          className="date-input"
        />
      </div>

      {loading ? (
        <p>Loading records...</p>
      ) : (
        <div className="table-container">
          <table className="attendance-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Date</th>
                <th>Day</th>
                <th>Check-In</th>
                <th>Check-Out</th>
                <th>Status</th>
                <th>Hours</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map((rec) => (
                <tr key={rec._id}>
                  <td>{rec.employeeName}</td>
                  <td>{new Date(rec.date).toLocaleDateString()}</td>
                  <td>{rec.day}</td>
                  <td>{rec.checkIn ? new Date(rec.checkIn).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : "-"}</td>
                  <td>{rec.checkOut ? new Date(rec.checkOut).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : "-"}</td>
                  <td>
                    <span className={`status-badge ${rec.status?.toLowerCase()}`}>
                      {rec.status}
                    </span>
                  </td>
                  <td>{rec.workingHours ? rec.workingHours.toFixed(2) : "0.00"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AllAttendance;