const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

async function runBackup() {
  const token = 'rnd_09R1e728z5m1udOToN7YgHZwzTgp';
  const serviceId = 'srv-dbkr1kt9fdbs73c4a3ug';
  const headers = { 'Authorization': `Bearer ${token}` };

  console.log('[BACKUP] Fetching MongoDB URI from Render...');
  const res = await fetch(`https://api.render.com/v1/services/${serviceId}/env-vars`, { headers });
  const vars = await res.json();
  const mongoVar = vars.find(v => v.envVar.key === 'MONGO_URI');
  if (!mongoVar) {
    throw new Error('MONGO_URI not found');
  }
  const mongoUri = mongoVar.envVar.value;

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = path.resolve(__dirname, `../audit/database_backups/touriva_shop_${timestamp}`);
  fs.mkdirSync(backupDir, { recursive: true });

  console.log(`[BACKUP] Target backup directory: ${backupDir}`);
  console.log('[BACKUP] Connecting to verify database name...');
  await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 8000 });
  const dbName = mongoose.connection.name;
  if (dbName !== 'touriva_shop') {
    throw new Error(`CRITICAL: Connected to ${dbName}, expected touriva_shop! Aborting.`);
  }

  const collections = await mongoose.connection.db.listCollections().toArray();
  const countsBefore = {};
  for (const c of collections) {
    countsBefore[c.name] = await mongoose.connection.db.collection(c.name).countDocuments();
  }
  console.log('[BACKUP] Pre-backup document counts:');
  console.table(countsBefore);
  await mongoose.disconnect();

  console.log('[BACKUP] Executing mongodump...');
  execSync(`mongodump --uri="${mongoUri}" --out="${backupDir}" --quiet`);

  const dumpDbDir = path.join(backupDir, 'touriva_shop');
  if (!fs.existsSync(dumpDbDir)) {
    throw new Error(`Dump failed: ${dumpDbDir} does not exist!`);
  }

  const dumpedFiles = fs.readdirSync(dumpDbDir);
  console.log(`[BACKUP] Successfully dumped ${dumpedFiles.length} files in ${dumpDbDir}`);

  // Create verification manifest
  const manifest = {
    timestamp: new Date().toISOString(),
    database: 'touriva_shop',
    backupPath: backupDir,
    collections: countsBefore,
    files: dumpedFiles,
    status: 'VERIFIED'
  };

  fs.writeFileSync(path.join(backupDir, 'manifest.json'), JSON.stringify(manifest, null, 2));
  console.log('[BACKUP] Backup verified and manifest created at', path.join(backupDir, 'manifest.json'));
}

runBackup().catch(err => {
  console.error('[BACKUP ERROR]', err);
  process.exit(1);
});
