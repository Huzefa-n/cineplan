import React, { useState } from 'react';
import { runKnapsack, runJobScheduling, runDijkstra } from '../services/api.js';
import { Alert, Spinner, SectionCard } from '../components/shared.jsx';

const ALGO_META = [
  {
    id: 'knapsack',
    name: '0/1 Knapsack',
    problem: 'Select equipment items with maximum production value within a production budget.',
    timeComplexity:  'O(n × W)',
    spaceComplexity: 'O(n × W)',
    approach: 'Dynamic Programming (Bottom-up DP table)',
    icon: '⚙️',
  },
  {
    id: 'jobseq',
    name: 'Job Sequencing with Deadlines',
    problem: 'Schedule film scenes/jobs into time slots to maximise total priority (profit).',
    timeComplexity:  'O(n²)',
    spaceComplexity: 'O(n)',
    approach: 'Greedy — sort by profit, place in latest free slot before deadline',
    icon: '📅',
  },
  {
    id: 'dijkstra',
    name: "Dijkstra's Shortest Path",
    problem: 'Find the minimum-distance route between shooting locations in a weighted graph.',
    timeComplexity:  'O(V² + E)',
    spaceComplexity: 'O(V)',
    approach: 'Simple array-based Dijkstra (no external heap library)',
    icon: '🗺️',
  },
];

export default function Analytics() {
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState({});
  const [errors,  setErrors]  = useState({});

  const runAll = async () => {
    setResults({});
    setErrors({});

    // Knapsack
    setLoading(l => ({ ...l, knapsack: true }));
    try {
      const r = await runKnapsack({ budget: 100000 });
      setResults(rs => ({ ...rs, knapsack: r.data }));
    } catch (e) {
      setErrors(er => ({ ...er, knapsack: e.message }));
    } finally {
      setLoading(l => ({ ...l, knapsack: false }));
    }

    // Job Sequencing
    setLoading(l => ({ ...l, jobseq: true }));
    try {
      const r = await runJobScheduling({});
      setResults(rs => ({ ...rs, jobseq: r.data }));
    } catch (e) {
      setErrors(er => ({ ...er, jobseq: e.message }));
    } finally {
      setLoading(l => ({ ...l, jobseq: false }));
    }
  };

  return (
    <div>
      <h2 className="section-title">Analytics</h2>
      <p className="section-sub">Complexity analysis and run statistics for all three DAA algorithms.</p>

      <div className="mb-4">
        <button className="btn-cp-run" onClick={runAll}>▶ Run All Algorithms (Sample)</button>
        <span style={{ fontSize: '0.8rem', color: 'var(--cp-text-muted)', marginLeft: 16 }}>
          Runs Knapsack and Job Sequencing against your current database. Add data first for meaningful results.
        </span>
      </div>

      {/* Complexity comparison table */}
      <SectionCard title="Algorithm Complexity Comparison" icon="📊">
        <table className="cp-table">
          <thead>
            <tr>
              <th>Algorithm</th>
              <th>Problem</th>
              <th>Approach</th>
              <th>Time Complexity</th>
              <th>Space Complexity</th>
            </tr>
          </thead>
          <tbody>
            {ALGO_META.map(a => (
              <tr key={a.id}>
                <td>
                  <span style={{ marginRight: 8 }}>{a.icon}</span>
                  <strong>{a.name}</strong>
                </td>
                <td style={{ color: 'var(--cp-text-muted)', fontSize: '0.82rem', maxWidth: 220 }}>{a.problem}</td>
                <td style={{ color: 'var(--cp-text-muted)', fontSize: '0.82rem' }}>{a.approach}</td>
                <td><span className="cp-badge cp-badge-gold mono">{a.timeComplexity}</span></td>
                <td><span className="cp-badge cp-badge-blue mono">{a.spaceComplexity}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </SectionCard>

      {/* Individual results */}
      <div className="row g-3">
        {ALGO_META.map(a => (
          <div key={a.id} className="col-lg-4">
            <div className="cp-card h-100">
              <div className="cp-card-header">
                <h3 className="cp-card-title">{a.icon} {a.name}</h3>
              </div>
              <div className="cp-card-body">
                {errors[a.id] && <Alert type="error" >❌ {errors[a.id]}</Alert>}
                {loading[a.id] && <Spinner />}
                {results[a.id] && (
                  <>
                    {/* Knapsack result */}
                    {a.id === 'knapsack' && (
                      <table className="cp-table">
                        <tbody>
                          <tr><td>Problem</td><td>Equipment Selection</td></tr>
                          <tr><td>Input Size</td><td>n = {(results.knapsack.selectedItems?.length || 0) + (results.knapsack.steps?.length ? 0 : 0)} items</td></tr>
                          <tr><td>Selected Items</td><td>{results.knapsack.selectedItems?.length}</td></tr>
                          <tr><td>Total Cost</td><td>₹{results.knapsack.totalCost?.toLocaleString()}</td></tr>
                          <tr><td>Total Value</td><td>{results.knapsack.totalValue}</td></tr>
                          <tr><td>Execution Time</td><td>{results.knapsack.executionTime} ms</td></tr>
                          <tr><td>Time Complexity</td><td className="mono text-gold">{results.knapsack.complexity?.time}</td></tr>
                          <tr><td>Space Complexity</td><td className="mono text-blue">{results.knapsack.complexity?.space}</td></tr>
                        </tbody>
                      </table>
                    )}

                    {/* Job Sequencing result */}
                    {a.id === 'jobseq' && (
                      <table className="cp-table">
                        <tbody>
                          <tr><td>Problem</td><td>Scene Scheduling</td></tr>
                          <tr><td>Input Size</td><td>n = {results.jobseq.sortedJobs?.length} scenes</td></tr>
                          <tr><td>Scheduled</td><td>{results.jobseq.scheduledJobs?.length}</td></tr>
                          <tr><td>Unscheduled</td><td>{results.jobseq.unscheduledJobs?.length}</td></tr>
                          <tr><td>Total Priority</td><td>{results.jobseq.totalProfit}</td></tr>
                          <tr><td>Total Slots</td><td>{results.jobseq.totalSlots}</td></tr>
                          <tr><td>Execution Time</td><td>{results.jobseq.executionTime} ms</td></tr>
                          <tr><td>Time Complexity</td><td className="mono text-gold">{results.jobseq.complexity?.time}</td></tr>
                          <tr><td>Space Complexity</td><td className="mono text-blue">{results.jobseq.complexity?.space}</td></tr>
                        </tbody>
                      </table>
                    )}

                    {/* Dijkstra — not auto-run; point user to route planner */}
                    {a.id === 'dijkstra' && (
                      <p style={{ color: 'var(--cp-text-muted)', fontSize: '0.85rem' }}>
                        Dijkstra requires source and destination. Use the <a href="/route-planner" style={{ color: 'var(--cp-gold)' }}>Route Planner →</a> to run and see results.
                      </p>
                    )}
                  </>
                )}

                {/* Static complexity info always visible */}
                <div className="complexity-box mt-3">
                  <div className="complexity-row"><span className="complexity-key">Time</span><span className="complexity-value">{a.timeComplexity}</span></div>
                  <div className="complexity-row"><span className="complexity-key">Space</span><span className="complexity-value">{a.spaceComplexity}</span></div>
                  <div className="complexity-row"><span className="complexity-key">Approach</span><span style={{ color: 'var(--cp-text)', fontSize: '0.78rem' }}>{a.approach}</span></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
