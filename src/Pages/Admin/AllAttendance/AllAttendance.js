import React, { useEffect, useState, useMemo } from "react";
import {
  getAttendance,
  getAttendanceByEmployee,
} from "../../../api/attendanceApi";
import { getAllStaff } from "../../../api/authApi";
import { Download, Search, Lock } from "lucide-react";
import "./AllAttendance.css";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

const AllAttendance = () => {
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("all");

  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      let attendanceData = [];

      if (selectedEmployeeId === "all") {
        attendanceData = await getAttendance();
      } else {
        attendanceData = await getAttendanceByEmployee(selectedEmployeeId);
      }

      const staffData = await getAllStaff();

      console.log(`Setting ${attendanceData.length} attendance records`); // Debug

      setAttendanceRecords(attendanceData); // ← Direct assignment (no wrapping)
      setEmployees(staffData.filter((emp) => emp.role === "employee"));
    } catch (err) {
      console.error("❌ Fetch Error:", err);
      setError(err.message || "Failed to load data");
      setAttendanceRecords([]); // Clear on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedEmployeeId]); // Keep only this for now

  // ==================== FILTERING ====================

  const monthlyRecords = useMemo(() => {
    if (!attendanceRecords || attendanceRecords.length === 0) return [];

    return attendanceRecords
      .filter((rec) => {
        if (!rec?.date) return false;

        const recordDate = new Date(rec.date);
        if (isNaN(recordDate.getTime())) return false;

        return (
          recordDate.getMonth() === selectedMonth &&
          recordDate.getFullYear() === selectedYear
        );
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date)); // newest first
  }, [attendanceRecords, selectedMonth, selectedYear]);

  const filteredRecords = useMemo(() => {
    return monthlyRecords
      .filter((rec) => {
        const emp = employees.find(
          (e) =>
            String(e._id) === String(rec.employeeId) ||
            String(e.employeeId) === String(rec.employeeId),
        );

        const employeeName = rec.employeeName || emp?.name || "";
        const employeeID = emp?.employeeId || "";

        const matchesSearch =
          employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          employeeID.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (rec.day || "").toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus =
          statusFilter === "all" ||
          (rec.status || "").toLowerCase() === statusFilter.toLowerCase();

        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [monthlyRecords, searchTerm, statusFilter, employees]);

  // Stats
  const stats = useMemo(() => {
    const totalHours = monthlyRecords.reduce(
      (sum, r) => sum + (r.workingHours || 0),
      0,
    );
    const present = monthlyRecords.filter(
      (r) => r.status?.toLowerCase() === "present",
    ).length;
    const late = monthlyRecords.filter(
      (r) => r.status?.toLowerCase() === "late",
    ).length;
    const absent = monthlyRecords.filter(
      (r) => r.status?.toLowerCase() === "absent",
    ).length;
    const totalDays = monthlyRecords.length;
    const avgHours = totalDays ? (totalHours / totalDays).toFixed(1) : "0.0";
    const attendanceRate = totalDays
      ? ((present / totalDays) * 100).toFixed(1)
      : "0";

    return {
      totalHours,
      present,
      late,
      absent,
      totalDays,
      avgHours,
      attendanceRate,
    };
  }, [monthlyRecords]);

  // Chart Data
  const chartData = useMemo(() => {
    const sorted = [...monthlyRecords].sort(
      (a, b) => new Date(a.date) - new Date(b.date),
    );
    return {
      labels: sorted.map((rec) =>
        new Date(rec.date).toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
        }),
      ),
      datasets: [
        {
          label: "Hours Worked",
          data: sorted.map((rec) => rec.workingHours || 0),
          backgroundColor: sorted.map((rec) => {
            const s = rec.status?.toLowerCase();
            return s === "present"
              ? "#10b981"
              : s === "late"
                ? "#f59e0b"
                : "#ef4444";
          }),
          borderRadius: 8,
          barThickness: 26,
        },
      ],
    };
  }, [monthlyRecords]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true, grid: { color: "#f1f5f9" } },
      x: { grid: { display: false } },
    },
  };

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  // Month Navigation with Restriction
  const changeMonth = (direction) => {
    let newMonth = selectedMonth + direction;
    let newYear = selectedYear;

    if (newMonth > 11) {
      newMonth = 0;
      newYear++;
    }
    if (newMonth < 0) {
      newMonth = 11;
      newYear--;
    }

    const newDate = new Date(newYear, newMonth);
    const minDate = new Date(2026, 1); // Feb 2026
    const maxDate = new Date();

    if (newDate < minDate || newDate > maxDate) return;

    setSelectedMonth(newMonth);
    setSelectedYear(newYear);
  };

  const currentViewDate = new Date(selectedYear, selectedMonth);
  const minDate = new Date(2026, 1);
  const maxDate = new Date();

  const isPrevDisabled = currentViewDate <= minDate;
  const isNextDisabled =
    currentViewDate.getMonth() === maxDate.getMonth() &&
    currentViewDate.getFullYear() === maxDate.getFullYear();

  // Export CSV
  const exportToCSV = () => {
    const headers = [
      "Employee ID",
      "Employee Name",
      "Date",
      "Day",
      "Check-In",
      "Check-Out",
      "Status",
      "Hours Worked",
    ];

    const rows = filteredRecords.map((rec) => {
      const emp = employees.find(
        (e) =>
          String(e._id) === String(rec.employeeId) ||
          String(e.employeeId) === String(rec.employeeId),
      );

      return [
        rec.employeeId || "N/A",
        rec.employeeName || emp?.name || "Unknown",
        new Date(rec.date).toLocaleDateString(),
        rec.day || "",
        rec.checkIn ? new Date(rec.checkIn).toLocaleTimeString() : "",
        rec.checkOut ? new Date(rec.checkOut).toLocaleTimeString() : "",
        rec.status || "",
        rec.workingHours ? rec.workingHours.toFixed(2) : "0",
      ];
    });

    let csv = headers.join(",") + "\n";
    rows.forEach(
      (row) => (csv += row.map((field) => `"${field}"`).join(",") + "\n"),
    );

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `attendance_${monthNames[selectedMonth]}_${selectedYear}.csv`;
    link.click();
  };

  // Circular Progress Component
  const CircularProgress = ({ value, max, label, color, unit = "" }) => {
    const percentage = Math.min((value / max) * 100, 100);
    const radius = 56;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;

    return (
      <div className="circular-progress">
        <svg width="160" height="160" viewBox="0 0 160 160">
          <circle
            cx="80"
            cy="80"
            r={radius}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="16"
          />
          <circle
            cx="80"
            cy="80"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="16"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            transform="rotate(-90 80 80)"
          />
        </svg>
        <div className="progress-content">
          <div className="progress-value">
            {value.toFixed(1)}
            {unit}
          </div>
          <div className="progress-label">{label}</div>
        </div>
      </div>
    );
  };

  if (error) {
    return (
      <div className="error-message">
        <p>{error}</p>
        <button onClick={fetchData}>Retry</button>
      </div>
    );
  }

  return (
    <div className="all-attendance-page">
      <div className="page-header">
        <div>
          <h1>All Employee Attendance</h1>
          <p className="subtitle">Monthly attendance records</p>
        </div>

        <div className="controls">
          <div className="month-nav">
            <button
              onClick={() => changeMonth(-1)}
              className="nav-btn"
              disabled={isPrevDisabled}
            >
              {isPrevDisabled ? <Lock size={16} /> : "←"}
            </button>

            <div className="current-month">
              {monthNames[selectedMonth]} {selectedYear}
            </div>

            <button
              onClick={() => changeMonth(1)}
              className="nav-btn"
              disabled={isNextDisabled}
            >
              {isNextDisabled ? <Lock size={16} /> : "→"}
            </button>
          </div>

          <button onClick={exportToCSV} className="export-btn">
            <Download size={18} /> Export CSV
          </button>
        </div>
      </div>

      {/* Employee Filter */}
      <div className="employee-filter">
        <label>Select Employee: </label>
        <select
          value={selectedEmployeeId}
          onChange={(e) => setSelectedEmployeeId(e.target.value)}
          className="employee-select"
        >
          <option value="all">All Employees</option>
          {employees.map((emp) => (
            <option key={emp._id} value={emp._id}>
              {emp.name} ({emp.employeeId})
            </option>
          ))}
        </select>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card total big">
          <CircularProgress
            value={stats.totalHours}
            max={220}
            label="Total Hours Worked"
            color="#3b82f6"
          />
        </div>
        <div className="stat-card present">
          <div className="stat-icon">✓</div>
          <div className="stat-info">
            <div className="stat-number">{stats.present}</div>
            <div className="stat-label">Present</div>
          </div>
        </div>
        <div className="stat-card late">
          <div className="stat-icon">🕒</div>
          <div className="stat-info">
            <div className="stat-number">{stats.late}</div>
            <div className="stat-label">Late</div>
          </div>
        </div>
        <div className="stat-card absent">
          <div className="stat-icon">✕</div>
          <div className="stat-info">
            <div className="stat-number">{stats.absent}</div>
            <div className="stat-label">Absent</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters">
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search by name, day or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="filter-select"
        >
          <option value="all">All Status</option>
          <option value="present">Present</option>
          <option value="late">Late</option>
          <option value="absent">Absent</option>
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="loading-state">Loading...</div>
      ) : filteredRecords.length === 0 ? (
        <div className="empty-state">
          No matching attendance records found for this selection.
        </div>
      ) : (
        <div className="table-container">
          <table className="attendance-table">
            <thead>
              <tr>
                <th>Employee ID</th>
                <th>Employee Name</th>
                <th>Date</th>
                <th>Day</th>
                <th>Check-In</th>
                <th>Check-Out</th>
                <th>Status</th>
                <th>Hours Worked</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map((rec) => {
                const emp = employees.find(
                  (e) =>
                    String(e._id) === String(rec.employeeId) ||
                    String(e.employeeId) === String(rec.employeeId),
                );

                return (
                  <tr key={rec._id || rec.date}>
                    <td>
                      <strong>{emp?.employeeId || "N/A"}</strong>
                    </td>
                    <td>{rec.employeeName || emp?.name || "Unknown"}</td>
                    <td>
                      {new Date(rec.date).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td>{rec.day}</td>
                    <td>
                      {rec.checkIn
                        ? new Date(rec.checkIn).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "—"}
                    </td>
                    <td>
                      {rec.checkOut
                        ? new Date(rec.checkOut).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "—"}
                    </td>
                    <td>
                      <span
                        className={`status-badge ${rec.status?.toLowerCase() || ""}`}
                      >
                        {rec.status || "—"}
                      </span>
                    </td>
                    <td>
                      {rec.workingHours
                        ? `${rec.workingHours.toFixed(1)} hrs`
                        : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AllAttendance;
