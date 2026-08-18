"""FastAPI server for the Python ADK multi-agent system."""

import sys
import os

# Add the agents directory to the Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, field_validator
from typing import Optional

from config import PORT
from router import route_message

# Maximum message length (matches the Express server's MAX_CHAT_MESSAGE_LENGTH)
MAX_MESSAGE_LENGTH = 1000

app = FastAPI(
    title="Ashram Shala Pathraj - ADK Multi-Agent System",
    description="AI-powered multi-agent system for school management queries",
    version="1.0.0",
)

# Enable CORS for server-to-server communication from Express proxy.
# Note: allow_credentials is omitted (defaults to False) because wildcard
# origins with credentials=True is rejected by browsers per the Fetch spec.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class ChatRequest(BaseModel):
    """Request model for chat endpoint."""
    message: str
    language: Optional[str] = "en"

    @field_validator("message")
    @classmethod
    def validate_message_length(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("Message must not be empty")
        if len(v) > MAX_MESSAGE_LENGTH:
            raise ValueError(
                f"Message too long. Maximum {MAX_MESSAGE_LENGTH} characters allowed."
            )
        return v


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
