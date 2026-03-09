import { useState } from 'react';
import { goals, assets, formatCurrency, getStatusColor, getStatusBg, getCategoryIcon } from '../../data/mockData';
import Modal from '../../components/common/Modal';
import { MdOutlineCategory, MdFlag, MdCalendarToday } from 'react-icons/md';
import './GoalsPage.css';

const filters = ['All', 'On Track', 'Possible', 'At Risk', 'Behind'];

export default function GoalsPage() {
    const [activeFilter, setActiveFilter] = useState('All');

    // Local data state
    const [localGoals, setLocalGoals] = useState(goals);
    const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);

    // Form selection state for checkboxes
    const [selectedAssets, setSelectedAssets] = useState([]);

    const filtered = activeFilter === 'All'
        ? localGoals
        : localGoals.filter(g => g.status === activeFilter);

    const activeCount = localGoals.filter(g => g.status !== 'Behind').length;

    const handleToggleAsset = (assetId) => {
        setSelectedAssets(prev =>
            prev.includes(assetId)
                ? prev.filter(id => id !== assetId)
                : [...prev, assetId]
        );
    };

    const handleAddGoal = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);

        // Calculate initial linked amount
        let initialAmount = 0;
        selectedAssets.forEach(id => {
            const asset = assets.find(a => a.id === id);
            if (asset) initialAmount += asset.currentValue;
        });

        const targetAmount = Number(formData.get('goalAmount'));
        const progress = targetAmount > 0 ? (initialAmount / targetAmount) * 100 : 0;

        let status = 'Behind';
        if (progress >= 80) status = 'On Track';
        else if (progress >= 40) status = 'Possible';
        else if (progress >= 20) status = 'At Risk';

        const newGoal = {
            id: Date.now().toString(),
            title: formData.get('goalTitle'),
            category: formData.get('goalCategory'),
            goalAmount: targetAmount,
            currentAmount: initialAmount,
            targetDate: formData.get('targetDate'),
            status: status
        };

        setLocalGoals([...localGoals, newGoal]);
        setIsGoalModalOpen(false);
        setSelectedAssets([]); // Reset
    };

    return (
        <div className="goals-page">
            <div className="goals-header">
                <div>
                    <h1>My Goals</h1>
                    <p className="goals-count">{activeCount} active goals</p>
                </div>
                <button className="btn-primary" onClick={() => setIsGoalModalOpen(true)}>+ Create Goal</button>
            </div>

            <div className="goals-filters">
                {filters.map(f => (
                    <button
                        key={f}
                        className={`goals-filter-btn ${activeFilter === f ? 'active' : ''}`}
                        onClick={() => setActiveFilter(f)}
                    >
                        {f}
                    </button>
                ))}
            </div>

            <div className="goals-grid">
                {filtered.map(goal => {
                    const progress = Math.round((goal.currentAmount / goal.goalAmount) * 100);
                    const statusColor = getStatusColor(goal.status);
                    const statusBg = getStatusBg(goal.status);
                    const targetDate = new Date(goal.targetDate).toLocaleDateString('en-IN', {
                        month: 'short', year: 'numeric'
                    });

                    return (
                        <div key={goal.id} className="goal-card card">
                            <div className="goal-card-header">
                                <div className="goal-card-title">
                                    <div className="goal-emoji">{getCategoryIcon(goal.category)}</div>
                                    <div>
                                        <h4>{goal.title}</h4>
                                        <p>{goal.category}</p>
                                    </div>
                                </div>
                                <span className="goal-status-badge" style={{ background: statusBg, color: statusColor }}>
                                    {goal.status}
                                </span>
                            </div>

                            <div className="goal-progress">
                                <div className="goal-progress-header">
                                    <span className="current" style={{ color: statusColor }}>
                                        {formatCurrency(goal.currentAmount)}
                                    </span>
                                    <span className="target">of {formatCurrency(goal.goalAmount)}</span>
                                </div>
                                <div className="goal-progress-bar">
                                    <div
                                        className="goal-progress-fill"
                                        style={{ width: `${Math.min(progress, 100)}%`, background: statusColor }}
                                    />
                                </div>
                            </div>

                            <div className="goal-footer">
                                <span>Target: {targetDate}</span>
                                <span className="pct" style={{ color: statusColor }}>{progress}% Complete</span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Add Goal Modal */}
            <Modal isOpen={isGoalModalOpen} onClose={() => setIsGoalModalOpen(false)} title="Create New Goal">
                <form className="modal-form" onSubmit={handleAddGoal}>
                    <div className="modal-form-group">
                        <label>Goal Category *</label>
                        <div className="modal-input-wrapper">
                            <MdOutlineCategory className="modal-input-icon" />
                            <select name="goalCategory" required>
                                <option value="" disabled selected>Select Category</option>
                                <option value="Vehicle">Vehicle</option>
                                <option value="Home">Home</option>
                                <option value="Education">Education</option>
                                <option value="Retirement">Retirement</option>
                                <option value="Travel">Travel</option>
                                <option value="Emergency Fund">Emergency Fund</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                    </div>

                    <div className="modal-form-group">
                        <label>Goal Title *</label>
                        <div className="modal-input-wrapper">
                            <span className="modal-input-icon">T</span>
                            <input type="text" name="goalTitle" placeholder="e.g. New Car" required />
                        </div>
                    </div>

                    <div className="modal-form-group">
                        <label>Goal Amount (₹) *</label>
                        <div className="modal-input-wrapper">
                            <MdFlag className="modal-input-icon" />
                            <input type="number" name="goalAmount" placeholder="0" required />
                        </div>
                    </div>

                    <div className="modal-form-group">
                        <label>Target Date *</label>
                        <div className="modal-input-wrapper">
                            <MdCalendarToday className="modal-input-icon" />
                            <input type="date" name="targetDate" required />
                        </div>
                    </div>

                    <div className="modal-form-group" style={{ marginTop: '16px' }}>
                        <label>Link Savings / Investments (Optional)</label>
                        <div className="asset-link-list">
                            {assets.filter(a => a.category === 'savings' || a.category === 'investments').map(asset => (
                                <label key={asset.id} className="asset-link-item">
                                    <input
                                        type="checkbox"
                                        checked={selectedAssets.includes(asset.id)}
                                        onChange={() => handleToggleAsset(asset.id)}
                                        style={{ width: '18px', height: '18px', accentColor: 'var(--color-primary)' }}
                                    />
                                    <div className="asset-link-info">
                                        <div className="asset-link-name">{asset.name}</div>
                                        <div className="asset-link-value">{asset.category} • {formatCurrency(asset.currentValue)}</div>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="modal-btn modal-btn-cancel" onClick={() => setIsGoalModalOpen(false)}>Cancel</button>
                        <button type="submit" className="modal-btn modal-btn-submit">Create Goal</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
