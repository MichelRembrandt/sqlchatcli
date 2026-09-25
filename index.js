import 'dotenv/config';
import { input, confirm } from '@inquirer/prompts';
import { db } from './data_db.js';
import { getKnowledgeTable } from './knowledge_db.js';
import { generateSqlQuery } from './prompt.js';

async function main() {
  console.log('🤖 Data Chat CLI initialized. Type "exit" or "q" to quit.\n');
  const knowledgeTable = getKnowledgeTable();

  while (true) {
    // 1. Get user input
    const userPrompt = await input({ message: 'Chat >' });
    if (userPrompt.toLowerCase() === 'exit' || userPrompt.toLowerCase() === 'q') {
      console.log('Goodbye!');
      break;
    }

    if (!userPrompt.trim()) continue;

    try {
      console.log('\nThinking...');
      // 2. Generate SQL
      const generatedSql = await generateSqlQuery(userPrompt, knowledgeTable);

      console.log(`\nProposed SQL Query:\n\x1b[36m${generatedSql}\x1b[0m\n`);

      // 3. User Confirmation (Human-in-the-Loop)
      const shouldRun = await confirm({
        message: 'Do you want to execute this query against your database?',
        default: true
      });

      if (!shouldRun) {
        console.log('Query execution canceled by user.\n');
        continue;
      }

      // 4. Run Query
      console.log('Executing query...');
      const queryResult = db.prepare(generatedSql).all();

      // 5. Answer
      if (queryResult.length > 0) {
        console.table(queryResult);
      } else {
        console.log('(no rows returned)');
      }
    } catch (err) {
      console.error(`\n❌ Error: ${err.message}\n`);
    }
  }
}

main();