### 3.4 Backend ¡X Node.js + Express + MySQL

#### Module: User Management
**Acceptance Criteria**:
- [x] Four roles: Student, Parent, Teacher, School Admin
- [x] Role-based access control (JWT + middleware)
- [x] Parent¡Vchild relationship table
- [x] Teacher¡Vclass¡Vstudent relationship table

#### Module: AI Model Integration
**Acceptance Criteria**:
- [x] Integrate Claude API (Anthropic)
- [x] Integrate OpenAI API (GPT)
- [x] Integrate OpenRouter API (multi-model routing)
- [x] Integrate DeepSeek API
- [x] Admin-configurable active model (environment variable or database config)
- [x] Model-switching logic (select model based on scenario)
- [x] Encrypted storage of API keys (managed via env)

#### Module: Learning Progress Tracking
**Acceptance Criteria**:
- [x] Record student learning behaviors (selecting knowledge points, conversations, assessments, etc.)
- [x] AI callback to update knowledge-point mastery levels (interface design)
- [x] Store mastery status hierarchically: Subject ¡÷ Chapter ¡÷ Knowledge Point
- [x] Provide query interfaces for teachers/parents (summary data only; no conversation details)

#### Module: Mental Health Module
**Acceptance Criteria**:
- [x] Design mental health data schema (sentiment polarity, keywords, risk level, timestamp)
- [x] Provide storage interface (AI analysis not implemented in MVP; interface reserved)
- [x] Parent-facing query interface (returns empty data or placeholder)
- [x] Teacher-facing query interface (class-level aggregate data; raw conversations excluded)
- [x] School admin query interface (school/grade-level aggregate data)
- [x] Mental health data stores aggregate reports only; raw emotion data is not stored

#### Module: Prohibited Topic Filter
**Acceptance Criteria**:
- [x] Pre-configure sensitive keyword blocklist (pornography, violence, crime, etc.)
- [x] Filter user input (reject or redirect topic when blocklist match is detected)
- [x] Blocklist configurable from admin backend

#### Module: Payment Frontend Page (Freemium)
**Acceptance Criteria**:
- [x] Design subscription page UI (feature comparison: Free vs. Premium) (Handled in frontend/mocked via backend)
- [x] No actual payment integration (button click shows "Coming Soon" prompt)
- [x] Users can view their current subscription status

### 4.3 Backend
| Component | Choice | Notes |
|-----------|--------|-------|
| Runtime | **Node.js** | JavaScript backend runtime |
| Framework | **Express** | Lightweight web framework |
| Language | TypeScript | Type-safe; reduces errors |
| Database | **MySQL** | Relational database; strong data consistency |
| ORM | Prisma / TypeORM | Simplified database operations |
| Auth | JWT (jsonwebtoken) | Stateless authentication |
| Password Hashing | bcrypt | Secure password hashing |
| AI Integration | anthropic / openai SDK | Official SDKs |
| Env Config | dotenv | Configuration management |
| Logging | winston | Log recording |

### 4.4 Third-Party Services
| Service | Choice | Notes |
|---------|--------|-------|
| AI Models | Claude API, OpenAI API, OpenRouter, DeepSeek | External large model APIs |
| SMS Service | Alibaba Cloud SMS / Tencent Cloud SMS | Phone number OTP |
| Push Notifications | Firebase Cloud Messaging | In-app push (domestic fallback needed for China) |
| Third-Party Login | WeChat Open Platform, QQ Connect | Social account login |
