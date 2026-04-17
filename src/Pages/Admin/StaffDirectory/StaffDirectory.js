import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,

} from "lucide-react";
import { getAllStaff } from "../../../api/authApi";
import "./StaffDirectory.css";

const StaffDirectory = () => {
  const [staff, setStaff] = useState([]);
  const [filteredStaff, setFilteredStaff] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();

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

  useEffect(() => {
    const filtered = staff.filter((member) =>
      [member.name, member.employeeId, member.email]
        .join(" ")
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    );
    setFilteredStaff(filtered);
  }, [searchTerm, staff]);

  const handleViewProfile = (member) => {
    const id = member.employeeId || member._id;
    navigate(`/admin/staff/${id}`);
  };

  return (
    <div className="staff-directory-page">
      <div className="staff-header">
        <h1>Staff Directory</h1>
        <p className="staff-subtitle">Manage your team • {staff.length} members</p>
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
            <p className="no-results">No staff found.</p>
          ) : (
            filteredStaff.map((member) => (
              <div
                key={member._id}
                className="staff-card"
                onClick={() => handleViewProfile(member)}
              >
                <div className="staff-avatar">
                  {member.profileImage?.url ? (
                    <img
                      src={member.profileImage.url}
                      alt={member.name}
                      className="profile-img"
                    />
                  ) : (
                    <User size={42} />
                  )}
                </div>
                <div className="staff-info">
                  <h3>{member.name}</h3>
                  <p className="staff-id">{member.employeeId}</p>
                  <p className="staff-email">{member.email}</p>
                  <span className={`staff-role ${member.role}`}>
                    {member.role}
                  </span>
                  {member.rank && <p className="staff-rank">{member.rank}</p>}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default StaffDirectory;