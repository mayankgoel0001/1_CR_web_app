import { userData, formatCurrency } from '../../data/mockData';
import './ProfilePage.css';

export default function ProfilePage() {
    return (
        <div className="profile-page">
            <div className="profile-header-card card">
                <div className="profile-avatar-large">
                    {userData.firstName[0]}{userData.lastName[0]}
                </div>
                <div className="profile-header-info">
                    <h2>{userData.firstName} {userData.lastName}</h2>
                    <p>{userData.occupation}</p>
                    <span className="email">{userData.email}</span>
                </div>
                <button className="btn-outline" style={{ marginLeft: 'auto' }}>Edit Profile</button>
            </div>

            <div className="profile-section card">
                <h3>Personal Information</h3>
                <div className="profile-grid">
                    <div className="profile-field"><label>Full Name</label><div className="value">{userData.firstName} {userData.lastName}</div></div>
                    <div className="profile-field"><label>Email Address</label><div className="value">{userData.email}</div></div>
                    <div className="profile-field"><label>Phone Number</label><div className="value">{userData.phone}</div></div>
                    <div className="profile-field"><label>Date of Birth</label><div className="value">{new Date(userData.dob).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</div></div>
                    <div className="profile-field"><label>Occupation</label><div className="value">{userData.occupation}</div></div>
                    <div className="profile-field"><label>PAN Card</label><div className="value">{userData.panCard}</div></div>
                    <div className="profile-field"><label>Location</label><div className="value">{userData.location}</div></div>
                    <div className="profile-field"><label>Aadhaar Number</label><div className="value">{userData.aadhaar}</div></div>
                    <div className="profile-field"><label>Relationship Status</label><div className="value">{userData.relationshipStatus}</div></div>
                </div>
            </div>

            <div className="profile-section card">
                <h3>Family Members</h3>
                <div className="family-grid">
                    {userData.familyMembers.map(member => (
                        <div key={member.id} className="family-card">
                            <h5>{member.name}</h5>
                            <p>{member.relationship} • Age {member.age}</p>
                            {member.dependent && <span className="dependent-tag">Financially Dependent</span>}
                        </div>
                    ))}
                </div>
            </div>

            <div className="profile-section card">
                <h3>Financial Overview</h3>
                <div className="financial-overview">
                    <div className="fin-stat">
                        <label>Monthly Income</label>
                        <div className="value">{formatCurrency(userData.monthlyIncome)}</div>
                    </div>
                    <div className="fin-stat">
                        <label>Monthly Expenses</label>
                        <div className="value" style={{ color: '#EF4444' }}>{formatCurrency(userData.monthlyExpenses)}</div>
                    </div>
                    <div className="fin-stat">
                        <label>Monthly Savings</label>
                        <div className="value" style={{ color: '#16A34A' }}>{formatCurrency(userData.monthlySavings)}</div>
                    </div>
                </div>
            </div>

            <button className="btn-outline" style={{ color: '#EF4444', borderColor: '#EF4444', alignSelf: 'flex-start' }}>
                Sign Out
            </button>
        </div>
    );
}
