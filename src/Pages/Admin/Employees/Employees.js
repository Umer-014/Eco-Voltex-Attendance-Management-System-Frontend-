import React, { useState, useEffect } from "react";
import { registerUser, getAllStaff, deleteStaff } from "../../../api/authApi";
import "./Employees.css";

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Registration Form State
  const [showRegisterForm, setShowRegisterForm] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "employee",
    dateOfBirth: "",
    ContactPhone: "", // Fixed naming
    address: "",
    dateOfJoining: "",
    
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



  return (
    <div className="employees-page">
      <div className="page-header">
        <h1>Add New Employee</h1>
      </div>

      {error && <p className="error-message">{error}</p>}

      {/* Registration Form */}
      {showRegisterForm && (
        <div className="register-form-card">
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

      
    </div>
  );
};

export default Employees;
