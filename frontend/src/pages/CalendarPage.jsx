import { useState, useEffect } from 'react';
import axios from 'axios';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { motion } from 'framer-motion';
import Layout from '../components/Layout';
import { Calendar as CalendarIcon, Upload } from 'lucide-react';

const API_BASE_URL = window.location.hostname === 'localhost' ? 'http://localhost:8500' : '';

function CalendarPage() {
    const [date, setDate] = useState(new Date());
    const [tasks, setTasks] = useState([]);

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_BASE_URL}/tasks/`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTasks(response.data);
        } catch (error) {
            console.error(error);
        }
    };

    const tileContent = ({ date, view }) => {
        if (view === 'month') {
            const dateString = date.toISOString().split('T')[0];
            const dayTasks = tasks.filter(t => t.due_date === dateString);
            return (
                <div className="d-flex flex-column align-items-center mt-1">
                    {dayTasks.map((t, i) => (
                        <div
                            key={i}
                            className="bg-terracotta rounded-circle mb-1"
                            style={{ width: '6px', height: '6px' }}
                            title={t.title}
                        />
                    ))}
                </div>
            );
        }
    };

    const parseIcs = (icsText) => {
        const lines = icsText.split(/\r?\n/);
        const events = [];
        let inEvent = false;
        let currentEvent = null;

        for (let line of lines) {
            if (line.startsWith('BEGIN:VEVENT')) {
                inEvent = true;
                currentEvent = {
                    title: 'Sync Event',
                    description: 'Imported from ICS',
                    due_date: new Date().toISOString().split('T')[0],
                    priority: 2,
                    estimated_hours: 1,
                    category: 'Uni'
                };
            } else if (line.startsWith('END:VEVENT')) {
                inEvent = false;
                if (currentEvent) events.push(currentEvent);
                currentEvent = null;
            } else if (inEvent) {
                if (line.startsWith('SUMMARY:')) {
                    currentEvent.title = line.substring(8).trim();
                } else if (line.startsWith('DTSTART')) {
                    const dateMatch = line.match(/:(\d{4})(\d{2})(\d{2})/);
                    if (dateMatch) {
                        currentEvent.due_date = `${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}`;
                    }
                }
            }
        }
        return events;
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
            const text = event.target.result;
            const events = parseIcs(text);

            if (events.length === 0) {
                alert("No valid events found in the ICS file. Make sure it contains VEVENT blocks.");
                return;
            }

            const token = localStorage.getItem('token');
            if (!token) {
                alert("Please login first to sync timeline.");
                return;
            }

            let addedCount = 0;
            for (let ev of events) {
                try {
                    await axios.post(`${API_BASE_URL}/tasks/`, ev, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    addedCount++;
                } catch (err) {
                    console.error("Failed to sync event", err);
                }
            }
            alert(`Successfully synced ${addedCount} events directly into your SmartPlanner account!`);
            fetchTasks();
        };
        reader.readAsText(file);
    };

    return (
        <Layout title="Calendar" subtitle="Visualize your deadlines and sync your schedule.">
            <div className="row g-5">
                <div className="col-lg-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="zen-card"
                    >
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h3 className="h4 serif d-flex align-items-center gap-2">
                                <CalendarIcon size={20} className="text-sage" /> Monthly View
                            </h3>
                        </div>

                        <div className="custom-calendar-wrapper">
                            <Calendar
                                onChange={setDate}
                                value={date}
                                tileContent={tileContent}
                                className="w-100 border-0"
                            />
                        </div>
                    </motion.div>
                </div>

                <div className="col-lg-4">
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="zen-card"
                    >
                        <h3 className="h5 serif mb-4">External Sync</h3>
                        <p className="small text-muted mb-4">
                            Import your University timetable (.ics) to avoid scheduling conflicts.
                        </p>
                        <label className="zen-button-secondary w-100 text-center cursor-pointer">
                            <Upload size={18} className="me-2 inline" /> Upload ICS
                            <input type="file" className="d-none" onChange={handleFileUpload} accept=".ics" />
                        </label>
                        <div className="mt-4 p-3 bg-light rounded-lg border">
                            <p className="small mb-0 text-muted">
                                <strong>Tip:</strong> You can export your Google Calendar or Canvas syllabus as an ICS file.
                            </p>
                        </div>
                    </motion.div>

                    <div className="mt-4">
                        <h5 className="form-label">Deadlines for {date.toDateString()}</h5>
                        <div className="mt-3">
                            {tasks.filter(t => t.due_date === date.toISOString().split('T')[0]).length === 0 ? (
                                <p className="small text-muted">No deadlines today.</p>
                            ) : (
                                tasks.filter(t => t.due_date === date.toISOString().split('T')[0]).map((t, idx) => (
                                    <div key={idx} className="task-item p-3 mb-2">
                                        <span className="fw-bold">{t.title}</span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
        .react-calendar {
          background: transparent !important;
          font-family: 'Inter', sans-serif;
        }
        .react-calendar__tile--now {
          background: #e8f8f5 !important;
          color: #117a65 !important;
          border-radius: 8px;
        }
        .react-calendar__tile--active {
          background: var(--accent-sage) !important;
          color: white !important;
          border-radius: 8px;
        }
        .react-calendar__navigation button {
          font-family: 'Fraunces', serif;
          font-size: 1.2rem;
        }
      `}</style>
        </Layout>
    );
}

export default CalendarPage;
