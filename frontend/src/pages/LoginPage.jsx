import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck } from 'lucide-react';

const API_BASE_URL = window.location.hostname === 'localhost' ? 'http://localhost:8500' : '';

function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isRegister, setIsRegister] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (isRegister) {
                await axios.post(`${API_BASE_URL}/register`, { username, password });
                setIsRegister(false);
                alert("Account created! Please login.");
            } else {
                const formData = new FormData();
                formData.append('username', username);
                formData.append('password', password);

                const response = await axios.post(`${API_BASE_URL}/login`, formData);
                localStorage.setItem('token', response.data.access_token);
                localStorage.setItem('username', username);
                navigate('/');
            }
        } catch (error) {
            console.error(error);
            const msg = error.response?.data?.detail || error.message || "Something went wrong";
            alert(`Error: ${msg}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            width: '100vw',
            backgroundColor: 'var(--bg-color)',
            position: 'fixed',
            top: 0,
            left: 0,
            zIndex: 9999
        }}>
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="zen-card"
                style={{ width: '400px', marginBottom: 0 }}
            >
                <div className="text-center mb-5">
                    <div className="bg-sage text-white rounded-circle d-inline-flex p-3 mb-3">
                        <ShieldCheck size={32} />
                    </div>
                    <h2 className="serif">{isRegister ? "Join SmartPlanner" : "Welcome Back"}</h2>
                    <p className="text-muted small">Enter your details to continue</p>
                </div>

                <form onSubmit={handleLogin}>
                    <div className="form-group">
                        <label className="form-label">Username</label>
                        <input
                            type="text"
                            className="zen-input"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group mb-5">
                        <label className="form-label">Password</label>
                        <input
                            type="password"
                            className="zen-input"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button className="zen-button-primary mb-3" disabled={loading}>
                        {loading ? "Processing..." : (isRegister ? "Create Account" : "Sign In")}
                    </button>
                </form>

                <p className="text-center small text-muted">
                    {isRegister ? "Already have an account?" : "Don't have an account?"}{" "}
                    <span
                        className="text-sage fw-bold cursor-pointer"
                        onClick={() => setIsRegister(!isRegister)}
                        style={{ cursor: 'pointer' }}
                    >
                        {isRegister ? "Login here" : "Register here"}
                    </span>
                </p>

                <div className="text-center mt-4 pt-4 border-top">
                    <span
                        className="text-muted small cursor-pointer hover-underline"
                        onClick={() => navigate('/')}
                        style={{ cursor: 'pointer' }}
                    >
                        ← Back to Home
                    </span>
                </div>
            </motion.div>
        </div>
    );
}

export default LoginPage;
