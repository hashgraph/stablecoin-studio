# Webhook API

This backend provides a webhook endpoint to receive and store messages.

## Quick Start

```bash
# Install dependencies
npm install

# Start in development mode
npm run start:dev

# Start in production mode
npm run build
npm run start:prod
```

The server will start on port 3000.

## Environment Variables

Create a `.env` file with the following variables:

```env
DB_HOST=ep-morning-mud-ae048iz5.c-2.us-east-2.aws.neon.tech
DB_PORT=5432
DB_USER=neondb_owner
DB_PASSWORD=npg_4hBDNvI3WyXe
DB_NAME=neondb

PORT=3000
NODE_ENV=development
```

## API Endpoints

### Receive Webhook Message

**POST** `/webhook/messages`

**Request Body:**
```json
{
  "id": "Exemple message_1760705215603",
  "message": "Exemple message",
  "sender": "+261377943048",
  "timestamp": "2025-10-17T15:46:55.603",
  "sent": true
}
```

**Response:**
```json
{
  "success": true,
  "messageId": "uuid-generated-by-db",
  "receivedAt": "2025-10-22T07:15:00.000Z"
}
```

Note: The `message` field is stored as `body` in the database.

### Get All Messages

**GET** `/webhook/messages?limit=100`

**Response:**
```json
{
  "messages": [
    {
      "dbId": "uuid",
      "id": "Exemple message_1760705215603",
      "body": "Exemple message",
      "sender": "+261377943048",
      "timestamp": "2025-10-17T15:46:55.603",
      "sent": true,
      "receivedAt": "2025-10-22T07:15:00.000Z"
    }
  ],
  "total": 1
}
```

### Delete All Messages

**DELETE** `/webhook/messages`

**Response:** 204 No Content

## Database Schema

Table: `webhook_messages`

| Column | Type | Description |
|--------|------|-------------|
| dbId | UUID | Primary key (auto-generated) |
| id | VARCHAR(500) | Message ID from webhook |
| body | TEXT | Message content (from "message" field) |
| sender | VARCHAR(100) | Sender identifier |
| timestamp | TIMESTAMP | Original message timestamp |
| sent | BOOLEAN | Message sent status |
| receivedAt | TIMESTAMP | When webhook was received |

## Testing

Send a test webhook:

```bash
curl -X POST http://localhost:3000/webhook/messages \
  -H "Content-Type: application/json" \
  -d '{
    "id": "test_message_001",
    "message": "Hello from curl",
    "sender": "+1234567890",
    "timestamp": "2025-10-22T10:00:00.000Z",
    "sent": true
  }'
```

View messages:

```bash
curl http://localhost:3000/webhook/messages
```

## Swagger Documentation

When the server is running, visit: `http://localhost:3000/api`
