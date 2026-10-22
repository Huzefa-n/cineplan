import React from 'react';
import { BrowserRouter, Routes, Route, NavLink, useLocation } from 'react-router-dom';

import Dashboard           from './pages/Dashboard.jsx';
import Projects            from './pages/Projects.jsx';
import Scenes              from './pages/Scenes.jsx';
import EquipmentPage       from './pages/Equipment.jsx';
import Locations           from './pages/Locations.jsx';
import ProductionScheduler from './pages/ProductionScheduler.jsx';
import EquipmentOptimizer  from './pages/EquipmentOptimizer.jsx';
import RoutePlanner        from './pages/RoutePlanner.jsx';
import DAAVisualizer       from './pages/DAAVisualizer.jsx';
import Analytics           from './pages/Analytics.jsx';

const NAV = [
  {
    section: 'Overview',
    items: [
      { to: '/',          icon: '⬛', label: 'Dashboard' },
      { to: '/analytics', icon: '📊', label: 'Analytics' },
    ],
  },
  {
    section: 'Production Data',
    items: [
      { to: '/projects',   icon: '🎬', label: 'Projects' },
      { to: '/scenes',     icon: '🎭', label: 'Scenes' },
      { to: '/equipment',  icon: '🎥', label: 'Equipment' },
      { to: '/locations',  icon: '📍', label: 'Locations' },
    ],
  },
  {
    section: 'DAA Algorithms',
    items: [
      { to: '/equipment-optimizer',  icon: '⚙️',  label: 'Equipment Ohptimizer' },
      { to: '/production-scheduler', icon: '📅', label: 'Production Scheduler' },
      { to: '/route-planner',        icon: '🗺️',  label: 'Route Planner' },
      { to: '/daa-visualizer',       icon: '🧮', label: 'DAA Visualizer' },
    ],
  },
];

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <p className="brand-title">🎬 CinePlan</p>
        <p className="brand-subtitle">Film Production Optimizer</p>
      </div>
      <nav className="sidebar-nav">
        {NAV.map(group => (
          <div key={group.section}>
            <div className="nav-section-label">{group.section}</div>
            {group.items.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  'nav-link' + (isActive ? ' active' : '')
                }
              >
                <span className="nav-icon">{item.icon}</span>
                {item.label}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>
    </aside>
  );
}

const PAGE_TITLES = {
  '/':                      'Dashboard',
  '/analytics':             'Analytics',
  '/projects':              'Projects',
  '/scenes':                'Scenes',
  '/equipment':             'Equipment',
  '/locations':             'Locations',
  '/equipment-optimizer':   'Equipment Optimizer — 0/1 Knapsack',
  '/production-scheduler':  'Production Scheduler — Job Sequencing',
  '/route-planner':         'Route Planner — Dijkstra',
  '/daa-visualizer':        'DAA Visualizer',
};

function Topbar() {
  const { pathname } = useLocation();
  return (
    <header className="topbar">
      <h1 className="topbar-title">{PAGE_TITLES[pathname] || 'CinePlan'}</h1>
      <span className="topbar-badge">DAA Project</span>
    </header>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-layout">
        <Sidebar />
        <div className="main-content">
          <Topbar />
          <main className="page-content">
            <Routes>
              <Route path="/"                      element={<Dashboard />} />
              <Route path="/analytics"             element={<Analytics />} />
              <Route path="/projects"              element={<Projects />} />
              <Route path="/scenes"                element={<Scenes />} />
              <Route path="/equipment"             element={<EquipmentPage />} />
              <Route path="/locations"             element={<Locations />} />
              <Route path="/equipment-optimizer"   element={<EquipmentOptimizer />} />
              <Route path="/production-scheduler"  element={<ProductionScheduler />} />
              <Route path="/route-planner"         element={<RoutePlanner />} />
              <Route path="/daa-visualizer"        element={<DAAVisualizer />} />
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  );
}
