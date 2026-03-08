import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Coffee, Focus } from 'lucide-react';
import { motion } from 'framer-motion';

const PomodoroTimer = () => {
    const [seconds, setSeconds] = useState(25 * 60);
    const [isActive, setIsActive] = useState(false);
    const [isBreak, setIsBreak] = useState(false);

    useEffect(() => {
        let interval = null;
        if (isActive && seconds > 0) {
            interval = setInterval(() => {
                setSeconds((prevSeconds) => prevSeconds - 1);
            }, 1000);
        } else if (seconds === 0) {
            clearInterval(interval);
            setIsActive(false);
            // Alarm logic could go here
            if (!isBreak) {
                alert("Work session finished! Time for a break.");
                setSeconds(5 * 60);
                setIsBreak(true);
            } else {
                alert("Break finished! Let's focus again.");
                setSeconds(25 * 60);
                setIsBreak(false);
            }
        } else {
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [isActive, seconds, isBreak]);

    const toggleTimer = () => setIsActive(!isActive);

    const resetTimer = () => {
        setIsActive(false);
        setSeconds(isBreak ? 5 * 60 : 25 * 60);
    };

    const formatTime = (totalSeconds) => {
        const mins = Math.floor(totalSeconds / 60);
        const secs = totalSeconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const progress = ((isBreak ? 5 * 60 : 25 * 60) - seconds) / (isBreak ? 5 * 60 : 25 * 60) * 100;

    return (
        <div className="zen-card h-100 d-flex flex-column justify-content-between p-4" style={{ minHeight: '300px' }}>
            <div className="d-flex align-items-center justify-content-between">
                <h4 className="serif m-0 d-flex align-items-center gap-2" style={{ fontSize: '1.2rem' }}>
                    {isBreak ? <Coffee size={18} className="text-sage" /> : <Focus size={18} className="text-terracotta" />}
                    {isBreak ? "Rest Mode" : "Focus Mode"}
                </h4>
                <div className="small text-muted">{isBreak ? "5 min" : "25 min"}</div>
            </div>

            <div className="text-center py-4">
                <div className="display-4 serif mb-1" style={{ fontSize: '4.5rem', fontWeight: 600, color: 'var(--text-main)' }}>
                    {formatTime(seconds)}
                </div>
                <div className="progress mx-auto" style={{ height: '6px', backgroundColor: 'var(--border-color)', borderRadius: '10px', width: '85%' }}>
                    <motion.div
                        className={`progress-bar ${isBreak ? 'bg-sage' : 'bg-terracotta'}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        style={{ height: '6px', borderRadius: '10px' }}
                    />
                </div>
            </div>

            <div className="d-flex justify-content-center gap-3">
                <button
                    onClick={toggleTimer}
                    className={`btn rounded-circle d-flex align-items-center justify-content-center shadow-sm transition-all ${isActive ? 'btn-outline-secondary' : 'btn-sage'}`}
                    style={{ width: '60px', height: '60px', border: isActive ? '2px solid var(--border-color)' : 'none' }}
                    title={isActive ? "Pause" : "Start"}
                >
                    {isActive ? <Pause size={28} /> : <Play size={28} className="ms-1" />}
                </button>
                <button
                    onClick={resetTimer}
                    className="btn btn-outline-secondary rounded-circle d-flex align-items-center justify-content-center shadow-sm"
                    style={{ width: '60px', height: '60px', border: '2px solid var(--border-color)' }}
                    title="Reset"
                >
                    <RotateCcw size={24} />
                </button>
            </div>
        </div>
    );
};

export default PomodoroTimer;
