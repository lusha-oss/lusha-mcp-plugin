/**
 * MCP relay: one MCP server per client session, backed by one MCP client that talks to
 * Lusha through the Apify MCP connector proxy.
 *
 * The Actor never holds a Lusha credential. It authenticates to the Apify proxy with the
 * run's APIFY_TOKEN, and the proxy injects the token of the Lusha account the user
 * authorized when they created the connector.
 */
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { DEFAULT_REQUEST_TIMEOUT_MSEC } from '@modelcontextprotocol/sdk/shared/protocol.js';
import {
    ClientNotificationSchema,
    ClientRequestSchema,
    ResultSchema,
    ServerNotificationSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { log } from 'apify';

const RELAY_INFO = { name: 'lusha-mcp-apify', version: '0.2.0' };

/**
 * Tool calls like bulk enrichment can run longer than the SDK's 60s default.
 */
const UPSTREAM_TIMEOUT_MSEC = Math.max(DEFAULT_REQUEST_TIMEOUT_MSEC, 120_000);

const LOCAL_NOTIFICATIONS = new Set(['notifications/initialized', 'notifications/cancelled', 'notifications/progress']);

export function connectorUrl(connectorId: string): URL {
    const base = process.env.ACTOR_MCP_CONNECTOR_BASE_URL;
    if (!base) {
        throw new Error('ACTOR_MCP_CONNECTOR_BASE_URL is not set; MCP connectors are unavailable in this run.');
    }
    return new URL(`${base.replace(/\/+$/, '')}/${encodeURIComponent(connectorId)}`);
}

async function connectUpstream(connectorId: string): Promise<Client> {
    const token = process.env.APIFY_TOKEN;
    if (!token) {
        throw new Error('APIFY_TOKEN is not set.');
    }
    const transport = new StreamableHTTPClientTransport(connectorUrl(connectorId), {
        requestInit: { headers: { Authorization: `Bearer ${token}` } },
    });
    const client = new Client(RELAY_INFO);
    await client.connect(transport);
    log.info('Connected to Lusha through the MCP connector proxy', {
        upstream: client.getServerVersion(),
    });
    return client;
}

/**
 * Builds a server that forwards every client request and notification to Lusha 1:1,
 * so tools, resources (widgets) and prompts behave exactly as on mcp.lusha.com.
 */
export async function createRelayServer(connectorId: string): Promise<Server> {
    const upstream = await connectUpstream(connectorId);

    const server = new Server(upstream.getServerVersion() ?? RELAY_INFO, {
        capabilities: upstream.getServerCapabilities() ?? {},
        instructions: upstream.getInstructions(),
    });

    for (const schema of ClientRequestSchema.options) {
        const method = schema.shape.method.value;
        // The SDK answers initialize and ping itself.
        if (method === 'initialize' || method === 'ping') {
            continue;
        }
        try {
            server.setRequestHandler(schema, async (req, extra) =>
                upstream.request(req, ResultSchema, { timeout: UPSTREAM_TIMEOUT_MSEC, signal: extra.signal }),
            );
        } catch {
            // Lusha does not advertise the capability behind this method (e.g. completions).
        }
    }

    for (const schema of ClientNotificationSchema.options) {
        const method = schema.shape.method.value;
        // Each side handles its own handshake and request bookkeeping; cancellation reaches
        // upstream through the abort signal passed with each request.
        if (LOCAL_NOTIFICATIONS.has(method)) {
            continue;
        }
        server.setNotificationHandler(schema, async (notification) => upstream.notification(notification));
    }

    for (const schema of ServerNotificationSchema.options) {
        const method = schema.shape.method.value;
        if (LOCAL_NOTIFICATIONS.has(method)) {
            continue;
        }
        upstream.setNotificationHandler(schema, async (notification) => server.notification(notification));
    }

    server.onclose = () => {
        upstream.close().catch((error) => log.warning('Error closing upstream MCP client', { error }));
    };

    return server;
}
