// Merge duplicate Mini Bar and Safe Box modules into single chapters
// Adds LAXREE vs Quba comparison content and sets PDF URLs
process.env.DATABASE_URL = 'postgresql://neondb_owner:npg_vRfGm1u6XDtq@ep-fragrant-brook-adhkdpuc-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require';
process.env.DIRECT_URL = 'postgresql://neondb_owner:npg_vRfGm1u6XDtq@ep-fragrant-brook-adhkdpuc.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require';

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🔧 Merging duplicate Mini Bar and Safe Box modules...\n');

  const paCourse = await prisma.course.findFirst({ where: { moduleType: 'PRODUCT_ACADEMY' } });
  if (!paCourse) {
    console.error('Product Academy course not found!');
    process.exit(1);
  }

  // Find all Mini Bar modules
  const miniBarModules = await prisma.module.findMany({
    where: {
      courseId: paCourse.id,
      title: { contains: 'Mini Bar', mode: 'insensitive' }
    },
    orderBy: { order: 'asc' }
  });
  console.log(`Found ${miniBarModules.length} Mini Bar modules:`);
  miniBarModules.forEach(m => console.log(`  - [${m.order}] ${m.title} (content: ${m.content?.length || 0} chars)`));

  // Find all Safe Box modules
  const safeBoxModules = await prisma.module.findMany({
    where: {
      courseId: paCourse.id,
      title: { contains: 'Safe Box', mode: 'insensitive' }
    },
    orderBy: { order: 'asc' }
  });
  console.log(`\nFound ${safeBoxModules.length} Safe Box modules:`);
  safeBoxModules.forEach(m => console.log(`  - [${m.order}] ${m.title} (content: ${m.content?.length || 0} chars)`));

  // ==================== MERGE MINI BAR ====================
  console.log('\n📦 Merging Mini Bar modules into ONE chapter...');

  // Keep the first module (Mini Bar Technology Deep Dive) as the main one, update its title and content
  const mainMiniBar = miniBarModules[0];
  const mergedMiniBarContent = `
<h2>LAXREE Mini Bar - Complete Product Knowledge</h2>

<h3>1. Introduction to LAXREE Mini Bars</h3>
<p>LAXREE offers a comprehensive range of hotel mini bars designed for every hotel category — from budget properties to ultra-luxury 5-star resorts. Our mini bars are engineered with hospitality-specific features including silent operation, energy efficiency, and elegant designs that complement any room decor. With over a decade of experience serving the global hospitality industry, LAXREE has refined its mini bar lineup to address the specific needs of hotel operators: guest comfort, operational efficiency, and aesthetic integration.</p>

<h3>2. Mini Bar Cooling Technologies — Deep Dive</h3>
<p>LAXREE offers three primary cooling technologies, each suited to different hotel segments and operational requirements:</p>

<h4>2.1 Compressor Mini Bars</h4>
<p><strong>How it works:</strong> Uses a hermetically sealed compressor with refrigerant gas (R600a or R134a) to provide powerful cooling through vapor compression cycle.</p>
<p><strong>Key characteristics:</strong></p>
<ul>
<li>Most powerful cooling capacity — reaches set temperature in 30-45 minutes</li>
<li>Temperature range: 2°C to 8°C</li>
<li>Energy consumption: 0.8 - 1.2 kWh/24h</li>
<li>Noise level: 28-35 dB (audible but quiet)</li>
<li>Best for: 5-star hotels, resorts, properties in hot climates (35°C+ ambient)</li>
<li>Defrosting: Automatic with auto-defrost technology</li>
</ul>

<h4>2.2 Absorption Mini Bars</h4>
<p><strong>How it works:</strong> Uses a heat-driven absorption cycle with ammonia/water solution — no moving parts, completely silent operation.</p>
<p><strong>Key characteristics:</strong></p>
<ul>
<li>Ultra-silent operation: 0 dB (zero noise — no compressor)</li>
<li>Temperature range: 5°C to 12°C</li>
<li>Energy consumption: 1.0 - 1.5 kWh/24h</li>
<li>Best for: Luxury hotels, boutique properties, guest rooms where silence is premium</li>
<li>Longer cooling recovery time: 2-4 hours after door opening</li>
<li>Zero vibration — ideal for sensitive environments</li>
</ul>

<h4>2.3 Thermoelectric Mini Bars</h4>
<p><strong>How it works:</strong> Uses Peltier effect — electric current through semiconductor junctions creates temperature differential.</p>
<p><strong>Key characteristics:</strong></p>
<ul>
<li>Silent operation with no moving parts</li>
<li>Temperature range: 8°C to 15°C (above ambient by 15-20°C)</li>
<li>Energy consumption: 0.7 - 1.0 kWh/24h</li>
<li>Compact size — ideal for small rooms</li>
<li>Best for: Budget hotels, serviced apartments, 3-star properties</li>
<li>Less effective in high ambient temperatures (above 30°C)</li>
</ul>

<h3>3. Mini Bar Models & Specifications</h3>

<h4>3.1 LAXREE Compressor Series</h4>
<table style="width:100%; border-collapse:collapse; margin:12px 0;">
<thead>
<tr style="background:#f0fdf4;">
<th style="border:1px solid #e5e7eb; padding:8px; text-align:left;">Model</th>
<th style="border:1px solid #e5e7eb; padding:8px; text-align:left;">Capacity</th>
<th style="border:1px solid #e5e7eb; padding:8px; text-align:left;">Temp Range</th>
<th style="border:1px solid #e5e7eb; padding:8px; text-align:left;">Energy</th>
<th style="border:1px solid #e5e7eb; padding:8px; text-align:left;">Noise</th>
<th style="border:1px solid #e5e7eb; padding:8px; text-align:left;">Best For</th>
</tr>
</thead>
<tbody>
<tr><td style="border:1px solid #e5e7eb; padding:8px;">LR-C20</td><td style="border:1px solid #e5e7eb; padding:8px;">20L</td><td style="border:1px solid #e5e7eb; padding:8px;">2-8°C</td><td style="border:1px solid #e5e7eb; padding:8px;">0.8 kWh/24h</td><td style="border:1px solid #e5e7eb; padding:8px;">28 dB</td><td style="border:1px solid #e5e7eb; padding:8px;">4-5 star hotels</td></tr>
<tr><td style="border:1px solid #e5e7eb; padding:8px;">LR-C30</td><td style="border:1px solid #e5e7eb; padding:8px;">30L</td><td style="border:1px solid #e5e7eb; padding:8px;">2-8°C</td><td style="border:1px solid #e5e7eb; padding:8px;">1.0 kWh/24h</td><td style="border:1px solid #e5e7eb; padding:8px;">30 dB</td><td style="border:1px solid #e5e7eb; padding:8px;">5 star hotels</td></tr>
<tr><td style="border:1px solid #e5e7eb; padding:8px;">LR-C40</td><td style="border:1px solid #e5e7eb; padding:8px;">40L</td><td style="border:1px solid #e5e7eb; padding:8px;">2-8°C</td><td style="border:1px solid #e5e7eb; padding:8px;">1.1 kWh/24h</td><td style="border:1px solid #e5e7eb; padding:8px;">32 dB</td><td style="border:1px solid #e5e7eb; padding:8px;">5 star resorts</td></tr>
<tr><td style="border:1px solid #e5e7eb; padding:8px;">LR-C50</td><td style="border:1px solid #e5e7eb; padding:8px;">50L</td><td style="border:1px solid #e5e7eb; padding:8px;">2-8°C</td><td style="border:1px solid #e5e7eb; padding:8px;">1.2 kWh/24h</td><td style="border:1px solid #e5e7eb; padding:8px;">35 dB</td><td style="border:1px solid #e5e7eb; padding:8px;">Luxury suites</td></tr>
</tbody>
</table>

<h4>3.2 LAXREE Absorption Series</h4>
<table style="width:100%; border-collapse:collapse; margin:12px 0;">
<thead>
<tr style="background:#f0fdf4;">
<th style="border:1px solid #e5e7eb; padding:8px; text-align:left;">Model</th>
<th style="border:1px solid #e5e7eb; padding:8px; text-align:left;">Capacity</th>
<th style="border:1px solid #e5e7eb; padding:8px; text-align:left;">Temp Range</th>
<th style="border:1px solid #e5e7eb; padding:8px; text-align:left;">Energy</th>
<th style="border:1px solid #e5e7eb; padding:8px; text-align:left;">Noise</th>
<th style="border:1px solid #e5e7eb; padding:8px; text-align:left;">Best For</th>
</tr>
</thead>
<tbody>
<tr><td style="border:1px solid #e5e7eb; padding:8px;">LR-A20</td><td style="border:1px solid #e5e7eb; padding:8px;">20L</td><td style="border:1px solid #e5e7eb; padding:8px;">5-12°C</td><td style="border:1px solid #e5e7eb; padding:8px;">1.0 kWh/24h</td><td style="border:1px solid #e5e7eb; padding:8px;">0 dB</td><td style="border:1px solid #e5e7eb; padding:8px;">Luxury hotels</td></tr>
<tr><td style="border:1px solid #e5e7eb; padding:8px;">LR-A30</td><td style="border:1px solid #e5e7eb; padding:8px;">30L</td><td style="border:1px solid #e5e7eb; padding:8px;">5-12°C</td><td style="border:1px solid #e5e7eb; padding:8px;">1.2 kWh/24h</td><td style="border:1px solid #e5e7eb; padding:8px;">0 dB</td><td style="border:1px solid #e5e7eb; padding:8px;">Boutique hotels</td></tr>
<tr><td style="border:1px solid #e5e7eb; padding:8px;">LR-A40</td><td style="border:1px solid #e5e7eb; padding:8px;">40L</td><td style="border:1px solid #e5e7eb; padding:8px;">5-12°C</td><td style="border:1px solid #e5e7eb; padding:8px;">1.4 kWh/24h</td><td style="border:1px solid #e5e7eb; padding:8px;">0 dB</td><td style="border:1px solid #e5e7eb; padding:8px;">Premium suites</td></tr>
</tbody>
</table>

<h4>3.3 LAXREE Thermoelectric Series</h4>
<table style="width:100%; border-collapse:collapse; margin:12px 0;">
<thead>
<tr style="background:#f0fdf4;">
<th style="border:1px solid #e5e7eb; padding:8px; text-align:left;">Model</th>
<th style="border:1px solid #e5e7eb; padding:8px; text-align:left;">Capacity</th>
<th style="border:1px solid #e5e7eb; padding:8px; text-align:left;">Temp Range</th>
<th style="border:1px solid #e5e7eb; padding:8px; text-align:left;">Energy</th>
<th style="border:1px solid #e5e7eb; padding:8px; text-align:left;">Best For</th>
</tr>
</thead>
<tbody>
<tr><td style="border:1px solid #e5e7eb; padding:8px;">LR-T15</td><td style="border:1px solid #e5e7eb; padding:8px;">15L</td><td style="border:1px solid #e5e7eb; padding:8px;">8-15°C</td><td style="border:1px solid #e5e7eb; padding:8px;">0.7 kWh/24h</td><td style="border:1px solid #e5e7eb; padding:8px;">Budget hotels</td></tr>
<tr><td style="border:1px solid #e5e7eb; padding:8px;">LR-T20</td><td style="border:1px solid #e5e7eb; padding:8px;">20L</td><td style="border:1px solid #e5e7eb; padding:8px;">8-15°C</td><td style="border:1px solid #e5e7eb; padding:8px;">0.8 kWh/24h</td><td style="border:1px solid #e5e7eb; padding:8px;">3-star hotels</td></tr>
<tr><td style="border:1px solid #e5e7eb; padding:8px;">LR-T30</td><td style="border:1px solid #e5e7eb; padding:8px;">30L</td><td style="border:1px solid #e5e7eb; padding:8px;">8-15°C</td><td style="border:1px solid #e5e7eb; padding:8px;">1.0 kWh/24h</td><td style="border:1px solid #e5e7eb; padding:8px;">Serviced apartments</td></tr>
</tbody>
</table>

<h3>4. Key Features Across All Models</h3>
<ul>
<li><strong>Ultra-quiet operation</strong> — as low as 0 dB for absorption models</li>
<li><strong>Energy efficient</strong> with A+ rating — saves 30-40% on electricity</li>
<li><strong>Auto-defrost technology</strong> — maintenance-free operation</li>
<li><strong>LED interior lighting</strong> — elegant and energy-efficient</li>
<li><strong>Adjustable shelves & door bins</strong> — flexible storage configuration</li>
<li><strong>Available in 15L, 20L, 30L, 40L, 50L capacities</strong></li>
<li><strong>Tempered glass shelves</strong> — durable and easy to clean</li>
<li><strong>Reversible door hinge</strong> — flexible installation</li>
<li><strong>Lock option available</strong> — for controlled access</li>
<li><strong>Smart inventory system (optional)</strong> — auto-billing integration with PMS</li>
</ul>

<h3>5. LAXREE vs Godrej Qube Comparison</h3>
<p>When evaluating mini bar options for hotels, the two primary contenders in the Indian market are LAXREE and Godrej Qube. Below is a detailed side-by-side comparison to help you make an informed decision:</p>

<table style="width:100%; border-collapse:collapse; margin:12px 0;">
<thead>
<tr style="background:#065f46; color:white;">
<th style="border:1px solid #e5e7eb; padding:10px; text-align:left; color:white;">Feature</th>
<th style="border:1px solid #e5e7eb; padding:10px; text-align:left; color:white;">LAXREE Mini Bar</th>
<th style="border:1px solid #e5e7eb; padding:10px; text-align:left; color:white;">Godrej Qube</th>
</tr>
</thead>
<tbody>
<tr style="background:#f0fdf4;">
<td style="border:1px solid #e5e7eb; padding:8px;"><strong>Cooling Technology</strong></td>
<td style="border:1px solid #e5e7eb; padding:8px;">Compressor, Absorption & Thermoelectric (3 options)</td>
<td style="border:1px solid #e5e7eb; padding:8px;">Only Absorption (1 option)</td>
</tr>
<tr>
<td style="border:1px solid #e5e7eb; padding:8px;"><strong>Capacity Range</strong></td>
<td style="border:1px solid #e5e7eb; padding:8px;">15L, 20L, 30L, 40L, 50L (5 sizes)</td>
<td style="border:1px solid #e5e7eb; padding:8px;">20L, 40L, 50L (3 sizes)</td>
</tr>
<tr style="background:#f0fdf4;">
<td style="border:1px solid #e5e7eb; padding:8px;"><strong>Temperature Range (Compressor)</strong></td>
<td style="border:1px solid #e5e7eb; padding:8px;">2°C to 8°C</td>
<td style="border:1px solid #e5e7eb; padding:8px;">N/A (no compressor models)</td>
</tr>
<tr>
<td style="border:1px solid #e5e7eb; padding:8px;"><strong>Temperature Range (Absorption)</strong></td>
<td style="border:1px solid #e5e7eb; padding:8px;">5°C to 12°C</td>
<td style="border:1px solid #e5e7eb; padding:8px;">8°C to 12°C</td>
</tr>
<tr style="background:#f0fdf4;">
<td style="border:1px solid #e5e7eb; padding:8px;"><strong>Noise Level (Absorption)</strong></td>
<td style="border:1px solid #e5e7eb; padding:8px;">0 dB (completely silent)</td>
<td style="border:1px solid #e5e7eb; padding:8px;">21-25 dB (slight hum)</td>
</tr>
<tr>
<td style="border:1px solid #e5e7eb; padding:8px;"><strong>Energy Consumption</strong></td>
<td style="border:1px solid #e5e7eb; padding:8px;">0.7 - 1.5 kWh/24h (A+ rated)</td>
<td style="border:1px solid #e5e7eb; padding:8px;">1.2 - 1.8 kWh/24h (B rated)</td>
</tr>
<tr style="background:#f0fdf4;">
<td style="border:1px solid #e5e7eb; padding:8px;"><strong>Warranty</strong></td>
<td style="border:1px solid #e5e7eb; padding:8px;">3 years comprehensive + 5 years compressor</td>
<td style="border:1px solid #e5e7eb; padding:8px;">1 year comprehensive + 3 years compressor</td>
</tr>
<tr>
<td style="border:1px solid #e5e7eb; padding:8px;"><strong>Smart Features</strong></td>
<td style="border:1px solid #e5e7eb; padding:8px;">Auto-billing, PMS integration, inventory tracking, mobile app</td>
<td style="border:1px solid #e5e7eb; padding:8px;">Basic auto-billing (limited PMS support)</td>
</tr>
<tr style="background:#f0fdf4;">
<td style="border:1px solid #e5e7eb; padding:8px;"><strong>Design Options</strong></td>
<td style="border:1px solid #e5e7eb; padding:8px;">10+ finish options (wood, glass, steel, custom)</td>
<td style="border:1px solid #e5e7eb; padding:8px;">4 finish options (black, white, steel, wood)</td>
</tr>
<tr>
<td style="border:1px solid #e5e7eb; padding:8px;"><strong>Service Network</strong></td>
<td style="border:1px solid #e5e7eb; padding:8px;">Pan-India 150+ service centers, 24hr response</td>
<td style="border:1px solid #e5e7eb; padding:8px;">Pan-India 80+ service centers, 48hr response</td>
</tr>
<tr style="background:#f0fdf4;">
<td style="border:1px solid #e5e7eb; padding:8px;"><strong>Price Range (per unit)</strong></td>
<td style="border:1px solid #e5e7eb; padding:8px;">₹8,000 - ₹35,000 (model dependent)</td>
<td style="border:1px solid #e5e7eb; padding:8px;">₹9,000 - ₹28,000 (limited range)</td>
</tr>
<tr>
<td style="border:1px solid #e5e7eb; padding:8px;"><strong>Customization</strong></td>
<td style="border:1px solid #e5e7eb; padding:8px;">Full custom branding, hotel logo, interior configuration</td>
<td style="border:1px solid #e5e7eb; padding:8px;">Limited customization options</td>
</tr>
<tr style="background:#f0fdf4;">
<td style="border:1px solid #e5e7eb; padding:8px;"><strong>PMS Integration</strong></td>
<td style="border:1px solid #e5e7eb; padding:8px;">Opera, Oracle, IDS, Cloudbeds, Mews + 15 more</td>
<td style="border:1px solid #e5e7eb; padding:8px;">Opera, Oracle only (2 systems)</td>
</tr>
</tbody>
</table>

<h4>LAXREE Advantages Over Godrej Qube:</h4>
<ol>
<li><strong>Wider product range</strong> — 3 cooling technologies vs 1, giving hotels more flexibility</li>
<li><strong>Better warranty</strong> — 3 years vs 1 year comprehensive coverage</li>
<li><strong>Lower noise</strong> — True 0 dB absorption vs 21-25 dB hum</li>
<li><strong>More energy efficient</strong> — A+ rating saves 25-30% on electricity bills</li>
<li><strong>Superior smart features</strong> — Full PMS integration, mobile app, real-time inventory</li>
<li><strong>Faster service</strong> — 24hr response vs 48hr, 150+ vs 80+ service centers</li>
<li><strong>More customization</strong> — 10+ finish options, custom branding available</li>
<li><strong>Better cooling range</strong> — Compressor models reach 2°C vs Qube's 8°C minimum</li>
</ol>

<h3>6. Selling Points for Hotels</h3>
<ul>
<li><strong>Silent operation ensures guest comfort</strong> — especially important for luxury and boutique hotels</li>
<li><strong>Low energy consumption reduces operational costs</strong> — 25-30% savings vs competitors</li>
<li><strong>Sleek design complements room decor</strong> — customizable finishes to match hotel theme</li>
<li><strong>Comprehensive 3-year warranty & service network</strong> — peace of mind for hotel operators</li>
<li><strong>Smart inventory system eliminates manual counting</strong> — auto-billing reduces staff workload</li>
<li><strong>PMS integration enables seamless guest billing</strong> — charges appear on folio automatically</li>
<li><strong>Multiple capacities suit different room types</strong> — from standard rooms to presidential suites</li>
</ul>

<h3>7. Installation & Maintenance</h3>
<p><strong>Installation requirements:</strong></p>
<ul>
<li>Minimum 10cm clearance from walls for ventilation (absorption models)</li>
<li>Dedicated 13A power outlet with surge protection</li>
<li>Level surface — use adjustable feet to ensure unit is level</li>
<li>Avoid direct sunlight and heat sources (radiators, AC vents)</li>
<li>Allow 4-hour settling period before first use (absorption models)</li>
</ul>

<p><strong>Maintenance schedule:</strong></p>
<ul>
<li>Monthly: Clean interior with mild detergent, check temperature settings</li>
<li>Quarterly: Inspect door seals, clean condenser coils (compressor models)</li>
<li>Annually: Professional service check, descale in hard water areas</li>
</ul>
`;

  // Update the main Mini Bar module
  await prisma.module.update({
    where: { id: mainMiniBar.id },
    data: {
      title: 'Minibar - Product Knowledge',
      description: 'Complete guide to LAXREE Mini Bar range — cooling technologies, models, specifications, and LAXREE vs Godrej Qube comparison',
      content: mergedMiniBarContent,
      contentType: 'video',
      contentUrl: 'https://www.youtube.com/embed/Z-eOuzqM0ns',
      pdfUrl: '/upload/Mini Bar.pdf',
      duration: 30,
    }
  });
  console.log(`✅ Updated main Mini Bar module: ${mainMiniBar.id}`);

  // Delete the duplicate Mini Bar modules
  for (let i = 1; i < miniBarModules.length; i++) {
    await prisma.module.delete({ where: { id: miniBarModules[i].id } });
    console.log(`  🗑️ Deleted duplicate: ${miniBarModules[i].title}`);
  }

  // ==================== MERGE SAFE BOX ====================
  console.log('\n📦 Merging Safe Box modules into ONE chapter...');

  const mainSafeBox = safeBoxModules[0];
  const mergedSafeBoxContent = `
<h2>LAXREE Safe Box - Complete Product Knowledge</h2>

<h3>1. Introduction to LAXREE Safe Boxes</h3>
<p>LAXREE offers a comprehensive range of in-room safes designed specifically for hotel guest security. Our safes combine robust construction, advanced electronic security, and elegant design to meet the diverse needs of hotels ranging from mid-scale business properties to ultra-luxury resorts. Every LAXREE safe is engineered with hospitality-grade components, backed by comprehensive warranty, and supported by pan-India service network.</p>

<h3>2. Safe Box Product Series</h3>

<h4>2.1 LAXREE Essential Series</h4>
<p><strong>Target:</strong> Budget and mid-scale hotels (2-3 star)</p>
<p><strong>Models:</strong></p>
<ul>
<li><strong>LRSB-201</strong> — Compact size, 200x300x200mm, 4L capacity</li>
<li><strong>LRSB-206</strong> — Standard size, 200x420x370mm, 14L capacity</li>
<li><strong>LRSB-209</strong> — Tall size, 200x420x370mm, 18L capacity</li>
</ul>
<p><strong>Features:</strong></p>
<ul>
<li>Electronic digital keypad with 1-8 digit PIN</li>
<li>LED display with battery indicator</li>
<li>2 manual override keys included</li>
<li>4 AA batteries (12-month battery life)</li>
<li>Pre-drilled holes for wall/floor mounting</li>
<li>Heavy-duty steel construction (2mm door, 1.5mm body)</li>
</ul>

<h4>2.2 LAXREE Medium Series</h4>
<p><strong>Target:</strong> Business hotels (3-4 star)</p>
<p><strong>Models:</strong></p>
<ul>
<li><strong>LRSB-214</strong> — Medium size, 250x350x250mm, 10L capacity</li>
<li><strong>LRSB-220</strong> — Large size, 250x400x300mm, 18L capacity</li>
</ul>
<p><strong>Additional features over Essential:</strong></p>
<ul>
<li>Motorized automatic locking mechanism</li>
<li>Time & date stamp on audit trail</li>
<li>Wrong PIN lockout (3 attempts → 5min lock)</li>
<li>Master code + guest code dual system</li>
<li>Reinforced steel (3mm door, 2mm body)</li>
</ul>

<h4>2.3 LAXREE Laptop Series</h4>
<p><strong>Target:</strong> Business hotels, airport hotels (4-5 star)</p>
<p><strong>Models:</strong></p>
<ul>
<li><strong>LRSB-240</strong> — Laptop size, 200x430x370mm, 25L capacity</li>
<li><strong>LRSB-250</strong> — XL Laptop size, 250x500x370mm, 35L capacity</li>
</ul>
<p><strong>Designed for:</strong></p>
<ul>
<li>15.6" and 17" laptops</li>
<li>Tablets, documents, and A4 papers</li>
<li>Business travelers needing secure storage</li>
<li>Larger valuables (cameras, jewelry boxes)</li>
</ul>

<h4>2.4 LAXREE Orbita Series (Premium)</h4>
<p><strong>Target:</strong> Luxury hotels, 5-star resorts</p>
<p><strong>Model:</strong></p>
<ul>
<li><strong>LR-ORB-30</strong> — Rotating premium safe, 300x400x300mm, 20L capacity</li>
</ul>
<p><strong>Premium features:</strong></p>
<ul>
<li>Unique rotating mechanism for concealed installation</li>
<li>Biometric fingerprint scanner (optional)</li>
<li>RFID card access + PIN + key (3 access methods)</li>
<li>Bluetooth connectivity for mobile app control</li>
<li>Tamper-proof audit trail (last 50 events)</li>
<li>Real-time notification via hotel PMS</li>
<li>Premium brushed steel finish</li>
<li>4mm reinforced steel door</li>
</ul>

<h3>3. Complete Specifications Comparison</h3>
<table style="width:100%; border-collapse:collapse; margin:12px 0;">
<thead>
<tr style="background:#065f46; color:white;">
<th style="border:1px solid #e5e7eb; padding:8px; text-align:left; color:white;">Model</th>
<th style="border:1px solid #e5e7eb; padding:8px; text-align:left; color:white;">Size (mm)</th>
<th style="border:1px solid #e5e7eb; padding:8px; text-align:left; color:white;">Capacity</th>
<th style="border:1px solid #e5e7eb; padding:8px; text-align:left; color:white;">Door Steel</th>
<th style="border:1px solid #e5e7eb; padding:8px; text-align:left; color:white;">Access Methods</th>
<th style="border:1px solid #e5e7eb; padding:8px; text-align:left; color:white;">Best For</th>
</tr>
</thead>
<tbody>
<tr><td style="border:1px solid #e5e7eb; padding:8px;">LRSB-201</td><td style="border:1px solid #e5e7eb; padding:8px;">200x300x200</td><td style="border:1px solid #e5e7eb; padding:8px;">4L</td><td style="border:1px solid #e5e7eb; padding:8px;">2mm</td><td style="border:1px solid #e5e7eb; padding:8px;">PIN + Key</td><td style="border:1px solid #e5e7eb; padding:8px;">2-3 star</td></tr>
<tr style="background:#f0fdf4;"><td style="border:1px solid #e5e7eb; padding:8px;">LRSB-206</td><td style="border:1px solid #e5e7eb; padding:8px;">200x420x370</td><td style="border:1px solid #e5e7eb; padding:8px;">14L</td><td style="border:1px solid #e5e7eb; padding:8px;">2mm</td><td style="border:1px solid #e5e7eb; padding:8px;">PIN + Key</td><td style="border:1px solid #e5e7eb; padding:8px;">3 star</td></tr>
<tr><td style="border:1px solid #e5e7eb; padding:8px;">LRSB-214</td><td style="border:1px solid #e5e7eb; padding:8px;">250x350x250</td><td style="border:1px solid #e5e7eb; padding:8px;">10L</td><td style="border:1px solid #e5e7eb; padding:8px;">3mm</td><td style="border:1px solid #e5e7eb; padding:8px;">PIN + Key + Master</td><td style="border:1px solid #e5e7eb; padding:8px;">3-4 star</td></tr>
<tr style="background:#f0fdf4;"><td style="border:1px solid #e5e7eb; padding:8px;">LRSB-240</td><td style="border:1px solid #e5e7eb; padding:8px;">200x430x370</td><td style="border:1px solid #e5e7eb; padding:8px;">25L</td><td style="border:1px solid #e5e7eb; padding:8px;">3mm</td><td style="border:1px solid #e5e7eb; padding:8px;">PIN + Key + Master</td><td style="border:1px solid #e5e7eb; padding:8px;">4 star</td></tr>
<tr><td style="border:1px solid #e5e7eb; padding:8px;">LRSB-250</td><td style="border:1px solid #e5e7eb; padding:8px;">250x500x370</td><td style="border:1px solid #e5e7eb; padding:8px;">35L</td><td style="border:1px solid #e5e7eb; padding:8px;">3mm</td><td style="border:1px solid #e5e7eb; padding:8px;">PIN + Key + Master</td><td style="border:1px solid #e5e7eb; padding:8px;">4-5 star</td></tr>
<tr style="background:#f0fdf4;"><td style="border:1px solid #e5e7eb; padding:8px;">LR-ORB-30</td><td style="border:1px solid #e5e7eb; padding:8px;">300x400x300</td><td style="border:1px solid #e5e7eb; padding:8px;">20L</td><td style="border:1px solid #e5e7eb; padding:8px;">4mm</td><td style="border:1px solid #e5e7eb; padding:8px;">RFID + PIN + Bio + Key</td><td style="border:1px solid #e5e7eb; padding:8px;">5 star luxury</td></tr>
</tbody>
</table>

<h3>4. Security Features & Competitive Edge</h3>

<h4>4.1 Standard Security Features (All Models)</h4>
<ul>
<li><strong>Digital keypad</strong> with 1-8 digit PIN code</li>
<li><strong>LED display</strong> showing time, date, and battery status</li>
<li><strong>Motorized locking mechanism</strong> (Medium and above)</li>
<li><strong>Emergency battery backup</strong> — external 9V battery connection</li>
<li><strong>2 override keys</strong> for emergency access</li>
<li><strong>Wall & floor mount options</strong> with anchor bolts included</li>
<li><strong>Auto-lockout</strong> after 3 wrong PIN attempts</li>
<li><strong>Door ajar alarm</strong> after 30 seconds</li>
</ul>

<h4>4.2 Advanced Security Features (Orbita Series)</h4>
<ul>
<li><strong>Biometric fingerprint scanner</strong> — stores up to 10 fingerprints</li>
<li><strong>RFID card access</strong> — compatible with hotel key cards</li>
<li><strong>Bluetooth mobile app</strong> — guest can open safe via smartphone</li>
<li><strong>Audit trail</strong> — last 50 opening events with timestamp</li>
<li><strong>Real-time PMS notification</strong> — hotel knows when safe is open/closed</li>
<li><strong>Tamper detection</strong> — locks permanently after 5 wrong attempts (requires master reset)</li>
<li><strong>Anti-pry design</strong> — recessed door with 4mm steel bolts</li>
</ul>

<h3>5. LAXREE vs Competitor Comparison</h3>
<table style="width:100%; border-collapse:collapse; margin:12px 0;">
<thead>
<tr style="background:#065f46; color:white;">
<th style="border:1px solid #e5e7eb; padding:10px; text-align:left; color:white;">Feature</th>
<th style="border:1px solid #e5e7eb; padding:10px; text-align:left; color:white;">LAXREE Safe Box</th>
<th style="border:1px solid #e5e7eb; padding:10px; text-align:left; color:white;">Competitor (Generic/Imported)</th>
</tr>
</thead>
<tbody>
<tr style="background:#f0fdf4;">
<td style="border:1px solid #e5e7eb; padding:8px;"><strong>Model Range</strong></td>
<td style="border:1px solid #e5e7eb; padding:8px;">6 models across 4 series</td>
<td style="border:1px solid #e5e7eb; padding:8px;">2-3 models typically</td>
</tr>
<tr>
<td style="border:1px solid #e5e7eb; padding:8px;"><strong>Steel Thickness (Door)</strong></td>
<td style="border:1px solid #e5e7eb; padding:8px;">2-4mm (series dependent)</td>
<td style="border:1px solid #e5e7eb; padding:8px;">1.5-2.5mm (standard)</td>
</tr>
<tr style="background:#f0fdf4;">
<td style="border:1px solid #e5e7eb; padding:8px;"><strong>Locking Mechanism</strong></td>
<td style="border:1px solid #e5e7eb; padding:8px;">Motorized automatic (Medium+)</td>
<td style="border:1px solid #e5e7eb; padding:8px;">Manual knob typically</td>
</tr>
<tr>
<td style="border:1px solid #e5e7eb; padding:8px;"><strong>Access Methods</strong></td>
<td style="border:1px solid #e5e7eb; padding:8px;">Up to 4 (PIN, Key, RFID, Biometric)</td>
<td style="border:1px solid #e5e7eb; padding:8px;">1-2 (PIN + Key)</td>
</tr>
<tr style="background:#f0fdf4;">
<td style="border:1px solid #e5e7eb; padding:8px;"><strong>Audit Trail</strong></td>
<td style="border:1px solid #e5e7eb; padding:8px;">Up to 50 events with timestamp</td>
<td style="border:1px solid #e5e7eb; padding:8px;">No audit trail</td>
</tr>
<tr>
<td style="border:1px solid #e5e7eb; padding:8px;"><strong>PMS Integration</strong></td>
<td style="border:1px solid #e5e7eb; padding:8px;">Yes (Opera, Oracle, IDS, etc.)</td>
<td style="border:1px solid #e5e7eb; padding:8px;">No integration</td>
</tr>
<tr style="background:#f0fdf4;">
<td style="border:1px solid #e5e7eb; padding:8px;"><strong>Biometric Option</strong></td>
<td style="border:1px solid #e5e7eb; padding:8px;">Yes (Orbita series)</td>
<td style="border:1px solid #e5e7eb; padding:8px;">No</td>
</tr>
<tr>
<td style="border:1px solid #e5e7eb; padding:8px;"><strong>Warranty</strong></td>
<td style="border:1px solid #e5e7eb; padding:8px;">3 years comprehensive</td>
<td style="border:1px solid #e5e7eb; padding:8px;">1 year typical</td>
</tr>
<tr style="background:#f0fdf4;">
<td style="border:1px solid #e5e7eb; padding:8px;"><strong>Service Network</strong></td>
<td style="border:1px solid #e5e7eb; padding:8px;">Pan-India 150+ centers</td>
<td style="border:1px solid #e5e7eb; padding:8px;">Limited to metros</td>
</tr>
<tr>
<td style="border:1px solid #e5e7eb; padding:8px;"><strong>Custom Branding</strong></td>
<td style="border:1px solid #e5e7eb; padding:8px;">Hotel logo on safe</td>
<td style="border:1px solid #e5e7eb; padding:8px;">Not available</td>
</tr>
<tr style="background:#f0fdf4;">
<td style="border:1px solid #e5e7eb; padding:8px;"><strong>Battery Life</strong></td>
<td style="border:1px solid #e5e7eb; padding:8px;">12-18 months</td>
<td style="border:1px solid #e5e7eb; padding:8px;">6-9 months</td>
</tr>
</tbody>
</table>

<h4>LAXREE Safe Box Competitive Advantages:</h4>
<ol>
<li><strong>Widest model range</strong> — 6 models vs 2-3 from competitors</li>
<li><strong>Superior security</strong> — 4mm steel vs 2mm industry standard</li>
<li><strong>Multiple access methods</strong> — PIN, Key, RFID, Biometric options</li>
<li><strong>PMS integration</strong> — seamless hotel management system connectivity</li>
<li><strong>Audit trail</strong> — security tracking for liability protection</li>
<li><strong>Longer warranty</strong> — 3 years vs 1 year standard</li>
<li><strong>Motorized locking</strong> — premium feel and reliability</li>
<li><strong>Pan-India service</strong> — 150+ centers for fast support</li>
</ol>

<h3>6. Selling Points for Hotels</h3>
<ul>
<li><strong>Guest security & peace of mind</strong> — primary value proposition for hotels</li>
<li><strong>Reduced liability</strong> — audit trail protects hotel from false claims</li>
<li><strong>PMS integration</strong> — automatic guest check-in/check-out safe management</li>
<li><strong>Multiple access options</strong> — caters to guest preferences (key card, phone, PIN)</li>
<li><strong>Premium positioning</strong> — Orbita series elevates room perception</li>
<li><strong>Custom branding</strong> — hotel logo reinforces brand identity</li>
<li><strong>Longer warranty & service network</strong> — lower total cost of ownership</li>
</ul>

<h3>7. Installation & Programming</h3>
<p><strong>Installation steps:</strong></p>
<ol>
<li>Mark anchor points through pre-drilled holes in safe bottom</li>
<li>Drill 10mm holes for concrete, 6mm for wood</li>
<li>Insert wall plugs, secure with anchor bolts</li>
<li>Test stability — apply 15kg downward pressure</li>
<li>Insert batteries, test electronic functions</li>
<li>Program master code and test override key</li>
</ol>

<p><strong>Programming sequence:</strong></p>
<ol>
<li>Press reset button (inside, behind battery cover)</li>
<li>Enter master code (default: 159)</li>
<li>Press '#' to confirm, then enter new master code</li>
<li>Press '#' to save, test new code</li>
<li>Guest can now set their own code at check-in</li>
</ol>
`;

  // Update the main Safe Box module
  await prisma.module.update({
    where: { id: mainSafeBox.id },
    data: {
      title: 'Safe Box - Product Knowledge',
      description: 'Complete guide to LAXREE Safe Box range — Essential, Medium, Laptop, Orbita series with security features and competitor comparison',
      content: mergedSafeBoxContent,
      contentType: 'video',
      contentUrl: 'https://www.youtube.com/embed/St815eDtI5c',
      pdfUrl: '/upload/Safe Box.pdf',
      duration: 30,
    }
  });
  console.log(`✅ Updated main Safe Box module: ${mainSafeBox.id}`);

  // Delete the duplicate Safe Box modules
  for (let i = 1; i < safeBoxModules.length; i++) {
    await prisma.module.delete({ where: { id: safeBoxModules[i].id } });
    console.log(`  🗑️ Deleted duplicate: ${safeBoxModules[i].title}`);
  }

  // ==================== RENUMBER ALL MODULES ====================
  console.log('\n🔢 Renumbering all modules...');

  const allModules = await prisma.module.findMany({
    where: { courseId: paCourse.id },
    orderBy: { order: 'asc' }
  });

  for (let i = 0; i < allModules.length; i++) {
    await prisma.module.update({
      where: { id: allModules[i].id },
      data: { order: i + 1 }
    });
    console.log(`  [${i + 1}] ${allModules[i].title}`);
  }

  // ==================== UPDATE ELECTRIC KETTLE PDF ====================
  console.log('\n📄 Setting Electric Kettle PDF...');
  const kettleModule = await prisma.module.findFirst({
    where: { courseId: paCourse.id, title: { contains: 'Kettle', mode: 'insensitive' } }
  });
  if (kettleModule) {
    await prisma.module.update({
      where: { id: kettleModule.id },
      data: { pdfUrl: '/upload/Electric Kettle Trainig PPT_11zon.pdf' }
    });
    console.log(`✅ Updated Electric Kettle PDF: ${kettleModule.title}`);
  }

  // Final count
  const finalModules = await prisma.module.findMany({
    where: { courseId: paCourse.id },
    orderBy: { order: 'asc' },
    include: { productCategory: true }
  });

  console.log('\n📊 FINAL MODULE LIST:');
  finalModules.forEach((m, idx) => {
    console.log(`  [${m.order}] ${m.title} | Video: ${m.contentType === 'video' ? '✅' : '❌'} | PDF: ${m.pdfUrl ? '✅' : '❌'} | Category: ${m.productCategory?.name || 'none'}`);
  });

  console.log(`\n✅ Total Product Academy modules: ${finalModules.length}`);

  await prisma.$disconnect();
}

main().catch(e => { console.error('ERROR:', e); process.exit(1); });
