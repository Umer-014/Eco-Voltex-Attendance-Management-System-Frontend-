import React, { useState } from "react";
import { Calendar, Clock, Send } from "lucide-react";
import "./RequestLeave.css";
import API_BASE_URL from "../../../api/config";

const RequestLeave = () => {
  const [formData, setFormData] = useState({
    employeeId: localStorage.getItem("employeeId"),
    leaveType: "Annual",
    startDate: "",
    endDate: "",
    reason: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
    console.log("Submitting Leave Request with data:", formData);
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/leaves/request`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),

      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: "success", text: "✅ Leave request submitted successfully!" });
        // Reset form
        setFormData({
          leaveType: "Annual",
          startDate: "",
          endDate: "",
          reason: "",
        });
      } else {
        setMessage({ type: "error", text: data.message || "Failed to submit leave request" });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Server error. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="request-leave-page">
      <div className="request-leave-header">
        <h1>Request Leave</h1>
        <p>Submit your leave application</p>
      </div>

      <div className="request-leave-card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Leave Type</label>
            <select 
              name="leaveType" 
              value={formData.leaveType} 
              onChange={handleChange}
              className="request-select"
            >
              <option value="Annual">Annual Leave</option>
              <option value="Sick">Sick Leave</option>
              <option value="Emergency">Emergency Leave</option>
              <option value="Unpaid">Unpaid Leave</option>
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Start Date</label>
              <input 
                type="date" 
                name="startDate" 
                value={formData.startDate} 
                onChange={handleChange} 
                required 
                className="request-input"
              />
            </div>
            <div className="form-group">
              <label>End Date</label>
              <input 
                type="date" 
                name="endDate" 
                value={formData.endDate} 
                onChange={handleChange} 
                required 
                className="request-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Reason for Leave</label>
            <textarea 
              name="reason" 
              placeholder="Please provide a detailed reason for your leave request..."
              value={formData.reason}
              onChange={handleChange}
              rows="5"
              required
              className="request-textarea"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            className="request-submit-btn"
          >
            {loading ? (
              <>Submitting Request...</>
            ) : (
              <>
                <Send size={20} /> Submit Leave Request
              </>
            )}
          </button>
        </form>

        {message.text && (
          <div className={`request-message ${message.type}`}>
            {message.text}
          </div>
        )}
      </div>
    </div>
  );
};

export default RequestLeave;