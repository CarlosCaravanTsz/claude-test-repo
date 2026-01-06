# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

UIGen is an AI-powered React component generator with live preview. It uses Claude AI to generate React components via a chat interface, displays them in real-time using a virtual file system, and allows users to iterate on components without writing files to disk.

**Key Differentiator**: This project runs a virtual file system entirely in-memory. No code files are written to disk during component generation - everything exists in a `VirtualFileSystem` class instance.

## Setup Commands

```bash
# First-time setup (installs deps, generates Prisma client, runs migrations)
npm run setup

# Development server (uses Turbopack)
npm run dev

# Development server as background daemon
npm run dev:daemon

# Run all tests
npm test

# Linting
npm run lint

# Build for production
npm run build

# Database reset (careful - deletes all data)
npm run db:reset
```

## Architecture Overview

### Core Workflow

1. **User Input** → Chat interface (`ChatInterface.tsx`)
2. **AI Processing** → API route streams responses using Anthropic Claude (`/api/chat/route.ts`)
3. **Tool Execution** → AI uses tools (`str_replace_editor`, `file_manager`) to modify virtual files
4. **File System Update** → `VirtualFileSystem` class manages in-memory file tree
5. **Live Preview** → JSX transformed in-browser using Babel, rendered in sandboxed iframe

### Virtual File System

**Location**: `src/lib/file-system.ts`

The `VirtualFileSystem` class is the heart of the application:
- Manages an in-memory tree structure of files and directories
- Implements operations: create, read, update, delete, rename
- Serializes/deserializes for database persistence (JSON format)
- Uses `Map<string, FileNode>` for O(1) path lookups
- All paths are normalized to start with `/`

### AI Integration Pattern

**Location**: `src/app/api/chat/route.ts`, `src/lib/provider.ts`

- Uses Vercel AI SDK with Anthropic's Claude (Haiku 4.5 model)
- System prompt in `src/lib/prompts/generation.tsx` instructs AI to use `/` as root, `@/` as import alias
- AI has access to two tools:
  - `str_replace_editor`: Create/view/edit files (supports create, str_replace, insert commands)
  - `file_manager`: Rename/delete files and folders
- Tool calls are intercepted client-side by `FileSystemContext` to update UI state
- **Mock Provider**: When no `ANTHROPIC_API_KEY` is set, uses `MockLanguageModel` class that returns static components

### Context Architecture

**Location**: `src/lib/contexts/`

Two main React contexts work together:

1. **FileSystemContext** (`file-system-context.tsx`):
   - Provides `VirtualFileSystem` instance to entire component tree
   - Handles tool call interception from AI (updates UI immediately)
   - Tracks selected file for code editor
   - Manages refresh triggers for reactive updates

2. **ChatContext** (`chat-context.tsx`):
   - Wraps Vercel AI SDK's `useChat` hook
   - Sends current file system state with each message
   - Tracks anonymous work for prompting auth when needed

### Preview System

**Location**: `src/components/preview/PreviewFrame.tsx`, `src/lib/transform/jsx-transformer.ts`

The preview system transforms JSX/TSX to browser-executable code:

1. **Transform**: Babel Standalone transpiles JSX → vanilla JS (in-browser)
2. **Import Map**: Creates ES Module import map with blob URLs for local files
3. **CSS Handling**: Extracts CSS imports, inlines styles in preview HTML
4. **Sandboxing**: Renders in iframe with `sandbox="allow-scripts allow-same-origin allow-forms"`
5. **Entry Point Discovery**: Looks for `/App.jsx`, `/App.tsx`, `/index.jsx`, or first `.jsx`/`.tsx` file

External dependencies (React, React-DOM) are loaded from `esm.sh` CDN.

### Database & Persistence

**Location**: `prisma/schema.prisma`, `src/lib/prisma.ts`

- SQLite database with Prisma ORM
- Prisma client generated to `src/generated/prisma/` (not the default location)
- Schema:
  - `User`: Email/password auth (bcrypt hashed)
  - `Project`: Stores serialized messages and file system as JSON strings
- Projects belong to users, but anonymous projects are supported (userId can be null)
- On chat completion, API route saves messages + file system state to database

### Authentication

**Location**: `src/lib/auth.ts`, `src/middleware.ts`, `src/actions/index.ts`

- Custom JWT-based authentication using `jose` library
- Session stored in HTTP-only cookie
- Middleware protects project routes (`/[projectId]`)
- Anonymous users can create temporary projects (tracked in localStorage)
- Auth dialog prompts anonymous users to sign up when they have work to save

## Testing

**Framework**: Vitest with React Testing Library
**Config**: `vitest.config.mts`

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run specific test file
npm test -- src/components/chat/__tests__/ChatInterface.test.tsx
```

Tests are colocated in `__tests__` directories next to source files.

## Important Implementation Notes

### File Paths
- All virtual file system paths must start with `/`
- Import alias `@/` resolves to root `/` (configured in `tsconfig.json` and Babel transform)
- Example: `/components/Button.jsx` imports as `@/components/Button`

### AI Tool Usage
- The AI generates components by calling `str_replace_editor` tool with `command: "create"`
- Edits use `command: "str_replace"` with `old_str` and `new_str` parameters
- Client-side `handleToolCall` function in `FileSystemContext` must mirror server-side tool behavior

### Preview Limitations
- Only ES Modules are supported (no CommonJS `require()`)
- External packages must be available on `esm.sh` CDN
- CSS must be imported at component level (extracted and inlined automatically)
- No file system access, local storage, or network requests from preview

### Prisma Workflow
When modifying the database schema:
```bash
# Create migration
npx prisma migrate dev --name description_of_change

# Regenerate client (happens automatically with migrate dev)
npx prisma generate
```

## Project Structure Highlights

```
src/
├── app/                    # Next.js 15 App Router
│   ├── api/chat/          # Streaming AI endpoint
│   └── [projectId]/       # Dynamic project routes
├── components/
│   ├── auth/              # Sign in/up forms
│   ├── chat/              # Chat interface, message list, markdown renderer
│   ├── editor/            # Monaco code editor, file tree
│   ├── preview/           # Iframe preview frame
│   └── ui/                # shadcn/ui components
├── lib/
│   ├── contexts/          # React context providers (FileSystem, Chat)
│   ├── prompts/           # AI system prompts
│   ├── tools/             # AI tool definitions (str-replace, file-manager)
│   ├── transform/         # JSX/TSX to JS transformer with Babel
│   ├── file-system.ts     # VirtualFileSystem class
│   ├── provider.ts        # Language model provider (real + mock)
│   └── auth.ts            # JWT authentication
├── actions/               # Server actions for projects
└── generated/prisma/      # Generated Prisma client (custom location)
```

## Environment Variables

```bash
# Optional - app works without it using mock provider
ANTHROPIC_API_KEY=your-api-key-here
```

Without the API key, the app uses `MockLanguageModel` which returns pre-defined static components (Counter, Form, Card examples).
