from datetime import date
import sys
sys.path.append("./backend")
from scheduler import schedule_tasks

tasks = [
    {"title": "Task 1", "due_date": date(2026, 3, 10), "estimated_hours": 3},
    {"title": "Task 2", "due_date": date(2026, 3, 11), "estimated_hours": 5}
]
avail = {
    "start_date": "2026-03-08",
    "end_date": "2026-03-15",
    "daily_available_hours": 8,
    "preferred_time_blocks": [("09:00", "17:00")]
}

print(schedule_tasks(tasks, avail))
