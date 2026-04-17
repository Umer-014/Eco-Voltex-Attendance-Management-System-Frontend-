import React, { useState, useEffect } from "react";
import { Calendar, Clock, Leaf, AlertTriangle } from "lucide-react";
import "./LeaveBalanceCard.css";   // We'll create this CSS below
import API_BASE_URL from "../../../api/config";

const LeaveBalanceCard = () => {
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchLeaveBalance = async () => {
    
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/leaves/balance/${localStorage.getItem("employeeId")}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setBalance(data.balance);
      } else {
        setError(data.message || "Failed to load leave balance");
      }
    } catch (err) {
      setError("Server error. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaveBalance();
  }, []);

  if (loading) {
    return (
      <div className="leave-balance-card loading">
        <p>Loading leave balance...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="leave-balance-card error">
        <AlertTriangle size={24} />
        <p>{error}</p>
      </div>
    );
  }

  const annual = balance?.annual || { remaining: 0, used: 0, totalEntitled: 30 };
  const sickUsed = balance?.sick?.used || 0;
  const emergencyUsed = balance?.emergency?.used || 0;
  const unpaidUsed = balance?.unpaid?.used || 0;

  const usagePercentage = annual.totalEntitled > 0 
    ? Math.round((annual.used / annual.totalEntitled) * 100) 
    : 0;

  return (
    <div className="leave-balance-card">
      
      {/* Annual Leave - Main Highlight */}
      <div className="annual-section">
        <div className="annual-main">
          <div className="remaining-days">
            <span className="big-number">{annual.remaining}</span>
            <span className="days-label">days left</span>
          </div>

          <div className="progress-container">
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ width: `${usagePercentage}%` }}
              ></div>
            </div>
            <div className="progress-text">
              <span>{annual.used} used</span>
              <span>of {annual.totalEntitled}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Other Leave Types */}
      <div className="other-leaves">
        <div className="other-leave-item">
          <Clock size={20} className="icon sick" />
          <div>
            <p>Sick Leave Used</p>
            <strong>{sickUsed} days</strong>
          </div>
        </div>

        <div className="other-leave-item">
          <Clock size={20} className="icon emergency" />
          <div>
            <p>Emergency Leave Used</p>
            <strong>{emergencyUsed} days</strong>
          </div>
        </div>

        <div className="other-leave-item">
          <Clock size={20} className="icon unpaid" />
          <div>
            <p>Unpaid Leave Used</p>
            <strong>{unpaidUsed} days</strong>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaveBalanceCard;