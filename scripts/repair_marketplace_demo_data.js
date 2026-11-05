const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

async function repair() {
  const token = 'rnd_09R1e728z5m1udOToN7YgHZwzTgp';
  const serviceId = 'srv-dbkr1kt9fdbs73c4a3ug';
  const headers = { 'Authorization': `Bearer ${token}` };

  console.log('[REPAIR] Fetching MongoDB URI from Render...');
  const res = await fetch(`https://api.render.com/v1/services/${serviceId}/env-vars`, { headers });
  const vars = await res.json();
  const mongoVar = vars.find(v => v.envVar.key === 'MONGO_URI');
  if (!mongoVar) throw new Error('MONGO_URI not found');
  const mongoUri = mongoVar.envVar.value;

  console.log('[REPAIR] Connecting to MongoDB...');
  await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 30000 });
  const db = mongoose.connection.db;

  if (mongoose.connection.name !== 'touriva_shop') {
    throw new Error(`CRITICAL: Connected to ${mongoose.connection.name}, expected touriva_shop!`);
  }
  console.log('[REPAIR] Connected safely to database:', mongoose.connection.name);

  // 1. Map sellerProfile IDs to User IDs for products and orderitems
  const profileToUser = {
    '6ae9b37d176d6cfeb78b4c58': '6ae9b37c176d6cfeb78b4c4c', // seller1@touriva.test
    '6ae9b37d176d6cfeb78b4c5a': '6ae9b37c176d6cfeb78b4c4e', // seller2@touriva.test
    '6ae9b37d176d6cfeb78b4c5c': '6ae9b37c176d6cfeb78b4c50'  // seller3@touriva.test
  };

  console.log('\n--- 1. Fixing Products sellerId references ---');
  for (const [profIdStr, userIdStr] of Object.entries(profileToUser)) {
    const profId = new mongoose.Types.ObjectId(profIdStr);
    const userId = new mongoose.Types.ObjectId(userIdStr);

    const prodUpdate = await db.collection('products').updateMany(
      { sellerId: profId },
      { $set: { sellerId: userId } }
    );
    console.log(`Updated ${prodUpdate.modifiedCount} products from Profile ${profIdStr} -> User ${userIdStr}`);

    const itemUpdate = await db.collection('orderitems').updateMany(
      { sellerId: profId },
      { $set: { sellerId: userId } }
    );
    console.log(`Updated ${itemUpdate.modifiedCount} OrderItems from Profile ${profIdStr} -> User ${userIdStr}`);
  }

  // 2. Ensure traveler2@touriva.test exists
  console.log('\n--- 2. Ensuring traveler2@touriva.test exists ---');
  const travelerEmail = 'traveler2@touriva.test';
  let traveler = await db.collection('users').findOne({ email: travelerEmail });
  if (!traveler) {
    const hash = await bcrypt.hash('Password123!', 10);
    const result = await db.collection('users').insertOne({
      email: travelerEmail,
      phone: '+213550000012',
      password: hash,
      firstName: 'Mehdi',
      lastName: 'Larbi',
      role: 'client',
      status: true,
      activated: true,
      isSuspended: false,
      isDemo: true,
      complete: true,
      language: 'fr',
      seedId: 'TOURIVA-DEMO-2026',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    console.log(`Created demo user traveler2@touriva.test with id ${result.insertedId}`);
  } else {
    console.log('traveler2@touriva.test already exists.');
  }

  // 3. Ensure all demo users have activated: true, status: true, isSuspended: false
  console.log('\n--- 3. Verifying active statuses on demo users ---');
  const demoUsersUpdate = await db.collection('users').updateMany(
    {
      $or: [
        { email: { $regex: '@touriva.test$' } },
        { email: { $regex: '@touriva.example$' } },
        { isDemo: true }
      ]
    },
    {
      $set: {
        status: true,
        activated: true,
        isSuspended: false
      }
    }
  );
  console.log(`Verified/updated ${demoUsersUpdate.matchedCount} demo accounts (modified: ${demoUsersUpdate.modifiedCount})`);

  // 4. Update legacy orders to realistic statuses
  console.log('\n--- 4. Updating legacy orders to realistic non-cancelled states ---');
  await db.collection('orders').updateOne(
    { orderNumber: 'TRV-MKT-2026-00001' },
    { $set: { status: 'completed', paymentStatus: 'verified', updatedAt: new Date() } }
  );
  await db.collection('orders').updateOne(
    { orderNumber: 'TRV-MKT-2026-00002' },
    { $set: { status: 'confirmed', paymentStatus: 'verified', updatedAt: new Date() } }
  );
  await db.collection('orders').updateOne(
    { orderNumber: 'TRV-MKT-2026-00003' },
    { $set: { status: 'pending', paymentStatus: 'pending_verification', updatedAt: new Date() } }
  );
  console.log('Legacy orders TRV-MKT-2026-00001..00003 updated to completed, confirmed, and pending states.');

  // 5. Verification check
  const totalUsers = await db.collection('users').countDocuments();
  const totalProducts = await db.collection('products').countDocuments();
  const totalOrders = await db.collection('orders').countDocuments();
  console.log(`\nVerification counts: Total Users: ${totalUsers}, Total Products: ${totalProducts}, Total Orders: ${totalOrders}`);

  await mongoose.disconnect();
  console.log('[REPAIR] Marketplace demo data repair completed successfully.');
}

repair().catch(err => {
  console.error('[REPAIR ERROR]', err);
  process.exit(1);
});
