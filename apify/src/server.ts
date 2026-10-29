/**
 * Streamable HTTP endpoint for the relay, adapted from Apify's ts-mcp-proxy template.
 * Each MCP session gets its own relay server and its own upstream connection.
 */
import { randomUUID } from 'node:crypto';

import { InMemoryEventStore } from '@modelcontextprotocol/sdk/examples/shared/inMemoryEventStore.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { isInitializeRequest } from '@modelcontextprotocol/sdk/types.js';
import { log } from 'apify';
import type { Request, Response } from 'express';
import express from 'express';

import { createRelayServer } from './mcp.js';

const transports: { [sessionId: string]: StreamableHTTPServerTransport } = {};

function jsonRpcError(res: Response, status: number, code: number, message: string) {
    res.status(status).json({ jsonrpc: '2.0', error: { code, message }, id: null });
}

// The Apify MCP proxy only accepts a connector that was passed in the run input, so the
// connector cannot come from the request. Users save a task with their connector and
// connect to the task's Standby URL, which starts runs with that input.
const NO_CONNECTOR_MESSAGE =
    'No Lusha connector. In Apify Console, create a task from this Actor, pick your Lusha MCP connector in its input, and connect your MCP client to the task\'s Standby URL (Endpoints tab) with /mcp.';

export async function startServer(options: { serverPort: number; connectorId?: string }) {
    const { serverPort, connectorId } = options;

    async function mcpPostHandler(req: Request, res: Response) {
        const sessionId = req.headers['mcp-session-id'] as string | undefined;
        try {
            if (sessionId && transports[sessionId]) {
                await transports[sessionId].handleRequest(req, res, req.body);
                return;
            }
            if (sessionId || !isInitializeRequest(req.body)) {
                jsonRpcError(res, 400, -32000, 'Bad Request: No valid session ID provided');
                return;
            }

            if (!connectorId) {
                jsonRpcError(res, 400, -32001, NO_CONNECTOR_MESSAGE);
                return;
            }

            const transport = new StreamableHTTPServerTransport({
                sessionIdGenerator: () => randomUUID(),
                eventStore: new InMemoryEventStore(),
                onsessioninitialized: (initializedSessionId) => {
                    log.info('Session initialized', { sessionId: initializedSessionId });
                    transports[initializedSessionId] = transport;
                },
            });
            transport.onclose = () => {
                const sid = transport.sessionId;
                if (sid && transports[sid]) {
                    delete transports[sid];
                }
            };

            const server = await createRelayServer(connectorId);
            await server.connect(transport);
            await transport.handleRequest(req, res, req.body);
        } catch (error) {
            log.error('Error handling MCP request', { error: (error as Error).message, sessionId: sessionId ?? null });
            if (!res.headersSent) {
                jsonRpcError(res, 502, -32603, `Could not reach Lusha through the MCP connector: ${(error as Error).message}`);
            }
        }
    }

    async function mcpSessionHandler(req: Request, res: Response) {
        const sessionId = req.headers['mcp-session-id'] as string | undefined;
        if (!sessionId || !transports[sessionId]) {
            res.status(400).send('Invalid or missing session ID');
            return;
        }
        try {
            await transports[sessionId].handleRequest(req, res);
        } catch (error) {
            log.error('Error handling MCP session request', { error: (error as Error).message });
            if (!res.headersSent) {
                res.status(500).send('Error processing MCP session request');
            }
        }
    }

    const app = express();

    // Readiness probe
    app.get('/', (req: Request, res: Response) => {
        if (req.headers['x-apify-container-server-readiness-probe']) {
            res.end('ok\n');
            return;
        }
        res.status(404).end();
    });

    // Lets MCP clients sign in to Apify with OAuth instead of pasting an Apify token.
    // Some MCP clients do not follow redirects, so the metadata is fetched and returned directly.
    app.get('/.well-known/oauth-authorization-server', async (_req: Request, res: Response) => {
        const response = await fetch('https://api.apify.com/.well-known/oauth-authorization-server');
        res.status(response.status).json(await response.json());
    });

    app.use(express.json());

    app.post('/mcp', mcpPostHandler);
    app.get('/mcp', mcpSessionHandler);
    app.delete('/mcp', mcpSessionHandler);

    app.listen(serverPort, () => {
        log.info(`Lusha MCP relay listening on port ${serverPort}`);
    });

    process.on('SIGINT', async () => {
        for (const sessionId of Object.keys(transports)) {
            await transports[sessionId].close().catch(() => undefined);
            delete transports[sessionId];
        }
        process.exit(0);
    });
}
