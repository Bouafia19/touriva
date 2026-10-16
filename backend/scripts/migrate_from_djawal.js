/**
 * Touriva Safe Database Migration Script
 * Migrates data from Djawal (read-only source) to Touriva (target).
 * 
 * Safety Guarantee:
 * - Read-only access to source databases (`djawal` and `djawalShop`).
 * - Target collections are populated via idempotent upserts (no duplicate ID errors).
 * - Original Djawal database is NEVER modified, updated, or dropped.
 */

const { MongoClient } = require('mongodb')

const SOURCE_MAIN_URI = process.env.SOURCE_MONGO_URI || 'mongodb://localhost:27017/djawal'
const TARGET_MAIN_URI = process.env.TARGET_MONGO_URI || 'mongodb://localhost:27017/touriva'

const SOURCE_SHOP_URI = process.env.SOURCE_SHOP_MONGO_URI || 'mongodb://localhost:27017/djawalShop'
const TARGET_SHOP_URI = process.env.TARGET_SHOP_MONGO_URI || 'mongodb://localhost:27017/touriva_shop'

async function migrateDatabase(sourceUri, targetUri, label) {
  console.log(`\n========================================`)
  console.log(`Starting migration: ${label}`)
  console.log(`Source: ${sourceUri}`)
  console.log(`Target: ${targetUri}`)
  console.log(`========================================`)

  const sourceClient = new MongoClient(sourceUri)
  const targetClient = new MongoClient(targetUri)

  try {
    await sourceClient.connect()
    await targetClient.connect()

    const sourceDb = sourceClient.db()
    const targetDb = targetClient.db()

    const collections = await sourceDb.listCollections().toArray()
    console.log(`Found ${collections.length} collections in source database.`)

    const summary = []

    for (const collInfo of collections) {
      const collName = collInfo.name
      if (collName.startsWith('system.')) continue

      const sourceColl = sourceDb.collection(collName)
      const targetColl = targetDb.collection(collName)

      const totalDocs = await sourceColl.countDocuments()
      if (totalDocs === 0) {
        summary.push({ collection: collName, count: 0, status: 'empty (skipped)' })
        continue
      }

      console.log(`Migrating collection '${collName}' (${totalDocs} documents)...`)
      const cursor = sourceColl.find({})
      const docs = await cursor.toArray()

      // Chunked upsert to preserve all IDs safely
      const CHUNK_SIZE = 500
      let migrated = 0

      for (let i = 0; i < docs.length; i += CHUNK_SIZE) {
        const chunk = docs.slice(i, i + CHUNK_SIZE)
        const ops = chunk.map(doc => ({
          replaceOne: {
            filter: { _id: doc._id },
            replacement: doc,
            upsert: true
          }
        }))
        await targetColl.bulkWrite(ops, { ordered: false })
        migrated += chunk.length
      }

      summary.push({ collection: collName, count: migrated, status: 'success' })
    }

    // Ensure 2dsphere indexes on geo collections in Touriva
    if (label.includes('Main')) {
      for (const geoColl of ['sites', 'hotels', 'restaurants']) {
        try {
          await targetDb.collection(geoColl).createIndex({ location: '2dsphere' })
          console.log(`Created 2dsphere index on '${geoColl}.location'`)
        } catch (idxErr) {
          console.warn(`Note on index for '${geoColl}': ${idxErr.message}`)
        }
      }
    }

    console.log(`\n--- Migration Summary: ${label} ---`)
    console.table(summary)
    console.log(`Successfully migrated ${label} to ${targetDb.databaseName}`)

  } catch (err) {
    console.error(`Migration error for ${label}:`, err)
    throw err
  } finally {
    await sourceClient.close()
    await targetClient.close()
  }
}

async function run() {
  try {
    await migrateDatabase(SOURCE_MAIN_URI, TARGET_MAIN_URI, 'Touriva Main Platform')
    await migrateDatabase(SOURCE_SHOP_URI, TARGET_SHOP_URI, 'Touriva Shop & Marketplace')
    console.log('\nAll migrations completed safely without altering original databases!')
    process.exit(0)
  } catch (err) {
    console.error('\nFatal migration error:', err)
    process.exit(1)
  }
}

run()
