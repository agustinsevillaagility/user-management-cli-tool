# Auth0 Organization CLI

🚀 **Simple CLI tool for assigning users to Auth0 organizations with roles**

Add users to multiple organizations with specific roles through an interactive command-line interface.

## Quick Start

```bash
# 1. Clone the repository
git clone <repository-url>
cd auth0-api-exploration

# 2. Install dependencies
npm install

# 3. Configure Auth0 credentials (interactive setup)
npm run setup

# 4. Add a user to organizations
npm run add-org your.email@example.com
```

**That's it!** 🎉

## Alternative Usage

Once built, you can also use the global command:

```bash
# After npm install and build
npx add-org your.email@example.com
```

## What It Does

The CLI will:

1. ✅ **Find the user** by email in your Auth0 tenant
2. ✅ **Load all organizations** and **roles** from Auth0
3. ✅ **Interactive selection** - choose organizations via multi-select
4. ✅ **Role assignment** - choose roles via multi-select  
5. ✅ **Review & confirm** - see exactly what will happen
6. ✅ **Execute & report** - assign memberships and show results

## Requirements

### Auth0 Setup

You need:
- **Auth0 Domain** (e.g., `your-tenant.auth0.com`)
- **Management API Token** with these scopes:
  - `read:organizations`
  - `read:roles`
  - `read:users`
  - `create:organization_members`

### Getting a Management API Token

1. Go to Auth0 Dashboard → Applications → Machine to Machine Applications
2. Create or select an application
3. Authorize it for the Management API
4. Add the required scopes above
5. Copy the token

## Example Session

```bash
$ npm run add-org jane.foobar@agilityrobotics.com

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
