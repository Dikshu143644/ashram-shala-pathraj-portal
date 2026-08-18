"""Intent detection and routing logic for the multi-agent system."""

from agents import (
    AdmissionAgent,
    AttendanceAgent,
    HostelAgent,
    AcademicAgent,
    GeneralAgent,
)

# Keyword mappings for intent detection
ADMISSION_KEYWORDS = [
    "admission", "admit", "enroll", "enrollment", "eligibility", "document",
    "application", "apply", "fee", "fees", "scholarship", "प्रवेश", "अर्ज",
    "कागदपत्रे", "पात्रता", "शिष्यवृत्ती", "फी", "दाखला", "नोंदणी",
    "admission process", "how to apply", "requirements",
]

ATTENDANCE_KEYWORDS = [
    "attendance", "absent", "present", "leave", "biometric", "हजेरी",
    "उपस्थिती", "गैरहजर", "रजा", "बायोमेट्रिक", "daily report",
    "attendance report", "absent today", "present today",
]

HOSTEL_KEYWORDS = [
    "hostel", "bed", "mess", "food", "room", "warden", "sick bay",
    "breakfast", "lunch", "dinner", "wing", "वसतिगृह", "भोजन",
    "जेवण", "नाश्ता", "खोली", "गृहपाल", "बेड", "mess timing",
    "hostel rules", "sick", "medical",
]

ACADEMIC_KEYWORDS = [
    "exam", "examination", "result", "marks", "subject", "syllabus",
    "timetable", "schedule", "grade", "board", "ssc", "hsc", "standard",
    "class", "परीक्षा", "निकाल", "गुण", "विषय", "अभ्यासक्रम",
    "वेळापत्रक", "वर्ग", "इयत्ता", "academic", "calendar",
]

# Initialize agents
_admission_agent = AdmissionAgent()
_attendance_agent = AttendanceAgent()
_hostel_agent = HostelAgent()
_academic_agent = AcademicAgent()
_general_agent = GeneralAgent()


def detect_intent(message: str) -> str:
    """Detect the intent of a message and return the agent name to route to."""
    message_lower = message.lower()

    # Score each category
    scores = {
        "admission": sum(1 for kw in ADMISSION_KEYWORDS if kw in message_lower),
        "attendance": sum(1 for kw in ATTENDANCE_KEYWORDS if kw in message_lower),
        "hostel": sum(1 for kw in HOSTEL_KEYWORDS if kw in message_lower),
        "academic": sum(1 for kw in ACADEMIC_KEYWORDS if kw in message_lower),
    }

    # Find the category with the highest score
    max_score = max(scores.values())

    if max_score == 0:
        return "general"

    # Return the category with the highest score
    for category, score in scores.items():
        if score == max_score:
            return category

    return "general"


def get_agent(intent: str):
    """Get the appropriate agent based on intent."""
    agents = {
        "admission": _admission_agent,
        "attendance": _attendance_agent,
        "hostel": _hostel_agent,
        "academic": _academic_agent,
        "general": _general_agent,
    }
    return agents.get(intent, _general_agent)


async def route_message(message: str, language: str = "en") -> dict:
    """Route a message to the appropriate agent and return the response."""
    intent = detect_intent(message)
    agent = get_agent(intent)
    response = await agent.process(message, language)
    return {
        "response": response,
        "agent": agent.name,
    }
