/**
 * Auth0 Management API Types using official SDK
 */

import { ManagementClient } from 'auth0';

export interface Auth0Config {
  domain: string;
  token: string;
  scope?: string;
}

// These interfaces match the Auth0 API response structure
// We'll use these until we can properly type the SDK responses
export interface Auth0User {
  user_id: string;
  email: string;
  email_verified: boolean;
  name?: string;
  nickname?: string;
  picture?: string;
  created_at: string;
  updated_at: string;
  identities?: Array<{
    connection: string;
    user_id: string;
    provider: string;
    isSocial: boolean;
  }>;
  app_metadata?: Record<string, any>;
  user_metadata?: Record<string, any>;
  given_name?: string;
  family_name?: string;
  last_ip?: string;
  last_login?: string;
  logins_count?: number;
  blocked?: boolean;
  phone_number?: string;
  phone_verified?: boolean;
}

export interface Auth0Organization {
  id: string;
  name: string;
  display_name?: string;
  branding?: {
    logo_url?: string;
    colors?: {
      primary?: string;
      page_background?: string;
    };
  };
  metadata?: Record<string, any>;
}

export interface Auth0Role {
  id: string;
  name: string;
  description?: string;
}

// Management client type for dependency injection
export type Auth0ManagementClient = ManagementClient;