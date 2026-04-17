import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  Clock,
  ShieldCheck,
  Heart,
  Trash2,
  Download,
  View,
    FileText,
} from "lucide-react";
import { getStaffByIdentifier, deleteStaff } from "../../../api/authApi";
import "./StaffDetail.css";

const StaffDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [staff, setStaff] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const fetchStaffDetails = async () => {
      try {
        const data = await getStaffByIdentifier(id);
        setStaff(data);
      } catch (err) {
        console.error("Failed to fetch staff details", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStaffDetails();
  }, [id]);

  const handleDelete = async () => {
    if (
      !staff ||
      !window.confirm(`Delete ${staff.name}? This action cannot be undone.`)
    )
      return;

    try {
      await deleteStaff(staff._id || staff.employeeId);
      alert("Employee deleted successfully");
      navigate("/admin/staff-directory");
    } catch (err) {
      alert("Delete failed: " + (err.message || "Unknown error"));
    }
  };

  const openFile = (fileUrl) => {
    if (!fileUrl) return;

    // Remove any existing fl_attachment flags to avoid conflicts
    let url = fileUrl.replace(/\/fl_attachment:[^/]+\/?/g, "/");

    // For PDFs (raw), we want inline display if possible
    if (url.includes("/raw/")) {
      // Ensure fl_attachment:false for inline PDF view
      if (!url.includes("fl_attachment:false")) {
        url = url.replace("/upload/", "/upload/fl_attachment:false/");
      }
    } else {
      // For images: do NOT force fl_attachment:false (let browser preview normally)
      url = url.replace("/fl_attachment:false/", "/");
    }

    window.open(url, "_blank");
  };

  if (loading) return <div className="loading">Loading profile...</div>;
  if (!staff) return <div className="error">Employee not found</div>;

  return (
    <div className="staff-detail-page">
      {/* Back Button */}
      <button
        className="back-btn"
        onClick={() => navigate("/admin/staff-directory")}
      >
        <ArrowLeft size={20} /> Back to Directory
      </button>

      {/* Header */}
      <div className="detail-header">
        <div className="profile-avatar-large">
          {staff.profileImage?.url ? (
            <img src={staff.profileImage.url} alt={staff.name} />
          ) : (
            <User size={80} />
          )}
        </div>
        <div className="header-info">
          <h1>{staff.name}</h1>
          <p className="employee-id">{staff.employeeId}</p>
          <span className={`role-badge ${staff.role}`}>
            {staff.role.toUpperCase()}
          </span>
          {staff.rank && <p className="rank">{staff.rank}</p>}
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button
          className={`tab-btn ${activeTab === "overview" ? "active" : ""}`}
          onClick={() => setActiveTab("overview")}
        >
          Overview
        </button>
        <button
          className={`tab-btn ${activeTab === "leave" ? "active" : ""}`}
          onClick={() => setActiveTab("leave")}
        >
          Leave Balance
        </button>
        <button
          className={`tab-btn ${activeTab === "rtw" ? "active" : ""}`}
          onClick={() => setActiveTab("rtw")}
        >
          Right to Work
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === "overview" && (
          <div className="overview-tab">
            <div className="info-grid">
              <div className="info-card">
                <h3>Personal Information</h3>
                <div className="info-list">
                  <div>
                    <Mail size={18} />
                    <span>{staff.email}</span>
                  </div>
                  {staff.ContactPhone && (
                    <div>
                      <Phone size={18} />
                      <span>{staff.ContactPhone}</span>
                    </div>
                  )}
                  {staff.address && (
                    <div>
                      <MapPin size={18} />
                      <span>{staff.address}</span>
                    </div>
                  )}
                  {staff.dateOfBirth && (
                    <div>
                      <Calendar size={18} />
                      <span>
                        {new Date(staff.dateOfBirth).toLocaleDateString(
                          "en-GB",
                        )}
                      </span>
                    </div>
                  )}
                  {staff.dateOfJoining && (
                    <div>
                      <Briefcase size={18} />
                      <span>
                        {new Date(staff.dateOfJoining).toLocaleDateString(
                          "en-GB",
                        )}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {staff.emergencyContact?.name && (
                <div className="info-card">
                  <h3>
                    <Heart size={20} /> Emergency Contact
                  </h3>
                  <div className="info-list">
                    <div>
                      <strong>Name:</strong> {staff.emergencyContact.name}
                    </div>
                    {staff.emergencyContact.phone && (
                      <div>
                        <strong>Phone:</strong> {staff.emergencyContact.phone}
                      </div>
                    )}
                    {staff.emergencyContact.relation && (
                      <div>
                        <strong>Relation:</strong>{" "}
                        {staff.emergencyContact.relation}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "leave" && staff.leaveBalance && (
          <div className="leave-tab">
            <div className="leave-cards">
              <div className="leave-card annual">
                <h3>Annual Leave</h3>
                <div className="leave-number">
                  {staff.leaveBalance.annual.remaining}
                </div>
                <p>days remaining</p>
                <small>
                  {staff.leaveBalance.annual.used} used /{" "}
                  {staff.leaveBalance.annual.totalEntitled} entitled
                </small>
              </div>

              <div className="leave-card">
                <h3>Sick Leave</h3>
                <div className="leave-number">
                  {staff.leaveBalance.sick.used}
                </div>
                <p>days used</p>
              </div>

              <div className="leave-card">
                <h3>Emergency Leave</h3>
                <div className="leave-number">
                  {staff.leaveBalance.emergency.used}
                </div>
                <p>days used</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "rtw" && (
          <div className="rtw-tab">
            {/* Current Status - Highlighted Card */}
            {staff.currentRightToWork?.checked ? (
              <div className="current-rtw-card">
                <div className="card-header">
                  <ShieldCheck size={24} />
                  <h3>Current Right to Work Status</h3>
                  <span
                    className={`status-badge ${staff.currentRightToWork.checkResult?.toLowerCase().replace(/\s+/g, "-")}`}
                  >
                    {staff.currentRightToWork.checkResult}
                  </span>
                </div>

                <div className="current-info-grid">
                  <div className="info-row">
                    <span className="label">Document Type</span>
                    <span className="value">
                      {staff.currentRightToWork.documentType || "N/A"}
                    </span>
                  </div>

                  {staff.currentRightToWork.shareCode && (
                    <div className="info-row">
                      <span className="label">Share Code</span>
                      <span className="value font-mono">
                        {staff.currentRightToWork.shareCode}
                      </span>
                    </div>
                  )}

                  {staff.currentRightToWork.passportNumber && (
                    <div className="info-row">
                      <span className="label">Passport Number</span>
                      <span className="value font-mono">
                        {staff.currentRightToWork.passportNumber}
                      </span>
                    </div>
                  )}

                  {staff.currentRightToWork.brpNumber && (
                    <div className="info-row">
                      <span className="label">BRP Number</span>
                      <span className="value font-mono">
                        {staff.currentRightToWork.brpNumber}
                      </span>
                    </div>
                  )}

                  {staff.currentRightToWork.expiryDate && (
                    <div className="info-row">
                      <span className="label">Expiry Date</span>
                      <span className="value">
                        {new Date(
                          staff.currentRightToWork.expiryDate,
                        ).toLocaleDateString("en-GB")}
                      </span>
                    </div>
                  )}

                  {staff.currentRightToWork.notes && (
                    <div className="info-row notes-row">
                      <span className="label">Notes</span>
                      <span className="value">
                        {staff.currentRightToWork.notes}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="no-rtw-card">
                <ShieldCheck size={48} />
                <h3>No Right to Work Check Recorded</h3>
                <p>
                  Perform a Right to Work check to update this employee's
                  status.
                </p>
              </div>
            )}

            {/* History Section */}
            <div className="history-section">
              <div className="section-header">
                <h3>Check History ({staff.rightToWorkHistory?.length || 0})</h3>
                {staff.rightToWorkHistory?.length > 0 && (
                  <small>Most recent first</small>
                )}
              </div>

              {staff.rightToWorkHistory?.length > 0 ? (
                <div className="history-list">
                  {staff.rightToWorkHistory
                    .sort(
                      (a, b) => new Date(b.checkDate) - new Date(a.checkDate),
                    )
                    .map((check, index) => (
                      <div key={index} className="history-card">
                        <div className="history-card-header">
                          <div>
                            <span className="check-number">
                              Check #{index + 1}
                            </span>
                            <span className="check-date">
                              {new Date(check.checkDate).toLocaleDateString(
                                "en-GB",
                                {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                },
                              )}
                            </span>
                          </div>
                          <span
                            className={`result-badge ${check.checkResult?.toLowerCase().replace(/\s+/g, "-")}`}
                          >
                            {check.checkResult}
                          </span>
                        </div>

                        <div className="history-details">
                          <div className="detail-item">
                            <span className="detail-label">Document Type</span>
                            <span className="detail-value">
                              {check.documentType}
                            </span>
                          </div>

                          {check.shareCode && (
                            <div className="detail-item">
                              <span className="detail-label">Share Code</span>
                              <span className="detail-value font-mono">
                                {check.shareCode}
                              </span>
                            </div>
                          )}

                          {check.passportNumber && (
                            <div className="detail-item">
                              <span className="detail-label">Passport No.</span>
                              <span className="detail-value font-mono">
                                {check.passportNumber}
                              </span>
                            </div>
                          )}

                          {check.brpNumber && (
                            <div className="detail-item">
                              <span className="detail-label">BRP No.</span>
                              <span className="detail-value font-mono">
                                {check.brpNumber}
                              </span>
                            </div>
                          )}

                          {check.expiryDate && (
                            <div className="detail-item">
                              <span className="detail-label">Expiry Date</span>
                              <span className="detail-value">
                                {new Date(check.expiryDate).toLocaleDateString(
                                  "en-GB",
                                )}
                              </span>
                            </div>
                          )}
                        </div>

                        {check.notes && (
                          <div className="history-notes">
                            <strong>Notes:</strong> {check.notes}
                          </div>
                        )}

                        {check.evidenceFiles?.length > 0 && (
                          <div className="evidence-section">
                            <h4>
                              Supporting Documents ({check.evidenceFiles.length}
                              )
                            </h4>
                            <div className="evidence-list">
                              {check.evidenceFiles.map((file, i) => (
                                <div key={i} className="evidence-item">
                                  <div className="file-info">
                                    <FileText size={18} />
                                    <span>{file.originalName}</span>
                                  </div>
                                  <button
                                    className="view-btn"
                                    onClick={() => openFile(file.fileUrl)}
                                  >
                                    <View size={18} /> View
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              ) : (
                <div className="empty-history">
                  <p>No previous Right to Work checks found.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {staff.role !== "admin" && (
        <button className="delete-btn" onClick={handleDelete}>
          <Trash2 size={18} /> Delete Employee
        </button>
      )}
    </div>
  );
};

export default StaffDetail;
