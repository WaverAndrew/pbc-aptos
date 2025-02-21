# Aptos AI Developer Assistant 🤖

<div align="center">
  <img src="public/images/Aptos_Primary_BLK.svg" alt="Aptos AI Dev Assistant Logo" width="200"/>
  <h3>Your Intelligent Companion for Aptos Development</h3>
</div>

<p align="center">
  <a href="#features">Features</a> ·
  <a href="#tech-stack">Tech Stack</a> ·
  <a href="#getting-started">Getting Started</a> ·
  <a href="#architecture">Architecture</a> ·
  <a href="#deployment">Deployment</a>
</p>

## Overview

The Aptos AI Developer Assistant is an intelligent chatbot designed to streamline the Aptos development experience. Built with advanced RAG (Retrieval-Augmented Generation) technology, it provides accurate, context-aware answers to technical questions about Move smart contracts, tooling, and deployments while maintaining the highest standards of accuracy and reliability.

## Features

### 🔍 RAG-Enhanced Search
- Full access to Aptos documentation and Code examples
- Intelligent context understanding and relevant response generation
- Direct source citations for all provided information

### 💻 Smart Code Presentation
- Syntax-highlighted code blocks with copy functionality
- Context-aware code snippets


### 🎯 Developer-Focused UI
- Custom-designed interface matching Aptos branding
- Intuitive navigation and interaction
- Mobile-responsive design

### 🔄 Interactive Features
- Smart query suggestions
- One-click access to similar asked questions

### 📚 Knowledge Integration
- GitHub integration for community discussions context
- Aptos documentation and Code examples
- Code examples from Aptos GitHub repositories


### 🧠 Enhanced Intelligence
- Zero hallucination architecture
- Source verification for all responses
- Confidence scoring system

### 💬 Advanced Chat Features
- Persistent chat history
- Editable message bubbles
- Context-aware conversation threading

## Tech Stack

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui, Radix UI
- **AI/ML**: Vercel AI SDK, OpenAI
- **Authentication**: NextAuth.js
- **Data Storage**: Neon Postgres, Vercel Blob
- **Vector Store**: Pinecone

## Getting Started

### Prerequisites

```bash
Node.js 18+
pnpm
```

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/aptos-ai-assistant.git
cd aptos-ai-assistant
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Start the development server:
```bash
pnpm dev
```

## Architecture

### RAG Implementation
Our RAG system processes Aptos documentation and GitHub repositories through the following pipeline:
1. Custom GitHub scraping of repositories for examples and documentation
   - Automated repository discovery and cloning
   - Parsing of Markdown, code files, and repository structures
   - Extraction of code examples and documentation comments
2. Document chunking and preprocessing
3. Embedding generation for both documentation and code
4. Vector store indexing with metadata
5. Real-time retrieval and context injection with code-aware ranking

### Response Generation
- Source attribution
- Confidence scoring
- Hallucination prevention

## Deployment

### Local Development
```bash
pnpm dev
```

### Production Deployment
```bash
pnpm build
pnpm start
```


<p align="center">Built with ❤️ for the Aptos Developer Community</p>
