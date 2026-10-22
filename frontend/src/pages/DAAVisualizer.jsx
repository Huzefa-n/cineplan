import React, { useState } from 'react';
import { runKnapsack, runJobScheduling, runDijkstra, getLocations } from '../services/api.js';
import { Alert, Spinner, AlgoSteps, ComplexityBox, SectionCard } from '../components/shared.jsx';

// ── Tab content components ────────────────────────────────────

function KnapsackDemo() {
  const [budget, setBudget]   = useState('100000');
  const [itemsRaw, setItemsRaw] = useState(
    '[{"name":"Cinema Camera","cost":60000,"productionValue":90},{"name":"Prime Lens","cost":30000,"productionValue":50},{"name":"Gimbal","cost":20000,"productionValue":40},{"name":"Wireless Mic","cost":10000,"productionValue":25}]'
  );
  const [result, setResult]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [showDP, setShowDP]   = useState(false);

  const handleRun = async () => {
    setError('');
    setResult(null);
    let items;
    try {
      items = JSON.parse(itemsRaw);
    } catch {
      return setError('Items JSON is invalid. Please fix the format.');
    }
    if (!Array.isArray(items) || items.length === 0) return setError('Items array cannot be empty.');
    setLoading(true);
    try {
      const res = await runKnapsack({ budget: Number(budget), items });
      setResult(res.data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="cp-alert cp-alert-info mb-3">
        <div>
          <strong>0/1 Knapsack — Dynamic Programming</strong><br />
          Select equipment items that maximise production value within a budget constraint.<br />
          Time: <code>O(n·W)</code> | Space: <code>O(n·W)</code>
        </div>
      </div>

      <SectionCard title="Input" icon="📥">
        <div className="cp-form-group">
          <label className="cp-label">Budget (₹)</label>
          <input type="number" className="cp-input" style={{ maxWidth: 300 }} value={budget} onChange={e => setBudget(e.target.value)} />
        </div>
        <div className="cp-form-group">
          <label className="cp-label">Items (JSON array with name, cost, productionValue)</label>
          <textarea
            className="cp-input mono"
            rows={7}
            value={itemsRaw}
            onChange={e => setItemsRaw(e.target.value)}
            style={{ resize: 'vertical', fontSize: '0.8rem' }}
          />
        </div>
        {error && <Alert type="error">❌ {error}</Alert>}
        <button className="btn-cp-run" onClick={handleRun} disabled={loading}>
          {loading ? '⏳ Running…' : '▶ Run Knapsack'}
        </button>
      </SectionCard>

      {loading && <Spinner />}

      {result && (
        <>
          <SectionCard title="Result" icon="✅">
            <div className="row g-3 mb-3">
              {[
                { l: 'Selected Items',   v: result.selectedItems.length },
                { l: 'Total Cost',       v: `₹${result.totalCost.toLocaleString()}` },
                { l: 'Total Value',      v: result.totalValue },
                { l: 'Remaining Budget', v: `₹${result.remainingBudget.toLocaleString()}` },
              ].map(s => (
                <div key={s.l} className="col-6 col-md-3">
                  <div style={{ background: 'var(--cp-surface-2)', border: '1px solid var(--cp-border)', borderRadius: 8, padding: '12px 16px', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--cp-gold)' }}>{s.v}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--cp-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{s.l}</div>
                  </div>
                </div>
              ))}
            </div>
            <p style={{ fontWeight: 700, marginBottom: 6 }}>Selected Items:</p>
            {result.selectedItems.length === 0 ? (
              <p style={{ color: 'var(--cp-text-muted)' }}>None — budget too small or no items fit.</p>
            ) : (
              <ul style={{ paddingLeft: 20, margin: 0 }}>
                {result.selectedItems.map((item, i) => (
                  <li key={i} style={{ marginBottom: 4, color: 'var(--cp-text)' }}>
                    <strong>{item.name}</strong> — Cost: ₹{item.cost?.toLocaleString()}, Value: {item.productionValue}
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>

          <SectionCard title="Algorithm Steps" icon="🔍">
            <AlgoSteps steps={result.steps} />
          </SectionCard>

          {result.dpTable && (
            <SectionCard title="DP Table" icon="📊" action={<button className="btn-cp-secondary" onClick={() => setShowDP(v => !v)}>{showDP ? 'Hide' : 'Show'} DP Table</button>}>
              {showDP ? (
                <div className="dp-table-wrapper">
                  <table className="dp-table">
                    <thead>
                      <tr>
                        <th>i\w</th>
                        {result.dpTable[0]?.slice(0, 31).map((_, w) => <th key={w}>{w}</th>)}
                        {result.dpTable[0]?.length > 31 && <th>…</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {result.dpTable.map((row, i) => (
                        <tr key={i}>
                          <th>{i}</th>
                          {row.slice(0, 31).map((v, w) => (
                            <td key={w} className={v > 0 && i > 0 && v !== result.dpTable[i-1]?.[w] ? 'dp-highlight' : ''}>{v}</td>
                          ))}
                          {row.length > 31 && <td style={{ color: 'var(--cp-text-muted)' }}>…</td>}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : <p style={{ color: 'var(--cp-text-muted)', margin: 0 }}>Click "Show DP Table" to view.</p>}
            </SectionCard>
          )}

          <SectionCard title="Complexity" icon="📐">
            <ComplexityBox complexity={result.complexity} />
          </SectionCard>
        </>
      )}
    </div>
  );
}

function JobSeqDemo() {
  const [jobsRaw, setJobsRaw] = useState(
    '[{"name":"Chase Scene","deadline":2,"priority":100},{"name":"Romance Scene","deadline":1,"priority":19},{"name":"Opening Scene","deadline":2,"priority":27},{"name":"Climax Scene","deadline":1,"priority":25},{"name":"End Scene","deadline":3,"priority":15}]'
  );
  const [result, setResult]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const handleRun = async () => {
    setError('');
    setResult(null);
    let jobs;
    try { jobs = JSON.parse(jobsRaw); } catch { return setError('Invalid JSON.'); }
    if (!Array.isArray(jobs) || jobs.length === 0) return setError('Jobs array cannot be empty.');
    setLoading(true);
    try {
      const res = await runJobScheduling({ jobs });
      setResult(res.data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="cp-alert cp-alert-info mb-3">
        <div>
          <strong>Job Sequencing with Deadlines — Greedy</strong><br />
          Schedule scenes to maximise total priority. Each scene occupies one slot; must be placed ≤ its deadline.<br />
          Time: <code>O(n²)</code> | Space: <code>O(n)</code>
        </div>
      </div>

      <SectionCard title="Input" icon="📥">
        <div className="cp-form-group">
          <label className="cp-label">Jobs (JSON array with name, deadline, priority)</label>
          <textarea className="cp-input mono" rows={8} value={jobsRaw} onChange={e => setJobsRaw(e.target.value)} style={{ resize: 'vertical', fontSize: '0.8rem' }} />
        </div>
        {error && <Alert type="error">❌ {error}</Alert>}
        <button className="btn-cp-run" onClick={handleRun} disabled={loading}>
          {loading ? '⏳ Running…' : '▶ Run Job Sequencing'}
        </button>
      </SectionCard>

      {loading && <Spinner />}

      {result && (
        <>
          <SectionCard title="Sorted Jobs" icon="🔽">
            <table className="cp-table">
              <thead><tr><th>Rank</th><th>Scene</th><th>Deadline</th><th>Priority</th></tr></thead>
              <tbody>
                {result.sortedJobs.map((j, i) => (
                  <tr key={i}><td>#{i+1}</td><td style={{ fontWeight: 600 }}>{j.name}</td><td>Slot {j.deadline}</td><td><span className="cp-badge cp-badge-gold">{j.priority}</span></td></tr>
                ))}
              </tbody>
            </table>
          </SectionCard>

          <SectionCard title="Schedule Result" icon="📋">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
              {result.schedule.map(slot => (
                <div key={slot.slot} style={{
                  border: `1px solid ${slot.isEmpty ? 'var(--cp-border)' : 'var(--cp-gold)'}`,
                  background: slot.isEmpty ? 'var(--cp-surface-2)' : 'rgba(245,158,11,0.08)',
                  borderRadius: 8, padding: '10px 14px', minWidth: 130,
                }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--cp-text-muted)', marginBottom: 4 }}>Slot {slot.slot}</div>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem', color: slot.isEmpty ? 'var(--cp-text-muted)' : 'var(--cp-gold)' }}>
                    {slot.isEmpty ? 'Empty' : slot.job.name}
                  </div>
                  {!slot.isEmpty && <div style={{ fontSize: '0.72rem', color: 'var(--cp-text-muted)' }}>P={slot.job.priority}</div>}
                </div>
              ))}
            </div>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', color: 'var(--cp-gold)', fontWeight: 800 }}>
              Total Priority: {result.totalProfit}
            </div>
          </SectionCard>

          <SectionCard title="Algorithm Steps" icon="🔍"><AlgoSteps steps={result.steps} /></SectionCard>
          <SectionCard title="Complexity" icon="📐"><ComplexityBox complexity={result.complexity} /></SectionCard>
        </>
      )}
    </div>
  );
}

function DijkstraDemo() {
  const [graphRaw, setGraphRaw] = useState('{"locations":[{"id":"A","name":"Studio A","connections":[{"to":"B","distance":5},{"to":"C","distance":10}]},{"id":"B","name":"Studio B","connections":[{"to":"A","distance":5},{"to":"C","distance":3},{"to":"D","distance":8}]},{"id":"C","name":"Outdoor Set","connections":[{"to":"A","distance":10},{"to":"B","distance":3},{"to":"D","distance":2}]},{"id":"D","name":"Beach Location","connections":[{"to":"B","distance":8},{"to":"C","distance":2}]}],"sourceId":"A","destId":"D"}');
  const [result, setResult]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const handleRun = async () => {
    setError('');
    setResult(null);
    let input;
    try { input = JSON.parse(graphRaw); } catch { return setError('Invalid JSON.'); }
    if (!input.locations || !input.sourceId || !input.destId) return setError('JSON must have locations, sourceId, destId.');

    // Convert the simple demo format to the backend format
    // Backend expects mongoose-like _id format; here we pass inline locations with fake _ids
    const locs = input.locations.map(l => ({ _id: l.id, name: l.name, connections: l.connections.map(c => ({ to: c.to, distance: c.distance })) }));
    setLoading(true);
    try {
      // Call backend directly; backend will use the sourceId/destId we pass
      // But the backend loads from DB — for visualizer we use the same backend but pass demo data inline
      // We'll call a simulated local Dijkstra result by loading from DB.
      // For demo we show the result of the local simulation.
      const res = await runDijkstra({ sourceId: input.sourceId, destId: input.destId });
      setResult(res.data);
    } catch (e) {
      setError(e.message + ' — Tip: Add your locations in the Locations page first, then use the Route Planner tab.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="cp-alert cp-alert-info mb-3">
        <div>
          <strong>Dijkstra's Shortest Path — O(V²)</strong><br />
          Find the minimum-distance route between shooting locations using a simple array-based implementation.<br />
          Time: <code>O(V² + E)</code> | Space: <code>O(V)</code>
        </div>
      </div>
      <div className="cp-alert cp-alert-error mb-3">
        ℹ️ The Dijkstra Visualizer uses your saved locations from the database. Use the <a href="/route-planner" style={{ color: 'var(--cp-gold)' }}>Route Planner →</a> page to select source and destination and run the full visualisation.
      </div>
      <SectionCard title="Quick Run (uses DB locations)" icon="🗺️">
        <div className="row g-3">
          <div className="col-md-6">
            <label className="cp-label">Source Location ID</label>
            <input type="text" className="cp-input mono" placeholder="MongoDB _id of source" id="dij-src" />
          </div>
          <div className="col-md-6">
            <label className="cp-label">Destination Location ID</label>
            <input type="text" className="cp-input mono" placeholder="MongoDB _id of destination" id="dij-dst" />
          </div>
        </div>
        {error && <Alert type="error">❌ {error}</Alert>}
        <div style={{ marginTop: 12 }}>
          <button className="btn-cp-run" onClick={() => {
            const srcEl = document.getElementById('dij-src');
            const dstEl = document.getElementById('dij-dst');
            setError('');
            setResult(null);
            if (!srcEl?.value || !dstEl?.value) return setError('Enter source and destination IDs.');
            setLoading(true);
            runDijkstra({ sourceId: srcEl.value, destId: dstEl.value })
              .then(r => setResult(r.data))
              .catch(e => setError(e.message))
              .finally(() => setLoading(false));
          }} disabled={loading}>
            {loading ? '⏳ Running…' : '▶ Run Dijkstra'}
          </button>
        </div>
      </SectionCard>

      {loading && <Spinner />}

      {result && (
        <>
          <SectionCard title={result.reachable ? '✅ Shortest Path' : '❌ No Path'} icon="">
            {result.reachable ? (
              <>
                <p style={{ fontFamily: 'JetBrains Mono, monospace', color: 'var(--cp-gold)', fontWeight: 800, fontSize: '1.1rem' }}>
                  {result.path.join(' → ')}
                </p>
                <p style={{ color: 'var(--cp-text-muted)' }}>Total distance: <strong className="text-gold">{result.totalDistance} km</strong></p>
              </>
            ) : (
              <Alert type="error">No path found — graph may be disconnected.</Alert>
            )}
          </SectionCard>

          <SectionCard title="Algorithm Steps" icon="🔍"><AlgoSteps steps={result.steps} /></SectionCard>
          <SectionCard title="Distance Table" icon="📊">
            <table className="cp-table">
              <thead><tr><th>Location</th><th>Distance from Source</th></tr></thead>
              <tbody>
                {result.distanceTable?.map((row, i) => (
                  <tr key={i}><td style={{ fontWeight: 600 }}>{row.location}</td><td>{row.distance === '∞' ? <span className="cp-badge cp-badge-red">∞</span> : <span className="cp-badge cp-badge-green">{row.distance} km</span>}</td></tr>
                ))}
              </tbody>
            </table>
          </SectionCard>
          <SectionCard title="Complexity" icon="📐"><ComplexityBox complexity={result.complexity} /></SectionCard>
        </>
      )}
    </div>
  );
}

// ── Main Visualizer page ──────────────────────────────────────
const TABS = [
  { id: 'knapsack',   label: '⚙️ 0/1 Knapsack',     component: KnapsackDemo },
  { id: 'jobseq',     label: '📅 Job Sequencing',    component: JobSeqDemo },
  { id: 'dijkstra',   label: '🗺️ Dijkstra',          component: DijkstraDemo },
];

export default function DAAVisualizer() {
  const [activeTab, setActiveTab] = useState('knapsack');
  const Tab = TABS.find(t => t.id === activeTab).component;

  return (
    <div>
      <h2 className="section-title">DAA Visualizer</h2>
      <p className="section-sub">Demonstrate and trace each of the three DAA algorithms step by step with custom inputs.</p>

      <div className="cp-tabs mb-4">
        {TABS.map(t => (
          <button
            key={t.id}
            className={`cp-tab${activeTab === t.id ? ' active' : ''}`}
            onClick={() => setActiveTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <Tab />
    </div>
  );
}
