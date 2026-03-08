from sqlalchemy import create_engine, Column, Integer, String, Date, Boolean, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()

Base = declarative_base()

# Get connection string from environment or use a local SQLite DB for development
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    DATABASE_URL = "sqlite:///./smartplanner.db"

# Adjust for SQLite
if DATABASE_URL.startswith("sqlite"):
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
else:
    engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)

from contextlib import contextmanager
from sqlalchemy.orm import Session

def get_session():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    tasks = relationship("Task", back_populates="owner")

def create_tables():
    Base.metadata.create_all(bind=engine)

class Task(Base):
    __tablename__ = "tasks"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    title = Column(String, nullable=False)
    description = Column(String)
    due_date = Column(Date)
    priority = Column(Integer)
    estimated_hours = Column(Integer)
    completed = Column(Boolean, default=False)
    category = Column(String, default="General")
    owner = relationship("User", back_populates="tasks")