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
        <div className="zen-card h-100 d-flex flex-column justify-content-center p-4">
            <div className="d-flex align-items-center justify-content-between mb-3">
                <h4 className="serif m-0 d-flex align-items-center gap-2" style={{ fontSize: '1.2rem' }}>
                    {isBreak ? <Coffee size={18} className="text-sage" /> : <Focus size={18} className="text-terracotta" />}
                    {isBreak ? "Rest Mode" : "Focus Mode"}
                </h4>
                <div className="small text-muted">{isBreak ? "5 min" : "25 min"}</div>
            </div>

            <div className="text-center my-4">
                <div className="display-4 serif mb-2" style={{ fontSize: '3.5rem', fontWeight: 600, color: 'var(--text-main)' }}>
                    {formatTime(seconds)}
                </div>
                <div className="progress mt-2" style={{ height: '4px', backgroundColor: 'var(--border-color)' }}>
                    <motion.div
                        className={`progress-bar bg-${isBreak ? 'sage' : 'terracotta'}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        style={{ height: '4px' }}
                    />
                </div>
            </div>

            <div className="d-flex justify-content-center gap-3 mt-2">
                <button
                    onClick={toggleTimer}
                    className={`btn rounded-circle d-flex align-items-center justify-content-center ${isActive ? 'btn-outline-secondary' : 'btn-sage text-white'}`}
                    style={{ width: '50px', height: '50px' }}
                >
                    {isActive ? <Pause size={20} /> : <Play size={20} className="ms-1" />}
                </button>
                <button
                    onClick={resetTimer}
                    className="btn btn-outline-secondary rounded-circle d-flex align-items-center justify-content-center"
                    style={{ width: '50px', height: '50px' }}
                >
                    <RotateCcw size={20} />
                </button>
            </div>
        </div>
    );
};

export default PomodoroTimer;
