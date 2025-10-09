# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Commands
- **Development server**: `npm run dev` (starts Next.js dev server)
- **Build**: `npm run build` (production build)
- **Start**: `npm start` (production server)
- **Lint**: `npm run lint` (ESLint checking)
- **Database**: `npm run postinstall` (generates Prisma client)

### Testing Commands
- **Test search history**: `npm run test:search-history`
- **Test cleanup**: `npm run test:cleanup`
- **Test API**: `npm run test:api`
- **Run all tests**: `npm run test:all`

## Architecture Overview

### Tech Stack
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript with strict mode
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js with multiple providers (credentials, Google, GitHub)
- **Styling**: Tailwind CSS with custom theme system
- **UI Components**: Shadcn/ui with Radix UI primitives

### Project Structure
```
src/
├── app/                    # Next.js App Router pages and API routes
│   ├── api/               # API endpoints
│   │   ├── auth/          # Authentication routes
│   │   ├── jobs/          # Job search and management
│   │   ├── user/          # User data and preferences
│   │   └── cleanup/       # Database cleanup tasks
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # User dashboard
│   ├── jobs/[jobId]/      # Individual job detail pages
│   └── search/            # Job search interface
├── components/            # React components
│   ├── ui/               # Shadcn/ui components
│   └── simple/           # Simple utility components
├── contexts/             # React contexts (Theme)
├── lib/                  # Core business logic
├── types/                # TypeScript type definitions
└── utils/                # Utility functions
```

### Key Architecture Patterns

#### Multi-Provider Job Search
The application uses a provider pattern for job APIs:
- **Provider Interface**: `JobProvider` in `src/lib/apihub.ts`
- **Current Providers**: Adzuna, JSearch
- **Aggregation**: `searchAllProviders()` calls all providers in parallel and deduplicates results
- **Job Normalization**: All providers map to unified `Job` interface in `src/types/job.ts`

#### Theme System
- **Custom Theme Engine**: `src/lib/themes.ts` and `src/contexts/ThemeContext.tsx`
- **CSS Variables**: Uses HSL color system with CSS custom properties
- **Modes**: Light (`cyberlight`) and Dark (`cyber`) themes
- **Theme-Aware Components**: All components use theme-aware classes, no hardcoded colors

#### Database Design
- **User Management**: NextAuth.js schema with custom user preferences
- **Job Storage**: `JobDetail` model for caching job data with expiration
- **Search Caching**: `SearchResult` model caches API responses for 24 hours
- **User Data**: `SavedJob`, `JobApplication`, `SavedSearch` models for user interactions
- **Job Filtering**: `excludedJobCategories` field in User model for filtering unwanted job types

#### Error Handling & Rate Limiting
- **Centralized Error Handling**: `src/lib/errorHandling.ts`
- **Rate Limiting**: `src/lib/rateLimiter.ts` with per-endpoint limits
- **API Usage Tracking**: `src/lib/apiUsageTracker.ts` and `src/lib/quotaTracker.ts`

### Important Development Rules

#### Code Standards
- Use theme-aware classes for all UI elements (never hardcoded colors)
- All new components must follow the existing TypeScript patterns
- Use the `@/` import alias for src/ directory imports
- Follow the provider pattern when adding new job APIs

#### Database Operations
- All job data should be cached in `JobDetail` model with 24-hour expiration
- Search results are cached in `SearchResult` model to reduce API calls
- Use cleanup routes (`/api/cleanup/*`) to manage expired data

#### Authentication Flow
- NextAuth.js handles all authentication
- Session strategy is JWT-based
- User preferences are stored in the database User model
- Support for email/password, Google, and GitHub authentication

#### API Integration
- All job APIs must implement the `JobProvider` interface
- Job data must be normalized to the `Job` type
- Use the error handling utilities for consistent error responses
- Implement rate limiting for all API endpoints

#### UI/UX Consistency
- All components must support both light and dark themes
- Use Shadcn/ui components as base, extend with custom styling
- Maintain glassmorphic design aesthetic with animations
- Ensure keyboard navigation and accessibility compliance

### Environment Variables Required
- `DATABASE_URL`: PostgreSQL connection string
- `NEXTAUTH_SECRET`: NextAuth.js encryption key
- `NEXTAUTH_URL`: Application URL for auth callbacks
- `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET`: Google OAuth
- `GITHUB_CLIENT_ID` & `GITHUB_CLIENT_SECRET`: GitHub OAuth
- Provider API keys for Adzuna, JSearch, etc.

### Adding New Job Providers
1. Create provider implementation in `src/lib/apihub.ts`
2. Implement `JobProvider` interface with `searchJobs` method
3. Add provider to `jobProviders` array
4. Normalize API response to `Job` interface
5. Test with APIhub page (`/apihub`) for debugging

## Recent Updates

### July 30, 2025 - Job Category Exclusion Filter
- **Feature**: Added user preference system to exclude unwanted job categories
- **Implementation**: 
  - Added `excludedJobCategories` field to User model (JSON string array)
  - Updated preferences API endpoints to handle excluded categories
  - Implemented inline filtering logic in search page to avoid webpack issues
  - Created comprehensive UI in profile preferences with common exclusions
- **Usage**: Users can now filter out military jobs, MLM positions, commission-only roles, etc.
- **Files Modified**:
  - `prisma/schema.prisma`: Added excludedJobCategories field
  - `src/app/api/user/preferences/route.ts`: Updated API handlers
  - `src/app/profile/page.tsx`: Added exclusion preferences UI
  - `src/app/search/page.tsx`: Integrated filtering logic
  - `src/utils/jobUtils.ts`: Added filterExcludedJobs utility function