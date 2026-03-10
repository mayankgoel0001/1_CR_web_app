import { useState } from 'react';
import { MdVerifiedUser, MdHealthAndSafety, MdDirectionsCar, MdBusiness, MdDescription, MdAttachMoney, MdCalendarToday, MdCategory } from 'react-icons/md';
import { insurancePolicies, formatCurrency } from '../../data/mockData';
import { getInsuranceIcon } from '../../utils/icons';
import Modal from '../../components/common/Modal';
import './InsurancePage.css';

const filters = ['All', 'Life', 'Health', 'Vehicle', 'Home', 'Travel', 'Term'];
const policyTypes = ['Life', 'Health', 'Vehicle', 'Home', 'Travel', 'Term'];
const frequencies = ['Annual', 'Semi-Annual', 'Quarterly', 'Monthly'];

export default function InsurancePage() {
    const [localPolicies, setLocalPolicies] = useState([...insurancePolicies]);
    const [activeFilter, setActiveFilter] = useState('All');
    const [isPolicyModalOpen, setIsPolicyModalOpen] = useState(false);

    const filtered = activeFilter === 'All' ? localPolicies : localPolicies.filter(p => p.type === activeFilter);
    const totalCoverage = localPolicies.reduce((s, p) => s + p.coverageAmount, 0);
    const totalPremium = localPolicies.reduce((s, p) => s + p.premiumAmount, 0);

    const handleAddPolicy = (e) => {
        e.preventDefault();
        const fd = new FormData(e.target);
        const newPolicy = {
            id: Date.now(),
            insurer: fd.get('insurer'),
            policyNumber: fd.get('policyNumber'),
            type: fd.get('type'),
            status: 'active',
            coverageAmount: Number(fd.get('coverageAmount')),
            premiumAmount: Number(fd.get('premiumAmount')),
            premiumFrequency: fd.get('premiumFrequency'),
            startDate: fd.get('startDate'),
            renewalDate: fd.get('renewalDate'),
        };
        setLocalPolicies(prev => [...prev, newPolicy]);
        setIsPolicyModalOpen(false);
    };

    return (
        <div className="insurance-page">
            <div className="page-header">
                <h1>Insurance & Protection</h1>
                <p>Manage your insurance policies and coverage</p>
            </div>

            <div className="insurance-hero">
                <div className="insurance-hero-stat">
                    <label>Total Coverage</label>
                    <div className="value">{formatCurrency(totalCoverage)}</div>
                </div>
                <div className="insurance-hero-stat">
                    <label>Annual Premium</label>
                    <div className="value">{formatCurrency(totalPremium)}</div>
                </div>
                <div className="insurance-hero-stat">
                    <label>Active Policies</label>
                    <div className="value">{localPolicies.filter(p => p.status === 'active').length}</div>
                </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="insurance-filters">
                    {filters.map(f => (
                        <button key={f} className={`insurance-filter-btn ${activeFilter === f ? 'active' : ''}`} onClick={() => setActiveFilter(f)}>{f}</button>
                    ))}
                </div>
                <button className="btn-primary" onClick={() => setIsPolicyModalOpen(true)}>+ Add Policy</button>
            </div>

            <div className="insurance-grid">
                {filtered.map(policy => (
                    <div key={policy.id} className="policy-card card">
                        <div className="policy-card-header">
                            <div className="policy-insurer">
                                <div className="policy-icon">{getInsuranceIcon(policy.type)}</div>
                                <div>
                                    <h4>{policy.insurer}</h4>
                                    <p>{policy.policyNumber}</p>
                                </div>
                            </div>
                            <span className="policy-active">{policy.status}</span>
                        </div>
                        <div className="policy-details">
                            <div className="policy-detail-item">
                                <label>Coverage</label>
                                <div className="value">{formatCurrency(policy.coverageAmount)}</div>
                            </div>
                            <div className="policy-detail-item">
                                <label>Premium</label>
                                <div className="value">{formatCurrency(policy.premiumAmount)}/{policy.premiumFrequency.toLowerCase()}</div>
                            </div>
                            <div className="policy-detail-item">
                                <label>Type</label>
                                <div className="value">{policy.type}</div>
                            </div>
                            <div className="policy-detail-item">
                                <label>Renewal</label>
                                <div className="value">{new Date(policy.renewalDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Add Policy Modal */}
            <Modal isOpen={isPolicyModalOpen} onClose={() => setIsPolicyModalOpen(false)} title="Add Policy">
                <form onSubmit={handleAddPolicy}>
                    <div className="modal-form-group">
                        <label><MdCategory /> Policy Type</label>
                        <select name="type" required>
                            <option value="">Select type</option>
                            {policyTypes.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>
                    <div className="modal-form-group">
                        <label><MdBusiness /> Insurer / Company</label>
                        <input type="text" name="insurer" placeholder="e.g. HDFC ERGO, LIC, Niva Bupa" required />
                    </div>
                    <div className="modal-form-group">
                        <label><MdDescription /> Policy Number</label>
                        <input type="text" name="policyNumber" placeholder="e.g. HE-VEH-2024-001" required />
                    </div>
                    <div className="modal-form-row">
                        <div className="modal-form-group">
                            <label><MdAttachMoney /> Coverage Amount (₹)</label>
                            <input type="number" name="coverageAmount" placeholder="e.g. 500000" required />
                        </div>
                        <div className="modal-form-group">
                            <label><MdAttachMoney /> Premium Amount (₹)</label>
                            <input type="number" name="premiumAmount" placeholder="e.g. 12000" required />
                        </div>
                    </div>
                    <div className="modal-form-group">
                        <label><MdCategory /> Premium Frequency</label>
                        <select name="premiumFrequency" required>
                            {frequencies.map(f => <option key={f} value={f}>{f}</option>)}
                        </select>
                    </div>
                    <div className="modal-form-row">
                        <div className="modal-form-group">
                            <label><MdCalendarToday /> Start Date</label>
                            <input type="date" name="startDate" required />
                        </div>
                        <div className="modal-form-group">
                            <label><MdCalendarToday /> Renewal Date</label>
                            <input type="date" name="renewalDate" required />
                        </div>
                    </div>
                    <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '8px' }}>
                        Add Policy
                    </button>
                </form>
            </Modal>
        </div>
    );
}
