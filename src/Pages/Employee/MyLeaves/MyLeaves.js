import React, { useState, useEffect } from "react";
import { Calendar, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import "./MyLeaves.css";
import API_BASE_URL from "../../../api/config";

const MyLeaves = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchMyLeaves = async () => {
    try {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("employeeId");
      const response = await fetch(`${API_BASE_URL}/leaves/${userId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setLeaves(data.leaves || []);
      } else {
        setError(data.message || "Failed to load your leaves");
      }
    } catch (err) {
      setError("Server error. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyLeaves();
  }, []);

  const getStatusClass = (status) => {
    switch (status) {
      case "Approved":
        return "status-approved";
      case "Rejected":
        return "status-rejected";
      case "Pending":
        return "status-pending";
      default:
        return "status-pending";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Approved":
        return <CheckCircle size={20} className="status-icon approved" />;
      case "Rejected":
        return <XCircle size={20} className="status-icon rejected" />;
      case "Pending":
        return <AlertCircle size={20} className="status-icon pending" />;
      default:
        return <Clock size={20} className="status-icon pending" />;
    }
  };

  return (
    <div className="my-leaves-page">
      <div className="my-leaves-header">
        <h1>My Leave Requests</h1>
        <p>Track the status of all your leave applications</p>
      </div>

      {loading ? (
        <p className="my-leaves-loading">Loading your leave history...</p>
      ) : error ? (
        <p className="my-leaves-error">{error}</p>
      ) : leaves.length === 0 ? (
        <p className="no-leaves">You haven't submitted any leave requests yet.</p>
      ) : (
        <div className="leaves-grid">
          {leaves.map((leave) => (
            <div key={leave._id} className="leave-card">
              <div className="leave-card-header">
                <div className="leave-type">
                  <span className="leave-type-badge">{leave.leaveType}</span>
                </div>
                <div className={`leave-status ${getStatusClass(leave.status)}`}>
                  {getStatusIcon(leave.status)}
                  <span>{leave.status}</span>
                </div>
              </div>

              <div className="leave-dates">
                <div className="date-range">
                  <Calendar size={18} />
                  <span>
                    {new Date(leave.startDate).toLocaleDateString("en-GB")} — 
                    {new Date(leave.endDate).toLocaleDateString("en-GB")}
                  </span>
                </div>
                <div className="total-days">
                  <Clock size={18} />
                  <span>{leave.totalDays} days</span>
                </div>
              </div>

              <div className="leave-reason">
                <strong>Reason:</strong>
                <p>{leave.reason}</p>
              </div>

              {leave.status === "Rejected" && leave.rejectionReason && (
                <div className="rejection-reason">
                  <strong>Rejection Reason:</strong>
                  <p>{leave.rejectionReason}</p>
                </div>
              )}

              {leave.status === "Approved" && leave.approvedAt && (
                <div className="approved-info">
                  <small>
                    Approved on {new Date(leave.approvedAt).toLocaleDateString("en-GB")}
                  </small>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyLeaves;