import React, { useEffect, useState } from 'react';
import { getEquipment, createEquipment, updateEquipment, deleteEquipment } from '../services/api.js';
import { Modal, Alert, Spinner, EmptyState } from '../components/shared.jsx';

const EMPTY = { name: '', category: 'Camera', cost: '', productionValue: '', quantity: '1', availability: true, description: '' };
const CATEGORIES = ['Camera', 'Lens', 'Lighting', 'Audio', 'Grip', 'Editing', 'Transport', 'Other'];

export default function EquipmentPage() {
  const [items, setItems]       = useState([]);
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
      const res = await getEquipment();
      setItems(res.data || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); setForm(EMPTY); setFormError(''); setShowModal(true); };
  const openEdit   = item => {
    setEditing(item);
    setForm({ ...item, cost: item.cost ?? '', productionValue: item.productionValue ?? '', quantity: item.quantity ?? 1 });
    setFormError('');
    setShowModal(true);
  };
  const closeModal = () => { setShowModal(false); setFormError(''); };

  const handleSave = async () => {
    if (!form.name.trim())     return setFormError('Equipment name is required.');
    if (form.cost === '' || Number(form.cost) < 0) return setFormError('Cost must be a non-negative number.');
    if (form.productionValue === '' || Number(form.productionValue) < 0) return setFormError('Production value must be a non-negative number.');
    setSaving(true);
    try {
      const payload = { ...form, cost: Number(form.cost), productionValue: Number(form.productionValue), quantity: Number(form.quantity) || 1 };
      if (editing) {
        await updateEquipment(editing._id, payload);
      } else {
        await createEquipment(payload);
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
    if (!window.confirm('Delete this equipment?')) return;
    try { await deleteEquipment(id); load(); } catch (e) { setError(e.message); }
  };

  return (
    <div>
      <div className="d-flex justify-between align-center mb-4">
        <div>
          <h2 className="section-title">Equipment</h2>
          <p className="section-sub">Manage film equipment — cost and production value used by the Knapsack algorithm.</p>
        </div>
        <button className="btn-cp-primary" onClick={openCreate}>+ Add Equipment</button>
      </div>

      {error && <Alert type="error">❌ {error}</Alert>}

      <div className="cp-alert cp-alert-info mb-3">
        ℹ️ <strong>Cost</strong> = equipment budget (knapsack weight). <strong>Production Value</strong> = creative/quality contribution (knapsack value).
      </div>

      {loading ? <Spinner /> : (
        <div className="cp-card">
          {items.length === 0 ? (
            <EmptyState icon="🎥" message="No equipment yet. Add equipment to run the Knapsack algorithm." />
          ) : (
            <table className="cp-table">
              <thead>
                <tr>
                  <th>Name</th><th>Category</th><th>Cost (₹)</th>
                  <th>Production Value</th><th>Qty</th><th>Available</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map(item => (
                  <tr key={item._id}>
                    <td style={{ fontWeight: 600 }}>{item.name}</td>
                    <td><span className="cp-badge cp-badge-purple">{item.category}</span></td>
                    <td className="text-gold fw-bold">₹{(item.cost || 0).toLocaleString()}</td>
                    <td><span className="cp-badge cp-badge-blue">{item.productionValue}</span></td>
                    <td>{item.quantity}</td>
                    <td>
                      <span className={`cp-badge cp-badge-${item.availability ? 'green' : 'red'}`}>
                        {item.availability ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td>
                      <div className="d-flex gap-8">
                        <button className="btn-cp-edit"   onClick={() => openEdit(item)}>✏️ Edit</button>
                        <button className="btn-cp-danger" onClick={() => handleDelete(item._id)}>🗑 Delete</button>
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
        title={editing ? 'Edit Equipment' : 'Add Equipment'}
        footer={
          <>
            <button className="btn-cp-secondary" onClick={closeModal}>Cancel</button>
            <button className="btn-cp-primary"   onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
          </>
        }
      >
        {formError && <Alert type="error">❌ {formError}</Alert>}
        <div className="cp-form-group">
          <label className="cp-label">Equipment Name *</label>
          <input type="text" className="cp-input" value={form.name} placeholder="e.g. RED Cinema Camera" onChange={e => setForm({ ...form, name: e.target.value })} />
        </div>
        <div className="cp-form-group">
          <label className="cp-label">Category</label>
          <select className="cp-input cp-select" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="row g-3">
          <div className="col-6">
            <div className="cp-form-group">
              <label className="cp-label">Cost (₹) *</label>
              <input type="number" className="cp-input" value={form.cost} placeholder="60000" min="0" onChange={e => setForm({ ...form, cost: e.target.value })} />
            </div>
          </div>
          <div className="col-6">
            <div className="cp-form-group">
              <label className="cp-label">Production Value *</label>
              <input type="number" className="cp-input" value={form.productionValue} placeholder="90" min="0" onChange={e => setForm({ ...form, productionValue: e.target.value })} />
            </div>
          </div>
        </div>
        <div className="row g-3">
          <div className="col-6">
            <div className="cp-form-group">
              <label className="cp-label">Quantity</label>
              <input type="number" className="cp-input" value={form.quantity} min="0" onChange={e => setForm({ ...form, quantity: e.target.value })} />
            </div>
          </div>
          <div className="col-6">
            <div className="cp-form-group">
              <label className="cp-label">Available</label>
              <select className="cp-input cp-select" value={form.availability} onChange={e => setForm({ ...form, availability: e.target.value === 'true' })}>
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </div>
          </div>
        </div>
        <div className="cp-form-group">
          <label className="cp-label">Description</label>
          <input type="text" className="cp-input" value={form.description} placeholder="Optional details" onChange={e => setForm({ ...form, description: e.target.value })} />
        </div>
      </Modal>
    </div>
  );
}
