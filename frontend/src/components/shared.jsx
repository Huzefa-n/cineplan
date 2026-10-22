import React from 'react';

// ── Modal ────────────────────────────────────────────────────
export function Modal({ show, onClose, title, children, footer }) {
  if (!show) return null;
  return (
    <div className="cp-modal-overlay" onClick={onClose}>
      <div className="cp-modal" onClick={e => e.stopPropagation()}>
        <div className="cp-modal-header">
          <h2 className="cp-modal-title">{title}</h2>
          <button className="cp-modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="cp-modal-body">{children}</div>
        {footer && <div className="cp-modal-footer">{footer}</div>}
      </div>
    </div>
  );
}

// ── Alert ────────────────────────────────────────────────────
export function Alert({ type = 'info', children }) {
  return <div className={`cp-alert cp-alert-${type}`}>{children}</div>;
}

// ── Spinner ───────────────────────────────────────────────────
export function Spinner() {
  return (
    <div style={{ textAlign: 'center', padding: '40px' }}>
      <div className="cp-spinner" />
    </div>
  );
}

// ── Empty State ───────────────────────────────────────────────
export function EmptyState({ icon = '📭', message }) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">{icon}</div>
      <p className="empty-state-text">{message}</p>
    </div>
  );
}

// ── AlgoSteps ─────────────────────────────────────────────────
export function AlgoSteps({ steps }) {
  if (!steps || steps.length === 0) return null;
  return (
    <div className="algo-steps">
      {steps.map((s, i) => (
        <div key={i} className="algo-step">
          <span className="algo-step-num">{i + 1}.</span>
          <span>{s}</span>
        </div>
      ))}
    </div>
  );
}

// ── Complexity Box ─────────────────────────────────────────────
export function ComplexityBox({ complexity }) {
  if (!complexity) return null;
  return (
    <div className="complexity-box">
      {Object.entries(complexity).map(([k, v]) => (
        <div key={k} className="complexity-row">
          <span className="complexity-key">{k}</span>
          <span className="complexity-value mono">{v}</span>
        </div>
      ))}
    </div>
  );
}

// ── Section Card ──────────────────────────────────────────────
export function SectionCard({ title, icon, children, action }) {
  return (
    <div className="cp-card mb-4">
      <div className="cp-card-header">
        <h3 className="cp-card-title">{icon && <span style={{ marginRight: 8 }}>{icon}</span>}{title}</h3>
        {action}
      </div>
      <div className="cp-card-body">{children}</div>
    </div>
  );
}
