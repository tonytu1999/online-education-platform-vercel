# Backend API Documentation

Base URL: `http://localhost:3000/api`
https://online-education-platform-backend-kappa.vercel.app/api/

## Authentication

All protected routes require an `Authorization` header with a Bearer token:
`Authorization: Bearer <Your_JWT_Token>`

### 1. Register User
- **URL**: `/auth/register`
- **Method**: `POST`
- **Body**: 
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "1234567890",
    "password": "password123",
    "role": "STUDENT" // Available Roles: STUDENT, PARENT, TEACHER, SCHOOL_ADMIN
  }
  ```
- **Success Response**: `201 Created` - `{ "message": "User registered successfully", "userId": "uuid" }`

### 2. Login User
- **URL**: `/auth/login`
- **Method**: `POST`
- **Body**: 
  ```json
  {
    "email": "john@example.com",
    "password": "password123"
  }
  ```
- **Success Response**: `200 OK` - `{ "token": "jwt-token", "user": { ... } }`

### 3. Select Role
- **URL**: `/auth/select-role`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "userId": "user-uuid",
    "role": "STUDENT"
  }
  ```
- **Success Response**: `200 OK` - `{ "message": "Role updated successfully", "userId": "user-uuid", "role": "STUDENT" }`

---

## Users

### 1. Get Student UUID by Email
- **URL**: `/users/uuid-by-email?email=student@example.com`
- **Method**: `GET`
- **Auth**: Required
- **Success Response**: `200 OK` - `{ "id": "student-uuid" }`

### 2. Get Profile
- **URL**: `/users/profile`
- **Method**: `GET`
- **Auth**: Required
- **Success Response**: `200 OK` - User object with `id`, `name`, `email`, `phone`, and `role`

### 3. Bind Child (Parent Only)
- **URL**: `/users/bind-child`
- **Method**: `POST`
- **Auth**: Required (Role: `PARENT`)
- **Body**: 
  ```json
  { "childId": "uuid-of-student" }
  ```
- **Success Response**: `200 OK` - `{ "message": "Child bound successfully" }`
- **Error Responses**:
  - `400` — `childId` missing, or the target user is not a `STUDENT`
  - `403` — caller is not a `PARENT`
  - `404` — no user found with that `childId`
  - `409` — child is already linked to this parent

### 4. Get My Children (Parent Only)
- **URL**: `/users/children`
- **Method**: `GET`
- **Auth**: Required (Role: `PARENT`)
- **Success Response**: `200 OK` — Array of linked student profiles.
  ```json
  [
    { "id": "uuid", "name": "Chan Michael", "email": "michael@student.com", "phone": null }
  ]
  ```
- **Error**: `403` — caller is not a `PARENT`

### 5. Unbind Child (Parent Only)
- **URL**: `/users/children/:childId`
- **Method**: `DELETE`
- **Auth**: Required (Role: `PARENT`)
- **Success Response**: `200 OK` - `{ "message": "Child unbound successfully" }`
- **Error Responses**:
  - `403` — caller is not a `PARENT`
  - `404` — child is not linked to this parent

---

## School Management

### 1. Get All Schools
- **URL**: `/schools`
- **Method**: `GET`
- **Auth**: Required
- **Success Response**: `200 OK` - Array of schools

### 2. Create School
- **URL**: `/schools`
- **Method**: `POST`
- **Auth**: Required (Role: `SCHOOL_ADMIN`)
- **Body**: 
  ```json
  { "name": "No.1 High School", "code": "HS001" }
  ```
- **Success Response**: `201 Created` - School object

---

## Class Management

### 1. Create Class
- **URL**: `/classes`
- **Method**: `POST`
- **Auth**: Required (Role: `TEACHER`, `SCHOOL_ADMIN`)
- **Body**: 
  ```json
  { "name": "Math 101", "code": "MATH101", "schoolId": "school-uuid" }
  ```
- **Success Response**: `201 Created` - Class object

### 2. Join Class
- **URL**: `/classes/join`
- **Method**: `POST`
- **Auth**: Required (Role: `STUDENT`)
- **Body**: 
  ```json
  { "classCode": "MATH101" }
  ```
- **Success Response**: `200 OK` - `{ "message": "Successfully joined the class" }`

### 3. Get Class Students
- **URL**: `/classes/:classId/students`
- **Method**: `GET`
- **Auth**: Required (Role: `TEACHER`, `SCHOOL_ADMIN`)
- **Success Response**: `200 OK` - Array of student user objects

### 4. Remove Student from Class
- **URL**: `/classes/:classId/students/:studentId`
- **Method**: `DELETE`
- **Auth**: Required (Role: `TEACHER`, `SCHOOL_ADMIN`)
- **Success Response**: `200 OK` - `{ "message": "Student removed from class" }`

---

## Learning Progress

Progress records are written automatically after every Socratic chat message — the AI identifies which curriculum knowledge points were engaged and rates the student's mastery level. They can also be written manually via the update endpoint.

### 1. Update Progress (Manual)
- **URL**: `/progress/update`
- **Method**: `POST`
- **Auth**: Required
- **Body**: 
  ```json
  {
    "studentId": "uuid",
    "knowledgePointId": "uuid",
    "mastery": "PARTIAL",
    "studyTimeSeconds": 300
  }
  ```
  `mastery` values: `UNMASTERED`, `PARTIAL`, `MASTERED`
- **Success Response**: `200 OK` - Updated progress object

### 2. Get Student Progress (Flat List)
- **URL**: `/progress/:studentId`
- **Method**: `GET`
- **Auth**: Required (STUDENT: own record only; TEACHER / PARENT / SCHOOL_ADMIN: any student)
- **Success Response**: `200 OK` - Array of progress records ordered by `updatedAt` desc, each including full knowledge point → chapter → subject chain.

### 3. Get Student Learning Report (Grouped)
- **URL**: `/progress/:studentId/report`
- **Method**: `GET`
- **Auth**: Required (STUDENT: own record only; TEACHER / PARENT / SCHOOL_ADMIN: any student)
- **Success Response**: `200 OK`
  ```json
  {
    "student": { "id": "uuid", "name": "Chan Michael" },
    "summary": {
      "totalKnowledgePoints": 5,
      "mastered": 2,
      "partial": 2,
      "unmastered": 1,
      "totalStudyTimeSeconds": 300
    },
    "subjects": [
      {
        "subject": "Mathematics",
        "chapters": [
          {
            "chapter": "Algebra",
            "knowledgePoints": [
              {
                "name": "Solving Linear Equations",
                "mastery": "MASTERED",
                "studyTimeSeconds": 180,
                "updatedAt": "2026-05-28T10:00:00Z"
              }
            ]
          }
        ]
      }
    ]
  }
  ```

---

## Curriculum Management

The curriculum hierarchy is **Subject → Chapter → Knowledge Point**.  
All endpoints require authentication. Write operations are restricted by role.

| Operation | Allowed Roles |
|-----------|--------------|
| GET (all read) | Any authenticated user |
| POST / PUT | `TEACHER`, `SCHOOL_ADMIN` |
| DELETE | `SCHOOL_ADMIN` |

### Subjects

#### 1. Get All Subjects (Full Tree)
- **URL**: `/curriculum/subjects`
- **Method**: `GET`
- **Auth**: Required
- **Success Response**: `200 OK` — Array of subjects, each with nested chapters and knowledge points, ordered alphabetically.
  ```json
  [
    {
      "id": "uuid",
      "name": "Mathematics",
      "chapters": [
        {
          "id": "uuid",
          "name": "Algebra",
          "subjectId": "uuid",
          "knowledgePoints": [
            { "id": "uuid", "name": "Solving Linear Equations", "desc": "...", "chapterId": "uuid" }
          ]
        }
      ]
    }
  ]
  ```

#### 2. Get Subject by ID
- **URL**: `/curriculum/subjects/:id`
- **Method**: `GET`
- **Auth**: Required
- **Success Response**: `200 OK` — Single subject with nested chapters and knowledge points.
- **Error**: `404` — Subject not found.

#### 3. Create Subject
- **URL**: `/curriculum/subjects`
- **Method**: `POST`
- **Auth**: Required (Role: `TEACHER`, `SCHOOL_ADMIN`)
- **Body**:
  ```json
  { "name": "Physics" }
  ```
- **Success Response**: `201 Created` — Subject object `{ id, name }`.

#### 4. Update Subject
- **URL**: `/curriculum/subjects/:id`
- **Method**: `PUT`
- **Auth**: Required (Role: `TEACHER`, `SCHOOL_ADMIN`)
- **Body**:
  ```json
  { "name": "Advanced Physics" }
  ```
- **Success Response**: `200 OK` — Updated subject object.

#### 5. Delete Subject
- **URL**: `/curriculum/subjects/:id`
- **Method**: `DELETE`
- **Auth**: Required (Role: `SCHOOL_ADMIN`)
- **Success Response**: `204 No Content`
- **Error**: `404` — Subject not found.

### Chapters

#### 6. Get Chapters for Subject
- **URL**: `/curriculum/subjects/:subjectId/chapters`
- **Method**: `GET`
- **Auth**: Required
- **Success Response**: `200 OK` — Array of chapters with their knowledge points, ordered alphabetically.

#### 7. Create Chapter
- **URL**: `/curriculum/subjects/:subjectId/chapters`
- **Method**: `POST`
- **Auth**: Required (Role: `TEACHER`, `SCHOOL_ADMIN`)
- **Body**:
  ```json
  { "name": "Quadratic Equations" }
  ```
- **Success Response**: `201 Created` — Chapter object `{ id, name, subjectId }`.

#### 8. Update Chapter
- **URL**: `/curriculum/chapters/:id`
- **Method**: `PUT`
- **Auth**: Required (Role: `TEACHER`, `SCHOOL_ADMIN`)
- **Body**:
  ```json
  { "name": "Quadratic & Cubic Equations" }
  ```
- **Success Response**: `200 OK` — Updated chapter object.

#### 9. Delete Chapter
- **URL**: `/curriculum/chapters/:id`
- **Method**: `DELETE`
- **Auth**: Required (Role: `SCHOOL_ADMIN`)
- **Success Response**: `204 No Content`
- **Error**: `404` — Chapter not found.

### Knowledge Points

#### 10. Get Knowledge Points for Chapter
- **URL**: `/curriculum/chapters/:chapterId/knowledge-points`
- **Method**: `GET`
- **Auth**: Required
- **Success Response**: `200 OK` — Array of knowledge points `{ id, name, desc, chapterId }`, ordered alphabetically.

#### 11. Create Knowledge Point
- **URL**: `/curriculum/chapters/:chapterId/knowledge-points`
- **Method**: `POST`
- **Auth**: Required (Role: `TEACHER`, `SCHOOL_ADMIN`)
- **Body**:
  ```json
  { "name": "Completing the Square", "desc": "A method to solve quadratic equations by rewriting them as a perfect square." }
  ```
- **Success Response**: `201 Created` — Knowledge point object `{ id, name, desc, chapterId }`.

#### 12. Update Knowledge Point
- **URL**: `/curriculum/knowledge-points/:id`
- **Method**: `PUT`
- **Auth**: Required (Role: `TEACHER`, `SCHOOL_ADMIN`)
- **Body**:
  ```json
  { "name": "Completing the Square", "desc": "Updated description." }
  ```
- **Success Response**: `200 OK` — Updated knowledge point object.

#### 13. Delete Knowledge Point
- **URL**: `/curriculum/knowledge-points/:id`
- **Method**: `DELETE`
- **Auth**: Required (Role: `SCHOOL_ADMIN`)
- **Success Response**: `204 No Content`
- **Error**: `404` — Knowledge point not found.

---

## System Administration

### 1. Get System Config
- **URL**: `/system/config`
- **Method**: `GET`
- **Auth**: Required (Role: `SCHOOL_ADMIN`)
- **Success Response**: `200 OK`
  ```json
  {
    "ACTIVE_AI_MODEL": "gpt-4o-mini",
    "MENTAL_HEALTH_SYSTEM_PROMPT": "Custom prompt text"
  }
  ```

### 2. Update System Config
- **URL**: `/system/config`
- **Method**: `PUT`
- **Auth**: Required (Role: `SCHOOL_ADMIN`)
- **Body**:
  ```json
  {
    "key": "MENTAL_HEALTH_SYSTEM_PROMPT",
    "value": "You are a wellbeing analysis assistant. Return JSON only."
  }
  ```
- **Success Response**: `200 OK` - Config object with `id`, `key`, `value`, `updatedAt`

### 3. Get Forbidden Keywords
- **URL**: `/system/keywords`
- **Method**: `GET`
- **Auth**: Required (Role: `SCHOOL_ADMIN`)
- **Success Response**: `200 OK` - Array of `{ id, word, createdAt }`

### 4. Add Forbidden Keyword
- **URL**: `/system/keywords`
- **Method**: `POST`
- **Auth**: Required (Role: `SCHOOL_ADMIN`)
- **Body**:
  ```json
  { "word": "violence" }
  ```
- **Success Response**: `201 Created` - Forbidden keyword object

### 5. Delete Forbidden Keyword
- **URL**: `/system/keywords/:id`
- **Method**: `DELETE`
- **Auth**: Required (Role: `SCHOOL_ADMIN`)
- **Success Response**: `204 No Content`

---

## Subscription

### 1. Get Subscription
- **URL**: `/subscription`
- **Method**: `GET`
- **Auth**: Required
- **Success Response**: `200 OK` - `{ "plan": "FREE" | "PREMIUM" }`

### 2. Upgrade Subscription
- **URL**: `/subscription/upgrade`
- **Method**: `POST`
- **Auth**: Required
- **Body**:
  ```json
  { "plan": "PREMIUM" }
  ```
  `plan` values: `FREE`, `PREMIUM`
- **Success Response**: `200 OK` - `{ "message": "Subscription updated successfully", "plan": "PREMIUM" }`
- **Error**: `400` — invalid plan value

---

## Dashboard

### 1. Teacher Dashboard
- **URL**: `/dashboard/teacher`
- **Method**: `GET`
- **Auth**: Required (Role: `TEACHER`)
- **Success Response**: `200 OK`
  ```json
  [
    {
      "classId": "class-uuid",
      "className": "Math 101",
      "totalStudents": 20,
      "averageScore": 0.62,
      "mentalHealthAlerts": 2
    }
  ]
  ```

### 2. School Admin Dashboard
- **URL**: `/dashboard/admin`
- **Method**: `GET`
- **Auth**: Required (Role: `SCHOOL_ADMIN`)
- **Success Response**: `200 OK`
  ```json
  {
    "schoolId": "school-uuid",
    "schoolName": "No. 1 High School",
    "totalClasses": 8,
    "totalStudents": 240,
    "overallAverageScore": 0.58,
    "totalMentalHealthAlerts": 7
  }
  ```

---

## AI Chat (Session-Based)

There are two session types, set once at creation. The single send-message endpoint handles both — the server routes internally based on `sessionType`.

| `type` | AI behaviour | Mental health scoring | Learning analysis |
|---|---|---|---|
| `Socratic` | Guided questioning tutor | ✓ per message | ✓ per message (auto) |
| `Mental` | Empathetic wellbeing companion | ✓ per message | — |

### 1. Create Chat Session
- **URL**: `/ai/sessions`
- **Method**: `POST`
- **Auth**: Required
- **Body**:
  ```json
  {
    "type": "Socratic",
    "systemPrompt": "You are a DSE Mathematics tutor for Form 4 students. Always respond in Traditional Chinese."
  }
  ```
  | Field | Type | Required | Description |
  |---|---|---|---|
  | `type` | string | Yes | `"Socratic"` or `"Mental"` |
  | `systemPrompt` | string | No | Custom instruction stored on the session and used as the AI system prompt for every message. Overrides the default Socratic or Mental Health prompt. |
- **Notes**:
  - `Socratic` sessions auto-generate their title from the first user message.
  - `Mental` sessions keep the default title `"New Chat"`.
  - `systemPrompt` is stored once at creation and applied automatically to all messages in the session.
- **Success Response**: `201 Created`
  ```json
  {
    "session": {
      "id": "uuid",
      "sessionId": "uuid",
      "studentId": "uuid",
      "sessionType": "SOCRATIC",
      "title": "New Chat",
      "subject": null,
      "topic": null,
      "systemPrompt": "You are a DSE Mathematics tutor for Form 4 students. Always respond in Traditional Chinese.",
      "createdAt": "2026-05-28T10:00:00Z",
      "updatedAt": "2026-05-28T10:00:00Z"
    }
  }
  ```

### 2. Get All My Sessions
- **URL**: `/ai/sessions`
- **Method**: `GET`
- **Auth**: Required
- **Success Response**: `200 OK` — array of sessions ordered by `lastAccessedAt` desc, each including the most recent message preview.

### 3. Get Session Details
- **URL**: `/ai/sessions/:sessionId`
- **Method**: `GET`
- **Auth**: Required
- **Success Response**: `200 OK` — session object with full `chatHistories` ordered by `createdAt` asc.

### 4. Send Message
- **URL**: `/ai/chat`
- **Method**: `POST`
- **Auth**: Required
- **Body**:
  ```json
  {
    "sessionId": "uuid",
    "message": "I cannot understand quadratic equations at all."
  }
  ```
  | Field | Type | Required | Description |
  |---|---|---|---|
  | `sessionId` | string | Yes | The session UUID (or `sessionId` alias). |
  | `message` | string | Yes | The student's message. |

- **Behaviour by session type**:
  - **Socratic** — AI responds with a guiding question. Title is set from the first message. After the AI reply, learning behaviour analysis runs in the background: the conversation is sent to the AI to identify which curriculum knowledge points were engaged and the student's mastery level (`UNMASTERED / PARTIAL / MASTERED`). `Progress` records are upserted and study time incremented by 60 s per exchange.
  - **Mental** — AI responds as an empathetic wellbeing companion. No learning analysis.
  - **Both** — sentiment is analysed (AFINN + academic extras) and a `mentalHealth` record is created and returned.
  - **System prompt** — the custom system prompt set at session creation is automatically applied to every message; no need to pass it here.
- **Success Response**: `200 OK`
  ```json
  {
    "response": "That sounds really tough. What part feels most confusing right now?",
    "modelUsed": "liquid/lfm-2.5-1.2b-instruct:free",
    "sessionId": "uuid",
    "mentalHealth": {
      "statusLabel": "BAD",
      "emotionPolarity": "NEGATIVE",
      "riskLevel": "HIGH",
      "scoreDelta": -8,
      "currentScore": -8,
      "reasonSummary": "Sentiment score -0.80 based on: overwhelmed, hard, punish.",
      "signals": ["overwhelmed", "hard", "punish"],
      "recordId": "uuid",
      "modelUsed": "afinn-sentiment-v2"
    }
  }
  ```
- **Error Responses**:
  - `400` — `sessionId` or `message` missing
  - `403` — message blocked by content filter
  - `404` — session not found

### 5. Delete Session
- **URL**: `/ai/sessions/:sessionId`
- **Method**: `DELETE`
- **Auth**: Required
- **Success Response**: `200 OK` — `{ "message": "Session deleted successfully" }`

### 6. Analyse Whole-Session Mental Health (On-Demand)
- **URL**: `/ai/sessions/:sessionId/mental-health`
- **Method**: `POST`
- **Auth**: Required
- **Body**: none
- **Notes**: Runs AFINN sentiment across **all** student messages in the session and stores one record. Useful for a summary report after a session ends.
- **Success Response**: `200 OK`
  ```json
  {
    "sentimentScore": -0.72,
    "scoreDelta": -7,
    "currentScore": -15,
    "statusLabel": "BAD",
    "emotionPolarity": "NEGATIVE",
    "riskLevel": "HIGH",
    "signals": ["overwhelmed", "failing", "punish", "exhausted"],
    "reasonSummary": "Whole-session sentiment: -0.72 based on: overwhelmed, failing, punish, exhausted.",
    "recordId": "uuid"
  }
  ```

---

## Internal and Debug Routes

### 1. Direct AI Test
- **URL**: `/api/ai-direct-test`
- **Method**: `GET`
- **Auth**: Required
- **Success Response**: `200 OK` - `{ "message": "Direct AI test route works!", "userId": "user-uuid" }`

### 2. Debug OpenRouter
- **URL**: `/api/debug-openrouter`
- **Method**: `POST`
- **Auth**: None in current implementation
- **Purpose**: Sends a sample OpenRouter request to confirm model connectivity
- **Success Response**: `200 OK` - `{ "success": true, "response": "..." }`

### 3. Health Check
- **URL**: `/health`
- **Method**: `GET`
- **Auth**: None
- **Success Response**: `200 OK` - `{ "status": "ok", "timestamp": "..." }`

### 4. Root and API Check
- **URL**: `/`
- **Method**: `GET`
- **Auth**: None
- **Success Response**: `200 OK` - `{ "message": "Backend is running" }`

- **URL**: `/api`
- **Method**: `GET`
- **Auth**: None
- **Success Response**: `200 OK` - `{ "message": "API is running" }`

---

## AI Chatbot Features

- **Session-Based Memory**: Each session maintains separate conversations
- **Context-Aware Responses**: Last 10 messages automatically included for coherent responses
- **Custom System Prompt**: Pass `systemPrompt` in any `/ai/chat` request to override the default AI instructions; the prompt is stored on the session and applied to all subsequent messages automatically
- **Socratic Method**: AI guides learning through questioning
- **Learning Behaviour Analysis**: After every Socratic message the AI identifies engaged curriculum knowledge points and mastery level; `Progress` records are upserted automatically (fire-and-forget, does not add response latency)
- **Content Filtering**: Automatically blocks prohibited topics
- **Multi-Model Support**: Configurable AI model (OpenRouter)
- **Mental Health Scoring**: Configurable prompt, score delta tracking, and summary-only wellbeing records
- **User Isolation**: Students can only access their own sessions; teachers, parents, and admins can query any student's progress

For detailed API documentation, see [SOCRATIC_CHATBOT.md](./SOCRATIC_CHATBOT.md)
For frontend integration examples, see [CHATBOT_FRONTEND_INTEGRATION.md](./CHATBOT_FRONTEND_INTEGRATION.md)
