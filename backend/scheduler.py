from datetime import datetime, timedelta, time
from typing import List, Dict

def schedule_tasks(tasks: List[Dict], time_slots: List[Dict]) -> List[Dict]:
    # Sort tasks by due date
    tasks = sorted(tasks, key=lambda x: x["due_date"])
    # Sort slots by date and start time
    slots = sorted(time_slots, key=lambda x: (x["date"], x["start"]))
    
    schedule = []
    task_index = 0

    for slot in slots:
        if task_index >= len(tasks):
            break
            
        slot_date = datetime.strptime(slot["date"], "%Y-%m-%d").date()
        block_start = datetime.strptime(slot["start"], "%H:%M").time()
        block_end = datetime.strptime(slot["end"], "%H:%M").time()
        
        current_block_time = datetime.combine(datetime.today(), block_start)
        end_block_time = datetime.combine(datetime.today(), block_end)
        
        if end_block_time <= current_block_time:
            end_block_time += timedelta(days=1)

        hours_in_block = (end_block_time - current_block_time).total_seconds() / 3600.0

        while task_index < len(tasks) and hours_in_block > 0.01:
            task = tasks[task_index]
            
            task_hours = min(task["estimated_hours"], hours_in_block)
            if task_hours <= 0:
                task_index += 1
                continue
                
            end_task_time = current_block_time + timedelta(hours=task_hours)
            
            schedule.append({
                "date": slot["date"],
                "task": task["title"],
                "hours_allocated": round(task_hours, 1),
                "time_block": [current_block_time.strftime("%H:%M"), end_task_time.strftime("%H:%M")],
                "is_late": task["due_date"] < slot_date
            })
            
            task["estimated_hours"] -= task_hours
            hours_in_block -= task_hours
            current_block_time = end_task_time
            
            if task["estimated_hours"] <= 0.01:
                task_index += 1

    return schedule