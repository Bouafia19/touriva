const API_BASE = 'https://touriva-api.onrender.com';

async function assessInventory() {
  console.log('Fetching live database inventory for demo readiness...');
  
  // Public counts
  const trips = await (await fetch(`${API_BASE}/api/trips`)).json();
  const sites = await (await fetch(`${API_BASE}/api/sites`)).json();
  const hotels = await (await fetch(`${API_BASE}/api/hotels`)).json();
  const restaurants = await (await fetch(`${API_BASE}/api/restaurants`)).json();

  // Agency Demo counts
  const aLogin = await (await fetch(`${API_BASE}/api/users/demo-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ demoType: 'agency' })
  })).json();

  const aToken = aLogin.token;
  const packages = await (await fetch(`${API_BASE}/api/agency/packages`, {
    headers: { 'Authorization': `Bearer ${aToken}` }
  })).json();

  const departures = await (await fetch(`${API_BASE}/api/agency/departures`, {
    headers: { 'Authorization': `Bearer ${aToken}` }
  })).json();

  const financials = await (await fetch(`${API_BASE}/api/financial/agency/financials/dashboard`, {
    headers: { 'Authorization': `Bearer ${aToken}` }
  })).json();

  // Tourist Demo counts
  const cLogin = await (await fetch(`${API_BASE}/api/users/demo-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ demoType: 'customer' })
  })).json();

  const cToken = cLogin.token;
  const bookings = await (await fetch(`${API_BASE}/api/bookings/my`, {
    headers: { 'Authorization': `Bearer ${cToken}` }
  })).json();

  console.log('\n--- LIVE DEMO INVENTORY SUMMARY ---');
  console.log(`Public Marketplace Trips: ${trips.length}`);
  console.log(`Accredited Cultural & Heritage Sites: ${sites.length}`);
  console.log(`Partner Hotels & Stays: ${hotels.length}`);
  console.log(`Gastronomic & Traditional Restaurants: ${restaurants.length}`);
  console.log(`Agency Organized Packages: ${packages.length}`);
  console.log(`Agency Scheduled Departures: ${departures.length}`);
  console.log(`Tourist Active Bookings: ${bookings.length}`);
  console.log(`Agency Financial Records: ${financials.summary?.totalRevenue || 0} DZD recorded`);

  // Sample trip details
  console.log('\nSample Trips in Marketplace:');
  trips.slice(0, 5).forEach((t, i) => {
    console.log(`  ${i + 1}. ${t.name} (${t.durationDays || t.days?.length || 1} days) - ${t.price || 'N/A'} DZD - Dest: ${t.destination?.name || 'Algérie'}`);
  });
}

assessInventory().catch(console.error);
