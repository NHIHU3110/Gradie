const { MongoMemoryServer } = require('mongodb-memory-server');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

async function start() {
  console.log('Starting MongoDB Memory Server (Persistent)...');
  
  const dbPath = path.join(__dirname, '.mongo-data');
  if (!fs.existsSync(dbPath)) {
    fs.mkdirSync(dbPath, { recursive: true });
  }

  const mongod = await MongoMemoryServer.create({
    instance: {
      port: 27018,
      dbPath: dbPath,
      storageEngine: 'wiredTiger'
    }
  });
  
  const uri = mongod.getUri();
  console.log(`MongoDB Memory Server started at: ${uri}`);
  
  let envContent = '';
  if (fs.existsSync('.env')) {
    envContent = fs.readFileSync('.env', 'utf-8');
    if (envContent.includes('MONGODB_URI=')) {
      envContent = envContent.replace(/MONGODB_URI=.*/, `MONGODB_URI=${uri}`);
    } else {
      envContent += `\nMONGODB_URI=${uri}`;
    }
  } else {
    envContent = `MONGODB_URI=${uri}`;
  }
  fs.writeFileSync('.env', envContent);
  console.log('Updated .env with MONGODB_URI');

  console.log('Starting Vercel Dev...');
  const child = spawn('npx', ['vercel', 'dev', '--local'], {
    stdio: 'inherit',
    shell: true,
    env: { ...process.env, MONGODB_URI: uri }
  });

  child.on('close', async (code) => {
    console.log(`Vercel Dev exited with code ${code}`);
    await mongod.stop();
    process.exit(code);
  });
}

start().catch(console.error);
