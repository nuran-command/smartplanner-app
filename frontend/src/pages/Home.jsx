import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Sparkles,
  Target,
  Clock,
  Brain,
  ClipboardList,
  Activity,
  Calendar,
  CheckCircle,
  Trash2
} from 'lucide-react';
import Layout from '../components/Layout';
import PomodoroTimer from '../components/PomodoroTimer';

const API_BASE_URL = 'http://localhost:8500';

function Home() {
  const navigate = useNavigate();
  const [taskName, setTaskName] = useState('');
  const [duration, setDuration] = useState('');
  const [deadline, setDeadline] = useState('');
  const [priority, setPriority] = useState(2);
  const [category, setCategory] = useState('Uni');
  const [tasks, setTasks] = useState([]);
  const [aiAdvice, setAiAdvice] = useState('Analyzing your schedule...');

  const [availabilityDate, setAvailabilityDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  const [availabilities, setAvailabilities] = useState(() => {
    const saved = localStorage.getItem('availabilities');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Auto-filter out old dates
      const today = new Date().toISOString().split('T')[0];
      return parsed.filter(a => a.date >= today);
    }
    return [];
  });

  const [schedule, setSchedule] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const isLoggedIn = !!localStorage.getItem('token');

  useEffect(() => {
    localStorage.setItem('availabilities', JSON.stringify(availabilities));
  }, [availabilities]);

  useEffect(() => {
    if (isLoggedIn) {
      fetchTasks();
      fetchAiAdvice();
    }
  }, [isLoggedIn]);

  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const response = await axios.get(`${API_BASE_URL}/tasks/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTasks(response.data);
    } catch (error) {
      console.error("Connection failed");
    }
  };

  const fetchAiAdvice = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const response = await axios.get(`${API_BASE_URL}/ai-coach/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAiAdvice(response.data.advice);
    } catch (error) {
      setAiAdvice("Focus on your most important task today.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    const newTask = {
      title: taskName,
      description: "",
      due_date: deadline,
      priority: parseInt(priority),
      estimated_hours: parseInt(duration),
      category: category
    };

    try {
      const response = await axios.post(`${API_BASE_URL}/tasks/`, newTask, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTasks([...tasks, { ...newTask, id: response.data.task_id }]);
      setTaskName('');
      setDuration('');
      setDeadline('');
      fetchAiAdvice();
    } catch (error) {
      alert("Session expired. Please login again.");
    }
  };

  const handleGenerateSchedule = async () => {
    setIsGenerating(true);

    const generateDefaultSlots = () => {
      const slots = [];
      for (let i = 0; i < 7; i++) {
        const d = new Date();
        d.setDate(d.getDate() + i);
        slots.push({
          date: d.toISOString().split('T')[0],
          start: '09:00',
          end: '17:00'
        });
      }
      return slots;
    };

    const totalTaskHours = tasks.filter(t => !t.completed).reduce((sum, t) => sum + Number(t.estimated_hours), 0);

    // Create a set of dates the user has already provided
    const userDates = new Set(availabilities.map(a => a.date));
    let timeSlots = availabilities.map(a => ({ date: a.date, start: a.start, end: a.end }));

    // AUTOMATIC BUFFER: Fill in the gaps from Today for the next 7 days
    // This ensures if a task is due tomorrow, we have a slot for it even if the user only added a slot for next week.
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];

      // If the user hasn't provided a slot for this day, add a default one
      if (!userDates.has(dateStr)) {
        timeSlots.push({
          date: dateStr,
          start: '09:00',
          end: '17:00'
        });
      }
    }

    // Sort timeSlots to ensure they are chronological for the backend
    timeSlots.sort((a, b) => new Date(a.date + 'T' + a.start) - new Date(b.date + 'T' + b.start));

    const requestBody = {
      tasks: tasks.filter(t => !t.completed).map(t => ({
        title: t.title,
        due_date: t.due_date,
        estimated_hours: t.estimated_hours
      })),
      time_slots: timeSlots
    };

    if (requestBody.tasks.length === 0) {
      alert("You have no pending tasks to schedule!");
      setIsGenerating(false);
      return;
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/generate-schedule/`, requestBody);
      setTimeout(() => {
        setSchedule(response.data.plan);
        setIsGenerating(false);
      }, 800);
    } catch (error) {
      alert("Failed to generate schedule. Please ensure your tasks and availabilities are valid.");
      setIsGenerating(false);
    }
  };

  const addAvailability = (e) => {
    e.preventDefault();
    setAvailabilities([...availabilities, { date: availabilityDate, start: startTime, end: endTime }]);
    setAvailabilityDate('');
    setStartTime('');
    setEndTime('');
  };

  const deleteAvailability = (idxToDelete) => {
    setAvailabilities(availabilities.filter((_, idx) => idx !== idxToDelete));
  };

  const handleCompleteTask = async (taskId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`${API_BASE_URL}/tasks/${taskId}`, { completed: true }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTasks(tasks.map(t => t.id === taskId ? { ...t, completed: true } : t));
      fetchAiAdvice(); // Refresh advice since workload changed!
    } catch (error) {
      console.error("Failed to complete task");
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      const token = localStorage.getItem('token');
      // Assume DELETE endpoint is valid or just update UI locally if not supported
      try {
        await axios.delete(`${API_BASE_URL}/tasks/${taskId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (e) { console.warn("Delete endpoint not configured, falling back to local state"); }
      setTasks(tasks.filter(t => t.id !== taskId));
    } catch (error) {
      console.error("Failed to delete task");
    }
  };

  return (
    <Layout
      title={isLoggedIn ? "Dashboard" : "Welcome to SmartPlanner"}
      subtitle={isLoggedIn ? "Your focus, organized." : "The ultimate student productivity toolkit."}
    >
      {!isLoggedIn ? (
        <div className="landing-container slide-up">
          {/* New Premium Hero Section */}
          <div
            className="hero-banner position-relative overflow-hidden rounded-xl shadow-lg d-flex align-items-center"
            style={{
              backgroundImage: 'url("/hero-im.jpg")',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              minHeight: '600px',
              padding: '40px',
              marginBottom: '100px' // Added more space below hero
            }}
          >
            {/* Blur Overlay - makes the image slightly blurred for better contrast */}
            <div
              className="position-absolute top-0 start-0 w-100 h-100"
              style={{
                backdropFilter: 'blur(3px)',
                backgroundColor: 'rgba(0,0,0,0.2)'
              }}
            ></div>

            {/* Content Box (Left Side) */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="zen-card glass-morph p-5 ms-lg-5"
              style={{
                maxWidth: '500px',
                backdropFilter: 'blur(10px)',
                background: 'rgba(255, 255, 255, 0.85)',
                border: '1px solid rgba(255, 255, 255, 0.3)'
              }}
            >
              <div className="d-flex align-items-center gap-3 mb-4">
                {/* Ticking Clock SVG Animation */}
                <div className="clock-container">
                  <svg width="40" height="40" viewBox="0 0 40 40" className="text-sage">
                    <circle cx="20" cy="20" r="18" fill="none" stroke="currentColor" strokeWidth="2" />
                    <line x1="20" y1="20" x2="20" y2="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <animateTransform
                        attributeName="transform"
                        type="rotate"
                        from="0 20 20"
                        to="360 20 20"
                        dur="60s"
                        repeatCount="indefinite"
                      />
                    </line>
                    <line x1="20" y1="20" x2="28" y2="20" stroke="var(--accent-terracotta)" strokeWidth="2" strokeLinecap="round">
                      <animateTransform
                        attributeName="transform"
                        type="rotate"
                        from="0 20 20"
                        to="360 20 20"
                        dur="5s"
                        repeatCount="indefinite"
                      />
                    </line>
                    <circle cx="20" cy="20" r="1.5" fill="currentColor" />
                  </svg>
                </div>
                <span className="text-uppercase small tracking-widest fw-bold text-muted">Mindful Planning</span>
              </div>

              <h1 className="display-4 serif mb-4 tracking-tight">Smart <span className="text-sage">Planning</span></h1>
              <p className="lead text-muted mb-5 lh-lg" style={{ fontSize: '1.1rem' }}>
                Your academic journey, beautifully organized. Use AI to find your flow and stay ahead of deadlines without the stress.
              </p>

              <div className="d-flex flex-column gap-3">
                <button
                  onClick={() => navigate('/login')}
                  className="zen-button-primary w-100 py-3 shadow-hover"
                >
                  Start Your Journey
                </button>
                <button
                  onClick={() => window.scrollTo({ top: 750, behavior: 'smooth' })}
                  className="zen-button-secondary bg-transparent border-0 text-sage fw-bold"
                >
                  Explore Features ↓
                </button>
              </div>
            </motion.div>
          </div>

          {/* Features Section (Kept Original) */}
          <div className="row g-5 mt-5">
            <div className="col-md-4">
              <motion.div
                whileHover={{ y: -10 }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="zen-card h-100 p-5 border-0 shadow-sm highlight-hover"
              >
                <div className="bg-sage bg-opacity-10 rounded-xl d-inline-flex p-3 mb-4 text-sage">
                  <Calendar size={32} />
                </div>
                <h3 className="h4 serif mb-3">Sync & Flow</h3>
                <p className="text-muted lh-relaxed">Import your timetable and let AI weave your study sessions naturally into your life.</p>
              </motion.div>
            </div>
            <div className="col-md-4">
              <motion.div
                whileHover={{ y: -10 }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="zen-card h-100 p-5 border-0 shadow-sm highlight-hover"
              >
                <div className="bg-terracotta bg-opacity-10 rounded-xl d-inline-flex p-3 mb-4 text-terracotta">
                  <Activity size={32} />
                </div>
                <h3 className="h4 serif mb-3">Calm Clarity</h3>
                <p className="text-muted lh-relaxed">No more "Hell Weeks". See your workload clear as glass and plan your rest as well as your work.</p>
              </motion.div>
            </div>
            <div className="col-md-4">
              <motion.div
                whileHover={{ y: -10 }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                className="zen-card h-100 p-5 border-0 shadow-sm highlight-hover"
              >
                <div className="bg-sage bg-opacity-10 rounded-xl d-inline-flex p-3 mb-4 text-sage">
                  <Sparkles size={32} />
                </div>
                <h3 className="h4 serif mb-3">AI Companion</h3>
                <p className="text-muted lh-relaxed">Gemini-powered insights that tell you when you're overworking and help you prioritize.</p>
              </motion.div>
            </div>
          </div>
        </div>
      ) : (
        <div className="row g-5">
          {/* Main Column */}
          <div className="col-lg-7">
            <div className="row g-4">
              <div className="col-md-7">
                {/* AI Coach Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="zen-card bg-sage text-white position-relative overflow-hidden h-100"
                >
                  <div className="position-relative z-index-2">
                    <h3 className="h5 serif mb-3 d-flex align-items-center gap-2">
                      <Sparkles size={18} /> AI Study Coach
                    </h3>
                    <p className="mb-0 text-white-50 lh-lg" style={{ fontSize: '1rem' }}>
                      "{aiAdvice}"
                    </p>
                  </div>
                  <div
                    className="position-absolute"
                    style={{ bottom: '-20px', right: '-20px', opacity: 0.1 }}
                  >
                    <Sparkles size={150} />
                  </div>
                </motion.div>
              </div>
              <div className="col-md-5">
                <PomodoroTimer />
              </div>
            </div>

            {/* Tasks Section */}
            <div className="mt-5">
              <h3 className="h5 serif mb-4 d-flex align-items-center gap-2">
                <ClipboardList size={20} className="text-sage" /> Pending Objectives
              </h3>
              <div className="task-list">
                {tasks.length === 0 ? (
                  <div className="text-center py-5 border rounded-lg dashed" style={{ backgroundColor: 'var(--card-bg)' }}>
                    <p className="text-muted small mb-0">No active tasks. Add one to get started!</p>
                  </div>
                ) : (
                  tasks.filter(t => !t.completed).map((task, idx) => (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="task-item d-flex justify-content-between align-items-center p-3 rounded-lg border mb-3 shadow-sm hover-shadow transition-all"
                      style={{ backgroundColor: 'var(--card-bg)' }}
                    >
                      <div className="d-flex align-items-center gap-3">
                        <button
                          onClick={() => handleCompleteTask(task.id)}
                          className="btn btn-outline-success rounded-circle p-1 d-flex align-items-center justify-content-center"
                          style={{ width: '30px', height: '30px', flexShrink: 0 }}
                          title="Mark as Completed"
                        >
                          <CheckCircle size={14} />
                        </button>
                        <div>
                          <div className="d-flex align-items-center gap-2 mb-1">
                            <span className="small fw-bold text-sage">{task.category}</span>
                            <span className="text-muted">•</span>
                            <span className="small text-muted">{task.due_date}</span>
                          </div>
                          <div className="fw-semibold" style={{ color: 'var(--text-main)' }}>{task.title}</div>
                        </div>
                      </div>
                      <div className="d-flex align-items-center gap-3">
                        <div className={`badge-priority bg-${task.priority === 3 ? 'danger' : task.priority === 2 ? 'warning' : 'sage'} text-white`}>
                          {task.priority === 3 ? 'High' : task.priority === 2 ? 'Medium' : 'Low'}
                        </div>
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="btn btn-link text-muted p-0 border-0 ms-2"
                          title="Delete Task"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>

            {/* Smart Timeline moved up into the main column to fix the scattered layout gap */}
            <div className="mt-5">
              <div className="zen-card h-100">
                <div className="d-flex justify-content-between align-items-center mb-5">
                  <h3 className="h4 serif d-flex align-items-center gap-2">
                    <Target size={20} className="text-terracotta" /> Smart Timeline
                  </h3>
                  <button
                    className="zen-button-primary d-flex align-items-center gap-2"
                    style={{ width: 'auto' }}
                    onClick={handleGenerateSchedule}
                    disabled={tasks.length === 0 || isGenerating}
                  >
                    {isGenerating ? 'Computing...' : <><Sparkles size={18} /> Optimize</>}
                  </button>
                </div>

                <div>
                  <h5 className="form-label mb-3">Optimized Plan</h5>
                  {schedule.length === 0 ? (
                    <div className="text-center py-5 border rounded-lg" style={{ borderStyle: 'dashed', backgroundColor: 'var(--card-bg)' }}>
                      <p className="text-muted small">No schedule generated yet. Click Optimize to begin.</p>
                    </div>
                  ) : (
                    <div className="schedule-list">
                      {schedule.map((slot, idx) => {
                        // Check if this task appears multiple times to show "Session X"
                        const taskSessions = schedule.filter(s => s.task === slot.task);
                        const sessionIndex = taskSessions.findIndex(s => s.date === slot.date && s.time_block[0] === slot.time_block[0]) + 1;
                        const isSplit = taskSessions.length > 1;

                        return (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className={`task-item border-start border-4 ${slot.is_late ? 'border-danger' : 'border-sage'}`}
                            style={{ backgroundColor: 'var(--bg-color)', color: 'var(--text-main)' }}
                          >
                            <div className="flex-grow-1">
                              <div className="d-flex align-items-center gap-2">
                                <span className="fw-bold">{slot.task}</span>
                                {isSplit && (
                                  <span className="badge border border-sage border-opacity-25" style={{ fontSize: '10px', backgroundColor: 'rgba(45, 74, 68, 0.1)', color: 'var(--accent-sage)' }}>
                                    SESSION {sessionIndex}/{taskSessions.length}
                                  </span>
                                )}
                              </div>
                              <div className="small text-muted mt-1">
                                <Clock size={14} className="me-1 inline" />
                                {slot.time_block[0]} - {slot.time_block[1]} ({slot.hours_allocated}h)
                              </div>
                            </div>
                            <div className="d-flex align-items-center gap-3">
                              <div className="text-end">
                                <div className="text-sage fw-bold small">{slot.date}</div>
                                {slot.is_late && (
                                  <span className="badge border border-danger border-opacity-25 mt-1" style={{ fontSize: '10px', backgroundColor: 'rgba(220, 53, 69, 0.1)', color: '#dc3545' }}>
                                    OVERDUE
                                  </span>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Column */}
          <div className="col-lg-5">
            <div className="zen-card">
              <h3 className="h5 serif mb-4">New Objective</h3>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">Task Name</label>
                  <input
                    type="text"
                    className="zen-input"
                    placeholder="e.g., OS Exam Prep"
                    value={taskName}
                    onChange={(e) => setTaskName(e.target.value)}
                    required
                  />
                </div>

                <div className="row g-3">
                  <div className="col-6">
                    <label className="form-label">Category</label>
                    <select
                      className="zen-input"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                    >
                      <option value="Uni">Uni</option>
                      <option value="Work">Work</option>
                      <option value="Hobby">Hobby</option>
                      <option value="Personal">Personal</option>
                    </select>
                  </div>
                  <div className="col-6">
                    <label className="form-label">Priority</label>
                    <select
                      className="zen-input"
                      value={priority}
                      onChange={(e) => setPriority(e.target.value)}
                    >
                      <option value="1">Low</option>
                      <option value="2">Medium</option>
                      <option value="3">High</option>
                    </select>
                  </div>
                </div>

                <div className="row g-3 mt-1 mb-4">
                  <div className="col-6">
                    <label className="form-label">Duration (Hrs)</label>
                    <input
                      type="number"
                      className="zen-input"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      required
                    />
                  </div>
                  <div className="col-6">
                    <label className="form-label">Deadline</label>
                    <input
                      type="date"
                      className="zen-input"
                      value={deadline}
                      onChange={(e) => setDeadline(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <button type="submit" className="zen-button-primary w-100 mt-4">
                  Create Objective
                </button>
              </form>
            </div>

            {/* Availability and Schedule Generation */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="zen-card mt-4"
            >
              <h3 className="h4 mb-2 serif d-flex align-items-center gap-2">
                <Clock size={20} className="text-sage" /> Availability
              </h3>
              <p className="text-muted small mb-4">Add your available study hours so the AI Coach can schedule tasks for you.</p>
              <form onSubmit={addAvailability}>
                <div className="form-group">
                  <label className="form-label">Date</label>
                  <input
                    type="date"
                    className="zen-input"
                    value={availabilityDate}
                    onChange={(e) => setAvailabilityDate(e.target.value)}
                    required
                  />
                </div>
                <div className="row g-3 mb-4">
                  <div className="col-6">
                    <label className="form-label">Start</label>
                    <input
                      type="time"
                      className="zen-input"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      required
                    />
                  </div>
                  <div className="col-6">
                    <label className="form-label">End</label>
                    <input
                      type="time"
                      className="zen-input"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <button type="submit" className="zen-button-secondary w-100 mt-2">
                  Add Time Slot
                </button>
              </form>

              {availabilities.length > 0 && (
                <div className="mt-4 pt-3 border-top">
                  <h5 className="form-label mb-3">Saved Time Slots</h5>
                  <div className="d-flex flex-wrap gap-2">
                    {availabilities.map((av, idx) => (
                      <div key={idx} className="px-3 py-2 rounded-pill small border shadow-sm d-flex align-items-center gap-2" style={{ backgroundColor: 'var(--bg-color)', color: 'var(--text-main)', borderColor: 'var(--border-color)' }}>
                        <span>
                          <span className="fw-bold">{av.date}</span> • {av.start} - {av.end}
                        </span>
                        <button
                          onClick={() => deleteAvailability(idx)}
                          className="btn btn-link p-0 m-0 border-0 text-muted ms-1"
                          style={{ lineHeight: 1 }}
                          title="Remove time slot"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </Layout>
  );
}

export default Home;