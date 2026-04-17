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

        {activeTab === "rtw" && staff.rightToWork?.checked && (
          <div className="rtw-tab">
            <div className="rtw-info">
              <h3>Right to Work Status</h3>
              <p>
                <strong>Share Code:</strong>{" "}
                {staff.rightToWork.shareCode || "N/A"}
              </p>
              <p>
                <strong>Result:</strong>
                <span
                  className={`rtw-result ${staff.rightToWork.checkResult?.toLowerCase().replace(/\s+/g, "-")}`}
                >
                  {staff.rightToWork.checkResult}
                </span>
              </p>
              {staff.rightToWork.expiryDate && (
                <p>
                  <strong>Expiry Date:</strong>{" "}
                  {new Date(staff.rightToWork.expiryDate).toLocaleDateString(
                    "en-GB",
                  )}
                </p>
              )}
            </div>

            {staff.rightToWork.evidenceFiles?.length > 0 && (
              <div className="evidence-section">
                <h3>Supporting Documents</h3>
                <div className="evidence-list">
                  {staff.rightToWork.evidenceFiles.map((file, index) => (
                    <div key={index} className="evidence-item">
                      <div>
                        <p>{file.originalName || `Document ${index + 1}`}</p>
                        <small>
                          Uploaded:{" "}
                          {new Date(file.uploadedAt).toLocaleDateString(
                            "en-GB",
                          )}
                        </small>
                      </div>
                      <button
                        className="download-btn"
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
