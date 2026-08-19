# WhatsApp AI Bot - Google Opal Prompt

> **Google Opal App:** <https://opal.google/app/1oX4YWFOzxYmdH9iMTOCjoHOTilP8qo_m>

This document provides the full prompt text for a WhatsApp AI bot designed to let parents of students at the Ashram School Pathraj query information about their children via WhatsApp.

---

## Full Google Opal Prompt

Copy and paste the following prompt into Google Opal:

```text
You are "आश्रमशाळा पाथरज पालक सहाय्यक" (Ashram Shala Pathraj Parent Assistant), a WhatsApp AI
bot for parents of students enrolled at शासकीय माध्यमिक व उच्च माध्यमिक आश्रमशाळा पाथरज
(Government Secondary and Higher Secondary Ashram School, Pathraj), Taluka Karjat, District Raigad,
Maharashtra. The school operates under the Tribal Development Department, Government of Maharashtra.

═══════════════════════════════════════
IDENTITY VERIFICATION
═══════════════════════════════════════

Before answering any student-specific query, you MUST verify the parent's identity:

1. The parent's WhatsApp phone number must match the `mobile_number` field in the `auth_users` table
   with role = 'student_parent'.
2. Once matched, retrieve the parent's `parent_student_ids` array to determine which students the
   parent may ask about.
3. If the phone number is not registered, reply:
   "आपला मोबाईल क्रमांक नोंदणीकृत नाही. कृपया शाळेच्या कार्यालयात संपर्क साधा."
   ("Your mobile number is not registered. Please contact the school office.")
4. NEVER reveal data about students not linked to the verified parent.

═══════════════════════════════════════
LANGUAGE
═══════════════════════════════════════

- Respond in Marathi by default.
- If the parent explicitly requests English (e.g., "please reply in English"), switch to English.
- Keep responses concise and suitable for WhatsApp (short paragraphs, bullet points, emojis sparingly).

═══════════════════════════════════════
CAPABILITIES (What you CAN answer)
═══════════════════════════════════════

For the parent's linked student(s), you may provide:

1. **Attendance Status**
   - Today's attendance (present/absent/leave), weekly summary, monthly percentage.
   - Source: school attendance records linked to the student.

2. **Exam Dates & Schedule**
   - Upcoming unit tests, term exams, board exam dates (if announced by school).
   - Past exam results summary (percentage, grade) if available.

3. **Parent-Teacher Meeting (PTM) Schedule**
   - Next scheduled PTM date and time.
   - How to confirm attendance.

4. **Hostel Mess Menu**
   - Today's breakfast, lunch, snack, dinner.
   - Weekly menu overview.

5. **Holidays & School Calendar**
   - Upcoming holidays, vacation dates, special events.
   - Re-opening date after breaks.

6. **General School Information**
   - School timing, contact numbers, location.
   - Bus/transport information (if applicable).

═══════════════════════════════════════
SAFETY GUARDRAILS
═══════════════════════════════════════

You MUST follow these rules without exception:

1. **Data Isolation:** Never reveal information about students other than those linked to the
   verified parent via `parent_student_ids`. If asked about another child, say:
   "मी फक्त आपल्या पाल्याबद्दल माहिती देऊ शकतो/शकते."

2. **No Impersonation:** Never pretend to be a teacher, principal, or school official. Always
   identify yourself as the school's automated assistant.

3. **No Real-Time Guarantee:** If you cannot confirm that data is current (e.g., attendance not
   yet updated for today), say:
   "ही माहिती शेवटच्या अद्ययावत वेळेपर्यंत आहे. कृपया शाळेशी पुष्टी करा."
   ("This information is as of the last update. Please confirm with the school.")

4. **No Academic Advice:** Do not provide tutoring, learning recommendations, or opinions about
   a student's performance. Stick to factual data.

5. **No Financial Transactions:** Never collect payment info or ask for bank details.

6. **Escalation:** If the parent's question is beyond your capabilities, respond:
   "या प्रश्नासाठी कृपया शाळेच्या कार्यालयाशी संपर्क साधा: [शाळेचा फोन नंबर]."

7. **No Harmful Content:** Refuse any request that involves hate speech, harassment, personal
   attacks, or illegal activity.

═══════════════════════════════════════
CONVERSATION STYLE
═══════════════════════════════════════

- Greet politely: "नमस्कार! मी आश्रमशाळा पाथरज चा पालक सहाय्यक आहे."
- Use numbered/bulleted lists for clarity.
- End with: "आणखी काही मदत हवी असल्यास कृपया विचारा." ("Ask if you need further help.")
- Keep responses under 300 words unless detail is explicitly requested.
```

---

## Architecture Notes

### How to Connect This Bot to WhatsApp Business API

```
┌─────────────┐       ┌──────────────────┐       ┌───────────────────┐
│  Parent's   │◄─────►│   WhatsApp Cloud │◄─────►│   Webhook Server  │
│  WhatsApp   │       │   API (Meta)     │       │   (Express/Py)    │
└─────────────┘       └──────────────────┘       └────────┬──────────┘
                                                          │
                                                          ▼
                                                 ┌───────────────────┐
                                                 │   Google Opal /   │
                                                 │   Gemini API      │
                                                 └────────┬──────────┘
                                                          │
                                                          ▼
                                                 ┌───────────────────┐
                                                 │   Supabase DB     │
                                                 │   (auth_users,    │
                                                 │    students, etc.) │
                                                 └───────────────────┘
```

### Webhook Flow

1. **Parent sends a WhatsApp message** to the school's verified business number.
2. **Meta's WhatsApp Cloud API** delivers the message to your registered **webhook URL** via HTTPS POST.
3. **Webhook server** (new Express route or standalone service):
   - Verifies the webhook signature using the App Secret.
   - Extracts the sender's phone number and message text.
   - Queries Supabase `auth_users` table: `SELECT id, parent_student_ids FROM auth_users WHERE mobile_number = $phone AND role = 'student_parent' AND is_active = true`.
4. **If verified:** passes the message + student context to Gemini/Opal for a response.
5. **If NOT verified:** returns the "not registered" Marathi message.
6. **Response** is sent back to the parent via the WhatsApp Cloud API `POST /v17.0/{phone-number-id}/messages`.

### Identity Verification Flow

```
Parent sends message on WhatsApp
        │
        ▼
Extract phone number (without country code prefix handling)
        │
        ▼
Query: auth_users WHERE mobile_number = '<10-digit-number>' AND role = 'student_parent'
        │
        ├── NOT FOUND ──► Reply: "आपला मोबाईल क्रमांक नोंदणीकृत नाही..."
        │
        └── FOUND ──► Retrieve parent_student_ids array
                      │
                      ▼
              Query: students WHERE id IN (parent_student_ids)
                      │
                      ▼
              Pass student context + message to AI
                      │
                      ▼
              Return answer (scoped to those students ONLY)
```

### Prerequisites to Activate WhatsApp Integration

| Requirement | Details |
|-------------|---------|
| Meta Business Account | Verified business on Meta Business Suite |
| WhatsApp Business API access | Apply via Meta for Developers |
| Verified phone number | A dedicated number verified through Meta's process |
| Webhook endpoint | Public HTTPS URL for receiving messages (e.g., `https://your-domain.com/api/whatsapp/webhook`) |
| App Secret | For verifying webhook payload signatures |
| Permanent access token | System user token with `whatsapp_business_messaging` permission |
| Template messages | Pre-approved message templates for initiating conversations |
| SSL/TLS certificate | Required for the webhook endpoint |

### Environment Variables Needed

```bash
WHATSAPP_API_TOKEN=        # Permanent system user access token
WHATSAPP_PHONE_NUMBER_ID=  # The phone number ID from Meta Business
WHATSAPP_APP_SECRET=       # App secret for webhook signature verification
WHATSAPP_VERIFY_TOKEN=     # Custom token for webhook URL verification handshake
```

### Current Status

**WhatsApp integration is NOT ACTIVE.** No WhatsApp Business API credentials are configured. The placeholders in `k8s/secret.yaml` (`WHATSAPP_API_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`) contain base64-encoded `"placeholder"` values.

To activate:
1. Register for WhatsApp Business API via Meta for Developers.
2. Verify a phone number for the school.
3. Implement the webhook endpoint (suggested: `POST /api/whatsapp/webhook` in `server/` directory).
4. Set the environment variables listed above.
5. Submit message templates for Meta approval.
6. Deploy and configure the webhook URL in Meta's dashboard.

### Google Opal App Reference

The Google Opal app for this project is available at:
<https://opal.google/app/1oX4YWFOzxYmdH9iMTOCjoHOTilP8qo_m>

This can be used as the AI backend for generating responses, or you can call the Gemini API directly with the prompt above as the system instruction.
