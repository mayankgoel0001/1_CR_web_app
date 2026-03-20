import { useState } from 'react';
import { userData, formatCurrency } from '../../data/mockData';
import Modal from '../../components/common/Modal';

const RELATIONSHIPS = ['Father', 'Mother', 'Spouse', 'Child', 'Brother', 'Sister', 'Grandfather', 'Grandmother', 'Other'];
const EMPTY_MEMBER = { name: '', relationship: 'Father', age: '', dependent: false };

const inputCls = "w-full border border-[#E4EDE8] rounded-[8px] px-3 py-[10px] text-[13px] font-bold text-[#0D1F17] bg-white outline-none focus:border-[#2D7A4F] transition-all placeholder:font-normal";

export default function ProfilePage() {
    const [isEditing, setIsEditing] = useState(false);
    const [form, setForm] = useState({ firstName: userData.firstName, lastName: userData.lastName, email: userData.email, phone: userData.phone, dob: userData.dob, occupation: userData.occupation, panCard: userData.panCard, location: userData.location, relationshipStatus: userData.relationshipStatus, monthlyIncome: userData.monthlyIncome, monthlyExpenses: userData.monthlyExpenses, monthlySavings: userData.monthlySavings });
    const [saved, setSaved] = useState({ ...form });
    const [family, setFamily] = useState(userData.familyMembers.map(m => ({ ...m })));
    const [memberModal, setMemberModal] = useState(null);

    const openAddModal = () => setMemberModal({ mode: 'add', draft: { ...EMPTY_MEMBER } });
    const openEditModal = (member) => setMemberModal({ mode: 'edit', draft: { ...member } });
    const closeModal = () => setMemberModal(null);
    const setDraft = (patch) => setMemberModal(m => ({ ...m, draft: { ...m.draft, ...patch } }));

    const submitModal = () => {
        const { mode, draft } = memberModal;
        if (!draft.name.trim() || !draft.age) return;
        if (mode === 'add') setFamily(f => [...f, { ...draft, age: Number(draft.age), id: Date.now() }]);
        else setFamily(f => f.map(m => m.id === draft.id ? { ...draft, age: Number(draft.age) } : m));
        closeModal();
    };
    const deleteMember = (id) => setFamily(f => f.filter(m => m.id !== id));

    const [finModal, setFinModal] = useState(false);
    const [finDraft, setFinDraft] = useState({ monthlyIncome: saved.monthlyIncome, monthlyExpenses: saved.monthlyExpenses, monthlySavings: saved.monthlySavings });
    const openFinModal = () => { setFinDraft({ monthlyIncome: saved.monthlyIncome, monthlyExpenses: saved.monthlyExpenses, monthlySavings: saved.monthlySavings }); setFinModal(true); };
    const saveFinModal = () => { setSaved(s => ({ ...s, ...finDraft })); setForm(f => ({ ...f, ...finDraft })); setFinModal(false); };

    const field = (key, label, type = 'text') => (
        <div className="flex flex-col gap-1">
            <label className="text-[11px] font-bold text-[#8FA99C] uppercase tracking-[0.8px]">{label}</label>
            {isEditing
                ? <input className={inputCls} type={type} value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: type === 'number' ? Number(e.target.value) : e.target.value }))} />
                : <div className="text-[13px] font-bold text-[#0D1F17]">{type === 'number' ? formatCurrency(saved[key]) : saved[key]}</div>
            }
        </div>
    );

    const handleSave = () => { setSaved({ ...form }); setIsEditing(false); };
    const handleCancel = () => { setForm({ ...saved }); setIsEditing(false); };

    return (
        <div className="flex flex-col gap-5">
            {/* Header Card */}
            <div className="bg-white rounded-[14px] border border-[#F0F0F0] shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)] p-[24px] transition-shadow duration-200 hover:shadow-md flex flex-col md:flex-row items-center gap-[24px]">
                <div className="w-[72px] h-[72px] rounded-full bg-gradient-to-br from-[#2D7A4F] to-[#1a3a28] text-white text-[24px] font-bold flex items-center justify-center flex-shrink-0 shadow-sm">
                    {saved.firstName[0]}{saved.lastName[0]}
                </div>
                <div className="flex-1 text-center md:text-left">
                    <h2 className="text-[22px] font-bold text-[#0D1F17] m-0">{saved.firstName} {saved.lastName}</h2>
                    <p className="text-[12.5px] text-[#8FA99C] mt-[2px] m-0">{saved.occupation}</p>
                    <span className="text-[#2D7A4F] text-[12px] font-medium">{saved.email}</span>
                </div>
                <div className="flex flex-wrap justify-center gap-[12px]">
                    {isEditing ? (
                        <>
                            <button className="inline-flex items-center gap-[8px] px-[20px] py-[10px] bg-[#2D7A4F] text-white rounded-[6px] text-[13px] font-bold transition-all duration-200 cursor-pointer hover:bg-[#256341] hover:-translate-y-[1px] shadow-sm" onClick={handleSave}>Save Changes</button>
                            <button className="inline-flex items-center gap-[8px] px-[20px] py-[10px] bg-transparent text-[#2D7A4F] border border-[#E4EDE8] rounded-[6px] text-[13px] font-bold transition-all duration-200 cursor-pointer hover:bg-[#F0F4F1]" onClick={handleCancel}>Cancel</button>
                        </>
                    ) : (
                        <button className="inline-flex items-center gap-[8px] px-[20px] py-[10px] bg-transparent text-[#2D7A4F] border border-[#E4EDE8] rounded-[6px] text-[13px] font-bold transition-all duration-200 cursor-pointer hover:bg-[#F0F4F1]" onClick={() => setIsEditing(true)}>Edit Profile</button>
                    )}
                </div>
            </div>

            {/* Personal Info */}
            <div className="bg-white rounded-[14px] border border-[#E4EDE8] shadow-[0_1px_3px_rgba(0,0,0,0.06)] p-[24px] transition-shadow duration-200 hover:shadow-md">
                <h3 className="text-[15px] font-bold text-[#0D1F17] mb-[20px]">Personal Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-[28px] gap-x-[24px]">
                    <div className="flex flex-col gap-1">
                        <label className="text-[11px] font-bold text-[#8FA99C] uppercase tracking-[0.8px]">Full Name</label>
                        {isEditing ? (
                            <div className="flex gap-2">
                                <input className={inputCls} type="text" value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} placeholder="First" />
                                <input className={inputCls} type="text" value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} placeholder="Last" />
                            </div>
                        ) : <div className="text-[13px] font-bold text-[#0D1F17]">{saved.firstName} {saved.lastName}</div>}
                    </div>
                    {field('email', 'Email Address')}
                    {field('phone', 'Phone Number')}
                    <div className="flex flex-col gap-1">
                        <label className="text-[11px] font-bold text-[#8FA99C] uppercase tracking-[0.8px]">Date of Birth</label>
                        {isEditing
                            ? <input className={inputCls} type="date" value={form.dob} onChange={e => setForm(f => ({ ...f, dob: e.target.value }))} />
                            : <div className="text-[13px] font-bold text-[#0D1F17]">{new Date(saved.dob).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                        }
                    </div>
                    {field('occupation', 'Occupation')}
                    {field('panCard', 'PAN Card')}
                    {field('location', 'Location')}
                    <div className="flex flex-col gap-1">
                        <label className="text-[11px] font-bold text-[#8FA99C] uppercase tracking-[0.8px]">Aadhaar Number</label>
                        <div className="text-[13px] font-bold text-[#0D1F17]">{userData.aadhaar}</div>
                    </div>
                    {field('relationshipStatus', 'Relationship Status')}
                </div>
            </div>

            {/* Family Members */}
            <div className="bg-white rounded-[14px] border border-[#E4EDE8] shadow-[0_1px_3px_rgba(0,0,0,0.06)] p-[24px] transition-shadow duration-200 hover:shadow-md">
                <div className="flex justify-between items-center mb-[20px]">
                    <h3 className="text-[15px] font-bold text-[#0D1F17]">Family Members</h3>
                    <button className="inline-flex items-center gap-[8px] px-[20px] py-[10px] bg-transparent text-[#2D7A4F] border border-[#E4EDE8] rounded-[6px] text-[13px] font-bold transition-all duration-200 cursor-pointer hover:bg-[#F0F4F1]" onClick={openAddModal}>+ Add Member</button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {family.map(member => (
                        <div key={member.id} className="border border-[#E4EDE8] rounded-[10px] bg-[#F0F4F1] p-[14px] hover:border-[#2D7A4F] hover:bg-[#E8F5EE] transition-all duration-150">
                            <div className="flex justify-between items-start mb-1">
                                <h5 className="text-[13px] font-bold text-[#0D1F17]">{member.name}</h5>
                                <div className="flex gap-1">
                                    <button title="Edit" onClick={() => openEditModal(member)} className="w-7 h-7 border border-border rounded-lg bg-white text-text-secondary hover:border-primary hover:text-primary flex items-center justify-center">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                                    </button>
                                    <button title="Delete" onClick={() => deleteMember(member.id)} className="w-7 h-7 border border-[#fecaca] rounded-lg bg-[#fef2f2] text-[#dc2626] hover:bg-[#fee2e2] flex items-center justify-center">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                                    </button>
                                </div>
                            </div>
                            <p className="text-[12px] text-[#8FA99C] m-0">{member.relationship} • Age {member.age}</p>
                            {member.dependent && <span className="inline-block mt-2 text-[10px] font-bold bg-[#FEF3C7] text-[#92400E] rounded-full px-2.5 py-1 uppercase tracking-[0.4px]">Financially Dependent</span>}
                        </div>
                    ))}
                </div>
            </div>

            {/* Family member modal */}
            {memberModal && (
                <Modal isOpen onClose={closeModal} title={memberModal.mode === 'add' ? 'Add Family Member' : 'Edit Family Member'}>
                    <div className="flex flex-col gap-4">
                        {[{ label: 'Full Name', el: <input className={inputCls} placeholder="Full Name" value={memberModal.draft.name} onChange={e => setDraft({ name: e.target.value })} /> },
                          { label: 'Relationship', el: <select className={inputCls} value={memberModal.draft.relationship} onChange={e => setDraft({ relationship: e.target.value })}>{RELATIONSHIPS.map(r => <option key={r}>{r}</option>)}</select> },
                          { label: 'Age', el: <input className={inputCls} placeholder="Age" type="number" min="0" max="120" value={memberModal.draft.age} onChange={e => setDraft({ age: e.target.value })} /> },
                        ].map(f => (
                            <div key={f.label} className="flex flex-col gap-1">
                                <label className="text-[11px] font-bold text-[#8FA99C] uppercase tracking-[0.8px]">{f.label}</label>
                                {f.el}
                            </div>
                        ))}
                        <label className="flex items-center gap-2 cursor-pointer text-[12.5px] font-bold text-[#0D1F17]">
                            <input type="checkbox" checked={memberModal.draft.dependent} onChange={e => setDraft({ dependent: e.target.checked })} style={{ width: '16px', height: '16px', accentColor: '#2D7A4F' }} />
                            Financially Dependent
                        </label>
                        <div className="flex gap-3 pt-2 border-t border-[#E4EDE8]">
                            <button className="inline-flex items-center gap-[8px] px-[20px] py-[10px] bg-[#2D7A4F] text-white rounded-[6px] text-[13px] font-bold transition-all duration-200 cursor-pointer hover:bg-[#256341] hover:-translate-y-[1px] shadow-sm flex-1 justify-center" onClick={submitModal}>{memberModal.mode === 'add' ? 'Add Member' : 'Save Changes'}</button>
                            <button className="inline-flex items-center gap-[8px] px-[20px] py-[10px] bg-transparent text-[#2D7A4F] border border-[#E4EDE8] rounded-[6px] text-[13px] font-bold transition-all duration-200 cursor-pointer hover:bg-[#F0F4F1] flex-1 justify-center" onClick={closeModal}>Cancel</button>
                        </div>
                    </div>
                </Modal>
            )}

            {/* Financial Overview */}
            <div className="bg-white rounded-[14px] border border-[#E4EDE8] shadow-[0_1px_3px_rgba(0,0,0,0.06)] p-[24px] transition-shadow duration-200 hover:shadow-md">
                <div className="flex justify-between items-center mb-[20px]">
                    <h3 className="text-[15px] font-bold text-[#0D1F17]">Financial Overview</h3>
                    <button className="inline-flex items-center gap-[8px] px-[20px] py-[10px] bg-transparent text-[#2D7A4F] border border-[#E4EDE8] rounded-[6px] text-[13px] font-bold transition-all duration-200 cursor-pointer hover:bg-[#F0F4F1]" onClick={openFinModal}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        Edit
                    </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                        { label: 'Monthly Income', value: formatCurrency(saved.monthlyIncome), color: 'text-text' },
                        { label: 'Monthly Expenses', value: formatCurrency(saved.monthlyExpenses), color: 'text-[#EF4444]' },
                        { label: 'Monthly Savings', value: formatCurrency(saved.monthlySavings), color: 'text-[#16A34A]' },
                    ].map(s => (
                    <div key={s.label} className="border border-[#E4EDE8] rounded-[10px] bg-[#F0F4F1] p-4">
                        <label className="text-[11px] font-bold text-[#8FA99C] uppercase tracking-[0.8px]">{s.label}</label>
                        <div className={`text-[18px] font-bold mt-1 ${s.color === 'text-text' ? 'text-[#0D1F17]' : s.color}`}>{s.value}</div>
                    </div>
                    ))}
                </div>
            </div>

            {/* Financial Overview Modal */}
            <Modal isOpen={finModal} onClose={() => setFinModal(false)} title="Edit Financial Overview">
                <div className="flex flex-col gap-4">
                    {[
                        { label: 'Monthly Income (₹)', key: 'monthlyIncome' },
                        { label: 'Monthly Expenses (₹)', key: 'monthlyExpenses' },
                        { label: 'Monthly Savings (₹)', key: 'monthlySavings' },
                    ].map(f => (
                        <div key={f.key} className="flex flex-col gap-1">
                            <label className="text-[11px] font-bold text-[#8FA99C] uppercase tracking-[0.8px]">{f.label}</label>
                            <input className={inputCls} type="number" value={finDraft[f.key]} onChange={e => setFinDraft(d => ({ ...d, [f.key]: Number(e.target.value) }))} />
                        </div>
                    ))}
                    <div className="flex gap-3 pt-2 border-t border-[#E4EDE8]">
                        <button className="inline-flex items-center gap-[8px] px-[20px] py-[10px] bg-[#2D7A4F] text-white rounded-[6px] text-[13px] font-bold transition-all duration-200 cursor-pointer hover:bg-[#256341] hover:-translate-y-[1px] shadow-sm flex-1 justify-center" onClick={saveFinModal}>Save Changes</button>
                        <button className="inline-flex items-center gap-[8px] px-[20px] py-[10px] bg-transparent text-[#2D7A4F] border border-[#E4EDE8] rounded-[6px] text-[13px] font-bold transition-all duration-200 cursor-pointer hover:bg-[#F0F4F1] flex-1 justify-center" onClick={() => setFinModal(false)}>Cancel</button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
