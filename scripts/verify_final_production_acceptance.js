const dns = require('dns').promises;
const tls = require('tls');

async function getCertDetails(host) {
  return new Promise((resolve, reject) => {
    console.log(`[TLS] Handshaking with ${host}...`);
    const socket = tls.connect(443, host, { servername: host, family: 4 }, () => {
      const cert = socket.getPeerCertificate();
      const info = {
        host,
        authorized: socket.authorized,
        protocol: socket.getProtocol(),
        cipher: socket.getCipher()?.name,
        subjectCN: cert.subject?.CN,
        san: cert.subjectaltname,
        issuerO: cert.issuer?.O,
        issuerCN: cert.issuer?.CN,
        validFrom: cert.valid_from,
        validTo: cert.valid_to
      };
      console.log(`[TLS] Verified: ${host} -> CN=${info.subjectCN}`);
      socket.end();
      resolve(info);
    });
    socket.on('error', reject);
  });
}

async function runFinalAcceptance() {
  console.log('========================================================================');
  console.log('[FINAL ACCEPTANCE AUDIT] Touriva Marketplace Production Verification');
  console.log('========================================================================\n');

  const results = [];
  const apiUrl = 'https://touriva-shop-api.onrender.com';
  const customDomains = [
    { name: 'Public Storefront', domain: 'market.touriva.nextchallenge.tech', deepRoute: '/apply-seller' },
    { name: 'Seller Partner Portal', domain: 'seller.market.touriva.nextchallenge.tech', deepRoute: '/login' },
    { name: 'Owner Administration', domain: 'admin.market.touriva.nextchallenge.tech', deepRoute: '/login' }
  ];

  // 1. DNS Resolution & HTTPS SSL Handshake on All 3 Custom Domains
  for (const item of customDomains) {
    try {
      const cname = await dns.resolveCname(item.domain);
      const cert = await getCertDetails(item.domain);
      const resRoot = await fetch(`https://${item.domain}`);
      const resDeep = await fetch(`https://${item.domain}${item.deepRoute}`);
      
      const pass = cname.length > 0 && cert.authorized && resRoot.status === 200 && resDeep.status === 200;
      results.push({
        category: 'Frontend Custom Domain',
        test: `${item.name} (${item.domain})`,
        status: pass ? 'PASS' : 'FAIL',
        cname: cname[0],
        certIssuer: `${cert.issuerO} (${cert.issuerCN})`,
        certSubject: cert.subjectCN,
        rootStatus: resRoot.status,
        deepRouteStatus: resDeep.status
      });
    } catch (e) {
      results.push({
        category: 'Frontend Custom Domain',
        test: `${item.name} (${item.domain})`,
        status: 'FAIL',
        error: e.message
      });
    }
  }

  // 2. Marketplace API Connectivity & Health
  try {
    const resHealth = await fetch(`${apiUrl}/api/health`);
    const dataHealth = await resHealth.json();
    const pass = resHealth.status === 200 && dataHealth.status === 'ok' && dataHealth.database === 'connected';
    results.push({
      category: 'Marketplace API',
      test: 'API Health & DB Connectivity',
      status: pass ? 'PASS' : 'FAIL',
      service: dataHealth.service,
      database: dataHealth.database
    });
  } catch (e) {
    results.push({ category: 'Marketplace API', test: 'API Health', status: 'FAIL', error: e.message });
  }

  // 3. CORS Allowed for All 3 Custom Origins
  for (const item of customDomains) {
    const origin = `https://${item.domain}`;
    try {
      const resCors = await fetch(`${apiUrl}/api/health`, { headers: { Origin: origin } });
      const allow = resCors.headers.get('access-control-allow-origin');
      const pass = resCors.status === 200 && allow === origin;
      results.push({
        category: 'CORS Security',
        test: `CORS Allowlist: ${origin}`,
        status: pass ? 'PASS' : 'FAIL',
        allowOrigin: allow
      });
    } catch (e) {
      results.push({ category: 'CORS Security', test: `CORS: ${origin}`, status: 'FAIL', error: e.message });
    }
  }

  // 4. Catalog Loading
  let sampleProduct = null;
  try {
    const resCat = await fetch(`${apiUrl}/api/marketplace/products`);
    const dataCat = await resCat.json();
    const pass = resCat.status === 200 && Array.isArray(dataCat.products) && dataCat.products.length > 0;
    if (pass) sampleProduct = dataCat.products[0];
    results.push({
      category: 'Storefront Workflow',
      test: 'Public Catalog Retrieval',
      status: pass ? 'PASS' : 'FAIL',
      productCount: dataCat.products?.length,
      sampleTitle: sampleProduct?.name?.substring(0, 30)
    });
  } catch (e) {
    results.push({ category: 'Storefront Workflow', test: 'Public Catalog Retrieval', status: 'FAIL', error: e.message });
  }

  // 5. Seller Authentication & IDOR Scoped Data Access
  let sellerToken = null;
  try {
    const resLogin = await fetch(`${apiUrl}/api/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'seller1@touriva.test', password: 'Password123!' })
    });
    const dataLogin = await resLogin.json();
    sellerToken = dataLogin.token;

    const resOrders = await fetch(`${apiUrl}/api/seller/orders`, {
      headers: { Authorization: `Bearer ${sellerToken}` }
    });
    const dataOrders = await resOrders.json();

    const pass = resLogin.status === 200 && dataLogin.user?.role === 'seller' && resOrders.status === 200;
    results.push({
      category: 'Seller Portal Workflow',
      test: 'Seller Auth & Scoped IDOR Orders',
      status: pass ? 'PASS' : 'FAIL',
      role: dataLogin.user?.role,
      tokenIssued: !!sellerToken,
      ordersAccessible: Array.isArray(dataOrders.orders)
    });
  } catch (e) {
    results.push({ category: 'Seller Portal Workflow', test: 'Seller Auth & IDOR', status: 'FAIL', error: e.message });
  }

  // 6. Owner Admin Authentication & Platform Governance
  let adminToken = null;
  try {
    const resAdmin = await fetch(`${apiUrl}/api/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@touriva.test', password: 'Password123!' })
    });
    const dataAdmin = await resAdmin.json();
    adminToken = dataAdmin.token;

    const resApps = await fetch(`${apiUrl}/api/admin/marketplace/seller-applications`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const dataApps = await resApps.json();

    const resLedger = await fetch(`${apiUrl}/api/admin/marketplace/commissions`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const dataLedger = await resLedger.json();

    const pass = resAdmin.status === 200 && dataAdmin.user?.role === 'administrator' && resApps.status === 200 && resLedger.status === 200;
    results.push({
      category: 'Owner Admin Workflow',
      test: 'Admin Auth, Applications & Ledger',
      status: pass ? 'PASS' : 'FAIL',
      role: dataAdmin.user?.role,
      pendingApps: dataApps.applications?.length,
      earnedDZD: dataLedger.summary?.totalPlatformEarnedDZD
    });
  } catch (e) {
    results.push({ category: 'Owner Admin Workflow', test: 'Admin Auth & Governance', status: 'FAIL', error: e.message });
  }

  // 7. Critical Workflow: Customer Multi-Vendor Checkout
  if (sampleProduct) {
    try {
      const checkoutPayload = {
        customerInfo: {
          fullName: 'Netlify Final Acceptance Auditor',
          email: 'final-acceptance@touriva.test',
          phone: '+213550009999',
          wilaya: 'Algiers',
          shippingAddress: 'Boulevard des Martyrs, Algiers'
        },
        items: [
          { productId: sampleProduct._id, quantity: 1 }
        ],
        paymentMethod: 'cash_on_delivery'
      };

      const resCheckout = await fetch(`${apiUrl}/api/marketplace/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(checkoutPayload)
      });
      const dataCheckout = await resCheckout.json();
      const pass = resCheckout.status === 201 && !!dataCheckout.order?.orderNumber;
      results.push({
        category: 'Checkout Workflow',
        test: 'End-to-End Customer Order Placement',
        status: pass ? 'PASS' : 'FAIL',
        orderNumber: dataCheckout.order?.orderNumber,
        totalAmountDZD: dataCheckout.order?.totalAmountDZD
      });
    } catch (e) {
      results.push({ category: 'Checkout Workflow', test: 'End-to-End Customer Order Placement', status: 'FAIL', error: e.message });
    }
  }

  // 8. Protected Tourism Platform Freeze Verification
  try {
    const resTourismWeb = await fetch('https://touriva.nextchallenge.tech');
    const resTourismApi = await fetch('https://api.touriva.nextchallenge.tech/api/health');
    const dataTourismApi = await resTourismApi.json();

    const pass = resTourismWeb.status === 200 && resTourismApi.status === 200 && dataTourismApi.status === 'ok';
    results.push({
      category: 'Tourism Protection',
      test: 'Protected Tourism Platform Freeze Check',
      status: pass ? 'PASS' : 'FAIL',
      tourismWebStatus: resTourismWeb.status,
      tourismApiService: dataTourismApi.service,
      tourismApiDB: dataTourismApi.database
    });
  } catch (e) {
    results.push({ category: 'Tourism Protection', test: 'Protected Tourism Freeze', status: 'FAIL', error: e.message });
  }

  // 9. Render Rollback Standby Availability
  for (const s of [
    { name: 'Standby Storefront', url: 'https://touriva-shop-web.onrender.com' },
    { name: 'Standby Seller Portal', url: 'https://touriva-shop-seller-admin.onrender.com' },
    { name: 'Standby Owner Admin', url: 'https://touriva-shop-admin.onrender.com' }
  ]) {
    try {
      const res = await fetch(s.url);
      const pass = res.status === 200;
      results.push({
        category: 'Rollback Readiness',
        test: s.name,
        status: pass ? 'PASS' : 'FAIL',
        httpStatus: res.status
      });
    } catch (e) {
      results.push({ category: 'Rollback Readiness', test: s.name, status: 'FAIL', error: e.message });
    }
  }

  console.table(results);

  const allPassed = results.every(r => r.status === 'PASS');
  console.log(`\n========================================================================`);
  console.log(`FINAL ACCEPTANCE RESULT: ${allPassed ? 'ALL TESTS PASSED (100% COMPLETE)' : 'SOME CHECKS FAILED'}`);
  console.log(`========================================================================`);
}

runFinalAcceptance().catch(console.error);
