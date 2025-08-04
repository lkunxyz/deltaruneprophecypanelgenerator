# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a ShipAny SaaS template built with Next.js 15, TypeScript, and Tailwind CSS. It's a full-stack application template for building AI-powered SaaS products with built-in authentication, payments, and multi-language support.

## Key Development Commands

```bash
# Install dependencies (use pnpm)
pnpm install

# Run development server with Turbopack
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Lint code
pnpm lint

# Database commands
pnpm db:generate  # Generate migrations from schema changes
pnpm db:migrate   # Run pending migrations
pnpm db:studio    # Open Drizzle Studio for database management
pnpm db:push      # Push schema changes directly (dev only)

# Bundle analysis
pnpm analyze

# Docker build
pnpm docker:build
```

## Architecture Overview

### Tech Stack
- **Framework**: Next.js 15 with App Router and Turbopack
- **Language**: TypeScript with strict mode enabled
- **Styling**: Tailwind CSS v4 with CSS-in-JS theme system
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: NextAuth.js v5 (beta) with database sessions
- **Payments**: Stripe integration with webhook support
- **Internationalization**: next-intl with nested key structure
- **Documentation**: Fumadocs MDX with automatic processing
- **UI Components**: Custom components based on Radix UI primitives
- **AI SDKs**: Multiple providers (OpenAI, DeepSeek, Replicate, OpenRouter)

### Directory Structure

- `src/app/`: Next.js App Router pages and API routes
  - `[locale]/`: Internationalized routes with layout hierarchy
  - `(admin)/`: Admin dashboard routes with separate layout
  - `(default)/`: Main application routes
  - `(legal)/`: Legal pages (privacy, terms)
  - `api/`: API endpoints including auth, checkout, webhooks
- `src/components/`: Reusable React components
  - `blocks/`: Page section components (hero, pricing, features, etc.)
  - `ui/`: Base UI components with consistent styling
  - `console/`: Admin dashboard specific components
- `src/db/`: Database configuration and Drizzle setup
  - `schema.ts`: Database schema definitions
  - `migrations/`: Generated migration files
- `src/i18n/`: Internationalization setup
  - `messages/`: Translation files by locale
  - `pages/`: Page-specific translations
- `src/models/`: Database models providing data access layer
- `src/services/`: Business logic and data fetching services
- `src/types/`: TypeScript type definitions
- `src/lib/`: Utility functions and helpers
  - `resp.ts`: API response helpers for consistent error handling
- `src/aisdk/`: Custom AI SDK implementations

### Key Patterns

1. **Internationalization**: All user-facing routes are under `[locale]` dynamic segment
2. **Authentication**: Uses NextAuth with database sessions, supports Google and GitHub OAuth
3. **Database Access**: Models in `src/models/` provide data access layer over Drizzle ORM
4. **Component Organization**: Blocks for page sections, UI for base components
5. **Type Safety**: Extensive TypeScript types in `src/types/`
6. **API Response Pattern**: Use response helpers from `src/lib/resp.ts` for consistent API responses
7. **Path Aliases**: Use `@/` for `src/` directory, `@/.source` for `.source/index.ts`
8. **Environment Loading**: Multiple .env files loaded in order (.env, .env.development, .env.local)

### Environment Configuration

Required environment variables:
```bash
# Core Configuration
NEXT_PUBLIC_WEB_URL          # Your application URL
NEXT_PUBLIC_PROJECT_NAME     # Project display name
DATABASE_URL                 # PostgreSQL connection string
AUTH_SECRET                  # Generate with: openssl rand -base64 32

# Optional Services
# Authentication Providers
AUTH_GOOGLE_ID / AUTH_GOOGLE_SECRET
AUTH_GITHUB_ID / AUTH_GITHUB_SECRET

# Payment (Stripe)
STRIPE_PUBLIC_KEY / STRIPE_PRIVATE_KEY
STRIPE_WEBHOOK_SECRET

# Analytics
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID
NEXT_PUBLIC_OPENPANEL_CLIENT_ID
NEXT_PUBLIC_PLAUSIBLE_DOMAIN

# Storage (S3 Compatible)
STORAGE_ENDPOINT / STORAGE_REGION
STORAGE_ACCESS_KEY / STORAGE_SECRET_KEY
STORAGE_BUCKET / STORAGE_DOMAIN

# Admin Access
ADMIN_EMAILS                 # Comma-separated admin emails
```

### AI SDK Integration

The project includes custom AI SDK implementations in `src/aisdk/` with:
- Video generation with Kling provider
- Extensible provider system for multiple AI models
- Support for OpenAI, DeepSeek, Replicate, and OpenRouter

## Development Workflow

1. **Local Development**: Use `pnpm dev` for hot reload with Turbopack
2. **Database Changes**: 
   - Modify schema in `src/db/schema.ts`
   - Run `pnpm db:generate` to create migration
   - Run `pnpm db:migrate` to apply changes
   - Use `pnpm db:studio` for visual database management
3. **Adding Translations**:
   - Add new keys in `src/i18n/messages/[locale].json`
   - Page-specific translations go in `src/i18n/pages/`
   - Use nested key structure (e.g., "common.button.submit")
4. **Creating Components**:
   - UI components extend base components from `src/components/ui/`
   - Page sections go in `src/components/blocks/`
   - Follow existing patterns for consistency
5. **API Development**:
   - Use response helpers from `src/lib/resp.ts`
   - Follow RESTful conventions in `src/app/api/`
   - Implement proper error handling
6. **Authentication Flow**:
   - NextAuth configuration in `src/app/api/auth/[...nextauth]/`
   - Session handling with database adapter
   - Protected routes use middleware checks

## Deployment

- **Vercel**: Main branch deploys automatically
- **Cloudflare**: Use `cloudflare` branch with wrangler.toml configuration
- **Docker**: Build with `pnpm docker:build` for containerized deployment

## IDE Configuration

- Default formatter: Prettier (configured in .vscode/settings.json)
- i18n-ally extension configured for translation management
- TypeScript strict mode enabled - ensure all types are properly defined

## Notes

- No testing framework is currently configured
- The project uses pnpm as the package manager
- Fumadocs processes MDX files automatically on install
- Admin panel access is controlled by ADMIN_EMAILS environment variable