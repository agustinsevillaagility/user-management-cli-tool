# Auth0 API Wrapper

A TypeScript wrapper for the Auth0 Management API.

## Features

- User lookup by email
- Type-safe API responses
- Comprehensive error handling

## Installation

```bash
npm install
npm run build
```

## Usage

```typescript
import { Auth0Client } from './src/auth0-client';

const client = new Auth0Client({
  domain: 'your-domain.auth0.com',
  token: 'your-management-api-token'
});

// Look up user by email
const user = await client.getUserByEmail('user@example.com');
```

## Environment Variables

Create a `.env` file with:

```
AUTH0_DOMAIN=your-domain.auth0.com
AUTH0_MANAGEMENT_TOKEN=your-management-api-token
```