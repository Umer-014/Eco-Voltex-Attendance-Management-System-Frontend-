import API_BASE_URL from "./config";

export const loginUser = async (email, password, role) => {

  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      password,
      role
    }),
  });

  const data = await response.json();
  console.log("Login response:", data);

  if (!response.ok) {
    throw new Error(data.message || "Login failed");
  }

  return data;
};

export const registerUser = async (name, email, password, role,  dateOfBirth, ContactPhone, address, dateOfJoining, shareCode  ) => {
  const response = await fetch(`${API_BASE_URL}/register/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ 
      name, 
      email, 
      password, 
      role,
      dateOfBirth,
      ContactPhone,
      address,
      dateOfJoining,
      shareCode 
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Registration failed");
  }

  return data;
};

// ====================== STAFF MANAGEMENT API FUNCTIONS ======================

// Get All Staff (Employees + Admins)
export const getAllStaff = async () => {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_BASE_URL}/register/staff`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch staff");
  }

  return data.staff || [];
};

// Get Specific Staff Member (by _id, email, or employeeId)
export const getStaffByIdentifier = async (identifier) => {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_BASE_URL}/register/staff/${identifier}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch staff member");
  }

  return data.staff;
};

// Delete Staff Member
export const deleteStaff = async (identifier) => {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_BASE_URL}/register/staff/${identifier}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to delete staff");
  }

  return data;
};