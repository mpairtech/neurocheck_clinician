import { domain } from "../../credentials";

const getAllanswers = async ({ patientId, assessmentId }) => {
  let allData = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const response = await fetch(
      `${domain}/answers?patientId=${Number(patientId)}&assessmentId=${assessmentId}&limit=100&page=${page}`,
      {
        method: "GET",
        headers: {
          authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      },
    );

    const data = await response.json();
    const payload = data?.payload || [];

    allData = [...allData, ...payload];

   
    if (payload.length < 100) {
      hasMore = false; 
    } else {
      page++;
    }
  }

  return { payload: allData };
};


const getAllSubmissions = async () => {
  let allSubmissions = [];
  let page = 1;
  const limit = 100;

  while (true) {
    const response = await fetch(
      `${domain}/submissions?page=${page}&limit=${limit}`,
      {
        method: "GET",
        headers: {
          authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      },
    );

    const data = await response.json();
    if (!Array.isArray(data.payload) || data.payload.length === 0) break;

    allSubmissions = [...allSubmissions, ...data.payload];
    page += 1;
  }

  return { payload: allSubmissions };
};

const getSubmissionByPatientId = async (patientId, assessmentId) => {
  let allData = [];
  let page = 1;
  let hasMore = true;

   while (hasMore) {
     const response = await fetch(
       `${domain}/submissions?patientId=${patientId}&assessmentId=${assessmentId}&limit=100&page=${page}`,
       {
         method: "GET",
         headers: {
           authorization: `Bearer ${localStorage.getItem("accessToken")}`,
         },
       },
     );

     const data = await response.json();

     const payload = data?.payload || [];

     allData = [...allData, ...payload];

     if (payload.length < 100) {
       hasMore = false;
     } else {
       page++;
     }
   }

   return { payload: allData };
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


// question categoires
const getAllQuestionCategories = async () => {
  let page = 1;
  let limit = 100;
  let allCategories = [];
  let hasMore = true;

  while (hasMore) {
    const response = await fetch(
      `${domain}/question-categories?page=${page}&limit=${limit}`,
      {
        method: "GET",
        headers: {
          authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      },
    );

    const data = await response.json();

    if (Array.isArray(data.payload) && data.payload.length > 0) {
      allCategories = [...allCategories, ...data.payload];
      page++;
    } else {
      hasMore = false;
    }
  }

  return { payload: allCategories };
};



export {
  getAllanswers,
  getSubmissionByPatientId,
  getAllSubmissions,
  updateStatus,
  addPrescription,
  getSubmissionByClinicianId,
  addAppointment,
  getAllappointments,
  updateSchedule,
  getSubmissionById,
  getAllQuestionCategories,
};
