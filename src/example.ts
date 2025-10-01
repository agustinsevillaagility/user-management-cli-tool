/**
 * Example usage of the Auth0 API wrapper
 */

import * as dotenv from 'dotenv';
import { Auth0Client } from './auth0-client';

// Load environment variables from .env file
dotenv.config();

async function main() {
  // Initialize the Auth0 client
  const auth0Client = new Auth0Client({
    domain: process.env.AUTH0_DOMAIN || 'your-domain.auth0.com',
    token: process.env.AUTH0_MANAGEMENT_TOKEN || 'your-management-api-token'
  });

  try {
    // Example: Look up a user by email
    const email = 'user@example.com';
    console.log(`Looking up user with email: ${email}`);
    
    const user = await auth0Client.getUserByEmail(email);
    
    if (user) {
      console.log('User found:', {
        user_id: user.user_id,
        email: user.email,
        name: user.name,
        email_verified: user.email_verified,
        created_at: user.created_at
      });
    } else {
      console.log('No user found with that email address');
    }

    // Example: Get all users with a specific email (in case of duplicates)
    const users = await auth0Client.getUsersByEmail(email);
    console.log(`Found ${users.length} user(s) with email ${email}`);

  } catch (error) {
    console.error('Error occurred:', error instanceof Error ? error.message : String(error));
    
    // Check if it's an Auth0 API error with additional info
    if (error instanceof Error && (error as any).statusCode) {
      console.error('Status Code:', (error as any).statusCode);
      console.error('Auth0 Error:', (error as any).auth0Error);
    }
  }
}

// Run the example if this file is executed directly
if (require.main === module) {
  main().catch(console.error);
}