# Backend API Documentation

Base URL: `http://localhost:3000/api`

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

---

## Users

### 1. Get Student UUID by Email
- **URL**: `/users/uuid-by-email?email=student@example.com`
- **Method**: `GET`
- **Auth**: Required
- **Success Response**: `200 OK` - `{ "id": "student-uuid" }`

### 1. Get Profile
- **URL**: `/users/profile`
- **Method**: `GET`
- **Auth**: Required
- **Success Response**: `200 OK` - User object

### 2. Bind Child (Parent Only)
- **URL**: `/users/bind-child`
- **Method**: `POST`
- **Auth**: Required (Role: `PARENT`)
- **Body**: 
  ```json
  { "childId": "uuid-of-student" }
  ```
- **Success Response**: `200 OK` - `{ "message": "Child bound successfully" }`

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

### 1. Update Progress
- **URL**: `/progress/update`
- **Method**: `POST`
- **Auth**: Required
- **Body**: 
  ```json
  {
    "studentId": "uuid",
    "knowledgePointId": "uuid",
    "mastery": "PARTIAL", // UNMASTERED, PARTIAL, MASTERED
    "studyTimeSeconds": 300
  }
  ```
- **Success Response**: `200 OK` - Updated progress object

### 2. Get Student Progress
- **URL**: `/progress/:studentId`
- **Method**: `GET`
- **Auth**: Required
- **Success Response**: `200 OK` - Array of progress objects (includes knowledge point/chapter details)

---

## AI & Mental Health

### 1. Send Message to AI (Socratic Tutor)
- **URL**: `/ai/chat`
- **Method**: `POST`
- **Auth**: Required
- **Body**: 
  ```json
  {
    "studentId": "uuid",
    "message": "I don't understand fractions.",
    "context": {}
  }
  ```
- **Success Response**: `200 OK` - `{ "response": "Socratic text response..." }`

### 2. Get Mental Health Analytics (Placeholder)
- **URL**: `/ai/mental-health`
- **Method**: `POST`
- **Auth**: Required
- **Success Response**: `200 OK` - `{ "emotionPolarity": "NEUTRAL", "riskLevel": "LOW", "keywords": "none" }`
