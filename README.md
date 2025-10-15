# Auth0 Organization CLI

🚀 **Simple CLI tool for assigning users to Auth0 organizations with roles**

Add users to multiple organizations with specific roles through an interactive command-line interface.

## Requirements

### Auth0 Setup

You need:
- **Auth0 Domain** (e.g., `your-tenant.auth0.com`)
- **Auth0 Application Credentials** (for the "AS- User Management CLI" Application)

### Getting the Auth0 App Credentials

1. Go to Auth0 Dashboard → Applications → AS- User Management CLI
2. Go to Credentials tab
3. Copy the **Client ID** and **Client Secret**

## Quick Start

Once you have these, you can proceed to setup, then use the CLI. 

```bash
# 1. Clone the repository
git clone <repository-url>
cd auth0-api-exploration

# 2. Install dependencies
npm install

# 3. Configure Auth0 credentials (interactive setup)
npm run setup

# 4. Add a user to organizations
npm run add-arc-user your.email@example.com
```

**That's it!** 🎉

## Alternative Usage

The project uses an NPM `postinstall` hook to automatically build the program after `npm install` Once built, you can also use the global command:

```bash
# After npm install (and/or build)
npx add-arc-user your.email@example.com
```

## What It Does

The CLI tool allows you to assign users to Auth0 organizations with specific roles through an interactive process.

The CLI will:

1. ✅ **Find the user** by email in your Auth0 tenant
2. ✅ **Load all organizations** and **roles** from Auth0
3. ✅ **Interactive selection** - choose organizations via multi-select
4. ✅ **Role assignment** - choose roles via multi-select  
5. ✅ **Review & confirm** - see exactly what will happen
6. ✅ **Execute & report** - assign memberships and show results

## Example Session

```bash
$ npm run add-arc-user jane.foobar@agilityrobotics.com

🔄 Initializing Auth0 Organization CLI...
✓ Loaded 5 organizations
✓ Loaded 8 roles
✓ Found user: Jane Foobar (auth0|507f1f77bcf86cd799439011)

? Select organizations to add the user to:
❯◉ Engineering Team
 ◯ Marketing Team  
 ◉ DevOps Team

? Select roles to assign:
❯◉ Member - Standard access
 ◯ Admin - Full access

📋 Review Assignment Details:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
User: Jane Foobar (jane.foobar@agilityrobotics.com)
Organizations: Engineering Team, DevOps Team
Roles: Member

? Proceed with assignments? Yes

🔄 Executing assignments...
✓ Added to Engineering Team
✓ Added to DevOps Team
🎉 Process complete!
```

## Troubleshooting

**"User not found"** - Check the email address and ensure the user exists in your Auth0 tenant

**"Auth0 API Error"** - Verify your domain and token in `.env`, check token scopes

**"No organizations/roles found"** - Ensure your Auth0 tenant has organizations and roles configured

## Development

Built with the official Auth0 SDK and TypeScript for reliability and type safety.

## Features

- **Uses Official Auth0 SDK**: Uses the official `auth0` npm package for reliable API access. Along with the `@types/auth0` package, we get a nice TypeScript wrapper for the Auth0 Management API with a powerful CLI tool for organization membership management.
- **API Wrapper**: User lookup by email, organization management, role assignment
- **CLI Tool**: Interactive organization membership assignment with role selection
- **Type-safe**: Full TypeScript support with comprehensive interfaces
- **Error handling**: Robust error handling and user feedback

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

## Technical Implementation

- **Official Auth0 SDK**: Built on top of the official `auth0` npm package (v4.31.0+)
- **ManagementClient**: Uses Auth0's ManagementClient for all API operations
- **Type Safety**: Maintains TypeScript interfaces for all Auth0 entities
- **Error Handling**: Proper error transformation and user-friendly messages
- **Unit Tests**: Comprehensive test coverage (82.92%) with Jest

## Development

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

### Test Coverage

The project includes comprehensive unit tests for the Auth0Client:
- ✅ **34 test cases** covering all public methods
- ✅ **100% code coverage** (statements, branches, functions, lines)
- ✅ Email validation testing
- ✅ Organization membership assignment testing
- ✅ Error handling scenarios
- ✅ API response mocking
- ✅ Edge case coverage

## Environment Variables

After using setup script, you will have an `.env` file with:

```
AUTH0_DOMAIN=your-domain.auth0.com
AUTH0_CLIENT_ID=your-client-id
AUTH0_CLIENT_SECRET=your-client-secret
AUTH0_AUDIENCE=https://your-domain.auth0.com/api/v2/
```

See `.env.example` for reference.
