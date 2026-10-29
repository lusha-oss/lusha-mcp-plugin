# Lusha MCP

Connect your AI agent to [Lusha](https://www.lusha.com), the B2B data layer behind 300M+ verified contacts. Find and enrich contacts and companies with verified emails, direct dials, mobile numbers, firmographics and real-time buying signals, straight from your MCP client.

This Actor is the official Lusha MCP server on Apify. Each user signs in with **their own Lusha account**, and tool calls spend credits from that account at standard Lusha pricing. The Actor never sees or stores your Lusha credentials.

## What you can do

- **Prospect**: find contacts and decision makers by role, company, industry, seniority or location. _"Find 10 VPs of RevOps at Series B SaaS companies in NYC"_
- **Enrich**: get verified work emails, direct dials and mobile numbers for people you already know, and firmographics for companies. _"Get the work email and mobile number for the Head of Marketing at Notion"_
- **Track buying signals**: funding rounds, leadership hires, hiring surges and tech stack changes. _"Show me the buying signals from the last 90 days for these 15 accounts"_
- **Find lookalikes**: companies and contacts that look like your best customers. _"Find 20 companies that look like these 5 customers"_
- **Find the buying group**: rank the decision makers and buying committee at a target account.
- **Save and export**: put results in a Lusha Workspace table or export them to your CRM.

Filter lookups and `account_usage` are free. Searches, lookups and reveals spend Lusha credits; `account_usage` shows your balance and the price of each action.

## Setup

### 1. Connect your Lusha account (once)

1. In Apify Console, open **Settings > API & Integrations > MCP connectors** and select **Add connector**.
2. Enter the MCP server URL `https://mcp.lusha.com/mcp`.
3. Choose **OAuth**, select **Authorize** and sign in with your Lusha account.

You need a Lusha account with MCP access. [Sign up for free](https://www.lusha.com) if you don't have one.

### 2. Save a task with your connector (once)

1. Open this Actor, pick your Lusha connector in the **Lusha connector** input field.
2. Select **Save as a new task**.
3. Open the task's **Endpoints** tab and copy its Standby URL.

The task is what ties your Lusha connector to the MCP endpoint. Apify only lets the Actor use a connector that was saved in its input, so the Actor's own URL can't reach Lusha without one.

### 3. Connect your MCP client

Use the task's Standby URL with `/mcp`:

```
https://<your-task-standby-host>/mcp
```

Authenticate with your Apify API token, either as the `Authorization: Bearer <APIFY_TOKEN>` header or by signing in to Apify with OAuth when your client offers it.

Example for clients that use a JSON config (Claude Desktop, Cursor, VS Code):

```json
{
    "mcpServers": {
        "lusha": {
            "url": "https://<your-task-standby-host>/mcp",
            "headers": { "Authorization": "Bearer <APIFY_TOKEN>" }
        }
    }
}
```

Apify's connector proxy passes tools through. Lusha's interactive result widgets (MCP resources) are not available through Apify; tool results are returned as text and structured data.

## Pricing

The Actor itself is free. You pay:

- **Lusha credits** for searches, lookups and reveals, from your own Lusha plan at standard pricing.
- **Apify platform usage** for the Standby run that serves your session.

## Privacy and security

- Your Lusha sign-in is held by Apify's MCP connector service. The Actor reaches Lusha through Apify's MCP proxy with its run token, and the proxy adds your Lusha credentials. The Actor code never sees them.
- Lusha is GDPR and CCPA compliant and certified SOC 2 Type II and ISO 27701.
- Revoke access at any time by deleting the connector in Apify, or from your Lusha account settings.

## Support

Questions or issues: [support@lusha.com](mailto:support@lusha.com). Source: [github.com/lusha-oss/lusha-mcp-plugin](https://github.com/lusha-oss/lusha-mcp-plugin/tree/master/apify).
