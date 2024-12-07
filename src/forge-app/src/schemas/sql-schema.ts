import sql from '@forge/sql';

export async function createSchema() {
  console.log(`Creating SQL schema on install`);
  await sql._provision();
  console.log('database created!');
};