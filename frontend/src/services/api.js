/**
 * api.js — Centralised API service layer.
 *
 * Uses the native browser fetch API.
 * The Vite dev server proxies /api/* to http://localhost:5000.
 */

const BASE = '/api';

async function request(method, url, body) {
  const options = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  if (body) options.body = JSON.stringify(body);
  let res;
  try {
    res = await fetch(BASE + url, options);
  } catch {
    throw new Error('Cannot reach backend. Make sure the backend server and MongoDB are running.');
  }
  let data;
  try {
    data = await res.json();
  } catch {
    throw new Error('Backend returned an invalid response. Make sure MongoDB is running and connected.');
  }
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
}

// ── Projects ─────────────────────────────────────────────────
export const getProjects      = ()         => request('GET',    '/projects');
export const getProject       = (id)       => request('GET',    `/projects/${id}`);
export const createProject    = (body)     => request('POST',   '/projects', body);
export const updateProject    = (id, body) => request('PUT',    `/projects/${id}`, body);
export const deleteProject    = (id)       => request('DELETE', `/projects/${id}`);

// ── Scenes ───────────────────────────────────────────────────
export const getScenes        = ()         => request('GET',    '/scenes');
export const getScene         = (id)       => request('GET',    `/scenes/${id}`);
export const createScene      = (body)     => request('POST',   '/scenes', body);
export const updateScene      = (id, body) => request('PUT',    `/scenes/${id}`, body);
export const deleteScene      = (id)       => request('DELETE', `/scenes/${id}`);

// ── Equipment ────────────────────────────────────────────────
export const getEquipment     = ()         => request('GET',    '/equipment');
export const getEquipmentById = (id)       => request('GET',    `/equipment/${id}`);
export const createEquipment  = (body)     => request('POST',   '/equipment', body);
export const updateEquipment  = (id, body) => request('PUT',    `/equipment/${id}`, body);
export const deleteEquipment  = (id)       => request('DELETE', `/equipment/${id}`);

// ── Locations ────────────────────────────────────────────────
export const getLocations     = ()         => request('GET',    '/locations');
export const getLocation      = (id)       => request('GET',    `/locations/${id}`);
export const createLocation   = (body)     => request('POST',   '/locations', body);
export const updateLocation   = (id, body) => request('PUT',    `/locations/${id}`, body);
export const deleteLocation   = (id)       => request('DELETE', `/locations/${id}`);
export const addConnection    = (id, body) => request('POST',   `/locations/${id}/connections`, body);

// ── Algorithms ───────────────────────────────────────────────
export const runKnapsack      = (body) => request('POST', '/algorithms/knapsack', body);
export const runJobScheduling = (body) => request('POST', '/algorithms/job-scheduling', body);
export const runDijkstra      = (body) => request('POST', '/algorithms/dijkstra', body);
