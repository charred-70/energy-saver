import hashlib
import sqlite3
from unittest import result
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.responses import HTMLResponse, StreamingResponse

import asyncio
import random
from datetime import datetime
import uvicorn
import json
from pydantic import BaseModel


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
    result = cur.fetchall()
    print(result)    
    # if result is not empty then the username and password are in db
    if result is not None and len(result) > 0:
        return {"success": True, "message": "Login successful"}
    else:
        return {"success": False, "message": "Invalid credentials"}