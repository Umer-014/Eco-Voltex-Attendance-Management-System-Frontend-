import React, { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  User,
} from "lucide-react";
import "./LeaveManagement.css";
import API_BASE_URL from "../../../api/config";

const LeaveManagement = () => {
  const [leaves, setLeaves] = useState([]);
  const [filterStatus, setFilterStatus] = useState("all");
  const [loading, setLoading] = useState(true);

  const fetchLeaves = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/leaves/leaves`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      setLeaves(data.leaves || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const filteredLeaves = leaves.filter(
    (leave) => filterStatus === "all" || leave.status === filterStatus,
  );

  const updateLeaveStatus = async (leaveId, status, rejectionReason = "") => {
    if (status === "Rejected" && !rejectionReason) {
      rejectionReason = prompt("Please enter rejection reason:");
      if (!rejectionReason) return;
    }

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API_BASE_URL}/leaves/update-status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ leaveId, status, rejectionReason }),
      });

      if (res.ok) {
        fetchLeaves(); // Refresh list
      }
    } catch (err) {
      alert("Failed to update leave status");
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "Approved":
        return "status-approved";
      case "Rejected":
        return "status-rejected";
      default:
        return "status-pending";
    }
  };

  return (
    <div className="leave-page">
      <div className="leave-header">
        <h1>Leave Management</h1>
        <p>Review and manage all employee leave requests</p>
      </div>

      <div className="leave-filters">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="all">All Requests</option>
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>

      {loading ? (
        <p className="leave-loading">Loading leave requests...</p>
      ) : (
        <div className="leave-grid">
          {filteredLeaves.length === 0 ? (
            <p className="no-leaves">No leave requests found.</p>
          ) : (
            filteredLeaves.map((leave) => (
              <div key={leave._id} className="leave-card">
                <div className="leave-card-header">
                  <div className="employee-info">
                    <User size={22} />
                    <div>
                      <h3>{leave.employeeName}</h3>
                      <p>{leave.employeeId?.employeeId || leave.employeeId}</p>
                    </div>
                  </div>
                  <span
                    className={`leave-status ${getStatusClass(leave.status)}`}
                  >
                    {leave.status}
                  </span>
                </div>

                <div className="leave-details">
                  <div className="detail-row">
                    <strong>Leave Type:</strong> {leave.leaveType}
                  </div>
                  <div className="detail-row">
                    <strong>Period:</strong>
                    {new Date(leave.startDate).toLocaleDateString("en-GB")} -
                    {new Date(leave.endDate).toLocaleDateString("en-GB")}
                  </div>
                  <div className="detail-row">
                    <strong>Total Days:</strong> {leave.totalDays}
                  </div>
                  <div className="detail-row">
                    <strong>Reason:</strong> {leave.reason}
                  </div>
                  {leave.rejectionReason && (
                    <div className="detail-row">
                      <strong style={{color : 'red'}}>Rejection Reason:</strong> {leave.rejectionReason}
                    </div>
                  )}
                </div>

                {leave.status === "Pending" && (
                  <div className="leave-actions">
                    <button
                      className="approve-btn"
                      onClick={() => updateLeaveStatus(leave._id, "Approved")}
                    >
                      Approve
                    </button>
                    <button
                      className="reject-btn"
                      onClick={() => updateLeaveStatus(leave._id, "Rejected")}
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default LeaveManagement;
