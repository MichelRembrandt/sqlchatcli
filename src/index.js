import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { buildServer } from './server.js';

async function main() {
    const server = buildServer();
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error('task-server running on stdio');
}

main().catch(error => {
    console.error('Fatal error in main():', error);
    process.exit(1);
});
