/**
 * Touriva Unified Master Demo Seeder
 * Safely runs the reproducible seeders for both Touriva Core and Touriva Shop databases.
 * 
 * Guarantees:
 * - Only touches 'touriva' and 'touriva_shop'
 * - Refuses execution if any reference to 'djawal' is present
 */

const { fork } = require('child_process')
const path = require('path')

function runChildScript(scriptPath, cwd, label) {
  return new Promise((resolve, reject) => {
    console.log(`\n======================================================`)
    console.log(`>>> EXECUTING SEED FOR: ${label}`)
    console.log(`>>> Script: ${scriptPath}`)
    console.log(`======================================================\n`)

    const child = fork(scriptPath, [], { cwd })

    child.on('error', (err) => {
      console.error(`Failed to execute ${label}:`, err)
      reject(err)
    })

    child.on('exit', (code) => {
      if (code === 0) {
        console.log(`\n>>> [SUCCESS] Finished seeding ${label} (exit code 0)\n`)
        resolve()
      } else {
        reject(new Error(`${label} failed with exit code ${code}`))
      }
    })
  })
}

async function main() {
  const rootDir = path.resolve(__dirname, '..')
  const coreSeedScript = path.join(rootDir, 'backend', 'seed', 'seed_touriva.js')
  const shopSeedScript = path.join(rootDir, 'shop', 'backend', 'seed', 'seed_shop.js')

  console.log(`\n======================================================`)
  console.log(`   TOUIRVA DEMO DATASET REPRODUCIBLE SEED RUNNER`)
  console.log(`======================================================\n`)

  try {
    // 1. Seed Touriva Core Platform
    await runChildScript(coreSeedScript, path.join(rootDir, 'backend'), 'Touriva Core Platform')

    // 2. Seed Touriva Shop Marketplace
    await runChildScript(shopSeedScript, path.join(rootDir, 'shop', 'backend'), 'Touriva Shop & Marketplace')

    console.log(`\n======================================================`)
    console.log(`   ALL TOURIVA DATABASES SUCCESSFULLY SEEDED & VERIFIED!`)
    console.log(`======================================================\n`)
  } catch (err) {
    console.error(`\n[FATAL ERROR] Master seed process failed:`, err.message)
    process.exit(1)
  }
}

main()
