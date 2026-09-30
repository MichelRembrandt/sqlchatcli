import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { getKnowledgeTable } from '../db/knowledge_db.js';
import { db } from '../db/data_db.js';

export function buildServer() {
    const server = new McpServer({
        name: 'task-server',
        version: '1.0.0'
    });

    server.registerTool(
        'knowledge_table',
        {
            title: 'Retrieve knowlegde tabel',
            description: 'Retrieve the table that holds the knowledge about the database schema and the meaning and relations of the different columns of the database'
        },
        async () => {
            const knowledgeTable = getKnowledgeTable();
            return {
                content: [{ type: 'text', text: JSON.stringify(knowledgeTable, null, 2) }]
            };
        }
    );

    server.registerTool(
        'run_query',
        {
            title: 'Run query against the database',
            description: 'Run the specified query against the database and retrieve the query result. Must be a valid, executable SQL query. ONLY raw SQL with no markdown backticks, no markdown formatting, and no extra prose.',
            inputSchema: {
                query: z.string()
            }
        },
        async ({ query }) => {
            const queryResult = db.prepare(query).all();
            return {
                content: [{ type: 'text', text: JSON.stringify(queryResult, null, 2) }]
            };
        }
    );

    return server;
}

