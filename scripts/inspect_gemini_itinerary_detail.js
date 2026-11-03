const API_BASE = 'https://touriva-api.onrender.com';

async function inspectItinerary() {
  const loginRes = await fetch(`${API_BASE}/api/users/demo-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ demoType: 'customer' })
  });
  const { token } = await loginRes.json();
  const start = Date.now();
  const res = await fetch(`${API_BASE}/api/aiTrips/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      city: 'Algiers',
      days: 3,
      budget: 'medium',
      partyType: 'Couple',
      preferences: ['Culture', 'Historical sites', 'Gastronomy'],
      theme: 'Cultural'
    })
  });

  const dur = (Date.now() - start) / 1000;
  const trip = await res.json();
  console.log(`Generated in: ${dur.toFixed(2)}s`);
  console.log(`Provider: ${trip.aiProvider} | Model: ${trip.aiModel}`);
  console.log(`Trip Name: ${trip.name}`);
  console.log(`Description: ${trip.description}`);
  console.log(`Inclusions:`, trip.inclusions);

  (trip.items || []).forEach(d => {
    console.log(`\n--- Day ${d.day}: ${(d.items || []).length} activities ---`);
    (d.items || []).forEach(it => {
      console.log(`  * [${it.time || '10:00'}] ${it.title} (Lat: ${it.lat}, Lng: ${it.lng})`);
      console.log(`    ${it.description}`);
    });
  });

  // Clean up
  if (trip._id) {
    await fetch(`${API_BASE}/api/trips/${trip._id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
  }
}

inspectItinerary().catch(console.error);
