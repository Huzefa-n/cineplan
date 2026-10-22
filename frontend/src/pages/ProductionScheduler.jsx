import React, { useEffect, useState } from 'react';
import { getScenes, runJobScheduling } from '../services/api.js';
import { Alert, Spinner, EmptyState, AlgoSteps, ComplexityBox, SectionCard } from '../components/shared.jsx';

export default function ProductionScheduler() {
  const [scenes, setScenes]   = useState([]);
  const [result, setResult]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    getScenes()
      .then(r => setScenes(r.data || []))
      .catch(e => setError(e.message))
      .finally(() => setFetching(false));
  }, []);

  const handleRun = async () => {
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await runJobScheduling({});
      setResult(res.data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <Spinner />;

  return (
    <div>
      <h2 className="section-title">Production Scheduler</h2>
      <p className="section-sub">Uses <strong>Job Sequencing with Deadlines (Greedy)</strong> to schedule film scenes maximising total priority within shooting slots.</p>

      {error && <Alert type="error">❌ {error}</Alert>}

      {/* Input */}
      <SectionCard title="Run Job Sequencing Algorithm" icon="📅"
        action={
          <button className="btn-cp-run" onClick={handleRun} disabled={loading || scenes.length === 0}>
            {loading ? '⏳ Running…' : '▶ Run Algorithm'}
          </button>
        }
      >
        {scenes.length === 0 ? (
          <Alert type="info">No scenes in database. <a href="/scenes" style={{ color: 'var(--cp-gold)' }}>Add scenes first →</a></Alert>
        ) : (
          <p style={{ fontSize: '0.85rem', color: 'var(--cp-text-muted)', margin: 0 }}>
            {scenes.length} scene(s) loaded. Algorithm will schedule them by priority into shooting slots based on deadlines.
          </p>
        )}
      </SectionCard>

      {/* Original scenes */}
      {scenes.length > 0 && (
        <SectionCard title="All Scenes (Input)" icon="🎭">
          <table className="cp-table">
            <thead>
              <tr><th>#</th><th>Scene</th><th>Location</th><th>Deadline (Slot)</th><th>Priority</th><th>Status</th></tr>
            </thead>
            <tbody>
              {scenes.map((s, i) => (
                <tr key={s._id}>
                  <td style={{ color: 'var(--cp-text-muted)' }}>{i + 1}</td>
                  <td style={{ fontWeight: 600 }}>{s.name}</td>
                  <td style={{ color: 'var(--cp-text-muted)' }}>{s.location || '—'}</td>
                  <td><span className="cp-badge cp-badge-blue">Slot {s.deadline}</span></td>
                  <td><span className="cp-badge cp-badge-gold">{s.priority}</span></td>
                  <td><span className={`cp-badge cp-badge-${s.status === 'scheduled' ? 'green' : 'gray'}`}>{s.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </SectionCard>
      )}

      {loading && <Spinner />}

      {result && (
        <>
          {/* Stats */}
          <div className="row g-3 mb-4">
            {[
              { label: 'Total Slots',       value: result.totalSlots,                        color: 'blue'   },
              { label: 'Scenes Scheduled',  value: result.scheduledJobs.length,              color: 'green'  },
              { label: 'Scenes Missed',     value: result.unscheduledJobs.length,            color: 'red'    },
              { label: 'Total Priority',    value: result.totalProfit,                       color: 'gold'   },
            ].map(s => (
              <div key={s.label} className="col-6 col-md-3">
                <div className={`stat-card ${s.color}`}>
                  <div className="stat-value" style={{ fontSize: '1.5rem' }}>{s.value}</div>
                  <div className="stat-label">{s.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Sorted jobs */}
          <SectionCard title="Step 1: Jobs Sorted by Decreasing Priority" icon="🔽">
            <table className="cp-table">
              <thead>
                <tr><th>Rank</th><th>Scene</th><th>Deadline</th><th>Priority</th></tr>
              </thead>
              <tbody>
                {result.sortedJobs.map((j, i) => (
                  <tr key={i}>
                    <td><span className="cp-badge cp-badge-gray">#{i + 1}</span></td>
                    <td style={{ fontWeight: 600 }}>{j.name}</td>
                    <td>Slot {j.deadline}</td>
                    <td><span className="cp-badge cp-badge-gold">{j.priority}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </SectionCard>

          {/* Schedule slots */}
          <SectionCard title="Step 2: Final Shooting Schedule" icon="📋">
            <div className="schedule-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
              {result.schedule.map(slot => (
                <div key={slot.slot} className={`slot-card ${slot.isEmpty ? 'empty' : 'occupied'}`}>
                  <div className="slot-num">S{slot.slot}</div>
                  <div style={{ flex: 1 }}>
                    {slot.isEmpty ? (
                      <span style={{ color: 'var(--cp-text-muted)', fontSize: '0.82rem' }}>Empty slot</span>
                    ) : (
                      <>
                        <div style={{ fontWeight: 700, color: 'var(--cp-text)', fontSize: '0.9rem' }}>{slot.job.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--cp-text-muted)' }}>
                          Priority: {slot.job.priority} · Deadline: Slot {slot.job.deadline}
                          {slot.job.location && ` · 📍 ${slot.job.location}`}
                        </div>
                      </>
                    )}
                  </div>
                  {!slot.isEmpty && <span className="cp-badge cp-badge-green">✓</span>}
                </div>
              ))}
            </div>
          </SectionCard>

          {/* Scheduled / Unscheduled */}
          <div className="row g-3 mb-4">
            <div className="col-md-6">
              <SectionCard title="✅ Scheduled Scenes" icon="">
                {result.scheduledJobs.length === 0 ? (
                  <EmptyState icon="📭" message="No scenes were scheduled." />
                ) : (
                  <table className="cp-table">
                    <thead><tr><th>Scene</th><th>Slot</th><th>Priority</th></tr></thead>
                    <tbody>
                      {result.scheduledJobs.map((j, i) => (
                        <tr key={i}>
                          <td style={{ fontWeight: 600 }}>{j.name}</td>
                          <td><span className="cp-badge cp-badge-blue">Slot {j.assignedSlot}</span></td>
                          <td><span className="cp-badge cp-badge-gold">{j.priority}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </SectionCard>
            </div>
            <div className="col-md-6">
              <SectionCard title="❌ Unscheduled Scenes" icon="">
                {result.unscheduledJobs.length === 0 ? (
                  <div style={{ padding: '16px', color: 'var(--cp-text-muted)', fontSize: '0.85rem' }}>All scenes were scheduled! 🎉</div>
                ) : (
                  <table className="cp-table">
                    <thead><tr><th>Scene</th><th>Deadline</th><th>Priority</th></tr></thead>
                    <tbody>
                      {result.unscheduledJobs.map((j, i) => (
                        <tr key={i}>
                          <td style={{ fontWeight: 600, color: 'var(--cp-text-muted)' }}>{j.name}</td>
                          <td>Slot {j.deadline}</td>
                          <td><span className="cp-badge cp-badge-red">{j.priority}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </SectionCard>
            </div>
          </div>

          {/* Algorithm Steps */}
          <SectionCard title="Algorithm Steps" icon="🔍">
            <AlgoSteps steps={result.steps} />
          </SectionCard>

          {/* Complexity */}
          <SectionCard title="Complexity Analysis" icon="📐">
            <ComplexityBox complexity={result.complexity} />
          </SectionCard>
        </>
      )}
    </div>
  );
}
