import axios from "axios";

const API_BASE_URL = "http://192.168.3.183:5075/api";

function buildRequestBody(filters = {}) {
  return {
    fromDate: filters.fromDate || null,
    toDate: filters.toDate || null,
    month: filters.month || null,
    year: filters.year || null,
    verticals: filters.verticals || [],
    bdNames: filters.bdNames || [],
    clientNames: filters.clientNames || [],
    dateField: filters.dateField || "inqDate",
    excludeVerticals: filters.excludeVerticals,
    excludeBDs: filters.excludeBDs,
    excludeClients: filters.excludeClients,
  };
}

// Inquiries endpoint
export async function getInquiries(filters = {}) {
  const body = buildRequestBody(filters);
  const response = await axios.post(`${API_BASE_URL}/inquiries`, body, {
    headers: { "Content-Type": "application/json" },
  });
  return response.data;
}

// ⭐ NEW Projections endpoint
export async function getProjections(filters = {}) {
  const body = buildRequestBody(filters);
  const response = await axios.post(`${API_BASE_URL}/projections`, body, {
    headers: { "Content-Type": "application/json" },
  });
  return response.data;
}

// Verticals endpoint
export async function getVerticals(filters = {}) {
  const body = buildRequestBody(filters);
  const response = await axios.post(`${API_BASE_URL}/inquiries/verticals`, body, {
    headers: { "Content-Type": "application/json" },
  });
  return response.data;
}

// BD Names endpoint
export async function getBDNames(filters = {}) {
  const body = buildRequestBody(filters);
  const response = await axios.post(`${API_BASE_URL}/inquiries/bdnames`, body, {
    headers: { "Content-Type": "application/json" },
  });
  return response.data;
}

// Client Names endpoint
export async function getClientNames(filters = {}) {
  const body = buildRequestBody(filters);
  const response = await axios.post(`${API_BASE_URL}/inquiries/clientnames`, body, {
    headers: { "Content-Type": "application/json" },
  });
  return response.data;
}
