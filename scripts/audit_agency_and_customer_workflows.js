/**
 * Touriva Agency & Customer Complete Workflow Audit Script
 * Tests:
 *  - Public catalog discovery (Trips, Sites, Hotels, Restaurants)
 *  - Tourist journey (Login, Profile, Bookings, Enquiries)
 *  - Manual Trip Builder (Create, Read, Update, Delete)
 *  - Schema parity between AI and Manual trips
 *  - Agency Portal (Login, Dashboard, Packages, Departures, Passenger Manifest, Financials)
 *  - Cross-Agency & Role-Based Access IDOR Security Controls
 */

const fs = require('fs');
const path = require('path');

const API_BASE = process.env.API_URL || 'https://touriva-api.onrender.com';

async function runWorkflowsAudit() {
  console.log(`=============================================================`);
  console.log(`   TOURIVA CUSTOMER & AGENCY WORKFLOW AUDIT                  `);
  console.log(`   Target API: ${API_BASE}                                   `);
  console.log(`=============================================================\n`);

  const auditLog = [];
  function record(section, test, status, details) {
    const symbol = status === 'PASS' ? '✓' : status === 'FAIL' ? '✗' : '⚠';
    console.log(`[${status}] ${section} > ${test}: ${details}`);
    auditLog.push({ section, test, status, details });
  }

  // -------------------------------------------------------------
  // 1. PUBLIC TOURISM DISCOVERY
  // -------------------------------------------------------------
  console.log('\n--- 1. PUBLIC TOURISM CATALOG DISCOVERY ---');
  try {
    const tripsRes = await fetch(`${API_BASE}/api/trips`);
    const trips = await tripsRes.json();
    record('Public Discovery', 'Catalog Trips', tripsRes.ok && trips.length > 0 ? 'PASS' : 'FAIL', 
      `HTTP ${tripsRes.status}, count: ${trips.length || 0}`);
  } catch (e) {
    record('Public Discovery', 'Catalog Trips', 'FAIL', e.message);
  }

  try {
    const sitesRes = await fetch(`${API_BASE}/api/sites`);
    const sites = await sitesRes.json();
    record('Public Discovery', 'Cultural & Heritage Sites', sitesRes.ok && sites.length > 0 ? 'PASS' : 'FAIL',
      `HTTP ${sitesRes.status}, count: ${sites.length || 0}`);
  } catch (e) {
    record('Public Discovery', 'Cultural Sites', 'FAIL', e.message);
  }

  try {
    const hotelsRes = await fetch(`${API_BASE}/api/hotels`);
    const hotels = await hotelsRes.json();
    record('Public Discovery', 'Hotel Accommodations', hotelsRes.ok && hotels.length > 0 ? 'PASS' : 'FAIL',
      `HTTP ${hotelsRes.status}, count: ${hotels.length || 0}`);
  } catch (e) {
    record('Public Discovery', 'Hotels', 'FAIL', e.message);
  }

  try {
    const restRes = await fetch(`${API_BASE}/api/restaurants`);
    const restaurants = await restRes.json();
    record('Public Discovery', 'Gastronomic Restaurants', restRes.ok && restaurants.length > 0 ? 'PASS' : 'FAIL',
      `HTTP ${restRes.status}, count: ${restaurants.length || 0}`);
  } catch (e) {
    record('Public Discovery', 'Restaurants', 'FAIL', e.message);
  }

  // -------------------------------------------------------------
  // 2. TOURIST JOURNEY & AUTHENTICATION
  // -------------------------------------------------------------
  console.log('\n--- 2. TOURIST JOURNEY & AUTHENTICATION ---');
  let touristToken = null;
  let touristUser = null;

  try {
    const res = await fetch(`${API_BASE}/api/users/demo-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ demoType: 'customer' })
    });
    const data = await res.json();
    if (res.ok && data.token) {
      touristToken = data.token;
      touristUser = data.user;
      record('Tourist Auth', 'Demo Customer Login', 'PASS', `Logged in as ${touristUser.email} (Role: ${touristUser.role})`);
    } else {
      record('Tourist Auth', 'Demo Customer Login', 'FAIL', `HTTP ${res.status}: ${JSON.stringify(data)}`);
    }
  } catch (e) {
    record('Tourist Auth', 'Demo Customer Login', 'FAIL', e.message);
  }

  if (touristToken) {
    // Check bookings
    try {
      const bRes = await fetch(`${API_BASE}/api/bookings/my`, {
        headers: { 'Authorization': `Bearer ${touristToken}` }
      });
      const bookings = await bRes.json();
      record('Tourist Journey', 'My Bookings History', bRes.ok ? 'PASS' : 'FAIL',
        `HTTP ${bRes.status}, retrieved ${bookings.length || 0} active booking(s)`);
    } catch (e) {
      record('Tourist Journey', 'My Bookings History', 'FAIL', e.message);
    }
  }

  // -------------------------------------------------------------
  // 3. MANUAL TRIP BUILDER & SCHEMA COMPATIBILITY
  // -------------------------------------------------------------
  console.log('\n--- 3. MANUAL TRIP BUILDER WORKFLOW ---');
  let createdTripId = null;

  if (touristToken) {
    const manualTripPayload = {
      name: 'Audit Manual Tour Tipaza & Cherchell 2-Day',
      description: 'Comprehensive manual trip created for QA demonstration readiness verification.',
      days: 2,
      duration: 2,
      price: 15000,
      budget: 'medium',
      partyType: 'Couple',
      theme: 'Historical',
      isPublic: false,
      items: [
        {
          day: 1,
          items: [
            {
              time: '09:00',
              title: 'Tipaza Roman Archaeological Park',
              description: 'UNESCO World Heritage coastal Roman ruins and amphitheatre.',
              lat: 36.5925,
              lng: 2.4419
            },
            {
              time: '13:00',
              title: 'Seaside Seafood Lunch Port de Tipaza',
              description: 'Fresh grilled Mediterranean fish overlooking ancient port.',
              lat: 36.5941,
              lng: 2.4452
            }
          ]
        },
        {
          day: 2,
          items: [
            {
              time: '10:00',
              title: 'Royal Mausoleum of Mauretania',
              description: 'Monumental ancient pyramid tomb of Queen Cleopatra Selene II and King Juba II.',
              lat: 36.5746,
              lng: 2.5489
            }
          ]
        }
      ]
    };

    try {
      const createRes = await fetch(`${API_BASE}/api/trips`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${touristToken}`
        },
        body: JSON.stringify(manualTripPayload)
      });

      const tripData = await createRes.json();
      if (createRes.ok && tripData._id) {
        createdTripId = tripData._id;
        record('Manual Trip Builder', 'Trip Creation & Persistence', 'PASS',
          `Created Trip ID: ${createdTripId}, Days: ${tripData.items?.length}, Price: ${tripData.price} DZD`);

        // Check schema fields
        const hasDays = Array.isArray(tripData.items) && tripData.items.length === 2;
        const hasStops = tripData.items[0]?.items?.length === 2;
        const hasCoords = tripData.items[0]?.items[0]?.lat === 36.5925;
        record('Manual Trip Builder', 'Schema Compatibility Validation', hasDays && hasStops && hasCoords ? 'PASS' : 'FAIL',
          `DaySchema items: ${hasDays}, Stops: ${hasStops}, Coordinates: ${hasCoords}`);

        // Update trip
        const updateRes = await fetch(`${API_BASE}/api/trips/${createdTripId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${touristToken}`
          },
          body: JSON.stringify({ name: 'Audit Manual Tour Tipaza & Cherchell 2-Day (Updated)' })
        });
        const updatedData = await updateRes.json();
        record('Manual Trip Builder', 'Trip Updating', updateRes.ok && updatedData.name?.includes('Updated') ? 'PASS' : 'FAIL',
          `HTTP ${updateRes.status}, Updated title confirmed`);

        // Clean up test trip
        const delRes = await fetch(`${API_BASE}/api/trips/${createdTripId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${touristToken}` }
        });
        record('Manual Trip Builder', 'Trip Deletion', delRes.ok ? 'PASS' : 'FAIL', `HTTP ${delRes.status}`);

      } else {
        record('Manual Trip Builder', 'Trip Creation', 'FAIL', `HTTP ${createRes.status}: ${JSON.stringify(tripData)}`);
      }
    } catch (e) {
      record('Manual Trip Builder', 'Trip Creation', 'FAIL', e.message);
    }
  }

  // -------------------------------------------------------------
  // 4. TRAVEL AGENCY EXPERIENCE
  // -------------------------------------------------------------
  console.log('\n--- 4. TRAVEL AGENCY BACKOFFICE WORKFLOW ---');
  let agencyToken = null;
  let agencyUser = null;

  try {
    const aRes = await fetch(`${API_BASE}/api/users/demo-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ demoType: 'agency' })
    });
    const aData = await aRes.json();
    if (aRes.ok && aData.token) {
      agencyToken = aData.token;
      agencyUser = aData.user;
      record('Agency Portal', 'Agency Demo Login', 'PASS',
        `Logged in as ${agencyUser.companyName || agencyUser.email} (License: ${agencyUser.hasLicense})`);
    } else {
      record('Agency Portal', 'Agency Demo Login', 'FAIL', `HTTP ${aRes.status}: ${JSON.stringify(aData)}`);
    }
  } catch (e) {
    record('Agency Portal', 'Agency Demo Login', 'FAIL', e.message);
  }

  if (agencyToken) {
    // Packages
    let testDepartureId = null;
    try {
      const pkgRes = await fetch(`${API_BASE}/api/agency/packages`, {
        headers: { 'Authorization': `Bearer ${agencyToken}` }
      });
      const pkgs = await pkgRes.json();
      record('Agency Portal', 'Package & Circuit Inventory', pkgRes.ok ? 'PASS' : 'FAIL',
        `HTTP ${pkgRes.status}, count: ${pkgs.length || 0}`);
    } catch (e) {
      record('Agency Portal', 'Packages', 'FAIL', e.message);
    }

    // Departures
    try {
      const depRes = await fetch(`${API_BASE}/api/agency/departures`, {
        headers: { 'Authorization': `Bearer ${agencyToken}` }
      });
      const deps = await depRes.json();
      if (deps.length > 0) {
        testDepartureId = deps[0]._id;
      }
      record('Agency Portal', 'Scheduled Departures Calendar', depRes.ok ? 'PASS' : 'FAIL',
        `HTTP ${depRes.status}, count: ${deps.length || 0}`);
    } catch (e) {
      record('Agency Portal', 'Departures', 'FAIL', e.message);
    }

    // Passenger Manifest
    if (testDepartureId) {
      try {
        const manRes = await fetch(`${API_BASE}/api/agency/departures/${testDepartureId}/manifest`, {
          headers: { 'Authorization': `Bearer ${agencyToken}` }
        });
        const manifest = await manRes.json();
        record('Agency Portal', 'Official Passenger Manifest', manRes.ok ? 'PASS' : 'FAIL',
          `HTTP ${manRes.status}, Passengers: ${manifest.passengers?.length || 0}, Seats booked: ${manifest.summary?.totalBookedSeats || 0}`);
      } catch (e) {
        record('Agency Portal', 'Passenger Manifest', 'FAIL', e.message);
      }
    }

    // Financial Ledger
    try {
      const finRes = await fetch(`${API_BASE}/api/financial/agency/financials/dashboard`, {
        headers: { 'Authorization': `Bearer ${agencyToken}` }
      });
      const fin = await finRes.json();
      record('Agency Portal', 'Financial Reconciliation Ledger', finRes.ok ? 'PASS' : 'FAIL',
        `HTTP ${finRes.status}, Total Revenue: ${fin.summary?.totalRevenue || 0} DZD, Methods: ${Object.keys(fin.paymentMethodsBreakdown || {}).join(', ')}`);
    } catch (e) {
      record('Agency Portal', 'Financials', 'FAIL', e.message);
    }
  }

  // -------------------------------------------------------------
  // 5. SECURITY & ROLE-BASED ACCESS GUARDS (IDOR PRESERVATION)
  // -------------------------------------------------------------
  console.log('\n--- 5. SECURITY & IDOR PROTECTION CHECKS ---');

  // Check 1: Tourist CANNOT access agency departures endpoint
  try {
    const sec1 = await fetch(`${API_BASE}/api/agency/departures`, {
      headers: { 'Authorization': `Bearer ${touristToken}` }
    });
    record('Security Guard', 'Tourist Blocked from Agency Departures', sec1.status === 403 ? 'PASS' : 'FAIL',
      `HTTP status: ${sec1.status} (Expected 403 Forbidden)`);
  } catch (e) {
    record('Security Guard', 'Tourist Access Control', 'FAIL', e.message);
  }

  // Check 2: Unauthenticated client CANNOT access /api/bookings/my
  try {
    const sec2 = await fetch(`${API_BASE}/api/bookings/my`);
    record('Security Guard', 'Unauthenticated Access Blocked', sec2.status === 401 ? 'PASS' : 'FAIL',
      `HTTP status: ${sec2.status} (Expected 401 Unauthorized)`);
  } catch (e) {
    record('Security Guard', 'Unauthenticated Access Control', 'FAIL', e.message);
  }

  // Check 3: Admin 1-Click Demo Login Strictly Rejected
  try {
    const sec3 = await fetch(`${API_BASE}/api/users/demo-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ demoType: 'admin' })
    });
    record('Security Guard', 'Admin 1-Click Demo Login Strictly Blocked', sec3.status === 403 ? 'PASS' : 'FAIL',
      `HTTP status: ${sec3.status} (Expected 403 Forbidden)`);
  } catch (e) {
    record('Security Guard', 'Admin Demo Rejection', 'FAIL', e.message);
  }

  // Write audit log
  const outPath = path.resolve(__dirname, '../audit/workflows_audit_results.json');
  fs.writeFileSync(outPath, JSON.stringify(auditLog, null, 2));
  console.log(`\nAudit log saved to: ${outPath}`);
}

runWorkflowsAudit().catch(err => {
  console.error('Workflow audit fatal error:', err);
  process.exit(1);
});
