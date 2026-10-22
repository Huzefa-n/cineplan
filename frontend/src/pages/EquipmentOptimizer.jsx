import React, { useEffect, useState } from 'react';
import { getEquipment, runKnapsack } from '../services/api.js';
import { Alert, Spinner, EmptyState, AlgoSteps, ComplexityBox, SectionCard } from '../components/shared.jsx';

export default function EquipmentOptimizer() {
  const [equipment, setEquipment] = useState([]);
  const [budget, setBudget]       = useState('');
  const [result, setResult]       = useState(null);
  const [loading, setLoading]     = useState(false);
  const [fetching, setFetching]   = useState(true);
  const [error, setError]         = useState('');
  const [showDPTable, setShowDPTable] = useState(false);

  useEffect(() => {
    getEquipment()
      .then(r => setEquipment(r.data || []))
      .catch(e => setError(e.message))
      .finally(() => setFetching(false));
  }, []);

  const handleRun = async () => {
    if (!budget || Number(budget) < 0) return setError('Please enter a valid non-negative budget.');
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await runKnapsack({ budget: Number(budget) });
      setResult(res.data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // Build DP table for display (limit to 20 cols for readability)
  const dpDisplay = result?.dpTable;

  if (fetching) return <Spinner />;

  return (
    <div>
      <h2 className="section-title">Equipment Optimizer</h2>
      <p className="section-sub">Uses <strong>0/1 Knapsack (Dynamic Programming)</strong> to select equipment with maximum production value within budget.</p>

      {error && <Alert type="error">❌ {error}</Alert>}

      {/* Input */}
      <SectionCard title="Run Knapsack Optimisation" icon="⚙️"
        action={
          <button className="btn-cp-run" onClick={handleRun} disabled={loading || equipment.length === 0}>
            {loading ? '⏳ Running…' : '▶ Run Algorithm'}
          </button>
        }
      >
        {equipment.length === 0 ? (
          <Alert type="info">No equipment in database. <a href="/equipment" style={{ color: 'var(--cp-gold)' }}>Add equipment first →</a></Alert>
        ) : (
          <>
            <div className="cp-form-group" style={{ maxWidth: 320 }}>
              <label className="cp-label">Production Budget (₹) *</label>
              <input
                type="number"
                className="cp-input"
                value={budget}
                placeholder="e.g. 100000"
                min="0"
                onChange={e => setBudget(e.target.value)}
              />
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--cp-text-muted)' }}>
              {equipment.length} equipment item(s) loaded from database. The algorithm will choose the best combination.
            </p>
          </>
        )}
      </SectionCard>

      {/* Available Equipment */}
      {equipment.length > 0 && (
        <SectionCard title="Available Equipment" icon="📦">
          <table className="cp-table">
            <thead>
              <tr><th>#</th><th>Name</th><th>Category</th><th>Cost (₹)</th><th>Production Value</th></tr>
            </thead>
            <tbody>
              {equipment.map((e, i) => (
                <tr key={e._id}>
                  <td style={{ color: 'var(--cp-text-muted)' }}>{i + 1}</td>
                  <td style={{ fontWeight: 600 }}>{e.name}</td>
                  <td><span className="cp-badge cp-badge-purple">{e.category}</span></td>
                  <td className="text-gold">₹{(e.cost || 0).toLocaleString()}</td>
                  <td><span className="cp-badge cp-badge-blue">{e.productionValue}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </SectionCard>
      )}

      {loading && <Spinner />}

      {result && (
        <>
          {/* Results Summary */}
          <div className="row g-3 mb-4">
            {[
              { label: 'Items Selected',    value: result.selectedItems.length,                          color: 'gold' },
              { label: 'Total Cost',        value: `₹${(result.totalCost || 0).toLocaleString()}`,        color: 'blue' },
              { label: 'Total Value',       value: result.totalValue,                                     color: 'green' },
              { label: 'Remaining Budget',  value: `₹${(result.remainingBudget || 0).toLocaleString()}`,  color: 'purple' },
            ].map(s => (
              <div key={s.label} className="col-6 col-md-3">
                <div className={`stat-card ${s.color}`}>
                  <div className="stat-value" style={{ fontSize: '1.5rem' }}>{s.value}</div>
                  <div className="stat-label">{s.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Selected Items */}
          <SectionCard title="✅ Selected Equipment" icon="">
            {result.selectedItems.length === 0 ? (
              <EmptyState icon="📭" message="No items selected. Budget may be too small or items too expensive." />
            ) : (
              <table className="cp-table">
                <thead>
                  <tr><th>Name</th><th>Category</th><th>Cost (₹)</th><th>Production Value</th></tr>
                </thead>
                <tbody>
                  {result.selectedItems.map((e, i) => (
                    <tr key={i} style={{ background: 'rgba(245,158,11,0.04)' }}>
                      <td style={{ fontWeight: 700, color: 'var(--cp-gold)' }}>{e.name}</td>
                      <td><span className="cp-badge cp-badge-purple">{e.category}</span></td>
                      <td className="text-gold">₹{(e.cost || 0).toLocaleString()}</td>
                      <td><span className="cp-badge cp-badge-green">{e.productionValue}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </SectionCard>

          {/* Algorithm Steps */}
          <SectionCard title="Algorithm Steps" icon="🔍">
            <AlgoSteps steps={result.steps} />
          </SectionCard>

          {/* DP Table */}
          {dpDisplay && dpDisplay.length > 0 && (
            <SectionCard
              title="DP Table (dp[item][budget])"
              icon="📊"
              action={
                <button className="btn-cp-secondary" onClick={() => setShowDPTable(v => !v)}>
                  {showDPTable ? 'Hide Table' : 'Show Table'}
                </button>
              }
            >
              {showDPTable ? (
                <div className="dp-table-wrapper">
                  <p style={{ fontSize: '0.75rem', color: 'var(--cp-text-muted)', marginBottom: 10 }}>
                    Rows = items (0 = no items). Columns = budget capacity. Values = max achievable production value.
                    {dpDisplay[0].length > 51 && ' Table shown truncated to first 50 budget columns for display.'}
                  </p>
                  <table className="dp-table">
                    <thead>
                      <tr>
                        <th>Item ↓ / Cap →</th>
                        {dpDisplay[0].slice(0, 51).map((_, w) => <th key={w}>{w}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {dpDisplay.map((row, i) => (
                        <tr key={i}>
                          <th>{i === 0 ? '∅' : equipment[i-1]?.name?.slice(0,8) || i}</th>
                          {row.slice(0, 51).map((v, w) => (
                            <td key={w} className={v > 0 && (i > 0 && v !== dpDisplay[i-1]?.[w]) ? 'dp-highlight' : ''}>
                              {v}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p style={{ color: 'var(--cp-text-muted)', fontSize: '0.85rem' }}>Click "Show Table" to see the full DP table ({dpDisplay.length} × {dpDisplay[0]?.length} cells).</p>
              )}
            </SectionCard>
          )}

          {/* Complexity */}
          <SectionCard title="Complexity Analysis" icon="📐">
            <ComplexityBox complexity={result.complexity} />
          </SectionCard>
        </>
      )}
    </div>
  );
}
