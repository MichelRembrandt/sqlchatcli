# sqlchatcli

An [MCP](https://modelcontextprotocol.io/) server that exposes a local SQLite database to any MCP-compatible host (Claude Desktop, Claude Code, etc.) so it can answer questions about your data in plain English. The host's LLM reads a data dictionary to understand your schema, then runs SQL through the server — row data stays local and only ever flows to whichever client you connect.

## How it works

1. An MCP host (e.g. Claude Desktop) launches [`src/index.js`](src/index.js), which starts the server on stdio ([`StdioServerTransport`](https://github.com/modelcontextprotocol/typescript-sdk)).
2. The server ([`src/server.js`](src/server.js)) registers two tools:
   - **`knowledge_table`** — returns a data dictionary describing every table/column in the database, including meaning, units, and gotchas ([`db/knowledge_db.js`](db/knowledge_db.js)).
   - **`run_query`** — executes a raw SQL query against the database and returns the results ([`db/data_db.js`](db/data_db.js)).
3. The host's LLM calls `knowledge_table` to learn the schema, formulates SQL for the user's question, and calls `run_query` to execute it. Approving/reviewing the query before execution is up to the host client.

This replaces the project's earlier form as a standalone CLI with its own bundled LLM client and prompt/confirm loop — that logic has been removed in favor of letting any MCP host drive the conversation.

## Requirements

- Node.js 18+ (uses ES modules)
- An MCP-compatible host to connect to the server (e.g. [Claude Desktop](https://claude.ai/download), [Claude Code](https://claude.com/claude-code))

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Point your MCP host at the server. For example, in Claude Desktop's config (`claude_desktop_config.json`):

   ```json
   {
     "mcpServers": {
       "sqlchatcli": {
         "command": "node",
         "args": ["/absolute/path/to/sqlchatcli/src/index.js"]
       }
     }
   }
   ```

3. Restart/reload the host. It should discover the `knowledge_table` and `run_query` tools and can now answer questions about the data in `app.db`.

## Database

The app reads and writes a local SQLite file, `app.db`, which is gitignored — it's never committed, so each environment brings its own data.

To set the project up against your own data:

1. **Create/point at a SQLite database.** [`db/data_db.js`](db/data_db.js) opens `db/app.db` via `better-sqlite3`; either let it create an empty file on first run and add your own `CREATE TABLE` statements there, or point it at an existing SQLite file.
2. **Add a `knowledge_table`.** This is a data dictionary the LLM queries for schema context instead of raw table introspection — one row per column, describing what it means:

   ```sql
   CREATE TABLE knowledge_table (
     table_name  TEXT NOT NULL,
     column_name TEXT,
     data_type   TEXT,
     description TEXT
   );
   ```

   Populate it with one row per table/column. Descriptions can include units, valid values, and gotchas (e.g. "status is an enum: 0=pending, 1=shipped, 2=cancelled") — the more context you give, the more accurate the generated SQL will be. `getKnowledgeTable()` in [`db/knowledge_db.js`](db/knowledge_db.js) reads this table and serves it through the `knowledge_table` tool.
3. **Seed your data tables** however suits your project (SQL scripts, a migration tool, `INSERT` statements in `db/data_db.js`, etc.). Since `app.db` isn't committed, keep any seed/schema scripts you want to share in version control separately from the database file itself.

## Project structure

| File | Purpose |
| --- | --- |
| `src/index.js` | MCP server entry point — connects `server.js` to stdio |
| `src/server.js` | Defines the MCP server and registers the `knowledge_table` and `run_query` tools |
| `db/data_db.js` | SQLite connection, data-table (products/stock_movements) schema and seeding |
| `db/knowledge_db.js` | Knowledge-table schema, seeding, and schema retrieval for the LLM |

## Notes

- There is no built-in confirmation step before a query runs — review/approval of generated SQL, especially destructive statements (`UPDATE`, `DELETE`, `DROP`), is the responsibility of the MCP host you connect.
- `app.db` is gitignored; it holds your actual data and is never committed.
- This branch is mid-migration from the earlier CLI architecture; some pieces (e.g. `run_query`'s handling of its `query` argument) are still being wired up.
