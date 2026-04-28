import React, { useState, useEffect, useCallback } from "react";
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
  const [userImages, setUserImages] = useState({});

  // 1. Fetch Leave Requests
  const fetchLeaves = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/leaves/leaves`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setLeaves(data.leaves || []);
    } catch (err) {
      console.error("Error fetching leaves:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeaves();
  }, [fetchLeaves]);

  useEffect(() => {
    const fetchImages = async () => {
      const token = localStorage.getItem("token");

      // 1. Get unique IDs (handles both object and string formats)
      const uniqueEmpIds = [
        ...new Set(
          leaves.map(
            (leave) => leave.employeeId?.employeeId || leave.employeeId,
          ),
        ),
      ].filter(Boolean);

      const newImages = { ...userImages };
      let hasNewImages = false;

      const fetchPromises = uniqueEmpIds.map(async (empId) => {
        if (newImages[empId]) return;

        try {
          const res = await fetch(`${API_BASE_URL}/register/staff/${empId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = await res.json();

          // FIX: Your controller returns 'staff', not 'user'
          // We also check if profileImage is a string or an object with a .url
          const imgPath =
            data?.staff?.profileImage?.url || data?.staff?.profileImage;

          if (imgPath) {
            // If the path is relative (e.g., /uploads/img.jpg), prefix it with the API URL
            const finalUrl = imgPath.startsWith("http")
              ? imgPath
              : `${API_BASE_URL}${imgPath}`;

            newImages[empId] = finalUrl;
            hasNewImages = true;
          }
        } catch (err) {
          console.error(`Failed to fetch image for ${empId}`, err);
        }
      });

      await Promise.all(fetchPromises);

      if (hasNewImages) {
        setUserImages(newImages);
      }
    };

    if (leaves.length > 0) fetchImages();
  }, [leaves]);

  // 3. Update Status Handler
  const updateLeaveStatus = async (leaveId, status) => {
    let rejectionReason = "";
    if (status === "Rejected") {
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

      if (res.ok) fetchLeaves();
    } catch (err) {
      alert("Failed to update status");
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "Approved":
        return "lm-status-approved";
      case "Rejected":
        return "lm-status-rejected";
      default:
        return "lm-status-pending";
    }
  };

  const filteredLeaves = leaves.filter(
    (leave) => filterStatus === "all" || leave.status === filterStatus,
  );

  return (
    <div className="lm-page">
      <div className="lm-header">
        <h1>Leave Management</h1>
        <p>Review and manage all employee leave requests</p>
      </div>

      <div className="lm-filters">
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
        <p className="lm-loading">Loading leave requests...</p>
      ) : (
        <div className="lm-grid">
          {filteredLeaves.length === 0 ? (
            <p className="lm-no-leaves">No leave requests found.</p>
          ) : (
            filteredLeaves.map((leave) => {
              const empId = leave.employeeId?.employeeId || leave.employeeId;
              return (
                <div key={leave._id} className="lm-card">
                  <div className="lm-card-header">
                    <div className="lm-employee-info">
                      {userImages[empId] ? (
                        <img
                          src={userImages[empId]}
                          className="lm-avatar"
                          alt="profile"
                        />
                      ) : (
                        <div className="lm-avatar-placeholder">
                          {leave.employeeName?.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <h3>{leave.employeeName}</h3>
                        <p className="lm-emp-id">{empId}</p>
                      </div>
                    </div>
                    <span
                      className={`lm-status ${getStatusClass(leave.status)}`}
                    >
                      {leave.status}
                    </span>
                  </div>

                  <div className="lm-details">
                    <div className="lm-detail-row">
                      <strong>Type:</strong> {leave.leaveType}
                    </div>
                    <div className="lm-detail-row">
                      <strong>Period:</strong>{" "}
                      {new Date(leave.startDate).toLocaleDateString("en-GB")} -{" "}
                      {new Date(leave.endDate).toLocaleDateString("en-GB")}
                    </div>
                    <div className="lm-detail-row">
                      <strong>Days:</strong> {leave.totalDays}
                    </div>
                    <div className="lm-detail-row">
                      <strong>Reason:</strong> {leave.reason}
                    </div>
                    {leave.rejectionReason && (
                      <div className="lm-detail-row">
                        <strong style={{ color: "red" }}>
                          Rejection Reason:
                        </strong>{" "}
                        {leave.rejectionReason}
                      </div>
                    )}
                  </div>

                  {leave.status === "Pending" && (
                    <div className="lm-actions">
                      <button
                        className="lm-approve-btn"
                        onClick={() => updateLeaveStatus(leave._id, "Approved")}
                      >
                        Approve
                      </button>
                      <button
                        className="lm-reject-btn"
                        onClick={() => updateLeaveStatus(leave._id, "Rejected")}
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

export default LeaveManagement;
