import Sidebar from './Sidebar';
import { Clock } from 'lucide-react';
import { useState, useEffect } from 'react';

function Layout({ children, title, subtitle }) {
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 60000); // Update every minute
        return () => clearInterval(timer);
    }, []);

    const timeString = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return (
        <div className="app-wrapper">
            <Sidebar />
            <main className="main-content">
                <header className="header slide-up">
                    <div>
                        <h1 className="h2 serif">{title}</h1>
                        <p className="text-muted small">{subtitle}</p>
                    </div>
                    <div className="d-flex align-items-center gap-3">
                        <div className="bg-light px-3 py-2 rounded-lg text-muted small d-flex align-items-center gap-2">
                            <Clock size={14} /> {timeString}
                        </div>
                    </div>
                </header>

                {children}

                <footer className="footer">
                    <p className="mb-0 serif">SmartPlanner © 2026</p>
                    <p className="small text-muted mt-2">Designed for High Performance Students</p>
                </footer>
            </main>
        </div>
    );
}

export default Layout;
