import { domain } from "../../credentials";

const getAllanswers = async ({ patientId, assessmentId }) => {
  //console.log("o",patientId)
  const response = await fetch(`${domain}/answers?patientId=${Number(patientId)}&assessmentId=${assessmentId}&limit=100`, {
    method: "GET",
    headers: {
      authorization: `Bearer ${localStorage.getItem("accessToken")}`
      // Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();
  return data;
};


const getAllsubmissions = async () => {
  const response = await fetch(`${domain}/submissions?page=1&limit=10000`, {
    method: "GET",
    headers: {
         authorization: `Bearer ${localStorage.getItem("accessToken")}`
    },
  });

  const data = await response.json();
  return data;
};

const getSubmissionByPatientId = async (patientId,assessmentId) => {
  const response = await fetch(`${domain}/submissions?patientId=${patientId}&assessmentId=${assessmentId}`, {
    method: "GET",
    headers: {
         authorization: `Bearer ${localStorage.getItem("accessToken")}`
    },
  });

  const data = await response.json();
  return data;
};

const getSubmissionById = async (patientId) => {
  const response = await fetch(`${domain}/submissions?patientId=${patientId}`, {
    method: "GET",
    headers: {
         authorization: `Bearer ${localStorage.getItem("accessToken")}`
    },
  });

  const data = await response.json();
  return data;
};


const getSubmissionByClinicianId = async (clinicianId) => {
  const response = await fetch(`${domain}/submissions?clinicianId=${clinicianId}`, {
    method: "GET",
    headers: {
         authorization: `Bearer ${localStorage.getItem("accessToken")}`
    },
  });

  const data = await response.json();
  return data;
};


const updateStatus = async (id, obj) => {
 
    const response = await fetch(`${domain}/submissions/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${localStorage.getItem("accessToken")}`
      },
      body: JSON.stringify(obj),
    });
  
    const data = await response.json();
    //console.log("Update response:", data);
    return data;

};


////// prescription /////////////

const addPrescription = async (obj) => {
  // ////console.log("hello series", obj);

  const response = await fetch(`${domain}/prescriptions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      authorization: `Bearer ${localStorage.getItem("accessToken")}`,
    },
    body: JSON.stringify(obj),
  });

  const data = await response.json();
  //console.log("data", data);

  return data;
};


const addAppointment = async (obj) => {
  //console.log("hello series", obj);

  const response = await fetch(`${domain}/appointments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      authorization: `Bearer ${localStorage.getItem("accessToken")}`,
    },
    body: JSON.stringify(obj),
  });

  const data = await response.json();
  //console.log("data", data);

  return data;
};




const getAllappointments = async () => {
  const response = await fetch(`${domain}/appointments?limit=1000`, {
    method: "GET",
    headers: {
         authorization: `Bearer ${localStorage.getItem("accessToken")}`
    },
  });

  const data = await response.json();
  return data;
};




const updateSchedule = async (id,obj) => {
  // //console.log("hello update", obj);

  const response = await fetch(`${domain}/appointments/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      authorization: `Bearer ${localStorage.getItem("accessToken")}`,
    },
    body: JSON.stringify(obj),
  });

  const data = await response.json();
  // //console.log("data", data);

  return data;
};






export {
  getAllanswers,
  getSubmissionByPatientId,
  getAllsubmissions,
  updateStatus,
  addPrescription,
  getSubmissionByClinicianId,
  addAppointment,
  getAllappointments,
  updateSchedule,
  getSubmissionById 
};
