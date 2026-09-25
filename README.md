# sqlchatcli

A command-line chat interface for querying a SQLite database in plain English. You ask a question, an LLM translates it into SQL, you approve the query before it runs, and the results are printed as a table — the actual row data is never sent to the LLM.

## How it works

1. You type a question at the `Chat >` prompt.
2. A data dictionary describing your schema (the `knowledge_table`, see [Database](#database) below) plus your question are sent to an LLM, which returns a raw SQL query ([prompt.js](prompt.js)).
3. The proposed query is printed and you're asked to confirm before it executes — a human-in-the-loop safety check ([index.js](index.js)).
4. On confirmation, the query runs against the local SQLite database via [`better-sqlite3`](https://github.com/WiseLibs/better-sqlite3) ([db.js](db.js)), and the results are printed directly as a table. Row data never leaves your machine or gets sent to the LLM.

The LLM backend is provider-agnostic: it talks to any OpenAI-compatible `/v1` endpoint, so it works with a local model server (Ollama, LM Studio) or Google's Gemini OpenAI-compatible endpoint ([aiclient.js](aiclient.js)).

## Requirements

- Node.js 18+ (uses ES modules)
- An OpenAI-compatible LLM endpoint:
  - a local model server such as [LM Studio](https://lmstudio.ai/) or [Ollama](https://ollama.com/), or
  - a Gemini API key

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy the environment template and fill in your values:

   ```bash
   cp .env.template .env
   ```

   | Variable | Description | Default |
   | --- | --- | --- |
   | `LLM_PROVIDER` | `local` (any OpenAI-compatible server) or `gemini` | `local` |
   | `LLM_API_KEY` | API key for your endpoint. For local servers any non-empty string works. | — |
   | `LLM_API_URL` | Base URL of the local OpenAI-compatible endpoint (ignored when `LLM_PROVIDER=gemini`) | `http://localhost:11434/v1` |
   | `LLM_MODEL` | Model name to request from the endpoint | — |
   | `GEMINI_API_KEY` | API key for Gemini (used when `LLM_PROVIDER=gemini`) | — |

3. Run the CLI:

   ```bash
   node index.js
   ```

## Usage

```
🤖 Data Chat CLI initialized. Type "exit" or "q" to quit.

Chat > which customers placed an order in the last 30 days?

Thinking...

Proposed SQL Query:
"SELECT name FROM customers WHERE last_order_date >= date('now', '-30 days');"

? Do you want to execute this query against your database? (Y/n)

Executing query...

┌─────────┬──────────────────┐
│ (index) │       name       │
├─────────┼──────────────────┤
│    0    │  'Ipsum'         │
│    1    │  'Lore'          │
└─────────┴──────────────────┘
```

Type `exit` or `q` to quit.

## Database

The app reads and writes a local SQLite file, `app.db`, which is gitignored — it's never committed, so each environment brings its own data.

To set the project up against your own data:

1. **Create/point at a SQLite database.** [db.js](db.js) opens `app.db` in the project root via `better-sqlite3`; either let it create an empty file on first run and add your own `CREATE TABLE` statements there, or point it at an existing SQLite file.
2. **Add a `knowledge_table`.** This is a data dictionary the LLM queries for schema context instead of raw table introspection — one row per column, describing what it means:

   ```sql
   CREATE TABLE knowledge_table (
     table_name  TEXT NOT NULL,
     column_name TEXT,
     data_type   TEXT,
     description TEXT
   );
   ```

   Populate it with one row per table/column. Descriptions can include units, valid values, and gotchas (e.g. "status is an enum: 0=pending, 1=shipped, 2=cancelled") — the more context you give, the more accurate the generated SQL will be. `getKnowledgeTable()` in [db.js](db.js) reads this table and passes it to the LLM on every question.
3. **Seed your data tables** however suits your project (SQL scripts, a migration tool, `INSERT` statements in `db.js`, etc.). Since `app.db` isn't committed, keep any seed/schema scripts you want to share in version control separately from the database file itself.

## Project structure

| File | Purpose |
| --- | --- |
| `index.js` | CLI entry point and main chat loop |
| `db.js` | SQLite connection, schema/knowledge-table setup, schema introspection |
| `aiclient.js` | OpenAI-compatible LLM client factory |
| `prompt.js` | Prompt template for SQL generation |

## Notes

- SQL queries proposed by the LLM are shown to you and require explicit confirmation before execution — always review a query before approving it, especially destructive statements (`UPDATE`, `DELETE`, `DROP`).
- `app.db` is gitignored; it holds your actual data and is never committed.
- `.env` is gitignored; never commit real API keys.
