import React, { useEffect, useState, useCallback } from 'react';
import { getLocations, runDijkstra } from '../services/api.js';
import { Alert, Spinner, EmptyState, AlgoSteps, ComplexityBox, SectionCard } from '../components/shared.jsx';

// ── Simple SVG graph visualiser ───────────────────────────────
function GraphSVG({ locations, path }) {
  if (!locations || locations.length === 0) return null;

  const W = 560, H = 340, R = 26;
  const n = locations.length;

  // Place nodes in a circle
  const nodes = locations.map((loc, i) => {
    const angle = (2 * Math.PI * i) / n - Math.PI / 2;
    const cx = W / 2 + (W * 0.38) * Math.cos(angle);
    const cy = H / 2 + (H * 0.38) * Math.sin(angle);
    return { ...loc, cx, cy };
  });

  const nodeMap = Object.fromEntries(nodes.map(n => [n._id, n]));

  // Deduplicate edges (undirected)
  const edges = [];
  const seen = new Set();
  for (const loc of nodes) {
    for (const conn of (loc.connections || [])) {
      const toId = conn.to?._id || conn.to;
      if (!toId || !nodeMap[toId]) continue;
      const key = [loc._id, toId].sort().join('-');
      if (seen.has(key)) continue;
      seen.add(key);
      edges.push({ from: loc, to: nodeMap[toId], distance: conn.distance });
    }
  }

  const pathSet = new Set();
  if (path && path.length > 1) {
    for (let i = 0; i < path.length - 1; i++) {
      const a = path[i], b = path[i + 1];
      pathSet.add([a, b].sort().join('-'));
    }
  }

  const nodeNameMap = Object.fromEntries(nodes.map(n => [n.name, n]));

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="graph-canvas" style={{ maxHeight: 360 }}>
      {/* Edges */}
      {edges.map((e, i) => {
        const key = [e.from.name, e.to.name].sort().join('-');
        const isPath = pathSet.has(key);
        const mx = (e.from.cx + e.to.cx) / 2;
        const my = (e.from.cy + e.to.cy) / 2;
        return (
          <g key={i}>
            <line
              x1={e.from.cx} y1={e.from.cy}
              x2={e.to.cx}   y2={e.to.cy}
              stroke={isPath ? '#10b981' : '#2d3748'}
              strokeWidth={isPath ? 3 : 1.5}
              className="graph-edge"
            />
            <rect x={mx - 16} y={my - 10} width={32} height={18} rx={4} fill="var(--cp-surface)" fillOpacity="0.85" />
            <text x={mx} y={my + 4} textAnchor="middle" fontSize="10" fill="#94a3b8" className="graph-edge-weight">
              {e.distance}km
            </text>
          </g>
        );
      })}

      {/* Nodes */}
      {nodes.map(node => {
        const isOnPath = path && path.includes(node.name);
        const isSource = path && path[0] === node.name;
        const isDest   = path && path[path.length - 1] === node.name;
        const fill = isSource ? '#f59e0b' : isDest ? '#10b981' : isOnPath ? '#3b82f6' : '#1e293b';
        const stroke = isSource ? '#fbbf24' : isDest ? '#34d399' : isOnPath ? '#60a5fa' : '#4b5563';
        return (
          <g key={node._id} className="graph-node">
            <circle cx={node.cx} cy={node.cy} r={R} fill={fill} stroke={stroke} strokeWidth={2} />
            <text
              x={node.cx} y={node.cy + 4}
              textAnchor="middle"
              fontSize={node.name.length > 8 ? 8 : 10}
              fontWeight="600"
              fill={isSource || isDest || isOnPath ? '#fff' : '#94a3b8'}
            >
              {node.name.length > 10 ? node.name.slice(0, 9) + '…' : node.name}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export default function RoutePlanner() {
  const [locations, setLocations] = useState([]);
  const [source, setSource]       = useState('');
  const [dest, setDest]           = useState('');
  const [result, setResult]       = useState(null);
  const [loading, setLoading]     = useState(false);
  const [fetching, setFetching]   = useState(true);
  const [error, setError]         = useState('');

  useEffect(() => {
    getLocations()
      .then(r => setLocations(r.data || []))
      .catch(e => setError(e.message))
      .finally(() => setFetching(false));
  }, []);

  const handleRun = async () => {
    if (!source || !dest) return setError('Please select both source and destination.');
    if (source === dest)  return setError('Source and destination must be different.');
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await runDijkstra({ sourceId: source, destId: dest });
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
      <h2 className="section-title">Route Planner</h2>
      <p className="section-sub">Uses <strong>Dijkstra's Shortest Path Algorithm O(V²)</strong> to find the minimum-distance route between shooting locations.</p>

      {error && <Alert type="error">❌ {error}</Alert>}

      {/* Graph visualiser */}
      {locations.length > 0 && (
        <SectionCard title="Location Graph" icon="🗺️">
          <GraphSVG locations={locations} path={result?.path} />
          <div style={{ marginTop: 12, fontSize: '0.78rem', color: 'var(--cp-text-muted)', display: 'flex', gap: 20 }}>
            <span><span style={{ color: '#f59e0b' }}>●</span> Source</span>
            <span><span style={{ color: '#10b981' }}>●</span> Destination</span>
            <span><span style={{ color: '#3b82f6' }}>●</span> On shortest path</span>
            <span><span style={{ color: '#4b5563' }}>●</span> Other</span>
          </div>
        </SectionCard>
      )}

      {/* Controls */}
      <SectionCard title="Find Shortest Route" icon="🔍"
        action={
          <button className="btn-cp-run" onClick={handleRun} disabled={loading || locations.length < 2}>
            {loading ? '⏳ Running…' : '▶ Run Dijkstra'}
          </button>
        }
      >
        {locations.length < 2 ? (
          <Alert type="info">Add at least 2 locations with connections. <a href="/locations" style={{ color: 'var(--cp-gold)' }}>Go to Locations →</a></Alert>
        ) : (
          <div className="row g-3">
            <div className="col-md-5">
              <label className="cp-label">Source Location</label>
              <select className="cp-input cp-select" value={source} onChange={e => setSource(e.target.value)}>
                <option value="">— Select source —</option>
                {locations.map(l => <option key={l._id} value={l._id}>{l.name}</option>)}
              </select>
            </div>
            <div className="col-md-5">
              <label className="cp-label">Destination Location</label>
              <select className="cp-input cp-select" value={dest} onChange={e => setDest(e.target.value)}>
                <option value="">— Select destination —</option>
                {locations.map(l => <option key={l._id} value={l._id}>{l.name}</option>)}
              </select>
            </div>
          </div>
        )}
      </SectionCard>

      {/* Locations table */}
      {locations.length > 0 && (
        <SectionCard title="All Locations & Connections" icon="📍">
          <table className="cp-table">
            <thead>
              <tr><th>Location</th><th>Connections</th></tr>
            </thead>
            <tbody>
              {locations.map(loc => (
                <tr key={loc._id}>
                  <td style={{ fontWeight: 600 }}>{loc.name}</td>
                  <td>
                    {loc.connections && loc.connections.length > 0 ? (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                        {loc.connections.map((c, i) => (
                          <span key={i} className="cp-badge cp-badge-blue">
                            {c.to?.name || '?'} — {c.distance} km
                          </span>
                        ))}
                      </div>
                    ) : <span style={{ color: 'var(--cp-text-muted)' }}>No connections</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </SectionCard>
      )}

      {loading && <Spinner />}

      {result && (
        <>
          {/* Path result */}
          <SectionCard title={result.reachable ? '✅ Shortest Path Found' : '❌ No Path Found'} icon="">
            {result.reachable ? (
              <>
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 6, marginBottom: 16 }}>
                  {result.path.map((node, i) => (
                    <React.Fragment key={i}>
                      <span style={{
                        background: i === 0 ? 'rgba(245,158,11,0.2)' : i === result.path.length - 1 ? 'rgba(16,185,129,0.2)' : 'rgba(59,130,246,0.15)',
                        border: `1px solid ${i === 0 ? '#f59e0b' : i === result.path.length - 1 ? '#10b981' : '#3b82f6'}`,
                        color: i === 0 ? '#fbbf24' : i === result.path.length - 1 ? '#34d399' : '#60a5fa',
                        padding: '6px 14px',
                        borderRadius: 20,
                        fontWeight: 700,
                        fontSize: '0.9rem',
                      }}>{node}</span>
                      {i < result.path.length - 1 && (
                        <span style={{ color: 'var(--cp-text-muted)', fontWeight: 700 }}>→</span>
                      )}
                    </React.Fragment>
                  ))}
                </div>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '1.1rem', color: 'var(--cp-gold)', fontWeight: 800 }}>
                  Total Distance: {result.totalDistance} km
                </div>
              </>
            ) : (
              <Alert type="error">No path exists between the selected locations (graph may be disconnected).</Alert>
            )}
          </SectionCard>

          {/* Visited order */}
          <SectionCard title="Visited Nodes (Dijkstra Order)" icon="🔍">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {result.visitedOrder.map((name, i) => (
                <span key={i} className="cp-badge cp-badge-purple">
                  {i + 1}. {name}
                </span>
              ))}
            </div>
          </SectionCard>

          {/* Distance table */}
          <SectionCard title="Distance Table (from Source)" icon="📊">
            <table className="cp-table">
              <thead>
                <tr><th>Location</th><th>Shortest Distance from Source</th></tr>
              </thead>
              <tbody>
                {result.distanceTable.map((row, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 600 }}>{row.location}</td>
                    <td>
                      {row.distance === '∞' ? (
                        <span className="cp-badge cp-badge-red">∞ (unreachable)</span>
                      ) : (
                        <span className="cp-badge cp-badge-green">{row.distance} km</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </SectionCard>

          {/* Algorithm steps */}
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
