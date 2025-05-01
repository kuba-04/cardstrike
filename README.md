# CardStrike Flashcards

A web-based flashcard application designed to facilitate efficient learning through spaced repetition. CardStrike Flashcards leverages AI to generate flashcard pairs automatically from user-provided plain text, while also supporting manual creation and comprehensive flashcard management. It offers user authentication, secure data storage, and a learning session view powered by a spaced repetition algorithm.

## Table of Contents

- [Project Description](#project-description)
- [Tech Stack](#tech-stack)
- [Getting Started Locally](#getting-started-locally)
- [Available Scripts](#available-scripts)
- [Deployment](#deployment)
- [Project Scope](#project-scope)
- [Project Status](#project-status)
- [License](#license)

## Project Name

CardStrike Flashcards

## Project Description

CardStrike Flashcards is designed to streamline the process of creating and managing flashcards. The application features:

- **AI-driven flashcard generation:** Automatically transforms plain text into flashcard pairs using a language model API.
- **Manual flashcard creation:** Allows users to create flashcards by directly entering the content for both the question and answer sides.
- **Flashcard management:** Provides options for viewing, editing, and deleting flashcards.
- **User account system:** Supports registration, login, and secure management of user-specific flashcards.
- **Spaced repetition integration:** Implements a learning session that schedules flashcards based on a repetition algorithm.

## Tech Stack

**Frontend:**

- Astro 5
- React 19
- TypeScript 5
- Tailwind 4
- Shadcn/ui

**Backend:**

- Supabase (PostgreSQL, authentication, and storage)
- Openrouter.ai (AI models integration for flashcard generation)

**Testing:**

- Vitest with React Testing Library (unit/integration testing)
- Playwright (end-to-end testing)

**CI/CD:**

- GitHub Actions (CI/CD pipeline)
- Cloudflare Pages (Hosting)

## Getting Started Locally

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Run the development server:**

   ```bash
   npm run dev
   ```

3. **Access the app:**
   Open [http://localhost:3001](http://localhost:3001) in your browser.

## Available Scripts

- `npm run dev` - Starts the development server.
- `npm run build` - Builds the project for production.
- `npm run preview` - Previews the production build locally.
- `npm run test` - Runs unit and integration tests with Vitest.
- `npm run test:e2e` - Runs end-to-end tests with Playwright.
- `npm run test:coverage` - Runs tests with coverage reporting.

## Deployment

The application is deployed automatically to Cloudflare Pages when changes are pushed to the `master` branch. The deployment process includes:

1. Running linting checks
2. Executing unit tests
3. Building the application
4. Deploying to Cloudflare Pages

For detailed setup instructions, see [Cloudflare Pages Deployment Setup](.github/CLOUDFLARE_SETUP.md).

### Environment Variables

The following environment variables need to be configured in your Cloudflare Pages project:

- `PUBLIC_SUPABASE_URL` - Your Supabase public URL
- `PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous key
- `SUPABASE_URL` - Your Supabase URL (server-side)
- `SUPABASE_KEY` - Your Supabase service key (server-side)
- `OPENROUTER_API_KEY` - Your OpenRouter API key
- `OPENROUTER_HTTP_REFERER` - Your HTTP referer for OpenRouter
- `OPENROUTER_MODEL_NAME` - The AI model to use (optional)
- `OPENROUTER_API_URL` - The OpenRouter API URL (optional)
- `OPENROUTER_DEFAULT_SYSTEM_MESSAGE` - Default system message for AI (optional)

## Project Scope

The scope of CardStrike Flashcards includes:

- **AI Flashcard Generation:** Input any plain text to generate flashcards via AI, review generated options, and bulk save accepted cards.
- **Manual Flashcard Creation:** Enter flashcard content manually with immediate preview and editing features.
- **Flashcard Management:** Comprehensive view, edit, and delete capabilities for all flashcards.
- **User Account System:** Secure registration, login, and password recovery functionalities.
- **Spaced Repetition Integration:** Learn efficiently with flashcards scheduled according to a repetition algorithm.

## Project Status

The project is currently in active development with a focus on building a robust MVP.

## License

This project is licensed under the MIT License.
