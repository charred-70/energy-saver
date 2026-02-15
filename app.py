from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.responses import HTMLResponse, StreamingResponse

import asyncio
import random
from datetime import datetime
import uvicorn
import json


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
