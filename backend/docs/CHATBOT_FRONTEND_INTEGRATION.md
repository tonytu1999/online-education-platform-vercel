# Socratic Chatbot - Frontend Integration Guide

## Quick Start

### 1. Initialize Chat Session

When a student enters the tutoring section, create a new session. Pass an optional `systemPrompt` here to set a custom AI instruction that will be used for every message in the session.

```typescript
async function createChatSession(
  type: 'Socratic' | 'Mental',
  systemPrompt?: string
) {
  const response = await fetch('/api/ai/sessions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      type,
      ...(systemPrompt ? { systemPrompt } : {})
    })
  });
  
  const data = await response.json();
  return data.session.id;  // Save this sessionId
}

// Usage — plain session
const sessionId = await createChatSession('Socratic');

// Usage — session with a custom system prompt
const sessionId = await createChatSession(
  'Socratic',
  'You are a DSE Mathematics tutor for Form 4 students. Always respond in Traditional Chinese.'
);
```

### 2. Load Previous Sessions

When student opens the tutoring app, load their existing sessions:

```typescript
async function loadStudentSessions() {
  const response = await fetch('/api/ai/sessions', {
    headers: {
      'Authorization': `Bearer ${authToken}`
    }
  });
  
  const data = await response.json();
  return data.sessions;  // Array of ChatSession objects
}

// Usage
const sessions = await loadStudentSessions();
sessions.forEach(session => {
  console.log(`${session.title} - Last message: ${session.chatHistories[0]?.message}`);
});
```

### 3. Send Message and Get Response

Send student message and receive AI response with context. The system prompt set at session creation is applied automatically — no need to pass it here.

```typescript
async function sendChatMessage(sessionId: string, message: string) {
  const response = await fetch('/api/ai/chat', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      sessionId,
      message
    })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error);
  }
  
  const data = await response.json();
  return data.response;  // AI's response
}

// Usage
try {
  const aiResponse = await sendChatMessage(sessionId, 'What is a quadratic equation?');
  console.log('AI:', aiResponse);
} catch (error) {
  console.error('Chat failed:', error);
}
```

### 4. Load Full Conversation History

Get all messages for a session:

```typescript
async function loadSessionHistory(sessionId: string) {
  const response = await fetch(`/api/ai/sessions/${sessionId}`, {
    headers: {
      'Authorization': `Bearer ${authToken}`
    }
  });
  
  const data = await response.json();
  return data.session.chatHistories;  // Array of all messages
}

// Usage
const messages = await loadSessionHistory(sessionId);
messages.forEach(msg => {
  console.log(`${msg.sender}: ${msg.message}`);
});
```

### 5. Delete Session

Clean up after learning:

```typescript
async function deleteSession(sessionId: string) {
  const response = await fetch(`/api/ai/sessions/${sessionId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${authToken}`
    }
  });
  
  const data = await response.json();
  return data.message;
}

// Usage
await deleteSession(sessionId);
```

---

## React Component Example

### ChatBot Component

```typescript
import React, { useState, useEffect, useRef } from 'react';

interface Message {
  id: string;
  sender: 'USER' | 'AI';
  message: string;
  createdAt: string;
}

interface ChatBotProps {
  sessionId?: string;
  onSessionChange?: (sessionId: string) => void;
  authToken: string;
}

export const ChatBot: React.FC<ChatBotProps> = ({ 
  sessionId: initialSessionId, 
  onSessionChange, 
  authToken 
}) => {
  const [sessionId, setSessionId] = useState<string | null>(initialSessionId || null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessions, setSessions] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load previous sessions on mount
  useEffect(() => {
    loadSessions();
  }, []);

  // Load session history when sessionId changes
  useEffect(() => {
    if (sessionId) {
      loadSessionHistory(sessionId);
    }
  }, [sessionId]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadSessions = async () => {
    try {
      const response = await fetch('/api/ai/sessions', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      const data = await response.json();
      setSessions(data.sessions);
    } catch (error) {
      console.error('Failed to load sessions:', error);
    }
  };

  const loadSessionHistory = async (sid: string) => {
    try {
      const response = await fetch(`/api/ai/sessions/${sid}`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      const data = await response.json();
      setMessages(data.session.chatHistories);
    } catch (error) {
      console.error('Failed to load history:', error);
    }
  };

  const createNewSession = async (title: string, subject: string, topic: string) => {
    try {
      const response = await fetch('/api/ai/sessions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title, subject, topic })
      });
      const data = await response.json();
      const newSessionId = data.session.id;
      setSessionId(newSessionId);
      setMessages([]);
      onSessionChange?.(newSessionId);
      await loadSessions();
    } catch (error) {
      console.error('Failed to create session:', error);
    }
  };

  const sendMessage = async () => {
    if (!inputValue.trim() || !sessionId) return;

    try {
      setIsLoading(true);
      
      // Send message
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sessionId,
          message: inputValue
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
      }

      const data = await response.json();
      
      // Add user message
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        sender: 'USER',
        message: inputValue,
        createdAt: new Date().toISOString()
      }]);

      // Add AI response
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        sender: 'AI',
        message: data.response,
        createdAt: new Date().toISOString()
      }]);

      setInputValue('');
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('Failed to send message: ' + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', height: '100%', gap: '10px' }}>
      {/* Session Sidebar */}
      <div style={{ width: '250px', borderRight: '1px solid #ccc', padding: '10px' }}>
        <h3>Sessions</h3>
        <button onClick={() => createNewSession('New Chat', 'General', 'Learning')}>
          + New Session
        </button>
        <div style={{ marginTop: '10px' }}>
          {sessions.map(s => (
            <div
              key={s.id}
              onClick={() => setSessionId(s.id)}
              style={{
                padding: '10px',
                backgroundColor: sessionId === s.id ? '#e0e0e0' : 'white',
                cursor: 'pointer',
                borderRadius: '5px',
                marginBottom: '5px'
              }}
            >
              <strong>{s.title}</strong>
              <p style={{ fontSize: '12px', margin: '5px 0 0 0', color: '#666' }}>
                {s.chatHistories[0]?.message?.substring(0, 40)}...
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '10px', borderBottom: '1px solid #ccc' }}>
          {messages.map(msg => (
            <div
              key={msg.id}
              style={{
                marginBottom: '10px',
                textAlign: msg.sender === 'USER' ? 'right' : 'left'
              }}
            >
              <div
                style={{
                  display: 'inline-block',
                  maxWidth: '70%',
                  padding: '10px 15px',
                  borderRadius: '10px',
                  backgroundColor: msg.sender === 'USER' ? '#007bff' : '#f1f1f1',
                  color: msg.sender === 'USER' ? 'white' : 'black'
                }}
              >
                {msg.message}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div style={{ padding: '10px', display: 'flex', gap: '5px' }}>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Ask a question..."
            disabled={!sessionId || isLoading}
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: '5px',
              border: '1px solid #ccc'
            }}
          />
          <button
            onClick={sendMessage}
            disabled={!sessionId || isLoading || !inputValue.trim()}
            style={{
              padding: '10px 20px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            {isLoading ? 'Thinking...' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  );
};
```

---

## Flutter (Mobile) Integration

```dart
// lib/services/chatbot_service.dart

class ChatbotService {
  final String baseUrl = 'http://your-api.com/api/ai';
  final String authToken;

  ChatbotService({required this.authToken});

  Future<ChatSession> createSession({
    required String type,    // 'Socratic' or 'Mental'
    String? systemPrompt,    // optional — stored on session, applied to every message
  }) async {
    final body = <String, dynamic>{ 'type': type };
    if (systemPrompt != null) body['systemPrompt'] = systemPrompt;

    final response = await http.post(
      Uri.parse('$baseUrl/sessions'),
      headers: {
        'Authorization': 'Bearer $authToken',
        'Content-Type': 'application/json',
      },
      body: jsonEncode(body),
    );

    if (response.statusCode == 201) {
      final data = jsonDecode(response.body);
      return ChatSession.fromJson(data['session']);
    } else {
      throw Exception('Failed to create session');
    }
  }

  Future<String> sendMessage({
    required String sessionId,
    required String message,
  }) async {
    final response = await http.post(
      Uri.parse('$baseUrl/chat'),
      headers: {
        'Authorization': 'Bearer $authToken',
        'Content-Type': 'application/json',
      },
      body: jsonEncode({
        'sessionId': sessionId,
        'message': message,
      }),
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      return data['response'];
    } else {
      throw Exception('Failed to send message');
    }
  }

  Future<List<ChatSession>> getSessions() async {
    final response = await http.get(
      Uri.parse('$baseUrl/sessions'),
      headers: {
        'Authorization': 'Bearer $authToken',
      },
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      return (data['sessions'] as List)
          .map((e) => ChatSession.fromJson(e))
          .toList();
    } else {
      throw Exception('Failed to load sessions');
    }
  }
}
```

---

## Testing

### Using Postman Collection

```json
{
  "info": {
    "name": "Socratic Chatbot API",
    "version": "1.0"
  },
  "item": [
    {
      "name": "Create Session",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{authToken}}"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\"title\": \"Algebra Help\", \"subject\": \"Math\", \"topic\": \"Equations\"}"
        },
        "url": {
          "raw": "{{baseUrl}}/api/ai/sessions",
          "host": ["{{baseUrl}}"]
        }
      }
    }
  ]
}
```

---

## Error Handling

### Example Error Scenarios

```typescript
async function sendMessageWithErrorHandling(sessionId: string, message: string) {
  try {
    const aiResponse = await sendChatMessage(sessionId, message);
    return aiResponse;
  } catch (error) {
    if ((error as Error).message.includes('prohibited content')) {
      // Show warning about inappropriate content
      console.error('Message blocked due to inappropriate content');
    } else if ((error as Error).message.includes('Session not found')) {
      // Session might have been deleted
      console.error('Session no longer exists');
    } else {
      // Generic error
      console.error('Failed to get response from AI tutor');
    }
  }
}
```

---

## Tips for Best UX

1. **Show typing indicator** while waiting for AI response
2. **Store sessionId** in local storage to resume sessions
3. **Load previous sessions** on app start
4. **Auto-scroll** to latest message
5. **Disable input** while waiting for response
6. **Show error messages** clearly to users
7. **Consider pagination** for long conversation histories
