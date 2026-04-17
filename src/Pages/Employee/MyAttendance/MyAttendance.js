import React, { useEffect, useState, useMemo } from "react";
import { getAttendance } from "../../../api/attendanceApi";
import { Search, Lock } from "lucide-react";
import "./MyAttendance.css";
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

const MyAttendance = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const fetchAttendance = async () => {
    try {
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

  // Filter records by selected month & year
  const monthlyRecords = useMemo(() => {
    return records.filter((item) => {
      const date = new Date(item.date);
      return (
        date.getMonth() === selectedMonth && date.getFullYear() === selectedYear
      );
    });
  }, [records, selectedMonth, selectedYear]);

  const filteredRecords = useMemo(() => {
    return monthlyRecords
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
  }, [monthlyRecords, searchTerm, filterStatus]);

  // Statistics
  const stats = useMemo(() => {
    const present = monthlyRecords.filter(
      (r) => r.status?.toLowerCase() === "present",
    ).length;
    const late = monthlyRecords.filter(
      (r) => r.status?.toLowerCase() === "late",
    ).length;
    const absent = monthlyRecords.filter(
      (r) => r.status?.toLowerCase() === "absent",
    ).length;
    const totalHours = monthlyRecords.reduce(
      (sum, r) => sum + (r.workingHours || 0),
      0,
    );
    const avgHours = monthlyRecords.length
      ? (totalHours / monthlyRecords.length).toFixed(1)
      : "0.0";

    return {
      present,
      late,
      absent,
      total: monthlyRecords.length,
      totalHours,
      avgHours,
    };
  }, [monthlyRecords]);

  // Chart Data for Working Hours
  const chartData = useMemo(() => {
    const sorted = [...monthlyRecords].sort(
      (a, b) => new Date(a.date) - new Date(b.date),
    );
    return {
      labels: sorted.map((item) =>
        new Date(item.date).toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
        }),
      ),
      datasets: [
        {
          label: "Hours Worked",
          data: sorted.map((item) => item.workingHours || 0),
          backgroundColor: sorted.map((item) => {
            const status = item.status?.toLowerCase();
            return status === "present"
              ? "#10b981"
              : status === "late"
                ? "#f59e0b"
                : "#ef4444";
          }),
          borderRadius: 8,
          barThickness: 28,
        },
      ],
    };
  }, [monthlyRecords]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#1e293b",
        padding: 14,
        cornerRadius: 10,
        displayColors: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: "#f1f5f9" },
        ticks: { color: "#64748b", font: { size: 12 } },
      },
      x: {
        grid: { display: false },
        ticks: { color: "#64748b", font: { size: 12 } },
      },
    },
  };

  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case "present":
        return "status-badge present";
      case "late":
        return "status-badge late";
      case "absent":
        return "status-badge absent";
      default:
        return "status-badge";
    }
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

    // 🔒 Restriction Logic
    const minDate = new Date(2026, 1); // Feb 2026 (month index 1)
    const maxDate = new Date(); // current date

    const newDate = new Date(newYear, newMonth);

    if (newDate < minDate || newDate > maxDate) {
      return; // ❌ block navigation
    }

    setSelectedMonth(newMonth);
    setSelectedYear(newYear);
  };

  const minDate = new Date(2026, 1);
  const maxDate = new Date();

  const currentViewDate = new Date(selectedYear, selectedMonth);

  const isPrevDisabled = currentViewDate <= minDate;
  const isNextDisabled =
    currentViewDate.getMonth() === maxDate.getMonth() &&
    currentViewDate.getFullYear() === maxDate.getFullYear();

  // Circular Progress Component
  const CircularProgress = ({ value, max, label, color, unit = "hrs" }) => {
    const percentage = Math.min((value / max) * 100, 100);
    const radius = 56;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

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
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform="rotate(-90 80 80)"
            style={{
              transition:
                "stroke-dashoffset 2s cubic-bezier(0.25, 0.1, 0.25, 1)",
            }}
          />
        </svg>
        <div className="progress-content">
          <div className="progress-value">
            {typeof value === "number" ? value.toFixed(1) : value}
            <span className="unit">{unit}</span>
          </div>
          <div className="progress-label">{label}</div>
        </div>
      </div>
    );
  };

  return (
    <div className="attendance-page">
      <div className="page-header">
        <div>
          <h1>My Attendance</h1>
          <p className="subtitle">
            Track your monthly presence and productivity
          </p>
        </div>

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
      </div>

      {/* Stats with Circular Progress */}
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

      {/* Records Table */}
      <div className="table-section">
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search by date or day..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Status</option>
            <option value="present">Present Only</option>
            <option value="late">Late Only</option>
            <option value="absent">Absent Only</option>
          </select>
        </div>

        {loading ? (
          <div className="loading-state">
            Loading your attendance records...
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="empty-state">
            No records found for {monthNames[selectedMonth]} {selectedYear}
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
                      {item.workingHours
                        ? `${item.workingHours.toFixed(1)} hrs`
                        : "—"}
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
