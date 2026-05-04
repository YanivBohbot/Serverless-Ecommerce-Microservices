# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Standing Rules

**Whenever anything new is added to the project** (new service, new AWS resource, new queue/topic, new endpoint, new environment variable, schema change, new dependency, etc.), Claude MUST:
1. Update this CLAUDE.md to reflect the change (services table, event flow, AWS resources, env vars, docker-compose section — whichever sections are affected).
2. Update the memory file at `C:\Users\user\.claude\projects\F--Projects-NodeJS-Microservices\memory\project_architecture.md` to keep the cross-session memory in sync.

Do not wait to be asked — these updates are mandatory after every additive or structural change.

## Project Overview

Event-driven order processing microservices system built with Node.js/TypeScript. Services communicate asynchronously via AWS SNS/SQS. All services run in Docker containers sharing a bridged network (`app-network`).

## Build & Run Commands

### Individual Service Development
```bash
cd services/<service-name>
npm install
npm run dev      # Development with hot reload (ts-node-dev --respawn)
npm run build    # Compile TypeScript to dist/
npm start        # Run compiled JavaScript from dist/
```

### All Services via Docker Compose
```bash
cd services
docker-compose up --build
```

## Architecture

### Services and Ports

| Service | Port | Database | Purpose |
|---------|------|----------|---------|
| order-service | 3001 | PostgreSQL (Sequelize) | Order CRUD, publishes OrderCreated, consumes inventory/payment feedback |
| inventory-service | 3002 | DynamoDB (Inventory table) | Consumes OrderCreated, updates stock, publishes InventoryUpdated |
| payment-service | 3003 | DynamoDB (Payments table) | Consumes OrderCreated, authorizes payment, publishes PaymentProcessed |
| intelligence-service | 3004 | PostgreSQL + DynamoDB (read) | AI business insights via AWS Bedrock |
| notification-service | — | — | Worker-only, consumes events, sends email confirmations |
| search-service | 3005 | Elasticsearch | Consumes all SNS topics, indexes into ES, exposes search + analytics API |
| dashboard | 5173 | — | React/TypeScript dev UI (Vite). Proxies /api/search → 3005, /api/insights → 3004 |

### Event Flow

```
HTTP POST /orders
      │
      ▼
Order Service ──► PostgreSQL (save order)
      │
      ▼
SNS: order-events-topic (OrderCreated)
      │
      ├──────────────────────────────────────────┐
      ▼                                          ▼
Inventory Service (SQS: inventory-queue)   Payment Service (SQS: payment-queue)
      │  updates DynamoDB Inventory table         │  writes DynamoDB Payments table
      │  publishes InventoryUpdated               │  publishes PaymentProcessed
      ▼                                          ▼
SNS: order-events-topic                  SNS: payment-events-topic
      │                                          │
      ▼                                          ▼
Order Service (SQS: order-update-queue)   Notification Service (SQS: notification-queue)
      │  updates order status in PostgreSQL       │  sends email confirmation
      ▼
 COMPLETED / FAILED
```

### AWS Resources

| Resource | Type | ARN / URL |
|----------|------|-----------|
| order-events-topic | SNS | `arn:aws:sns:us-east-1:584246028688:order-events-topic` |
| payment-events-topic | SNS | `arn:aws:sns:us-east-1:584246028688:payment-events-topic` |
| payment-queue | SQS | `https://sqs.us-east-1.amazonaws.com/584246028688/payment-queue` |
| notification-queue | SQS | `https://sqs.us-east-1.amazonaws.com/584246028688/notification-queue` |
| Inventory | DynamoDB table | us-east-1 |
| Payments | DynamoDB table | us-east-1 |
| Bedrock | AI model | Google Gemma 3.4B (`google.gemma-3-4b-it-v1:0`) |

## Code Structure Pattern

Each service follows this structure:
```
src/
├── app.ts or index.ts    # Bootstrap & Express server (or worker entry)
├── config/               # Database, AWS, env configuration
├── controllers/          # HTTP request handlers
├── services/             # Business logic
├── routes/               # Express route definitions
├── models/               # Database models (Sequelize — order-service only)
├── events/               # SNS publishers
├── workers/ or worker/   # SQS consumers (long-polling loops)
├── providers/            # External service integrations (Bedrock, email)
└── types/                # TypeScript interfaces
```

## Key Technical Details

### AWS SDK Versions (mixed — do not change per service)
- **aws-sdk v2**: `order-service` (SQS worker, SNS publisher), `inventory-service` (SQS worker, SNS publisher, DynamoDB)
- **@aws-sdk v3**: `payment-service`, `notification-service`, `intelligence-service`

### Message Parsing
SNS→SQS messages are double-wrapped — always parse twice:
```ts
const body = JSON.parse(message.Body!);         // SQS envelope
const data = JSON.parse(body.Message);           // SNS payload
```
`inventory-service` additionally guards for the case where `body.Message` is already an object.

### Worker Pattern
- Infinite `while (true)` loop with 20-second long polling (`WaitTimeSeconds: 20`)
- `try-catch` inside the loop; on error: log, optionally publish FAILED event, delete message, sleep 5s
- `notification-service` and `payment-service` use `running` flag + SIGTERM/SIGINT handlers for graceful shutdown
- Workers start inside the `app.listen` callback (after server is up)

### Databases
- **PostgreSQL**: order-service (Sequelize ORM, `Orders` table). 5-retry connection logic with 3s delays before server starts
- **DynamoDB Inventory**: `productId` as partition key, `quantity` field decremented on each order
- **DynamoDB Payments**: `orderId` as partition key, `status` (`AUTHORIZED` | `FAILED`), `processedAt`

### Payment Service — full implementation
- Reads `OrderCreated` from `payment-queue` (subscribed to `order-events-topic`)
- Writes payment record to DynamoDB `Payments` table with status `AUTHORIZED`
- Publishes `PaymentProcessed` to `payment-events-topic` with `MessageAttribute` `eventType=PaymentProcessed`
- Exposes `GET /payments/:orderId` to query payment status
- Health check at `GET /health`

### Intelligence Service
- `GET /insights` triggers `getBusinessInsights()` which reads last 10 orders from PostgreSQL and full inventory from DynamoDB, then sends combined data to Bedrock for analysis
- Uses `@aws-sdk/client-dynamodb` + `unmarshall` for DynamoDB reads

### TypeScript Config
- Target: `ES2020`, module: `node16`, strict mode enabled, output to `dist/`
- Docker base image: `node:20-alpine`

## Environment Variables

**Required for all services:**
```
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
AWS_REGION=us-east-1
PORT
```

**Service-specific:**
```
# order-service
DATABASE_URL          # PostgreSQL: postgres://user:pass@host:5432/db
SNS_TOPIC_ARN         # order-events-topic ARN
SQS_ORDER_UPDATE_URL  # SQS queue for inventory/payment feedback

# inventory-service
SQS_QUEUE_URL         # inventory SQS queue URL
DYNAMODB_TABLE        # "Inventory"

# payment-service
PAYMENT_QUEUE_URL     # payment SQS queue URL
PAYMENT_TOPIC_ARN     # payment-events-topic ARN
DYNAMODB_TABLE        # "Payments"

# notification-service
NOTIFICATION_QUEUE_URL

# intelligence-service
DATABASE_URL          # same PostgreSQL as order-service

# search-service
ELASTICSEARCH_URL           # http://elasticsearch:9200
SEARCH_ORDER_QUEUE_URL      # SQS queue subscribed to order-events-topic
SEARCH_INVENTORY_QUEUE_URL  # SQS queue subscribed to inventory-events-topic
SEARCH_PAYMENT_QUEUE_URL    # SQS queue subscribed to payment-events-topic
```

## Docker Compose

Nine containers on `app-network` bridge:
1. `postgres-db` — PostgreSQL 15, port `5444:5432`, DB `orders_final_db`
2. `order_service_app` — port `3001:3001`, depends on postgres-db
3. `inventory_service_app` — port `3002:3002`
4. `notification_service_app` — no exposed port, depends on order + inventory
5. `intelligence_service_app` — port `3004:3004`, depends on postgres-db
6. `payment_service_app` — port `3003:3003`, depends on order-service
7. `elasticsearch` — port `9200:9200`, single-node, security disabled (dev), persistent volume
8. `kibana` — port `5601:5601`, depends on elasticsearch
9. `search_service_app` — port `3005:3005`, depends on elasticsearch

AWS credentials are injected from the `.env` file in `services/` via `${AWS_ACCESS_KEY_ID}` / `${AWS_SECRET_ACCESS_KEY}`.
