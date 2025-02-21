# Aptos AI Developer Assistant 🤖

<div align="center">
  <img src="public/images/aptos-white.svg" alt="Aptos AI Dev Assistant Logo" width="200"/>
  <h3>Your Intelligent Companion for Aptos Development</h3>
</div>

<p align="center">
  <a href="#features">Features</a> ·
  <a href="#tech-stack">Tech Stack</a> ·
  <a href="#getting-started">Getting Started</a> ·
  <a href="#architecture">Architecture</a>
</p>

## Overview

The Aptos AI Developer Assistant is an intelligent chatbot that combines Move Agent Kit with AI capabilities to provide interactive blockchain operations and development assistance. It enables secure interaction with the Aptos blockchain through authenticated sessions and supports various DeFi operations across Panora and Aries protocols.

## Features

### 🔗 Blockchain Operations

- **Transaction Management**
  - View transaction details
  - Monitor transaction status
  - Account resource inspection
- **Token Operations**

  - Get token prices and details
  - Token creation and burning
  - Balance checking
  - NFT burning capabilities

- **DeFi Integration**
  - Swap tokens through Panora
  - Aries protocol lending
  - Pool details and user position tracking
  - Profile creation for Aries

### 🔐 Security Features

- Authenticated sessions
- Secure private key management
- Network-specific configurations
- User-specific chat history

### 💬 Chat Interface

- Real-time streaming responses
- Persistent chat history
- Message reasoning tracking
- Error handling and recovery

## Tech Stack

- **Core Framework**: Next.js 15, TypeScript
- **Blockchain Integration**:
  - Move Agent Kit
  - Aptos TypeScript SDK
- **AI Components**:
  - Vercel AI SDK
  - Custom language model integration
- **Authentication**:
  - NextAuth.js
- **Data Storage**:
  - Database for chat persistence
  - Vector store for context retrieval

## Getting Started

### Prerequisites

```bash
Node.js 18+
pnpm
```

### Required Environment Variables

```env
# Authentication
AUTH_SECRET=your_auth_secret

# Blockchain
APTOS_PRIVATE_KEY=your_private_key

# AI/ML
LANGUAGE_MODEL_API_KEY=your_api_key

# DeFi Integration
PANORA_API_KEY=your_panora_api_key
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

### Available Tools

The assistant supports the following blockchain operations:

```typescript
experimental_activeTools: [
  // Transaction & Account
  "getTransaction",
  "getAccountResources",
  "getBalance",

  // Token Operations
  "getTokenPrice",
  "getTokenDetails",
  "createToken",
  "burnToken",
  "burnNFT",

  // DeFi Operations
  "getPoolDetails",
  "getUserPosition",
  "swapWithPanora",
  "createAriesProfile",
  "lendAriesToken",
  "withdrawEchelonToken",
];
```

### Response Processing

The system implements:

- Real-time text streaming with word-level chunking
- Message ID generation for tracking
- Response sanitization before storage
- Comprehensive error handling

### Data Flow

1. User authentication verification
2. Private key validation
3. Context retrieval
4. Tool execution
5. Response streaming
6. Message persistence

## Development

### Local Development

```bash
pnpm dev
```

### Build for Production

```bash
pnpm build
pnpm start
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

<p align="center">Built with ❤️ for the Aptos Developer Community</p>
