import React, { useEffect, useState } from 'react';
import { getLocations, createLocation, updateLocation, deleteLocation, addConnection } from '../services/api.js';
import { Modal, Alert, Spinner, EmptyState } from '../components/shared.jsx';

export default function Locations() {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');

  // Create/edit location modal
  const [showLocModal, setShowLocModal] = useState(false);
  const [editLoc, setEditLoc]   = useState(null);
  const [locForm, setLocForm]   = useState({ name: '', description: '' });
  const [saving, setSaving]     = useState(false);
  const [formError, setFormError] = useState('');

  // Add connection modal
  const [showConnModal, setShowConnModal] = useState(false);
  const [connFrom, setConnFrom] = useState(null);
  const [connForm, setConnForm] = useState({ to: '', distance: '' });
  const [connError, setConnError] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const res = await getLocations();
      setLocations(res.data || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditLoc(null); setLocForm({ name: '', description: '' }); setFormError(''); setShowLocModal(true); };
  const openEdit   = loc => { setEditLoc(loc); setLocForm({ name: loc.name, description: loc.description || '' }); setFormError(''); setShowLocModal(true); };
  const closeLocModal = () => { setShowLocModal(false); setFormError(''); };

  const handleSaveLoc = async () => {
    if (!locForm.name.trim()) return setFormError('Location name is required.');
    setSaving(true);
    try {
      if (editLoc) {
        await updateLocation(editLoc._id, locForm);
      } else {
        await createLocation(locForm);
      }
      closeLocModal();
      load();
    } catch (e) {
      setFormError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteLoc = async (id) => {
    if (!window.confirm('Delete this location? This will also remove its connections.')) return;
    try { await deleteLocation(id); load(); } catch (e) { setError(e.message); }
  };

  const openConnModal = (loc) => {
    setConnFrom(loc);
    setConnForm({ to: '', distance: '' });
    setConnError('');
    setShowConnModal(true);
  };

  const handleAddConn = async () => {
    if (!connForm.to)   return setConnError('Select a target location.');
    if (!connForm.distance || Number(connForm.distance) <= 0) return setConnError('Distance must be positive.');
    try {
      await addConnection(connFrom._id, { to: connForm.to, distance: Number(connForm.distance) });
      setShowConnModal(false);
      load();
    } catch (e) {
      setConnError(e.message);
    }
  };

  return (
    <div>
      <div className="d-flex justify-between align-center mb-4">
        <div>
          <h2 className="section-title">Locations</h2>
          <p className="section-sub">Manage shooting locations and build the graph for Dijkstra's route planning.</p>
        </div>
        <button className="btn-cp-primary" onClick={openCreate}>+ Add Location</button>
      </div>

      {error && <Alert type="error">❌ {error}</Alert>}

      <div className="cp-alert cp-alert-info mb-3">
        ℹ️ Add locations and connect them with distances to build the weighted graph used by Dijkstra's algorithm.
      </div>

      {loading ? <Spinner /> : (
        <div className="cp-card">
          {locations.length === 0 ? (
            <EmptyState icon="📍" message="No locations yet. Add locations and connect them for route planning." />
          ) : (
            <table className="cp-table">
              <thead>
                <tr>
                  <th>Name</th><th>Description</th><th>Connections</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {locations.map(loc => (
                  <tr key={loc._id}>
                    <td style={{ fontWeight: 600 }}>{loc.name}</td>
                    <td style={{ color: 'var(--cp-text-muted)' }}>{loc.description || '—'}</td>
                    <td>
                      {loc.connections && loc.connections.length > 0 ? (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                          {loc.connections.map((c, i) => (
                            <span key={i} className="cp-badge cp-badge-blue">
                              {c.to?.name || '?'} ({c.distance} km)
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span style={{ color: 'var(--cp-text-muted)', fontSize: '0.8rem' }}>No connections</span>
                      )}
                    </td>
                    <td>
                      <div className="d-flex gap-8">
                        <button className="btn-cp-edit"   onClick={() => openEdit(loc)}>✏️ Edit</button>
                        <button className="btn-cp-secondary" onClick={() => openConnModal(loc)} style={{ fontSize: '0.8rem', padding: '6px 12px' }}>🔗 Connect</button>
                        <button className="btn-cp-danger" onClick={() => handleDeleteLoc(loc._id)}>🗑 Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Location modal */}
      <Modal
        show={showLocModal}
        onClose={closeLocModal}
        title={editLoc ? 'Edit Location' : 'Add Location'}
        footer={
          <>
            <button className="btn-cp-secondary" onClick={closeLocModal}>Cancel</button>
            <button className="btn-cp-primary"   onClick={handleSaveLoc} disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
          </>
        }
      >
        {formError && <Alert type="error">❌ {formError}</Alert>}
        <div className="cp-form-group">
          <label className="cp-label">Location Name *</label>
          <input type="text" className="cp-input" value={locForm.name} placeholder="e.g. Studio A" onChange={e => setLocForm({ ...locForm, name: e.target.value })} />
        </div>
        <div className="cp-form-group">
          <label className="cp-label">Description</label>
          <input type="text" className="cp-input" value={locForm.description} placeholder="Optional notes" onChange={e => setLocForm({ ...locForm, description: e.target.value })} />
        </div>
      </Modal>

      {/* Connection modal */}
      <Modal
        show={showConnModal}
        onClose={() => setShowConnModal(false)}
        title={`Connect "${connFrom?.name}" to another location`}
        footer={
          <>
            <button className="btn-cp-secondary" onClick={() => setShowConnModal(false)}>Cancel</button>
            <button className="btn-cp-primary"   onClick={handleAddConn}>Add Connection</button>
          </>
        }
      >
        {connError && <Alert type="error">❌ {connError}</Alert>}
        <div className="cp-form-group">
          <label className="cp-label">Target Location *</label>
          <select className="cp-input cp-select" value={connForm.to} onChange={e => setConnForm({ ...connForm, to: e.target.value })}>
            <option value="">— Select location —</option>
            {locations.filter(l => l._id !== connFrom?._id).map(l => (
              <option key={l._id} value={l._id}>{l.name}</option>
            ))}
          </select>
        </div>
        <div className="cp-form-group">
          <label className="cp-label">Distance (km) *</label>
          <input type="number" className="cp-input" value={connForm.distance} placeholder="e.g. 5" min="0.1" step="0.1"
            onChange={e => setConnForm({ ...connForm, distance: e.target.value })} />
        </div>
      </Modal>
    </div>
  );
}
