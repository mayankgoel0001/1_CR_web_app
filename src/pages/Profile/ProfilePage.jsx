import { useState } from 'react';
import { userData, formatCurrency } from '../../data/mockData';
import Modal from '../../components/common/Modal';
import './ProfilePage.css';

const RELATIONSHIPS = ['Father', 'Mother', 'Spouse', 'Child', 'Brother', 'Sister', 'Grandfather', 'Grandmother', 'Other'];

const EMPTY_MEMBER = { name: '', relationship: 'Father', age: '', dependent: false };

export default function ProfilePage() {
    const [isEditing, setIsEditing] = useState(false);
    const [form, setForm] = useState({
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        phone: userData.phone,
        dob: userData.dob,
        occupation: userData.occupation,
        panCard: userData.panCard,
        location: userData.location,
        relationshipStatus: userData.relationshipStatus,
        monthlyIncome: userData.monthlyIncome,
        monthlyExpenses: userData.monthlyExpenses,
        monthlySavings: userData.monthlySavings,
    });
    const [saved, setSaved] = useState({ ...form });
    const [family, setFamily] = useState(userData.familyMembers.map(m => ({ ...m })));
    const [memberModal, setMemberModal] = useState(null); // null | { mode: 'add'|'edit', draft: {...} }

    const openAddModal = () => setMemberModal({ mode: 'add', draft: { ...EMPTY_MEMBER } });
    const openEditModal = (member) => setMemberModal({ mode: 'edit', draft: { ...member } });
    const closeModal = () => setMemberModal(null);
    const setDraft = (patch) => setMemberModal(m => ({ ...m, draft: { ...m.draft, ...patch } }));

    const submitModal = () => {
        const { mode, draft } = memberModal;
        if (!draft.name.trim() || !draft.age) return;
        if (mode === 'add') {
            setFamily(f => [...f, { ...draft, age: Number(draft.age), id: Date.now() }]);
        } else {
            setFamily(f => f.map(m => m.id === draft.id ? { ...draft, age: Number(draft.age) } : m));
        }
        closeModal();
    };
    const deleteMember = (id) => setFamily(f => f.filter(m => m.id !== id));

    const [finModal, setFinModal] = useState(false);
    const [finDraft, setFinDraft] = useState({ monthlyIncome: saved.monthlyIncome, monthlyExpenses: saved.monthlyExpenses, monthlySavings: saved.monthlySavings });
    const openFinModal = () => { setFinDraft({ monthlyIncome: saved.monthlyIncome, monthlyExpenses: saved.monthlyExpenses, monthlySavings: saved.monthlySavings }); setFinModal(true); };
    const saveFinModal = () => { setSaved(s => ({ ...s, ...finDraft })); setForm(f => ({ ...f, ...finDraft })); setFinModal(false); };

    const field = (key, label, type = 'text') => (
        <div className="profile-field">
            <label>{label}</label>
            {isEditing
                ? <input className="profile-edit-input" type={type} value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: type === 'number' ? Number(e.target.value) : e.target.value }))} />
                : <div className="value">{type === 'number' ? formatCurrency(saved[key]) : saved[key]}</div>
            }
        </div>
    );

    const handleSave = () => { setSaved({ ...form }); setIsEditing(false); };
    const handleCancel = () => { setForm({ ...saved }); setIsEditing(false); };

    return (
        <div className="profile-page">
            <div className="profile-header-card card">
                <div className="profile-avatar-large">
                    {saved.firstName[0]}{saved.lastName[0]}
                </div>
                <div className="profile-header-info">
                    <h2>{saved.firstName} {saved.lastName}</h2>
                    <p>{saved.occupation}</p>
                    <span className="email">{saved.email}</span>
                </div>
                <div className="profile-header-actions">
                    {isEditing ? (
                        <>
                            <button className="btn-primary" onClick={handleSave}>Save Changes</button>
                            <button className="btn-outline" onClick={handleCancel}>Cancel</button>
                        </>
                    ) : (
                        <button className="btn-outline" onClick={() => setIsEditing(true)}>Edit Profile</button>
                    )}
                </div>
            </div>

            <div className="profile-section card">
                <h3>Personal Information</h3>
                <div className="profile-grid">
                    <div className="profile-field">
                        <label>Full Name</label>
                        {isEditing ? (
                            <div className="profile-name-row">
                                <input className="profile-edit-input" type="text" value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} placeholder="First" />
                                <input className="profile-edit-input" type="text" value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} placeholder="Last" />
                            </div>
                        ) : (
                            <div className="value">{saved.firstName} {saved.lastName}</div>
                        )}
                    </div>
                    {field('email', 'Email Address')}
                    {field('phone', 'Phone Number')}
                    <div className="profile-field">
                        <label>Date of Birth</label>
                        {isEditing
                            ? <input className="profile-edit-input" type="date" value={form.dob} onChange={e => setForm(f => ({ ...f, dob: e.target.value }))} />
                            : <div className="value">{new Date(saved.dob).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                        }
                    </div>
                    {field('occupation', 'Occupation')}
                    {field('panCard', 'PAN Card')}
                    {field('location', 'Location')}
                    <div className="profile-field"><label>Aadhaar Number</label><div className="value">{userData.aadhaar}</div></div>
                    {field('relationshipStatus', 'Relationship Status')}
                </div>
            </div>

            <div className="profile-section card">
                <div className="family-section-header">
                    <h3>Family Members</h3>
                    <button className="btn-outline family-add-btn" onClick={openAddModal}>+ Add Member</button>
                </div>
                <div className="family-grid">
                    {family.map(member => (
                        <div key={member.id} className="family-card">
                            <div className="family-card-top">
                                <h5>{member.name}</h5>
                                <div className="family-card-btns">
                                    <button className="family-icon-btn" title="Edit" onClick={() => openEditModal(member)}>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                                    </button>
                                    <button className="family-icon-btn family-icon-btn-del" title="Delete" onClick={() => deleteMember(member.id)}>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                                    </button>
                                </div>
                            </div>
                            <p>{member.relationship} • Age {member.age}</p>
                            {member.dependent && <span className="dependent-tag">Financially Dependent</span>}
                        </div>
                    ))}
                </div>
            </div>

            {memberModal && (
                <Modal
                    isOpen
                    onClose={closeModal}
                    title={memberModal.mode === 'add' ? 'Add Family Member' : 'Edit Family Member'}
                >
                    <div className="family-modal-body">
                        <div className="family-modal-field">
                            <label>Full Name</label>
                            <input className="profile-edit-input" placeholder="Full Name" value={memberModal.draft.name} onChange={e => setDraft({ name: e.target.value })} />
                        </div>
                        <div className="family-modal-field">
                            <label>Relationship</label>
                            <select className="profile-edit-input family-select" value={memberModal.draft.relationship} onChange={e => setDraft({ relationship: e.target.value })}>
                                {RELATIONSHIPS.map(r => <option key={r}>{r}</option>)}
                            </select>
                        </div>
                        <div className="family-modal-field">
                            <label>Age</label>
                            <input className="profile-edit-input" placeholder="Age" type="number" min="0" max="120" value={memberModal.draft.age} onChange={e => setDraft({ age: e.target.value })} />
                        </div>
                        <label className="family-dependent-label">
                            <input type="checkbox" checked={memberModal.draft.dependent} onChange={e => setDraft({ dependent: e.target.checked })} />
                            Financially Dependent
                        </label>
                        <div className="family-modal-actions">
                            <button className="btn-primary" onClick={submitModal}>
                                {memberModal.mode === 'add' ? 'Add Member' : 'Save Changes'}
                            </button>
                            <button className="btn-outline" onClick={closeModal}>Cancel</button>
                        </div>
                    </div>
                </Modal>
            )}

            <div className="profile-section card">
                <div className="family-section-header">
                    <h3>Financial Overview</h3>
                    <button className="btn-outline family-add-btn" onClick={openFinModal}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        Edit
                    </button>
                </div>
                <div className="financial-overview">
                    <div className="fin-stat">
                        <label>Monthly Income</label>
                        <div className="value">{formatCurrency(saved.monthlyIncome)}</div>
                    </div>
                    <div className="fin-stat">
                        <label>Monthly Expenses</label>
                        <div className="value" style={{ color: '#EF4444' }}>{formatCurrency(saved.monthlyExpenses)}</div>
                    </div>
                    <div className="fin-stat">
                        <label>Monthly Savings</label>
                        <div className="value" style={{ color: '#16A34A' }}>{formatCurrency(saved.monthlySavings)}</div>
                    </div>
                </div>
            </div>

            <Modal isOpen={finModal} onClose={() => setFinModal(false)} title="Edit Financial Overview">
                <div className="family-modal-body">
                    <div className="family-modal-field">
                        <label>Monthly Income (₹)</label>
                        <input className="profile-edit-input" type="number" value={finDraft.monthlyIncome} onChange={e => setFinDraft(d => ({ ...d, monthlyIncome: Number(e.target.value) }))} />
                    </div>
                    <div className="family-modal-field">
                        <label>Monthly Expenses (₹)</label>
                        <input className="profile-edit-input" type="number" value={finDraft.monthlyExpenses} onChange={e => setFinDraft(d => ({ ...d, monthlyExpenses: Number(e.target.value) }))} />
                    </div>
                    <div className="family-modal-field">
                        <label>Monthly Savings (₹)</label>
                        <input className="profile-edit-input" type="number" value={finDraft.monthlySavings} onChange={e => setFinDraft(d => ({ ...d, monthlySavings: Number(e.target.value) }))} />
                    </div>
                    <div className="family-modal-actions">
                        <button className="btn-primary" onClick={saveFinModal}>Save Changes</button>
                        <button className="btn-outline" onClick={() => setFinModal(false)}>Cancel</button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
