import { useState } from 'react';
import Layout from '../components/Layout';
import { motion } from 'framer-motion';

function SettingsPage() {
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'Zen (Light)');
    const [notifications, setNotifications] = useState(localStorage.getItem('notifications') !== 'false');
    const [saved, setSaved] = useState(false);

    const handleSave = () => {
        let themeVal = 'light';
        if (theme.includes('Dark')) themeVal = 'dark';
        if (theme.includes('Monochrome')) themeVal = 'monochrome';

        localStorage.setItem('theme', theme);
        localStorage.setItem('themeVal', themeVal);
        localStorage.setItem('notifications', notifications.toString());

        document.documentElement.setAttribute('data-theme', themeVal);

        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    return (
        <Layout
            title="Settings"
            subtitle="Customize your SmartPlanner experience."
        >
            <div className="zen-card p-5 slide-up" style={{ maxWidth: '600px', margin: '0 auto' }}>
                <h3 className="serif mb-4">Account Preferences</h3>

                <div className="mb-4">
                    <label className="form-label text-muted small text-uppercase fw-bold">Theme</label>
                    <select
                        className="form-select custom-input zen-input"
                        value={theme}
                        onChange={(e) => setTheme(e.target.value)}
                    >
                        <option>Zen (Light)</option>
                        <option>Midnight (Dark)</option>
                        <option>Focused (Monochrome)</option>
                    </select>
                </div>

                <div className="mb-5">
                    <label className="form-label text-muted small text-uppercase fw-bold">Notifications</label>
                    <div className="form-check form-switch d-flex align-items-center gap-3">
                        <input
                            className="form-check-input"
                            type="checkbox"
                            checked={notifications}
                            onChange={(e) => setNotifications(e.target.checked)}
                            style={{ transform: 'scale(1.3)' }}
                        />
                        <label className="form-check-label text-dark fw-medium">Enable AI Study Reminders & Alerts</label>
                    </div>
                </div>

                <div className="d-flex align-items-center gap-3">
                    <button
                        onClick={handleSave}
                        className="zen-button-primary px-5 py-3"
                        style={{ width: 'auto' }}
                    >
                        Save Settings
                    </button>
                    {saved && (
                        <motion.span
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="text-sage fw-bold small"
                        >
                            ✓ Preferences Saved!
                        </motion.span>
                    )}
                </div>
            </div>
        </Layout>
    );
}

export default SettingsPage;

