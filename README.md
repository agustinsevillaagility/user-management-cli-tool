# Auth0 API Wrapper

A TypeScript wrapper for the Auth0 Management API with a powerful CLI tool for organization membership management. Built using the **official Auth0 SDK**.

## Features

- **Official SDK**: Uses the official `auth0` npm package for reliable API access
- **API Wrapper**: User lookup by email, organization management, role assignment
- **CLI Tool**: Interactive organization membership assignment with role selection
- **Type-safe**: Full TypeScript support with comprehensive interfaces
- **Error handling**: Robust error handling and user feedback

## Installation

```bash
npm install
npm run build
```

## CLI Usage - Organization Membership Assignment

The CLI tool allows you to assign users to Auth0 organizations with specific roles through an interactive process.

### Quick Start

```bash
# Run with development mode
npm run cli user@example.com

# Or run the built version
npm run build-cli user@example.com
```

### CLI Features

✅ **Email validation** - Validates email format and checks if user exists  
✅ **Auto-loading** - Loads all organizations and roles on startup  
✅ **Multi-select prompts** - Interactive selection of organizations and roles  
✅ **Review & confirmation** - Shows summary before making changes  
✅ **Batch processing** - Assigns user to multiple organizations at once  
✅ **Error handling** - Detailed error reporting and success confirmation  

### CLI Workflow

1. **Input**: Provide user email as command argument
2. **Initialization**: CLI loads all organizations and roles from Auth0
3. **User lookup**: Finds and validates the user exists
4. **Organization selection**: Multi-select prompt for organizations
5. **Role selection**: Multi-select prompt for roles (optional)
6. **Review**: Shows complete summary of planned assignments
7. **Confirmation**: User confirms or cancels the operation
8. **Execution**: Makes API calls to assign memberships
9. **Results**: Reports success/failure for each assignment

### Example CLI Session

```bash
$ npm run cli john@company.com

🔄 Initializing Auth0 Organization Membership CLI...
Loading organizations...
✓ Loaded 5 organizations
Loading roles...
✓ Loaded 8 roles
✓ Initialization complete!

Looking up user: john@company.com
✓ Found user: John Doe (auth0|507f1f77bcf86cd799439011)

? Select organizations to add the user to: (Use <space> to select)
❯◯ Engineering Team (org_123abc)
 ◯ Marketing Team (org_456def)  
 ◯ Sales Team (org_789ghi)

? Select roles to assign to the user:
❯◯ Admin - Full administrative access
 ◯ Member - Standard member access
 ◯ Viewer - Read-only access

📋 Review Assignment Details:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
User:
  • Name: John Doe
  • Email: john@company.com
  • User ID: auth0|507f1f77bcf86cd799439011

Organizations:
  • Engineering Team (org_123abc)

Roles:
  • Member - Standard member access
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

? Do you want to proceed with these assignments? (y/N)

🔄 Executing membership assignments...
Adding user to Engineering Team...
✓ Successfully added to Engineering Team

📊 Assignment Summary:
✓ Successful assignments: 1
🎉 Process complete!
```

## API Usage

```typescript
import { Auth0Client } from './src/auth0-client';

const client = new Auth0Client({
  domain: 'your-domain.auth0.com',
  token: 'your-management-api-token'
});

// Look up user by email
const user = await client.getUserByEmail('user@example.com');

// Get all organizations
const organizations = await client.getOrganizations();

// Get all roles
const roles = await client.getRoles();

// Add user to organization with roles
await client.addMembersToOrganization('org_123', [{
  user_id: 'auth0|507f1f77bcf86cd799439011',
  roles: ['role_abc', 'role_def']
}]);
```

## Technical Implementation

- **Official Auth0 SDK**: Built on top of the official `auth0` npm package (v4.31.0+)
- **ManagementClient**: Uses Auth0's ManagementClient for all API operations
- **Type Safety**: Maintains TypeScript interfaces for all Auth0 entities
- **Error Handling**: Proper error transformation and user-friendly messages

## Environment Variables

Create a `.env` file with:

```
AUTH0_DOMAIN=your-domain.auth0.com
AUTH0_MANAGEMENT_TOKEN=your-management-api-token
```

## Required Auth0 Scopes

Your Management API token needs these scopes:
- `read:users`
- `read:organizations` 
- `create:organization_members`
- `read:roles`