# AI Unk API Documentation

This document provides comprehensive documentation for the AI Unk tRPC API endpoints.

## Table of Contents

- [Overview](#overview)
- [Authentication](#authentication)
- [Endpoints](#endpoints)
  - [Auth](#auth)
  - [Conversations](#conversations)
  - [Chat](#chat)
  - [Progress](#progress)
  - [Admin](#admin)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)

## Overview

AI Unk uses [tRPC](https://trpc.io/) for type-safe API communication between the frontend and backend. All endpoints are accessible at `/api/trpc`.

**Base URL**: `https://yourdomain.com/api/trpc`

**Content Type**: `application/json`

**Authentication**: Session cookie-based (Manus OAuth)

## Authentication

### Session Management

Authentication is handled via Manus OAuth. After successful login, a session cookie is set that authenticates subsequent requests.

**Cookie Name**: `manus_session`

**Cookie Properties**:
- `httpOnly`: true
- `secure`: true (production)
- `sameSite`: 'none'
- `maxAge`: 1 year

### Protected vs Public Procedures

- **Public Procedures**: Accessible without authentication
- **Protected Procedures**: Require valid session cookie
- **Admin Procedures**: Require admin role

## Endpoints

### Auth

#### `auth.me`

Get current authenticated user information.

**Type**: Query (Public)

**Input**: None

**Output**:
```typescript
{
  id: number;
  openId: string;
  name: string | null;
  email: string | null;
  loginMethod: string | null;
  role: 'user' | 'admin';
  createdAt: Date;
  updatedAt: Date;
  lastSignedIn: Date;
} | null
```

**Example**:
```typescript
const { data: user } = trpc.auth.me.useQuery();

if (user) {
  console.log(`Logged in as ${user.name}`);
}
```

---

#### `auth.logout`

Logout current user and clear session.

**Type**: Mutation (Public)

**Input**: None

**Output**:
```typescript
{
  success: true;
}
```

**Example**:
```typescript
const logout = trpc.auth.logout.useMutation({
  onSuccess: () => {
    window.location.href = '/';
  }
});

logout.mutate();
```

---

### Conversations

#### `conversations.list`

Get all conversations for the current user.

**Type**: Query (Protected)

**Input**: None

**Output**:
```typescript
Array<{
  id: number;
  userId: number;
  title: string;
  messageCount: number;
  createdAt: Date;
  updatedAt: Date;
}>
```

**Example**:
```typescript
const { data: conversations } = trpc.conversations.list.useQuery();

conversations?.forEach(conv => {
  console.log(`${conv.title} (${conv.messageCount} messages)`);
});
```

---

#### `conversations.create`

Create a new conversation.

**Type**: Mutation (Protected)

**Input**:
```typescript
{
  title: string; // 1-200 characters
}
```

**Output**:
```typescript
{
  id: number;
  userId: number;
  title: string;
  messageCount: number;
  createdAt: Date;
  updatedAt: Date;
}
```

**Example**:
```typescript
const createConversation = trpc.conversations.create.useMutation({
  onSuccess: (newConv) => {
    console.log(`Created conversation: ${newConv.id}`);
  }
});

createConversation.mutate({
  title: 'Learning React Hooks'
});
```

---

#### `conversations.delete`

Delete a conversation and all its messages.

**Type**: Mutation (Protected)

**Input**:
```typescript
{
  id: number; // Conversation ID
}
```

**Output**:
```typescript
{
  success: true;
}
```

**Example**:
```typescript
const deleteConversation = trpc.conversations.delete.useMutation({
  onSuccess: () => {
    // Invalidate conversation list
    trpc.useUtils().conversations.list.invalidate();
  }
});

deleteConversation.mutate({ id: 123 });
```

---

#### `conversations.getMessages`

Get all messages for a specific conversation.

**Type**: Query (Protected)

**Input**:
```typescript
{
  conversationId: number;
}
```

**Output**:
```typescript
Array<{
  id: number;
  conversationId: number;
  sender: 'user' | 'ai_unk';
  content: string;
  aiProvider: string | null;
  aiModel: string | null;
  tokensUsed: number | null;
  timestamp: Date;
}>
```

**Example**:
```typescript
const { data: messages } = trpc.conversations.getMessages.useQuery({
  conversationId: 123
});

messages?.forEach(msg => {
  console.log(`${msg.sender}: ${msg.content}`);
});
```

---

### Chat

#### `chat.send`

Send a message to AI Unk and get a response.

**Type**: Mutation (Protected)

**Input**:
```typescript
{
  conversationId: number;
  message: string; // 1-5000 characters
}
```

**Output**:
```typescript
{
  userMessage: {
    id: number;
    conversationId: number;
    sender: 'user';
    content: string;
    timestamp: Date;
  };
  aiMessage: {
    id: number;
    conversationId: number;
    sender: 'ai_unk';
    content: string;
    aiProvider: string;
    aiModel: string;
    tokensUsed: number;
    timestamp: Date;
  };
}
```

**Example**:
```typescript
const sendMessage = trpc.chat.send.useMutation({
  onSuccess: (response) => {
    console.log('AI Unk:', response.aiMessage.content);
  },
  onError: (error) => {
    console.error('Failed to send message:', error.message);
  }
});

sendMessage.mutate({
  conversationId: 123,
  message: 'How do I learn React?'
});
```

**Notes**:
- Automatically maintains conversation context (last 10 messages)
- Updates conversation title if it's the first message
- Tracks user progress (topics, message count)
- Logs activity in audit log

---

### Progress

#### `progress.get`

Get progress statistics for the current user.

**Type**: Query (Protected)

**Input**: None

**Output**:
```typescript
{
  userId: number;
  totalConversations: number;
  totalMessages: number;
  topicsDiscussed: string[];
  achievements: string[];
  lastTopic: string | null;
  updatedAt: Date;
} | null
```

**Example**:
```typescript
const { data: progress } = trpc.progress.get.useQuery();

if (progress) {
  console.log(`Total conversations: ${progress.totalConversations}`);
  console.log(`Topics: ${progress.topicsDiscussed.join(', ')}`);
}
```

---

#### `progress.update`

Update user progress statistics.

**Type**: Mutation (Protected)

**Input**:
```typescript
{
  totalConversations?: number;
  totalMessages?: number;
  topicsDiscussed?: string[];
  achievements?: string[];
  lastTopic?: string;
}
```

**Output**:
```typescript
{
  success: true;
}
```

**Example**:
```typescript
const updateProgress = trpc.progress.update.useMutation();

updateProgress.mutate({
  totalConversations: 5,
  totalMessages: 42,
  topicsDiscussed: ['React', 'TypeScript', 'Node.js'],
  lastTopic: 'Building APIs'
});
```

---

### Admin

All admin endpoints require the user to have `role: 'admin'`.

#### `admin.providers`

Get all AI provider configurations.

**Type**: Query (Admin Only)

**Input**: None

**Output**:
```typescript
Array<{
  providerId: string;
  model: string;
  apiKey: string; // Masked (last 4 chars visible)
  isActive: boolean;
  usageCount: number;
  lastUsed: Date | null;
  createdAt: Date;
  updatedAt: Date;
}>
```

**Example**:
```typescript
const { data: providers } = trpc.admin.providers.useQuery();

providers?.forEach(provider => {
  console.log(`${provider.providerId}: ${provider.isActive ? 'Active' : 'Inactive'}`);
});
```

---

#### `admin.updateProvider`

Update or create AI provider configuration.

**Type**: Mutation (Admin Only)

**Input**:
```typescript
{
  providerId: string; // 'anthropic' | 'openai' | 'google'
  model: string;
  apiKey: string;
  isActive: boolean;
}
```

**Output**:
```typescript
{
  success: true;
}
```

**Example**:
```typescript
const updateProvider = trpc.admin.updateProvider.useMutation({
  onSuccess: () => {
    trpc.useUtils().admin.providers.invalidate();
  }
});

updateProvider.mutate({
  providerId: 'anthropic',
  model: 'claude-3-5-sonnet-20241022',
  apiKey: 'sk-ant-...',
  isActive: true
});
```

---

#### `admin.testProvider`

Test connection to an AI provider.

**Type**: Mutation (Admin Only)

**Input**:
```typescript
{
  providerId: string;
  model: string;
  apiKey: string;
}
```

**Output**:
```typescript
{
  success: boolean;
  message: string;
  response?: string; // Test response from AI
}
```

**Example**:
```typescript
const testProvider = trpc.admin.testProvider.useMutation();

testProvider.mutate({
  providerId: 'anthropic',
  model: 'claude-3-5-sonnet-20241022',
  apiKey: 'sk-ant-...'
}, {
  onSuccess: (result) => {
    if (result.success) {
      console.log('Connection successful!');
    } else {
      console.error('Connection failed:', result.message);
    }
  }
});
```

---

#### `admin.auditLogs`

Get audit logs with optional filtering.

**Type**: Query (Admin Only)

**Input**:
```typescript
{
  limit?: number; // Default: 100, Max: 1000
  eventType?: string; // Filter by event type
}
```

**Output**:
```typescript
Array<{
  id: number;
  eventType: string;
  userId: number | null;
  details: Record<string, any>;
  timestamp: Date;
}>
```

**Example**:
```typescript
const { data: logs } = trpc.admin.auditLogs.useQuery({
  limit: 50,
  eventType: 'chat_message'
});

logs?.forEach(log => {
  console.log(`[${log.timestamp}] ${log.eventType}:`, log.details);
});
```

---

## Error Handling

### Error Response Format

```typescript
{
  message: string;
  code: string;
  data?: {
    code: string;
    httpStatus: number;
    path: string;
  };
}
```

### Common Error Codes

| Code | Description |
|------|-------------|
| `UNAUTHORIZED` | Not authenticated or session expired |
| `FORBIDDEN` | Insufficient permissions (e.g., not admin) |
| `BAD_REQUEST` | Invalid input data |
| `NOT_FOUND` | Resource not found |
| `INTERNAL_SERVER_ERROR` | Server error |
| `TIMEOUT` | Request timeout |

### Example Error Handling

```typescript
const sendMessage = trpc.chat.send.useMutation({
  onError: (error) => {
    switch (error.data?.code) {
      case 'UNAUTHORIZED':
        // Redirect to login
        window.location.href = getLoginUrl();
        break;
      case 'FORBIDDEN':
        toast.error('You do not have permission to perform this action');
        break;
      case 'BAD_REQUEST':
        toast.error(`Invalid input: ${error.message}`);
        break;
      default:
        toast.error('An unexpected error occurred');
    }
  }
});
```

## Rate Limiting

Currently, there are no hard rate limits enforced at the API level. However, AI provider rate limits apply:

- **Anthropic**: Varies by plan
- **OpenAI**: Varies by plan
- **Google**: Varies by plan

Best practices:
- Implement debouncing for user input
- Show loading states during API calls
- Handle rate limit errors gracefully
- Consider implementing client-side request queuing

## WebSocket Support

Currently, AI Unk uses HTTP-based streaming for real-time responses. WebSocket support for live updates may be added in future versions.

## Versioning

The API is currently unversioned. Breaking changes will be communicated via:
- GitHub releases
- Migration guides
- Deprecation warnings

## SDK Usage

### React Hooks

```typescript
// Query example
const { data, isLoading, error } = trpc.conversations.list.useQuery();

// Mutation example
const mutation = trpc.conversations.create.useMutation({
  onSuccess: (data) => {
    // Handle success
  },
  onError: (error) => {
    // Handle error
  }
});

// Optimistic updates
const deleteMutation = trpc.conversations.delete.useMutation({
  onMutate: async (variables) => {
    // Cancel outgoing queries
    await utils.conversations.list.cancel();
    
    // Snapshot previous value
    const previous = utils.conversations.list.getData();
    
    // Optimistically update
    utils.conversations.list.setData(undefined, (old) =>
      old?.filter(conv => conv.id !== variables.id)
    );
    
    return { previous };
  },
  onError: (err, variables, context) => {
    // Rollback on error
    utils.conversations.list.setData(undefined, context?.previous);
  },
  onSettled: () => {
    // Refetch after mutation
    utils.conversations.list.invalidate();
  }
});
```

### Vanilla Client

```typescript
import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from './server/routers';

const client = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: 'https://yourdomain.com/api/trpc',
      credentials: 'include',
    }),
  ],
});

// Usage
const user = await client.auth.me.query();
const conversations = await client.conversations.list.query();
```

## Additional Resources

- [tRPC Documentation](https://trpc.io/)
- [React Query Documentation](https://tanstack.com/query/latest)
- [Zod Documentation](https://zod.dev/)

---

**Last Updated**: December 2025

**API Version**: 1.0.0
