# 🎬 CinePlan — Intelligent Film Production Planning and Optimization System

A full-stack web application for planning and optimising film production, built as a **DAA (Design and Analysis of Algorithms) project** demonstrating three core algorithms.

---

## 🎯 Features

- Create and manage film **projects**, **scenes**, **equipment**, and **locations**
- **Equipment Optimizer** — 0/1 Knapsack (Dynamic Programming)
- **Production Scheduler** — Job Sequencing with Deadlines (Greedy)
- **Route Planner** — Dijkstra's Shortest Path (Graph Algorithm)
- **DAA Visualizer** — step-by-step algorithm trace with DP tables and slot grids
- **Analytics** — complexity comparison dashboard
- Dark, film-production themed UI with Bootstrap 5

---

## 🛠 Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Bootstrap 5, Vite (build tool) |
| Backend | Node.js, Express.js |
| Database | MongoDB + Mongoose |
| HTTP | Native `fetch` API (browser) |
| Styling | Bootstrap 5 + Custom CSS (no Tailwind) |

---

## 📦 Dependencies

### Backend (`backend/package.json`)
| Package | Purpose |
|---------|---------|
| `express` | HTTP server and routing |
| `mongoose` | MongoDB ODM for schema and queries |
| `cors` | Allow cross-origin requests from frontend dev server |
| `dotenv` | Load `.env` environment variables |

### Frontend (`frontend/package.json`)
| Package | Purpose |
|---------|---------|
| `react` | UI component library |
| `react-dom` | React DOM renderer |
| `react-router-dom` | Client-side routing (10 pages) |
| `bootstrap` | CSS framework for responsive layout |
| `vite` | Development server + build tool |
| `@vitejs/plugin-react` | Vite plugin for React JSX |

No Axios (native fetch used). No Tailwind. No chart libraries. No lodash.

---

## ⚙️ Installation & Setup

### 1. Prerequisites
- Node.js ≥ 18
- MongoDB running locally on `mongodb://localhost:27017`

### 2. MongoDB Setup
Start MongoDB service:
```bash
# Windows
net start MongoDB

# macOS/Linux
mongod --dbpath /data/db
```
The database `cineplan` is created automatically on first run.

### 3. Backend Setup
```bash
cd backend
npm install
```
Edit `.env` if needed (defaults work for local MongoDB):
```
MONGO_URI=mongodb://localhost:27017/cineplan
PORT=5000
```

### 4. Frontend Setup
```bash
cd frontend
npm install
```

---

## 🚀 Running the Application

Open **two terminals**:

**Terminal 1 — Backend:**
```bash
cd backend
npm start
# or for auto-reload: node --watch server.js
```
Backend runs at: `http://localhost:5000`

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
```
Frontend runs at: `http://localhost:3000`

The Vite dev server proxies `/api/*` to the backend automatically.

---

## 📡 API Reference

### CRUD Endpoints
```
GET/POST        /api/projects
GET/PUT/DELETE  /api/projects/:id

GET/POST        /api/scenes
GET/PUT/DELETE  /api/scenes/:id

GET/POST        /api/equipment
GET/PUT/DELETE  /api/equipment/:id

GET/POST        /api/locations
GET/PUT/DELETE  /api/locations/:id
POST            /api/locations/:id/connections
```

### Algorithm Endpoints
```
POST /api/algorithms/knapsack
  Body: { budget: number, items?: [{name, cost, productionValue}] }

POST /api/algorithms/job-scheduling
  Body: { jobs?: [{name, deadline, priority}] }

POST /api/algorithms/dijkstra
  Body: { sourceId: string, destId: string }
```

---

## 🧮 DAA Algorithm Implementations

| Algorithm | File | API |
|-----------|------|-----|
| 0/1 Knapsack (DP) | `backend/algorithms/knapsack/knapsack.js` | `POST /api/algorithms/knapsack` |
| Job Sequencing (Greedy) | `backend/algorithms/jobScheduling/jobSequencing.js` | `POST /api/algorithms/job-scheduling` |
| Dijkstra (O(V²)) | `backend/algorithms/dijkstra/dijkstra.js` | `POST /api/algorithms/dijkstra` |

All algorithms are implemented **from scratch** in pure JavaScript without any external library.

---

## 📊 Complexity Summary

| Algorithm | Time | Space |
|-----------|------|-------|
| 0/1 Knapsack | O(n × W) | O(n × W) |
| Job Sequencing | O(n²) | O(n) |
| Dijkstra | O(V² + E) | O(V) |

---

## 📁 Project Structure

```
cineplan/
├── backend/
│   ├── algorithms/
│   │   ├── knapsack/knapsack.js           ← 0/1 Knapsack DP
│   │   ├── jobScheduling/jobSequencing.js ← Job Sequencing Greedy
│   │   └── dijkstra/dijkstra.js           ← Dijkstra O(V²)
│   ├── controllers/
│   │   ├── projectController.js
│   │   ├── sceneController.js
│   │   ├── equipmentController.js
│   │   ├── locationController.js
│   │   └── algorithmController.js
│   ├── routes/
│   │   ├── projectRoutes.js
│   │   ├── sceneRoutes.js
│   │   ├── equipmentRoutes.js
│   │   ├── locationRoutes.js
│   │   └── algorithmRoutes.js
│   ├── models/
│   │   ├── Project.js
│   │   ├── Scene.js
│   │   ├── Equipment.js
│   │   └── Location.js
│   ├── config/db.js
│   ├── server.js
│   ├── .env
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Projects.jsx
│   │   │   ├── Scenes.jsx
│   │   │   ├── Equipment.jsx
│   │   │   ├── Locations.jsx
│   │   │   ├── EquipmentOptimizer.jsx   ← Knapsack UI
│   │   │   ├── ProductionScheduler.jsx  ← Job Scheduling UI
│   │   │   ├── RoutePlanner.jsx         ← Dijkstra UI + SVG graph
│   │   │   ├── DAAVisualizer.jsx        ← All 3 algorithms (tabbed)
│   │   │   └── Analytics.jsx
│   │   ├── components/shared.jsx
│   │   ├── services/api.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── docs/
│   ├── algorithms.md
│   ├── complexity-analysis.md
│   └── architecture.md
│
├── .gitignore
└── README.md
```

---

## 🎓 Academic Note

This project was built as a **Design and Analysis of Algorithms (DAA)** college project. The three algorithms are genuinely implemented, not mocked:

1. **0/1 Knapsack** — bottom-up DP with full table construction and backtracking.
2. **Job Sequencing** — greedy sort-and-place with O(n²) slot search.
3. **Dijkstra** — simple array-scan implementation, O(V²), with full step trace.

No external algorithm libraries were used. Each algorithm file contains detailed comments explaining every step.
