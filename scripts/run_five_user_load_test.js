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
      'User-Agent': 'Touriva-LoadTest/1.0',
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

// Authenticate helper
async function getAuthToken(apiBase, credentials) {
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

// Define the 5 Persona Actions
function createPersonas(sellerToken, customerToken, sampleTripId, sampleProductId) {
  return [
    // User 1: Touriva Browser
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
    // User 2: Touriva Planner
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
    // User 3: Marketplace Shopper
    {
      id: 3,
      name: 'User 3 — Marketplace Shopper (Catalog, Categories & Detail)',
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
    // User 4: Marketplace Seller (Authenticated)
    {
      id: 4,
      name: 'User 4 — Marketplace Verified Seller (Dashboard & Fulfillment)',
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
    // User 5: Cross-Platform Authenticated Customer
    {
      id: 5,
      name: 'User 5 — Dual-Platform Authenticated Traveler & Buyer',
      platform: 'Both (Touriva + Marketplace)',
      runStep: async () => {
        const endpoints = [
          { url: `${SHOP_API_BASE}/api/marketplace/orders/my`, headers: { 'Authorization': `Bearer ${customerToken}` } },
          { url: `${SHOP_API_BASE}/api/marketplace/products` },
          { url: `${TOURIVA_API_BASE}/api/trips` },
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
async function runStage({ stageName, activeUsers, durationSeconds, personas, logIntervalSec = 30 }) {
  console.log(`\n================================================================`);
  console.log(`STARTING ${stageName} — ${activeUsers.length} Active Concurrent Users for ${durationSeconds} seconds`);
  console.log(`Users: ${activeUsers.map(u => `U${u.id}`).join(', ')}`);
  console.log(`================================================================`);

  const results = [];
  const startTime = Date.now();
  const endTime = startTime + (durationSeconds * 1000);
  let isRunning = true;

  // Progress logger
  const progressTimer = setInterval(() => {
    const elapsed = Math.round((Date.now() - startTime) / 1000);
    const rem = Math.max(0, durationSeconds - elapsed);
    const completed = results.length;
    const errors = results.filter(r => r.status >= 500 || r.status === 0).length;
    const durations = results.map(r => r.duration);
    const p95 = durations.length ? computePercentiles(durations).p95 : 0;
    console.log(`[${stageName} Progress] Elapsed: ${elapsed}s / ${durationSeconds}s | Requests: ${completed} | 5xx Errors: ${errors} | p95 Latency: ${p95}ms`);
  }, logIntervalSec * 1000);

  // Run each user worker loop
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

      // Realistic human think time: 1.5 to 3.0 seconds between interactions
      const thinkTime = 1500 + Math.floor(Math.random() * 1500);
      await sleep(thinkTime);
    }
  });

  await Promise.all(workers);
  clearInterval(progressTimer);

  const totalTimeSec = ((Date.now() - startTime) / 1000).toFixed(1);
  const durations = results.map(r => r.duration);
  const stats = computePercentiles(durations);

  const statusCounts = {};
  for (const r of results) {
    statusCounts[r.status] = (statusCounts[r.status] || 0) + 1;
  }

  const errors5xx = results.filter(r => r.status >= 500 || r.status === 0).length;
  const errors4xx = results.filter(r => r.status >= 400 && r.status < 500).length;
  const success2xx = results.filter(r => r.status >= 200 && r.status < 300).length;

  console.log(`\n--- ${stageName} COMPLETED (${totalTimeSec}s) ---`);
  console.log(`Total Requests: ${results.length}`);
  console.log(`Status Breakdown:`, statusCounts);
  console.log(`2xx Success Rate: ${((success2xx / (results.length || 1)) * 100).toFixed(2)}%`);
  console.log(`5xx Error Rate: ${((errors5xx / (results.length || 1)) * 100).toFixed(2)}% (${errors5xx} errors)`);
  console.log(`Latency Stats (ms): Min=${stats.min}, Mean=${stats.mean}, Median=${stats.median}, p90=${stats.p90}, p95=${stats.p95}, p99=${stats.p99}, Max=${stats.max}`);

  return {
    stageName,
    concurrentUsers: activeUsers.length,
    durationSeconds: parseFloat(totalTimeSec),
    totalRequests: results.length,
    statusCounts,
    success2xx,
    errors4xx,
    errors5xx,
    stats,
    results
  };
}

(async () => {
  const args = process.argv.slice(2);
  const mode = args[0] || 'full'; // 'dry-run' or 'full'

  console.log('================================================================');
  console.log('TOURIVA & MARKETPLACE — FREE-TIER 5-USER LOAD TEST SUITE');
  console.log('Mode:', mode);
  console.log('Timestamp:', new Date().toISOString());
  console.log('================================================================');

  // Step 1: Discover sample IDs
  console.log('\n[1/4] Discovering sample catalog items for realistic requests...');
  let sampleTripId = null;
  let sampleProductId = null;

  try {
    const tripsRes = await httpRequest(`${TOURIVA_API_BASE}/api/trips`);
    if (tripsRes.status === 200 && Array.isArray(tripsRes.data) && tripsRes.data.length > 0) {
      sampleTripId = tripsRes.data[0]._id;
      console.log(`Found Sample Trip ID: ${sampleTripId} ("${tripsRes.data[0].name || tripsRes.data[0].title}")`);
    }
  } catch (e) {
    console.log('Could not fetch sample trip:', e.message);
  }

  try {
    const shopRes = await httpRequest(`${SHOP_API_BASE}/api/marketplace/catalog`);
    const prods = shopRes.data?.products || shopRes.data;
    if (shopRes.status === 200 && Array.isArray(prods) && prods.length > 0) {
      sampleProductId = prods[0]._id;
      console.log(`Found Sample Product ID: ${sampleProductId} ("${prods[0].name}")`);
    }
  } catch (e) {
    console.log('Could not fetch sample product:', e.message);
  }

  // Step 2: Authenticate personas
  console.log('\n[2/4] Authenticating test personas...');
  const sellerToken = await getAuthToken(SHOP_API_BASE, SELLER_CREDENTIALS);
  console.log('Seller authenticated. Token received.');
  const customerToken = await getAuthToken(SHOP_API_BASE, CUSTOMER_CREDENTIALS);
  console.log('Customer authenticated. Token received.');

  const personas = createPersonas(sellerToken, customerToken, sampleTripId, sampleProductId);
  console.log(`Configured ${personas.length} Distinct Test Personas:`);
  personas.forEach(p => console.log(` - U${p.id}: ${p.name} [${p.platform}]`));

  // Step 3: Run Stages
  const stageResults = [];

  if (mode === 'dry-run') {
    console.log('\n--- EXECUTING QUICK DRY RUN (30s verification) ---');
    const dryRun = await runStage({
      stageName: 'DRY RUN (5 Users, 30s)',
      activeUsers: personas,
      durationSeconds: 30,
      personas,
      logIntervalSec: 10
    });
    stageResults.push(dryRun);
  } else {
    // STAGE A: 1 Concurrent User (1.5 minutes)
    const stageA = await runStage({
      stageName: 'Stage A — 1 Concurrent User (Baseline Calibration)',
      activeUsers: [personas[0]],
      durationSeconds: 90,
      personas,
      logIntervalSec: 30
    });
    stageResults.push(stageA);

    // STAGE B: 3 Concurrent Users (2 minutes)
    const stageB = await runStage({
      stageName: 'Stage B — 3 Concurrent Users (Ramp-up)',
      activeUsers: [personas[0], personas[1], personas[2]],
      durationSeconds: 120,
      personas,
      logIntervalSec: 30
    });
    stageResults.push(stageB);

    // STAGE C: 5 Concurrent Users (3 minutes)
    const stageC = await runStage({
      stageName: 'Stage C — 5 Concurrent Users (Full Concurrency)',
      activeUsers: personas,
      durationSeconds: 180,
      personas,
      logIntervalSec: 30
    });
    stageResults.push(stageC);

    // STAGE D: 5 Concurrent Users Sustained for 15 minutes (900 seconds)
    const stageD = await runStage({
      stageName: 'Stage D — 5 Concurrent Users Sustained (15-Minute Endurance Test)',
      activeUsers: personas,
      durationSeconds: 900,
      personas,
      logIntervalSec: 60
    });
    stageResults.push(stageD);
  }

  // Save summary JSON
  const outPath = path.resolve(__dirname, '../audit/five_user_load_test_results.json');
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(stageResults, null, 2));
  console.log(`\nTest results saved to: ${outPath}`);

  console.log('\n================================================================');
  console.log('ALL LOAD TEST STAGES COMPLETED SUCCESSFULLY');
  console.log('================================================================');
})();
