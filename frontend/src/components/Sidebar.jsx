import { NavLink, useNavigate } from 'react-router-dom';
import {
    Layout as LayoutIcon,
    Calendar,
    ClipboardList,
    Settings,
    User,
    LogOut,
    BarChart2,
    Sparkles,
    ShieldCheck
} from 'lucide-react';

function Sidebar() {
    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username') || 'Guest';

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        navigate('/login');
    };

    return (
        <aside className="sidebar">
            <div className="sidebar-logo mb-5">
                <h2 className="serif text-sage">SmartPlanner</h2>
            </div>

            <nav className="flex-grow-1">
                <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                    <LayoutIcon size={20} /> Dashboard
                </NavLink>

                {token && (
                    <>
                        <NavLink to="/calendar" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                            <Calendar size={20} /> Calendar
                        </NavLink>
                        <NavLink to="/analytics" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                            <BarChart2 size={20} /> Analytics
                        </NavLink>
                        <NavLink to="/settings" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                            <Settings size={20} /> Settings
                        </NavLink>
                    </>
                )}
            </nav>

            <div className="sidebar-footer mt-auto">
                {token ? (
                    <>
                        <div className="nav-link" style={{ cursor: 'pointer' }} onClick={() => navigate('/profile')}>
                            <User size={20} /> {username}
                        </div>
                        <div className="nav-link text-danger" style={{ cursor: 'pointer' }} onClick={handleLogout}>
                            <LogOut size={20} /> Logout
                        </div>
                    </>
                ) : (
                    <div className="nav-link text-sage fw-bold" style={{ cursor: 'pointer' }} onClick={() => navigate('/login')}>
                        <ShieldCheck size={20} /> Sign In
                    </div>
                )}
            </div>
        </aside>
    );
}

export default Sidebar;
