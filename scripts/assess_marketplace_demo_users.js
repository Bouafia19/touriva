const mongoose = require('mongoose');

async function audit() {
  const token = 'rnd_09R1e728z5m1udOToN7YgHZwzTgp';
  const serviceId = 'srv-dbkr1kt9fdbs73c4a3ug';
  const headers = { 'Authorization': `Bearer ${token}` };

  const res = await fetch(`https://api.render.com/v1/services/${serviceId}/env-vars`, { headers });
  const vars = await res.json();
  const mongoVar = vars.find(v => v.envVar.key === 'MONGO_URI');
  if (!mongoVar) {
    console.error('MONGO_URI not found');
    process.exit(1);
  }
  const mongoUri = mongoVar.envVar.value;

  console.log('Connecting to production MongoDB...');
  await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 8000 });
  console.log('Connected! Database Name:', mongoose.connection.name);

  const db = mongoose.connection.db;
  const collections = await db.listCollections().toArray();
  console.log('Collections in database:', collections.map(c => c.name));

  const users = await db.collection('users').find({}).toArray();
  console.log(`\nTotal users found: ${users.length}`);

  const userSummary = users.map(u => ({
    id: u._id.toString(),
    email: u.email,
    name: `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.name,
    role: u.role,
    status: u.status,
    isSuspended: u.isSuspended,
    hasPassword: !!u.password,
    passwordHashType: u.password ? (u.password.startsWith('$2') ? 'bcrypt' : 'plain/other') : 'none',
    passwordHashLength: u.password ? u.password.length : 0,
    storeName: u.storeName,
    companyName: u.companyName,
    isDemo: u.isDemo,
    seedId: u.seedId,
    createdAt: u.createdAt
  }));

  console.log('User Accounts Overview:');
  console.table(userSummary);

  // Check seller profiles
  const sellerProfiles = await db.collection('sellerprofiles').find({}).toArray();
  console.log(`\nTotal SellerProfiles: ${sellerProfiles.length}`);
  const profileSummary = sellerProfiles.map(p => ({
    id: p._id.toString(),
    userId: p.userId ? p.userId.toString() : null,
    storeName: p.storeName,
    storeSlug: p.storeSlug,
    status: p.status,
    verificationStatus: p.verificationStatus
  }));
  console.table(profileSummary);

  // Check products
  const products = await db.collection('products').find({}).toArray();
  console.log(`\nTotal Products: ${products.length}`);
  const productSummary = products.map(pr => ({
    id: pr._id.toString(),
    name: pr.name,
    category: pr.category,
    price: pr.price,
    quantity: pr.quantity,
    seller: pr.seller ? pr.seller.toString() : (pr.sellerId ? pr.sellerId.toString() : null),
    status: pr.status
  }));
  console.table(productSummary.slice(0, 10));

  // Check orders
  const orders = await db.collection('orders').find({}).toArray();
  console.log(`\nTotal Orders: ${orders.length}`);
  const orderSummary = orders.map(o => ({
    id: o._id.toString(),
    orderNumber: o.orderNumber,
    customer: o.customer ? o.customer.toString() : (o.userId ? o.userId.toString() : null),
    totalAmount: o.totalAmount,
    status: o.status,
    paymentStatus: o.paymentStatus,
    itemsCount: o.items ? o.items.length : 0
  }));
  console.table(orderSummary);

  await mongoose.disconnect();
  console.log('\nAudit complete.');
}

audit().catch(err => {
  console.error('Audit failed:', err);
  process.exit(1);
});
