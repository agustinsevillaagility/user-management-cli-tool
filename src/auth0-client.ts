import axios, { AxiosInstance, AxiosError } from 'axios';
import { Auth0Config, Auth0User, Auth0Error } from './types';

export class Auth0Client {
  private httpClient: AxiosInstance;
  private config: Auth0Config;

  constructor(config: Auth0Config) {
    this.config = {
      ...config,
      baseUrl: config.baseUrl || `https://${config.domain}/api/v2`
    };

    this.httpClient = axios.create({
      baseURL: this.config.baseUrl,
      headers: {
        'Authorization': `Bearer ${this.config.token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      timeout: 10000
    });

    // Add response interceptor for error handling
    this.httpClient.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        return Promise.reject(this.handleError(error));
      }
    );
  }

  /**
   * Look up users by email address
   * @param email - The email address to search for
   * @returns Promise resolving to an array of Auth0 users
   */
  async getUsersByEmail(email: string): Promise<Auth0User[]> {
    if (!email || !this.isValidEmail(email)) {
      throw new Error('Invalid email address provided');
    }

    try {
      const response = await this.httpClient.get('/users-by-email', {
        params: {
          email: email
        }
      });

      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get a single user by email (returns first match)
   * @param email - The email address to search for
   * @returns Promise resolving to a single Auth0 user or null if not found
   */
  async getUserByEmail(email: string): Promise<Auth0User | null> {
    const users = await this.getUsersByEmail(email);
    return users.length > 0 ? users[0] : null;
  }

  /**
   * Validate email format
   * @param email - Email to validate
   * @returns boolean indicating if email is valid
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Handle and transform Axios errors
   * @param error - Axios error object
   * @returns Transformed error
   */
  private handleError(error: AxiosError): Error {
    if (error.response) {
      // Server responded with error status
      const auth0Error = error.response.data as Auth0Error;
      const message = auth0Error?.error_description || error.message;
      const statusCode = error.response.status;
      
      const enhancedError = new Error(`Auth0 API Error (${statusCode}): ${message}`);
      (enhancedError as any).statusCode = statusCode;
      (enhancedError as any).auth0Error = auth0Error;
      
      return enhancedError;
    } else if (error.request) {
      // Request was made but no response received
      return new Error('Auth0 API: No response received from server');
    } else {
      // Something else happened
      return new Error(`Auth0 API: ${error.message}`);
    }
  }
}