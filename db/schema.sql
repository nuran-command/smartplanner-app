CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username TEXT UNIQUE,
    password TEXT
);

CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    title TEXT NOT NULL,
    description TEXT,
    due_date DATE,
    priority INTEGER CHECK (priority BETWEEN 1 AND 5),
    estimated_hours INTEGER,
    completed BOOLEAN DEFAULT FALSE
);

CREATE TABLE schedule (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    task_id INTEGER REFERENCES tasks(id),
    scheduled_time TIMESTAMP
);

CREATE TABLE reminders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    task_id INTEGER REFERENCES tasks(id),
    remind_at TIMESTAMP
);