/**
 * AI Trip Builder Audit & Scenario Verification Script
 * Tests the 5 mandated scenarios against Touriva API with live Gemini verification:
 *   1. Algiers — 3 days — Cultural — Medium budget
 *   2. Tlemcen — 5 days — Family — Medium budget
 *   3. Sahara / Djanet — 4 days — Adventure — High budget
 *   4. Istanbul — 7 days — International — High budget
 *   5. Constantine — 2 days — Historical — Low budget
 */

const fs = require('fs');
const path = require('path');

const API_BASE = process.env.API_URL || 'https://touriva-api.onrender.com';

const scenarios = [
  {
    name: 'Scenario 1: Algiers Cultural 3-Day',
    city: 'Algiers',
    days: 3,
    budget: 'medium',
    partyType: 'Couple',
    preferences: ['Culture', 'Historical sites', 'Gastronomy'],
    theme: 'Cultural'
  },
  {
    name: 'Scenario 2: Tlemcen Family 5-Day',
    city: 'Tlemcen',
    days: 5,
    budget: 'medium',
    partyType: 'Family',
    preferences: ['Heritage', 'Nature', 'Family friendly'],
    theme: 'Family'
  },
  {
    name: 'Scenario 3: Sahara / Djanet Adventure 4-Day',
    city: 'Djanet',
    days: 4,
    budget: 'high',
    partyType: 'Friends',
    preferences: ['Desert', 'Adventure', 'Canyon expedition', 'Camping'],
    theme: 'Adventure'
  },
  {
    name: 'Scenario 4: Istanbul International 7-Day',
    city: 'Istanbul',
    days: 7,
    budget: 'high',
    partyType: 'Solo',
    preferences: ['Historical architecture', 'Bazaars', 'Culinary exploration'],
    theme: 'International'
  },
  {
    name: 'Scenario 5: Constantine Historical 2-Day',
    city: 'Constantine',
    days: 2,
    budget: 'low',
    partyType: 'Solo',
    preferences: ['Bridges', 'Palaces', 'Old town', 'Museums'],
    theme: 'Historical'
  }
];

async function runAudit() {
  console.log(`=============================================================`);
  console.log(`   TOURIVA AI TRIP BUILDER — LIVE AUDIT & SCENARIOS          `);
  console.log(`   Target API: ${API_BASE}                                   `);
  console.log(`=============================================================\n`);

  // 1. Authenticate demo customer
  console.log('1. Authenticating Demo Customer...');
  const loginRes = await fetch(`${API_BASE}/api/users/demo-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ demoType: 'customer' })
  });

  if (!loginRes.ok) {
    throw new Error(`Demo login failed with status ${loginRes.status}: ${await loginRes.text()}`);
  }

  const loginData = await loginRes.json();
  const token = loginData.token;
  console.log(`✓ Authenticated as: ${loginData.user?.email} (${loginData.user?._id})`);

  const results = [];
  const createdTripIds = [];

  for (let i = 0; i < scenarios.length; i++) {
    const sc = scenarios[i];
    console.log(`\n-------------------------------------------------------------`);
    console.log(`Executing ${sc.name}...`);
    console.log(`Parameters: ${sc.city}, ${sc.days} days, ${sc.budget} budget, Theme: ${sc.theme}`);

    const startTime = Date.now();
    try {
      const res = await fetch(`${API_BASE}/api/aiTrips/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(sc)
      });

      const durationMs = Date.now() - startTime;
      const status = res.status;
      const providerHeader = res.headers.get('x-ai-provider');
      const modelHeader = res.headers.get('x-ai-model');

      if (!res.ok) {
        const errorText = await res.text();
        console.error(`✗ HTTP ${status} error (${durationMs}ms): ${errorText}`);
        results.push({
          scenario: sc.name,
          city: sc.city,
          daysRequested: sc.days,
          status: 'FAIL',
          httpStatus: status,
          durationMs,
          error: errorText
        });
        continue;
      }

      const trip = await res.json();
      if (trip._id) {
        createdTripIds.push(trip._id);
      }

      const provider = trip.aiProvider || providerHeader;
      const model = trip.aiModel || modelHeader;
      const items = trip.items || [];
      const daysCount = items.length;

      // Extract activities count
      let totalActivities = 0;
      let validCoordinatesCount = 0;
      const sampleActivities = [];

      items.forEach((day, dayIdx) => {
        const activities = day.items || day.stops || [];
        totalActivities += activities.length;
        activities.forEach((act, actIdx) => {
          const lat = act.lat || act.coordinates?.lat;
          const lng = act.lng || act.coordinates?.lng;
          if (lat || lng) {
            validCoordinatesCount++;
          }
          if (sampleActivities.length < 5) {
            sampleActivities.push(`Day ${day.day || dayIdx + 1} (${act.time || 'flexible'}): ${act.title || act.name} - ${act.description ? act.description.slice(0, 60) + '...' : ''} [${lat}, ${lng}]`);
          }
        });
      });

      console.log(`✓ Generated in ${(durationMs / 1000).toFixed(2)}s`);
      console.log(`  Provider: ${provider} | Model: ${model || 'default'}`);
      console.log(`  Days generated: ${daysCount} (Requested: ${sc.days})`);
      console.log(`  Total stops/activities: ${totalActivities} (${validCoordinatesCount} with coordinates)`);
      console.log(`  Sample activities:`);
      sampleActivities.forEach(s => console.log(`    - ${s}`));

      results.push({
        scenario: sc.name,
        city: sc.city,
        daysRequested: sc.days,
        daysGenerated: daysCount,
        totalActivities,
        validCoordinatesCount,
        status: daysCount === sc.days ? 'PASS' : 'PARTIAL',
        durationMs,
        provider,
        model,
        tripId: trip._id,
        sampleActivities
      });

    } catch (err) {
      console.error(`✗ Exception in ${sc.name}:`, err.message);
      results.push({
        scenario: sc.name,
        city: sc.city,
        status: 'FAIL',
        durationMs: Date.now() - startTime,
        error: err.message
      });
    }
  }

  // Save report JSON
  const reportPath = path.resolve(__dirname, '../audit/ai_scenarios_audit_results.json');
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
  console.log(`\nAudit results written to: ${reportPath}`);

  // Summary Table
  console.log(`\n=============================================================`);
  console.log(`                      AI SCENARIOS SUMMARY TABLE             `);
  console.log(`=============================================================`);
  console.table(results.map(r => ({
    Scenario: r.city,
    Requested: r.daysRequested,
    Generated: r.daysGenerated,
    Activities: r.totalActivities,
    Provider: r.provider,
    Model: r.model,
    Duration: `${(r.durationMs / 1000).toFixed(1)}s`,
    Status: r.status
  })));

  // Clean up created test trips to keep production clean
  console.log('\nCleaning up generated test trips...');
  for (const tripId of createdTripIds) {
    try {
      await fetch(`${API_BASE}/api/trips/${tripId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
    } catch (e) {
      // ignore
    }
  }
  console.log(`Cleaned up ${createdTripIds.length} test trips.`);
}

runAudit().catch(err => {
  console.error('Fatal error running AI scenario audit:', err);
  process.exit(1);
});
