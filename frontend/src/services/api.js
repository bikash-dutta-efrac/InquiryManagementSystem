import axios from "axios";

const API_BASE_URL = "http://192.168.3.212:5075/api";

function buildRequestBody(filters = {}) {
  return {
    fromDate: filters.fromDate || null,
    toDate: filters.toDate || null,
    month: filters.month || null,
    year: filters.year || null,
    verticals: filters.verticals || [],
    bdNames: filters.bdNames || [],
    clientNames: filters.clientNames || [],
    labs: filters.labNames || [],
    dateField: filters.dateField || "inqDate",
    excludeVerticals: filters.excludeVerticals,
    excludeBds: filters.excludeBds,
    excludeClients: filters.excludeClients,
    excludeLabs: filters.excludeLabs
  };
}

export async function getAllBdProjection(filter = {}) {

  const response = await axios.post(`${API_BASE_URL}/projections/bd/get-all`, filter, {
    headers: { "Content-Type": "application/json" },
  });

  return response.data;
}

export async function createBdProjection(body = {}) {

  const response = await axios.post(`${API_BASE_URL}/projections/bd/create`, body, {
    headers: { "Content-Type": "application/json" },
  });

  return response.data;
}

export async function getSampleOverview(filters = {}) {
  const body = buildRequestBody(filters);

  const response = await axios.post(`${API_BASE_URL}/lab/sample-overview`, body, {
    headers: { "Content-Type": "application/json" },
  });

  return response.data;
}

export async function getLabSummaries(filters = {}) {
  const body = buildRequestBody(filters);

  const response = await axios.post(`${API_BASE_URL}/lab/summaries`, body, {
    headers: { "Content-Type": "application/json" },
  });

  return response.data;
}

export async function getSampleSummaries(filters = {}) {
  const body = buildRequestBody(filters);

  const response = await axios.post(`${API_BASE_URL}/lab/samples`, body, {
    headers: { "Content-Type": "application/json" },
  });

  return response.data;
}

export async function getSampleDetailsByRegNo(regNo) {

  const response = await axios.post(`${API_BASE_URL}/lab/sample-details`, regNo, {
    headers: { "Content-Type": "application/json" },
  });

  return response.data;
}

export async function getLabNames(filters = {}) {
  const body = buildRequestBody(filters);

  const response = await axios.post(`${API_BASE_URL}/lab/names`, body, {
    headers: { "Content-Type": "application/json" },
  });

  return response.data;
}

export async function getBdBusinessSummary(filters = {}) {
  const body = buildRequestBody(filters);
  const response = await axios.post(`${API_BASE_URL}/business/bd-business-overview`, body, {
    headers: { "Content-Type": "application/json" },
  });
  return response.data;
}

export async function getMtoMBusinessComparison(filters = {}) {
  // const body = buildRequestBody(filters);
  console.log(filters)
  const response = await axios.post(`${API_BASE_URL}/business/bd-business-comparison`, filters, {
    headers: { "Content-Type": "application/json" },
  });
  return response.data;
}


export async function getInquiries(filters = {}) {
  const body = buildRequestBody(filters);
  const response = await axios.post(`${API_BASE_URL}/inquiries`, body, {
    headers: { "Content-Type": "application/json" },
  });
  return response.data;
}

export async function getProjections(filters = {}) {
  const body = buildRequestBody(filters);
  const response = await axios.post(`${API_BASE_URL}/projections`, body, {
    headers: { "Content-Type": "application/json" },
  });
  return response.data;
}

export async function getVerticals(filters = {}) {
  const body = buildRequestBody(filters);
  const response = await axios.post(`${API_BASE_URL}/inquiries/verticals`, body, {
    headers: { "Content-Type": "application/json" },
  });
  return response.data;
}

export async function getBdNames(filters = {}) {
  const body = buildRequestBody(filters);
  const response = await axios.post(`${API_BASE_URL}/inquiries/bdnames`, body, {
    headers: { "Content-Type": "application/json" },
  });
  return response.data;
}

export async function getClientNames(filters = {}) {
  const body = buildRequestBody(filters);
  const response = await axios.post(`${API_BASE_URL}/inquiries/clientnames`, body, {
    headers: { "Content-Type": "application/json" },
  });
  return response.data;
}