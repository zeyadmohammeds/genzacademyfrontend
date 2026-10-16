# GenZCoders — Learning Platform Frontend

GenZCoders is a learning-platform frontend developed for an applied-technology school context. This repository contains the web client; API services and deployment configuration may be maintained separately.

## Technology

- Next.js 15 and React 19
- TypeScript
- Tailwind CSS 4
- TanStack Query for server-state management
- SignalR client for real-time communication
- Monaco Editor for code-editing experiences
- Framer Motion and GSAP for animation
- Zoom Meeting SDK integration
- Sentry and Vercel analytics integrations

## Getting started

### Requirements

- Node.js compatible with the versions declared by the project dependencies
- npm

### Install and run

```bash
git clone https://github.com/zeyadmohammeds/genzacademyfrontend.git
cd genzacademyfrontend
npm install
npm run dev
```

Open the local URL printed by Next.js in your terminal.

### Production build

```bash
npm run build
npm run start
```

## Configuration

Review the application code for the environment variables required by enabled integrations before running or deploying. Keep API keys, authentication secrets, service credentials, and private endpoints out of source control. Use local environment files that are excluded by Git and configure production secrets through the hosting provider.

## Project notes

This is the frontend repository, not a standalone guarantee that the complete platform is deployable without its companion backend and service configuration. Verify API endpoints, authentication settings, and third-party SDK configuration for your environment.

## Maintainer

**Zeyad Mohammed** — [GitHub](https://github.com/zeyadmohammeds) · [Portfolio](https://zeyadmohammeds.vercel.app/)
