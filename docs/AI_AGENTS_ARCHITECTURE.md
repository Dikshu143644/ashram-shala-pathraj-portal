# AI Voice Agent & WhatsApp Bot Architecture

## Calling Agent (Voice AI)
- Automated parent notifications via voice calls
- Admission inquiry voice bot (Marathi + English)
- Uses Gemini for NLP + text-to-speech

## WhatsApp AI Bot
- Parent authentication via phone number
- Attendance queries, exam schedules, hostel info
- Multi-turn conversation with memory
- Marathi-first, English fallback

## Architecture
- FastAPI Python microservice
- Gemini API for NLP/conversation
- Supabase for student data
- WebSocket for real-time chat

Last updated: 2026-08-22T18:23:38Z

