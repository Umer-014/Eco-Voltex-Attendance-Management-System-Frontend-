import React, { useState, useEffect } from "react";
import {
  User,
  Mail,
  Calendar,
  MapPin,
  Phone,
  Download,
  X,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import {
  getAllStaff,
  getStaffByIdentifier,
  deleteStaff,
} from "../../../api/authApi";
import "./StaffDirectory.css";

const StaffDirectory = () => {
  const [staff, setStaff] = useState([]);
  const [filteredStaff, setFilteredStaff] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  // Fetch all staff
  const fetchStaff = async () => {
    setLoading(true);
    try {
      const staffList = await getAllStaff();
      setStaff(staffList);
      setFilteredStaff(staffList);
    } catch (err) {
      setError("Failed to load staff directory");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  // Search functionality
  useEffect(() => {
    const filtered = staff.filter(
      (member) =>
        member.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.employeeId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email?.toLowerCase().includes(searchTerm.toLowerCase()),
    );
    setFilteredStaff(filtered);
  }, [searchTerm, staff]);

  const openDetail = async (member) => {
    try {
      const fullDetails = await getStaffByIdentifier(
        member.employeeId || member._id,
      );
      setSelectedStaff(fullDetails);
      setSelectedEmployee(fullDetails); // ✅ ADD THIS
    } catch (err) {
      console.error("Failed to load full details", err);
      setSelectedStaff(member);
      setSelectedEmployee(member); // ✅ ADD THIS
    }
  };

  const closeModal = () => {
    setSelectedStaff(null);
  };

  // Download file from Cloudinary URL
  const downloadFile = (fileUrl, fileName) => {
    const link = document.createElement("a");
    link.href = fileUrl;
    link.download = fileName || "evidence.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Delete Employee
  const handleDelete = async () => {
    if (!selectedEmployee) return;
    if (
      !window.confirm(
        `Delete ${selectedEmployee.name}? This action cannot be undone.`,
      )
    )
      return;

    try {
      const identifier = selectedEmployee._id || selectedEmployee.employeeId;
      await deleteStaff(identifier);

      alert("Employee deleted successfully");
      closeModal();
      fetchStaff();
    } catch (err) {
      alert("Delete failed: " + err.message);
    }
  };

  return (
    <div className="staff-directory-page">
      <div className="staff-header">
        <h1>Staff Directory</h1>
        <p className="staff-subtitle">
          Manage and view all employees and admins
        </p>
      </div>

      <div className="staff-search">
        <input
          type="text"
          placeholder="Search by name, employee ID or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="staff-search-input"
        />
      </div>

      {error && <p className="staff-error">{error}</p>}

      {loading ? (
        <p className="staff-loading">Loading staff directory...</p>
      ) : (
        <div className="staff-grid">
          {filteredStaff.length === 0 ? (
            <p className="no-results">No staff found matching your search.</p>
          ) : (
            filteredStaff.map((member) => (
              <div
                key={member._id}
                className="staff-card"
                onClick={() => openDetail(member)}
              >
                <div className="staff-avatar">
                  <User size={40} />
                </div>
                <div className="staff-info">
                  <h3>{member.name}</h3>
                  <p className="staff-id">{member.employeeId}</p>
                  <p className="staff-email">{member.email}</p>
                  <span className={`staff-role ${member.role}`}>
                    {member.role}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Detail Modal */}
      {selectedStaff && (
        <div className="staff-modal-overlay" onClick={closeModal}>
          <div className="staff-modal" onClick={(e) => e.stopPropagation()}>
            <button className="staff-modal-close" onClick={closeModal}>
              <X size={24} />
            </button>

            <div className="staff-modal-header">
              <div className="staff-modal-avatar">
                <User size={60} />
              </div>
              <h2>{selectedStaff.name}</h2>
              <p className="staff-modal-id">{selectedStaff.employeeId}</p>
              <span className={`staff-modal-role ${selectedStaff.role}`}>
                {selectedStaff.role.toUpperCase()}
              </span>
            </div>

            <div className="staff-modal-body">
              <div className="detail-section">
                <h4>Personal Information</h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <Mail size={18} />
                    <div>
                      <strong>Email</strong>
                      <p>{selectedStaff.email}</p>
                    </div>
                  </div>
                  {selectedStaff.address && (
                    <div className="detail-item">
                      <MapPin size={18} />
                      <div>
                        <strong>Address</strong>
                        <p>{selectedStaff.address}</p>
                      </div>
                    </div>
                  )}
                  {selectedStaff.dateOfBirth && (
                    <div className="detail-item">
                      <Calendar size={18} />
                      <div>
                        <strong>Date of Birth</strong>
                        <p>
                          {new Date(
                            selectedStaff.dateOfBirth,
                          ).toLocaleDateString("en-GB")}
                        </p>
                      </div>
                    </div>
                  )}
                  {selectedStaff.dateOfJoining && (
                    <div className="detail-item">
                      <Calendar size={18} />
                      <div>
                        <strong>Date of Joining</strong>
                        <p>
                          {new Date(
                            selectedStaff.dateOfJoining,
                          ).toLocaleDateString("en-GB")}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Right to Work Section */}
              {selectedStaff.rightToWork &&
                selectedStaff.rightToWork.checked && (
                  <div className="detail-section rtw-section">
                    <h4>
                      <ShieldCheck size={20} /> Right to Work Status
                    </h4>
                    <div className="detail-grid">
                      <div className="detail-item">
                        <strong>Share Code</strong>
                        <p>{selectedStaff.rightToWork.shareCode || "N/A"}</p>
                      </div>
                      <div className="detail-item">
                        <strong>Check Result</strong>
                        <p
                          className={`rtw-result ${selectedStaff.rightToWork.checkResult?.toLowerCase()}`}
                        >
                          {selectedStaff.rightToWork.checkResult}
                        </p>
                      </div>
                      {selectedStaff.rightToWork.expiryDate && (
                        <div className="detail-item">
                          <strong>Expiry Date</strong>
                          <p>
                            {new Date(
                              selectedStaff.rightToWork.expiryDate,
                            ).toLocaleDateString("en-GB")}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Evidence Files */}
                    {selectedStaff.rightToWork.evidenceFiles &&
                      selectedStaff.rightToWork.evidenceFiles.length > 0 && (
                        <div className="evidence-section">
                          <h5>Supporting Documents</h5>
                          <div className="evidence-list">
                            {selectedStaff.rightToWork.evidenceFiles.map(
                              (file, index) => (
                                <div key={index} className="evidence-item">
                                  <div>
                                    <p>
                                      {file.originalName ||
                                        `Document ${index + 1}`}
                                    </p>
                                    <small>
                                      Uploaded:{" "}
                                      {new Date(
                                        file.uploadedAt,
                                      ).toLocaleDateString()}
                                    </small>
                                  </div>
                                  <button
                                    className="download-btn"
                                    onClick={() =>
                                      downloadFile(
                                        file.fileUrl,
                                        file.originalName,
                                      )
                                    }
                                  >
                                    <Download size={18} />
                                  </button>
                                </div>
                              ),
                            )}
                          </div>
                        </div>
                      )}
                  </div>
                )}
              {selectedStaff.role !== "admin" && (
                <button className="delete-btn" onClick={handleDelete}>
                  <Trash2 size={18} /> Delete Employee
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper function to download file
const downloadFile = (url, filename) => {
  const link = document.createElement("a");
  link.href = url;
  link.download = filename || "evidence.pdf";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export default StaffDirectory;
