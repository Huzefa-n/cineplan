import React, { useEffect, useState } from 'react';
import { getProjects, getScenes, getEquipment, getLocations } from '../services/api.js';
import { Spinner, Alert } from '../components/shared.jsx';

function StatCard({ value, label, icon, color }) {
  return (
    <div className={`stat-card ${color}`}>
      <div className="stat-icon">{icon}</div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

export default function Dashboard() {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState('');

  useEffect(() => {
    async function load() {
      try {
        const [pRes, sRes, eRes, lRes] = await Promise.all([
          getProjects(), getScenes(), getEquipment(), getLocations(),
        ]);
        const projects   = pRes.data || [];
        const scenes     = sRes.data || [];
        const equipment  = eRes.data || [];
        const locations  = lRes.data || [];

        const totalBudget     = projects.reduce((s, p) => s + (p.budget || 0), 0);
        const equipBudget     = equipment.reduce((s, e) => s + (e.cost || 0), 0);
        const scheduledScenes = scenes.filter(s => s.status === 'scheduled').length;
        const pendingScenes   = scenes.filter(s => s.status === 'pending').length;

        setData({ projects, scenes, equipment, locations, totalBudget, equipBudget, scheduledScenes, pendingScenes });
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <Spinner />;
  if (error)   return <Alert type="error">❌ {error}</Alert>;

  const { projects, scenes, equipment, locations, totalBudget, equipBudget, scheduledScenes, pendingScenes } = data;

  return (
    <div>
      <h2 className="section-title">Production Overview</h2>
      <p className="section-sub">Welcome to CinePlan — your intelligent film production management system.</p>

      {/* Stat grid */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-md-4 col-lg-2">
          <StatCard value={projects.length}   label="Projects"   icon="🎬" color="gold" />
        </div>
        <div className="col-6 col-md-4 col-lg-2">
          <StatCard value={scenes.length}     label="Scenes"     icon="🎭" color="blue" />
        </div>
        <div className="col-6 col-md-4 col-lg-2">
          <StatCard value={equipment.length}  label="Equipment"  icon="🎥" color="green" />
        </div>
        <div className="col-6 col-md-4 col-lg-2">
          <StatCard value={locations.length}  label="Locations"  icon="📍" color="purple" />
        </div>
        <div className="col-6 col-md-4 col-lg-2">
          <StatCard value={scheduledScenes}   label="Scheduled"  icon="✅" color="green" />
        </div>
        <div className="col-6 col-md-4 col-lg-2">
          <StatCard value={pendingScenes}     label="Pending"    icon="⏳" color="red" />
        </div>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-md-6">
          <StatCard value={`₹${totalBudget.toLocaleString()}`} label="Total Production Budget" icon="💰" color="gold" />
        </div>
        <div className="col-md-6">
          <StatCard value={`₹${equipBudget.toLocaleString()}`} label="Equipment Budget Used" icon="📦" color="cyan" />
        </div>
      </div>

      <div className="row g-3">
        {/* Recent Projects */}
        <div className="col-lg-6">
          <div className="cp-card">
            <div className="cp-card-header">
              <h3 className="cp-card-title">🎬 Recent Projects</h3>
            </div>
            <div style={{ padding: '0' }}>
              {projects.length === 0 ? (
                <div style={{ padding: '24px', textAlign: 'center', color: 'var(--cp-text-muted)' }}>No projects yet.</div>
              ) : (
                <table className="cp-table">
                  <thead>
                    <tr><th>Name</th><th>Budget</th><th>Status</th></tr>
                  </thead>
                  <tbody>
                    {projects.slice(0, 5).map(p => (
                      <tr key={p._id}>
                        <td>{p.name}</td>
                        <td>₹{(p.budget || 0).toLocaleString()}</td>
                        <td>
                          <span className={`cp-badge cp-badge-${
                            p.status === 'active' ? 'green' : p.status === 'completed' ? 'blue' : p.status === 'on-hold' ? 'red' : 'gray'
                          }`}>{p.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        {/* Recent Scenes */}
        <div className="col-lg-6">
          <div className="cp-card">
            <div className="cp-card-header">
              <h3 className="cp-card-title">🎭 Recent Scenes</h3>
            </div>
            <div style={{ padding: '0' }}>
              {scenes.length === 0 ? (
                <div style={{ padding: '24px', textAlign: 'center', color: 'var(--cp-text-muted)' }}>No scenes yet.</div>
              ) : (
                <table className="cp-table">
                  <thead>
                    <tr><th>Name</th><th>Priority</th><th>Deadline</th><th>Status</th></tr>
                  </thead>
                  <tbody>
                    {scenes.slice(0, 5).map(s => (
                      <tr key={s._id}>
                        <td>{s.name}</td>
                        <td><span className="cp-badge cp-badge-gold">{s.priority}</span></td>
                        <td>Slot {s.deadline}</td>
                        <td>
                          <span className={`cp-badge cp-badge-${
                            s.status === 'scheduled' ? 'green' : s.status === 'completed' ? 'blue' : s.status === 'cancelled' ? 'red' : 'gray'
                          }`}>{s.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* DAA Info */}
      <div className="row g-3 mt-2">
        {[
          { icon: '⚙️', title: '0/1 Knapsack', desc: 'Optimise equipment selection within your production budget using Dynamic Programming.', color: '#f59e0b', path: '/equipment-optimizer' },
          { icon: '📅', title: 'Job Sequencing', desc: 'Schedule film scenes greedily by priority to maximise production value within deadlines.', color: '#3b82f6', path: '/production-scheduler' },
          { icon: '🗺️', title: "Dijkstra's Shortest Path", desc: 'Find the minimum-distance route between shooting locations using a simple O(V²) implementation.', color: '#10b981', path: '/route-planner' },
        ].map(a => (
          <div key={a.title} className="col-md-4">
            <div className="cp-card h-100" style={{ borderTop: `3px solid ${a.color}` }}>
              <div className="cp-card-body">
                <div style={{ fontSize: '1.8rem', marginBottom: 8 }}>{a.icon}</div>
                <h5 style={{ fontWeight: 700, color: 'var(--cp-text)', marginBottom: 8 }}>{a.title}</h5>
                <p style={{ fontSize: '0.84rem', color: 'var(--cp-text-muted)', marginBottom: 16 }}>{a.desc}</p>
                <a href={a.path} style={{ color: a.color, fontSize: '0.82rem', fontWeight: 600, textDecoration: 'none' }}>
                  Open →
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
