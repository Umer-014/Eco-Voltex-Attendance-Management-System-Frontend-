import React, { useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react"; // ← add Loader2 icon
import { useNavigate } from "react-router-dom";
import logoImg from "../../assets/logo1.png";
import { loginUser } from "../../api/authApi";
import "./Login.css";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState("employee");

  const [isLoading, setIsLoading] = useState(false); // ← new
  const [errorMessage, setErrorMessage] = useState(""); // ← optional: show errors

  const navigate = useNavigate();

const handleSubmit = async (e) => {
  e.preventDefault();

  setIsLoading(true);
  setErrorMessage("");

  try {
    const data = await loginUser(email, password, selectedRole);

    localStorage.setItem("token", data.token);
    localStorage.setItem("role", data.user.role);
    localStorage.setItem("name", data.user.name);

    if (data.user.role === "employee") {
      navigate("/employee/dashboard");
    }

    if (data.user.role === "admin") {
      navigate("/admin/dashboard");
    }

  } catch (err) {
    setErrorMessage(err.message);
  } finally {
    setIsLoading(false);
  }
};


  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">
            <img src={logoImg} alt="Company Logo" className="logo-img" />
          </div>
          <h1 className="login-title">Attendance Management System</h1>
          <p className="login-subtitle">
            Welcome back! Please sign in to continue.
          </p>
        </div>

        <div className="role-selector">
          <button
            type="button"
            onClick={() => setSelectedRole("employee")}
            className={`role-btn ${selectedRole === "employee" ? "active" : ""}`}
            disabled={isLoading}
          >
            Employee
          </button>
          <button
            type="button"
            onClick={() => setSelectedRole("admin")}
            className={`role-btn ${selectedRole === "admin" ? "active" : ""}`}
            disabled={isLoading}
          >
            Admin
          </button>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email address
            </label>
            <input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="form-input"
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <div className="password-wrapper">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="form-input"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="password-toggle"
                disabled={isLoading}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Error message (optional) */}
          {errorMessage && <div className="error-message">{errorMessage}</div>}

          <button
            type="submit"
            className={`login-btn ${isLoading ? "loading" : ""}`}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 size={20} className="spin mr-2" />
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
