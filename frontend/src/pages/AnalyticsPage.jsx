import { useState, useEffect } from 'react';
import axios from 'axios';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line,
    CartesianGrid
} from 'recharts';
import { motion } from 'framer-motion';
import Layout from '../components/Layout';
import { TrendingUp, PieChart as PieChartIcon, Activity, Sparkles } from 'lucide-react';

const API_BASE_URL = window.location.hostname === 'localhost' ? 'http://localhost:8500' : '';

const COLORS = ['#2d4a44', '#c96d54', '#e8d5c4', '#5e6363'];

function AnalyticsPage() {
    const [stats, setStats] = useState(null);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_BASE_URL}/analytics/`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStats(response.data);
        } catch (error) {
            console.error(error);
        }
    };

    if (!stats) return <Layout title="Analytics"><p>Loading...</p></Layout>;

    const pieData = Object.keys(stats.category_distribution).map(key => ({
        name: key,
        value: stats.category_distribution[key]
    }));

    const barData = stats.daily_distribution ? Object.keys(stats.daily_distribution).map(key => ({
        name: key,
        hours: stats.daily_distribution[key]
    })) : [];

    return (
        <Layout title="Analytics" subtitle="Identify patterns and improve your focus.">
            <div className="row g-4 mb-5">
                <div className="col-md-4">
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="zen-card text-center py-5">
                        <Activity className="text-sage mb-2 mx-auto" size={32} />
                        <h2 className="h1 serif">{Math.round(stats.completion_rate)}%</h2>
                        <p className="small text-muted mb-0">Completion Rate</p>
                    </motion.div>
                </div>
                <div className="col-md-4">
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="zen-card text-center py-5">
                        <TrendingUp className="text-terracotta mb-2 mx-auto" size={32} />
                        <h2 className="h1 serif">{stats.total_tasks}</h2>
                        <p className="small text-muted mb-0">Total Objectives</p>
                    </motion.div>
                </div>
                <div className="col-md-4">
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="zen-card text-center py-5">
                        <Sparkles className="text-sage mb-2 mx-auto" size={32} />
                        <h2 className="h1 serif">4</h2>
                        <p className="small text-muted mb-0">Day Focus Streak</p>
                    </motion.div>
                </div>
            </div>

            <div className="row g-5">
                <div className="col-lg-7">
                    <div className="zen-card">
                        <h3 className="h5 serif mb-5 d-flex align-items-center gap-2">
                            <Activity size={18} /> Daily Productivity (Hours)
                        </h3>
                        <div style={{ width: '100%', height: 300 }}>
                            <ResponsiveContainer>
                                <BarChart data={barData}>
                                    <XAxis dataKey="name" hide />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 20px rgba(0,0,0,0.05)' }}
                                    />
                                    <Bar dataKey="hours" fill="#2d4a44" radius={[6, 6, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                <div className="col-lg-5">
                    <div className="zen-card">
                        <h3 className="h5 serif mb-5 d-flex align-items-center gap-2">
                            <PieChartIcon size={18} /> Category Split
                        </h3>
                        <div style={{ width: '100%', height: 300 }}>
                            <ResponsiveContainer>
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}

export default AnalyticsPage;
