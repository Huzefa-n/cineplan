# CinePlan Architecture

## System Overview

```
Browser (React)
     │  HTTP/REST (JSON)
     ▼
Express.js API Server (Node.js)
     │
     ├── Algorithm Controllers
     │     ├── knapsack.js      (0/1 Knapsack — DP)
     │     ├── jobSequencing.js (Job Sequencing — Greedy)
     │     └── dijkstra.js      (Dijkstra — Simple O(V²))
     │
     └── Mongoose ODM
           │
           └── MongoDB Database (cineplan)
                 ├── projects
                 ├── scenes
                 ├── equipment
                 └── locations
```

## Key Design Decisions

1. **Algorithm isolation** — each DAA algorithm lives in its own `backend/algorithms/<name>/` directory. Controllers call them as pure functions.
2. **No algorithm libraries** — Knapsack, Job Sequencing, and Dijkstra are implemented from scratch in vanilla JavaScript.
3. **Native fetch** — the frontend uses `window.fetch` directly; no Axios or similar library.
4. **Single MongoDB** — one Mongoose connection with four models; no SQL, no Firebase.
5. **Bootstrap + Custom CSS** — Bootstrap for grid and utilities; custom CSS variables for the dark film-production theme.
