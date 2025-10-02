#!/usr/bin/env node

/**
 * Auth0 Organization Membership CLI
 * A command-line tool for assigning users to organizations with specific roles
 */

import type { GetOrganizationMemberRoles200ResponseOneOfInner, GetOrganizations200ResponseOneOfInner, GetUsers200ResponseOneOfInner } from 'auth0';
import chalk from 'chalk';
import { Command } from 'commander';
import 'dotenv/config';
import inquirer from 'inquirer';
import { Auth0Client } from './auth0-client';

class Auth0OrganizationCLI {
    private auth0Client: Auth0Client;
    private organizations: GetOrganizations200ResponseOneOfInner[] = [];
    private roles: GetOrganizationMemberRoles200ResponseOneOfInner[] = [];

    constructor() {
        const domain = process.env.AUTH0_DOMAIN;
        const token = process.env.AUTH0_MANAGEMENT_TOKEN;

        if (!domain || !token) {
            console.error(chalk.red('❌ Error: Missing Auth0 configuration!'));
            console.log(chalk.yellow('\n🔧 Quick Setup:'));
            console.log(chalk.white('   1. Run: npm run setup'));
            console.log(chalk.white('   2. Enter your Auth0 domain and Management API token'));
            console.log(chalk.white('   3. Try this command again'));
            console.log(chalk.gray('\n💡 Need help getting a token? See README.md for instructions'));
            process.exit(1);
        }

        // Validate domain format
        if (!domain.includes('.auth0.com')) {
            console.error(chalk.red('❌ Invalid AUTH0_DOMAIN format!'));
            console.log(chalk.yellow('Expected format: your-tenant.auth0.com'));
            console.log(chalk.white('Run "npm run setup" to configure correctly'));
            process.exit(1);
        }

        // Validate token format (basic check)
        if (token.length < 20) {
            console.error(chalk.red('❌ AUTH0_MANAGEMENT_TOKEN appears to be invalid (too short)'));
            console.log(chalk.yellow('Please check your Management API token'));
            console.log(chalk.white('Run "npm run setup" to reconfigure'));
            process.exit(1);
        }

        this.auth0Client = new Auth0Client({
            domain,
            token
        });
    }

    /**
     * Initialize the CLI by loading organizations and roles
     */
    async initialize(): Promise<void> {
        console.log(chalk.blue('🔄 Initializing Auth0 Organization Membership CLI...'));

        try {
            console.log(chalk.gray('Loading organizations...'));
            this.organizations = await this.auth0Client.getOrganizations();
            console.log(chalk.green(`✓ Loaded ${this.organizations.length} organizations`));

            console.log(chalk.gray('Loading roles...'));
            this.roles = await this.auth0Client.getRoles();
            console.log(chalk.green(`✓ Loaded ${this.roles.length} roles`));

            console.log(chalk.green('✓ Initialization complete!\n'));
        } catch (error) {
            console.error(chalk.red('❌ Failed to initialize Auth0 connection'));
            
            if (error instanceof Error) {
                if (error.message.includes('401') || error.message.includes('Unauthorized')) {
                    console.log(chalk.yellow('\n🔐 Authentication Error:'));
                    console.log(chalk.white('   Your Management API token may be invalid or expired'));
                    console.log(chalk.white('   Run "npm run setup" to update your token'));
                } else if (error.message.includes('403') || error.message.includes('Forbidden')) {
                    console.log(chalk.yellow('\n🚫 Permission Error:'));
                    console.log(chalk.white('   Your token is missing required scopes:'));
                    console.log(chalk.gray('   • read:organizations'));
                    console.log(chalk.gray('   • read:roles'));
                    console.log(chalk.gray('   • read:users'));
                    console.log(chalk.gray('   • create:organization_members'));
                } else if (error.message.includes('404') || error.message.includes('Not Found')) {
                    console.log(chalk.yellow('\n🌐 Domain Error:'));
                    console.log(chalk.white('   Check your AUTH0_DOMAIN setting'));
                    console.log(chalk.white('   Current domain: ' + process.env.AUTH0_DOMAIN));
                } else {
                    console.log(chalk.gray('\nError details:', error.message));
                }
            }
            
            console.log(chalk.blue('\n💡 Need help? Check the README.md for setup instructions'));
            process.exit(1);
        }
    }

    /**
     * Validate email format
     */
    private isValidEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Find user by email
     */
    async findUser(email: string): Promise<GetUsers200ResponseOneOfInner | null> {
        try {
            console.log(chalk.gray(`Looking up user: ${email}`));
            const user = await this.auth0Client.getUserByEmail(email);

            if (user) {
                console.log(chalk.green(`✓ Found user: ${user.name || user.email} (${user.user_id})`));
            } else {
                console.log(chalk.yellow(`⚠ No user found with email: ${email}`));
            }

            return user;
        } catch (error) {
            console.error(chalk.red('Error finding user:'), error instanceof Error ? error.message : String(error));
            return null;
        }
    }

    /**
     * Prompt for organization selection
     */
    async selectOrganizations(): Promise<GetOrganizations200ResponseOneOfInner[]> {
        if (this.organizations.length === 0) {
            console.log(chalk.yellow('No organizations available.'));
            return [];
        }

        const choices = this.organizations.map(org => ({
            name: `${org.display_name || org.name} (${org.id})`,
            value: org,
            short: org.display_name || org.name
        }));

        const answers = await inquirer.prompt([
            {
                type: 'checkbox',
                name: 'organizations',
                message: 'Select organizations to add the user to:',
                choices,
                validate: (input) => {
                    if (input.length === 0) {
                        return 'Please select at least one organization.';
                    }
                    return true;
                }
            }
        ]);

        return answers.organizations;
    }

    /**
     * Prompt for role selection
     */
    async selectRoles(): Promise<GetOrganizationMemberRoles200ResponseOneOfInner[]> {
        if (this.roles.length === 0) {
            console.log(chalk.yellow('No roles available. The user will be added without specific roles.'));
            return [];
        }

        const choices = this.roles.map(role => ({
            name: `${role.name}${role.description ? ` - ${role.description}` : ''}`,
            value: role,
            short: role.name
        }));

        const answers = await inquirer.prompt([
            {
                type: 'checkbox',
                name: 'roles',
                message: 'Select roles to assign to the user:',
                choices
            }
        ]);

        return answers.roles;
    }

    /**
     * Display review summary and confirm
     */
    async confirmAssignment(
        user: GetUsers200ResponseOneOfInner,
        organizations: GetOrganizations200ResponseOneOfInner[],
        roles: GetOrganizationMemberRoles200ResponseOneOfInner[]
    ): Promise<boolean> {
        console.log(chalk.cyan('\n📋 Review Assignment Details:'));
        console.log(chalk.white('━'.repeat(50)));

        console.log(chalk.bold('User:'));
        console.log(`  • Name: ${user.name || 'N/A'}`);
        console.log(`  • Email: ${user.email}`);
        console.log(`  • User ID: ${user.user_id}`);

        console.log(chalk.bold('\nOrganizations:'));
        organizations.forEach(org => {
            console.log(`  • ${org.display_name || org.name} (${org.id})`);
        });

        console.log(chalk.bold('\nRoles:'));
        if (roles.length > 0) {
            roles.forEach(role => {
                console.log(`  • ${role.name}${role.description ? ` - ${role.description}` : ''}`);
            });
        } else {
            console.log('  • No specific roles (default member access)');
        }

        console.log(chalk.white('━'.repeat(50)));

        const answers = await inquirer.prompt([
            {
                type: 'confirm',
                name: 'confirm',
                message: 'Do you want to proceed with these assignments?',
                default: false
            }
        ]);

        return answers.confirm;
    }

    /**
     * Execute the membership assignments
     */
    async executeAssignments(
        user: GetUsers200ResponseOneOfInner,
        organizations: GetOrganizations200ResponseOneOfInner[],
        roles: GetOrganizationMemberRoles200ResponseOneOfInner[]
    ): Promise<void> {
        console.log(chalk.blue('\n🔄 Executing membership assignments...'));

        const roleIds = roles.map(role => role.id);
        let successCount = 0;
        let errorCount = 0;

        for (const org of organizations) {
            try {
                console.log(chalk.gray(`Adding user to ${org.display_name || org.name}...`));

                await this.auth0Client.addMembersToOrganization(org.id, [{
                    user_id: user.user_id,
                    roles: roleIds,
                }]);

                console.log(chalk.green(`✓ Successfully added to ${org.display_name || org.name}`));
                successCount++;
            } catch (error) {
                console.error(chalk.red(`✗ Failed to add to ${org.display_name || org.name}:`),
                    error instanceof Error ? error.message : String(error));
                errorCount++;
            }
        }

        console.log(chalk.cyan('\n📊 Assignment Summary:'));
        console.log(chalk.green(`✓ Successful assignments: ${successCount}`));
        if (errorCount > 0) {
            console.log(chalk.red(`✗ Failed assignments: ${errorCount}`));
        }
        console.log(chalk.blue('🎉 Process complete!'));
    }

    /**
     * Main CLI workflow
     */
    async run(email: string): Promise<void> {
        try {
            // Validate email format
            if (!this.isValidEmail(email)) {
                console.error(chalk.red('Error: Invalid email format provided.'));
                process.exit(1);
            }

            // Initialize data
            await this.initialize();

            // Find the user
            const user = await this.findUser(email);
            if (!user) {
                console.error(chalk.red('Error: User not found. Cannot proceed with assignment.'));
                process.exit(1);
            }

            // Select organizations
            const selectedOrganizations = await this.selectOrganizations();
            if (selectedOrganizations.length === 0) {
                console.log(chalk.yellow('No organizations selected. Exiting.'));
                process.exit(0);
            }

            // Select roles
            const selectedRoles = await this.selectRoles();

            // Confirm assignment
            const confirmed = await this.confirmAssignment(user, selectedOrganizations, selectedRoles);

            if (confirmed) {
                await this.executeAssignments(user, selectedOrganizations, selectedRoles);
            } else {
                console.log(chalk.yellow('❌ Assignment cancelled. No changes were made.'));
            }

        } catch (error) {
            console.error(chalk.red('An unexpected error occurred:'), error instanceof Error ? error.message : String(error));
            process.exit(1);
        }
    }
}

// CLI Program setup
const program = new Command();

program
    .name('auth0-org-cli')
    .description('CLI tool for assigning users to Auth0 organizations with roles')
    .version('1.0.0')
    .argument('<email>', 'Email address of the user to assign to organizations')
    .action(async (email: string) => {
        const cli = new Auth0OrganizationCLI();
        await cli.run(email);
    });

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error(chalk.red('Unhandled Rejection at:'), promise, chalk.red('reason:'), reason);
    process.exit(1);
});

// Parse command line arguments
program.parse();