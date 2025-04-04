# Gaia Web3 Voting Starter Monorepo

A decentralized voting application built with Next.js, Hardhat, and [Gaia](https://docs.gaianet.ai/intro/).

## About Gaia

[Gaia](https://docs.gaianet.ai/intro/) is a decentralized computing infrastructure that enables everyone to create, deploy, scale, and monetize their own AI agents. This project uses Gaia's AI capabilities to provide an intelligent agent for blockchain voting interactions.

## About Alchemy

[Alchemy](https://www.alchemy.com/) is the complete web3 development platform for wallets, rollups, and apps. It provides:

- **Supernode**: The web3 engine powering our suite of APIs
- **Smart Wallets**: Securely onboard users with no seed phrase or gas fees
- **Transaction APIs**: 7.9x faster, 100% success rate with simulation and protection
- **Data APIs**: Reliable read APIs for token balances, NFT data, and more
- **Webhooks**: Fast, consistent push notifications for blockchain events

This project uses Alchemy to connect to the Linea Sepolia testnet and interact with smart contracts.

## Project Structure

```
gaia-web3-voting-starter/
├── packages/
│   ├── blockchain/           # Smart contracts and blockchain code
│   │   ├── contracts/        # Solidity smart contracts
│   │   ├── ignition/         # Hardhat Ignition deployment scripts
│   │   ├── scripts/          # Hardhat scripts
│   │   ├── test/             # Contract tests
│   │   └── hardhat.config.ts # Hardhat configuration
│   │
│   └── site/                 # Next.js frontend application
│       ├── app/              # Next.js app router
│       │   ├── api/          # API routes
│       │   ├── chat/         # Chat page
│       │   └── page.tsx      # Home page
│       ├── components/       # React components
│       │   ├── chat/         # Chat-related components
│       │   └── ui/           # UI components (button, card, etc.)
│       ├── ai/               # AI integration
│       │   └── tools.ts      # AI tools for blockchain interaction
│       └── public/           # Static assets
```

## Features

- **Decentralized Voting**: Create and participate in on-chain voting
- **AI Agent**: Interactive chat interface with blockchain knowledge
- **Factory Smart Contract**: Deploy new voting instances

## Getting Started

### Prerequisites

- Node.js installed
- A wallet with some test ETH on Linea Sepolia
- [Alchemy](https://www.alchemy.com/) API key 
### Setup

1. Clone the repository:
```bash
git clone git@github.com:meowyx/gaia-web3-voting-starter.git
cd gaia-web3-voting-starter
```

2. Install dependencies:
```bash
pnpm install
```

3. Configure environment variables:
```bash
# In packages/blockchain
cp .env.example .env
# Add your Alchemy API key and wallet private key
```

4. Compile and deploy contracts:
```bash
cd packages/blockchain
npx hardhat compile
npx hardhat ignition deploy ignition/modules/votingFactory.ts --network linea-testnet
```

5. Start the frontend:
```bash
cd packages/site
pnpm dev
```

## Architecture

- **Smart Contracts**: Factory pattern for deploying voting instances
- **Frontend**: Next.js with AI-powered chat interface
- **Blockchain**: Linea Sepolia testnet for deployment
- **AI Integration**: Custom tools for blockchain interaction

## Resources

- [Gaia Documentation](https://docs.gaianet.ai/intro/)
- [Alchemy Documentation](https://docs.alchemy.com/)
- [Linea Explorer](https://sepolia.lineascan.build/)


