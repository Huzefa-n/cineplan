import React, { useEffect, useState } from 'react';
import { getScenes, createScene, updateScene, deleteScene } from '../services/api.js';
import { Modal, Alert, Spinner, EmptyState } from '../components/shared.jsx';

const EMPTY = { name: '', description: '', location: '', actors: '', deadline: '', priority: '', duration: '1', status: 'pending' };

export default function Scenes() {
  const [scenes, setScenes]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing]   = useState(null);
  const [form, setForm]         = useState(EMPTY);
  const [saving, setSaving]     = useState(false);
  const [formError, setFormError] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const res = await getScenes();
      setScenes(res.data || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); setForm(EMPTY); setFormError(''); setShowModal(true); };
  const openEdit   = s => {
    setEditing(s);
    setForm({ ...s, actors: Array.isArray(s.actors) ? s.actors.join(', ') : s.actors || '' });
    setFormError('');
    setShowModal(true);
  };
  const closeModal = () => { setShowModal(false); setFormError(''); };

  const handleSave = async () => {
    if (!form.name.trim())     return setFormError('Scene name is required.');
    if (!form.deadline || Number(form.deadline) < 1) return setFormError('Deadline must be at least 1.');
    if (!form.priority || Number(form.priority) < 1) return setFormError('Priority must be at least 1.');
    setSaving(true);
    try {
      const payload = {
        ...form,
        deadline: Number(form.deadline),
        priority: Number(form.priority),
        duration: Number(form.duration) || 1,
        actors: form.actors ? form.actors.split(',').map(a => a.trim()).filter(Boolean) : [],
      };
      if (editing) {
        await updateScene(editing._id, payload);
      } else {
        await createScene(payload);
      }
      closeModal();
      load();
    } catch (e) {
      setFormError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this scene?')) return;
    try { await deleteScene(id); load(); } catch (e) { setError(e.message); }
  };

  const statusColor = { pending: 'gray', scheduled: 'green', completed: 'blue', cancelled: 'red' };

  return (
    <div>
      <div className="d-flex justify-between align-center mb-4">
        <div>
          <h2 className="section-title">Scenes</h2>
          <p className="section-sub">Manage film scenes with deadlines and priorities for Job Sequencing.</p>
        </div>
        <button className="btn-cp-primary" onClick={openCreate}>+ New Scene</button>
      </div>

      {error && <Alert type="error">❌ {error}</Alert>}

      <div className="cp-alert cp-alert-info mb-3">
        ℹ️ <strong>Deadline</strong> = latest time slot by which this scene must be filmed. <strong>Priority</strong> = profit/importance value for Job Sequencing algorithm.
      </div>

      {loading ? <Spinner /> : (
        <div className="cp-card">
          {scenes.length === 0 ? (
            <EmptyState icon="🎭" message="No scenes yet. Add scenes to run the Job Sequencing algorithm." />
          ) : (
            <table className="cp-table">
              <thead>
                <tr>
                  <th>Name</th><th>Location</th><th>Actors</th>
                  <th>Deadline (Slot)</th><th>Priority</th><th>Duration (h)</th><th>Status</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {scenes.map(s => (
                  <tr key={s._id}>
                    <td style={{ fontWeight: 600 }}>{s.name}</td>
                    <td style={{ color: 'var(--cp-text-muted)' }}>{s.location || '—'}</td>
                    <td style={{ color: 'var(--cp-text-muted)', fontSize: '0.8rem' }}>
                      {Array.isArray(s.actors) && s.actors.length > 0 ? s.actors.join(', ') : '—'}
                    </td>
                    <td><span className="cp-badge cp-badge-blue">Slot {s.deadline}</span></td>
                    <td><span className="cp-badge cp-badge-gold">{s.priority}</span></td>
                    <td>{s.duration}h</td>
                    <td><span className={`cp-badge cp-badge-${statusColor[s.status] || 'gray'}`}>{s.status}</span></td>
                    <td>
                      <div className="d-flex gap-8">
                        <button className="btn-cp-edit"   onClick={() => openEdit(s)}>✏️ Edit</button>
                        <button className="btn-cp-danger" onClick={() => handleDelete(s._id)}>🗑 Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      <Modal
        show={showModal}
        onClose={closeModal}
        title={editing ? 'Edit Scene' : 'New Scene'}
        footer={
          <>
            <button className="btn-cp-secondary" onClick={closeModal}>Cancel</button>
            <button className="btn-cp-primary"   onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
          </>
        }
      >
        {formError && <Alert type="error">❌ {formError}</Alert>}
        {[
          { label: 'Scene Name *',   key: 'name',        type: 'text',   placeholder: 'e.g. Chase Scene' },
          { label: 'Description',    key: 'description', type: 'text',   placeholder: 'Brief description' },
          { label: 'Location',       key: 'location',    type: 'text',   placeholder: 'e.g. Studio A' },
          { label: 'Actors (comma-separated)', key: 'actors', type: 'text', placeholder: 'Actor A, Actor B' },
          { label: 'Deadline (Slot #) *', key: 'deadline', type: 'number', placeholder: '3' },
          { label: 'Priority (Profit) *', key: 'priority', type: 'number', placeholder: '80' },
          { label: 'Duration (hours)',    key: 'duration',  type: 'number', placeholder: '1' },
        ].map(f => (
          <div className="cp-form-group" key={f.key}>
            <label className="cp-label">{f.label}</label>
            <input
              type={f.type}
              className="cp-input"
              value={form[f.key]}
              placeholder={f.placeholder}
              min={f.type === 'number' ? 0 : undefined}
              onChange={e => setForm({ ...form, [f.key]: e.target.value })}
            />
          </div>
        ))}
        <div className="cp-form-group">
          <label className="cp-label">Status</label>
          <select className="cp-input cp-select" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
            {['pending','scheduled','completed','cancelled'].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </Modal>
    </div>
  );
}
