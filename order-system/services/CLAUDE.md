# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Event-driven order processing microservices system built with Node.js/TypeScript. Services communicate asynchronously via AWS SNS/SQS.

## Build & Run Commands

### Individual Service Development
```bash
cd order-system/services/<service-name>
npm install
npm run dev      # Development with hot reload (ts-node-dev)
npm run build    # Compile TypeScript to dist/
npm start        # Run compiled JavaScript
```

### All Services via Docker Compose
```bash
cd order-system/services
docker-compose up --build
```

## Architecture

### Services and Ports
| Service | Port | Database | Purpose |
|---------|------|----------|---------|
| order-service | 3001 | PostgreSQL (Sequelize) | Order CRUD, publishes OrderCreated events |
| inventory-service | 3002 | DynamoDB | Consumes orders, updates stock, publishes InventoryUpdated |
| notification-service | - | - | Worker-only, sends email confirmations |
| intelligence-service | 3004 | PostgreSQL + DynamoDB (read) | AI business insights via AWS Bedrock |
| payment-service | 3003 | - | Stub service |

### Event Flow
```
HTTP POST /orders → Order Service → PostgreSQL
                         ↓
                    SNS (OrderCreated)
                         ↓
              ┌─────────────────────┐
              ↓                     ↓
    Inventory Service        Notification Service
         (SQS)                     (SQS)
              ↓
         DynamoDB
              ↓
    SNS (InventoryUpdated)
              ↓
    Order Service (SQS worker)
         updates status
```

### AWS Services
- **SNS**: Event topics (order-events-topic)
- **SQS**: Service queues with 20-second long polling
- **DynamoDB**: Inventory table
- **Bedrock**: AI insights (Google Gemma 3.4B model)
- **Secrets Manager**: Configuration secrets

## Code Structure Pattern

Each service follows this structure:
```
src/
├── app.ts or index.ts    # Bootstrap & Express server
├── config/               # Database, AWS, env configuration
├── controllers/          # HTTP request handlers
├── services/             # Business logic
├── routes/               # Express route definitions
├── models/               # Database models (Sequelize)
├── events/               # SNS publishers
├── workers/              # SQS consumers (long-polling loops)
├── providers/            # External service integrations
└── types/                # TypeScript interfaces
```

## Key Technical Details

- **SNS→SQS message parsing**: Messages are double-wrapped, requiring `JSON.parse(JSON.parse(message.Body).Message)`
- **Worker pattern**: Infinite loops with try-catch and 5-second delay on errors
- **Database retry**: Order Service has 5-retry logic with 3-second delays for PostgreSQL connection
- **TypeScript config**: ES2020 target, node16 module, strict mode, output to `dist/`
- **Docker base**: node:20-alpine

## Environment Variables

Required for all services:
- `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`
- `PORT`

Service-specific:
- order-service: `DATABASE_URL` (PostgreSQL connection string)
- inventory-service: `SQS_QUEUE_URL`, `DYNAMODB_TABLE`
- notification-service: `NOTIFICATION_QUEUE_URL`
