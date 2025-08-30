const { createTablesIfNotExist } = require('../src/lib/db-schema.ts');

async function setupTables() {
  console.log('Creating DynamoDB tables...');
  try {
    await createTablesIfNotExist();
    console.log('✅ All tables created successfully!');
  } catch (error) {
    console.error('❌ Error creating tables:', error);
    process.exit(1);
  }
}

setupTables();