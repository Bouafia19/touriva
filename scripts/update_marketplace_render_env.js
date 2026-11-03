const crypto = require('crypto')

async function run() {
  const token = 'rnd_09R1e728z5m1udOToN7YgHZwzTgp'
  const serviceId = 'srv-dbkr1kt9fdbs73c4a3ug'
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }

  // 1. Get touriva-api env vars to retrieve exact production MongoDB cluster credentials
  const resTourism = await fetch('https://api.render.com/v1/services/srv-dbb3a4lg1s2s73e3ll9g/env-vars', { headers })
  const tourismVars = await resTourism.json()

  let mongoUri = null
  for (const item of tourismVars) {
    if (item.envVar.key === 'MONGO_URI') {
      mongoUri = item.envVar.value
    }
  }

  if (!mongoUri) {
    console.error('Failed to locate MONGO_URI from touriva-api')
    process.exit(1)
  }

  const shopMongoUri = mongoUri.replace(/\/touriva\?/, '/touriva_shop?')
  console.log('Constructed isolated Marketplace MONGO_URI for touriva_shop')

  const highEntropySecret = crypto.randomBytes(48).toString('hex')

  const targetEnvVars = [
    { key: 'NODE_ENV', value: 'production' },
    { key: 'PORT', value: '5000' },
    { key: 'MONGO_URI', value: shopMongoUri },
    { key: 'SECRET', value: highEntropySecret },
    {
      key: 'CORS_ORIGINS',
      value: [
        'https://market.touriva.nextchallenge.tech',
        'https://api.market.touriva.nextchallenge.tech',
        'https://seller.market.touriva.nextchallenge.tech',
        'https://admin.market.touriva.nextchallenge.tech',
        'https://touriva-shop-web.onrender.com',
        'https://touriva-shop-admin.onrender.com',
        'https://touriva-shop-seller-admin.onrender.com',
        'https://touriva-market-web.netlify.app',
        'https://touriva-market-seller.netlify.app',
        'https://touriva-market-admin.netlify.app'
      ].join(',')
    }
  ]

  // 2. Put env-vars to touriva-shop-api (srv-dbkr1kt9fdbs73c4a3ug)
  const resShop = await fetch(`https://api.render.com/v1/services/${serviceId}/env-vars`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(targetEnvVars)
  })

  if (!resShop.ok) {
    const errorText = await resShop.text()
    console.error('Failed to update env vars on touriva-shop-api:', resShop.status, errorText)
    process.exit(1)
  }

  const result = await resShop.json()
  console.log('Successfully set environment variables on touriva-shop-api:')
  for (const item of result) {
    console.log(`- ${item.envVar.key} (synced)`)
  }

  // 3. Trigger immediate deploy to apply the new secret and env vars
  const resDeploy = await fetch(`https://api.render.com/v1/services/${serviceId}/deploys`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ clearCache: 'do_not_clear' })
  })

  const deployData = await resDeploy.json()
  console.log(`Triggered redeploy: ${deployData.id}, status: ${deployData.status}`)
}

run().catch(err => {
  console.error(err)
  process.exit(1)
})
