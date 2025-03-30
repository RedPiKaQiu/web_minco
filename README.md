# Second Brain Task Management Application - Backend API Implementation

This is the backend API implementation version of the [web_minco](https://github.com/RedPiKaQiu/web_minco.git) project, using Vercel Serverless Functions to provide backend services, including task management and AI conversation functionality.

## Project Overview

This repository is forked from the original frontend project, with the following additions:
- Backend API implementation using Vercel Serverless Functions
- CRUD operations for task management
- AI chat integration with API key support
- Mock data support

## Getting Started

### Getting the Code from GitHub

1. Clone the repository
```bash
git clone https://github.com/Rona-dt/web_minco_backend.git
cd web_minco_backend
```

2. Install dependencies
```bash
npm install
# Install necessary dependencies
npm install express @types/express dotenv
npm install openai
npm install -g vercel # Install Vercel CLI
```

3. Configure environment variables
Create a `.env` file and add:
```
API_KEY=<Replace with your API Key>
```

4. Run locally
```bash
vercel dev
```
The application will start locally, typically accessible at http://localhost:3000.

5. Build the project
```bash
npm run build
```
Built files will be output to the `dist` directory.

## Deployment

This project uses Vercel Serverless Functions for backend API implementation:

1. Register an account on [Vercel](https://vercel.com) and connect to your GitHub repository
2. Import the project
3. Add the `API_KEY` environment variable in your Vercel project settings
4. Click deploy to complete deployment

## API Documentation

The project includes the following API endpoints:

- `/api/tasks` - Task Management
  - GET: Retrieve task list
  - POST: Create new task
- `/api/chat` - AI Conversation
  - POST: Send message and receive AI response

## Tech Stack

- React 18
- TypeScript
- Vite
- Express (Serverless Functions)
- Tailwind CSS
- Lucide React (Icon library)
- React Router
- Headless UI
- Vercel Serverless Functions
- OpenAI API Integration
- Node.js

## Development Notes

1. Use `vercel dev` command for local development to support Serverless Functions
2. API implementations are located in the `/api` directory
3. Currently using mock data for development, may migrate to standalone backend service later
4. The chat functionality (chat.ts) needs to be modified according to your specific AI model and API implementation

## Differences from Original Project

1. Added complete backend API implementation
2. Integrated AI chat functionality
3. Replaced pure frontend implementation with Vercel Serverless Functions
4. Added mock data support

## Important Notes

- Ensure `.env` file is added to `.gitignore`
- Local development must use `vercel dev` instead of `npm run dev`
- Requires a Vercel account and Vercel CLI installation
- Requires an API key for your chosen AI model
- The chat implementation (chat.ts) needs to be modified based on your specific AI model and API requirements