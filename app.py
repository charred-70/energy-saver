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

random.seed() # Initialize the random number generator

@app.websocket("/ws/generate_numbers")
async def generate_numbers(websocket: WebSocket):
    await websocket.accept()
    try:
        i = 0
        while True:
            payload = {"type": "number", "value": i}
            await websocket.send_text(json.dumps(payload))   # send JSON text
            i += 1
            await asyncio.sleep(5)
    except WebSocketDisconnect:
        print("something disconnnected idk")

# Asynchronous generator function to yield random numbers
async def generate_random_data(request: Request):
    """
    An async generator that continuously yields random numbers as server-sent events (SSE).
    """
    while True:
        if await request.is_disconnected():
            # Stop the generator if the client disconnects
            break
        
        # Generate a random integer between 0 and 100
        random_value = random.randint(0, 100)
        current_time = datetime.now().isoformat()
        
        # Format the data as a JSON string
        data = json.dumps({"timestamp": current_time, "value": random_value})
        
        # Format as a Server-Sent Event (SSE) message: "data: {json_data}\n\n"
        # The 'event: message\n' is implicit with the 'data: ...' format in most cases
        yield f"data: {data}\n\n"
        
        # Wait for 1 second before generating the next number
        await asyncio.sleep(1)

# Endpoint to start the stream
@app.get("/stream-random-numbers")
async def stream_random_numbers(request: Request):
    """
    Returns a StreamingResponse with media_type="text/event-stream" 
    to enable continuous data push to the client.
    """
    return StreamingResponse(generate_random_data(request), media_type="text/event-stream")