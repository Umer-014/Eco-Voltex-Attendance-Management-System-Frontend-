import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  Upload,
  Calendar,
  FileText,
  User,
  AlertCircle,
} from "lucide-react";
import "./RightToWork.css";
import API_BASE_URL from "../../../api/config";

const RightToWork = () => {
  const [employees, setEmployees] = useState([]);
  // Add to formData state
  const [formData, setFormData] = useState({
    employeeId: "",
    documentType: "passport",
    passportNumber: "",
    brpNumber: "",
    shareCode: "",
    checkResult: "Unlimited",
    expiryDate: "",
    notes: "",
  });
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Fetch employees
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_BASE_URL}/register/staff`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        setEmployees(data.staff || []);
      } catch (err) {
        console.error("Failed to fetch employees", err);
      }
    };
    fetchEmployees();
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.employeeId) {
      setMessage({ type: "error", text: "Please select an employee" });
      return;
    }

    setLoading(true);
    setMessage({ type: "", text: "" });

    const data = new FormData();
    data.append("employeeId", formData.employeeId);
    data.append("documentType", formData.documentType);

    if (formData.passportNumber)
      data.append("passportNumber", formData.passportNumber);
    if (formData.brpNumber) data.append("brpNumber", formData.brpNumber);
    if (formData.shareCode) data.append("shareCode", formData.shareCode);

    data.append("checkResult", formData.checkResult);
    if (formData.expiryDate) data.append("expiryDate", formData.expiryDate);
    if (formData.notes) data.append("notes", formData.notes);

    

    files.forEach((file) => data.append("evidence", file));

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/rtw/check`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: data,
      });

      const result = await response.json();

      if (response.ok) {
        setMessage({
          type: "success",
          text: "Right to Work check successfully recorded with evidence.",
        });
        // Reset form
        setFormData({
          employeeId: "",
          shareCode: "",
          checkResult: "Unlimited",
          expiryDate: "",
          notes: "",
        });
        setFiles([]);
      } else {
        setMessage({
          type: "error",
          text: result.message || "Failed to save check",
        });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Server error. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rtw-page">
      <div className="rtw-header">
        <div className="rtw-header-content">
          <ShieldCheck size={36} className="rtw-icon" />
          <div>
            <h1 className="rtw-title">Right to Work Checks</h1>
          </div>
        </div>
      </div>

      <div className="rtw-main">
        <div className="rtw-card">
          <div className="rtw-card-header">
            <h2>Record New Right to Work Check</h2>
          </div>

          <form
            onSubmit={handleSubmit}
            encType="multipart/form-data"
            className="rtw-form"
          >
            <div className="rtw-form-grid">
              <div className="rtw-input-group">
                <label className="rtw-label">Select Employee</label>
                <select
                  name="employeeId"
                  value={formData.employeeId}
                  onChange={handleInputChange}
                  required
                  className="rtw-select"
                >
                  <option value="">-- Choose Employee --</option>
                  {employees.map((emp) => (
                    <option key={emp._id} value={emp.employeeId}>
                      {emp.name} — {emp.employeeId}
                    </option>
                  ))}
                </select>
              </div>

              {/* Document Type */}
              <div className="rtw-input-group">
                <label className="rtw-label">Document Type *</label>
                <select
                  name="documentType"
                  value={formData.documentType}
                  onChange={handleInputChange}
                  required
                  className="rtw-select"
                >
                  <option value="passport">Passport</option>
                  <option value="eVisa">eVisa</option>
                  <option value="BRP">BRP Card</option>
                  <option value="shareCode">Share Code Only</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Conditional Identifier Fields */}
              {formData.documentType === "passport" && (
                <div className="rtw-input-group">
                  <label className="rtw-label">Passport Number *</label>
                  <input
                    type="text"
                    name="passportNumber"
                    value={formData.passportNumber || ""}
                    onChange={handleInputChange}
                    required
                    className="rtw-input"
                  />
                </div>
              )}

              {formData.documentType === "BRP" && (
                <div className="rtw-input-group">
                  <label className="rtw-label">BRP Number *</label>
                  <input
                    type="text"
                    name="brpNumber"
                    value={formData.brpNumber || ""}
                    onChange={handleInputChange}
                    required
                    className="rtw-input"
                  />
                </div>
              )}

              {(formData.documentType === "eVisa" ||
                formData.documentType === "shareCode") && (
                <div className="rtw-input-group">
                  <label className="rtw-label">Share Code / Reference Code *</label>
                  <input
                    type="text"
                    name="shareCode"
                    placeholder="e.g., UK-123456789"
                    value={formData.shareCode || ""}
                    onChange={handleInputChange}
                    required
                    className="rtw-input"
                  />
                </div>
              )}
              <div className="rtw-input-group">
                <label className="rtw-label">Check Result</label>
                <select
                  name="checkResult"
                  value={formData.checkResult}
                  onChange={handleInputChange}
                  className="rtw-select"
                >
                  <option value="Unlimited">Unlimited Right to Work</option>
                  <option value="Limited">
                    Limited Right to Work (with expiry)
                  </option>
                  <option value="No Right">No Right to Work</option>
                </select>
              </div>
              {formData.checkResult === "Limited" && (
                <div className="rtw-input-group">
                  <label className="rtw-label">Expiry Date</label>
                  <input
                    type="date"
                    name="expiryDate"
                    value={formData.expiryDate}
                    onChange={handleInputChange}
                    required
                    className="rtw-input"
                  />
                </div>
              )}
              <div className="rtw-input-group full-width">
                <label className="rtw-label">Supporting Evidence</label>
                <div className="rtw-file-upload">
                  <input
                    type="file"
                    multiple
                    accept="image/*,application/pdf"
                    onChange={handleFileChange}
                    id="evidence-upload"
                  />
                  <label htmlFor="evidence-upload" className="rtw-upload-label">
                    <Upload size={20} />
                    <span>Click to upload files (Max 5)</span>
                  </label>
                </div>
                {files.length > 0 && (
                  <p className="rtw-file-count">
                    {files.length} file(s) selected
                  </p>
                )}
              </div>
              <div className="rtw-input-group full-width">
                <label className="rtw-label">Additional Notes</label>
                <textarea
                  name="notes"
                  placeholder="Any observations, comments, or important details..."
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows="4"
                  className="rtw-textarea"
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className="rtw-submit-btn">
              {loading
                ? "Recording Right to Work Check..."
                : "Save Right to Work Check"}
            </button>
          </form>

          {message.text && (
            <div className={`rtw-message ${message.type}`}>
              {message.type === "error" && <AlertCircle size={20} />}
              {message.text}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RightToWork;
