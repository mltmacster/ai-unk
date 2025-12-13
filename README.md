# AI Unk - Your Digital Mentor

A sophisticated, memory-enabled AI mentorship platform with a unique street-smart persona. Users interact with AI Unk, their digital mentor who guides them to financial independence through technology mastery.

## Features

### 🤖 AI Unk Persona System
- **Street-smart mentor** with consistent personality across all conversations
- Custom system prompt that maintains the "Wizard of the Hustle" character
- Authentic care and motivational energy in every interaction
- Action-oriented advice connecting technical knowledge to real-world success

### 💬 Multi-Provider AI Chat
- Support for multiple AI providers (Anthropic, OpenAI, Google)
- Switchable backends through admin panel
- Real-time streaming responses
- Conversation memory system (last 10 messages per conversation)

### 📊 User Progress Tracking
- Track total conversations and messages
- Monitor topics discussed
- Achievement system for milestones
- Personalized dashboard with statistics

### 🔧 Admin Dashboard
- AI provider management with API key configuration
- Provider switching and connection testing
- Comprehensive audit log viewer
- Usage statistics and monitoring

### 📱 Mobile-First Design
- Responsive interface optimized for mobile devices
- Bottom-anchored input for thumb-friendly access
- Collapsible sidebar navigation
- Touch-optimized controls

## Tech Stack

- **Frontend**: React 19 + Tailwind CSS 4 + shadcn/ui
- **Backend**: Express 4 + tRPC 11
- **Database**: MySQL/TiDB with Drizzle ORM
- **Authentication**: Manus OAuth
- **AI Integration**: Manus AI LLM Backend
- **Deployment**: Manus Platform

## Getting Started

### Prerequisites
- Node.js 22+
- pnpm
- Manus account

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Set up environment variables (managed by Manus platform)

4. Push database schema:
   ```bash
   pnpm db:push
   ```

5. Start development server:
   ```bash
   pnpm dev
   ```

## Project Structure

```
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── pages/         # Page components
│   │   │   ├── Chat.tsx   # Main chat interface
│   │   │   ├── Dashboard.tsx  # User progress dashboard
│   │   │   ├── Admin.tsx  # Admin panel
│   │   │   └── About.tsx  # About page
│   │   ├── components/    # Reusable UI components
│   │   └── lib/          # Utilities and tRPC client
├── server/                # Backend Express + tRPC
│   ├── routers.ts        # tRPC API routes
│   ├── db.ts            # Database helpers
│   └── _core/           # Core infrastructure
├── drizzle/             # Database schema
│   └── schema.ts        # Table definitions
└── shared/              # Shared types and constants
    └── aiUnkPrompt.ts   # AI Unk system prompt
```

## Key Features Explained

### AI Unk System Prompt
The AI Unk persona is defined in `shared/aiUnkPrompt.ts` and includes:
- Core identity as "The Wizard of the Hustle"
- Street-smart communication style
- Action-oriented behavioral rules
- Success-focused mentorship approach

### Conversation Memory
- Stores last 10 messages per conversation
- Provides context awareness across sessions
- Auto-generates conversation titles from first message
- Tracks metadata including AI provider, model, and tokens used

### Admin Provider Management
Admins can:
- Configure multiple AI providers
- Test connections before activation
- Switch between providers seamlessly
- Monitor usage statistics
- View comprehensive audit logs

### User Progress System
Tracks:
- Total conversations and messages
- Topics discussed (automatically extracted)
- Achievements and milestones
- Last active topic for continuity

## Database Schema

### Core Tables
- **users**: User accounts with role-based access
- **conversations**: Chat sessions with metadata
- **messages**: Individual chat messages with AI provider info
- **userProgress**: User statistics and achievements
- **aiProviderSettings**: AI provider configurations
- **auditLog**: System events and activities

## API Endpoints (tRPC)

### Conversations
- `conversations.list` - Get user's conversations
- `conversations.create` - Create new conversation
- `conversations.delete` - Delete conversation
- `conversations.getMessages` - Get conversation messages

### Chat
- `chat.send` - Send message and get AI response

### Progress
- `progress.get` - Get user progress
- `progress.update` - Update user progress

### Admin (Admin Only)
- `admin.providers` - Get all AI providers
- `admin.updateProvider` - Update provider settings
- `admin.testProvider` - Test provider connection
- `admin.auditLogs` - Get audit logs

## Testing

Run the test suite:
```bash
pnpm test
```

Tests cover:
- Conversation management
- User progress tracking
- Admin access controls
- Database operations
- Authentication flows

## Deployment

The application is deployed on the Manus platform with:
- Automatic SSL certificates
- Built-in authentication
- Managed database
- Auto-scaling infrastructure

To deploy:
1. Create a checkpoint: Use the Manus UI
2. Click "Publish" in the Management UI

## Security

- Role-based access control (admin/user)
- Encrypted API keys in database
- Protected admin endpoints
- Manus OAuth authentication
- Input sanitization and validation

## Future Enhancements

- [ ] Conversation search functionality
- [ ] Export conversation history
- [ ] Voice input support
- [ ] Multi-language support
- [ ] Advanced analytics dashboard
- [ ] Custom AI provider configurations

## Contributing

This project follows industry best practices:
- TypeScript for type safety
- tRPC for end-to-end type safety
- Vitest for testing
- ESLint and Prettier for code quality

## License

MIT

## Support

For issues or questions, please contact support through the Manus platform.

---

**Built with ❤️ on Manus.ai**
