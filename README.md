# SmartPlanner 
> *Clarity in Motion. A premium, Zen-inspired productivity companion designed for high-performance students.*

SmartPlanner is an intelligent scheduling application that goes beyond a standard to-do list. By leveraging a custom allocation algorithm and an AI-driven coaching module, it takes your pending tasks (called "Objectives") and your available free time, and automatically generates an optimized, timeline-based study schedule. It also visualizes your progress via built-in analytics and supports `.ics` sync for pulling in real-world university timetables.

##  Key Features
- **AI Study Coach**: Provides contextual, actionable insights on your workload, alerting you if burnout is near or if you need to prioritize high-urgency tasks.
- **Smart Timeline Generator**: Define your available free time (Time Slots) and let the backend `schedule_tasks` algorithm slice and allocate your estimated task hours logically across the days.
- **University ICS Sync**: Import your Canvas/Moodle `.ics` syllabus files. The integrated parser will read your calendar events and automatically populate them as Objectives.
- **Advanced Real-Time Analytics**: Built-in dashboards showing your total completion rate, category breakdown (Uni, Work, Hobby, Personal), and dynamically calculated study-hours per day of the week.
- **Zen-Inspired UI/UX**: Custom `Fraunces` and `Inter` typography, glass-morphic elements, completely responsive sidebar layouts, and smooth animations powered by Framer Motion.
- **Multi-Theming**: Full integration with `localStorage` state management, supporting Light (Zen), Dark (Midnight), and Monochrome (Focused) modes globally via CSS variables.

##  Tech Stack
- **Frontend**: React 19, Vite, Bootstrap (for flexible grid layout), Framer Motion (for smooth micro-interactions), Lucide-React (icons), Recharts.
- **Backend**: Python, FastAPI (for blazing fast API performance), SQLAlchemy (ORM for DB interactions), SQLite (Database), Passlib/Bcrypt & python-jose (JWT Auth).

##  Project Architecture
```text
smartplanner-app/
├── backend/
│   ├── main.py           # Core FastAPI application & routes
│   ├── db_models.py      # SQLAlchemy models (User, Task, etc.)
│   └── scheduler.py      # Custom time-blocking algorithm 
├── frontend/
│   ├── src/
│   │   ├── components/   # Reusable UI (Sidebar, Layout wraps)
│   │   ├── pages/        # Dashboard, Analytics, Profile, Settings, Cal
│   │   └── App.jsx       # Routing & Protected Route wrappers
│   └── index.html        # Vite entry point
├── package.json          # Concurrently scripts (runs FE & BE together)
└── README.md             # Project documentation
```

##  Quick Start (One Command)

### Prerequisites
Make sure you have Node.js and Python 3.9+ installed on your system.

### Installation

1. Create a python virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On MacOS/Linux
```

2. Install the backend requirements:
```bash
pip install -r requirements.txt
```

3. Install the frontend dependencies (run this in the root repo, it handles everything):
```bash
npm install
cd frontend && npm install && cd ..
```

### Running the App Locally
We use `concurrently` to run both the React dev server and the FastAPI backend at the exact same time. From the root directory, simply run:

```bash
npm start
```

* **Frontend**: `http://localhost:5000`
* **Backend API Docs**: `http://localhost:8500/docs`

##  Future Enhancements (Roadmap)
- **Live Gemini API Integration**: The currently mocked AI coach will be wired up to actual LLMs to analyze user study habits.
- **Push Notifications**: Integrating browser Notification APIs to alert when a scheduled "Smart Timeline" block is about to begin.
- **Drag and Drop Priority**: Reordering pending tasks via `framer-motion` visually.
