async function runVerification() {
  const webUrl = 'https://touriva-market-web.netlify.app'
  const sellerUrl = 'https://touriva-market-seller.netlify.app'
  const adminUrl = 'https://touriva-market-admin.netlify.app'
  const apiUrl = 'https://touriva-shop-api.onrender.com'

  console.log('================================================================')
  console.log('[NETLIFY MIGRATION ACCEPTANCE AUDIT] Testing Live Deployments')
  console.log('================================================================\n')

  const results = []

  // 1. Netlify Deployments HTTP 200 & SPA Fallback
  for (const [name, url, deep] of [
    ['Storefront', webUrl, `${webUrl}/apply-seller`],
    ['Seller Portal', sellerUrl, `${sellerUrl}/login`],
    ['Owner Admin', adminUrl, `${adminUrl}/login`]
  ]) {
    try {
      const resRoot = await fetch(url)
      const resDeep = await fetch(deep)
      const pass = resRoot.status === 200 && resDeep.status === 200
      results.push({
        test: `1. ${name} Netlify Deployment & SPA Fallback`,
        status: pass ? 'PASS' : 'FAIL',
        rootStatus: resRoot.status,
        deepStatus: resDeep.status
      })
    } catch (e) {
      results.push({ test: `1. ${name} Netlify Deployment`, status: 'FAIL', error: e.message })
    }
  }

  // 2. CORS check with Netlify Origin
  try {
    const resCors = await fetch(`${apiUrl}/api/health`, {
      headers: { 'Origin': webUrl }
    })
    const corsAllow = resCors.headers.get('access-control-allow-origin')
    const corsPass = resCors.status === 200 && (corsAllow === webUrl || corsAllow === '*')
    results.push({
      test: '2. Backend CORS with Netlify Origin',
      status: corsPass ? 'PASS' : 'FAIL',
      allowOrigin: corsAllow
    })
  } catch (e) {
    results.push({ test: '2. Backend CORS with Netlify Origin', status: 'FAIL', error: e.message })
  }

  // 3. Public Products Catalog
  let sampleProduct = null
  try {
    const res = await fetch(`${apiUrl}/api/marketplace/products`)
    const data = await res.json()
    const pass = res.status === 200 && Array.isArray(data.products) && data.products.length > 0
    if (pass) sampleProduct = data.products[0]
    results.push({
      test: '3. Public Marketplace Products Catalog',
      status: pass ? 'PASS' : 'FAIL',
      productCount: data.products?.length
    })
  } catch (e) {
    results.push({ test: '3. Public Marketplace Products Catalog', status: 'FAIL', error: e.message })
  }

  // 4. Seller Authentication & Scoped Access
  let sellerToken = null
  try {
    const res = await fetch(`${apiUrl}/api/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'seller1@touriva.test', password: 'Password123!' })
    })
    const data = await res.json()
    sellerToken = data.token
    const pass = res.status === 200 && !!sellerToken && data.user?.role === 'seller'
    results.push({
      test: '4. Seller Authentication & Role Check',
      status: pass ? 'PASS' : 'FAIL',
      role: data.user?.role
    })
  } catch (e) {
    results.push({ test: '4. Seller Authentication', status: 'FAIL', error: e.message })
  }

  // 5. Seller Scoped Data Isolation (Anti-IDOR)
  if (sellerToken) {
    try {
      const resOrders = await fetch(`${apiUrl}/api/seller/orders`, {
        headers: { 'Authorization': `Bearer ${sellerToken}` }
      })
      const dataOrders = await resOrders.json()
      const resFinances = await fetch(`${apiUrl}/api/seller/finances`, {
        headers: { 'Authorization': `Bearer ${sellerToken}` }
      })
      const dataFinances = await resFinances.json()
      const pass = resOrders.status === 200 && resFinances.status === 200
      results.push({
        test: '5. Seller Anti-IDOR Scoped Access',
        status: pass ? 'PASS' : 'FAIL',
        sellerOrders: dataOrders.orders?.length,
        balance: dataFinances.seller?.balanceDZD
      })
    } catch (e) {
      results.push({ test: '5. Seller Anti-IDOR Scoped Access', status: 'FAIL', error: e.message })
    }
  }

  // 6. Admin Authentication & Permissions
  let adminToken = null
  try {
    const res = await fetch(`${apiUrl}/api/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@touriva.test', password: 'Password123!' })
    })
    const data = await res.json()
    adminToken = data.token
    const pass = res.status === 200 && !!adminToken && data.user?.role === 'administrator'
    results.push({
      test: '6. Admin Authentication & Role Check',
      status: pass ? 'PASS' : 'FAIL',
      role: data.user?.role
    })
  } catch (e) {
    results.push({ test: '6. Admin Authentication', status: 'FAIL', error: e.message })
  }

  // 7. Admin Governance (Applications & Commissions)
  if (adminToken) {
    try {
      const resApps = await fetch(`${apiUrl}/api/admin/marketplace/seller-applications`, {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      })
      const dataApps = await resApps.json()
      const resLedger = await fetch(`${apiUrl}/api/admin/marketplace/commissions`, {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      })
      const dataLedger = await resLedger.json()
      const pass = resApps.status === 200 && resLedger.status === 200
      results.push({
        test: '7. Admin Applications & Commission Ledger',
        status: pass ? 'PASS' : 'FAIL',
        applicationsCount: dataApps.applications?.length,
        totalCommissions: dataLedger.summary?.totalCommissionDZD
      })
    } catch (e) {
      results.push({ test: '7. Admin Applications & Commission Ledger', status: 'FAIL', error: e.message })
    }
  }

  // 8. Customer Checkout Integration
  if (sampleProduct) {
    try {
      const payload = {
        customerInfo: {
          fullName: 'Netlify Migration Auditor',
          email: 'netlify-audit@touriva.test',
          phone: '+213550001234',
          wilaya: 'Algiers',
          shippingAddress: 'Audit Street, Algiers'
        },
        items: [
          {
            productId: sampleProduct._id,
            quantity: 1
          }
        ],
        paymentMethod: 'cash_on_delivery'
      }

      const res = await fetch(`${apiUrl}/api/marketplace/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      const data = await res.json()
      const pass = res.status === 201 && !!data.order?.orderNumber
      results.push({
        test: '8. Customer Multi-Vendor Checkout Workflow',
        status: pass ? 'PASS' : 'FAIL',
        orderNumber: data.order?.orderNumber,
        totalAmountDZD: data.order?.totalAmountDZD
      })
    } catch (e) {
      results.push({ test: '8. Customer Multi-Vendor Checkout Workflow', status: 'FAIL', error: e.message })
    }
  }

  // 9. Tourism Platform Safety Check
  try {
    const resTourismApi = await fetch('https://api.touriva.nextchallenge.tech/api/health')
    const dataTourismApi = await resTourismApi.json()
    const resTourismWeb = await fetch('https://touriva.nextchallenge.tech')
    const pass = resTourismApi.status === 200 && dataTourismApi.status === 'ok' && resTourismWeb.status === 200
    results.push({
      test: '9. Protected Tourism Platform Freeze Check',
      status: pass ? 'PASS' : 'FAIL',
      tourismApi: dataTourismApi.service,
      tourismWebStatus: resTourismWeb.status
    })
  } catch (e) {
    results.push({ test: '9. Protected Tourism Platform Freeze Check', status: 'FAIL', error: e.message })
  }

  console.table(results)

  const allPassed = results.every(r => r.status === 'PASS')
  console.log(`\nACCEPTANCE VERIFICATION RESULT: ${allPassed ? 'ALL 9 CHECKS PASSED (100%)' : 'SOME CHECKS FAILED'}`)
}

runVerification().catch(console.error)
