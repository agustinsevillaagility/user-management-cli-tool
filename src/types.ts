/**
 * Auth0 Management API Types
 */

export interface Auth0Config {
  domain: string;
  token: string;
  baseUrl?: string;
}

export interface Auth0User {
  user_id: string;
  email: string;
  email_verified: boolean;
  name?: string;
  nickname?: string;
  picture?: string;
  created_at: string;
  updated_at: string;
  identities: Auth0Identity[];
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

export interface Auth0Identity {
  connection: string;
  user_id: string;
  provider: string;
  isSocial: boolean;
}

export interface Auth0Error {
  error: string;
  error_description: string;
  statusCode: number;
}

export interface UsersByEmailResponse {
  users: Auth0User[];
  start: number;
  limit: number;
  total: number;
}