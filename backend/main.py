from fastapi import FastAPI, HTTPException, Depends, status
from pydantic import BaseModel
from datetime import date, time, datetime, timedelta
from backend.db_models import Task, create_tables, get_session, User # Assuming User model is added to db_models
from sqlalchemy.orm import Session
from typing import List, Tuple
from backend.scheduler import schedule_tasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from passlib.context import CryptContext


# Auth Configuration
SECRET_KEY = "ZEN_SECRET_KEY" # In a real app, use environment variables
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 300

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For production, replace with the actual frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

create_tables()

class UserCreate(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TaskCreate(BaseModel):
    title: str
    description: str = ""
    due_date: date
    priority: int
    estimated_hours: int
    category: str = "General"

class TaskInput(BaseModel):
    title: str
    due_date: date
    estimated_hours: int

class TimeSlot(BaseModel):
    date: date
    start: time
    end: time

class ScheduleRequest(BaseModel):
    tasks: List[TaskInput]
    time_slots: List[TimeSlot]

class TaskUpdate(BaseModel):
    completed: bool = None
    title: str = None
    category: str = None

class ScheduledSlot(BaseModel):
    date: date
    task: str
    hours_allocated: int
    time_block: tuple[time, time]

class ScheduleResponse(BaseModel):
    plan: List[ScheduledSlot]

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_session)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    user = db.query(User).filter(User.username == username).first()
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    return user

@app.post("/register")
def register(user: UserCreate, db: Session = Depends(get_session)):
    print(f"Registration attempt for: {user.username}")
    db_user = db.query(User).filter(User.username == user.username).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    
    try:
        hashed_password = pwd_context.hash(user.password)
        new_user = User(username=user.username, hashed_password=hashed_password)
        db.add(new_user)
        db.commit()
        print("User created successfully")
        return {"message": "User created successfully"}
    except Exception as e:
        print(f"Error creating user: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_session)):
    user = db.query(User).filter(User.username == form_data.username).first()
    if not user or not pwd_context.verify(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect username or password")
    
    access_token = jwt.encode({"sub": user.username}, SECRET_KEY, algorithm=ALGORITHM)
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/tasks/")
def get_tasks(current_user: User = Depends(get_current_user), db: Session = Depends(get_session)):
    return db.query(Task).filter(Task.user_id == current_user.id).all()

@app.post("/tasks/")
def create_task(task: TaskCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_session)):
    db_task = Task(**task.dict(), user_id=current_user.id)
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return {"message": "Task created", "task_id": db_task.id}

@app.patch("/tasks/{task_id}")
def update_task(task_id: int, task_data: TaskUpdate, db: Session = Depends(get_session)):
    db_task = db.query(Task).filter(Task.id == task_id).first()
    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    for var, value in task_data.dict(exclude_unset=True).items():
        setattr(db_task, var, value)
    
    db.commit()
    return {"message": "Task updated"}

@app.delete("/tasks/{task_id}")
def delete_task(task_id: int, db: Session = Depends(get_session)):
    db_task = db.query(Task).filter(Task.id == task_id).first()
    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    db.delete(db_task)
    db.commit()
    return {"message": "Task deleted"}

@app.get("/analytics/")
def get_analytics(current_user: User = Depends(get_current_user), db: Session = Depends(get_session)):
    tasks = db.query(Task).filter(Task.user_id == current_user.id).all()
    completed = len([t for t in tasks if t.completed])
    total = len(tasks)
    
    category_hours = {}
    daily_hours = {"Mon": 0, "Tue": 0, "Wed": 0, "Thu": 0, "Fri": 0, "Sat": 0, "Sun": 0}
    days_map = {0: "Mon", 1: "Tue", 2: "Wed", 3: "Thu", 4: "Fri", 5: "Sat", 6: "Sun"}

    for t in tasks:
        category_hours[t.category] = category_hours.get(t.category, 0) + t.estimated_hours
        day_str = days_map[t.due_date.weekday()]
        daily_hours[day_str] += t.estimated_hours
        
    return {
        "completion_rate": (completed / total * 100) if total > 0 else 0,
        "total_tasks": total,
        "completed_tasks": completed,
        "category_distribution": category_hours,
        "daily_distribution": daily_hours
    }

@app.get("/ai-coach/")
def ai_coach(current_user: User = Depends(get_current_user), db: Session = Depends(get_session)):
    tasks = db.query(Task).filter(Task.user_id == current_user.id, Task.completed == False).all()
    
    if not tasks:
        return {"advice": "Your plate is clear! Take this time to recharge or explore a new hobby."}
        
    # Analyze workload
    urgency_count = len([t for t in tasks if t.priority == 3])
    
    if urgency_count > 3:
        return {"advice": "Heads up! You have several high-priority tasks due soon. I suggest focusing on the shortest one first to gain momentum, and clearing your Friday evening for rest to avoid burnout."}
    
    return {"advice": "Your schedule looks balanced. Try to tackle your 'Deep Work' tasks in the morning when your focus is highest."}

@app.post("/generate-plan/", response_model=ScheduleResponse)
def generate_plan(request: ScheduleRequest):
    # Mock plan logic: just assign 2h/day from start_date onwards
    plan = []
    current_date = request.availability.start_date
    for task in request.tasks:
        hours_left = task.estimated_hours
        while hours_left > 0 and current_date <= request.availability.end_date:
            hours_today = min(request.availability.daily_available_hours, hours_left)
            time_block = request.availability.preferred_time_blocks[0]  # Just use the first block for mock
            plan.append({
                "date": current_date,
                "task": task.title,
                "hours_allocated": hours_today,
                "time_block": time_block
            })
            hours_left -= hours_today
            current_date += timedelta(days=1)
    return {"plan": plan}

@app.post("/generate-schedule/")
def generate_schedule(request: ScheduleRequest):
    tasks = [t.dict() for t in request.tasks]
    slots = [{"date": s.date.isoformat(), "start": s.start.strftime("%H:%M"), "end": s.end.strftime("%H:%M")} for s in request.time_slots]
    plan = schedule_tasks(tasks, slots)
    return {"plan": plan}

@app.get("/test-db")
def test_db(db: Session = Depends(get_session)):
    try:
        result = db.query(Task).first()
        return {
            "db_connection": "successful",
            "sample_task": result.title if result else "No tasks found"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    