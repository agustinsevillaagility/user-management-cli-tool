import { Auth0Client } from '../src/auth0-client';
import { ManagementClient } from 'auth0';

// Mock the Auth0 ManagementClient
jest.mock('auth0');

const MockedManagementClient = ManagementClient as jest.MockedClass<typeof ManagementClient>;

describe('Auth0Client', () => {
  let auth0Client: Auth0Client;
  let mockUsersByEmail: jest.MockedFunction<any>;
  let mockOrganizations: { getAll: jest.MockedFunction<any>; addMembers: jest.MockedFunction<any>; addMemberRoles: jest.MockedFunction<any> };
  let mockRoles: { getAll: jest.MockedFunction<any> };

  const mockConfig = {
    domain: 'test.auth0.com',
    token: 'test-token'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup mocks
    mockUsersByEmail = {
      getByEmail: jest.fn()
    };
    
    mockOrganizations = {
      getAll: jest.fn(),
      addMembers: jest.fn(),
      addMemberRoles: jest.fn()
    };
    
    mockRoles = {
      getAll: jest.fn()
    };

    MockedManagementClient.mockImplementation(() => ({
      usersByEmail: mockUsersByEmail,
      organizations: mockOrganizations,
      roles: mockRoles
    } as any));

    auth0Client = new Auth0Client(mockConfig);
  });

  describe('constructor', () => {
    it('should create ManagementClient with correct config', () => {
      expect(ManagementClient).toHaveBeenCalledWith({
        domain: mockConfig.domain,
        token: mockConfig.token
      });
    });
  });

  describe('getUsersByEmail', () => {
    const testEmail = 'test@example.com';
    const mockUsers = [
      {
        user_id: 'auth0|123',
        email: 'test@example.com',
        name: 'Test User',
        email_verified: true
      }
    ];

    it('should return users for valid email', async () => {
      mockUsersByEmail.getByEmail.mockResolvedValue({
        data: mockUsers
      } as any);

      const result = await auth0Client.getUsersByEmail(testEmail);

      expect(mockUsersByEmail.getByEmail).toHaveBeenCalledWith({
        email: testEmail.toLowerCase()
      });
      expect(result).toEqual(mockUsers);
    });

    it('should convert email to lowercase', async () => {
      const upperCaseEmail = 'TEST@EXAMPLE.COM';
      mockUsersByEmail.getByEmail.mockResolvedValue({
        data: mockUsers
      } as any);

      await auth0Client.getUsersByEmail(upperCaseEmail);

      expect(mockUsersByEmail.getByEmail).toHaveBeenCalledWith({
        email: upperCaseEmail.toLowerCase()
      });
    });

    it('should trim email whitespace', async () => {
      const emailWithSpaces = '  test@example.com  ';
      mockUsersByEmail.getByEmail.mockResolvedValue({
        data: mockUsers
      } as any);

      await auth0Client.getUsersByEmail(emailWithSpaces);

      expect(mockUsersByEmail.getByEmail).toHaveBeenCalledWith({
        email: emailWithSpaces.trim().toLowerCase()
      });
    });

    it('should throw error for invalid email format', async () => {
      const invalidEmail = 'not-an-email';

      await expect(auth0Client.getUsersByEmail(invalidEmail))
        .rejects
        .toThrow('Invalid email address provided');

      expect(mockUsersByEmail.getByEmail).not.toHaveBeenCalled();
    });

    it('should throw error for empty email', async () => {
      await expect(auth0Client.getUsersByEmail(''))
        .rejects
        .toThrow('Invalid email address provided');

      expect(mockUsersByEmail.getByEmail).not.toHaveBeenCalled();
    });

    it('should handle Auth0 API errors', async () => {
      const mockError = {
        statusCode: 404,
        message: 'User not found'
      };
      mockUsersByEmail.getByEmail.mockRejectedValue(mockError);

      await expect(auth0Client.getUsersByEmail(testEmail))
        .rejects
        .toThrow('Auth0 API Error (404): User not found');
    });

    it('should handle errors without status code', async () => {
      const mockError = {
        message: 'Network error'
      };
      mockUsersByEmail.getByEmail.mockRejectedValue(mockError);

      await expect(auth0Client.getUsersByEmail(testEmail))
        .rejects
        .toThrow('Auth0 API: Network error');
    });
  });

  describe('getUserByEmail', () => {
    const testEmail = 'test@example.com';

    it('should return first user when one user found', async () => {
      const mockUser = {
        user_id: 'auth0|123',
        email: 'test@example.com',
        name: 'Test User'
      };
      mockUsersByEmail.getByEmail.mockResolvedValue({
        data: [mockUser]
      } as any);

      const result = await auth0Client.getUserByEmail(testEmail);

      expect(result).toEqual(mockUser);
    });

    it('should return null when no users found', async () => {
      mockUsersByEmail.getByEmail.mockResolvedValue({
        data: []
      } as any);

      const result = await auth0Client.getUserByEmail(testEmail);

      expect(result).toBeNull();
    });

    it('should throw error when multiple users found', async () => {
      const mockUsers = [
        { user_id: 'auth0|123', email: 'test@example.com' },
        { user_id: 'auth0|456', email: 'test@example.com' }
      ];
      mockUsersByEmail.getByEmail.mockResolvedValue({
        data: mockUsers
      } as any);

      await expect(auth0Client.getUserByEmail(testEmail))
        .rejects
        .toThrow('Aborting… Multiple users found with the same email address');
    });
  });

  describe('getOrganizations', () => {
    const mockOrganizationData = [
      {
        id: 'org_123',
        name: 'Test Org',
        display_name: 'Test Organization'
      }
    ];

    it('should return organizations', async () => {
      mockOrganizations.getAll.mockResolvedValue({
        data: mockOrganizationData
      } as any);

      const result = await auth0Client.getOrganizations();

      expect(mockOrganizations.getAll).toHaveBeenCalled();
      expect(result).toEqual(mockOrganizationData);
    });

    it('should handle Auth0 API errors', async () => {
      const mockError = {
        statusCode: 403,
        message: 'Insufficient scope'
      };
      mockOrganizations.getAll.mockRejectedValue(mockError);

      await expect(auth0Client.getOrganizations())
        .rejects
        .toThrow('Auth0 API Error (403): Insufficient scope');
    });
  });

  describe('getRoles', () => {
    const mockRoleData = [
      {
        id: 'role_123',
        name: 'Admin',
        description: 'Administrator role'
      }
    ];

    it('should return roles', async () => {
      mockRoles.getAll.mockResolvedValue({
        data: mockRoleData
      } as any);

      const result = await auth0Client.getRoles();

      expect(mockRoles.getAll).toHaveBeenCalled();
      expect(result).toEqual(mockRoleData);
    });

    it('should handle Auth0 API errors', async () => {
      const mockError = {
        statusCode: 500,
        message: 'Internal server error'
      };
      mockRoles.getAll.mockRejectedValue(mockError);

      await expect(auth0Client.getRoles())
        .rejects
        .toThrow('Auth0 API Error (500): Internal server error');
    });
  });

  describe('addMembersToOrganization', () => {
    const organizationId = 'org_123';
    const members = [
      {
        user_id: 'auth0|123',
        roles: ['role_456', 'role_789']
      }
    ];

    it('should successfully add members to organization with roles', async () => {
      mockOrganizations.addMembers.mockResolvedValue({} as any);
      mockOrganizations.addMemberRoles.mockResolvedValue({} as any);

      await auth0Client.addMembersToOrganization(organizationId, members);

      expect(mockOrganizations.addMembers).toHaveBeenCalledWith(
        { id: organizationId },
        { members: ['auth0|123'] }
      );
      expect(mockOrganizations.addMemberRoles).toHaveBeenCalledWith(
        { id: organizationId, user_id: 'auth0|123' },
        { roles: ['role_456', 'role_789'] }
      );
    });

    it('should add members without roles when roles array is empty', async () => {
      const membersWithoutRoles = [
        {
          user_id: 'auth0|123',
          roles: []
        }
      ];
      
      mockOrganizations.addMembers.mockResolvedValue({} as any);

      await auth0Client.addMembersToOrganization(organizationId, membersWithoutRoles);

      expect(mockOrganizations.addMembers).toHaveBeenCalledWith(
        { id: organizationId },
        { members: ['auth0|123'] }
      );
      expect(mockOrganizations.addMemberRoles).not.toHaveBeenCalled();
    });

    it('should add multiple members with different roles', async () => {
      const multipleMembers = [
        {
          user_id: 'auth0|123',
          roles: ['role_456']
        },
        {
          user_id: 'auth0|789',
          roles: ['role_789', 'role_abc']
        }
      ];
      
      mockOrganizations.addMembers.mockResolvedValue({} as any);
      mockOrganizations.addMemberRoles.mockResolvedValue({} as any);

      await auth0Client.addMembersToOrganization(organizationId, multipleMembers);

      expect(mockOrganizations.addMembers).toHaveBeenCalledWith(
        { id: organizationId },
        { members: ['auth0|123', 'auth0|789'] }
      );
      
      expect(mockOrganizations.addMemberRoles).toHaveBeenCalledTimes(2);
      expect(mockOrganizations.addMemberRoles).toHaveBeenNthCalledWith(1,
        { id: organizationId, user_id: 'auth0|123' },
        { roles: ['role_456'] }
      );
      expect(mockOrganizations.addMemberRoles).toHaveBeenNthCalledWith(2,
        { id: organizationId, user_id: 'auth0|789' },
        { roles: ['role_789', 'role_abc'] }
      );
    });

    it('should handle error when adding members fails', async () => {
      const mockError = {
        statusCode: 403,
        message: 'Insufficient permissions'
      };
      mockOrganizations.addMembers.mockRejectedValue(mockError);

      await expect(auth0Client.addMembersToOrganization(organizationId, members))
        .rejects
        .toThrow('Auth0 API Error (403): Insufficient permissions');

      expect(mockOrganizations.addMembers).toHaveBeenCalled();
      expect(mockOrganizations.addMemberRoles).not.toHaveBeenCalled();
    });

    it('should handle error when adding roles fails', async () => {
      const mockError = {
        statusCode: 404,
        message: 'Role not found'
      };
      mockOrganizations.addMembers.mockResolvedValue({} as any);
      mockOrganizations.addMemberRoles.mockRejectedValue(mockError);

      await expect(auth0Client.addMembersToOrganization(organizationId, members))
        .rejects
        .toThrow('Auth0 API Error (404): Role not found');

      expect(mockOrganizations.addMembers).toHaveBeenCalled();
      expect(mockOrganizations.addMemberRoles).toHaveBeenCalled();
    });

    it('should skip role assignment for members with undefined roles', async () => {
      const membersWithUndefinedRoles = [
        {
          user_id: 'auth0|123',
          roles: ['role_456']
        },
        {
          user_id: 'auth0|789',
          roles: undefined as any
        }
      ];
      
      mockOrganizations.addMembers.mockResolvedValue({} as any);
      mockOrganizations.addMemberRoles.mockResolvedValue({} as any);

      await auth0Client.addMembersToOrganization(organizationId, membersWithUndefinedRoles);

      expect(mockOrganizations.addMembers).toHaveBeenCalledWith(
        { id: organizationId },
        { members: ['auth0|123', 'auth0|789'] }
      );
      
      // Only called once for the member with roles
      expect(mockOrganizations.addMemberRoles).toHaveBeenCalledTimes(1);
      expect(mockOrganizations.addMemberRoles).toHaveBeenCalledWith(
        { id: organizationId, user_id: 'auth0|123' },
        { roles: ['role_456'] }
      );
    });
  });

  describe('isValidEmail (private method)', () => {
    // Test the private method indirectly through getUsersByEmail
    const testCases = [
      { email: 'valid@example.com', valid: true },
      { email: 'user.name@domain.co.uk', valid: true },
      { email: 'user+tag@example.org', valid: true },
      { email: 'invalid-email', valid: false },
      { email: '@example.com', valid: false },
      { email: 'user@', valid: false },
      { email: 'user@.com', valid: false },
      { email: '', valid: false },
      { email: 'user@domain', valid: false }
    ];

    testCases.forEach(({ email, valid }) => {
      it(`should ${valid ? 'accept' : 'reject'} email: ${email}`, async () => {
        if (valid) {
          mockUsersByEmail.getByEmail.mockResolvedValue({
            data: []
          } as any);
          
          await expect(auth0Client.getUsersByEmail(email)).resolves.toEqual([]);
        } else {
          await expect(auth0Client.getUsersByEmail(email))
            .rejects
            .toThrow('Invalid email address provided');
        }
      });
    });
  });

  describe('handleError (private method)', () => {
    it('should handle errors with statusCode', async () => {
      const errorWithStatus = {
        statusCode: 401,
        message: 'Unauthorized'
      };
      mockUsersByEmail.getByEmail.mockRejectedValue(errorWithStatus);

      try {
        await auth0Client.getUsersByEmail('test@example.com');
      } catch (error: any) {
        expect(error.message).toBe('Auth0 API Error (401): Unauthorized');
        expect(error.statusCode).toBe(401);
        expect(error.originalError).toEqual(errorWithStatus);
      }
    });

    it('should handle errors with message but no statusCode', async () => {
      const errorWithMessage = {
        message: 'Something went wrong'
      };
      mockUsersByEmail.getByEmail.mockRejectedValue(errorWithMessage);

      await expect(auth0Client.getUsersByEmail('test@example.com'))
        .rejects
        .toThrow('Auth0 API: Something went wrong');
    });

    it('should handle errors without message or statusCode', async () => {
      const genericError = 'String error';
      mockUsersByEmail.getByEmail.mockRejectedValue(genericError);

      await expect(auth0Client.getUsersByEmail('test@example.com'))
        .rejects
        .toThrow('Auth0 API: String error');
    });

    it('should handle Auth0 API errors with no message', async () => {
      const errorWithoutMessage = {
        statusCode: 500
      };
      mockUsersByEmail.getByEmail.mockRejectedValue(errorWithoutMessage);

      await expect(auth0Client.getUsersByEmail('test@example.com'))
        .rejects
        .toThrow('Auth0 API Error (500): Auth0 API Error');
    });
  });
});