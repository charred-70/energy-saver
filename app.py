import hashlib
import sqlite3
from unittest import result
from fastapi import Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.responses import HTMLResponse, StreamingResponse
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm


import asyncio
import random
from datetime import datetime, timedelta
import uvicorn
import json
from pydantic import BaseModel
from jose import JWTError, jwt


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
        "*"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class LoginCredentials(BaseModel):
    username: str
    password: str

SECRET_KEY = "supersecretkey"  # Change in production
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")


def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    return {"username": username}

@app.get("/")
def index():
    return "index.html"

@app.websocket("/api")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    while True:
        rand = random.randint(1, 10)
        await websocket.send_json({"value": rand})
        await asyncio.sleep(3)

@app.post("/attempt_login")
async def check_credentials(loginz: LoginCredentials):
    data = loginz.model_dump()
    username = data.get("username")
    password = data.get("password")
    password = hashlib.sha256(password.encode()).hexdigest()
    
    #query the sqlite database for the username and password
    conn = sqlite3.connect('userdata.db')
    cur = conn.cursor()
    cur.execute("SELECT * FROM userdata WHERE username = ? AND password = ?", (username, password)) 
    # if result is not empty then the username and password are in db
    if cur.fetchall():
        token = create_access_token(
            data={"sub": username},
            expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
         )
        return {"success": True, "message": "Login successful", "token": token}
    else:
        return {"success": False, "message": "Invalid credentials"}
    
@app.post("/attempt_signup")
async def add_credentials(loginz: LoginCredentials):
    data = loginz.model_dump()
    username = data.get("username")
    password = data.get("password")
    password = hashlib.sha256(password.encode()).hexdigest()
    
    #query the sqlite database for the username and password
    conn = sqlite3.connect('userdata.db')
    cur = conn.cursor()
    if(username is None or password is None):
        return {"success": False, "message": "Username and password cannot be empty"}
    cur.execute("SELECT * FROM userdata WHERE username = ?", (username,))
   
    if(cur.fetchall()):
        return {"success": False, "message": "Username already exists"}
    
    cur.execute("INSERT INTO userdata (username, password) VALUES (?, ?)", (username, password))
    conn.commit()
    return {"success": True, "message": "Signup successful"}

@app.get("/protected")
def protected_route(current_user: dict = Depends(get_current_user)):
    return {"message": f"Hello {current_user['username']}"}