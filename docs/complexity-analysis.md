# CinePlan — Complexity Analysis

## Comparison of the Three DAA Algorithms

| Algorithm | Problem Type | Approach | Time Complexity | Space Complexity |
|-----------|-------------|----------|-----------------|------------------|
| 0/1 Knapsack | Optimisation | Dynamic Programming | **O(n × W)** | **O(n × W)** |
| Job Sequencing | Scheduling | Greedy | **O(n²)** | **O(n)** |
| Dijkstra | Graph Shortest Path | Greedy (relaxation) | **O(V² + E)** | **O(V)** |

---

## Detailed Analysis

### 1. 0/1 Knapsack — O(n × W)

**Variables:**
- n = number of equipment items
- W = budget (in integer units)

**Time Analysis:**
```
Outer loop:  n iterations   (one per item)
Inner loop:  W+1 iterations (one per budget unit)
Total:       n × (W+1) ≈ O(n × W)
```
The algorithm fills every cell of the DP table exactly once.

**Space Analysis:**
The DP table `dp[n+1][W+1]` stores (n+1)(W+1) integers → **O(n × W)**.

**Notes:**
- W depends on the numeric value of the budget, not n. This is known as **pseudo-polynomial** time — it is polynomial in the value of the input, not the length of the input encoding.
- The full DP table is stored and returned to the frontend for step-by-step visualisation.

---

### 2. Job Sequencing with Deadlines — O(n²)

**Variables:**
- n = number of scenes/jobs

**Time Analysis:**
```
Sort step:   O(n log n)       (built-in sort)
Outer loop:  n iterations     (one per job)
Inner loop:  ≤ n iterations   (scan slots from deadline down to 1)
Total:       O(n log n + n²) = O(n²)
```
The dominant term is the nested slot search: O(n²).

**Space Analysis:**
The slot array has at most maxDeadline entries. Since deadline ≤ n in practical usage, the array is O(n).

---

### 3. Dijkstra's Shortest Path — O(V² + E)

**Variables:**
- V = number of locations (vertices)
- E = number of connections (edges)

**Time Analysis:**
```
Main loop:    V iterations
Min scan:     V comparisons per iteration → V²
Edge relax:   each edge relaxed at most once → E
Total:        O(V² + E)
```

Using a binary-heap priority queue would reduce this to O((V + E) log V), but the simple array-scan implementation used here avoids any external data-structure dependency and is academically clear.

**Space Analysis:**
- `dist[]` — V entries
- `visited[]` — V entries
- `previous[]` — V entries
Total: **O(V)** (adjacency list is part of the input, not extra space).

---

## When Does Each Algorithm Perform Best?

| Scenario | Best Choice |
|----------|-------------|
| Small n, large W | Knapsack (W dominates) |
| Large n, small W | Knapsack (n × W is manageable) |
| Many jobs, varied deadlines | Job Sequencing (greedy, fast) |
| Dense graph (E ≈ V²) | Dijkstra simple O(V²) ≈ O(E) |
| Sparse graph + large V | Dijkstra with heap (not needed here) |

---

## Implementation Files

| Algorithm | File |
|-----------|------|
| 0/1 Knapsack | `backend/algorithms/knapsack/knapsack.js` |
| Job Sequencing | `backend/algorithms/jobScheduling/jobSequencing.js` |
| Dijkstra | `backend/algorithms/dijkstra/dijkstra.js` |
