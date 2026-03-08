import Layout from '../components/Layout';
import { useState } from 'react';

function ProfilePage() {
    const username = localStorage.getItem('username') || 'User';
    const [university, setUniversity] = useState(localStorage.getItem('university') || '');

    const handleSave = () => {
        localStorage.setItem('university', university);
        alert('Profile saved successfully!');
    };

    return (
        <Layout
            title="Profile"
            subtitle="Manage your personal information."
        >
            <div className="zen-card p-5 slide-up" style={{ maxWidth: '800px', margin: '0 auto' }}>
                <div className="d-flex align-items-center gap-4 mb-5 pb-4 border-bottom">
                    <div className="bg-sage text-white rounded-circle d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: '100px', height: '100px' }}>
                        <span className="display-4 serif m-0 lh-1">{username[0].toUpperCase()}</span>
                    </div>
                    <div>
                        <h2 className="serif mb-1">{username}</h2>
                        <p className="text-muted mb-0">SmartPlanner Premium Student</p>
                    </div>
                </div>

                <div className="row g-5 mb-5">
                    <div className="col-md-6">
                        <label className="form-label">Username</label>
                        <input type="text" className="zen-input" value={username} readOnly style={{ backgroundColor: 'var(--bg-color)', cursor: 'not-allowed' }} />
                    </div>
                    <div className="col-md-6">
                        <label className="form-label">University</label>
                        <input
                            type="text"
                            className="zen-input"
                            placeholder="e.g. Stanford University"
                            value={university}
                            onChange={(e) => setUniversity(e.target.value)}
                        />
                    </div>
                </div>

                <div className="mt-5 pt-3">
                    <button className="zen-button-primary" style={{ width: 'auto', minWidth: '150px' }} onClick={handleSave}>
                        Save Profile
                    </button>
                </div>
            </div>
        </Layout>
    );
}

export default ProfilePage;
