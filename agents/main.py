"""FastAPI server for the Python ADK multi-agent system."""

import sys
import os

# Add the agents directory to the Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional

from config import PORT
from router import route_message

app = FastAPI(
    title="Ashram Shala Pathraj - ADK Multi-Agent System",
    description="AI-powered multi-agent system for school management queries",
    version="1.0.0",
)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ChatRequest(BaseModel):
    """Request model for chat endpoint."""
    message: str
    language: Optional[str] = "en"


class ChatResponse(BaseModel):
    """Response model for chat endpoint."""
    response: str
    agent: str


@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """Process a chat message and route to the appropriate agent."""
    result = await route_message(request.message, request.language or "en")
    return ChatResponse(**result)


@app.get("/health")
async def health():
    """Health check endpoint."""
    return {"status": "healthy", "service": "adk-multi-agent", "version": "1.0.0"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=PORT)
