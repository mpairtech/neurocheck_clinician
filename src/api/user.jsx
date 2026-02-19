import { domain } from "../../credentials";

// Get user by ID
const getUserById = async (userId) => {
  const response = await fetch(`${domain}/users/${userId}`, {
    method: "GET",
    headers: {
      authorization: `Bearer ${localStorage.getItem("accessToken")}`,
    },
  });

  const data = await response.json();
  return data;
};

const updateUserProfile = async (userId, userData) => {
  const response = await fetch(`${domain}/users/${userId}`, {
    method: "PUT", 
    headers: {
      "Content-Type": "application/json",
      authorization: `Bearer ${localStorage.getItem("accessToken")}`,
    },
    body: JSON.stringify(userData),
  });

  const data = await response.json();
  return data;
};

const addClinicianAvailabilty = async (obj) => {
  const response = await fetch(`${domain}/availabilities`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      authorization: `Bearer ${localStorage.getItem("accessToken")}`,
    },
    body: JSON.stringify(obj),
  });

  const data = await response.json();
  return data;
};

const getCinicianAvailabilityById = async (userId) => {
  const response = await fetch(`${domain}/availabilities?userId=${userId}`, {
    method: "GET",
    headers: {
      authorization: `Bearer ${localStorage.getItem("accessToken")}`,
    },
  });

  const data = await response.json();
  return data;
};

const updateClinicianAvailability = async (id, obj) => {
  const response = await fetch(`${domain}/availabilities/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      authorization: `Bearer ${localStorage.getItem("accessToken")}`,
    },
    body: JSON.stringify(obj),
  });

  const data = await response.json();
  return data;
};

const addClinicianLeave = async (obj) => {
  const response = await fetch(`${domain}/leaves`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      authorization: `Bearer ${localStorage.getItem("accessToken")}`,
    },
    body: JSON.stringify(obj),
  });

  const data = await response.json();
  return data;
};

const getLeavesById = async (userId) => {
  const response = await fetch(`${domain}/leaves?userId=${userId}`, {
    method: "GET",
    headers: {
      authorization: `Bearer ${localStorage.getItem("accessToken")}`,
    },
  });

  const data = await response.json();
  return data;
};

const getBillingInfo = async () => {
  const response = await fetch(`${domain}/payment/products`, {
    method: "GET",
    headers: {
      authorization: `Bearer ${localStorage.getItem("accessToken")}`,
    },
  });

  const data = await response.json();
  return data;
};

export {
  addClinicianAvailabilty,
  addClinicianLeave,
  getLeavesById,
  updateClinicianAvailability,
  getBillingInfo,
  getCinicianAvailabilityById,
  getUserById,
  updateUserProfile,
};
