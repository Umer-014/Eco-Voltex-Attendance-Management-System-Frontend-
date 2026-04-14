import React, { useState, useEffect } from "react";
import {
  User,
  Calendar,
  Phone,
  Mail,
  IdCard,
  X,
  Trash2,
  MapPin,
} from "lucide-react";
import { registerUser, getAllStaff, deleteStaff } from "../../../api/authApi";
import "./Employees.css";

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Registration Form State
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "employee",
    dateOfBirth: "",
    ContactPhone: "", // Fixed naming
    address: "",
    dateOfJoining: "",
    shareCode: "",
  });
  const [registerMessage, setRegisterMessage] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);

  // Fetch All Staff
  const fetchAllStaff = async () => {
    setLoading(true);
    setError("");
    try {
      const staffList = await getAllStaff();
      setEmployees(staffList);
    } catch (err) {
      console.error("Failed to fetch staff:", err);
      setError(err.message || "Failed to load employees");
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllStaff();
  }, []);

  // Filter employees
  const filteredEmployees = employees.filter(
    (emp) =>
      emp.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.employeeId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.email?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const openEmployeeDetail = (employee) => {
    setSelectedEmployee(employee);
  };

  const closeModal = () => {
    setSelectedEmployee(null);
  };

  const [showPassword, setShowPassword] = useState(false);

  const togglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  // Handle Registration
  const handleRegister = async (e) => {
    e.preventDefault();
    setRegisterMessage("");
    setIsRegistering(true);

    // 🔴 UK PHONE VALIDATION
    if (formData.ContactPhone) {
      const ukPhoneRegex = /^(?:\+44|0)7\d{9}$/;
      if (!ukPhoneRegex.test(formData.ContactPhone)) {
        return setRegisterMessage(
          "❌ Invalid UK phone number (e.g. 07123456789 or +447123456789)",
        );
      }
    }

    try {
      await registerUser(
        formData.name,
        formData.email,
        formData.password,
        formData.role,
        formData.dateOfBirth,
        formData.ContactPhone, // Fixed
        formData.address,
        formData.dateOfJoining,
        formData.shareCode,
      );

      setRegisterMessage("✅ Employee registered successfully!");

      // Reset form
      setFormData({
        name: "",
        email: "",
        password: "",
        role: "employee",
        dateOfBirth: "",
        ContactPhone: "",
        address: "",
        dateOfJoining: "",
        shareCode: "",
      });
      setShowRegisterForm(false);

      fetchAllStaff();
    } catch (err) {
      setRegisterMessage("❌ " + (err.message || "Registration failed"));
    } finally {
      setIsRegistering(false);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;

    if (name === "ContactPhone") {
      // Allow only numbers and +
      let cleaned = value.replace(/[^\d+]/g, "");

      // Only allow + at start
      if (cleaned.includes("+") && !cleaned.startsWith("+")) {
        cleaned = cleaned.replace(/\+/g, "");
      }

      // Limit length based on format
      if (cleaned.startsWith("+44")) {
        cleaned = cleaned.slice(0, 13);
      } else {
        cleaned = cleaned.slice(0, 11);
      }

      setFormData({ ...formData, [name]: cleaned });
    } else {
      setFormData({ ...formData, [name]: value });
    }
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
      fetchAllStaff();
    } catch (err) {
      alert("Delete failed: " + err.message);
    }
  };

  return (
    <div className="employees-page">
      <div className="page-header">
        <h1>Employee Directory</h1>
        <button
          className="add-employee-btn"
          onClick={() => setShowRegisterForm(!showRegisterForm)}
        >
          + Add New Employee
        </button>
      </div>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Search by name, email or Employee ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {error && <p className="error-message">{error}</p>}

      {/* Registration Form */}
      {showRegisterForm && (
        <div className="register-form-card">
          <h2>Add New Employee</h2>
          <form onSubmit={handleRegister}>
            <div className="form-grid">
              <div className="input-group">
                <label>Full Name</label>
                <input
                  type="text"
                  name="name"
                  placeholder="Enter full name"
                  value={formData.name}
                  onChange={handleFormChange}
                  required
                />
              </div>
              <div className="input-group">
                <label>Contact Phone</label>
                <input
                  type="tel"
                  name="ContactPhone"
                  placeholder="e.g. 07123456789 or +447123456789"
                  value={formData.ContactPhone}
                  onChange={handleFormChange}
                  pattern="^(?:07\d{9}|\+447\d{9})$"
                  maxLength={13}
                  required
                />
              </div>

              <div className="input-group">
                <label>Address</label>
                <input
                  type="text"
                  name="address"
                  placeholder="Full address"
                  value={formData.address}
                  onChange={handleFormChange}
                />
              </div>

              <div className="input-group">
                <label>Email Address</label>
                <input
                  type="email"
                  name="email"
                  placeholder="example@company.com"
                  value={formData.email}
                  onChange={handleFormChange}
                  required
                />
              </div>
              <div className="input-group" style={{ position: "relative" }}>
                <label>Password</label>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  autoComplete="new-password"
                  placeholder="••••••••"
                  value={formData.password || ""} // ✅ prevent undefined issues
                  onChange={handleFormChange}
                  required
                />

                {/* Eye Button */}
                <span
                  onClick={togglePassword}
                  style={{
                    position: "absolute",
                    right: "10px",
                    top: "38px",
                    cursor: "pointer",
                    userSelect: "none",
                  }}
                >
                  {showPassword ? "🙈" : "👁️"}
                </span>
              </div>

              <div className="input-group">
                <label>Date of Birth</label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleFormChange}
                />
              </div>

              <div className="input-group">
                <label>Date of Joining</label>
                <input
                  type="date"
                  name="dateOfJoining"
                  value={formData.dateOfJoining}
                  onChange={handleFormChange}
                />
              </div>

              <div className="input-group">
                <label>Share Code (Right to Work)</label>
                <input
                  type="text"
                  name="shareCode"
                  placeholder="Share Code"
                  value={formData.shareCode}
                  onChange={handleFormChange}
                />
              </div>
            </div>

            <div className="input-group">
              <label>Role</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleFormChange}
              >
                <option value="employee">Employee</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isRegistering}
              className="submit-btn"
            >
              {isRegistering ? "Registering..." : "Register Employee"}
            </button>
          </form>

          {registerMessage && (
            <p
              className={`register-message ${registerMessage.includes("✅") ? "success" : "error"}`}
            >
              {registerMessage}
            </p>
          )}
        </div>
      )}

      {/* Employee List */}
      {loading ? (
        <p className="loading">Loading staff directory...</p>
      ) : (
        <div className="employee-grid">
          {filteredEmployees.length === 0 ? (
            <p className="no-results">No employees found.</p>
          ) : (
            filteredEmployees.map((emp) => (
              <div
                key={emp._id}
                className="employee-card"
                onClick={() => openEmployeeDetail(emp)}
              >
                <div className="avatar">
                  <User size={32} />
                </div>
                <div className="employee-info">
                  <h3>{emp.name}</h3>
                  <p>
                    <strong>ID:</strong> {emp.employeeId}
                  </p>
                  <p>
                    <strong>Email:</strong> {emp.email}
                  </p>
                  <span className={`role-badge ${emp.role}`}>{emp.role}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Employee Detail Modal */}
      {selectedEmployee && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-modal" onClick={closeModal}>
              <X size={24} />
            </button>

            <div className="modal-header">
              <div className="modal-avatar">
                <User size={48} />
              </div>
              <h2>{selectedEmployee.name}</h2>
              <p className="modal-role">{selectedEmployee.role}</p>
              <p className="modal-id">
                <strong>ID:</strong> {selectedEmployee.employeeId}
              </p>
            </div>

            <div className="modal-details">
              <div className="detail-row">
                <Mail size={20} />
                <div>
                  <strong>Email</strong>
                  <p>{selectedEmployee.email}</p>
                </div>
              </div>

              {selectedEmployee.address && (
                <div className="detail-row">
                  <MapPin size={20} />
                  <div>
                    <strong>Address</strong>
                    <p>{selectedEmployee.address}</p>
                  </div>
                </div>
              )}

              {selectedEmployee.dateOfBirth && (
                <div className="detail-row">
                  <Calendar size={20} />
                  <div>
                    <strong>Date of Birth</strong>
                    <p>
                      {new Date(
                        selectedEmployee.dateOfBirth,
                      ).toLocaleDateString("en-GB")}
                    </p>
                  </div>
                </div>
              )}

              {selectedEmployee.dateOfJoining && (
                <div className="detail-row">
                  <Calendar size={20} />
                  <div>
                    <strong>Date of Joining</strong>
                    <p>
                      {new Date(
                        selectedEmployee.dateOfJoining,
                      ).toLocaleDateString("en-GB")}
                    </p>
                  </div>
                </div>
              )}

              {selectedEmployee.shareCode && (
                <div className="detail-row">
                  <IdCard size={20} />
                  <div>
                    <strong>Share Code</strong>
                    <p>{selectedEmployee.shareCode}</p>
                  </div>
                </div>
              )}

              {selectedEmployee.ContactPhone && (
                <div className="detail-row">
                  <Phone size={20} />
                  <div>
                    <strong>Contact Number</strong>
                    <p>{selectedEmployee.ContactPhone}</p>
                  </div>
                </div>
              )}
            </div>

            <button className="delete-btn" onClick={handleDelete}>
              <Trash2 size={18} /> Delete Employee
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Employees;
