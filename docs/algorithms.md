# CinePlan Algorithm Documentation

## 1. 0/1 Knapsack — Dynamic Programming

### Problem Statement
Select a subset of film equipment items such that the total **production value** is maximised without exceeding the **production budget** (knapsack capacity). Each item is either included (1) or excluded (0) — it cannot be partially included.

### Real-world Application in CinePlan
A film production has a fixed budget. The Equipment Optimizer runs the Knapsack algorithm to automatically select the combination of cameras, lenses, microphones, etc. that gives the highest overall production quality within budget.

### Input
- `budget (W)` — integer, the maximum total cost allowed.
- `items[n]` — array of equipment, each with `cost` (weight) and `productionValue` (value).

### Output
- `selectedItems` — array of chosen equipment.
- `totalCost` — sum of costs of selected items.
- `totalValue` — sum of production values.
- `remainingBudget` — budget − totalCost.
- `dpTable` — the full (n+1) × (W+1) DP table for visualisation.
- `steps` — step-by-step trace of algorithm decisions.

### Algorithm (Bottom-up DP)

```
Initialise dp[0..n][0..W] = 0

For i = 1 to n:
  For w = 0 to W:
    if items[i].cost > w:
      dp[i][w] = dp[i-1][w]          // cannot include item i
    else:
      dp[i][w] = max(
        dp[i-1][w],                    // exclude item i
        dp[i-1][w - items[i].cost] + items[i].value  // include item i
      )

Backtrack from dp[n][W] to find selected items.
```

### Pseudocode
```
knapsack(budget W, items[]):
  n ← len(items)
  dp ← (n+1) × (W+1) array of zeros

  for i from 1 to n:
    for w from 0 to W:
      if items[i-1].cost > w:
        dp[i][w] ← dp[i-1][w]
      else:
        dp[i][w] ← max(dp[i-1][w], dp[i-1][w - items[i-1].cost] + items[i-1].value)

  // Backtrack
  selected ← []
  w ← W
  for i from n downto 1:
    if dp[i][w] ≠ dp[i-1][w]:
      selected.push(items[i-1])
      w ← w - items[i-1].cost

  return selected, dp
```

### Implementation
File: `backend/algorithms/knapsack/knapsack.js`

### Time Complexity
**O(n × W)** — nested loops over n items and W budget units.

### Space Complexity
**O(n × W)** — the DP table stores (n+1) × (W+1) values.

---

## 2. Job Sequencing with Deadlines — Greedy

### Problem Statement
Given n film scenes (jobs), each with a **deadline** (latest slot by which it must be filmed) and a **priority/profit**, schedule them into time slots to maximise total profit. Each slot holds exactly one scene.

### Real-world Application in CinePlan
The Production Scheduler arranges scenes by priority and assigns them to shooting slots, ensuring high-priority scenes get scheduled first and within their deadlines.

### Input
- `jobs[n]` — array of scenes, each with `name`, `deadline` (positive integer), `priority` (profit).

### Output
- `scheduledJobs` — scenes that were successfully placed.
- `unscheduledJobs` — scenes that could not be placed.
- `schedule` — slot-by-slot schedule array.
- `totalProfit` — sum of priorities of scheduled jobs.
- `sortedJobs` — jobs after sorting by decreasing priority.
- `steps` — step-by-step trace.

### Algorithm (Greedy)

```
Sort jobs by decreasing priority.
maxDeadline ← max deadline across all jobs.
slots[1..maxDeadline] ← null (free)

For each job in sorted order:
  For t from job.deadline downto 1:
    if slots[t] is free:
      slots[t] ← job
      break
  else:
    mark job as unscheduled
```

### Pseudocode
```
jobSequencing(jobs[]):
  sort jobs descending by priority
  maxD ← max(jobs[i].deadline)
  slots ← array[1..maxD] of null

  for job in jobs:
    placed ← false
    for t from min(job.deadline, maxD) downto 1:
      if slots[t] = null:
        slots[t] ← job
        placed ← true
        break
    if not placed: unscheduled.push(job)

  return slots, scheduled, unscheduled
```

### Implementation
File: `backend/algorithms/jobScheduling/jobSequencing.js`

### Time Complexity
**O(n²)** — outer loop over n jobs; inner slot search is at most n steps each.

### Space Complexity
**O(n)** — the slot array has at most n entries (bounded by max deadline, which ≤ n in a typical case).

---

## 3. Dijkstra's Shortest Path — Simple O(V²)

### Problem Statement
Given a weighted undirected graph of shooting locations, find the shortest path (minimum total distance) from a source location to a destination location.

### Real-world Application in CinePlan
The Route Planner finds the cheapest/fastest travel route between any two shooting locations, saving crew travel time and transportation costs.

### Input
- `locations[]` — MongoDB location documents with `connections[{to, distance}]`.
- `sourceId` — MongoDB `_id` of the source location.
- `destId` — MongoDB `_id` of the destination location.

### Output
- `path` — ordered array of location names on the shortest path.
- `totalDistance` — minimum total distance.
- `visitedOrder` — order in which nodes were finalised.
- `distanceTable` — shortest distance from source to every node.
- `steps` — step-by-step trace.

### Algorithm (Simple Dijkstra)

```
Initialise dist[source] = 0, dist[all others] = ∞
visited[all] = false

Repeat V times:
  u ← unvisited node with minimum dist[u]
  if u = destination: stop
  mark u visited
  for each neighbour v of u with edge weight w:
    if dist[u] + w < dist[v]:
      dist[v] ← dist[u] + w
      previous[v] ← u

Backtrack from destination using previous[] to get path.
```

### Pseudocode
```
dijkstra(graph, source, dest):
  for each v: dist[v] ← ∞, visited[v] ← false, prev[v] ← null
  dist[source] ← 0

  for iter = 1 to V:
    u ← unvisited v with min dist[v]
    if u = null: break
    visited[u] ← true
    if u = dest: break
    for each (u, v, w) in edges:
      if not visited[v] and dist[u] + w < dist[v]:
        dist[v] ← dist[u] + w
        prev[v] ← u

  path ← reconstruct using prev[]
  return path, dist[dest]
```

### Implementation
File: `backend/algorithms/dijkstra/dijkstra.js`

### Time Complexity
**O(V² + E)** — the inner minimum-scan loop runs V times over V nodes (V²); each edge is relaxed at most once (E).

### Space Complexity
**O(V)** — dist, visited, and previous arrays each hold V entries.
