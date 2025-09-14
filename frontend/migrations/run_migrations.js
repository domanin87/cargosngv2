// migrations/run_migrations.js
const { init } = require('../src/models');

async function runMigrations() {
  try {
    console.log('Starting database migration...');
    const { sequelize } = await init();
    console.log('Database synchronized successfully');
    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigrations();