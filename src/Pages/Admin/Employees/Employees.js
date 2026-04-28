import React, { useState, useEffect } from "react";
import { registerUser, getAllStaff, deleteStaff } from "../../../api/authApi";
import "./Employees.css";
import { Upload } from "lucide-react";
import API_BASE_URL from "../../../api/config";

const Employees = () => {
  const delay = (ms) => new Promise((res) => setTimeout(res, ms));
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ✅ FIXED: single image instead of files[]
  const [profileImage, setProfileImage] = useState(null);

  // Form state
  const [showRegisterForm, setShowRegisterForm] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
    dateOfBirth: "",
    ContactPhone: "",
    address: "",
    dateOfJoining: "",
    emergencyName: "",
    emergencyPhone: "",
    emergencyRelation: "",
    rank: "",
    nationality: "",
    passportNumber: "",
  });

  const [registerMessage, setRegisterMessage] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);

  const [showPassword, setShowPassword] = useState(false);

  // Fetch staff
  const fetchAllStaff = async () => {
    setLoading(true);
    setError("");
    try {
      const staffList = await getAllStaff();
      setEmployees(staffList);
    } catch (err) {
      setError(err.message || "Failed to load employees");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setEmployees((prev) => [...prev]);
  }, []);

  // Toggle password
  const togglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  // Handle form input
  const handleFormChange = (e) => {
    const { name, value } = e.target;

    if (name === "ContactPhone") {
      let cleaned = value.replace(/[^\d+]/g, "");

      if (cleaned.includes("+") && !cleaned.startsWith("+")) {
        cleaned = cleaned.replace(/\+/g, "");
      }

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

  // ✅ Handle Profile Image
  const handleFileChange = (e) => {
    setProfileImage(e.target.files[0]);
  };

  // ✅ REGISTER + UPLOAD IMAGE
  const handleRegister = async (e) => {
    e.preventDefault();
    setRegisterMessage("");
    setIsRegistering(true);

    // Phone validation
    if (formData.ContactPhone) {
      const ukPhoneRegex = /^(?:\+44|0)7\d{9}$/;
      if (!ukPhoneRegex.test(formData.ContactPhone)) {
        setIsRegistering(false);
        return setRegisterMessage(
          "❌ Invalid UK phone number (e.g. 07123456789 or +447123456789)",
        );
      }
    }

    try {
      // 🔹 Step 1: Register user
      const res = await registerUser(
        formData.name,
        formData.email,
        formData.password,
        formData.role,
        formData.dateOfBirth,
        formData.ContactPhone,
        formData.address,
        formData.dateOfJoining,
        formData.emergencyName,
        formData.emergencyPhone,
        formData.emergencyRelation,
        formData.rank,
        formData.nationality,
        formData.passportNumber,
      );
      console.log("Registration response:", res);

      const employeeId = res.user.employeeId;

      // ✅ ADD THIS HERE (correct place)
      setEmployees((prev) => [...prev, res.user]);

      // ⏳ wait for DB sync
      await delay(500);

      if (profileImage) {
        const imageData = new FormData();
        imageData.append("profileImage", profileImage);

        await fetch(`${API_BASE_URL}/register/staff/${employeeId}/profile`, {
          method: "PUT",
          body: imageData,
        });
      }

      setRegisterMessage("✅ Employee registered successfully!");

      // Reset form
      setFormData({
        name: "",
        email: "",
        password: "",
        role: "",
        dateOfBirth: "",
        ContactPhone: "",
        address: "",
        dateOfJoining: "",
        emergencyName: "",
        emergencyPhone: "",
        emergencyRelation: "",
        rank: "",
        nationality: "",
        passportNumber: "",
      });

      setProfileImage(null);
      setShowRegisterForm(null);
      fetchAllStaff();
    } catch (err) {
      setRegisterMessage("❌ " + (err.message || "Registration failed"));
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className="employees-page">
      <div className="page-header">
        <h1>Add New Employee</h1>
      </div>

      {error && <p className="error-message">{error}</p>}

      {showRegisterForm && (
        <div className="register-form-card">
          <form onSubmit={handleRegister}>
            <div className="form-grid">
              <div className="input-group">
                <label>Full Name</label>
                <input
                  type="text"
                  name="name"
                  placeholder="e.g. Jane Doe"
                  value={formData.name}
                  onChange={handleFormChange}
                  required
                />
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
                  placeholder="e.g. 123 Main St, London"
                  value={formData.address}
                  onChange={handleFormChange}
                />
              </div>

              <div className="input-group">
                <label>Nationality</label>
                <input
                  type="text"
                  name="nationality"
                  placeholder="e.g. British"
                  value={formData.nationality}
                  onChange={handleFormChange}
                />
              </div>

              <div className="input-group">
                <label>Passport Number</label>
                <input
                  type="text"
                  name="passportNumber"
                  placeholder="e.g. P1234567"
                  value={formData.passportNumber}
                  onChange={handleFormChange}
                />
              </div>

              <div className="input-group">
                <label>Emergency Contact Name</label>
                <input
                  type="text"
                  name="emergencyName"
                  placeholder="e.g. John Doe"
                  value={formData.emergencyName}
                  onChange={handleFormChange}
                />
              </div>

              <div className="input-group">
                <label>Emergency Contact Phone</label>
                <input
                  type="tel"
                  name="emergencyPhone"
                  placeholder="e.g. 07123456789 or +447123456789"
                  value={formData.emergencyPhone}
                  onChange={handleFormChange}
                  pattern="^(?:07\d{9}|\+447\d{9})$"
                  maxLength={13}
                  required
                />
              </div>

              <div className="input-group">
                <label>Emergency Relation</label>
                <input
                  type="text"
                  name="emergencyRelation"
                  value={formData.emergencyRelation}
                  onChange={handleFormChange}
                  placeholder="e.g. Spouse, Parent, Friend"
                  required
                />
              </div>

              <div className="input-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  placeholder="e.g. jane.doe@ecovoltex.co.uk"
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
                <label>Role</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleFormChange}
                  required
                  placeholder="Select role"
                >
                  <option value="">Select role</option>
                  <option value="employee">Employee</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="input-group">
                <label>Position</label>
                <input
                  type="text"
                  name="rank"
                  value={formData.rank}
                  onChange={handleFormChange}
                  placeholder="e.g. Manager, Driver, etc."
                  required
                />
              </div>

              <div className="input-group">
                <label>Date of Joining</label>
                <input
                  type="date"
                  name="dateOfJoining"
                  value={formData.dateOfJoining}
                  onChange={handleFormChange}
                  required
                />
              </div>

              {/* ✅ PROFILE IMAGE */}
              <div className="rtw-input-group full-width">
                <label>Profile Picture</label>

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                />

                {profileImage && (
                  <>
                    <p>{profileImage.name}</p>

                    <img
                      src={URL.createObjectURL(profileImage)}
                      alt="preview"
                      style={{
                        width: "80px",
                        marginTop: "10px",
                        borderRadius: "8px",
                      }}
                    />
                  </>
                )}
              </div>
            </div>

            <button type="submit" disabled={isRegistering}>
              {isRegistering ? "Registering..." : "Register Employee"}
            </button>
          </form>

          {registerMessage && (
            <p className={registerMessage.includes("✅") ? "success" : "error"}>
              {registerMessage}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default Employees;
