import { createSchema } from "./schemas/sql-schema";
import { migrationRunner } from '@forge/sql';

export async function provisionSchema() {
  await createSchema();

  return {
    statusCode: 200,
    headers: [],
    body: 'Schema created',
  };
};

export const CREATE_KEYELEMENTS_TABLE = `CREATE TABLE IF NOT EXISTS KeyElements (
  user_id INT PRIMARY KEY AUTO_INCREMENT,
  issue_key VARCHAR(32) UNIQUE NOT NULL,
  issue_id VARCHAR(32) UNIQUE NOT NULL,
  data_key_phrases VARCHAR(512),
  data_entities VARCHAR(512),
  data_intent VARCHAR(512),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP 
)`;


const migrationsRunner = migrationRunner
  .enqueue('v001_create_keyelements_table', CREATE_KEYELEMENTS_TABLE)


function getResponse<Body>(statusCode: number, body: Body) {
  let statusText = '';
  if (statusCode === 200) {
    statusText = 'Ok';
  } else if (statusCode === 404) {
    statusText = 'Not Found';
  } else {
    statusText = 'Bad Request';
  }

  return {
    headers: { 'Content-Type': ['application/json'] },
    statusCode,
    statusText,
    body,
  };
}

export async function migrate() {
  try {
    await applyMigrations();
    return getResponse(200, 'Migrations successfully executed');
  } catch (e) {
    console.error('Error while executing migration', e);
    return getResponse(500, 'Error while executing migrations');
  }
};

export const applyMigrations = async () => {
  const migrationsRun = await migrationsRunner.run();
  console.log('Migrations run:', migrationsRun);

  console.log('Migrations checkpoint [after running migrations]:');
  await migrationRunner.list()
    .then((migration) =>
      migration.map((y) => console.log(`${y.name} migrated at ${y.migratedAt.toUTCString()}`)));
};