import { ManagementClient, type ManagementClientOptionsWithToken } from 'auth0';

export class Auth0Client {
    private managementClient: ManagementClient;

    constructor(config: ManagementClientOptionsWithToken) {
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
    async getUsersByEmail(email: string) {
        const sanitizedEmail = email.trim();
        if (!sanitizedEmail || !this.isValidEmail(sanitizedEmail)) {
            throw new Error('Invalid email address provided');
        }

        try {
            /**
             * Find users by email. If Auth0 is the identity provider (idP), the email address associated with a user is saved in lower case, regardless of how you initially provided it.
             * For example, if you register a user as JohnSmith@example.com, Auth0 saves the user's email as johnsmith@example.com.
             * Therefore, when using this endpoint, make sure that you are searching for users via email addresses using the correct case.
             */
            const users = await this.managementClient.usersByEmail.getByEmail({ email: sanitizedEmail.toLowerCase() });
            return users.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    /**
     * Get a single user by email (returns first match)
     * @param email - The email address to search for
     * @returns Promise resolving to a single Auth0 user or null if not found
     * @throws Error if multiple users are found with the same email address
     */
    async getUserByEmail(email: string) {
        const users = await this.getUsersByEmail(email);
        if (!users || users.length > 1) {
            throw new Error('Aborting… Multiple users found with the same email address');
        }
        return users.length > 0 ? users[0] : null;
    }

    /**
     * Get all organizations
     * @returns Promise resolving to an array of Auth0 organizations
     */
    async getOrganizations() {
        try {
            const response = await this.managementClient.organizations.getAll();
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    /**
     * Get all roles
     * @returns Promise resolving to an array of Auth0 roles
     */
    async getRoles() {
        try {
            const response = await this.managementClient.roles.getAll();
            return response.data;
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
        members: { user_id: string; roles: string[] }[]
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