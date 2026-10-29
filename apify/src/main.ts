/**
 * Lusha MCP on Apify: a Standby Actor that relays MCP traffic to Lusha through the
 * calling user's own Apify MCP connector. Lusha credits are charged to the Lusha account
 * behind that connector; the Actor itself charges nothing.
 */
import { Actor, log } from 'apify';

import { startServer } from './server.js';

const STANDBY_MODE = process.env.APIFY_META_ORIGIN === 'STANDBY';
const SERVER_PORT = parseInt(process.env.ACTOR_WEB_SERVER_PORT || '3001', 10);

await Actor.init();

if (!STANDBY_MODE) {
    const msg = 'This Actor is an MCP server. Connect an MCP client to its Standby URL (/mcp) instead of starting a run.';
    log.error(msg);
    await Actor.exit({ statusMessage: msg });
}

const input = await Actor.getInput<{ lushaConnector?: string }>();

await startServer({
    serverPort: SERVER_PORT,
    connectorId: input?.lushaConnector,
});
