const dns = require('dns').promises;

const resolvers = [
  { name: 'System', resolver: new dns.Resolver() },
  { name: 'Google (8.8.8.8)', resolver: (() => { const r = new dns.Resolver(); r.setServers(['8.8.8.8']); return r; })() },
  { name: 'Cloudflare (1.1.1.1)', resolver: (() => { const r = new dns.Resolver(); r.setServers(['1.1.1.1']); return r; })() }
];

const domains = [
  'market.touriva.nextchallenge.tech',
  'seller.market.touriva.nextchallenge.tech',
  'admin.market.touriva.nextchallenge.tech'
];

async function check() {
  for (const d of domains) {
    console.log(`=== Checking: ${d} ===`);
    for (const r of resolvers) {
      try {
        const cnames = await r.resolver.resolveCname(d);
        console.log(`  [${r.name}] CNAME: ${cnames.join(', ')}`);
      } catch (e) {
        try {
          const a = await r.resolver.resolve4(d);
          console.log(`  [${r.name}] A: ${a.join(', ')}`);
        } catch (err) {
          console.log(`  [${r.name}] Error: CNAME(${e.code}) A(${err.code})`);
        }
      }
    }
  }
}

check().catch(console.error);
