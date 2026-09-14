import { MongoMemoryServer } from 'mongodb-memory-server';

async function main() {
  console.log('Starting local MongoDB instance (v4.4.18) on port 27017...');
  const mongod = await MongoMemoryServer.create({
    instance: {
      port: 27017,
      dbName: 'school-erp'
    },
    binary: {
      version: '4.4.18'
    }
  });

  console.log(`\n==================================================`);
  console.log(`✅ Local MongoDB database started successfully!`);
  console.log(`📍 Connection URI: mongodb://localhost:27017/school-erp`);
  console.log(`👉 MongoDB Compass: mongodb://localhost:27017`);
  console.log(`==================================================\n`);
}

main().catch(err => {
  console.error('Error starting local MongoDB:', err);
});
