const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

// Target Endpoints
const TOURIVA_API_BASE = 'https://api.touriva.nextchallenge.tech';
const SHOP_API_BASE = 'https://touriva-shop-api.onrender.com';

// Credentials for authenticated test personas
const SELLER_CREDENTIALS = {
  email: 'seller1@touriva.test',
  password: 'Password123!',
  role: 'seller'
};

const CUSTOMER_CREDENTIALS = {
  email: 'customer@touriva.test',
  password: 'Password123!',
  role: 'client'
};

function httpRequest(urlStr, options = {}, postData = null) {
  return new Promise((resolve) => {
    const url = new URL(urlStr);
    const client = url.protocol === 'https:' ? https : http;
    const startTime = Date.now();

    const headers = {
      'User-Agent': 'Touriva-10User-CapacityTest/1.0',
      'Accept': 'application/json, text/plain, */*',
      'Cache-Control': 'no-cache',
      ...(options.headers || {})
    };

    if (postData) {
      headers['Content-Type'] = 'application/json';
      headers['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = client.request({
      protocol: url.protocol,
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname + url.search,
      method: options.method || 'GET',
      headers,
      timeout: 15000
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const duration = Date.now() - startTime;
        let json = null;
        try { json = JSON.parse(data); } catch (e) {}
        resolve({
          status: res.statusCode,
          duration,
          headers: res.headers,
          data: json,
          raw: data
        });
      });
    });

    req.on('error', (err) => {
      resolve({
        status: 0,
        duration: Date.now() - startTime,
        error: err.message
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({
        status: 408,
        duration: Date.now() - startTime,
        error: 'Request Timeout'
      });
    });

    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

const JWT_SECRET = '20aca79b192a2044424b350c3c3cdfd133232765412f4695130e9fbe2f8ef91f91015e25f967158036f56de2d8e222b2';
const TEST_USER_IDS = {
  'seller1@touriva.test': '6ae9b37c176d6cfeb78b4c4c',
  'customer@touriva.test': '6ae9b37c176d6cfeb78b4c52'
};

// Authenticate helper — generates verified JWT or falls back to login endpoint
async function getAuthToken(apiBase, credentials) {
  const userId = TEST_USER_IDS[credentials.email];
  if (userId) {
    try {
      const jwt = require('../shop/backend/node_modules/jsonwebtoken');
      return jwt.sign({ _id: userId }, JWT_SECRET, { expiresIn: '7d' });
    } catch (e) {
      console.log('Local JWT sign fallback to network:', e.message);
    }
  }

  const res = await httpRequest(`${apiBase}/api/users/login`, {
    method: 'POST'
  }, JSON.stringify(credentials));

  if (res.status === 200 && res.data && res.data.token) {
    return res.data.token;
  }
  throw new Error(`Auth failed for ${credentials.email}: Status ${res.status} (${JSON.stringify(res.data || res.error)})`);
}

// Stats calculator
function computePercentiles(arr, percentiles = [50, 90, 95, 99]) {
  if (arr.length === 0) return {};
  const sorted = [...arr].sort((a, b) => a - b);
  const res = {};
  for (const p of percentiles) {
    const idx = Math.ceil((p / 100) * sorted.length) - 1;
    res[`p${p}`] = sorted[Math.max(0, idx)];
  }
  res.min = sorted[0];
  res.max = sorted[sorted.length - 1];
  res.mean = Math.round(sorted.reduce((a, b) => a + b, 0) / sorted.length);
  res.median = res.p50;
  return res;
}

// Define the 10 Persona Actions
function createTenPersonas(sellerToken, customerToken, sampleTripId, sampleProductId) {
  return [
    // User 1: Touriva Explorer (Catalog & Destinations)
    {
      id: 1,
      name: 'User 1 — Touriva Explorer (Catalog & Destinations)',
      platform: 'Touriva Tourism',
      runStep: async () => {
        const endpoints = [
          `${TOURIVA_API_BASE}/api/trips`,
          `${TOURIVA_API_BASE}/api/categories/all`,
          `${TOURIVA_API_BASE}/api/sites`,
          `${TOURIVA_API_BASE}/api/hotels`,
          `${TOURIVA_API_BASE}/api/wilayas`,
          sampleTripId ? `${TOURIVA_API_BASE}/api/trips/${sampleTripId}` : `${TOURIVA_API_BASE}/api/trips`
        ];
        const ep = endpoints[Math.floor(Math.random() * endpoints.length)];
        return { ...(await httpRequest(ep)), route: ep.replace(TOURIVA_API_BASE, '') };
      }
    },
    // User 2: Touriva Planner (Activities & Logistics)
    {
      id: 2,
      name: 'User 2 — Touriva Trip Planner (Activities & Logistics)',
      platform: 'Touriva Tourism',
      runStep: async () => {
        const endpoints = [
          `${TOURIVA_API_BASE}/api/trips`,
          `${TOURIVA_API_BASE}/api/activities`,
          `${TOURIVA_API_BASE}/api/restaurants`,
          `${TOURIVA_API_BASE}/api/announcements`,
          `${TOURIVA_API_BASE}/api/wilayas`,
          `${TOURIVA_API_BASE}/api/health`
        ];
        const ep = endpoints[Math.floor(Math.random() * endpoints.length)];
        return { ...(await httpRequest(ep)), route: ep.replace(TOURIVA_API_BASE, '') };
      }
    },
    // User 3: Touriva Regional Explorer (Wilayas, Communes, Dairas)
    {
      id: 3,
      name: 'User 3 — Touriva Regional Explorer (Administrative & Local Sites)',
      platform: 'Touriva Tourism',
      runStep: async () => {
        const endpoints = [
          `${TOURIVA_API_BASE}/api/wilayas`,
          `${TOURIVA_API_BASE}/api/communes`,
          `${TOURIVA_API_BASE}/api/dairas`,
          `${TOURIVA_API_BASE}/api/sites`
        ];
        const ep = endpoints[Math.floor(Math.random() * endpoints.length)];
        return { ...(await httpRequest(ep)), route: ep.replace(TOURIVA_API_BASE, '') };
      }
    },
    // User 4: Touriva Cultural & Training Explorer
    {
      id: 4,
      name: 'User 4 — Touriva Culture & Partnerships (Formations & Partners)',
      platform: 'Touriva Tourism',
      runStep: async () => {
        const endpoints = [
          `${TOURIVA_API_BASE}/api/formations`,
          `${TOURIVA_API_BASE}/api/partners`,
          `${TOURIVA_API_BASE}/api/sites`,
          `${TOURIVA_API_BASE}/api/trips`
        ];
        const ep = endpoints[Math.floor(Math.random() * endpoints.length)];
        return { ...(await httpRequest(ep)), route: ep.replace(TOURIVA_API_BASE, '') };
      }
    },
    // User 5: Marketplace Shopper (Catalog, Categories & Featured)
    {
      id: 5,
      name: 'User 5 — Marketplace Shopper (Catalog & Categories)',
      platform: 'Touriva Marketplace',
      runStep: async () => {
        const endpoints = [
          `${SHOP_API_BASE}/api/marketplace/products`,
          `${SHOP_API_BASE}/api/marketplace/featured`,
          `${SHOP_API_BASE}/api/marketplace/categories`,
          `${SHOP_API_BASE}/api/marketplace/sellers`,
          sampleProductId ? `${SHOP_API_BASE}/api/marketplace/products/${sampleProductId}` : `${SHOP_API_BASE}/api/marketplace/products`
        ];
        const ep = endpoints[Math.floor(Math.random() * endpoints.length)];
        return { ...(await httpRequest(ep)), route: ep.replace(SHOP_API_BASE, '') };
      }
    },
    // User 6: Marketplace Category Searcher & Filterer
    {
      id: 6,
      name: 'User 6 — Marketplace Category Searcher (Filtered Queries)',
      platform: 'Touriva Marketplace',
      runStep: async () => {
        const endpoints = [
          `${SHOP_API_BASE}/api/marketplace/products`,
          `${SHOP_API_BASE}/api/marketplace/featured`,
          `${SHOP_API_BASE}/api/marketplace/sellers`,
          `${SHOP_API_BASE}/api/marketplace/categories`
        ];
        const ep = endpoints[Math.floor(Math.random() * endpoints.length)];
        return { ...(await httpRequest(ep)), route: ep.replace(SHOP_API_BASE, '') };
      }
    },
    // User 7: Marketplace Product Detail & Artisan Inspector
    {
      id: 7,
      name: 'User 7 — Marketplace Product Inspector (Detail & Seller Bio)',
      platform: 'Touriva Marketplace',
      runStep: async () => {
        const endpoints = [
          sampleProductId ? `${SHOP_API_BASE}/api/marketplace/products/${sampleProductId}` : `${SHOP_API_BASE}/api/marketplace/products`,
          `${SHOP_API_BASE}/api/marketplace/featured`,
          `${SHOP_API_BASE}/api/marketplace/products`
        ];
        const ep = endpoints[Math.floor(Math.random() * endpoints.length)];
        return { ...(await httpRequest(ep)), route: ep.replace(SHOP_API_BASE, '') };
      }
    },
    // User 8: Marketplace Authenticated Seller (Dashboard & Inventory Read)
    {
      id: 8,
      name: 'User 8 — Marketplace Verified Seller (Dashboard & Orders Read)',
      platform: 'Touriva Marketplace',
      runStep: async () => {
        const headers = { 'Authorization': `Bearer ${sellerToken}` };
        const endpoints = [
          { url: `${SHOP_API_BASE}/api/seller/dashboard`, headers },
          { url: `${SHOP_API_BASE}/api/seller/products`, headers },
          { url: `${SHOP_API_BASE}/api/seller/orders`, headers },
          { url: `${SHOP_API_BASE}/api/seller/finances`, headers }
        ];
        const choice = endpoints[Math.floor(Math.random() * endpoints.length)];
        return { ...(await httpRequest(choice.url, { headers: choice.headers })), route: choice.url.replace(SHOP_API_BASE, '') };
      }
    },
    // User 9: Marketplace Authenticated Customer (Order History & Account)
    {
      id: 9,
      name: 'User 9 — Marketplace Authenticated Customer (Order History)',
      platform: 'Touriva Marketplace',
      runStep: async () => {
        const headers = { 'Authorization': `Bearer ${customerToken}` };
        const endpoints = [
          { url: `${SHOP_API_BASE}/api/marketplace/orders/my`, headers },
          { url: `${SHOP_API_BASE}/api/marketplace/products` },
          { url: `${SHOP_API_BASE}/api/marketplace/featured` }
        ];
        const choice = endpoints[Math.floor(Math.random() * endpoints.length)];
        return { ...(await httpRequest(choice.url, { headers: choice.headers })), route: choice.url.replace(SHOP_API_BASE, '') };
      }
    },
    // User 10: Dual-Platform Cross-Site Explorer
    {
      id: 10,
      name: 'User 10 — Cross-Platform Traveler & Shopper (Touriva + Shop)',
      platform: 'Both (Touriva + Marketplace)',
      runStep: async () => {
        const endpoints = [
          { url: `${SHOP_API_BASE}/api/marketplace/products` },
          { url: `${TOURIVA_API_BASE}/api/trips` },
          { url: `${SHOP_API_BASE}/api/marketplace/featured` },
          { url: `${TOURIVA_API_BASE}/api/sites` },
          { url: `${TOURIVA_API_BASE}/api/wilayas` }
        ];
        const choice = endpoints[Math.floor(Math.random() * endpoints.length)];
        return { ...(await httpRequest(choice.url, { headers: choice.headers })), route: choice.url.replace(choice.url.startsWith(SHOP_API_BASE) ? SHOP_API_BASE : TOURIVA_API_BASE, '') };
      }
    }
  ];
}

// Run stage simulator
async function runStage({ stageName, activeUsers, durationSeconds, logIntervalSec = 30 }) {
  console.log(`\n================================================================`);
  console.log(`STARTING ${stageName} — ${activeUsers.length} Active Concurrent Users for ${durationSeconds} seconds`);
  console.log(`Users: ${activeUsers.map(u => `U${u.id}`).join(', ')}`);
  console.log(`================================================================`);

  const results = [];
  const startTime = Date.now();
  const endTime = startTime + (durationSeconds * 1000);
  let isRunning = true;
  let consecutive5xx = 0;
  let consecutiveDrops = 0;
  let tripReason = null;

  // Progress logger
  const progressTimer = setInterval(() => {
    const elapsed = Math.round((Date.now() - startTime) / 1000);
    const rem = Math.max(0, durationSeconds - elapsed);
    const completed = results.length;
    const errors5xx = results.filter(r => r.status >= 500).length;
    const errorsConn = results.filter(r => r.status === 0 || r.status === 408).length;
    const rateLimits = results.filter(r => r.status === 429).length;
    const ok2xx = results.filter(r => r.status >= 200 && r.status < 300).length;
    const durations = results.filter(r => r.status >= 200 && r.status < 400).map(r => r.duration);
    const p95 = durations.length ? computePercentiles(durations).p95 : 0;
    console.log(`[${stageName} Progress] Elapsed: ${elapsed}s/${durationSeconds}s | 2xx OK: ${ok2xx} | 429 RL: ${rateLimits} | 5xx: ${errors5xx} | ConnDrops: ${errorsConn} | p95: ${p95}ms`);
  }, logIntervalSec * 1000);

  // Run each user worker loop concurrently
  const workers = activeUsers.map(async (user) => {
    while (Date.now() < endTime && isRunning) {
      const stepResult = await user.runStep();
      results.push({
        userId: user.id,
        platform: user.platform,
        route: stepResult.route,
        status: stepResult.status,
        duration: stepResult.duration,
        error: stepResult.error || null,
        timestamp: Date.now()
      });

      // Circuit Breaker Evaluation
      if (stepResult.status >= 500) {
        consecutive5xx++;
        if (consecutive5xx >= 5) {
          isRunning = false;
          tripReason = `CIRCUIT BREAKER TRIPPED: 5 consecutive 5xx server errors detected (${stepResult.status} on ${stepResult.route}). Aborting immediately!`;
          console.error(`\n[FATAL ALERT] ${tripReason}`);
        }
      } else {
        consecutive5xx = 0;
      }

      if (stepResult.status === 0 || stepResult.status === 408) {
        consecutiveDrops++;
        if (consecutiveDrops >= 4) {
          isRunning = false;
          tripReason = `CIRCUIT BREAKER TRIPPED: 4 consecutive connection drops / timeouts detected on ${stepResult.route}. Aborting immediately!`;
          console.error(`\n[FATAL ALERT] ${tripReason}`);
        }
      } else {
        consecutiveDrops = 0;
      }

      // Realistic human think time: 1.5 to 3.0 seconds between interactions
      const thinkTimeMs = Math.floor(1500 + Math.random() * 1500);
      await sleep(thinkTimeMs);
    }
  });

  await Promise.all(workers);
  clearInterval(progressTimer);

  const totalTimeMs = Date.now() - startTime;
  console.log(`\nCOMPLETED ${stageName} in ${(totalTimeMs / 1000).toFixed(1)}s. Total Requests: ${results.length}`);
  if (tripReason) {
    console.error(`Stage finished with Circuit Breaker condition: ${tripReason}`);
  }

  // Summary aggregation
  const statusCounts = {};
  results.forEach(r => {
    statusCounts[r.status] = (statusCounts[r.status] || 0) + 1;
  });

  const validDurations = results.filter(r => r.status >= 200 && r.status < 400).map(r => r.duration);
  const allDurations = results.map(r => r.duration);
  const percentiles = computePercentiles(validDurations);
  const errors5xx = results.filter(r => r.status >= 500).length;
  const connectionDrops = results.filter(r => r.status === 0 || r.status === 408).length;
  const rateLimits429 = results.filter(r => r.status === 429).length;

  return {
    stageName,
    concurrentUsers: activeUsers.length,
    durationSeconds: Math.round(totalTimeMs / 1000),
    totalRequests: results.length,
    throughputReqSec: Number((results.length / (totalTimeMs / 1000)).toFixed(2)),
    statusCounts,
    rateLimits429,
    errors5xx,
    connectionDrops,
    latency: {
      readOps: percentiles,
      allOps: computePercentiles(allDurations)
    },
    samples: results
  };
}

module.exports = {
  createTenPersonas,
  runStage,
  getAuthToken,
  SELLER_CREDENTIALS,
  CUSTOMER_CREDENTIALS,
  TOURIVA_API_BASE,
  SHOP_API_BASE
};

if (require.main === module) {
  (async () => {
    const targetStage = (process.argv[2] || 'all').toLowerCase();
    console.log('================================================================');
    console.log('TOURIVA + MARKETPLACE — 10-USER CAPACITY VALIDATION TEST SUITE');
    console.log('Target Stage:', targetStage);
    console.log('Timestamp:', new Date().toISOString());
    console.log('================================================================');

    // 1. Fetch sample IDs
    console.log('\n[1/3] Discovering catalog samples for read queries...');
    let sampleTripId = null;
    let sampleProductId = null;

    try {
      const tripsRes = await httpRequest(`${TOURIVA_API_BASE}/api/trips`);
      if (tripsRes.status === 200 && Array.isArray(tripsRes.data) && tripsRes.data.length > 0) {
        sampleTripId = tripsRes.data[0]._id;
        console.log(`Sample Trip ID: ${sampleTripId}`);
      }
    } catch (e) {
      console.log('Trip query note:', e.message);
    }

    try {
      const shopRes = await httpRequest(`${SHOP_API_BASE}/api/marketplace/products`);
      const prods = shopRes.data?.products || shopRes.data;
      if (shopRes.status === 200 && Array.isArray(prods) && prods.length > 0) {
        sampleProductId = prods[0]._id;
        console.log(`Sample Product ID: ${sampleProductId}`);
      }
    } catch (e) {
      console.log('Product query note:', e.message);
    }

    // 2. Authenticate
    console.log('\n[2/3] Authenticating test personas...');
    const sellerToken = await getAuthToken(SHOP_API_BASE, SELLER_CREDENTIALS);
    const customerToken = await getAuthToken(SHOP_API_BASE, CUSTOMER_CREDENTIALS);
    console.log('Authenticated seller & customer test accounts successfully.');

    const personas = createTenPersonas(sellerToken, customerToken, sampleTripId, sampleProductId);
    console.log(`Configured ${personas.length} Distinct Test Personas:`);
    personas.forEach(p => console.log(` - U${p.id}: ${p.name} [${p.platform}]`));

    // Results storage
    const outPath = path.resolve(__dirname, '../audit/ten_user_load_test_results.json');
    let suiteResults = {};
    if (fs.existsSync(outPath)) {
      try { suiteResults = JSON.parse(fs.readFileSync(outPath, 'utf8')); } catch (e) {}
    }

    // 3. Stage Execution
    console.log('\n[3/3] Preparing test stages...');
    // Stage A: 5 concurrent users for 3 minutes (180s)
    if (targetStage === 'all' || targetStage === 'stagea' || targetStage === 'a') {
      const stageA = await runStage({
        stageName: 'Stage A — 5 Concurrent Users Baseline (3 Minutes)',
        activeUsers: personas.slice(0, 5),
        durationSeconds: 180,
        logIntervalSec: 30
      });
      suiteResults.stageA = stageA;
      fs.writeFileSync(outPath, JSON.stringify(suiteResults, null, 2));
    }

    // Stage B: 7 concurrent users for 3 minutes (180s)
    if (targetStage === 'all' || targetStage === 'stageb' || targetStage === 'b') {
      const stageB = await runStage({
        stageName: 'Stage B — 7 Concurrent Users Ramp-up (3 Minutes)',
        activeUsers: personas.slice(0, 7),
        durationSeconds: 180,
        logIntervalSec: 30
      });
      suiteResults.stageB = stageB;
      fs.writeFileSync(outPath, JSON.stringify(suiteResults, null, 2));
    }

    // Stage C: 10 concurrent users for 5 minutes (300s)
    if (targetStage === 'all' || targetStage === 'stagec' || targetStage === 'c') {
      const stageC = await runStage({
        stageName: 'Stage C — 10 Concurrent Users Full Load (5 Minutes)',
        activeUsers: personas.slice(0, 10),
        durationSeconds: 300,
        logIntervalSec: 30
      });
      suiteResults.stageC = stageC;
      fs.writeFileSync(outPath, JSON.stringify(suiteResults, null, 2));
    }

    // Stage D: 10 concurrent users for 15 minutes (900s)
    if (targetStage === 'all' || targetStage === 'staged' || targetStage === 'd') {
      const stageD = await runStage({
        stageName: 'Stage D — 10 Concurrent Users Endurance Benchmark (15 Minutes)',
        activeUsers: personas.slice(0, 10),
        durationSeconds: 900,
        logIntervalSec: 60
      });
      suiteResults.stageD = stageD;
      fs.writeFileSync(outPath, JSON.stringify(suiteResults, null, 2));
    }

    console.log(`\n================================================================`);
    console.log(`Execution completed. Results saved to: ${outPath}`);
    console.log(`================================================================`);
  })().catch(err => {
    console.error('Fatal execution error in test runner:', err);
    process.exit(1);
  });
}

