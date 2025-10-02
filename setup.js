#!/usr/bin/env node

/**
 * Setup script for Auth0 Organization CLI
 * Helps users configure their environment quickly
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function setup() {
  console.log('\n🚀 Auth0 Organization CLI Setup\n');
  console.log('This script will help you configure your Auth0 credentials.\n');

  try {
    // Check if .env already exists
    const envPath = path.join(__dirname, '.env');
    const envExamplePath = path.join(__dirname, '.env.example');
    
    if (fs.existsSync(envPath)) {
      console.log('✅ .env file already exists!');
      const overwrite = await question('Do you want to overwrite it? (y/N): ');
      if (overwrite.toLowerCase() !== 'y' && overwrite.toLowerCase() !== 'yes') {
        console.log('Setup cancelled. Your existing .env file is unchanged.');
        rl.close();
        return;
      }
    }

    console.log('Please provide your Auth0 configuration:\n');

    // Get Auth0 domain
    const domain = await question('🌐 Auth0 Domain (e.g., your-tenant.auth0.com): ');
    if (!domain) {
      console.log('❌ Domain is required. Setup cancelled.');
      rl.close();
      return;
    }

    // Get Management API token
    const token = await question('🔑 Management API Token: ');
    if (!token) {
      console.log('❌ Management API Token is required. Setup cancelled.');
      rl.close();
      return;
    }

    // Create .env file
    const envContent = `# Auth0 Configuration - The Management SDK used in this project 
#  1. requires a domain 
AUTH0_DOMAIN=${domain}
#  2. a token with appropriate scopes.
AUTH0_MANAGEMENT_TOKEN=${token}
`;

    fs.writeFileSync(envPath, envContent);
    
    console.log('\n✅ Configuration saved to .env file!');
    console.log('\n📋 Required Auth0 Scopes:');
    console.log('   • read:users');
    console.log('   • read:organizations');
    console.log('   • create:organization_members');
    console.log('   • read:roles');
    console.log('\n🎉 Setup complete! You can now run:');
    console.log('   npm run add-org your.email@example.com');
    console.log('   or');
    console.log('   npx add-org your.email@example.com');
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
  } finally {
    rl.close();
  }
}

// Only run if this script is executed directly
if (require.main === module) {
  setup();
}

module.exports = { setup };