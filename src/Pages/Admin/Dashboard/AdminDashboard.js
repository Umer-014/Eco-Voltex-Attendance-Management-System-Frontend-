import React, { useEffect, useState } from "react";
import { Users, Clock, UserCheck, UserX } from "lucide-react";
import { getAttendance } from "../../../api/attendanceApi";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalEmployees: 0,
    presentToday: 0,
    lateToday: 0,
    absentToday: 0,
    totalHoursToday: 0,
  });
  const [recentRecords, setRecentRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const allRecords = await getAttendance();
      
      const today = new Date().toDateString();
      const todayRecords = allRecords.filter(
        (rec) => new Date(rec.date).toDateString() === today
      );

      const present = todayRecords.filter((r) => r.status === "Present").length;
      const late = todayRecords.filter((r) => r.status === "Late").length;
      const absent = todayRecords.filter((r) => r.status === "Absent").length;
      
      const totalHours = todayRecords.reduce((sum, rec) => {
        return sum + (rec.workingHours || 0);
      }, 0);

      // Get unique employees
      const uniqueEmployees = new Set(allRecords.map(r => r.employeeId?._id || r.employeeId));

      setStats({
        totalEmployees: uniqueEmployees.size,
        presentToday: present,
        lateToday: late,
        absentToday: absent,
        totalHoursToday: totalHours.toFixed(1),
      });

      // Recent 8 records (sorted by date)
      const sorted = [...allRecords]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 8);

      setRecentRecords(sorted);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="admin-dashboard">
      <h1 className="page-title">Admin Dashboard</h1>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon"><Users size={28} /></div>
          <div>
            <div className="stat-number">{stats.totalEmployees}</div>
            <div className="stat-label">Total Employees</div>
          </div>
        </div>

        <div className="stat-card present">
          <div className="stat-icon"><UserCheck size={28} /></div>
          <div>
            <div className="stat-number">{stats.presentToday}</div>
            <div className="stat-label">Present Today</div>
          </div>
        </div>

        <div className="stat-card late">
          <div className="stat-icon"><Clock size={28} /></div>
          <div>
            <div className="stat-number">{stats.lateToday}</div>
            <div className="stat-label">Late Today</div>
          </div>
        </div>

        <div className="stat-card absent">
          <div className="stat-icon"><UserX size={28} /></div>
          <div>
            <div className="stat-number">{stats.absentToday}</div>
            <div className="stat-label">Absent Today</div>
          </div>
        </div>

        <div className="stat-card hours">
          <div className="stat-icon">⏱️</div>
          <div>
            <div className="stat-number">{stats.totalHoursToday}</div>
            <div className="stat-label">Total Hours Today</div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="recent-section">
        <h2>Recent Activity</h2>
        <div className="recent-table-container">
          <table className="recent-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Date</th>
                <th>Check-In</th>
                <th>Check-Out</th>
                <th>Status</th>
                <th>Hours</th>
              </tr>
            </thead>
            <tbody>
              {recentRecords.map((record) => (
                <tr key={record._id}>
                  <td>{record.employeeName}</td>
                  <td>{new Date(record.date).toLocaleDateString()}</td>
                  <td>
                    {record.checkIn
                      ? new Date(record.checkIn).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                      : "-"}
                  </td>
                  <td>
                    {record.checkOut
                      ? new Date(record.checkOut).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                      : "-"}
                  </td>
                  <td>
                    <span className={`status-badge ${record.status?.toLowerCase()}`}>
                      {record.status}
                    </span>
                  </td>
                  <td>{record.workingHours ? record.workingHours.toFixed(1) : "0"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;