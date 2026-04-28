import fs from 'fs';

async function run() {
  console.log('Fetching sitemap...');
  const res = await fetch('https://football-logos.cc/sitemap-0.xml');
  const xml = await res.text();
  
  // Extract all locations
  const locations = Array.from(xml.matchAll(/<loc>(.*?)<\/loc>/g)).map(m => m[1]);
  // Filter only those representing a club (two paths after domain, e.g. /country/club/)
  const clubUrls = locations.filter(url => {
    const p = new URL(url).pathname.split('/').filter(Boolean);
    return p.length === 2 && p[0] !== 'tournaments'; // tournaments isn't a country
  });
  
  console.log(`Found ${clubUrls.length} club URLs. Scraping in batches of 50...`);
  const results = [];
  
  const batchSize = 50;
  for (let i = 0; i < clubUrls.length; i += batchSize) {
    const batch = clubUrls.slice(i, i + batchSize);
    console.log(`Batch ${Math.floor(i / batchSize) + 1} / ${Math.ceil(clubUrls.length / batchSize)}`);
    
    // Fetch batch in parallel
    const promises = batch.map(async (url) => {
      try {
        const htmlRes = await fetch(url);
        const html = await htmlRes.text();
        
        // Find logo image (e.g. 512x512)
        const match = html.match(/<img[^>]*src="([^"]*256x256[^"]*)"/);
        // Fallback or anything if no 256x256
        const anyImg = match ? match[1] : html.match(/<img[^>]*src="([^"]*assets\.football-logos\.cc[^"]*)"/)?.[1];
        
        const pathParts = new URL(url).pathname.split('/').filter(Boolean);
        return {
          country: pathParts[0],
          slug: pathParts[1],
          name: pathParts[1].replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
          logoUrl: anyImg || null
        };
      } catch (e) {
        console.error(`Failed to fetch ${url}`, e);
        return null;
      }
    });
    
    const resolved = await Promise.all(promises);
    for (const r of resolved) {
      if (r && r.logoUrl) results.push(r);
    }
  }
  
  console.log(`Successfully scraped ${results.length} club logos.`);
  if (!fs.existsSync('src/data')) fs.mkdirSync('src/data', { recursive: true });
  fs.writeFileSync('src/data/clubs.json', JSON.stringify(results, null, 2));
}

run();

