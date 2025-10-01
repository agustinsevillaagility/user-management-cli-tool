import { ManagementClient } from 'auth0';
import { 
  Auth0Config, 
  Auth0User, 
  Auth0Organization, 
  Auth0Role
} from './types';

export class Auth0Client {
  private managementClient: ManagementClient;

  constructor(config: Auth0Config) {
    // Remove scope from constructor - it's handled by the token permissions
    this.managementClient = new ManagementClient({
      domain: config.domain,
      token: config.token
    });
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
      const users = await this.managementClient.usersByEmail.getByEmail({ email });
      return users.data as Auth0User[];
    } catch (error) {
      throw this.handleError(error);
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
   * Get all organizations
   * @returns Promise resolving to an array of Auth0 organizations
   */
  async getOrganizations(): Promise<Auth0Organization[]> {
    try {
      const response = await this.managementClient.organizations.getAll();
      return response.data as Auth0Organization[];
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get all roles
   * @returns Promise resolving to an array of Auth0 roles
   */
  async getRoles(): Promise<Auth0Role[]> {
    try {
      const response = await this.managementClient.roles.getAll();
      return response.data as Auth0Role[];
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Add members to an organization
   * @param organizationId - The ID of the organization
   * @param members - Array of member objects with user_id and optional roles
   * @returns Promise resolving to the response
   */
  async addMembersToOrganization(
    organizationId: string, 
    members: { user_id: string; roles?: string[] }[]
  ): Promise<void> {
    try {
      await this.managementClient.organizations.addMembers(
        { id: organizationId },
        { members: members.map(m => m.user_id) }
      );

      // If roles are specified, we need to assign them separately
      for (const member of members) {
        if (member.roles && member.roles.length > 0) {
          await this.managementClient.organizations.addMemberRoles(
            { id: organizationId, user_id: member.user_id },
            { roles: member.roles }
          );
        }
      }
    } catch (error) {
      throw this.handleError(error);
    }
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
   * Handle and transform Auth0 SDK errors
   * @param error - Auth0 SDK error object
   * @returns Transformed error
   */
  private handleError(error: any): Error {
    // Auth0 SDK errors typically have a message and statusCode
    if (error.statusCode) {
      const message = error.message || 'Auth0 API Error';
      const enhancedError = new Error(`Auth0 API Error (${error.statusCode}): ${message}`);
      (enhancedError as any).statusCode = error.statusCode;
      (enhancedError as any).originalError = error;
      return enhancedError;
    } else if (error.message) {
      return new Error(`Auth0 API: ${error.message}`);
    } else {
      return new Error(`Auth0 API: ${String(error)}`);
    }
  }
}