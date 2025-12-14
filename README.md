# 🎯 AI Unk - Your Digital Mentor

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61dafb.svg)](https://reactjs.org/)
[![tRPC](https://img.shields.io/badge/tRPC-11-2596be.svg)](https://trpc.io/)

**AI Unk** is a sophisticated AI mentorship platform featuring a unique street-smart persona that guides users to financial independence through technology mastery. Built with modern web technologies and designed for scalability, AI Unk provides personalized mentorship with conversation memory, progress tracking, and multi-provider AI integration.

## ✨ Features

### 🤖 AI Unk Persona System
AI Unk isn't just another chatbot—it's **The Wizard of the Hustle**, a digital mentor with decades of experience "in the game." The persona is engineered to provide:

- **Street-smart wisdom** combined with technical expertise
- **Authentic mentorship** that treats users as "lil' nephews and nieces"
- **Action-oriented advice** connecting technical knowledge to real-world success
- **Consistent personality** across all conversations through custom system prompts

### 💬 Advanced Chat System
- **Multi-provider AI support** (Anthropic, OpenAI, Google)
- **Conversation memory** maintaining context across sessions (last 10 messages)
- **Real-time streaming** responses with markdown rendering
- **Auto-generated titles** from first message
- **Message metadata** tracking (provider, model, tokens used)

### 📊 User Progress Tracking
- Total conversations and messages counter
- Topics discussed with automatic extraction
- Achievement system for milestones
- Personalized dashboard with statistics
- Last active topic for continuity

### 🔧 Admin Dashboard
- AI provider management with API key configuration
- Provider switching and connection testing
- Comprehensive audit log viewer
- Usage statistics and monitoring
- Role-based access control (admin/user)

### 📱 Mobile-First Design
- Responsive interface optimized for all devices
- Bottom-anchored input for thumb-friendly mobile access
- Collapsible sidebar navigation
- Touch-optimized controls
- Progressive Web App ready

## 🚀 Quick Start

### Prerequisites

- **Node.js** 22+ 
- **pnpm** (package manager)
- **MySQL/TiDB** database
- **Manus account** (for OAuth and deployment)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/ai-unk.git
   cd ai-unk
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   
   The application uses Manus platform for managed environment variables. Key variables include:
   - `DATABASE_URL` - MySQL/TiDB connection string
   - `JWT_SECRET` - Session cookie signing secret
   - `VITE_APP_ID` - Manus OAuth application ID
   - `OAUTH_SERVER_URL` - Manus OAuth backend URL
   - `BUILT_IN_FORGE_API_KEY` - Manus AI API key

4. **Initialize the database**
   ```bash
   pnpm db:push
   ```

5. **Start development server**
   ```bash
   pnpm dev
   ```

6. **Open your browser**
   
   Navigate to `http://localhost:3000`

## 📁 Project Structure

```
ai-unk/
├── client/                    # Frontend React application
│   ├── src/
│   │   ├── pages/            # Page components
│   │   │   ├── Chat.tsx      # Main chat interface
│   │   │   ├── Dashboard.tsx # User progress dashboard
│   │   │   ├── Admin.tsx     # Admin panel
│   │   │   └── About.tsx     # About page
│   │   ├── components/       # Reusable UI components
│   │   │   └── ui/          # shadcn/ui components
│   │   ├── lib/             # Utilities and tRPC client
│   │   └── index.css        # Global styles (Tailwind)
│   └── index.html           # HTML entry point
├── server/                   # Backend Express + tRPC
│   ├── routers.ts           # tRPC API routes
│   ├── db.ts                # Database helpers
│   ├── chat.test.ts         # Test suite
│   └── _core/               # Core infrastructure
│       ├── llm.ts           # LLM integration
│       ├── context.ts       # tRPC context
│       └── trpc.ts          # tRPC setup
├── drizzle/                 # Database schema & migrations
│   └── schema.ts            # Table definitions
├── shared/                  # Shared types and constants
│   ├── aiUnkPrompt.ts      # AI Unk system prompt
│   └── const.ts            # Shared constants
├── package.json            # Dependencies and scripts
└── README.md              # This file
```

## 🛠️ Tech Stack

### Frontend
- **React 19** - UI library with latest features
- **Tailwind CSS 4** - Utility-first CSS framework
- **shadcn/ui** - High-quality React components
- **Wouter** - Lightweight routing
- **tRPC React Query** - Type-safe API client
- **Streamdown** - Markdown rendering with streaming support

### Backend
- **Express 4** - Web framework
- **tRPC 11** - End-to-end type-safe APIs
- **Drizzle ORM** - TypeScript ORM
- **MySQL/TiDB** - Database
- **Manus OAuth** - Authentication
- **Vitest** - Testing framework

### Infrastructure
- **Manus Platform** - Hosting and deployment
- **Manus AI** - LLM backend integration
- **TypeScript** - Type safety throughout

## 🎮 Usage

### For Users

1. **Sign In**: Click "Sign In to Get Started" to authenticate via Manus OAuth
2. **Start Chatting**: Type your question or topic in the input box
3. **Create Conversations**: Click "New Chat" to start a fresh conversation
4. **Track Progress**: Visit the Dashboard to see your learning journey
5. **Learn About AI Unk**: Check the About page to understand the mentor's philosophy

### For Admins

1. **Access Admin Panel**: Navigate to `/admin` (admin role required)
2. **Configure AI Provider**: Add API keys for your preferred provider (Anthropic, OpenAI, Google)
3. **Test Connection**: Use the "Test Connection" button to verify provider setup
4. **Activate Provider**: Toggle "Set as Active Provider" to enable it
5. **Monitor Usage**: View audit logs and usage statistics

## 🧪 Testing

Run the comprehensive test suite:

```bash
pnpm test
```

Tests cover:
- ✅ Conversation management (create, list, delete)
- ✅ User progress tracking
- ✅ Admin access controls
- ✅ Database operations
- ✅ Authentication flows

## 📚 API Documentation

### tRPC Endpoints

#### Conversations
- `conversations.list` - Get user's conversations
- `conversations.create` - Create new conversation
- `conversations.delete` - Delete conversation
- `conversations.getMessages` - Get conversation messages

#### Chat
- `chat.send` - Send message and get AI response

#### Progress
- `progress.get` - Get user progress statistics
- `progress.update` - Update user progress

#### Admin (Admin Only)
- `admin.providers` - Get all AI providers
- `admin.updateProvider` - Update provider settings
- `admin.testProvider` - Test provider connection
- `admin.auditLogs` - Get audit logs

For detailed API documentation, see [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

## 🗄️ Database Schema

### Core Tables

**users** - User accounts with role-based access
- `id` (int, PK) - Auto-increment ID
- `openId` (varchar) - Manus OAuth identifier
- `name`, `email`, `loginMethod` - User info
- `role` (enum: 'user' | 'admin') - Access level
- Timestamps: `createdAt`, `updatedAt`, `lastSignedIn`

**conversations** - Chat sessions
- `id` (int, PK) - Conversation ID
- `userId` (int, FK) - Owner
- `title` (text) - Conversation title
- `messageCount` (int) - Number of messages
- Timestamps: `createdAt`, `updatedAt`

**messages** - Individual chat messages
- `id` (int, PK) - Message ID
- `conversationId` (int, FK) - Parent conversation
- `sender` (enum: 'user' | 'ai_unk') - Message sender
- `content` (text) - Message text
- `aiProvider`, `aiModel`, `tokensUsed` - AI metadata
- `timestamp` - When sent

**userProgress** - User statistics
- `userId` (int, FK) - User reference
- `totalConversations`, `totalMessages` - Counters
- `topicsDiscussed` (JSON) - Array of topics
- `achievements` (JSON) - Array of achievements
- `lastTopic` (text) - Most recent topic

**aiProviderSettings** - AI provider configs
- `providerId` (varchar) - Provider identifier
- `model`, `apiKey` - Configuration
- `isActive` (boolean) - Active status
- `usageCount`, `lastUsed` - Usage tracking

**auditLog** - System events
- `eventType` (varchar) - Event category
- `userId` (int, FK) - User who triggered
- `details` (JSON) - Event metadata
- `timestamp` - When occurred

## 🔐 Security

- **Role-based access control** (admin/user roles)
- **Encrypted API keys** stored in database
- **Protected admin endpoints** with middleware
- **Manus OAuth** for secure authentication
- **Input sanitization** and validation with Zod
- **HTTPS only** in production
- **Secure cookie handling** with httpOnly flags

## 🚢 Deployment

### Manus Platform (Recommended)

1. Create a checkpoint in the Manus UI
2. Click "Publish" in the Management UI
3. Your app is live with:
   - Automatic SSL certificates
   - Built-in authentication
   - Managed database
   - Auto-scaling infrastructure

### Self-Hosting

1. Build the application:
   ```bash
   pnpm build
   ```

2. Set environment variables in your hosting platform

3. Run the production server:
   ```bash
   pnpm start
   ```

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests (`pnpm test`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## 🙏 Acknowledgments

- **Manus.ai** - Platform and infrastructure
- **shadcn/ui** - Beautiful component library
- **tRPC** - Type-safe API framework
- **Anthropic, OpenAI, Google** - AI providers

## 📞 Support

- **Documentation**: [SETUP.md](./SETUP.md)
- **Issues**: [GitHub Issues](https://github.com/yourusername/ai-unk/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/ai-unk/discussions)

## 🗺️ Roadmap

- [ ] Conversation search functionality
- [ ] Export conversation history (PDF/Markdown)
- [ ] Voice input support
- [ ] Multi-language support
- [ ] Advanced analytics dashboard
- [ ] Custom AI provider configurations
- [ ] Mobile native app
- [ ] Browser extension

---

**Built with ❤️ by the AI Unk team**

*Empowering the next generation to master technology and achieve financial independence*
