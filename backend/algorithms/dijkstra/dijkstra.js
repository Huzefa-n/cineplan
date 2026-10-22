/**
 * ============================================================
 * DIJKSTRA'S SHORTEST PATH ALGORITHM
 * ============================================================
 *
 * Problem Statement:
 *   Given a weighted undirected graph of shooting locations,
 *   find the shortest (minimum distance) path from a source
 *   location to a destination location.
 *
 * Approach: Simple O(V²) array-based implementation.
 *   No external heap/priority-queue library is used.
 *   This makes the algorithm academically clear and easy to
 *   trace step-by-step.
 *
 * Time  Complexity: O(V² + E)  — with a simple array scan
 *                               for the minimum-distance node.
 *                  (V = vertices/locations, E = edges/connections)
 * Space Complexity: O(V)       — dist, visited, previous arrays.
 * ============================================================
 */

/**
 * Builds an adjacency list from a flat list of locations.
 *
 * @param {Array} locations - Location documents from MongoDB.
 *   Each location has: { _id, name, connections: [{ to, distance }] }
 * @returns {{ adjList: Map, nameToId: Map, idToName: Map }}
 */
function buildGraph(locations) {
  // Map: locationId → { name, neighbours: [{id, distance}] }
  const adjList  = new Map();
  const nameToId = new Map();
  const idToName = new Map();

  for (const loc of locations) {
    const id = loc._id.toString();
    adjList.set(id, { name: loc.name, neighbours: [] });
    nameToId.set(loc.name, id);
    idToName.set(id, loc.name);
  }

  // Add edges (undirected: add both directions).
  for (const loc of locations) {
    const fromId = loc._id.toString();
    if (Array.isArray(loc.connections)) {
      for (const conn of loc.connections) {
        const toId = conn.to ? conn.to.toString() : null;
        if (toId && adjList.has(toId) && conn.distance > 0) {
          adjList.get(fromId).neighbours.push({ id: toId, distance: conn.distance });
          // Add reverse edge if not already present.
          const rev = adjList.get(toId).neighbours;
          if (!rev.find(n => n.id === fromId)) {
            rev.push({ id: fromId, distance: conn.distance });
          }
        }
      }
    }
  }

  return { adjList, nameToId, idToName };
}

/**
 * Runs Dijkstra's algorithm on the built graph.
 *
 * @param {Array}  locations   - Location documents.
 * @param {string} sourceId    - MongoDB _id of the source location.
 * @param {string} destId      - MongoDB _id of the destination location.
 * @returns {Object}           - Path, distance, visited order, dist table, steps.
 */
function dijkstra(locations, sourceId, destId) {
  const steps = [];

  // ── Build graph ─────────────────────────────────────────────
  const { adjList, idToName } = buildGraph(locations);

  // ── Validate source and destination ─────────────────────────
  if (!adjList.has(sourceId)) {
    return { error: 'Source location not found in graph.' };
  }
  if (!adjList.has(destId)) {
    return { error: 'Destination location not found in graph.' };
  }

  const V = adjList.size;
  const ids = [...adjList.keys()];

  steps.push(
    `Graph has ${V} location(s). Source: "${idToName.get(sourceId)}", ` +
    `Destination: "${idToName.get(destId)}".`
  );

  // ── Initialise distance and visited arrays ───────────────────
  // dist[id] = shortest known distance from source to id.
  const dist     = new Map();
  const visited  = new Map();
  const previous = new Map();   // for path reconstruction

  for (const id of ids) {
    dist.set(id, Infinity);
    visited.set(id, false);
    previous.set(id, null);
  }

  dist.set(sourceId, 0);
  steps.push(`Initialised all distances to ∞ except source (distance = 0).`);

  const visitedOrder = []; // order in which nodes are finalised

  // ── Main loop ────────────────────────────────────────────────
  // Repeat V times; each iteration finalises one vertex.
  for (let iter = 0; iter < V; iter++) {
    // 1. Pick the unvisited vertex with minimum distance.
    let u = null;
    let minDist = Infinity;
    for (const id of ids) {
      if (!visited.get(id) && dist.get(id) < minDist) {
        minDist = dist.get(id);
        u = id;
      }
    }

    if (u === null) break; // remaining nodes are unreachable

    visited.set(u, true);
    visitedOrder.push(idToName.get(u));
    steps.push(
      `Iteration ${iter + 1}: Finalising "${idToName.get(u)}" ` +
      `(distance = ${minDist === Infinity ? '∞' : minDist} km).`
    );

    if (u === destId) {
      steps.push(`Destination reached. Stopping early.`);
      break;
    }

    // 2. Relax all neighbours of u.
    const { neighbours } = adjList.get(u);
    for (const { id: v, distance: w } of neighbours) {
      if (!visited.get(v)) {
        const newDist = dist.get(u) + w;
        if (newDist < dist.get(v)) {
          dist.set(v, newDist);
          previous.set(v, u);
          steps.push(
            `  Relaxed edge "${idToName.get(u)}" → "${idToName.get(v)}": ` +
            `new distance = ${newDist} km.`
          );
        }
      }
    }
  }

  // ── Reconstruct shortest path ────────────────────────────────
  const shortestPath = [];
  let cur = destId;

  if (dist.get(destId) === Infinity) {
    steps.push(`No path exists between source and destination (disconnected graph).`);
    return {
      path: [],
      totalDistance: Infinity,
      visitedOrder,
      distanceTable: buildDistTable(ids, dist, idToName),
      steps,
      reachable: false,
      complexity: {
        time:  'O(V² + E)',
        space: 'O(V)',
        V: `V = ${V} locations`,
      },
    };
  }

  while (cur !== null) {
    shortestPath.unshift(idToName.get(cur));
    cur = previous.get(cur);
  }

  steps.push(`Shortest path: ${shortestPath.join(' → ')}`);
  steps.push(`Total distance: ${dist.get(destId)} km`);

  return {
    path: shortestPath,
    totalDistance: dist.get(destId),
    visitedOrder,
    distanceTable: buildDistTable(ids, dist, idToName),
    steps,
    reachable: true,
    complexity: {
      time:  'O(V² + E)',
      space: 'O(V)',
      V: `V = ${V} locations`,
      E: `E = number of connections`,
    },
  };
}

/**
 * Builds a human-readable distance table for the UI.
 *
 * @param {Array}  ids      - All location IDs.
 * @param {Map}    dist     - Distances map.
 * @param {Map}    idToName - ID → name map.
 * @returns {Array}         - [{ location, distance }]
 */
function buildDistTable(ids, dist, idToName) {
  return ids.map(id => ({
    location: idToName.get(id),
    distance: dist.get(id) === Infinity ? '∞' : dist.get(id),
  }));
}

module.exports = { dijkstra, buildGraph };
