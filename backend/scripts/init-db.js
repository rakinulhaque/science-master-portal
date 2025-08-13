import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const createDatabase = async () => {
  // Connect to PostgreSQL without specifying a database
  const sequelize = new Sequelize(
    'postgres', // Connect to default postgres database
    process.env.DB_USER || 'postgres',
    process.env.DB_PASS || 'postgres',
    {
      host: process.env.DB_HOST || 'localhost',
      dialect: 'postgres',
      logging: console.log,
    }
  );

  try {
    await sequelize.authenticate();
    console.log('Connected to PostgreSQL server successfully.');

    const dbName = process.env.DB_NAME || 'science_master';
    
    // Create database if it doesn't exist
    await sequelize.query(`CREATE DATABASE "${dbName}";`);
    console.log(`✅ Database "${dbName}" created successfully!`);
    
  } catch (error) {
    if (error.original && error.original.code === '42P04') {
      console.log(`✅ Database already exists.`);
    } else {
      console.error('❌ Error creating database:', error.message);
    }
  } finally {
    await sequelize.close();
  }
};

const initializeTables = async () => {
  // Now connect to the science_master database
  const { default: sequelize } = await import('../src/models/db.js');
  await import('../src/models/associations.js');

  try {
    await sequelize.authenticate();
    console.log('Connected to science_master database successfully.');

    // Sync all models (create tables)
    await sequelize.sync({ force: false });
    console.log('✅ All tables created successfully!');

  } catch (error) {
    console.error('❌ Error initializing tables:', error.message);
  } finally {
    await sequelize.close();
  }
};

// Run the setup
(async () => {
  console.log('🚀 Starting database initialization...');
  await createDatabase();
  await initializeTables();
  console.log('✅ Database setup complete!');
  process.exit(0);
})();
