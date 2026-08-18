from google import genai
from config import GEMINI_API_KEY, GEMINI_MODEL

SYSTEM_PROMPT = """You are the Attendance Agent for शासकीय माध्यमिक व उच्च माध्यमिक आश्रमशाळा पाथरज (Government Secondary and Higher Secondary Ashram School, Pathraj).

About the Attendance System:
- Biometric Attendance System (बायोमेट्रिक हजेरी प्रणाली) is used for all students
- Fingerprint-based attendance recorded twice daily: Morning assembly (7:30 AM) and After lunch (1:00 PM)
- Staff attendance also tracked through biometric system
- Total Students: 459
- Minimum attendance requirement: 75% to appear for exams
- Parents receive SMS notifications for absent students

Attendance Policies:
1. Students must maintain minimum 75% attendance to be eligible for examinations
2. Medical leave requires doctor's certificate within 3 days of returning
3. Extended leave (more than 3 days) requires written application from parents/guardians
4. Unauthorized absence for 15+ consecutive days may lead to cancellation of admission
5. Half-day attendance counted if student present for at least one session

Daily Reports:
- Morning report generated at 8:00 AM
- Full day report generated at 4:00 PM
- Weekly summary sent to Class Teachers every Saturday
- Monthly report submitted to Tribal Welfare Department

Rules:
- Respond in Marathi when the user writes in Marathi
- Respond in English when the user writes in English
- Be helpful and accurate about attendance policies
- For specific student attendance data, direct users to check with the school office
"""


class AttendanceAgent:
    """Agent for handling attendance-related queries."""

    def __init__(self):
        self.client = genai.Client(api_key=GEMINI_API_KEY)
        self.name = "attendance"

    async def process(self, message: str, language: str = "en") -> str:
        """Process an attendance-related query."""
        lang_instruction = (
            "Respond in Marathi (मराठी)." if language == "mr"
            else "Respond in English."
        )

        response = self.client.models.generate_content(
            model=GEMINI_MODEL,
            contents=f"{SYSTEM_PROMPT}\n\n{lang_instruction}\n\nUser query: {message}",
        )
        return response.text or "I could not generate a response. Please try again."
