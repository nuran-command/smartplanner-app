from datetime import datetime, timedelta, time
from typing import List, Dict

def schedule_tasks(tasks: List[Dict], availability: Dict) -> List[Dict]:
    # Sort tasks by due date
    tasks = sorted(tasks, key=lambda x: x["due_date"])
    schedule = []

    current_date = datetime.strptime(availability["start_date"], "%Y-%m-%d").date()
    end_date = datetime.strptime(availability["end_date"], "%Y-%m-%d").date()
    daily_hours = availability["daily_available_hours"]
    time_blocks = [
        (datetime.strptime(start, "%H:%M").time(), datetime.strptime(end, "%H:%M").time())
        for start, end in availability["preferred_time_blocks"]
    ]

    task_index = 0
    while current_date <= end_date and task_index < len(tasks):
        hours_left_today = daily_hours
        for block_start, block_end in time_blocks:
            if task_index >= len(tasks):
                break

            task = tasks[task_index]
            if task["due_date"] < current_date:
                task_index += 1
                continue

            task_hours = min(task["estimated_hours"], hours_left_today)
            if task_hours > 0:
                schedule.append({
                    "date": current_date.isoformat(),
                    "task": task["title"],
                    "hours_allocated": task_hours,
                    "time_block": [block_start.strftime("%H:%M"), 
                                   (datetime.combine(datetime.today(), block_start) + timedelta(hours=task_hours)).time().strftime("%H:%M")]
                })
                task["estimated_hours"] -= task_hours
                hours_left_today -= task_hours

            if task["estimated_hours"] <= 0:
                task_index += 1

        current_date += timedelta(days=1)

    return schedule