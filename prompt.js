import {chat} from './aiclient.js'

/**
 * Stage 1: Generate SQL query based on user question and schema
 */
export async function generateSqlQuery(userQuestion, knowledgeTable) {
  const prompt = `
You are a SQL generator for SQLite.
Given the following database schema:
${knowledgeTable}

Translate the following user question into a valid, executable SQL query.
Return ONLY raw SQL with no markdown backticks, no markdown formatting, and no extra prose.

User Question: "${userQuestion}"
`;

  return chat(prompt);
}
