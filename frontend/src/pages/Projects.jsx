import React, { useEffect, useState } from 'react';
import { getProjects, createProject, updateProject, deleteProject } from '../services/api.js';
import { Modal, Alert, Spinner, EmptyState } from '../components/shared.jsx';

const EMPTY = { name: '', description: '', budget: '', startDate: '', endDate: '', status: 'planning' };

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const res = await getProjects();
      setProjects(res.data || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); setForm(EMPTY); setFormError(''); setShowModal(true); };
  const openEdit = p => { setEditing(p); setForm({ ...p, budget: p.budget ?? '', startDate: p.startDate?.slice(0, 10) || '', endDate: p.endDate?.slice(0, 10) || '' }); setFormError(''); setShowModal(true); };
  const closeModal = () => { setShowModal(false); setFormError(''); };

  const handleSave = async () => {
    if (!form.name.trim()) return setFormError('Project name is required.');
    if (!form.budget && form.budget !== 0) return setFormError('Budget is required.');
    if (Number(form.budget) < 0) return setFormError('Budget cannot be negative.');
    setSaving(true);
    try {
      const payload = { ...form, budget: Number(form.budget) };
      if (editing) {
        await updateProject(editing._id, payload);
      } else {
        await createProject(payload);
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
    if (!window.confirm('Delete this project?')) return;
    try {
      await deleteProject(id);
      load();
    } catch (e) {
      setError(e.message);
    }
  };

  const statusColor = { planning: 'gray', active: 'green', completed: 'blue', 'on-hold': 'red' };

  return (
    <div>
      <div className="d-flex justify-between align-center mb-4">
        <div>
          <h2 className="section-title">Projects</h2>
          <p className="section-sub">Manage your film production projects.</p>
        </div>
        <button className="btn-cp-primary" onClick={openCreate}>+ New Project</button>
      </div>

      {error && <Alert type="error">❌ {error}</Alert>}
      {loading ? <Spinner /> : (
        <div className="cp-card">
          {projects.length === 0 ? (
            <EmptyState icon="🎬" message="No projects yet. Create your first film project!" />
          ) : (
            <table className="cp-table">
              <thead>
                <tr>
                  <th>Name</th><th>Description</th><th>Budget</th>
                  <th>Start Date</th><th>End Date</th><th>Status</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {projects.map(p => (
                  <tr key={p._id}>
                    <td style={{ fontWeight: 600 }}>{p.name}</td>
                    <td style={{ color: 'var(--cp-text-muted)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.description || '—'}</td>
                    <td className="text-gold fw-bold">₹{(p.budget || 0).toLocaleString()}</td>
                    <td>{p.startDate ? new Date(p.startDate).toLocaleDateString() : '—'}</td>
                    <td>{p.endDate ? new Date(p.endDate).toLocaleDateString() : '—'}</td>
                    <td><span className={`cp-badge cp-badge-${statusColor[p.status] || 'gray'}`}>{p.status}</span></td>
                    <td>
                      <div className="d-flex gap-8">
                        <button className="btn-cp-edit" onClick={() => openEdit(p)}>✏️ Edit</button>
                        <button className="btn-cp-danger" onClick={() => handleDelete(p._id)}>🗑 Delete</button>
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
        title={editing ? 'Edit Project' : 'New Project'}
        footer={
          <>
            <button className="btn-cp-secondary" onClick={closeModal}>Cancel</button>
            <button className="btn-cp-primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
          </>
        }
      >
        {formError && <Alert type="error">❌ {formError}</Alert>}
        {[
          { label: 'Project Name *', key: 'name', type: 'text', placeholder: 'e.g. The Great Escape' },
          { label: 'Description', key: 'description', type: 'text', placeholder: 'Brief description' },
          { label: 'Budget (₹) *', key: 'budget', type: 'number', placeholder: '100000' },
          { label: 'Start Date', key: 'startDate', type: 'date' },
          { label: 'End Date', key: 'endDate', type: 'date' },
        ].map(f => (
          <div className="cp-form-group" key={f.key}>
            <label className="cp-label">{f.label}</label>
            <input
              type={f.type}
              className="cp-input"
              value={form[f.key]}
              placeholder={f.placeholder}
              onChange={e => setForm({ ...form, [f.key]: e.target.value })}
            />
          </div>
        ))}
        <div className="cp-form-group">
          <label className="cp-label">Status</label>
          <select className="cp-input cp-select" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
            {['planning', 'active', 'completed', 'on-hold'].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </Modal>
    </div>
  );
}
