# 🛠️ AI Unk Setup Guide

This guide provides detailed instructions for setting up AI Unk for development and production environments.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Local Development Setup](#local-development-setup)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [AI Provider Configuration](#ai-provider-configuration)
- [Running the Application](#running-the-application)
- [Production Deployment](#production-deployment)
- [Troubleshooting](#troubleshooting)

## Prerequisites

Before you begin, ensure you have the following installed:

### Required Software

1. **Node.js 22+**
   ```bash
   # Check your version
   node --version
   
   # Download from https://nodejs.org/
   # Or use nvm:
   nvm install 22
   nvm use 22
   ```

2. **pnpm Package Manager**
   ```bash
   # Install pnpm globally
   npm install -g pnpm
   
   # Verify installation
   pnpm --version
   ```

3. **Git**
   ```bash
   # Check if installed
   git --version
   
   # Download from https://git-scm.com/
   ```

4. **MySQL or TiDB Database**
   - MySQL 8.0+ or TiDB Cloud account
   - Connection string ready

### Optional Tools

- **VS Code** with recommended extensions:
  - ESLint
  - Prettier
  - TypeScript and JavaScript Language Features
  - Tailwind CSS IntelliSense

## Local Development Setup

### Step 1: Clone the Repository

```bash
# Clone via HTTPS
git clone https://github.com/yourusername/ai-unk.git

# Or via SSH
git clone git@github.com:yourusername/ai-unk.git

# Navigate to project directory
cd ai-unk
```

### Step 2: Install Dependencies

```bash
# Install all dependencies
pnpm install

# This will install:
# - Frontend dependencies (React, Tailwind, etc.)
# - Backend dependencies (Express, tRPC, etc.)
# - Development tools (TypeScript, Vitest, etc.)
```

### Step 3: Configure Environment Variables

Create a `.env` file in the project root (or use Manus platform environment management):

```bash
# Copy example env file (if provided)
cp .env.example .env

# Edit with your values
nano .env
```

Required environment variables:

```env
# Database
DATABASE_URL="mysql://user:password@host:port/database?ssl=true"

# Authentication
JWT_SECRET="your-secret-key-here"
OAUTH_SERVER_URL="https://api.manus.im"
VITE_OAUTH_PORTAL_URL="https://portal.manus.im"
VITE_APP_ID="your-app-id"

# AI Integration
BUILT_IN_FORGE_API_KEY="your-manus-api-key"
BUILT_IN_FORGE_API_URL="https://forge.manus.im"
VITE_FRONTEND_FORGE_API_KEY="your-frontend-api-key"
VITE_FRONTEND_FORGE_API_URL="https://forge.manus.im"

# Owner Info (for admin access)
OWNER_OPEN_ID="your-open-id"
OWNER_NAME="Your Name"

# App Branding
VITE_APP_TITLE="AI Unk"
VITE_APP_LOGO="/logo.png"
```

### Step 4: Set Up the Database

```bash
# Generate and run migrations
pnpm db:push

# This will:
# 1. Generate SQL migrations from schema.ts
# 2. Apply migrations to your database
# 3. Create all necessary tables
```

Verify tables were created:
- users
- conversations
- messages
- userProgress
- aiProviderSettings
- auditLog

## Environment Variables

### Database Configuration

**DATABASE_URL Format:**
```
mysql://[username]:[password]@[host]:[port]/[database]?ssl=true
```

Example:
```
mysql://root:mypassword@localhost:3306/aiunk?ssl=true
```

For TiDB Cloud:
```
mysql://user.root:password@gateway.tidbcloud.com:4000/aiunk?ssl=true
```

### Authentication Setup

1. **Create Manus OAuth App**:
   - Go to Manus Platform
   - Create new OAuth application
   - Note your `VITE_APP_ID`
   - Set callback URL: `https://yourdomain.com/api/oauth/callback`

2. **Generate JWT Secret**:
   ```bash
   # Generate a secure random string
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

### AI Provider API Keys

You'll configure these through the Admin panel after setup, but you can also set them via environment variables:

- **Anthropic**: Get API key from https://console.anthropic.com/
- **OpenAI**: Get API key from https://platform.openai.com/
- **Google**: Get API key from https://makersuite.google.com/

## AI Provider Configuration

### Option 1: Admin Panel (Recommended)

1. Start the application
2. Sign in as admin (owner)
3. Navigate to `/admin`
4. Add provider details:
   - Provider ID: `anthropic`, `openai`, or `google`
   - Model: e.g., `claude-3-5-sonnet-20241022`
   - API Key: Your provider's API key
5. Click "Test Connection"
6. Toggle "Set as Active Provider"

### Option 2: Direct Database Insert

```sql
INSERT INTO aiProviderSettings (providerId, model, apiKey, isActive)
VALUES ('anthropic', 'claude-3-5-sonnet-20241022', 'your-api-key', true);
```

## Running the Application

### Development Mode

```bash
# Start development server with hot reload
pnpm dev

# Server will start on http://localhost:3000
# Backend API: http://localhost:3000/api
# tRPC endpoint: http://localhost:3000/api/trpc
```

The development server includes:
- Hot module replacement (HMR)
- TypeScript type checking
- Automatic server restart on changes
- Source maps for debugging

### Production Build

```bash
# Build for production
pnpm build

# This creates:
# - Optimized frontend bundle in dist/
# - Compiled backend in dist/

# Start production server
pnpm start
```

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test --watch

# Run tests with coverage
pnpm test --coverage
```

### Type Checking

```bash
# Check TypeScript types
pnpm check

# This runs tsc --noEmit to verify types without building
```

### Code Formatting

```bash
# Format all files with Prettier
pnpm format
```

## Production Deployment

### Option 1: Manus Platform (Easiest)

1. **Create Checkpoint**:
   - Use Manus UI to create a checkpoint
   - This saves your current code state

2. **Publish**:
   - Click "Publish" in Management UI
   - Your app goes live automatically with:
     - SSL certificates
     - Managed database
     - Auto-scaling
     - Built-in monitoring

3. **Custom Domain** (Optional):
   - Go to Settings → Domains
   - Add your custom domain
   - Follow DNS configuration instructions

### Option 2: Self-Hosting

#### Using Docker (Recommended)

1. **Create Dockerfile**:
```dockerfile
FROM node:22-alpine
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile
COPY . .
RUN pnpm build
EXPOSE 3000
CMD ["pnpm", "start"]
```

2. **Build and Run**:
```bash
docker build -t ai-unk .
docker run -p 3000:3000 --env-file .env ai-unk
```

#### Using PM2

```bash
# Install PM2
npm install -g pm2

# Build the app
pnpm build

# Start with PM2
pm2 start dist/index.js --name ai-unk

# Save PM2 configuration
pm2 save

# Set up startup script
pm2 startup
```

#### Using Systemd

Create `/etc/systemd/system/ai-unk.service`:

```ini
[Unit]
Description=AI Unk Application
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/ai-unk
ExecStart=/usr/bin/node dist/index.js
Restart=on-failure
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl enable ai-unk
sudo systemctl start ai-unk
```

### Nginx Reverse Proxy

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## Troubleshooting

### Common Issues

#### Database Connection Fails

**Problem**: `Error: connect ECONNREFUSED`

**Solutions**:
1. Verify DATABASE_URL is correct
2. Check database server is running
3. Ensure SSL settings match your database
4. Test connection manually:
   ```bash
   mysql -h host -u user -p database
   ```

#### Port Already in Use

**Problem**: `Error: listen EADDRINUSE: address already in use :::3000`

**Solutions**:
1. Kill process using port 3000:
   ```bash
   # Find process
   lsof -i :3000
   
   # Kill it
   kill -9 <PID>
   ```
2. Or use a different port:
   ```bash
   PORT=3001 pnpm dev
   ```

#### TypeScript Errors

**Problem**: Type errors in IDE or build

**Solutions**:
1. Restart TypeScript server in VS Code:
   - Cmd/Ctrl + Shift + P
   - "TypeScript: Restart TS Server"

2. Clear TypeScript cache:
   ```bash
   rm -rf node_modules/.cache
   ```

3. Reinstall dependencies:
   ```bash
   rm -rf node_modules pnpm-lock.yaml
   pnpm install
   ```

#### OAuth Login Fails

**Problem**: 404 or redirect errors during login

**Solutions**:
1. Verify `VITE_OAUTH_PORTAL_URL` is correct
2. Check `VITE_APP_ID` matches your OAuth app
3. Ensure callback URL is registered:
   - Should be: `https://yourdomain.com/api/oauth/callback`
4. Check browser console for errors

#### AI Provider Not Responding

**Problem**: Messages sent but no response

**Solutions**:
1. Check Admin panel → Providers
2. Verify API key is correct
3. Test connection using "Test Connection" button
4. Check audit logs for error details
5. Verify provider has active status
6. Check API rate limits

### Debug Mode

Enable verbose logging:

```bash
# Set debug environment variable
DEBUG=* pnpm dev

# Or specific namespaces
DEBUG=trpc:*,app:* pnpm dev
```

### Getting Help

If you're still stuck:

1. **Check Logs**:
   ```bash
   # Development
   Check terminal output
   
   # Production
   pm2 logs ai-unk
   # or
   journalctl -u ai-unk -f
   ```

2. **Database Inspection**:
   ```bash
   # Connect to database
   mysql -h host -u user -p database
   
   # Check tables
   SHOW TABLES;
   
   # Check audit logs
   SELECT * FROM auditLog ORDER BY timestamp DESC LIMIT 10;
   ```

3. **Open an Issue**:
   - Go to GitHub Issues
   - Provide error messages, logs, and steps to reproduce

## Next Steps

After successful setup:

1. ✅ Sign in and test the chat interface
2. ✅ Configure AI provider in Admin panel
3. ✅ Test conversation creation and messaging
4. ✅ Check Dashboard for progress tracking
5. ✅ Review About page
6. ✅ Run the test suite
7. ✅ Set up CI/CD (see GitHub Actions workflow)

---

**Need more help?** Check out the main [README.md](./README.md) or open a [GitHub Issue](https://github.com/yourusername/ai-unk/issues).
