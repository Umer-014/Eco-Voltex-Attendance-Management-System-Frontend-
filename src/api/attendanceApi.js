import API_BASE_URL from "./config";

// ===== Check-In API =====
export const checkIn = async () => {
  const token = localStorage.getItem("token"); // JWT token

  const response = await fetch(`${API_BASE_URL}/attendance/checkin`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Check-in failed");
  }

  return data;
};

// ===== Check-Out API =====
export const checkOut = async () => {
  const token = localStorage.getItem("token"); // JWT token

  const response = await fetch(`${API_BASE_URL}/attendance/checkout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Check-out failed");
  }

  return data;
};

// ===== Fetch Attendance Records (HR/Admin) =====
export const getAttendance = async () => {
  const token = localStorage.getItem("token"); // JWT token

  const response = await fetch(`${API_BASE_URL}/attendance`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch attendance");
  }


  return data;

};