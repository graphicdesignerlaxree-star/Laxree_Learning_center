import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Shared seeding logic - used by both /api/seed and /api/reseed
export async function seedDatabase() {
  // Create Departments
  const salesDept = await db.department.create({ data: { name: 'Sales', description: 'Sales Department' } })
  const inboundDept = await db.department.create({ data: { name: 'Inbound Sales', description: 'Inbound Sales Department' } })
  const fieldSalesDept = await db.department.create({ data: { name: 'Field Sales', description: 'Field Sales Department' } })
  const trainingDept = await db.department.create({ data: { name: 'Training', description: 'Training & Development' } })
  const operationsDept = await db.department.create({ data: { name: 'Operations', description: 'Operations Department' } })

  // Create Super Admin
  const superAdmin = await db.user.create({
    data: { email: 'admin@laxree.com', password: 'admin123', role: 'SUPER_ADMIN', fullName: 'Platform Administrator', isFirstLogin: false, isActive: true }
  })

  // Create Employees
  const employees: any[] = []
  const empData = [
    { name: 'Rahul Verma', dept: salesDept.id, desig: 'Sales Executive', empId: 'EMP001' },
    { name: 'Laxee Warrior', dept: inboundDept.id, desig: 'Inbound Sales Rep', empId: 'EMP002' },
    { name: 'Vikram Singh', dept: fieldSalesDept.id, desig: 'Field Sales Executive', empId: 'EMP003' },
    { name: 'Neha Patel', dept: salesDept.id, desig: 'Senior Sales Executive', empId: 'EMP004' },
    { name: 'Arjun Kumar', dept: inboundDept.id, desig: 'Inbound Sales Rep', empId: 'EMP005' },
    { name: 'Deepa Nair', dept: fieldSalesDept.id, desig: 'Field Sales Executive', empId: 'EMP006' },
    { name: 'Suresh Menon', dept: salesDept.id, desig: 'Sales Executive', empId: 'EMP007' },
    { name: 'Kavita Reddy', dept: operationsDept.id, desig: 'Operations Coordinator', empId: 'EMP008' },
    { name: 'Amit Joshi', dept: fieldSalesDept.id, desig: 'Field Sales Executive', empId: 'EMP009' },
    { name: 'Meera Iyer', dept: inboundDept.id, desig: 'Senior Inbound Rep', empId: 'EMP010' },
  ]

  for (const emp of empData) {
    const employee = await db.user.create({
      data: {
        email: `${emp.empId.toLowerCase()}@laxree.com`,
        password: 'emp123',
        role: 'EMPLOYEE',
        fullName: emp.name,
        departmentId: emp.dept,
        designation: emp.desig,
        employeeId: emp.empId,
        isFirstLogin: emp.empId === 'EMP001',
        isActive: true,
        aiReadinessScore: Math.round((Math.random() * 40 + 30) * 10) / 10,
        currentLevel: ['Beginner', 'Intermediate', 'Advanced'][Math.floor(Math.random() * 3)],
        joiningDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
      }
    })
    employees.push(employee)
  }

  // Create Product Categories (10 real categories)
  const categories = await Promise.all([
    db.productCategory.create({ data: { name: 'Mini Bars', description: 'Hotel Mini Bar Products - Compressor, Absorption, Thermoelectric', icon: '🍷' } }),
    db.productCategory.create({ data: { name: 'Safe Boxes', description: 'In-Room Safe Solutions - Essential, Medium, Laptop, Orbita', icon: '🔒' } }),
    db.productCategory.create({ data: { name: 'RFID Locks', description: 'RFID Door Locks & Access Control Systems', icon: '🔑' } }),
    db.productCategory.create({ data: { name: 'Electric Kettles', description: 'In-Room Electric Kettles & Tea Coffee Makers', icon: '☕' } }),
    db.productCategory.create({ data: { name: 'Hair Dryers', description: 'Wall Mount & Foldable Hair Dryers', icon: '💇' } }),
    db.productCategory.create({ data: { name: 'Soap Dispensers', description: 'Manual & Automatic Soap Dispensers', icon: '🧴' } }),
    db.productCategory.create({ data: { name: 'Room Accessories', description: 'Trays, Mirrors, Telephones, Scales & More', icon: '🏠' } }),
    db.productCategory.create({ data: { name: 'Mattresses & Beds', description: 'Hotel Mattresses, Rollaway Beds & Bed Bases', icon: '🛏️' } }),
    db.productCategory.create({ data: { name: 'Housekeeping', description: 'Trolleys, Linen Carts & Cleaning Equipment', icon: '🧹' } }),
    db.productCategory.create({ data: { name: 'Lobby Equipment', description: 'Digital Signage, Dustbins, Stanchions & Luggage Trolleys', icon: '🏛️' } }),
  ])

  // Create Learning Paths
  const onboardingPath = await db.learningPath.create({ data: { name: 'New Employee Onboarding', description: 'Complete onboarding for new LAXREE employees', targetRole: 'EMPLOYEE' } })
  const salesPath = await db.learningPath.create({ data: { name: 'Sales Mastery Path', description: 'Advanced sales training path', targetRole: 'EMPLOYEE' } })
  const fieldSalesPath = await db.learningPath.create({ data: { name: 'Field Sales Excellence', description: 'Field sales readiness path', targetRole: 'EMPLOYEE' } })
  const inboundPath = await db.learningPath.create({ data: { name: 'Inbound Sales Excellence', description: 'Inbound sales readiness path', targetRole: 'EMPLOYEE' } })

  // ===== PRODUCT ACADEMY COURSE WITH REAL CONTENT =====
  const productAcademyCourse = await db.course.create({
    data: {
      title: 'LAXREE Product Academy',
      description: 'Complete product knowledge training for all LAXREE hospitality products',
      moduleType: 'PRODUCT_ACADEMY',
      learningPathId: onboardingPath.id,
      duration: 180,
      isRequired: true,
      isActive: true,
    }
  })

  // Module 1: About LAXREE Hospitality Solutions
  await db.module.create({
    data: {
      title: 'About LAXREE Hospitality Solutions',
      description: 'Learn about LAXREE vision, mission, USPs, and market segments',
      content: `<h3>LAXREE Hospitality Solutions</h3>
<p>LAXREE is India's leading B2B hospitality product solutions provider, offering a comprehensive range of hotel supplies under one roof.</p>
<h4>Our Vision</h4>
<p>"To be India's most trusted single-source hospitality solutions provider"</p>
<h4>Our Mission</h4>
<p>Simplify hotel procurement with curated quality products, excellent service, and fast delivery.</p>
<h4>Our USPs</h4>
<ul>
<li><strong>Single Vendor Convenience</strong> - One source for 15+ product categories</li>
<li><strong>Hotel-Specific Expertise</strong> - Products designed for hospitality use</li>
<li><strong>PAN India Delivery</strong> - Nationwide logistics network</li>
<li><strong>Customization</strong> - Hotel logo branding, custom finishes</li>
<li><strong>Competitive Pricing</strong> - Direct manufacturing, no middlemen</li>
<li><strong>After-Sales Support</strong> - Local service, spare parts availability</li>
<li><strong>Quality Assurance</strong> - ISO 9001:2015, ISO 14001:2015, ISO 45001:2018 certified</li>
</ul>
<h4>Market Segments We Serve</h4>
<ul>
<li>5-Star Luxury Hotels</li>
<li>4-Star Business Hotels</li>
<li>3-Star & Budget Hotels</li>
<li>Boutique & Heritage Properties</li>
<li>Serviced Apartments</li>
<li>Resorts & Spas</li>
</ul>
<h4>Our Esteemed Clients</h4>
<p>Radisson, Marriott, Holiday Inn, and many more leading hotel chains trust LAXREE for their in-room requirements.</p>`,
      contentType: 'text',
      order: 1,
      duration: 15,
      courseId: productAcademyCourse.id,
      productCategoryId: null,
    }
  })

  // Module 2: Mini Bar Technology Deep Dive
  await db.module.create({
    data: {
      title: 'Mini Bar Technology Deep Dive',
      description: 'Understanding compressor, absorption, and thermoelectric mini bar technologies',
      content: `<div style="font-family:system-ui,sans-serif;line-height:1.7;color:#1a1a1a">
<img src="https://sfile.chatglm.cn/images-ppt/650c00aeb47d.png" alt="LAXREE Mini Bar Product Range" style="width:100%;max-width:600px;border-radius:12px;margin:16px 0;box-shadow:0 4px 12px rgba(0,0,0,0.1)" />
<h2 style="color:#065f46;border-bottom:2px solid #059669;padding-bottom:8px">Mini Bar Technology Deep Dive</h2>
<p>LAXREE offers three core mini bar technologies to suit every hotel room type and budget. Understanding the differences between these technologies is critical for recommending the right product to each client segment. Whether you are speaking with a budget hotel owner focused on upfront cost, or a 5-star general manager demanding absolute silence, LAXREE has the perfect solution. This module will equip you with the technical knowledge and sales arguments to close deals confidently across all hotel categories.</p>

<h3 style="color:#047857;margin-top:24px">1. Compressor Mini Bars</h3>
<p>Compressor technology uses a refrigerant cycle similar to a household refrigerator. A motorized compressor circulates refrigerant through evaporator coils, absorbing heat from the interior and expelling it through condenser coils at the back. This produces the most powerful cooling but introduces a low hum from the moving parts.</p>
<ul>
<li><strong>Cooling Power:</strong> High — maintains 0–10°C even in ambient temperatures up to 43°C</li>
<li><strong>Noise Level:</strong> Low hum (~40dB), audible in quiet rooms</li>
<li><strong>Energy Consumption:</strong> Lower efficiency due to compressor cycling</li>
<li><strong>Price Point:</strong> Most affordable entry — ideal for cost-sensitive projects</li>
<li><strong>Maintenance:</strong> Higher — compressor has moving parts subject to wear</li>
<li><strong>Best Fit:</strong> Budget hotels, guest houses, serviced apartments where silence is not critical</li>
</ul>

<h3 style="color:#047857;margin-top:24px">2. Absorption Mini Bars</h3>
<p>Absorption technology uses a heat source (electric heater) to drive a refrigeration cycle with ammonia, water, and hydrogen gas. There are no moving parts, resulting in completely silent operation. The trade-off is moderate cooling capacity and higher energy draw, but for premium hotels where guest silence is non-negotiable, absorption is the gold standard.</p>
<ul>
<li><strong>Cooling Power:</strong> Moderate — maintains 5–12°C depending on ambient temperature</li>
<li><strong>Noise Level:</strong> Truly silent (0dB) — no vibrations, no moving parts</li>
<li><strong>Energy Consumption:</strong> Medium efficiency — continuous heat-based cycle</li>
<li><strong>Price Point:</strong> Higher than compressor, justified by silence premium</li>
<li><strong>Maintenance:</strong> Very low — no compressor means fewer breakdowns and longer lifespan</li>
<li><strong>Best Fit:</strong> 5-star hotels, luxury suites, premium rooms where guest comfort is paramount</li>
</ul>

<h3 style="color:#047857;margin-top:24px">3. Thermoelectric Mini Bars</h3>
<p>Thermoelectric cooling uses the Peltier effect — when electric current passes through a semiconductor junction, heat is transferred from one side to the other. LAXREE enhances this with a Japanese-grade aluminum heat sink and dual-fan system for superior heat dissipation. This produces near-silent operation with excellent energy efficiency, making it the most popular choice for mid-to-premium hotels.</p>
<ul>
<li><strong>Cooling Power:</strong> Moderate — 5–15°C (solid door) / 7–15°C (glass door)</li>
<li><strong>Noise Level:</strong> Ultra-quiet (≤25dB) — virtually vibration-free</li>
<li><strong>Energy Consumption:</strong> High efficiency — only 55 Watts, lowest running cost</li>
<li><strong>Price Point:</strong> Medium — best value for performance</li>
<li><strong>Maintenance:</strong> Low — no moving parts in cooling system</li>
<li><strong>Best Fit:</strong> Premium rooms, 4-star and 5-star hotels seeking silence without the absorption price premium</li>
</ul>

<h3 style="color:#047857;margin-top:24px">Technology Comparison Matrix</h3>
<table style="width:100%;border-collapse:collapse;margin:10px 0">
<tr style="background:#f0fdf4"><th style="padding:8px;border:1px solid #e5e7eb;text-align:left">Parameter</th><th style="padding:8px;border:1px solid #e5e7eb;text-align:left">Compressor</th><th style="padding:8px;border:1px solid #e5e7eb;text-align:left">Absorption</th><th style="padding:8px;border:1px solid #e5e7eb;text-align:left">Thermoelectric</th></tr>
<tr><td style="padding:8px;border:1px solid #e5e7eb">Cooling Range</td><td style="padding:8px;border:1px solid #e5e7eb">0–10°C</td><td style="padding:8px;border:1px solid #e5e7eb">5–12°C</td><td style="padding:8px;border:1px solid #e5e7eb">5–15°C / 7–15°C</td></tr>
<tr><td style="padding:8px;border:1px solid #e5e7eb">Noise Level</td><td style="padding:8px;border:1px solid #e5e7eb">~40dB</td><td style="padding:8px;border:1px solid #e5e7eb">0dB (silent)</td><td style="padding:8px;border:1px solid #e5e7eb">≤25dB</td></tr>
<tr><td style="padding:8px;border:1px solid #e5e7eb">Power (Watts)</td><td style="padding:8px;border:1px solid #e5e7eb">80–100W</td><td style="padding:8px;border:1px solid #e5e7eb">65–75W</td><td style="padding:8px;border:1px solid #e5e7eb">55W</td></tr>
<tr><td style="padding:8px;border:1px solid #e5e7eb">Price Range</td><td style="padding:8px;border:1px solid #e5e7eb">₹6,700</td><td style="padding:8px;border:1px solid #e5e7eb">₹9,200–9,800</td><td style="padding:8px;border:1px solid #e5e7eb">₹8,400–9,200</td></tr>
<tr><td style="padding:8px;border:1px solid #e5e7eb">Lifespan</td><td style="padding:8px;border:1px solid #e5e7eb">5–7 years</td><td style="padding:8px;border:1px solid #e5e7eb">8–10 years</td><td style="padding:8px;border:1px solid #e5e7eb">7–9 years</td></tr>
</table>

<h3 style="color:#047857;margin-top:24px">Installation Guide</h3>
<ol>
<li>Position the mini bar on a flat, level surface with minimum 10cm clearance from the wall for ventilation</li>
<li>Ensure the power outlet is accessible and rated for the unit's wattage</li>
<li>For glass door models, avoid direct sunlight exposure which increases cooling load</li>
<li>Allow 2–4 hours for initial cooling before stocking beverages</li>
<li>For lock-option models, test the cam-lock mechanism before guest handover</li>
</ol>

<h3 style="color:#047857;margin-top:24px">Troubleshooting Quick Reference</h3>
<table style="width:100%;border-collapse:collapse;margin:10px 0">
<tr style="background:#f0fdf4"><th style="padding:8px;border:1px solid #e5e7eb;text-align:left">Issue</th><th style="padding:8px;border:1px solid #e5e7eb;text-align:left">Likely Cause</th><th style="padding:8px;border:1px solid #e5e7eb;text-align:left">Solution</th></tr>
<tr><td style="padding:8px;border:1px solid #e5e7eb">Not cooling</td><td style="padding:8px;border:1px solid #e5e7eb">Power disconnected / thermostat off</td><td style="padding:8px;border:1px solid #e5e7eb">Check power supply, adjust thermostat</td></tr>
<tr><td style="padding:8px;border:1px solid #e5e7eb">Excessive condensation</td><td style="padding:8px;border:1px solid #e5e7eb">Door seal gap / overloading</td><td style="padding:8px;border:1px solid #e5e7eb">Check gasket alignment, reduce contents</td></tr>
<tr><td style="padding:8px;border:1px solid #e5e7eb">Unusual noise (compressor)</td><td style="padding:8px;border:1px solid #e5e7eb">Vibrating against surface</td><td style="padding:8px;border:1px solid #e5e7eb">Re-level unit, add rubber pads</td></tr>
</table>

<h3 style="color:#047857;margin-top:24px">Sales Talking Points</h3>
<ul>
<li><strong>For Budget Hotels:</strong> "Our compressor mini bar gives you the most cooling power at the lowest price — perfect for guest houses and budget properties."</li>
<li><strong>For 4-Star Hotels:</strong> "Thermoelectric models deliver near-silent operation at 55 Watts — your guests sleep peacefully while you save on electricity."</li>
<li><strong>For 5-Star Hotels:</strong> "Absorption technology means zero noise, zero vibration, and zero guest complaints. It's the choice of leading luxury chains."</li>
</ul>

<h3 style="color:#047857;margin-top:24px">Cross-Selling Suggestions</h3>
<p>When selling mini bars, recommend complementary products: <strong>Electric Kettles</strong> (LRWT-145 for budget, LRWT-156 for premium) for the in-room beverage station, <strong>Safe Boxes</strong> (LRSB-211 for standard, LRSB-209 Orbita for premium) as a natural room-security bundle, and <strong>TCM Trays</strong> to complete the hospitality refreshment corner.</p>
</div>`,
      contentType: 'video',
      contentUrl: 'https://www.youtube.com/embed/Z-eOuzqM0ns',
      order: 2,
      duration: 20,
      courseId: productAcademyCourse.id,
      productCategoryId: categories[0].id,
    }
  })

  // Module 3: Mini Bar Models & Specifications
  await db.module.create({
    data: {
      title: 'Mini Bar Models & Specifications',
      description: 'Complete model lineup with pricing for LAXREE mini bars',
      content: `<div style="font-family:system-ui,sans-serif;line-height:1.7;color:#1a1a1a">
<img src="https://sfile.chatglm.cn/images-ppt/650c00aeb47d.png" alt="LAXREE Mini Bar Model Lineup" style="width:100%;max-width:600px;border-radius:12px;margin:16px 0;box-shadow:0 4px 12px rgba(0,0,0,0.1)" />
<h2 style="color:#065f46;border-bottom:2px solid #059669;padding-bottom:8px">LAXREE Mini Bar Model Lineup & Specifications</h2>
<p>LAXREE's mini bar portfolio spans seven models across three technologies, covering every hotel segment from budget guest houses to ultra-luxury suites. This module provides the complete model-by-model breakdown with specifications, pricing, and segment recommendations so you can confidently match the right product to each client's needs. Knowing these specs cold is the foundation of credibility in front of procurement managers and hotel owners.</p>

<h3 style="color:#047857;margin-top:24px">Complete Model Specifications</h3>
<table style="width:100%;border-collapse:collapse;margin:10px 0">
<tr style="background:#f0fdf4"><th style="padding:8px;border:1px solid #e5e7eb">Model</th><th style="padding:8px;border:1px solid #e5e7eb">Technology</th><th style="padding:8px;border:1px solid #e5e7eb">Capacity</th><th style="padding:8px;border:1px solid #e5e7eb">Door</th><th style="padding:8px;border:1px solid #e5e7eb">Cooling</th><th style="padding:8px;border:1px solid #e5e7eb">SSP (₹)</th></tr>
<tr><td style="padding:8px;border:1px solid #e5e7eb">LRMB-132</td><td style="padding:8px;border:1px solid #e5e7eb">Compressor</td><td style="padding:8px;border:1px solid #e5e7eb">45L</td><td style="padding:8px;border:1px solid #e5e7eb">Solid</td><td style="padding:8px;border:1px solid #e5e7eb">0–10°C</td><td style="padding:8px;border:1px solid #e5e7eb">6,700</td></tr>
<tr><td style="padding:8px;border:1px solid #e5e7eb">LRMB-126</td><td style="padding:8px;border:1px solid #e5e7eb">Thermoelectric</td><td style="padding:8px;border:1px solid #e5e7eb">30L</td><td style="padding:8px;border:1px solid #e5e7eb">Solid</td><td style="padding:8px;border:1px solid #e5e7eb">5–15°C</td><td style="padding:8px;border:1px solid #e5e7eb">8,400</td></tr>
<tr><td style="padding:8px;border:1px solid #e5e7eb">LRMB-127</td><td style="padding:8px;border:1px solid #e5e7eb">Thermoelectric</td><td style="padding:8px;border:1px solid #e5e7eb">30L</td><td style="padding:8px;border:1px solid #e5e7eb">Glass</td><td style="padding:8px;border:1px solid #e5e7eb">7–15°C</td><td style="padding:8px;border:1px solid #e5e7eb">8,700</td></tr>
<tr><td style="padding:8px;border:1px solid #e5e7eb">LRMB-128</td><td style="padding:8px;border:1px solid #e5e7eb">Thermoelectric</td><td style="padding:8px;border:1px solid #e5e7eb">40L</td><td style="padding:8px;border:1px solid #e5e7eb">Solid</td><td style="padding:8px;border:1px solid #e5e7eb">5–15°C</td><td style="padding:8px;border:1px solid #e5e7eb">8,800</td></tr>
<tr><td style="padding:8px;border:1px solid #e5e7eb">LRMB-129</td><td style="padding:8px;border:1px solid #e5e7eb">Thermoelectric</td><td style="padding:8px;border:1px solid #e5e7eb">40L</td><td style="padding:8px;border:1px solid #e5e7eb">Glass</td><td style="padding:8px;border:1px solid #e5e7eb">7–15°C</td><td style="padding:8px;border:1px solid #e5e7eb">9,200</td></tr>
<tr><td style="padding:8px;border:1px solid #e5e7eb">LRMB-130</td><td style="padding:8px;border:1px solid #e5e7eb">Absorption</td><td style="padding:8px;border:1px solid #e5e7eb">30L</td><td style="padding:8px;border:1px solid #e5e7eb">Solid (Mirror)</td><td style="padding:8px;border:1px solid #e5e7eb">5–12°C</td><td style="padding:8px;border:1px solid #e5e7eb">9,200</td></tr>
<tr><td style="padding:8px;border:1px solid #e5e7eb">LRMB-131</td><td style="padding:8px;border:1px solid #e5e7eb">Absorption</td><td style="padding:8px;border:1px solid #e5e7eb">40L</td><td style="padding:8px;border:1px solid #e5e7eb">Solid (Mirror)</td><td style="padding:8px;border:1px solid #e5e7eb">5–12°C</td><td style="padding:8px;border:1px solid #e5e7eb">9,800</td></tr>
</table>

<h3 style="color:#047857;margin-top:24px">Door Types Explained</h3>
<h4>Glass Door</h4>
<p>Glass door models provide easy visibility of stocked items, creating a premium, inviting look for guests. The transparent front encourages minibar usage and increases revenue. Trade-offs include slightly lower insulation efficiency and marginally higher energy consumption. Best suited for hotels where minibar revenue is a priority and aesthetics matter.</p>
<h4>Solid Door</h4>
<p>Solid door models offer superior insulation, keeping contents cooler with less energy. The hidden-storage aesthetic works well in minimalist room designs. Solid doors are more energy-efficient and typically cost less than glass door equivalents. Best suited for hotels focused on energy savings or with a concealed-storage design philosophy.</p>
<h4>Mirror Finish (Absorption Only)</h4>
<p>The mirror-finish solid door is the premium choice, combining silent absorption technology with an elegant reflective surface that doubles as a room mirror. This dual-purpose design saves wall space and adds a luxury touch. Exclusive to the LRMB-130 and LRMB-131 models.</p>

<h3 style="color:#047857;margin-top:24px">Key Features to Highlight in Sales</h3>
<ul>
<li><strong>Auto Defrost</strong> — Compressor model (LRMB-132) includes auto defrost, preventing ice buildup and reducing maintenance</li>
<li><strong>Reversible Door</strong> — All models support left or right opening for flexible room layout planning</li>
<li><strong>Cam-Lock Security</strong> — Lock option available for VIP rooms and suite-level access control</li>
<li><strong>Interior LED Lighting</strong> — Energy-efficient LED illuminates contents when the door opens</li>
<li><strong>Removable Shelves & Can Racks</strong> — Flexible interior layout for different beverage sizes</li>
<li><strong>Japanese-Grade Aluminum Heat Sink</strong> — Superior heat dissipation in thermoelectric models for reliable performance</li>
<li><strong>Digital Controller with Auto Cut-Off</strong> — Precise temperature management and safety protection</li>
<li><strong>CFC Free</strong> — All thermoelectric and absorption models are environmentally certified</li>
</ul>

<h3 style="color:#047857;margin-top:24px">Segment-Based Recommendations</h3>
<table style="width:100%;border-collapse:collapse;margin:10px 0">
<tr style="background:#f0fdf4"><th style="padding:8px;border:1px solid #e5e7eb;text-align:left">Hotel Segment</th><th style="padding:8px;border:1px solid #e5e7eb;text-align:left">Recommended Model</th><th style="padding:8px;border:1px solid #e5e7eb;text-align:left">Why</th></tr>
<tr><td style="padding:8px;border:1px solid #e5e7eb">Budget / Guest House</td><td style="padding:8px;border:1px solid #e5e7eb">LRMB-132</td><td style="padding:8px;border:1px solid #e5e7eb">Lowest price, strong cooling, 45L capacity</td></tr>
<tr><td style="padding:8px;border:1px solid #e5e7eb">3-Star Business</td><td style="padding:8px;border:1px solid #e5e7eb">LRMB-126 / LRMB-128</td><td style="padding:8px;border:1px solid #e5e7eb">Silent operation at mid-range price</td></tr>
<tr><td style="padding:8px;border:1px solid #e5e7eb">4-Star Premium</td><td style="padding:8px;border:1px solid #e5e7eb">LRMB-129</td><td style="padding:8px;border:1px solid #e5e7eb">Glass door + silent TE, premium look</td></tr>
<tr><td style="padding:8px;border:1px solid #e5e7eb">5-Star Luxury</td><td style="padding:8px;border:1px solid #e5e7eb">LRMB-131</td><td style="padding:8px;border:1px solid #e5e7eb">Absorption, mirror finish, 40L, zero noise</td></tr>
<tr><td style="padding:8px;border:1px solid #e5e7eb">Boutique / Heritage</td><td style="padding:8px;border:1px solid #e5e7eb">LRMB-130</td><td style="padding:8px;border:1px solid #e5e7eb">Mirror finish adds design elegance, 30L compact</td></tr>
</table>

<h3 style="color:#047857;margin-top:24px">Frequently Asked Questions</h3>
<ul>
<li><strong>Q: Can I order a mix of models for different room types?</strong> — A: Absolutely. Most hotels order 2–3 models (standard rooms get LRMB-126, suites get LRMB-131). Volume discounts apply across the combined order.</li>
<li><strong>Q: What is the lead time for orders?</strong> — A: Standard models ship within 7–10 business days. Custom branding adds 5–7 days.</li>
<li><strong>Q: Are replacement parts available?</strong> — A: Yes. Shelves, door gaskets, locks, and LED lights are stocked for immediate dispatch. Heat sink assemblies available within 48 hours.</li>
<li><strong>Q: Do you offer a warranty?</strong> — A: All LAXREE mini bars come with a standard 1-year warranty covering manufacturing defects. Extended warranty options are available.</li>
</ul>

<h3 style="color:#047857;margin-top:24px">Cross-Selling Opportunities</h3>
<p>Every mini bar order is an opportunity to bundle <strong>TCM Trays</strong> (LRWT-158 for budget, LRWT-163 for premium) to complete the in-room refreshment station. Pair with <strong>Electric Kettles</strong> for the full beverage setup, and recommend <strong>Safe Boxes</strong> as a room-security package deal.</p>
</div>`,
      contentType: 'video',
      contentUrl: 'https://www.youtube.com/embed/Z-eOuzqM0ns',
      order: 3,
      duration: 20,
      courseId: productAcademyCourse.id,
      productCategoryId: categories[0].id,
    }
  })

  // Module 4: LAXREE vs Godrej Qube Comparison
  await db.module.create({
    data: {
      title: 'LAXREE vs Godrej Qube Comparison',
      description: 'Competitive comparison showing LAXREE advantages over Godrej Qube',
      content: `<div style="font-family:system-ui,sans-serif;line-height:1.7;color:#1a1a1a">
<img src="https://sfile.chatglm.cn/images-ppt/650c00aeb47d.png" alt="LAXREE vs Godrej Qube Mini Bar Comparison" style="width:100%;max-width:600px;border-radius:12px;margin:16px 0;box-shadow:0 4px 12px rgba(0,0,0,0.1)" />
<h2 style="color:#065f46;border-bottom:2px solid #059669;padding-bottom:8px">Competitive Comparison: LAXREE Mini Bar vs Godrej Qube</h2>
<p>Godrej Qube is the most common competitor you'll face in mini bar deals. When a client compares our mini bar with Godrej Qube, this module arms you with the data, talking points, and ROI calculations to win decisively. The key insight is that while Godrej Qube may appear cheaper on the SSP, LAXREE delivers superior total cost of ownership through energy savings, lower maintenance, and better guest experience — a compelling value story for any hotel owner or procurement manager.</p>

<h3 style="color:#047857;margin-top:24px">Head-to-Head Feature Comparison</h3>
<table style="width:100%;border-collapse:collapse;margin:10px 0">
<tr style="background:#f0fdf4"><th style="padding:8px;border:1px solid #e5e7eb;text-align:left">Feature</th><th style="padding:8px;border:1px solid #e5e7eb;text-align:left">LAXREE Mini Bar</th><th style="padding:8px;border:1px solid #e5e7eb;text-align:left">Godrej Qube</th></tr>
<tr><td style="padding:8px;border:1px solid #e5e7eb">Performance @ 30°C</td><td style="padding:8px;border:1px solid #e5e7eb">6°C (solid) / 8.5°C (glass)</td><td style="padding:8px;border:1px solid #e5e7eb">8–15°C+ only</td></tr>
<tr><td style="padding:8px;border:1px solid #e5e7eb">Cooling Technology</td><td style="padding:8px;border:1px solid #e5e7eb">Dual fan thermoelectric / Absorption</td><td style="padding:8px;border:1px solid #e5e7eb">Basic TEC plate, no internal fan</td></tr>
<tr><td style="padding:8px;border:1px solid #e5e7eb">Heat Sink Fan</td><td style="padding:8px;border:1px solid #e5e7eb">Japanese-grade aluminum</td><td style="padding:8px;border:1px solid #e5e7eb">Plastic fan, shorter lifespan</td></tr>
<tr><td style="padding:8px;border:1px solid #e5e7eb">Temperature Control</td><td style="padding:8px;border:1px solid #e5e7eb">Digital controller with auto cut-off</td><td style="padding:8px;border:1px solid #e5e7eb">Manual knob only</td></tr>
<tr><td style="padding:8px;border:1px solid #e5e7eb">Interior LED Light</td><td style="padding:8px;border:1px solid #e5e7eb">✅ Yes — premium feel for guests</td><td style="padding:8px;border:1px solid #e5e7eb">❌ No</td></tr>
<tr><td style="padding:8px;border:1px solid #e5e7eb">Door Lock</td><td style="padding:8px;border:1px solid #e5e7eb">✅ Yes (cam-lock with key)</td><td style="padding:8px;border:1px solid #e5e7eb">❌ No</td></tr>
<tr><td style="padding:8px;border:1px solid #e5e7eb">Storage Layout</td><td style="padding:8px;border:1px solid #e5e7eb">Adjustable shelves + bottle racks</td><td style="padding:8px;border:1px solid #e5e7eb">Fixed layout, limited flexibility</td></tr>
<tr><td style="padding:8px;border:1px solid #e5e7eb">Noise Level</td><td style="padding:8px;border:1px solid #e5e7eb">Ultra-low (≤25dB)</td><td style="padding:8px;border:1px solid #e5e7eb">Audible hum (~35–40dB)</td></tr>
<tr><td style="padding:8px;border:1px solid #e5e7eb">Power Consumption</td><td style="padding:8px;border:1px solid #e5e7eb">55 Watts</td><td style="padding:8px;border:1px solid #e5e7eb">60 Watts</td></tr>
<tr><td style="padding:8px;border:1px solid #e5e7eb">Door Options</td><td style="padding:8px;border:1px solid #e5e7eb">Solid, Glass, Mirror Finish</td><td style="padding:8px;border:1px solid #e5e7eb">Solid only</td></tr>
<tr><td style="padding:8px;border:1px solid #e5e7eb">Technology Options</td><td style="padding:8px;border:1px solid #e5e7eb">3 (Compressor, TE, Absorption)</td><td style="padding:8px;border:1px solid #e5e7eb">1 (Basic thermoelectric)</td></tr>
</table>

<h3 style="color:#047857;margin-top:24px">Total Cost of Ownership: 100-Room Hotel</h3>
<p>The true cost of a mini bar is not the purchase price — it's the total cost of ownership over 5+ years. Here's the math that wins deals:</p>
<table style="width:100%;border-collapse:collapse;margin:10px 0">
<tr style="background:#f0fdf4"><th style="padding:8px;border:1px solid #e5e7eb;text-align:left">Cost Factor</th><th style="padding:8px;border:1px solid #e5e7eb;text-align:left">LAXREE</th><th style="padding:8px;border:1px solid #e5e7eb;text-align:left">Godrej Qube</th><th style="padding:8px;border:1px solid #e5e7eb;text-align:left">Savings</th></tr>
<tr><td style="padding:8px;border:1px solid #e5e7eb">Daily Energy (100 rooms × 24hrs)</td><td style="padding:8px;border:1px solid #e5e7eb">132 kWh</td><td style="padding:8px;border:1px solid #e5e7eb">144 kWh</td><td style="padding:8px;border:1px solid #e5e7eb">12 kWh/day</td></tr>
<tr><td style="padding:8px;border:1px solid #e5e7eb">Daily Electricity Cost (@ ₹9/kWh)</td><td style="padding:8px;border:1px solid #e5e7eb">₹1,188</td><td style="padding:8px;border:1px solid #e5e7eb">₹1,296</td><td style="padding:8px;border:1px solid #e5e7eb">₹108/day</td></tr>
<tr><td style="padding:8px;border:1px solid #e5e7eb">Annual Electricity Cost</td><td style="padding:8px;border:1px solid #e5e7eb">₹4,33,620</td><td style="padding:8px;border:1px solid #e5e7eb">₹4,73,040</td><td style="padding:8px;border:1px solid #e5e7eb">₹39,420/year</td></tr>
<tr><td style="padding:8px;border:1px solid #e5e7eb">5-Year Energy Cost</td><td style="padding:8px;border:1px solid #e5e7eb">₹21,68,100</td><td style="padding:8px;border:1px solid #e5e7eb">₹23,65,200</td><td style="padding:8px;border:1px solid #e5e7eb">₹1,97,100</td></tr>
</table>

<h3 style="color:#047857;margin-top:24px">Sales Scripts for Common Objections</h3>
<h4>"Godrej Qube is cheaper"</h4>
<p>"You're right that the upfront SSP is slightly lower. But let me show you the total cost of ownership. LAXREE saves you 5 watts per unit — that's nearly ₹40,000 per year in electricity for 100 rooms. Over 5 years, you save almost ₹2 lakhs on energy alone. Plus, our digital controller prevents temperature fluctuations that spoil beverages, reducing waste. The lock option protects VIP room inventory. And the LED interior light increases minibar usage revenue by making items visible and appealing."</p>

<h4>"We've always used Godrej"</h4>
<p>"Many of our current clients said the same thing before switching. The key difference they noticed? Guest complaints about noise dropped to zero, and minibar revenue increased because the LED light and glass door option make items more visible. I can connect you with a reference property that made the switch."</p>

<h4>"I need proof of performance"</h4>
<p>"Absolutely. We can arrange a demo unit for your property so you can test it side-by-side with your current minibar. You'll see the temperature difference, hear the silence, and experience the quality firsthand. Many of our largest accounts started with a pilot of 5–10 rooms."</p>

<h3 style="color:#047857;margin-top:24px">When NOT to Compete on Price</h3>
<p>Never lead with discounts. Instead, reframe the conversation:</p>
<ul>
<li><strong>Shift from price to value:</strong> "Let me show you the total cost of ownership comparison"</li>
<li><strong>Shift from product to experience:</strong> "Your guests deserve silent, reliable minibars"</li>
<li><strong>Shift from unit to package:</strong> "LAXREE offers 15+ categories — single vendor, single invoice, single service team"</li>
</ul>

<h3 style="color:#047857;margin-top:24px">FAQ</h3>
<ul>
<li><strong>Q: Do you price-match Godrej Qube?</strong> — A: We don't compete on price; we compete on value. The TCO savings alone exceed any price difference.</li>
<li><strong>Q: Can we trial before committing?</strong> — A: Yes, pilot programs of 5–10 rooms are available for qualified properties.</li>
<li><strong>Q: What about after-sales service vs Godrej?</strong> — A: LAXREE provides PAN India service with spare parts within 48 hours. Our single-vendor model means one call solves everything.</li>
</ul>
</div>`,
      contentType: 'video',
      contentUrl: 'https://www.youtube.com/embed/Z-eOuzqM0ns',
      order: 4,
      duration: 20,
      courseId: productAcademyCourse.id,
      productCategoryId: categories[0].id,
    }
  })

  // Module 5: Safe Box Product Series
  await db.module.create({
    data: {
      title: 'Safe Box Product Series',
      description: 'Complete overview of Essential, Medium, Laptop, and Orbita safe box series',
      content: `<div style="font-family:system-ui,sans-serif;line-height:1.7;color:#1a1a1a">
<img src="https://sfile.chatglm.cn/images-ppt/f896588e4161.jpg" alt="LAXREE Safe Box Product Series" style="width:100%;max-width:600px;border-radius:12px;margin:16px 0;box-shadow:0 4px 12px rgba(0,0,0,0.1)" />
<h2 style="color:#065f46;border-bottom:2px solid #059669;padding-bottom:8px">LAXREE Safe Box Product Series</h2>
<p>LAXREE offers four distinct safe box series designed to cover every hotel segment from budget guest houses to ultra-luxury suites. Hotel safes are one of the most frequently evaluated in-room products — every guest expects a secure place for valuables, and every hotel needs a solution that balances security, ease of use, and cost. This module provides a comprehensive overview of each series, their specifications, and the ideal use cases so you can recommend the right model with confidence.</p>

<h3 style="color:#047857;margin-top:24px">1. Essential Series — Budget Reliability</h3>
<p>The Essential Series delivers core safe-box functionality at the most competitive price point in the market. Designed for budget hotels and guest houses where the primary requirement is a secure lockable container without advanced features. Despite the affordable price, every Essential safe includes a manual override key and low-energy battery operation.</p>
<ul>
<li><strong>Model:</strong> LRSB-201 (W230 × D170 × H170mm)</li>
<li><strong>SSP:</strong> ₹1,700</li>
<li><strong>Locking:</strong> Electronic keypad with manual override key</li>
<li><strong>Power:</strong> 4× AA batteries (1–1.5 year life), low battery alert</li>
<li><strong>Mounting:</strong> Pre-drilled holes for floor or shelf mounting</li>
<li><strong>Best For:</strong> Budget hotels, guest houses, hostels, serviced apartments</li>
</ul>

<h3 style="color:#047857;margin-top:24px">2. Medium Series — Standard Security</h3>
<p>The Medium Series adds intelligent security features like auto-lockout after wrong PIN entries and personal code management. This is the workhorse of the LAXREE safe box lineup — the most popular choice for 3-star and 4-star hotels that need reliable security without the premium price tag.</p>
<ul>
<li><strong>Models:</strong> LRSB-206 (W200 × D310 × H200mm), LRSB-211 (W315 × D200 × H200mm)</li>
<li><strong>SSP:</strong> ₹2,888 – ₹3,000</li>
<li><strong>Locking:</strong> 4–6 digit personal codes with auto-lock after 4 wrong inputs</li>
<li><strong>Power:</strong> 4× AA batteries with low battery alert</li>
<li><strong>Mounting:</strong> Pre-drilled for secure anchoring</li>
<li><strong>Best For:</strong> Standard rooms in 3-star and 4-star hotels</li>
</ul>

<h3 style="color:#047857;margin-top:24px">3. Laptop Series — Premium Business</h3>
<p>The Laptop Series is designed for business travelers who need to secure laptops and larger valuables. These models feature LED displays, interior lighting, and comprehensive audit trails — features that corporate hotels and business-focused properties demand. The audit trail capability is a significant differentiator that most competitors at this price point cannot match.</p>
<ul>
<li><strong>Models:</strong> LRSB-214, LRSB-203, LRSB-204 (W420 × D370 × H200mm)</li>
<li><strong>SSP:</strong> ₹4,335 – ₹4,590</li>
<li><strong>Locking:</strong> Advanced electronic with back-lit keypad, personal + master codes</li>
<li><strong>Special Features:</strong> LED display, LED interior light, 100-entry audit trail</li>
<li><strong>Power:</strong> 4× AA batteries with low battery alert</li>
<li><strong>Best For:</strong> Business hotels, premium rooms, executive suites</li>
</ul>

<h3 style="color:#047857;margin-top:24px">4. Orbita Series — Ultra Luxury</h3>
<p>The Orbita Series represents the pinnacle of hotel safe technology. With master password capability, comprehensive audit trails, and premium LED interior lighting, the Orbita is designed for 5-star properties where guest experience and management control are equally paramount. The audit trail provides hotel management with a complete access history — invaluable for resolving disputes and ensuring accountability.</p>
<ul>
<li><strong>Model:</strong> LRSB-209 (W420 × D370 × H200mm)</li>
<li><strong>SSP:</strong> ₹5,220</li>
<li><strong>Locking:</strong> Master password + personal codes, auto-lock</li>
<li><strong>Special Features:</strong> Full audit trail (100 logs), LED interior light, back-lit keypad</li>
<li><strong>Power:</strong> 4× AA batteries with low battery alert</li>
<li><strong>Best For:</strong> 5-star luxury hotels, presidential suites, high-security rooms</li>
</ul>

<h3 style="color:#047857;margin-top:24px">Complete Specifications Comparison</h3>
<table style="width:100%;border-collapse:collapse;margin:10px 0">
<tr style="background:#f0fdf4"><th style="padding:8px;border:1px solid #e5e7eb;text-align:left">Feature</th><th style="padding:8px;border:1px solid #e5e7eb;text-align:left">Essential</th><th style="padding:8px;border:1px solid #e5e7eb;text-align:left">Medium</th><th style="padding:8px;border:1px solid #e5e7eb;text-align:left">Laptop</th><th style="padding:8px;border:1px solid #e5e7eb;text-align:left">Orbita</th></tr>
<tr><td style="padding:8px;border:1px solid #e5e7eb">SSP Range</td><td style="padding:8px;border:1px solid #e5e7eb">₹1,700</td><td style="padding:8px;border:1px solid #e5e7eb">₹2,888–3,000</td><td style="padding:8px;border:1px solid #e5e7eb">₹4,335–4,590</td><td style="padding:8px;border:1px solid #e5e7eb">₹5,220</td></tr>
<tr><td style="padding:8px;border:1px solid #e5e7eb">Auto Lockout</td><td style="padding:8px;border:1px solid #e5e7eb">❌</td><td style="padding:8px;border:1px solid #e5e7eb">✅ 4 wrong</td><td style="padding:8px;border:1px solid #e5e7eb">✅ 4 wrong</td><td style="padding:8px;border:1px solid #e5e7eb">✅ 4 wrong</td></tr>
<tr><td style="padding:8px;border:1px solid #e5e7eb">LED Display</td><td style="padding:8px;border:1px solid #e5e7eb">❌</td><td style="padding:8px;border:1px solid #e5e7eb">❌</td><td style="padding:8px;border:1px solid #e5e7eb">✅</td><td style="padding:8px;border:1px solid #e5e7eb">✅</td></tr>
<tr><td style="padding:8px;border:1px solid #e5e7eb">Interior Light</td><td style="padding:8px;border:1px solid #e5e7eb">❌</td><td style="padding:8px;border:1px solid #e5e7eb">❌</td><td style="padding:8px;border:1px solid #e5e7eb">✅ LED</td><td style="padding:8px;border:1px solid #e5e7eb">✅ LED</td></tr>
<tr><td style="padding:8px;border:1px solid #e5e7eb">Audit Trail</td><td style="padding:8px;border:1px solid #e5e7eb">❌</td><td style="padding:8px;border:1px solid #e5e7eb">❌</td><td style="padding:8px;border:1px solid #e5e7eb">✅ 100 logs</td><td style="padding:8px;border:1px solid #e5e7eb">✅ 100 logs</td></tr>
<tr><td style="padding:8px;border:1px solid #e5e7eb">Master Password</td><td style="padding:8px;border:1px solid #e5e7eb">❌</td><td style="padding:8px;border:1px solid #e5e7eb">❌</td><td style="padding:8px;border:1px solid #e5e7eb">⚠️</td><td style="padding:8px;border:1px solid #e5e7eb">✅</td></tr>
<tr><td style="padding:8px;border:1px solid #e5e7eb">Laptop-Fit Size</td><td style="padding:8px;border:1px solid #e5e7eb">❌</td><td style="padding:8px;border:1px solid #e5e7eb">❌</td><td style="padding:8px;border:1px solid #e5e7eb">✅</td><td style="padding:8px;border:1px solid #e5e7eb">✅</td></tr>
</table>

<h3 style="color:#047857;margin-top:24px">Installation Guide</h3>
<ol>
<li>Choose mounting location: inside wardrobe, under desk, or in closet shelf</li>
<li>Mark drilling points through pre-drilled mounting holes in the safe base</li>
<li>Drill appropriate anchors into the floor or shelf surface</li>
<li>Secure safe with provided bolts — verify it cannot be removed by hand</li>
<li>Install 4× AA batteries and test electronic lock before guest handover</li>
<li>Set master code first, then demonstrate guest code setting procedure</li>
</ol>

<h3 style="color:#047857;margin-top:24px">Cross-Selling Suggestions</h3>
<p>Safe boxes pair naturally with <strong>RFID Door Locks</strong> for a complete room security package. For premium rooms, combine the Laptop or Orbita safe with <strong>Mini Bars</strong> (lock-option models) for VIP-level inventory protection. Also recommend <strong>Hair Dryers</strong> with wall-mount and shaver socket to complete the premium room setup.</p>
</div>`,
      contentType: 'video',
      contentUrl: 'https://www.youtube.com/embed/St815eDtI5c',
      order: 5,
      duration: 20,
      courseId: productAcademyCourse.id,
      productCategoryId: categories[1].id,
    }
  })

  // Module 6: Safe Box Security Features & Competitive Edge
  await db.module.create({
    data: {
      title: 'Safe Box Security Features & Competitive Edge',
      description: 'Deep dive into security features and competitive advantages of LAXREE safe boxes',
      content: `<div style="font-family:system-ui,sans-serif;line-height:1.7;color:#1a1a1a">
<img src="https://sfile.chatglm.cn/images-ppt/f896588e4161.jpg" alt="LAXREE Safe Box Security Features" style="width:100%;max-width:600px;border-radius:12px;margin:16px 0;box-shadow:0 4px 12px rgba(0,0,0,0.1)" />
<h2 style="color:#065f46;border-bottom:2px solid #059669;padding-bottom:8px">Safe Box Security Features & Competitive Edge</h2>
<p>Understanding the security features of LAXREE safe boxes is essential for building confidence with hotel owners and procurement managers. Security is the primary purchase driver for hotel safes — features like audit trails, auto-lockout, and dual override systems aren't just nice-to-haves; they're deal-makers that directly address hotel management's concerns about guest disputes, theft liability, and operational control. This module breaks down every security feature and shows how LAXREE outperforms the competition.</p>

<h3 style="color:#047857;margin-top:24px">Core Security Features</h3>
<h4>4–6 Digit Personal Codes</h4>
<p>Guests set their own personal code at check-in, providing a unique combination that only they know. The system supports 4 to 6 digit codes, balancing ease of use with security strength. Each new guest can reset the code, and housekeeping access is managed through the master code.</p>

<h4>Auto Lockout After Wrong Entries</h4>
<p>After 4 consecutive incorrect code entries, the safe automatically locks and requires master override to reset. This prevents brute-force attempts and provides a clear alert to hotel security. This feature is standard on Medium, Laptop, and Orbita series — most competitors at comparable price points don't offer this.</p>

<h4>Dual Override System</h4>
<p>Every LAXREE safe provides two independent override methods:</p>
<ul>
<li><strong>Master Code:</strong> Electronic override used by hotel management to access any safe in an emergency</li>
<li><strong>Manual Override Key:</strong> Physical key backup that works even when batteries are dead or electronics fail</li>
</ul>
<p>This dual system ensures the hotel is never locked out of a safe, even in worst-case scenarios. Competitors often provide only one override method, creating a single point of failure.</p>

<h4>Low Energy Technology</h4>
<p>All LAXREE safes operate on just 4 AA batteries with an expected lifespan of 1–1.5 years. The low-energy design means fewer battery replacements across hundreds of rooms, reducing maintenance costs and housekeeping workload. A low battery alert provides 2–4 weeks of warning before batteries are fully depleted, ensuring no guest is ever locked out due to dead batteries.</p>

<h4>Audit Trail (Laptop & Orbita Series)</h4>
<p>The audit trail records up to 100 access events with timestamps, providing a complete history of who accessed the safe and when. This is invaluable for:</p>
<ul>
<li>Resolving guest disputes about missing valuables</li>
<li>Verifying housekeeping access logs</li>
<li>Providing evidence for insurance claims</li>
<li>Monitoring unauthorized access attempts</li>
</ul>
<p>Most competitors in the ₹3,000–5,000 range do not offer audit trail capability. This feature alone can tip the decision in LAXREE's favor when selling to management-conscious hotel chains.</p>

<h4>LED Interior Light (Laptop & Orbita)</h4>
<p>The LED interior light activates when the safe door opens, allowing guests to see contents clearly even in dimly lit wardrobes or closets. This premium touch enhances the guest experience and reduces the chance of items being left behind at checkout.</p>

<h3 style="color:#047857;margin-top:24px">Competitive Comparison: LAXREE vs Industry</h3>
<table style="width:100%;border-collapse:collapse;margin:10px 0">
<tr style="background:#f0fdf4"><th style="padding:8px;border:1px solid #e5e7eb;text-align:left">Feature</th><th style="padding:8px;border:1px solid #e5e7eb;text-align:left">LAXREE</th><th style="padding:8px;border:1px solid #e5e7eb;text-align:left">Godrej / Yale / Hafele</th></tr>
<tr><td style="padding:8px;border:1px solid #e5e7eb">Auto Lock on Wrong Code</td><td style="padding:8px;border:1px solid #e5e7eb">✅ After 4 attempts</td><td style="padding:8px;border:1px solid #e5e7eb">⚠️ Not standard across models</td></tr>
<tr><td style="padding:8px;border:1px solid #e5e7eb">Audit Trail</td><td style="padding:8px;border:1px solid #e5e7eb">✅ Up to 100 records</td><td style="padding:8px;border:1px solid #e5e7eb">❌ Rarely offered below ₹8,000</td></tr>
<tr><td style="padding:8px;border:1px solid #e5e7eb">LED Interior Light</td><td style="padding:8px;border:1px solid #e5e7eb">✅ Laptop & Orbita series</td><td style="padding:8px;border:1px solid #e5e7eb">❌ Usually not available</td></tr>
<tr><td style="padding:8px;border:1px solid #e5e7eb">Override Options</td><td style="padding:8px;border:1px solid #e5e7eb">✅ Master Code + Physical Key</td><td style="padding:8px;border:1px solid #e5e7eb">⚠️ Some offer only one method</td></tr>
<tr><td style="padding:8px;border:1px solid #e5e7eb">Custom Hotel Branding</td><td style="padding:8px;border:1px solid #e5e7eb">✅ Logo printing available</td><td style="padding:8px;border:1px solid #e5e7eb">❌ Rarely offered or high MOQ</td></tr>
<tr><td style="padding:8px;border:1px solid #e5e7eb">Pre-drilled Mounting</td><td style="padding:8px;border:1px solid #e5e7eb">✅ All models</td><td style="padding:8px;border:1px solid #e5e7eb">⚠️ Some require custom drilling</td></tr>
<tr><td style="padding:8px;border:1px solid #e5e7eb">Battery Life</td><td style="padding:8px;border:1px solid #e5e7eb">1–1.5 years</td><td style="padding:8px;border:1px solid #e5e7eb">6–12 months typical</td></tr>
</table>

<h3 style="color:#047857;margin-top:24px">Troubleshooting Guide</h3>
<table style="width:100%;border-collapse:collapse;margin:10px 0">
<tr style="background:#f0fdf4"><th style="padding:8px;border:1px solid #e5e7eb;text-align:left">Issue</th><th style="padding:8px;border:1px solid #e5e7eb;text-align:left">Cause</th><th style="padding:8px;border:1px solid #e5e7eb;text-align:left">Solution</th></tr>
<tr><td style="padding:8px;border:1px solid #e5e7eb">Guest forgot code</td><td style="padding:8px;border:1px solid #e5e7eb">Guest error</td><td style="padding:8px;border:1px solid #e5e7eb">Use master code or manual override key</td></tr>
<tr><td style="padding:8px;border:1px solid #e5e7eb">Safe locked out (4 wrong attempts)</td><td style="padding:8px;border:1px solid #e5e7eb">Security feature activated</td><td style="padding:8px;border:1px solid #e5e7eb">Master code reset, then guest sets new code</td></tr>
<tr><td style="padding:8px;border:1px solid #e5e7eb">Keypad not responding</td><td style="padding:8px;border:1px solid #e5e7eb">Dead batteries</td><td style="padding:8px;border:1px solid #e5e7eb">Use manual override key, replace batteries</td></tr>
<tr><td style="padding:8px;border:1px solid #e5e7eb">Door won't close properly</td><td style="padding:8px;border:1px solid #e5e7eb">Obstruction or misalignment</td><td style="padding:8px;border:1px solid #e5e7eb">Clear interior, check bolt alignment</td></tr>
</table>

<h3 style="color:#047857;margin-top:24px">Sales Talking Points</h3>
<ul>
<li><strong>For GMs:</strong> "The audit trail on our Laptop and Orbita series protects your hotel from liability in guest disputes — you'll have a timestamped record of every access event."</li>
<li><strong>For Procurement:</strong> "Our dual override system means you're never locked out. Master code plus physical key ensures zero downtime."</li>
<li><strong>For Housekeeping:</strong> "1.5-year battery life means fewer room interruptions for battery changes. The low battery alert gives 2–4 weeks advance notice."</li>
</ul>

<h3 style="color:#047857;margin-top:24px">FAQ</h3>
<ul>
<li><strong>Q: Can the audit trail be downloaded?</strong> — A: Yes, audit data can be retrieved via the safe's interface. For high-volume properties, we offer PMS integration on the Orbita series.</li>
<li><strong>Q: Is custom branding available on all models?</strong> — A: Yes, hotel logo printing is available on all four series. Minimum order of 50 units applies.</li>
<li><strong>Q: What happens if both batteries die and the key is lost?</strong> — A: LAXREE provides emergency drilling instructions for certified technicians. We recommend hotels store master keys in a secure location with access logging.</li>
</ul>
</div>`,
      contentType: 'video',
      contentUrl: 'https://www.youtube.com/embed/St815eDtI5c',
      order: 6,
      duration: 15,
      courseId: productAcademyCourse.id,
      productCategoryId: categories[1].id,
    }
  })

  // Module 7: RFID Locks & Access Control
  await db.module.create({
    data: {
      title: 'RFID Locks & Access Control',
      description: 'Complete guide to LAXREE RFID door lock systems and features',
      content: `<div style="font-family:system-ui,sans-serif;line-height:1.7;color:#1a1a1a">
<img src="https://sfile.chatglm.cn/images-ppt/5e822e3c57c5.png" alt="LAXREE RFID Door Lock Systems" style="width:100%;max-width:600px;border-radius:12px;margin:16px 0;box-shadow:0 4px 12px rgba(0,0,0,0.1)" />
<h2 style="color:#065f46;border-bottom:2px solid #059669;padding-bottom:8px">LAXREE RFID Door Lock Systems & Access Control</h2>
<p>RFID door locks are one of the highest-value products in the LAXREE portfolio and a critical differentiator when selling to hotel chains. Unlike consumer-grade smart locks, LAXREE's hospitality-grade RFID locks are built for the demands of hotel operations — high traffic, PMS integration, audit compliance, and master override capabilities. Understanding these features deeply allows you to sell not just a lock, but a complete access control solution that impacts the hotel's operational efficiency, guest satisfaction, and security posture.</p>

<h3 style="color:#047857;margin-top:24px">Model Lineup & Specifications</h3>
<table style="width:100%;border-collapse:collapse;margin:10px 0">
<tr style="background:#f0fdf4"><th style="padding:8px;border:1px solid #e5e7eb">Model</th><th style="padding:8px;border:1px solid #e5e7eb">Body Material</th><th style="padding:8px;border:1px solid #e5e7eb">Key Features</th><th style="padding:8px;border:1px solid #e5e7eb">SSP (₹)</th></tr>
<tr><td style="padding:8px;border:1px solid #e5e7eb">LRFD-608</td><td style="padding:8px;border:1px solid #e5e7eb">SS Body</td><td style="padding:8px;border:1px solid #e5e7eb">5 Latch Mortise, basic RFID</td><td style="padding:8px;border:1px solid #e5e7eb">3,337</td></tr>
<tr><td style="padding:8px;border:1px solid #e5e7eb">LRFD-610</td><td style="padding:8px;border:1px solid #e5e7eb">SS Body</td><td style="padding:8px;border:1px solid #e5e7eb">5 Latch Mortise, Master Override</td><td style="padding:8px;border:1px solid #e5e7eb">4,110</td></tr>
<tr><td style="padding:8px;border:1px solid #e5e7eb">LRFD-609</td><td style="padding:8px;border:1px solid #e5e7eb">Aluminium Alloy, Gloss Paint</td><td style="padding:8px;border:1px solid #e5e7eb">Premium finish, RFID + mechanical</td><td style="padding:8px;border:1px solid #e5e7eb">4,500</td></tr>
<tr><td style="padding:8px;border:1px solid #e5e7eb">LRFD-607</td><td style="padding:8px;border:1px solid #e5e7eb">304 SS</td><td style="padding:8px;border:1px solid #e5e7eb">Moisture Proof, Fire Rated, 1680 audit records, PMS interface</td><td style="padding:8px;border:1px solid #e5e7eb">8,320</td></tr>
<tr><td style="padding:8px;border:1px solid #e5e7eb">LRFD-606</td><td style="padding:8px;border:1px solid #e5e7eb">304 SS, Compact</td><td style="padding:8px;border:1px solid #e5e7eb">PMS interface, sleek design, premium</td><td style="padding:8px;border:1px solid #e5e7eb">9,440</td></tr>
</table>

<h3 style="color:#047857;margin-top:24px">PMS Integration: The Game Changer</h3>
<p>The LRFD-607 and LRFD-606 models offer direct PMS (Property Management System) integration, compatible with Opera and other leading hotel management software. This integration enables:</p>
<ul>
<li><strong>Automatic Key Encoding:</strong> Guest RFID cards are encoded at check-in through the PMS — no separate encoding device needed</li>
<li><strong>Real-Time Access Management:</strong> Keys are automatically invalidated at checkout, eliminating physical key return logistics</li>
<li><strong>Audit Trail Integration:</strong> All door access events flow into the PMS for unified reporting and compliance</li>
<li><strong>Staff Access Control:</strong> Housekeeping and maintenance staff cards can be programmed with time-based access windows</li>
<li><strong>Emergency Override Logging:</strong> All master key uses are logged with timestamps for security compliance</li>
</ul>
<p>For hotels currently using traditional key cards or mechanical keys, PMS integration alone can justify the upgrade. The labor savings from automated key management and the liability protection from comprehensive audit trails deliver measurable ROI.</p>

<h3 style="color:#047857;margin-top:24px">Key Technical Features</h3>
<ul>
<li><strong>5 Latch Mortise Lock:</strong> Industry-standard security with deadbolt engagement for maximum door strength</li>
<li><strong>1,680 Audit Records:</strong> LRFD-607 stores up to 1,680 access events — the highest capacity in this price range</li>
<li><strong>Master Override:</strong> Emergency access through master RFID card or mechanical key backup</li>
<li><strong>Fire Rated (LRFD-607):</strong> Certified for fire-rated doors, essential for commercial hotel compliance</li>
<li><strong>Moisture Proof (LRFD-607):</strong> IP-rated protection ideal for coastal hotels, pool areas, and humid climates</li>
<li><strong>Driverless USB Encoder:</strong> Card encoding software works without installing drivers — plug and encode</li>
<li><strong>Encryption:</strong> Mifare/RFID encryption prevents card cloning and unauthorized duplication</li>
</ul>

<h3 style="color:#047857;margin-top:24px">Installation Guide</h3>
<ol>
<li>Verify door thickness (standard 35–55mm) and prepare mortise cutout per specification sheet</li>
<li>Install 5-latch mortise body into door edge, ensuring smooth bolt throw</li>
<li>Mount exterior RFID reader panel with provided screws and cable routing</li>
<li>Mount interior battery cover panel and connect wiring harness</li>
<li>Install 4× AA batteries and test lock/unlock with test cards</li>
<li>Program master card, floor cards, and guest cards via USB encoder</li>
<li>Test PMS integration if applicable — verify check-in/check-out key lifecycle</li>
</ol>

<h3 style="color:#047857;margin-top:24px">Troubleshooting</h3>
<table style="width:100%;border-collapse:collapse;margin:10px 0">
<tr style="background:#f0fdf4"><th style="padding:8px;border:1px solid #e5e7eb;text-align:left">Issue</th><th style="padding:8px;border:1px solid #e5e7eb;text-align:left">Cause</th><th style="padding:8px;border:1px solid #e5e7eb;text-align:left">Solution</th></tr>
<tr><td style="padding:8px;border:1px solid #e5e7eb">Card not reading</td><td style="padding:8px;border:1px solid #e5e7eb">Dirty reader / wrong card type</td><td style="padding:8px;border:1px solid #e5e7eb">Clean reader surface, verify Mifare card compatibility</td></tr>
<tr><td style="padding:8px;border:1px solid #e5e7eb">Lock not responding</td><td style="padding:8px;border:1px solid #e5e7eb">Dead batteries</td><td style="padding:8px;border:1px solid #e5e7eb">Use mechanical override, replace batteries</td></tr>
<tr><td style="padding:8px;border:1px solid #e5e7eb">Guest card not working after check-in</td><td style="padding:8px;border:1px solid #e5e7eb">PMS encoding error</td><td style="padding:8px;border:1px solid #e5e7eb">Re-encode at reception, check PMS connection</td></tr>
</table>

<h3 style="color:#047857;margin-top:24px">Sales Talking Points</h3>
<ul>
<li><strong>For GMs:</strong> "1,680 audit records mean you have complete visibility into every door access event — invaluable for security compliance and dispute resolution."</li>
<li><strong>For IT Managers:</strong> "Our driverless USB encoder integrates with Opera PMS without custom software installation. Zero IT overhead."</li>
<li><strong>For Coastal Hotels:</strong> "The LRFD-607 is moisture-proof and fire-rated — specifically engineered for harsh environments where standard locks corrode within months."</li>
</ul>

<h3 style="color:#047857;margin-top:24px">Cross-Selling Opportunities</h3>
<p>RFID locks are the anchor product for a complete room security package. Always bundle with <strong>Safe Boxes</strong> (Orbita series for 5-star, Medium for 3-star) for in-room valuables security. Recommend <strong>Digital Signages</strong> for lobby wayfinding that uses the same RFID infrastructure. For new builds, propose the full LAXREE room package including <strong>Mini Bars</strong>, <strong>Hair Dryers</strong>, and <strong>Kettles</strong> for maximum single-vendor convenience.</p>
</div>`,
      contentType: 'video',
      contentUrl: 'https://www.youtube.com/embed/ltARwWOPn6Q',
      order: 7,
      duration: 20,
      courseId: productAcademyCourse.id,
      productCategoryId: categories[2].id,
    }
  })

  // Module 8: Electric Kettles & TCM Trays
  await db.module.create({
    data: {
      title: 'Electric Kettles & TCM Trays',
      description: 'Complete guide to LAXREE electric kettles and tea coffee maker trays',
      content: `<div style="font-family:system-ui,sans-serif;line-height:1.7;color:#1a1a1a">
<img src="https://sfile.chatglm.cn/images-ppt/2eece29f9d02.jpg" alt="LAXREE Electric Kettles & TCM Trays" style="width:100%;max-width:600px;border-radius:12px;margin:16px 0;box-shadow:0 4px 12px rgba(0,0,0,0.1)" />
<h2 style="color:#065f46;border-bottom:2px solid #059669;padding-bottom:8px">Electric Kettles & TCM Trays</h2>
<p>Electric kettles and Tea Coffee Maker (TCM) trays are among the most frequently replaced items in any hotel room. High guest usage, limescale buildup, and wear-and-tear from housekeeping mean hotels typically replace kettles every 2–3 years. This makes them an excellent recurring-revenue product and a natural entry point for building relationships with new hotel clients. LAXREE offers five kettle models and three TCM tray options covering every budget and design requirement.</p>

<h3 style="color:#047857;margin-top:24px">Electric Kettle Range</h3>
<table style="width:100%;border-collapse:collapse;margin:10px 0">
<tr style="background:#f0fdf4"><th style="padding:8px;border:1px solid #e5e7eb">Model</th><th style="padding:8px;border:1px solid #e5e7eb">Capacity</th><th style="padding:8px;border:1px solid #e5e7eb">Power</th><th style="padding:8px;border:1px solid #e5e7eb">Material</th><th style="padding:8px;border:1px solid #e5e7eb">Key Feature</th><th style="padding:8px;border:1px solid #e5e7eb">SSP (₹)</th></tr>
<tr><td style="padding:8px;border:1px solid #e5e7eb">LRWT-143</td><td style="padding:8px;border:1px solid #e5e7eb">0.6L</td><td style="padding:8px;border:1px solid #e5e7eb">1000W</td><td style="padding:8px;border:1px solid #e5e7eb">SS 201</td><td style="padding:8px;border:1px solid #e5e7eb">Auto shut-off, compact</td><td style="padding:8px;border:1px solid #e5e7eb">560</td></tr>
<tr><td style="padding:8px;border:1px solid #e5e7eb">LRWT-145</td><td style="padding:8px;border:1px solid #e5e7eb">0.8L</td><td style="padding:8px;border:1px solid #e5e7eb">800W</td><td style="padding:8px;border:1px solid #e5e7eb">SS 201 Matt</td><td style="padding:8px;border:1px solid #e5e7eb">Matt finish, quiet boil</td><td style="padding:8px;border:1px solid #e5e7eb">488</td></tr>
<tr><td style="padding:8px;border:1px solid #e5e7eb">LRWT-155</td><td style="padding:8px;border:1px solid #e5e7eb">0.8L</td><td style="padding:8px;border:1px solid #e5e7eb">1200W</td><td style="padding:8px;border:1px solid #e5e7eb">SS 304 Double</td><td style="padding:8px;border:1px solid #e5e7eb">Double wall, cool touch</td><td style="padding:8px;border:1px solid #e5e7eb">1,104</td></tr>
<tr><td style="padding:8px;border:1px solid #e5e7eb">LRWT-150</td><td style="padding:8px;border:1px solid #e5e7eb">0.8L</td><td style="padding:8px;border:1px solid #e5e7eb">Strix</td><td style="padding:8px;border:1px solid #e5e7eb">Premium</td><td style="padding:8px;border:1px solid #e5e7eb">Strix controller, longest life</td><td style="padding:8px;border:1px solid #e5e7eb">1,320</td></tr>
<tr><td style="padding:8px;border:1px solid #e5e7eb">LRWT-156</td><td style="padding:8px;border:1px solid #e5e7eb">1.0L</td><td style="padding:8px;border:1px solid #e5e7eb">Strix</td><td style="padding:8px;border:1px solid #e5e7eb">SS 304 Double</td><td style="padding:8px;border:1px solid #e5e7eb">Strix + double wall + 1L</td><td style="padding:8px;border:1px solid #e5e7eb">1,400</td></tr>
</table>

<h3 style="color:#047857;margin-top:24px">Understanding Strix Controllers</h3>
<p>The Strix controller is a UK-manufactured steam-switch and safety controller used in premium kettles worldwide. It's the gold standard for commercial kettles because it provides:</p>
<ul>
<li><strong>Longer Lifespan:</strong> 10,000+ boil cycles vs 3,000–5,000 for standard controllers</li>
<li><strong>Precise Auto Shut-Off:</strong> Consistently cuts power at boiling point, preventing dry-boil damage</li>
<li><strong>Safety Certification:</strong> Internationally certified for commercial use (VDE, UL, CCC)</li>
<li><strong>Lower Failure Rate:</strong> Less than 0.1% failure rate in commercial environments</li>
</ul>
<p>For hotels that replace kettles frequently due to controller failure, the Strix-equipped LRWT-150 and LRWT-156 deliver 3x the lifespan at only 2x the price — a clear total cost of ownership win.</p>

<h3 style="color:#047857;margin-top:24px">TCM Tray Range</h3>
<p>TCM (Tea Coffee Maker) trays organize the in-room beverage station, providing a professional presentation that enhances guest experience and reduces clutter. LAXREE offers three tray options from budget to premium:</p>
<table style="width:100%;border-collapse:collapse;margin:10px 0">
<tr style="background:#f0fdf4"><th style="padding:8px;border:1px solid #e5e7eb">Model</th><th style="padding:8px;border:1px solid #e5e7eb">Material</th><th style="padding:8px;border:1px solid #e5e7eb">Key Feature</th><th style="padding:8px;border:1px solid #e5e7eb">SSP (₹)</th></tr>
<tr><td style="padding:8px;border:1px solid #e5e7eb">LRWT-158</td><td style="padding:8px;border:1px solid #e5e7eb">ABS Plastic</td><td style="padding:8px;border:1px solid #e5e7eb">Anti-theft cable, durable, lightweight</td><td style="padding:8px;border:1px solid #e5e7eb">706</td></tr>
<tr><td style="padding:8px;border:1px solid #e5e7eb">LRWT-163</td><td style="padding:8px;border:1px solid #e5e7eb">PU Leatherette</td><td style="padding:8px;border:1px solid #e5e7eb">Elegant finish, easy to clean</td><td style="padding:8px;border:1px solid #e5e7eb">1,305</td></tr>
<tr><td style="padding:8px;border:1px solid #e5e7eb">LRWT-162</td><td style="padding:8px;border:1px solid #e5e7eb">Leatherette, Large</td><td style="padding:8px;border:1px solid #e5e7eb">Premium feel, accommodates full TCM set</td><td style="padding:8px;border:1px solid #e5e7eb">1,425</td></tr>
</table>

<h3 style="color:#047857;margin-top:24px">Installation & Care Guide</h3>
<ul>
<li>Place kettle on TCM tray with cable routed through the anti-theft slot (LRWT-158) or beneath the tray</li>
<li>Descale kettles monthly in hard-water areas using white vinegar or commercial descaler</li>
<li>Wipe TCM trays daily with damp cloth; avoid abrasive cleaners on leatherette surfaces</li>
<li>Check auto shut-off function quarterly to ensure safety compliance</li>
</ul>

<h3 style="color:#047857;margin-top:24px">Troubleshooting</h3>
<table style="width:100%;border-collapse:collapse;margin:10px 0">
<tr style="background:#f0fdf4"><th style="padding:8px;border:1px solid #e5e7eb;text-align:left">Issue</th><th style="padding:8px;border:1px solid #e5e7eb;text-align:left">Cause</th><th style="padding:8px;border:1px solid #e5e7eb;text-align:left">Solution</th></tr>
<tr><td style="padding:8px;border:1px solid #e5e7eb">Kettle not switching off</td><td style="padding:8px;border:1px solid #e5e7eb">Limescale on steam vent</td><td style="padding:8px;border:1px solid #e5e7eb">Descale immediately, replace controller if persistent</td></tr>
<tr><td style="padding:8px;border:1px solid #e5e7eb">Slow heating</td><td style="padding:8px;border:1px solid #e5e7eb">Mineral buildup on element</td><td style="padding:8px;border:1px solid #e5e7eb">Descale with vinegar solution</td></tr>
<tr><td style="padding:8px;border:1px solid #e5e7eb">Leaking from base</td><td style="padding:8px;border:1px solid #e5e7eb">Cracked body or seal</td><td style="padding:8px;border:1px solid #e5e7eb">Replace unit — not repairable in field</td></tr>
</table>

<h3 style="color:#047857;margin-top:24px">Sales Talking Points</h3>
<ul>
<li><strong>For Budget Hotels:</strong> "LRWT-145 at ₹488 is the most competitive 0.8L kettle in the market — matt finish looks premium at a budget price."</li>
<li><strong>For Premium Hotels:</strong> "Strix controllers last 3x longer than standard switches. The LRWT-156 with double-wall SS 304 protects guests from burns while delivering commercial-grade reliability."</li>
<li><strong>For Procurement:</strong> "Kettles are high-turnover items. Our competitive pricing and PAN India delivery means you'll always have stock when replacements are needed."</li>
</ul>

<h3 style="color:#047857;margin-top:24px">FAQ</h3>
<ul>
<li><strong>Q: What is the difference between SS 201 and SS 304?</strong> — A: SS 304 is a higher-grade stainless steel with superior corrosion resistance. For coastal hotels or areas with hard water, SS 304 kettles last significantly longer.</li>
<li><strong>Q: Do you offer bulk replacement pricing?</strong> — A: Yes, annual replacement contracts are available at discounted rates with scheduled deliveries.</li>
<li><strong>Q: Are the trays compatible with all kettle models?</strong> — A: All three tray models are designed to accommodate any LAXREE kettle. The LRWT-162 large tray also fits additional TCM accessories.</li>
</ul>

<h3 style="color:#047857;margin-top:24px">Cross-Selling Suggestions</h3>
<p>Every kettle order is an opportunity to sell the complete in-room beverage station: pair with <strong>TCM Trays</strong> and <strong>Mini Bars</strong> for the full refreshment setup. For new builds, recommend kettles alongside <strong>Hair Dryers</strong> and <strong>Magnifying Mirrors</strong> for a complete bathroom vanity package.</p>
</div>`,
      contentType: 'video',
      contentUrl: 'https://www.youtube.com/embed/4aBfypkw-oY',
      order: 8,
      duration: 15,
      courseId: productAcademyCourse.id,
      productCategoryId: categories[3].id,
    }
  })

  // Module 9: Hair Dryers, Mirrors & Dispensers
  await db.module.create({
    data: {
      title: 'Hair Dryers, Mirrors & Dispensers',
      description: 'Guide to LAXREE hair dryers, magnifying mirrors, and soap dispensers',
      content: `<div style="font-family:system-ui,sans-serif;line-height:1.7;color:#1a1a1a">
<img src="https://sfile.chatglm.cn/images-ppt/683a45ce407a.jpg" alt="LAXREE Hair Dryers, Mirrors & Dispensers" style="width:100%;max-width:600px;border-radius:12px;margin:16px 0;box-shadow:0 4px 12px rgba(0,0,0,0.1)" />
<h2 style="color:#065f46;border-bottom:2px solid #059669;padding-bottom:8px">Hair Dryers, Magnifying Mirrors & Soap Dispensers</h2>
<p>Bathroom accessories are often overlooked in hotel procurement, yet they directly impact guest satisfaction scores and online reviews. A malfunctioning hair dryer or a cheap soap dispenser can result in negative TripAdvisor comments that affect bookings. LAXREE's bathroom product range is designed specifically for hospitality use — durable, easy to maintain, and available in finishes that complement any bathroom design. This module covers three essential bathroom product categories that every hotel needs.</p>

<h3 style="color:#047857;margin-top:24px">Hair Dryer Range</h3>
<p>LAXREE offers three hair dryer models designed for different hotel segments and installation preferences:</p>
<table style="width:100%;border-collapse:collapse;margin:10px 0">
<tr style="background:#f0fdf4"><th style="padding:8px;border:1px solid #e5e7eb">Model</th><th style="padding:8px;border:1px solid #e5e7eb">Type</th><th style="padding:8px;border:1px solid #e5e7eb">Power</th><th style="padding:8px;border:1px solid #e5e7eb">Special Feature</th><th style="padding:8px;border:1px solid #e5e7eb">SSP (₹)</th></tr>
<tr><td style="padding:8px;border:1px solid #e5e7eb">LRHD-276</td><td style="padding:8px;border:1px solid #e5e7eb">Wall Mount</td><td style="padding:8px;border:1px solid #e5e7eb">1300W</td><td style="padding:8px;border:1px solid #e5e7eb">Integrated shaver socket</td><td style="padding:8px;border:1px solid #e5e7eb">1,035</td></tr>
<tr><td style="padding:8px;border:1px solid #e5e7eb">LRHD-287</td><td style="padding:8px;border:1px solid #e5e7eb">Wall Mount</td><td style="padding:8px;border:1px solid #e5e7eb">1600W</td><td style="padding:8px;border:1px solid #e5e7eb">Shaver socket, faster drying</td><td style="padding:8px;border:1px solid #e5e7eb">1,277</td></tr>
<tr><td style="padding:8px;border:1px solid #e5e7eb">LRHD-280</td><td style="padding:8px;border:1px solid #e5e7eb">Foldable Handheld</td><td style="padding:8px;border:1px solid #e5e7eb">2100W</td><td style="padding:8px;border:1px solid #e5e7eb">Ionized air, premium feel</td><td style="padding:8px;border:1px solid #e5e7eb">1,744</td></tr>
</table>

<h4>Wall Mount vs Foldable: When to Recommend Each</h4>
<p><strong>Wall Mount (LRHD-276, LRHD-287):</strong> The industry standard for most hotels. Wall mounting prevents theft, saves counter space, and ensures the dryer is always in the same location. The integrated shaver socket is a valuable addition that eliminates the need for a separate shaver adapter — a detail that impresses international guests. The 1300W model is sufficient for short hair, while the 1600W model is better for hotels with a diverse guest profile.</p>
<p><strong>Foldable Handheld (LRHD-280):</strong> The premium choice for luxury hotels and suites. Ionized air technology reduces frizz and static, delivering a salon-quality experience that guests notice and appreciate. The foldable design is compact and portable, ideal for suites where guests expect premium amenities. The 2100W power provides the fastest drying time.</p>

<h3 style="color:#047857;margin-top:24px">Magnifying Mirror Range</h3>
<p>Magnifying mirrors are a bathroom luxury that guests consistently rate highly in satisfaction surveys. LAXREE offers two models:</p>
<table style="width:100%;border-collapse:collapse;margin:10px 0">
<tr style="background:#f0fdf4"><th style="padding:8px;border:1px solid #e5e7eb">Model</th><th style="padding:8px;border:1px solid #e5e7eb">Size</th><th style="padding:8px;border:1px solid #e5e7eb">Features</th><th style="padding:8px;border:1px solid #e5e7eb">Finish Options</th><th style="padding:8px;border:1px solid #e5e7eb">SSP (₹)</th></tr>
<tr><td style="padding:8px;border:1px solid #e5e7eb">LRMM-305S</td><td style="padding:8px;border:1px solid #e5e7eb">8" SS</td><td style="padding:8px;border:1px solid #e5e7eb">3x Magnification, foldable arm</td><td style="padding:8px;border:1px solid #e5e7eb">SS, Rose Gold, Matte Black</td><td style="padding:8px;border:1px solid #e5e7eb">1,061</td></tr>
<tr><td style="padding:8px;border:1px solid #e5e7eb">LRMM-302S</td><td style="padding:8px;border:1px solid #e5e7eb">8" LED SS</td><td style="padding:8px;border:1px solid #e5e7eb">3x Mag, LED ring light, power supply</td><td style="padding:8px;border:1px solid #e5e7eb">SS, Rose Gold, Matte Black</td><td style="padding:8px;border:1px solid #e5e7eb">3,264</td></tr>
</table>
<p>The LED model (LRMM-302S) is a significant upgrade — the built-in ring light provides perfect illumination for makeup application and grooming, especially in bathrooms with dim lighting. The foldable swing arm allows guests to position the mirror at any angle and fold it flat against the wall when not in use. Three finish options (SS, Rose Gold, Matte Black) allow matching with any bathroom hardware.</p>

<h3 style="color:#047857;margin-top:24px">Soap Dispenser Range</h3>
<p>Soap dispensers are transitioning from luxury to standard in modern hotels, driven by sustainability goals (reducing single-use plastic bottles) and cost savings (bulk soap is cheaper than individual bottles). LAXREE offers three models:</p>
<table style="width:100%;border-collapse:collapse;margin:10px 0">
<tr style="background:#f0fdf4"><th style="padding:8px;border:1px solid #e5e7eb">Model</th><th style="padding:8px;border:1px solid #e5e7eb">Type</th><th style="padding:8px;border:1px solid #e5e7eb">Capacity</th><th style="padding:8px;border:1px solid #e5e7eb">Key Feature</th><th style="padding:8px;border:1px solid #e5e7eb">SSP (₹)</th></tr>
<tr><td style="padding:8px;border:1px solid #e5e7eb">LRWA-362</td><td style="padding:8px;border:1px solid #e5e7eb">Manual</td><td style="padding:8px;border:1px solid #e5e7eb">300ml × 1/2</td><td style="padding:8px;border:1px solid #e5e7eb">Simple, reliable, dual-bottle option</td><td style="padding:8px;border:1px solid #e5e7eb">683 / 1,136</td></tr>
<tr><td style="padding:8px;border:1px solid #e5e7eb">LRWA-373</td><td style="padding:8px;border:1px solid #e5e7eb">Automatic</td><td style="padding:8px;border:1px solid #e5e7eb">ABS</td><td style="padding:8px;border:1px solid #e5e7eb">Touchless, hygienic, sensor-operated</td><td style="padding:8px;border:1px solid #e5e7eb">780</td></tr>
<tr><td style="padding:8px;border:1px solid #e5e7eb">LRWA-374</td><td style="padding:8px;border:1px solid #e5e7eb">Automatic</td><td style="padding:8px;border:1px solid #e5e7eb">800ml, 304 SS</td><td style="padding:8px;border:1px solid #e5e7eb">Anti-theft, premium, large capacity</td><td style="padding:8px;border:1px solid #e5e7eb">4,170</td></tr>
</table>
<img src="https://sfile.chatglm.cn/images-ppt/f275fdaffe40.jpg" alt="LAXREE Soap Dispenser" style="width:100%;max-width:400px;border-radius:12px;margin:16px 0;box-shadow:0 4px 12px rgba(0,0,0,0.1)" />

<h3 style="color:#047857;margin-top:24px">Installation Guide</h3>
<ul>
<li><strong>Hair Dryers:</strong> Mount wall bracket at 120cm height near the bathroom mirror. Ensure power outlet is within 50cm. For foldable models, provide a designated holder or drawer.</li>
<li><strong>Mirrors:</strong> Mount at 150cm center height on the wall adjacent to the main bathroom mirror. The foldable arm needs 40cm clearance when extended.</li>
<li><strong>Dispensers:</strong> Mount on shower wall or vanity at 90–100cm height. Use provided wall anchors for secure mounting. Fill with recommended soap formulation.</li>
</ul>

<h3 style="color:#047857;margin-top:24px">Sales Talking Points</h3>
<ul>
<li><strong>For Design-Focused Hotels:</strong> "Our mirrors come in SS, Rose Gold, and Matte Black finishes — perfectly matched to your bathroom hardware."</li>
<li><strong>For Sustainability-Minded Hotels:</strong> "Switching to dispensers eliminates 10,000+ single-use plastic bottles per year for a 100-room property. The LRWA-373 touchless model adds a hygiene premium."</li>
<li><strong>For Premium Hotels:</strong> "The LRHD-280 with ionized air technology gives guests a salon-quality experience — it's the kind of detail that shows up in positive reviews."</li>
</ul>

<h3 style="color:#047857;margin-top:24px">FAQ</h3>
<ul>
<li><strong>Q: Can dispensers use any soap brand?</strong> — A: Yes, all LAXREE dispensers are compatible with standard liquid soap, shampoo, and body wash formulations. Avoid soap with exfoliating particles that can clog the pump.</li>
<li><strong>Q: How often do automatic dispenser sensors need calibration?</strong> — A: Typically once every 6 months. The sensor is factory-calibrated and self-adjusting for normal use.</li>
<li><strong>Q: Are replacement parts available for hair dryers?</strong> — A: Wall-mount brackets, filters, and heating elements are available for immediate dispatch.</li>
</ul>

<h3 style="color:#047857;margin-top:24px">Cross-Selling Suggestions</h3>
<p>Bathroom products naturally bundle together: pair <strong>Hair Dryers</strong> with <strong>Magnifying Mirrors</strong> for the vanity area, add <strong>Dispensers</strong> for the shower, and complete the room package with <strong>Kettles</strong> and <strong>Mini Bars</strong>. For new builds, propose the full LAXREE bathroom and in-room package for single-vendor convenience.</p>
</div>`,
      contentType: 'video',
      contentUrl: 'https://www.youtube.com/embed/97RFXSbjqyk',
      order: 9,
      duration: 15,
      courseId: productAcademyCourse.id,
      productCategoryId: categories[4].id,
    }
  })

  // Module 10: Mattresses, Beds & Housekeeping
  await db.module.create({
    data: {
      title: 'Mattresses, Beds & Housekeeping',
      description: 'Complete guide to LAXREE mattresses, rollaway beds, housekeeping trolleys, and digital signages',
      content: `<div style="font-family:system-ui,sans-serif;line-height:1.7;color:#1a1a1a">
<img src="https://sfile.chatglm.cn/images-ppt/2619e87ae6aa.jpg" alt="LAXREE Mattresses, Beds & Housekeeping" style="width:100%;max-width:600px;border-radius:12px;margin:16px 0;box-shadow:0 4px 12px rgba(0,0,0,0.1)" />
<h2 style="color:#065f46;border-bottom:2px solid #059669;padding-bottom:8px">Mattresses, Rollaway Beds, Housekeeping Trolleys & Digital Signages</h2>
<p>This module covers four distinct but complementary product categories that are essential to hotel operations. Mattresses and rollaway beds are high-ticket items with significant revenue potential per unit. Housekeeping trolleys are operational workhorses that hotels replace every 5–7 years. Digital signages are emerging as a premium differentiator for modern hotels, particularly in lobbies and conference areas. Understanding all four categories allows you to offer complete solutions and maximize order value per client.</p>

<h3 style="color:#047857;margin-top:24px">Mattress Range</h3>
<p>LAXREE mattresses are purpose-built for the hospitality industry, balancing durability for commercial use with comfort that earns positive guest reviews. All models use Bonnell Spring construction with premium upholstery layers designed to maintain support through thousands of guest nights.</p>
<table style="width:100%;border-collapse:collapse;margin:10px 0">
<tr style="background:#f0fdf4"><th style="padding:8px;border:1px solid #e5e7eb">Model</th><th style="padding:8px;border:1px solid #e5e7eb">Thickness</th><th style="padding:8px;border:1px solid #e5e7eb">Construction</th><th style="padding:8px;border:1px solid #e5e7eb">Best For</th><th style="padding:8px;border:1px solid #e5e7eb">SSP (₹)</th></tr>
<tr><td style="padding:8px;border:1px solid #e5e7eb">LRMR-251</td><td style="padding:8px;border:1px solid #e5e7eb">8"</td><td style="padding:8px;border:1px solid #e5e7eb">Bonnell Spring</td><td style="padding:8px;border:1px solid #e5e7eb">Budget & 3-star hotels</td><td style="padding:8px;border:1px solid #e5e7eb">9,750</td></tr>
<tr><td style="padding:8px;border:1px solid #e5e7eb">LRMR-252</td><td style="padding:8px;border:1px solid #e5e7eb">10"</td><td style="padding:8px;border:1px solid #e5e7eb">Bonnell Spring Euro Top</td><td style="padding:8px;border:1px solid #e5e7eb">4-star business hotels</td><td style="padding:8px;border:1px solid #e5e7eb">10,400</td></tr>
<tr><td style="padding:8px;border:1px solid #e5e7eb">LRMR-252</td><td style="padding:8px;border:1px solid #e5e7eb">12"</td><td style="padding:8px;border:1px solid #e5e7eb">Bonnell Spring Euro Top</td><td style="padding:8px;border:1px solid #e5e7eb">5-star luxury hotels</td><td style="padding:8px;border:1px solid #e5e7eb">12,025</td></tr>
</table>
<h4>Why Bonnell Spring for Hotels?</h4>
<p>Bonnell Spring mattresses are the industry standard for commercial hospitality use because they offer the best balance of durability, support, and cost. The interconnected spring system distributes weight evenly and maintains shape over thousands of sleep cycles. The Euro Top variant adds an extra plush comfort layer that significantly improves guest perception of bed quality — a key factor in online reviews and repeat bookings.</p>

<h3 style="color:#047857;margin-top:24px">Rollaway Beds</h3>
<p>Rollaway beds are an operational necessity for hotels that need flexible room capacity. LAXREE offers two models for different usage levels:</p>
<table style="width:100%;border-collapse:collapse;margin:10px 0">
<tr style="background:#f0fdf4"><th style="padding:8px;border:1px solid #e5e7eb">Model</th><th style="padding:8px;border:1px solid #e5e7eb">Mattress</th><th style="padding:8px;border:1px solid #e5e7eb">Frame</th><th style="padding:8px;border:1px solid #e5e7eb">Wheels</th><th style="padding:8px;border:1px solid #e5e7eb">SSP (₹)</th></tr>
<tr><td style="padding:8px;border:1px solid #e5e7eb">LRMR-256</td><td style="padding:8px;border:1px solid #e5e7eb">2" Bonded Foam</td><td style="padding:8px;border:1px solid #e5e7eb">MS Frame</td><td style="padding:8px;border:1px solid #e5e7eb">Standard casters</td><td style="padding:8px;border:1px solid #e5e7eb">6,988</td></tr>
<tr><td style="padding:8px;border:1px solid #e5e7eb">LRMR-257</td><td style="padding:8px;border:1px solid #e5e7eb">6" Pocket Spring</td><td style="padding:8px;border:1px solid #e5e7eb">Heavy-duty</td><td style="padding:8px;border:1px solid #e5e7eb">Lockable wheels</td><td style="padding:8px;border:1px solid #e5e7eb">10,350</td></tr>
</table>
<p>The LRMR-257 with pocket spring mattress and lockable wheels is the premium choice for hotels that frequently deploy rollaway beds. The lockable wheels prevent the bed from moving during use — a safety feature that also protects walls and furniture. The pocket spring mattress provides proper support, unlike thin foam alternatives that lead to guest complaints.</p>

<h3 style="color:#047857;margin-top:24px">Housekeeping Trolleys</h3>
<p>Housekeeping trolleys are the backbone of hotel operations. A good trolley improves housekeeping efficiency, reduces physical strain on staff, and presents a professional appearance in guest corridors. LAXREE offers three models across material types:</p>
<table style="width:100%;border-collapse:collapse;margin:10px 0">
<tr style="background:#f0fdf4"><th style="padding:8px;border:1px solid #e5e7eb">Model</th><th style="padding:8px;border:1px solid #e5e7eb">Material</th><th style="padding:8px;border:1px solid #e5e7eb">Configuration</th><th style="padding:8px;border:1px solid #e5e7eb">SSP (₹)</th></tr>
<tr><td style="padding:8px;border:1px solid #e5e7eb">LRHT-430</td><td style="padding:8px;border:1px solid #e5e7eb">Stainless Steel</td><td style="padding:8px;border:1px solid #e5e7eb">Linen trolley, basic</td><td style="padding:8px;border:1px solid #e5e7eb">6,300</td></tr>
<tr><td style="padding:8px;border:1px solid #e5e7eb">LRHT-427</td><td style="padding:8px;border:1px solid #e5e7eb">MS Powder Coated</td><td style="padding:8px;border:1px solid #e5e7eb">3 shelves, 2 soil bags</td><td style="padding:8px;border:1px solid #e5e7eb">13,050</td></tr>
<tr><td style="padding:8px;border:1px solid #e5e7eb">LRHT-429</td><td style="padding:8px;border:1px solid #e5e7eb">ABS Body</td><td style="padding:8px;border:1px solid #e5e7eb">3 shelves, 2 soil bags, premium</td><td style="padding:8px;border:1px solid #e5e7eb">22,800</td></tr>
</table>
<p>The ABS body model (LRHT-429) is the premium choice for 4-star and 5-star hotels. ABS plastic is lightweight, impact-resistant, easy to clean, and silent in corridors — unlike metal trolleys that can be noisy. The 3-shelf, 2-soil-bag configuration is the standard layout for full-service housekeeping.</p>

<h3 style="color:#047857;margin-top:24px">Digital Signages</h3>
<p>Digital signages are a rapidly growing category as hotels invest in modern guest communication, wayfinding, and advertising. LAXREE offers three display configurations:</p>
<table style="width:100%;border-collapse:collapse;margin:10px 0">
<tr style="background:#f0fdf4"><th style="padding:8px;border:1px solid #e5e7eb">Type</th><th style="padding:8px;border:1px solid #e5e7eb">Size</th><th style="padding:8px;border:1px solid #e5e7eb">Resolution</th><th style="padding:8px;border:1px solid #e5e7eb">OS</th><th style="padding:8px;border:1px solid #e5e7eb">Best Use</th><th style="padding:8px;border:1px solid #e5e7eb">SSP (₹)</th></tr>
<tr><td style="padding:8px;border:1px solid #e5e7eb">Wall Hanging</td><td style="padding:8px;border:1px solid #e5e7eb">32"</td><td style="padding:8px;border:1px solid #e5e7eb">HD</td><td style="padding:8px;border:1px solid #e5e7eb">Android 9.0</td><td style="padding:8px;border:1px solid #e5e7eb">Lobby info, restaurant menus</td><td style="padding:8px;border:1px solid #e5e7eb">19,361</td></tr>
<tr><td style="padding:8px;border:1px solid #e5e7eb">Totem</td><td style="padding:8px;border:1px solid #e5e7eb">43"</td><td style="padding:8px;border:1px solid #e5e7eb">FHD</td><td style="padding:8px;border:1px solid #e5e7eb">Android 9.0</td><td style="padding:8px;border:1px solid #e5e7eb">Wayfinding, event display</td><td style="padding:8px;border:1px solid #e5e7eb">61,876</td></tr>
<tr><td style="padding:8px;border:1px solid #e5e7eb">Totem</td><td style="padding:8px;border:1px solid #e5e7eb">55"</td><td style="padding:8px;border:1px solid #e5e7eb">UHD</td><td style="padding:8px;border:1px solid #e5e7eb">Android 9.0</td><td style="padding:8px;border:1px solid #e5e7eb">Conference, premium branding</td><td style="padding:8px;border:1px solid #e5e7eb">1,09,780</td></tr>
</table>
<p>All LAXREE digital signages run Android 9.0, enabling easy content management through standard digital signage apps. The built-in Android OS eliminates the need for external media players, reducing cost and complexity. Content can be managed remotely via Wi-Fi or Ethernet.</p>

<h3 style="color:#047857;margin-top:24px">Sales Talking Points</h3>
<ul>
<li><strong>For Mattresses:</strong> "A ₹12,025 Euro Top mattress that earns a 5-star review is the best marketing investment you can make. Guest sleep quality directly impacts your online ratings."</li>
<li><strong>For Housekeeping:</strong> "The ABS trolley is silent in corridors — no more guest complaints about noisy housekeeping carts. Lightweight design also reduces staff fatigue."</li>
<li><strong>For Digital Signage:</strong> "Android 9.0 means zero vendor lock-in for content management. Use any signage app you prefer, or we can recommend our preferred partners."</li>
</ul>

<h3 style="color:#047857;margin-top:24px">FAQ</h3>
<ul>
<li><strong>Q: Do mattresses include bed frames?</strong> — A: No, mattresses are sold separately. LAXREE focuses on the mattress product. Bed frames can be sourced through our partner network.</li>
<li><strong>Q: What is the expected mattress lifespan in a hotel?</strong> — A: LAXREE Bonnell Spring mattresses are designed for 5–7 years of commercial use with proper rotation and maintenance.</li>
<li><strong>Q: Can digital signages display live TV?</strong> — A: Yes, with an optional HDMI input module. The standard Android 9.0 OS supports streaming apps, live feeds, and scheduled content.</li>
</ul>

<h3 style="color:#047857;margin-top:24px">Cross-Selling Suggestions</h3>
<p>When selling mattresses, recommend <strong>Rollaway Beds</strong> for flexible capacity. When selling housekeeping trolleys, suggest <strong>Soap Dispensers</strong> for the bathroom amenity program. Digital signages pair well with <strong>RFID Locks</strong> for a complete modernization pitch. For new hotel projects, propose the full LAXREE product suite for unified procurement and service.</p>
</div>`,
      contentType: 'video',
      contentUrl: 'https://www.youtube.com/embed/yVTyegoHfHY',
      order: 10,
      duration: 20,
      courseId: productAcademyCourse.id,
      productCategoryId: categories[7].id,
    }
  })

  // ===== SALES ACADEMY COURSE WITH REAL CONTENT =====
  const salesAcademyCourse = await db.course.create({
    data: {
      title: 'Sales Academy',
      description: 'Sales techniques, methodologies, and LAXREE-specific selling strategies',
      moduleType: 'SALES_ACADEMY',
      learningPathId: salesPath.id,
      duration: 90,
      isRequired: true,
      isActive: true,
    }
  })

  // Sales Module 1: LACE Objection Handling Framework
  await db.module.create({
    data: {
      title: 'The LACE Objection Handling Framework',
      description: 'Master the Listen, Acknowledge, Counter, Engage methodology',
      content: `<h3>The LACE Objection Handling Framework</h3>
<p>At LAXREE, we use the LACE framework to handle objections professionally and effectively:</p>
<h4>L - Listen</h4>
<ul>
<li>Give the client your full attention</li>
<li>Don't interrupt — let them express their concern fully</li>
<li>Take notes on key objection points</li>
<li>Show empathy through body language and verbal cues</li>
</ul>
<h4>A - Acknowledge</h4>
<ul>
<li>Validate their concern — "I understand your concern about pricing..."</li>
<li>Restate the objection to confirm understanding</li>
<li>Never dismiss or minimize the client's concern</li>
<li>Build rapport by showing you're on their side</li>
</ul>
<h4>C - Counter</h4>
<ul>
<li>Provide a fact-based response with evidence</li>
<li>Use LAXREE-specific data: ROI calculations, testimonials, comparisons</li>
<li>Reframe the objection as an opportunity</li>
<li>Address the specific concern, don't deflect</li>
</ul>
<h4>E - Engage</h4>
<ul>
<li>Ask a follow-up question to confirm the objection is resolved</li>
<li>Move the conversation forward toward the next step</li>
<li>"Does that address your concern?" or "Shall we look at the next step?"</li>
<li>Keep momentum in the sales process</li>
</ul>
<h4>Example: Price Objection</h4>
<p><strong>Client:</strong> "Your mini bar is ₹2,000 more expensive than Godrej Qube"</p>
<p><strong>L:</strong> "I hear you — price is important, especially for 150 rooms"</p>
<p><strong>A:</strong> "You're right that the upfront cost is higher. Let me show you the full picture."</p>
<p><strong>C:</strong> "LAXREE saves 5W per unit. Over 100 rooms, that's ₹24,300/year in electricity savings. Plus, zero noise means fewer guest complaints and higher satisfaction scores."</p>
<p><strong>E:</strong> "Would you like to see the full ROI calculation for your property?"</p>`,
      contentType: 'text',
      order: 1,
      duration: 20,
      courseId: salesAcademyCourse.id,
    }
  })

  // Sales Module 2: 6 Buyer Types in Hospitality
  await db.module.create({
    data: {
      title: '6 Buyer Types in Hospitality',
      description: 'Understanding and selling to different hospitality decision-makers',
      content: `<h3>6 Buyer Types in Hospitality</h3>
<p>Each stakeholder in a hotel has different priorities. Here's how to identify and sell to each:</p>
<h4>1. Hotel Owner</h4>
<ul>
<li><strong>Priority:</strong> ROI, cost savings, brand value</li>
<li><strong>Approach:</strong> Lead with total cost of ownership, energy savings, brand reputation</li>
<li><strong>Key Pitch:</strong> "LAXREE saves you ₹X per year while improving guest satisfaction"</li>
</ul>
<h4>2. Procurement Manager</h4>
<ul>
<li><strong>Priority:</strong> Price comparison, vendor reliability, delivery timelines</li>
<li><strong>Approach:</strong> Present SSP clearly, show PAN India delivery capability, highlight single-vendor convenience</li>
<li><strong>Key Pitch:</strong> "One vendor, 15+ categories, nationwide delivery, ISO certified"</li>
</ul>
<h4>3. Architect</h4>
<ul>
<li><strong>Priority:</strong> Design aesthetics, space optimization, specifications</li>
<li><strong>Approach:</strong> Focus on design finishes, dimensions, customization options</li>
<li><strong>Key Pitch:</strong> "Mirror finish absorption bars, custom branding, multiple finish options"</li>
</ul>
<h4>4. Interior Designer</h4>
<ul>
<li><strong>Priority:</strong> Visual appeal, theme matching, premium feel</li>
<li><strong>Approach:</strong> Show product catalogs, finish options, design flexibility</li>
<li><strong>Key Pitch:</strong> "Rose gold, matte black, SS finishes to match any room theme"</li>
</ul>
<h4>5. Hotel Consultant</h4>
<ul>
<li><strong>Priority:</strong> Industry best practices, guest experience, compliance</li>
<li><strong>Approach:</strong> Reference 5-star installations, audit trail features, industry standards</li>
<li><strong>Key Pitch:</strong> "Used by Radisson, Marriott — proven in premium properties"</li>
</ul>
<h4>6. Project Manager</h4>
<ul>
<li><strong>Priority:</strong> Timeline, installation ease, after-sales support</li>
<li><strong>Approach:</strong> Emphasize pre-drilled mounting, local service network, spare parts availability</li>
<li><strong>Key Pitch:</strong> "Quick installation, PAN India service, spare parts within 48 hours"</li>
</ul>`,
      contentType: 'text',
      order: 2,
      duration: 20,
      courseId: salesAcademyCourse.id,
    }
  })

  // Sales Module 3: Value Selling vs Price Selling
  await db.module.create({
    data: {
      title: 'Value Selling vs Price Selling',
      description: 'Master the consultative selling approach that wins deals',
      content: `<h3>Value Selling vs Price Selling</h3>
<p>At LAXREE, we never sell on price alone. We sell on VALUE. Here's the difference:</p>
<h4>Price Selling (What NOT to Do)</h4>
<ul>
<li>Leading with discounts and offers</li>
<li>Competing only on SSP</li>
<li>Rushing to give price cuts</li>
<li>Result: Low margins, commodity perception</li>
</ul>
<h4>Value Selling (What We Do)</h4>
<ul>
<li>Leading with benefits and outcomes</li>
<li>Showing total cost of ownership</li>
<li>Demonstrating long-term savings</li>
<li>Result: Premium positioning, loyal clients</li>
</ul>
<h4>The Consultative Approach</h4>
<ol>
<li><strong>Discover:</strong> Understand the client's pain points, budget, and priorities</li>
<li><strong>Educate:</strong> Share product knowledge, comparisons, and industry insights</li>
<li><strong>Customize:</strong> Recommend the right product mix for their specific needs</li>
<li><strong>Prove:</strong> Use ROI calculations, testimonials, and case studies</li>
<li><strong>Close:</strong> Present a compelling offer that addresses all their needs</li>
</ol>
<h4>Value Calculator Examples</h4>
<ul>
<li><strong>Mini Bar:</strong> "5W savings × 100 rooms × 24hrs × 365 days × ₹9/unit = ₹3,94,200/year saved"</li>
<li><strong>Safe Box:</strong> "Audit trail prevents theft disputes, saving ₹X in insurance claims"</li>
<li><strong>RFID Lock:</strong> "PMS integration saves 30 min/day at reception = ₹X labor savings/year"</li>
</ul>`,
      contentType: 'text',
      order: 3,
      duration: 20,
      courseId: salesAcademyCourse.id,
    }
  })

  // Sales Module 4: Follow-Up System
  await db.module.create({
    data: {
      title: 'Follow-Up System',
      description: 'The 5-touchpoint methodology for consistent follow-up',
      content: `<h3>The 5-Touchpoint Follow-Up System</h3>
<p>80% of sales require 5+ follow-ups, but 44% of salespeople give up after 1. At LAXREE, we follow a structured 5-touchpoint system:</p>
<h4>Touchpoint 1: Same-Day Recap (Day 0)</h4>
<ul>
<li>Send email within 2 hours of meeting</li>
<li>Include: Meeting summary, product recommendations discussed, next steps</li>
<li>Attach: Relevant product brochures, SSP sheets</li>
</ul>
<h4>Touchpoint 2: Value Add (Day 3)</h4>
<ul>
<li>Share something useful: a case study, ROI calculator, industry insight</li>
<li>Show you're thinking about their specific needs</li>
<li>No hard sell — just value</li>
</ul>
<h4>Touchpoint 3: Social Proof (Day 7)</h4>
<ul>
<li>Share a testimonial or reference from a similar property</li>
<li>Connect them with an existing LAXREE client if possible</li>
<li>Highlight specific results achieved</li>
</ul>
<h4>Touchpoint 4: Proposal (Day 14)</h4>
<ul>
<li>Send a formal proposal with customized product mix</li>
<li>Include ROI calculations, competitive comparison, warranty terms</li>
<li>Offer a trial or pilot installation</li>
</ul>
<h4>Touchpoint 5: Decision Push (Day 21)</h4>
<ul>
<li>Create urgency with a time-limited offer or inventory update</li>
<li>Address any remaining objections</li>
<li>Ask for the order or a specific next step</li>
</ul>
<h4>Key Principles</h4>
<ul>
<li>Every touchpoint must add value, not just ask "any update?"</li>
<li>Use multiple channels: email, phone, WhatsApp, in-person</li>
<li>Track all interactions in CRM</li>
<li>Never go more than 7 days without contact during active deals</li>
</ul>`,
      contentType: 'text',
      order: 4,
      duration: 20,
      courseId: salesAcademyCourse.id,
    }
  })

  // ===== FIELD SALES ACADEMY COURSE WITH REAL CONTENT =====
  const fieldSalesCourse = await db.course.create({
    data: {
      title: 'Field Sales Academy',
      description: 'Field sales operations, visit protocols, and daily best practices',
      moduleType: 'FIELD_SALES',
      learningPathId: fieldSalesPath.id,
      duration: 90,
      isRequired: true,
      isActive: true,
    }
  })

  // Field Sales Module 1: Architect Visit Protocol
  await db.module.create({
    data: {
      title: 'Architect Visit Protocol',
      description: 'Pre-visit checklist, introduction script, and the 70/30 rule',
      content: `<h3>Architect Visit Protocol</h3>
<p>Architects influence 60% of hotel product decisions. Here's how to win them over:</p>
<h4>Pre-Visit Checklist</h4>
<ul>
<li>Research the architect's firm and recent projects</li>
<li>Identify hotel projects they're currently working on</li>
<li>Prepare product samples matching their design aesthetic</li>
<li>Bring the LAXREE Master Catalogue with bookmarked sections</li>
<li>Prepare dimension sheets for key products</li>
<li>Know the SSP range for products likely to be discussed</li>
</ul>
<h4>Introduction Script</h4>
<p>"Good morning [Name], I'm [Your Name] from LAXREE Hospitality Solutions. We're India's leading single-source provider for hotel in-room products. I've been following your work on [specific project], and I believe our product range could complement your design vision. I'd love to show you some options that architects at [reference firm] have been specifying."</p>
<h4>The 70/30 Rule</h4>
<p>In architect meetings, the architect should talk 70% of the time, and you talk 30%.</p>
<ul>
<li><strong>Ask</strong> about their project requirements, design themes, client preferences</li>
<li><strong>Listen</strong> for pain points with current vendors, budget constraints, timeline pressures</li>
<li><strong>Respond</strong> with relevant product solutions, not generic pitches</li>
<li><strong>Never</strong> dominate the conversation with a product monologue</li>
</ul>
<h4>Key Questions to Ask</h4>
<ul>
<li>"What product categories are you currently specifying for this project?"</li>
<li>"Have you encountered any challenges with in-room product specifications?"</li>
<li>"What finish options are you looking for to match the room design?"</li>
<li>"Would custom branding or logo engraving be of interest?"</li>
</ul>`,
      contentType: 'text',
      order: 1,
      duration: 20,
      courseId: fieldSalesCourse.id,
    }
  })

  // Field Sales Module 2: Interior Designer Meeting Guide
  await db.module.create({
    data: {
      title: 'Interior Designer Meeting Guide',
      description: 'Hotel category recommendations and design language for interior designers',
      content: `<h3>Interior Designer Meeting Guide</h3>
<p>Interior designers care about aesthetics, theme matching, and guest experience. Here's how to align with their vision:</p>
<h4>Hotel Category Recommendations</h4>
<h4>5-Star Luxury</h4>
<ul>
<li>Mini Bar: LRMB-131 Absorption (Mirror Finish, silent)</li>
<li>Safe Box: LRSB-209 Orbita (LED light, audit trail)</li>
<li>RFID Lock: LRFD-607 (304 SS, fire rated)</li>
<li>Hair Dryer: LRHD-280 (Foldable, ionized air)</li>
<li>Mirror: LRMM-302S (LED, SS)</li>
</ul>
<h4>4-Star Business</h4>
<ul>
<li>Mini Bar: LRMB-129 Glass Door Thermoelectric</li>
<li>Safe Box: LRSB-214 Laptop (LED display)</li>
<li>RFID Lock: LRFD-609 (Aluminium Alloy, gloss paint)</li>
<li>Hair Dryer: LRHD-287 (Wall mount, 1600W)</li>
<li>Dispenser: LRWA-374 (Automatic, 304 SS)</li>
</ul>
<h4>3-Star & Budget</h4>
<ul>
<li>Mini Bar: LRMB-132 Compressor (affordable)</li>
<li>Safe Box: LRSB-201 Essential</li>
<li>RFID Lock: LRFD-608 (SS Body, 5 Latch)</li>
<li>Kettle: LRWT-143 (0.6L, 1000W)</li>
<li>Hair Dryer: LRHD-276 (Wall mount, 1300W)</li>
</ul>
<h4>Design Language to Use</h4>
<ul>
<li>"Premium finish options including mirror, matte black, and rose gold"</li>
<li>"Seamless integration with your room design"</li>
<li>"Products that enhance, not detract from, your design vision"</li>
<li>"Customizable branding to maintain brand consistency"</li>
</ul>`,
      contentType: 'text',
      order: 2,
      duration: 20,
      courseId: fieldSalesCourse.id,
    }
  })

  // Field Sales Module 3: Site Visit Checklist
  await db.module.create({
    data: {
      title: 'Site Visit Checklist',
      description: 'Before, during, and after visit protocols for field sales',
      content: `<h3>Site Visit Checklist</h3>
<p>A well-prepared site visit dramatically increases your close rate. Follow this protocol:</p>
<h4>Before the Visit</h4>
<ul>
<li>Confirm appointment 24 hours before via WhatsApp/call</li>
<li>Research the property: star rating, room count, current vendor</li>
<li>Prepare product samples matching their segment</li>
<li>Bring: catalogue, SSP sheet, ROI calculator, business cards</li>
<li>Dress professionally — you represent LAXREE's premium positioning</li>
<li>Plan your route and arrive 10 minutes early</li>
</ul>
<h4>During the Visit</h4>
<ul>
<li>Start with a warm introduction and reference any prior communication</li>
<li>Walk through the property — notice current products, their condition</li>
<li>Ask about pain points: "What issues are you facing with current products?"</li>
<li>Demonstrate products that solve their specific problems</li>
<li>Take photos of current installations (with permission)</li>
<li>Take detailed notes on requirements, quantities, timeline</li>
<li>Propose a follow-up with a customized proposal within 48 hours</li>
</ul>
<h4>After the Visit</h4>
<ul>
<li>Send same-day recap email with meeting summary</li>
<li>Log visit details in CRM within 24 hours</li>
<li>Prepare customized proposal within 48 hours</li>
<li>Share relevant case studies or testimonials</li>
<li>Schedule follow-up call for Day 7</li>
<li>Update pipeline status in tracking system</li>
</ul>`,
      contentType: 'text',
      order: 3,
      duration: 15,
      courseId: fieldSalesCourse.id,
    }
  })

  // Field Sales Module 4: Daily Sales SOP
  await db.module.create({
    data: {
      title: 'Daily Sales SOP',
      description: 'Standard operating procedure for daily field sales activities',
      content: `<h3>Daily Sales SOP</h3>
<p>Consistency is the key to sales success. Follow this daily routine:</p>
<h4>Morning Routine (8:30 AM - 9:30 AM)</h4>
<ul>
<li>Review CRM for today's appointments and follow-ups</li>
<li>Prepare product samples and materials for scheduled visits</li>
<li>Check emails and respond to pending inquiries</li>
<li>Set daily targets: minimum 3 new prospect contacts</li>
</ul>
<h4>Active Selling Hours (9:30 AM - 5:30 PM)</h4>
<ul>
<li>Conduct scheduled site visits and meetings</li>
<li>Cold walk-ins at targeted hotels and projects</li>
<li>Follow up on warm leads from previous days</li>
<li>Network with architects, designers, and consultants</li>
</ul>
<h4>Admin & Reporting (5:30 PM - 6:30 PM)</h4>
<ul>
<li>Update CRM with visit details, notes, and outcomes</li>
<li>Send follow-up emails for today's meetings</li>
<li>Prepare proposals and quotations</li>
<li>Submit daily activity report to team leader</li>
</ul>
<h4>Weekly KPIs</h4>
<table style="width:100%;border-collapse:collapse;margin:10px 0">
<tr style="background:#f0fdf4"><th style="padding:8px;border:1px solid #e5e7eb">Metric</th><th style="padding:8px;border:1px solid #e5e7eb">Target</th></tr>
<tr><td style="padding:8px;border:1px solid #e5e7eb">New Prospect Visits</td><td style="padding:8px;border:1px solid #e5e7eb">12-15</td></tr>
<tr><td style="padding:8px;border:1px solid #e5e7eb">Follow-up Calls</td><td style="padding:8px;border:1px solid #e5e7eb">20+</td></tr>
<tr><td style="padding:8px;border:1px solid #e5e7eb">Proposals Sent</td><td style="padding:8px;border:1px solid #e5e7eb">5-8</td></tr>
<tr><td style="padding:8px;border:1px solid #e5e7eb">Meetings with Decision Makers</td><td style="padding:8px;border:1px solid #e5e7eb">8+</td></tr>
<tr><td style="padding:8px;border:1px solid #e5e7eb">Revenue Pipeline Added</td><td style="padding:8px;border:1px solid #e5e7eb">₹5 Lakhs+</td></tr>
</table>
<h4>Lead Sources</h4>
<ul>
<li>Online hotel directories and project listings</li>
<li>Architect and designer referrals</li>
<li>Existing client references</li>
<li>Hotel industry events and exhibitions</li>
<li>LinkedIn and professional networks</li>
<li>Inbound inquiries from LAXREE website</li>
</ul>`,
      contentType: 'text',
      order: 4,
      duration: 15,
      courseId: fieldSalesCourse.id,
    }
  })

  // ===== CREATE REMAINING COURSES WITH REAL CONTENT =====
  const allCourses: any[] = [productAcademyCourse, salesAcademyCourse, fieldSalesCourse]

  // 1. ORIENTATION - Company Orientation
  const orientationCourse = await db.course.create({ data: { title: 'Company Orientation', description: 'LAXREE company overview, mission, and values', moduleType: 'ORIENTATION', learningPathId: onboardingPath.id, duration: 80, isRequired: true, isActive: true } })
  allCourses.push(orientationCourse)

  await db.module.create({ data: { title: 'Welcome to LAXREE', description: 'Company history, founders, growth story, and mission/vision/values', content: `<h3>Welcome to LAXREE Hospitality Solutions</h3>
<p>LAXREE is India's leading B2B hospitality product solutions provider, founded with a mission to simplify hotel procurement. We offer a comprehensive range of hotel supplies under one roof.</p>
<h4>Our Story</h4>
<p>LAXREE was born from a simple observation: hotel procurement is fragmented and inefficient. Hotels were buying mini bars from one vendor, safes from another, locks from a third — each with different delivery timelines, warranty terms, and service quality. LAXREE changed that by becoming the single-source partner for 15+ product categories.</p>
<h4>Our Vision</h4>
<p>"To be India's most trusted single-source hospitality solutions provider"</p>
<h4>Our Mission</h4>
<p>Simplify hotel procurement with curated quality products, excellent service, and fast delivery.</p>
<h4>Core Values</h4>
<ul>
<li><strong>Customer First</strong> — Every decision starts with the client's needs</li>
<li><strong>Quality Excellence</strong> — ISO 9001:2015, ISO 14001:2015, ISO 45001:2018 certified</li>
<li><strong>Innovation</strong> — Continuously improving products and processes</li>
<li><strong>Integrity</strong> — Transparent pricing, honest recommendations</li>
<li><strong>Teamwork</strong> — Collaborative success across departments</li>
</ul>
<h4>Our Growth</h4>
<p>From a single product line to 15+ categories serving premium hotel chains including Radisson, Marriott, and Holiday Inn across India.</p>`, contentType: 'text', order: 1, duration: 20, courseId: orientationCourse.id } })

  await db.module.create({ data: { title: 'LAXREE Product Portfolio Overview', description: 'Overview of all 15+ product categories offered by LAXREE', content: `<h3>LAXREE Product Portfolio</h3>
<p>LAXREE offers 15+ product categories designed specifically for the hospitality industry. Here is a complete overview:</p>
<h4>In-Room Products</h4>
<ul>
<li><strong>Mini Bars</strong> — Compressor, Absorption, Thermoelectric (7 models from ₹6,700)</li>
<li><strong>Safe Boxes</strong> — Essential, Medium, Laptop, Orbita series (6+ models from ₹1,700)</li>
<li><strong>Electric Kettles</strong> — SS 201/304, Strix controller (5 models from ₹488)</li>
<li><strong>TCM Trays</strong> — ABS, PU Leatherette, Leatherette (3 models from ₹706)</li>
<li><strong>Hair Dryers</strong> — Wall mount & foldable (3 models from ₹1,035)</li>
</ul>
<h4>Access & Security</h4>
<ul>
<li><strong>RFID Door Locks</strong> — SS/Alloy, PMS compatible (5 models from ₹3,337)</li>
</ul>
<h4>Bathroom & Amenities</h4>
<ul>
<li><strong>Magnifying Mirrors</strong> — SS, LED options (2 models from ₹1,061)</li>
<li><strong>Soap Dispensers</strong> — Manual & Automatic (3 models from ₹683)</li>
</ul>
<h4>Sleep & Comfort</h4>
<ul>
<li><strong>Mattresses</strong> — Bonnell Spring, Euro Top (3 models from ₹9,750)</li>
<li><strong>Rollaway Beds</strong> — Foam & Pocket Spring (2 models from ₹6,988)</li>
</ul>
<h4>Operations</h4>
<ul>
<li><strong>Housekeeping Trolleys</strong> — SS, MS, ABS (3 models from ₹6,300)</li>
<li><strong>Digital Signages</strong> — Wall & Totem displays (3 models from ₹19,361)</li>
</ul>
<h4>Key Advantage</h4>
<p>All products are available from a single vendor with PAN India delivery, consistent warranty terms, and unified after-sales support.</p>`, contentType: 'text', order: 2, duration: 20, courseId: orientationCourse.id } })

  await db.module.create({ data: { title: 'LAXREE Culture & Work Ethics', description: 'Company culture principles, customer-first approach, and professional standards', content: `<h3>LAXREE Culture & Work Ethics</h3>
<p>At LAXREE, our culture defines who we are and how we work. Every team member embodies these principles daily.</p>
<h4>Customer-First Approach</h4>
<ul>
<li>Every decision starts with the question: "How does this help our client?"</li>
<li>Respond to client inquiries within 2 hours during business hours</li>
<li>Deliver on promises — if we commit to a delivery date, we meet it</li>
<li>Go the extra mile — proactive recommendations, not just order-taking</li>
</ul>
<h4>Professional Integrity</h4>
<ul>
<li>Transparent SSP pricing — no hidden charges or surprise fees</li>
<li>Honest product recommendations — recommend what the client needs, not what's most expensive</li>
<li>Respect competitor products — never disparage, always differentiate on merit</li>
<li>Protect client information — confidentiality is non-negotiable</li>
</ul>
<h4>Teamwork & Collaboration</h4>
<ul>
<li>Share knowledge freely — help colleagues learn products and techniques</li>
<li>Support team goals — individual success follows team success</li>
<li>Communicate proactively — keep team members informed of developments</li>
<li>Celebrate wins together — recognize both individual and team achievements</li>
</ul>
<h4>Continuous Improvement</h4>
<ul>
<li>Learn something new every day — product knowledge, market trends, sales skills</li>
<li>Seek feedback actively — from clients, managers, and peers</li>
<li>Document best practices — share what works with the team</li>
<li>Embrace change — the market evolves, and so must we</li>
</ul>`, contentType: 'text', order: 3, duration: 20, courseId: orientationCourse.id } })

  await db.module.create({ data: { title: 'Your Role at LAXREE', description: 'Understanding your department, reporting structure, KPIs, and growth opportunities', content: `<h3>Your Role at LAXREE</h3>
<p>Understanding your role and how it contributes to LAXREE's success is essential for your career growth.</p>
<h4>Department Structure</h4>
<table style="width:100%;border-collapse:collapse;margin:10px 0">
<tr style="background:#f0fdf4"><th style="padding:8px;border:1px solid #e5e7eb">Department</th><th style="padding:8px;border:1px solid #e5e7eb">Focus Area</th><th style="padding:8px;border:1px solid #e5e7eb">Key Roles</th></tr>
<tr><td style="padding:8px;border:1px solid #e5e7eb">Sales</td><td style="padding:8px;border:1px solid #e5e7eb">Field sales & client acquisition</td><td style="padding:8px;border:1px solid #e5e7eb">Sales Executive, Senior Sales Executive</td></tr>
<tr><td style="padding:8px;border:1px solid #e5e7eb">Inbound Sales</td><td style="padding:8px;border:1px solid #e5e7eb">Phone/email inquiry handling</td><td style="padding:8px;border:1px solid #e5e7eb">Inbound Sales Rep, Senior Inbound Rep</td></tr>
<tr><td style="padding:8px;border:1px solid #e5e7eb">Field Sales</td><td style="padding:8px;border:1px solid #e5e7eb">On-site visits & demos</td><td style="padding:8px;border:1px solid #e5e7eb">Field Sales Executive</td></tr>
<tr><td style="padding:8px;border:1px solid #e5e7eb">Training</td><td style="padding:8px;border:1px solid #e5e7eb">Employee development</td><td style="padding:8px;border:1px solid #e5e7eb">Training Manager</td></tr>
</table>
<h4>Your KPIs</h4>
<ul>
<li><strong>Revenue Targets</strong> — Monthly and quarterly sales goals</li>
<li><strong>Prospect Visits</strong> — 12-15 new prospect visits per week</li>
<li><strong>Follow-up Calls</strong> — 20+ calls per week</li>
<li><strong>Proposals Sent</strong> — 5-8 proposals per week</li>
<li><strong>Conversion Rate</strong> — Track and improve your close rate</li>
</ul>
<h4>Growth Path</h4>
<ul>
<li><strong>Level 1:</strong> Sales Executive / Inbound Rep — Learn products and basic selling</li>
<li><strong>Level 2:</strong> Senior Sales Executive — Handle larger accounts independently</li>
<li><strong>Level 3:</strong> Team Leader — Manage a sales team and mentor juniors</li>
<li><strong>Level 4:</strong> Sales Manager / Training Manager — Strategic planning and team development</li>
</ul>`, contentType: 'text', order: 4, duration: 20, courseId: orientationCourse.id } })

  // 2. TECHNICAL - Technical Learning
  const technicalCourse = await db.course.create({ data: { title: 'Technical Learning', description: 'Technical specifications, installation guides, and troubleshooting', moduleType: 'TECHNICAL', learningPathId: null, duration: 90, isRequired: true, isActive: true } })
  allCourses.push(technicalCourse)

  await db.module.create({ data: { title: 'Installation Best Practices', description: 'Step-by-step installation guide for mini bars, safe boxes, and RFID locks', content: `<h3>Installation Best Practices</h3>
<p>Proper installation is critical for product performance and client satisfaction. Follow these guidelines for each product category.</p>
<h4>Mini Bar Installation</h4>
<ul>
<li>Place on flat, level surface — minimum 10cm clearance from walls</li>
<li>Ensure proper ventilation — do not block rear vent openings</li>
<li>Connect to dedicated power outlet — avoid sharing with other appliances</li>
<li>Allow 2 hours settling time before stocking — compressor models need stabilizing</li>
<li>Set temperature: 5°C for beverages, verify with thermometer after 4 hours</li>
</ul>
<h4>Safe Box Installation</h4>
<ul>
<li>Mark drilling points using the safe as template — ensure carpet/floor is protected</li>
<li>Use appropriate anchors for wall type (concrete, drywall, wood)</li>
<li>Pre-drilled mounting holes at bottom — use all 4 holes for maximum security</li>
<li>Test electronic keypad before final mounting — set master code first</li>
<li>Verify battery compartment has 4× AA batteries installed</li>
</ul>
<h4>RFID Lock Installation</h4>
<ul>
<li>Measure door thickness and mortise depth before installation</li>
<li>Use the provided template for drilling — accuracy is critical</li>
<li>5-latch mortise must align perfectly with door frame strike plate</li>
<li>Test with all card types: guest, master, emergency before handover</li>
<li>Connect PMS interface cable and verify communication with hotel system</li>
</ul>`, contentType: 'text', order: 1, duration: 25, courseId: technicalCourse.id } })

  await db.module.create({ data: { title: 'Product Maintenance & Troubleshooting', description: 'Common issues, warranty procedures, and spare parts management', content: `<h3>Product Maintenance & Troubleshooting</h3>
<p>Knowing how to diagnose and resolve common issues builds client confidence and reduces after-sales costs.</p>
<h4>Mini Bar Common Issues</h4>
<table style="width:100%;border-collapse:collapse;margin:10px 0">
<tr style="background:#f0fdf4"><th style="padding:8px;border:1px solid #e5e7eb">Issue</th><th style="padding:8px;border:1px solid #e5e7eb">Likely Cause</th><th style="padding:8px;border:1px solid #e5e7eb">Solution</th></tr>
<tr><td style="padding:8px;border:1px solid #e5e7eb">Not cooling</td><td style="padding:8px;border:1px solid #e5e7eb">Power supply / thermostat</td><td style="padding:8px;border:1px solid #e5e7eb">Check power, verify thermostat setting, clean vents</td></tr>
<tr><td style="padding:8px;border:1px solid #e5e7eb">Excessive noise</td><td style="padding:8px;border:1px solid #e5e7eb">Uneven surface / compressor</td><td style="padding:8px;border:1px solid #e5e7eb">Level the unit, ensure 10cm clearance, check fan</td></tr>
<tr><td style="padding:8px;border:1px solid #e5e7eb">LED not working</td><td style="padding:8px;border:1px solid #e5e7eb">Door switch / LED module</td><td style="padding:8px;border:1px solid #e5e7eb">Test door switch, replace LED if needed</td></tr>
</table>
<h4>Safe Box Common Issues</h4>
<ul>
<li><strong>Keypad not responding:</strong> Replace batteries (4× AA), check for corrosion</li>
<li><strong>Forgotten code:</strong> Use master override key + master PIN</li>
<li><strong>Auto-lockout triggered:</strong> Wait 5 minutes, use master key to reset</li>
<li><strong>Low battery alert:</strong> Replace within 48 hours — batteries last 1-1.5 years</li>
</ul>
<h4>RFID Lock Common Issues</h4>
<ul>
<li><strong>Card not reading:</strong> Clean the sensor, check card orientation, verify card encoding</li>
<li><strong>PMS disconnection:</strong> Check USB encoder, restart PMS interface, verify cable</li>
<li><strong>Battery drain:</strong> Check for door misalignment causing constant latch motor activation</li>
</ul>
<h4>Warranty & Spare Parts</h4>
<ul>
<li>All LAXREE products carry 1-year warranty from date of installation</li>
<li>Spare parts available within 48 hours via PAN India network</li>
<li>Use only LAXREE-approved spare parts to maintain warranty</li>
</ul>`, contentType: 'text', order: 2, duration: 25, courseId: technicalCourse.id } })

  await db.module.create({ data: { title: 'Technical Specifications Reading Guide', description: 'How to read spec sheets, understand wattage/voltage/dimensions, and explain to clients', content: `<h3>Technical Specifications Reading Guide</h3>
<p>As a LAXREE salesperson, you must be able to read, understand, and explain technical specifications to clients confidently.</p>
<h4>Key Specification Terms</h4>
<ul>
<li><strong>Wattage (W):</strong> Power consumption — lower = more energy efficient. LAXREE mini bars use 55W vs competitors' 60W</li>
<li><strong>Voltage (V):</strong> Operating voltage — all LAXREE products are 220-240V compatible for Indian market</li>
<li><strong>Decibels (dB):</strong> Noise level — absorption = 0dB, thermoelectric ≤25dB, compressor ~40dB</li>
<li><strong>Liters (L):</strong> Capacity — 30L, 40L, 45L for mini bars; volume in mm (W×D×H) for safes</li>
<li><strong>SSP:</strong> Standard Selling Price — the listed retail price before any volume discounts</li>
</ul>
<h4>Reading a Mini Bar Spec Sheet</h4>
<table style="width:100%;border-collapse:collapse;margin:10px 0">
<tr style="background:#f0fdf4"><th style="padding:8px;border:1px solid #e5e7eb">Spec</th><th style="padding:8px;border:1px solid #e5e7eb">What It Means</th><th style="padding:8px;border:1px solid #e5e7eb">Client-Friendly Translation</th></tr>
<tr><td style="padding:8px;border:1px solid #e5e7eb">Cooling: 5-15°C</td><td style="padding:8px;border:1px solid #e5e7eb">Temperature range the unit maintains</td><td style="padding:8px;border:1px solid #e5e7eb">"Perfectly chills beverages at hotel-standard temperatures"</td></tr>
<tr><td style="padding:8px;border:1px solid #e5e7eb">CFC Free</td><td style="padding:8px;border:1px solid #e5e7eb">No chlorofluorocarbons</td><td style="padding:8px;border:1px solid #e5e7eb">"Eco-friendly, no ozone-depleting chemicals"</td></tr>
<tr><td style="padding:8px;border:1px solid #e5e7eb">Reversible Door</td><td style="padding:8px;border:1px solid #e5e7eb">Hinge can be left or right</td><td style="padding:8px;border:1px solid #e5e7eb">"Fits any room layout, left or right opening"</td></tr>
</table>
<h4>Presenting Specs to Clients</h4>
<ul>
<li>Always translate technical specs into client benefits</li>
<li>Use comparison tables to show LAXREE advantages</li>
<li>Focus on what matters most to that specific buyer type</li>
<li>Keep ROI calculations ready — energy savings, labor savings, maintenance costs</li>
</ul>`, contentType: 'text', order: 3, duration: 20, courseId: technicalCourse.id } })

  await db.module.create({ data: { title: 'PMS Integration & Smart Systems', description: 'RFID lock PMS integration, digital signage setup, and smart room technology', content: `<h3>PMS Integration & Smart Systems</h3>
<p>Modern hotels demand smart, connected systems. Understanding PMS integration is key to selling premium LAXREE products.</p>
<h4>What is PMS?</h4>
<p>Property Management System (PMS) is the central software that manages hotel operations — bookings, check-in/out, billing, room management, and guest services. Opera by Oracle is the most widely used PMS in Indian 5-star hotels.</p>
<h4>RFID Lock PMS Integration</h4>
<ul>
<li><strong>How it works:</strong> PMS encodes guest keycard at check-in → card activates RFID lock → lock logs entry/exit → PMS reads audit trail</li>
<li><strong>LRFD-607 & LRFD-606:</strong> Support full PMS interface via driverless USB encoder</li>
<li><strong>Encryption:</strong> All card data is encrypted — no cloning risk</li>
<li><strong>Guest Experience:</strong> One card for room access + elevator + amenities</li>
<li><strong>Management Benefits:</strong> Real-time room status, 1,680 audit records, staff access control</li>
</ul>
<h4>Digital Signage Systems</h4>
<ul>
<li><strong>Android 9.0 OS:</strong> Runs custom hotel content, wayfinding, promotions</li>
<li><strong>Remote Management:</strong> Update content across all displays from one dashboard</li>
<li><strong>Wall Mount 32":</strong> Lobby directories, restaurant menus, event schedules</li>
<li><strong>Totem 43"/55":</strong> Wayfinding, hotel information, brand displays</li>
</ul>
<h4>Selling PMS-Ready Solutions</h4>
<ul>
<li>Emphasize "future-proof" — hotels upgrading PMS want compatible hardware</li>
<li>Highlight audit trail as security and compliance benefit</li>
<li>Position PMS integration as labor-saving (fewer manual key issues, less front desk time)</li>
<li>For budget hotels: LRFD-608/610 work standalone without PMS</li>
</ul>`, contentType: 'text', order: 4, duration: 20, courseId: technicalCourse.id } })

  // 3. HOSPITALITY - Hospitality Industry Academy
  const hospitalityCourse = await db.course.create({ data: { title: 'Hospitality Industry Academy', description: 'Hospitality sector knowledge for effective selling', moduleType: 'HOSPITALITY', learningPathId: null, duration: 90, isRequired: true, isActive: true } })
  allCourses.push(hospitalityCourse)

  await db.module.create({ data: { title: 'Understanding the Indian Hotel Industry', description: 'Market size, growth trends, hotel categories, and key players', content: `<h3>The Indian Hotel Industry</h3>
<p>India's hospitality sector is one of the fastest-growing in the world, creating massive opportunity for LAXREE.</p>
<h4>Market Overview</h4>
<ul>
<li><strong>Market Size:</strong> ₹4.5 lakh crore+ hospitality industry</li>
<li><strong>Growth Rate:</strong> 10-12% CAGR in hotel segment</li>
<li><strong>Room Inventory:</strong> 5+ lakh branded hotel rooms across India</li>
<li><strong>New Supply:</strong> 25,000+ new rooms added annually</li>
</ul>
<h4>Hotel Categories</h4>
<table style="width:100%;border-collapse:collapse;margin:10px 0">
<tr style="background:#f0fdf4"><th style="padding:8px;border:1px solid #e5e7eb">Category</th><th style="padding:8px;border:1px solid #e5e7eb">Typical Rate</th><th style="padding:8px;border:1px solid #e5e7eb">Products Needed</th><th style="padding:8px;border:1px solid #e5e7eb">LAXREE Focus</th></tr>
<tr><td style="padding:8px;border:1px solid #e5e7eb">5-Star Luxury</td><td style="padding:8px;border:1px solid #e5e7eb">₹15,000+/night</td><td style="padding:8px;border:1px solid #e5e7eb">Full product range</td><td style="padding:8px;border:1px solid #e5e7eb">Orbita safes, Absorption bars, LRFD-607</td></tr>
<tr><td style="padding:8px;border:1px solid #e5e7eb">4-Star Business</td><td style="padding:8px;border:1px solid #e5e7eb">₹6,000-15,000</td><td style="padding:8px;border:1px solid #e5e7eb">Mid-premium products</td><td style="padding:8px;border:1px solid #e5e7eb">Laptop safes, TE bars, LRFD-609</td></tr>
<tr><td style="padding:8px;border:1px solid #e5e7eb">3-Star/Budget</td><td style="padding:8px;border:1px solid #e5e7eb">₹2,000-6,000</td><td style="padding:8px;border:1px solid #e5e7eb">Essential products</td><td style="padding:8px;border:1px solid #e5e7eb">Essential safes, Compressor bars, LRFD-608</td></tr>
</table>
<h4>Key Industry Players</h4>
<ul>
<li><strong>Indian Chains:</strong> Taj, Oberoi, ITC, Leela, Lemon Tree, Ginger</li>
<li><strong>International Chains:</strong> Marriott, Radisson, IHG, Hilton, Accor, Hyatt</li>
<li><strong>Growing Segments:</strong> Serviced apartments, boutique hotels, wellness resorts</li>
</ul>`, contentType: 'text', order: 1, duration: 25, courseId: hospitalityCourse.id } })

  await db.module.create({ data: { title: 'Hotel Decision-Making Process', description: 'How hotels buy: procurement cycle, budget allocation, and decision committee roles', content: `<h3>How Hotels Buy</h3>
<p>Understanding the hotel procurement process helps you navigate sales cycles effectively and reach the right decision-makers.</p>
<h4>Procurement Cycle</h4>
<ol>
<li><strong>Need Identification</strong> — New build, renovation, or replacement (3-6 months before purchase)</li>
<li><strong>Specification</strong> — Architect/designer specifies products (2-4 months before)</li>
<li><strong>Vendor Shortlisting</strong> — Procurement collects quotes from 3-5 vendors</li>
<li><strong>Evaluation</strong> — Committee reviews features, price, delivery, references</li>
<li><strong>Negotiation</strong> — Price, warranty, payment terms discussed</li>
<li><strong>Order Placement</strong> — Purchase order issued</li>
<li><strong>Delivery & Installation</strong> — Timeline-critical phase</li>
</ol>
<h4>Budget Allocation</h4>
<ul>
<li><strong>New Build:</strong> In-room products typically 2-3% of total project cost</li>
<li><strong>Renovation:</strong> Separate budget allocated per room category</li>
<li><strong>Replacement:</strong> Often from operations/maintenance budget (faster approval)</li>
</ul>
<h4>Decision Committee</h4>
<ul>
<li><strong>Hotel Owner:</strong> Final approval on major purchases, focuses on ROI</li>
<li><strong>General Manager:</strong> Operational needs, guest satisfaction impact</li>
<li><strong>Procurement Manager:</strong> Price comparison, vendor evaluation, compliance</li>
<li><strong>Architect/Designer:</strong> Product specifications for new builds/renovations</li>
<li><strong>Maintenance Manager:</strong> Installation feasibility, after-sales service needs</li>
</ul>`, contentType: 'text', order: 2, duration: 20, courseId: hospitalityCourse.id } })

  await db.module.create({ data: { title: 'Hotel Star Ratings & Product Requirements', description: 'What different star ratings require for in-room products and compliance standards', content: `<h3>Star Ratings & Product Requirements</h3>
<p>Each hotel star rating has specific product requirements. Understanding these helps you recommend the right LAXREE products.</p>
<h4>5-Star Requirements</h4>
<ul>
<li>Mini bar in every room (silent operation mandatory — absorption or thermoelectric)</li>
<li>Electronic safe with audit trail capability</li>
<li>RFID/electronic door locks with PMS integration</li>
<li>Premium hair dryer (foldable or wall mount with shaver socket)</li>
<li>LED magnifying mirror in bathroom</li>
<li>Automatic soap dispensers</li>
</ul>
<h4>4-Star Requirements</h4>
<ul>
<li>Mini bar (thermoelectric or absorption preferred)</li>
<li>Electronic safe (minimum medium series)</li>
<li>Electronic door locks (RFID or keypad)</li>
<li>Hair dryer (wall mount)</li>
<li>Soap dispensers (manual or automatic)</li>
</ul>
<h4>3-Star & Budget Requirements</h4>
<ul>
<li>Mini bar optional (compressor acceptable if budget-constrained)</li>
<li>Basic safe (essential series acceptable)</li>
<li>Key card or keypad lock</li>
<li>Kettle with TCM tray</li>
</ul>
<h4>Compliance Standards</h4>
<ul>
<li><strong>Fire Safety:</strong> Locks must be fire-rated for buildings above 15m — LRFD-607 is fire rated</li>
<li><strong>Electrical:</strong> All products must be BIS certified or equivalent</li>
<li><strong>Accessibility:</strong> Safe box height must be accessible from wheelchair (mounting guidelines)</li>
</ul>`, contentType: 'text', order: 3, duration: 20, courseId: hospitalityCourse.id } })

  await db.module.create({ data: { title: 'Trends in Hospitality Technology', description: 'Smart rooms, contactless check-in, sustainability, and energy efficiency trends', content: `<h3>Hospitality Technology Trends</h3>
<p>Stay ahead of industry trends to position LAXREE products as future-ready solutions.</p>
<h4>1. Smart Room Technology</h4>
<ul>
<li>IoT-connected room controls — lighting, AC, curtains via app or voice</li>
<li>Smart mini bars with automatic billing integration</li>
<li>Occupancy sensors for energy management</li>
<li><strong>LAXREE Opportunity:</strong> RFID locks with PMS integration are the foundation of smart rooms</li>
</ul>
<h4>2. Contactless Experience</h4>
<ul>
<li>Mobile check-in/out — guest receives digital key on phone</li>
<li>RFID keycard as single access solution (room + elevator + gym + spa)</li>
<li>QR code-based room service and information</li>
<li><strong>LAXREE Opportunity:</strong> LRFD-607/606 with mobile key capability positions for future</li>
</ul>
<h4>3. Sustainability & Energy Efficiency</h4>
<ul>
<li>Hotels targeting LEED/IGBC green building certification</li>
<li>Energy-saving products reduce operational costs and carbon footprint</li>
<li>LAXREE thermoelectric mini bars use 55W vs 60W — 8% energy savings per room</li>
<li>CFC-free products align with environmental standards</li>
<li><strong>LAXREE Opportunity:</strong> Lead with energy savings ROI in proposals</li>
</ul>
<h4>4. Guest Personalization</h4>
<ul>
<li>Custom room settings remembered per guest profile</li>
<li>Branded in-room products with hotel logo</li>
<li>Premium finishes (rose gold, matte black) for design-conscious properties</li>
<li><strong>LAXREE Opportunity:</strong> Custom branding and premium finish options differentiate us</li>
</ul>`, contentType: 'text', order: 4, duration: 25, courseId: hospitalityCourse.id } })

  // 4. CUSTOMER_DISCOVERY - Customer Discovery Academy
  const customerDiscoveryCourse = await db.course.create({ data: { title: 'Customer Discovery Academy', description: 'Customer identification and needs analysis techniques', moduleType: 'CUSTOMER_DISCOVERY', learningPathId: salesPath.id, duration: 80, isRequired: true, isActive: true } })
  allCourses.push(customerDiscoveryCourse)

  await db.module.create({ data: { title: 'Identifying Potential Hotel Clients', description: 'Lead sources, qualifying criteria, and prospecting strategies', content: `<h3>Identifying Potential Hotel Clients</h3>
<p>Finding the right prospects is the foundation of sales success at LAXREE. Here's how to build a strong pipeline.</p>
<h4>Lead Sources</h4>
<ul>
<li><strong>Online Hotel Directories:</strong> HVS, STR, Hotelivate — track new openings and renovations</li>
<li><strong>Industry Events:</strong> HICSA, FHRAI conventions, regional hotel association meets</li>
<li><strong>Architect & Designer Referrals:</strong> Build relationships with firms specifying hotel products</li>
<li><strong>LinkedIn:</strong> Connect with GMs, procurement managers, and project managers</li>
<li><strong>Existing Client Referrals:</strong> Happy clients refer other properties</li>
<li><strong>Construction Trackers:</strong> New hotel projects in planning/construction phase</li>
</ul>
<h4>Qualifying Criteria (Must Have)</h4>
<ul>
<li>Property with 30+ rooms (smaller properties rarely invest in premium products)</li>
<li>Star rating of 3-star or above</li>
<li>Active procurement need (new build, renovation, or replacement cycle)</li>
<li>Budget allocated or obtainable for in-room products</li>
<li>Decision-maker accessible or identifiable</li>
</ul>
<h4>Pipeline Building</h4>
<ul>
<li>Maintain a minimum pipeline of ₹50 Lakhs at all times</li>
<li>Classify leads: Hot (decision within 30 days), Warm (1-3 months), Cold (3+ months)</li>
<li>Update CRM weekly with new prospects and status changes</li>
<li>Dedicate 1 hour daily to new prospect research</li>
</ul>`, contentType: 'text', order: 1, duration: 20, courseId: customerDiscoveryCourse.id } })

  await db.module.create({ data: { title: 'Needs Analysis Framework', description: 'SPIN selling methodology for uncovering client needs', content: `<h3>Needs Analysis: The SPIN Framework</h3>
<p>SPIN selling helps you uncover client needs through strategic questioning. At LAXREE, we adapt this for hospitality.</p>
<h4>S - Situation Questions</h4>
<p>Understand the client's current setup:</p>
<ul>
<li>"How many rooms does the property have?"</li>
<li>"What products are currently installed in the rooms?"</li>
<li>"When was the last renovation or product upgrade?"</li>
<li>"Who is your current vendor for in-room products?"</li>
</ul>
<h4>P - Problem Questions</h4>
<p>Identify pain points and dissatisfaction:</p>
<ul>
<li>"Are you experiencing any issues with your current mini bars?"</li>
<li>"Have guests complained about noise from the in-room refrigerator?"</li>
<li>"How often do you need to replace safe box batteries?"</li>
<li>"Is the current vendor responsive to after-sales needs?"</li>
</ul>
<h4>I - Implication Questions</h4>
<p>Make the problem feel urgent and costly:</p>
<ul>
<li>"How does guest noise complaint affect your online ratings?"</li>
<li>"What's the cost of replacing safe boxes that break frequently?"</li>
<li>"How much time does your staff spend dealing with lock issues?"</li>
</ul>
<h4>N - Need-Payoff Questions</h4>
<p>Let the client articulate the value of a solution:</p>
<ul>
<li>"If you could eliminate mini bar noise completely, what would that mean for guest satisfaction?"</li>
<li>"Would a single vendor for all products simplify your procurement process?"</li>
<li>"How valuable would an audit trail be for resolving guest disputes about safe box access?"</li>
</ul>`, contentType: 'text', order: 2, duration: 20, courseId: customerDiscoveryCourse.id } })

  await db.module.create({ data: { title: 'Research & Preparation', description: 'Pre-meeting research checklist and understanding the competitive landscape', content: `<h3>Research & Preparation</h3>
<p>Walking into a meeting unprepared is the #1 reason sales calls fail. Here's your preparation playbook.</p>
<h4>Pre-Meeting Research Checklist</h4>
<ul>
<li>✅ Hotel name, star rating, and room count</li>
<li>✅ Current vendor for each product category</li>
<li>✅ Recent news: renovations, expansions, ownership changes</li>
<li>✅ Decision-maker name, role, and background (LinkedIn)</li>
<li>✅ Property photos from Google Maps / TripAdvisor</li>
<li>✅ Competitive installations in same city</li>
<li>✅ Approximate budget range based on star rating</li>
</ul>
<h4>Understanding Current Setup</h4>
<ul>
<li>Call as a "guest" and observe the in-room products</li>
<li>Check TripAdvisor reviews for product-related complaints</li>
<li>Look at the hotel website for room photos showing current products</li>
</ul>
<h4>Competitive Landscape Research</h4>
<ul>
<li>Know which competitor products are likely installed</li>
<li>Prepare specific differentiators for each competitor</li>
<li>Have LAXREE battle card ready for relevant product categories</li>
</ul>
<h4>Materials to Carry</h4>
<ul>
<li>LAXREE Master Catalogue (hard copy)</li>
<li>SSP sheet with relevant product range highlighted</li>
<li>ROI calculator (printed or on tablet)</li>
<li>Product samples (finish swatches, lock demo)</li>
<li>Case studies from similar properties</li>
<li>Business cards (minimum 10)</li>
</ul>`, contentType: 'text', order: 3, duration: 20, courseId: customerDiscoveryCourse.id } })

  await db.module.create({ data: { title: 'Building Client Relationships', description: 'Trust-building, networking strategies, and long-term relationship management', content: `<h3>Building Client Relationships</h3>
<p>In B2B hospitality sales, relationships drive revenue. Here's how to build and maintain strong client bonds.</p>
<h4>First Impression Matters</h4>
<ul>
<li>Dress professionally — you represent LAXREE's premium brand</li>
<li>Be on time (10 minutes early is on time)</li>
<li>Research the person you're meeting — find common ground</li>
<li>Lead with value, not with a product pitch</li>
</ul>
<h4>Trust-Building Strategies</h4>
<ul>
<li><strong>Be a consultant, not a salesperson:</strong> Recommend what's best for the client, even if it's not the most expensive option</li>
<li><strong>Follow through on promises:</strong> If you say you'll send something by Tuesday, send it Monday</li>
<li><strong>Share industry insights:</strong> Be a source of valuable information, not just product specs</li>
<li><strong>Admit when you don't know:</strong> "Let me check and get back to you" beats making something up</li>
</ul>
<h4>LinkedIn Networking</h4>
<ul>
<li>Connect with every person you meet within 24 hours</li>
<li>Share LAXREE product updates and industry articles weekly</li>
<li>Comment on hotel industry posts to stay visible</li>
<li>Use LinkedIn Sales Navigator to find decision-makers at target properties</li>
</ul>
<h4>Long-Term Relationship Management</h4>
<ul>
<li>Quarterly check-in calls with all active clients (even if no pending order)</li>
<li>Send congratulations on hotel awards, expansions, positive reviews</li>
<li>Remember personal details: birthdays, anniversaries, family</li>
<li>Be their first call when they have a problem — even if it's not about LAXREE products</li>
</ul>`, contentType: 'text', order: 4, duration: 20, courseId: customerDiscoveryCourse.id } })

  // 5. NEGOTIATION - Negotiation Academy
  const negotiationCourse = await db.course.create({ data: { title: 'Negotiation Academy', description: 'Advanced negotiation techniques for hospitality sales', moduleType: 'NEGOTIATION', learningPathId: salesPath.id, duration: 80, isRequired: true, isActive: true } })
  allCourses.push(negotiationCourse)

  await db.module.create({ data: { title: 'Negotiation Fundamentals', description: 'BATNA, ZOPA, anchoring, and win-win approach', content: `<h3>Negotiation Fundamentals</h3>
<p>Every sales conversation involves negotiation. Master these fundamentals to protect margins and close more deals.</p>
<h4>Key Concepts</h4>
<ul>
<li><strong>BATNA (Best Alternative To Negotiated Agreement):</strong> Your walk-away option. Always know yours AND the client's. Example: If a client won't agree to SSP, your BATNA might be selling to a competitor property.</li>
<li><strong>ZOPA (Zone Of Possible Agreement):</strong> The range where both parties can agree. LAXREE's ZOPA is typically SSP to SSP minus 15% maximum discount.</li>
<li><strong>Anchoring:</strong> The first number mentioned sets the negotiation range. Always anchor high — quote SSP first, then negotiate down if needed.</li>
</ul>
<h4>Win-Win Approach</h4>
<ul>
<li>Never view negotiation as "winning" — the best deal is where both parties feel good</li>
<li>Trade value, don't just cut price: "I can offer 5% discount IF we can increase the order quantity"</li>
<li>Focus on total value: warranty, delivery, service — not just SSP</li>
<li>Long-term relationships beat short-term margin erosion</li>
</ul>
<h4>Common Mistakes</h4>
<ul>
<li>❌ Discounting too early — always sell value first</li>
<li>❌ Negotiating against yourself — wait for the client to counter</li>
<li>❌ Giving concessions without getting something in return</li>
<li>❌ Revealing your bottom line too soon</li>
</ul>`, contentType: 'text', order: 1, duration: 20, courseId: negotiationCourse.id } })

  await db.module.create({ data: { title: 'Price Negotiation Strategies', description: 'Handling discount requests, value bundling, and volume pricing tiers', content: `<h3>Price Negotiation Strategies</h3>
<p>Price is the most common negotiation point. Here's how to handle it without destroying margins.</p>
<h4>When the Client Asks for a Discount</h4>
<ol>
<li><strong>Acknowledge:</strong> "I understand budget is important..."</li>
<li><strong>Reframe to value:</strong> "Let me show you the total cost of ownership..."</li>
<li><strong>Use ROI:</strong> "The 5W savings per mini bar means ₹3.9L/year for 100 rooms"</li>
<li><strong>Offer alternatives:</strong> "For your budget, I'd recommend the Essential series instead of Orbita"</li>
<li><strong>If you must discount:</strong> Always trade — "I can offer 5% IF you confirm the order this week"</li>
</ol>
<h4>Volume Pricing Tiers</h4>
<table style="width:100%;border-collapse:collapse;margin:10px 0">
<tr style="background:#f0fdf4"><th style="padding:8px;border:1px solid #e5e7eb">Room Count</th><th style="padding:8px;border:1px solid #e5e7eb">Discount</th><th style="padding:8px;border:1px solid #e5e7eb">Condition</th></tr>
<tr><td style="padding:8px;border:1px solid #e5e7eb">30-75 rooms</td><td style="padding:8px;border:1px solid #e5e7eb">Standard SSP</td><td style="padding:8px;border:1px solid #e5e7eb">No discount on first order</td></tr>
<tr><td style="padding:8px;border:1px solid #e5e7eb">75-150 rooms</td><td style="padding:8px;border:1px solid #e5e7eb">Up to 5%</td><td style="padding:8px;border:1px solid #e5e7eb">Full product bundle + confirmed timeline</td></tr>
<tr><td style="padding:8px;border:1px solid #e5e7eb">150-300 rooms</td><td style="padding:8px;border:1px solid #e5e7eb">Up to 8%</td><td style="padding:8px;border:1px solid #e5e7eb">Multi-property or repeat order</td></tr>
<tr><td style="padding:8px;border:1px solid #e5e7eb">300+ rooms</td><td style="padding:8px;border:1px solid #e5e7eb">Up to 12%</td><td style="padding:8px;border:1px solid #e5e7eb">Case-by-case, requires manager approval</td></tr>
</table>
<h4>Value Bundling</h4>
<ul>
<li>Instead of discounting individual products, bundle categories: "Mini bars + safes + kettles = 8% package discount"</li>
<li>Include services in the bundle: installation, training, extended warranty</li>
<li>This protects per-product margin while offering perceived discount</li>
</ul>`, contentType: 'text', order: 2, duration: 20, courseId: negotiationCourse.id } })

  await db.module.create({ data: { title: 'Handling Tough Negotiators', description: 'Deadlock breaking, conditional concessions, and walk-away techniques', content: `<h3>Handling Tough Negotiators</h3>
<p>Some clients will push hard on price, terms, or conditions. Here's how to hold your ground professionally.</p>
<h4>When Negotiations Stall</h4>
<ul>
<li><strong>Pause and summarize:</strong> "Let me make sure I understand your position..."</li>
<li><strong>Identify the real objection:</strong> Is it truly price, or is it budget timing, approval authority, or comparison with another vendor?</li>
<li><strong>Bring in a senior:</strong> Sometimes a manager's involvement signals commitment and authority</li>
<li><strong>Set a deadline:</strong> "This pricing is valid until [date] — after that, we'll need to revisit"</li>
</ul>
<h4>Conditional Concessions</h4>
<p>Never give without getting. Use "IF...THEN" language:</p>
<ul>
<li>"IF you increase the order from 80 to 120 units, THEN I can offer 3% additional discount"</li>
<li>"IF you can confirm the order this week, THEN I can include free installation"</li>
<li>"IF you add kettles to the order, THEN I can bundle the pricing at 7% off"</li>
</ul>
<h4>When to Walk Away</h4>
<ul>
<li>Client demands exceed your maximum discount authority (>12%)</li>
<li>Payment terms are unacceptable (>90 days credit)</li>
<li>Client is clearly using your quote to negotiate with a competitor</li>
<li>The deal is unprofitable after all concessions</li>
</ul>
<h4>Walk-Away Script</h4>
<p>"I appreciate the opportunity, and I want to make this work. At this price point, we wouldn't be able to deliver the quality and service LAXREE is known for. I'd rather be honest now than disappoint you later. Can we revisit the scope to find a solution that works for both of us?"</p>`, contentType: 'text', order: 3, duration: 20, courseId: negotiationCourse.id } })

  await db.module.create({ data: { title: 'Closing Techniques', description: 'Assumptive close, urgency close, summary close, and trial close methods', content: `<h3>Closing Techniques</h3>
<p>Closing is the natural result of effective selling. Use these techniques when the client is ready but hasn't committed yet.</p>
<h4>1. Assumptive Close</h4>
<p>Assume the decision is made and move to next steps:</p>
<ul>
<li>"Shall I schedule the installation for next Monday or Tuesday?"</li>
<li>"Would you prefer the mirror finish or standard finish for the absorption bars?"</li>
</ul>
<h4>2. Summary Close</h4>
<p>Summarize all agreed points, making the "yes" obvious:</p>
<ul>
<li>"So we've agreed on 100 Orbita safes, 150 thermoelectric mini bars, and RFID locks for all rooms. The total investment is ₹X with delivery by [date]. Shall I prepare the order?"</li>
</ul>
<h4>3. Urgency Close</h4>
<p>Create legitimate urgency without pressure:</p>
<ul>
<li>"This pricing is confirmed for this quarter. Next quarter's SSP may be 3-5% higher due to input costs"</li>
<li>"Production lead time is currently 4 weeks. If we confirm now, we can deliver by your deadline"</li>
</ul>
<h4>4. Trial Close</h4>
<p>Test readiness before the final ask:</p>
<ul>
<li>"Does this solution address all your requirements?"</li>
<li>"If we can match this timeline, would you be ready to proceed?"</li>
<li>"Is there anything else you need to see before making a decision?"</li>
</ul>
<h4>5. Alternative Close</h4>
<p>Give two positive options, both leading to a sale:</p>
<ul>
<li>"Would you like to start with the pilot installation of 20 rooms, or go with the full 150-room order?"</li>
<li>"Shall I send the proposal via email or would you prefer I present it in person?"</li>
</ul>`, contentType: 'text', order: 4, duration: 20, courseId: negotiationCourse.id } })

  // 6. COMPETITIVE_INTELLIGENCE - Competitive Intelligence Academy
  const competitiveCourse = await db.course.create({ data: { title: 'Competitive Intelligence Academy', description: 'Market and competitor analysis for LAXREE sales', moduleType: 'COMPETITIVE_INTELLIGENCE', learningPathId: null, duration: 80, isRequired: true, isActive: true } })
  allCourses.push(competitiveCourse)

  await db.module.create({ data: { title: 'Know Your Competitors', description: 'Godrej, Yale, Hafele, and local players — strengths, weaknesses, and positioning', content: `<h3>Know Your Competitors</h3>
<p>Understanding the competitive landscape is essential for positioning LAXREE effectively.</p>
<h4>Major Competitors</h4>
<table style="width:100%;border-collapse:collapse;margin:10px 0">
<tr style="background:#f0fdf4"><th style="padding:8px;border:1px solid #e5e7eb">Competitor</th><th style="padding:8px;border:1px solid #e5e7eb">Strengths</th><th style="padding:8px;border:1px solid #e5e7eb">Weaknesses</th><th style="padding:8px;border:1px solid #e5e7eb">Key Products</th></tr>
<tr><td style="padding:8px;border:1px solid #e5e7eb">Godrej</td><td style="padding:8px;border:1px solid #e5e7eb">Brand trust, wide distribution</td><td style="padding:8px;border:1px solid #e5e7eb">Limited hotel-specific features, no single vendor</td><td style="padding:8px;border:1px solid #e5e7eb">Qube mini bar, safes</td></tr>
<tr><td style="padding:8px;border:1px solid #e5e7eb">Yale</td><td style="padding:8px;border:1px solid #e5e7eb">Global brand, lock expertise</td><td style="padding:8px;border:1px solid #e5e7eb">Premium pricing, limited product range</td><td style="padding:8px;border:1px solid #e5e7eb">Electronic locks, safes</td></tr>
<tr><td style="padding:8px;border:1px solid #e5e7eb">Hafele</td><td style="padding:8px;border:1px solid #e5e7eb">German quality perception, hardware range</td><td style="padding:8px;border:1px solid #e5e7eb">Very premium pricing, slow delivery</td><td style="padding:8px;border:1px solid #e5e7eb">Locks, furniture hardware</td></tr>
<tr><td style="padding:8px;border:1px solid #e5e7eb">Local/Chinese</td><td style="padding:8px;border:1px solid #e5e7eb">Low price</td><td style="padding:8px;border:1px solid #e5e7eb">No warranty, inconsistent quality, no service</td><td style="padding:8px;border:1px solid #e5e7eb">Generic safes, mini bars</td></tr>
</table>
<h4>LAXREE's Differentiation</h4>
<ul>
<li><strong>Single Vendor:</strong> Only LAXREE offers 15+ categories from one source</li>
<li><strong>Hotel-Specific:</strong> Products designed for hospitality, not retail/consumer</li>
<li><strong>PAN India Service:</strong> Local service network, spare parts within 48 hours</li>
<li><strong>Competitive Pricing:</strong> Direct manufacturing eliminates middleman markup</li>
<li><strong>Custom Branding:</strong> Hotel logo on products — rare among competitors</li>
</ul>`, contentType: 'text', order: 1, duration: 20, courseId: competitiveCourse.id } })

  await db.module.create({ data: { title: 'Competitive Battle Cards', description: 'Feature-by-feature comparison tables for LAXREE vs competitors', content: `<h3>Competitive Battle Cards</h3>
<p>Use these battle cards when a client compares LAXREE with a specific competitor.</p>
<h4>Mini Bar: LAXREE vs Godrej Qube</h4>
<table style="width:100%;border-collapse:collapse;margin:10px 0">
<tr style="background:#f0fdf4"><th style="padding:8px;border:1px solid #e5e7eb">Feature</th><th style="padding:8px;border:1px solid #e5e7eb">LAXREE</th><th style="padding:8px;border:1px solid #e5e7eb">Godrej Qube</th></tr>
<tr><td style="padding:8px;border:1px solid #e5e7eb">Cooling @ 30°C</td><td style="padding:8px;border:1px solid #e5e7eb">6°C (solid)</td><td style="padding:8px;border:1px solid #e5e7eb">8-15°C+</td></tr>
<tr><td style="padding:8px;border:1px solid #e5e7eb">Noise</td><td style="padding:8px;border:1px solid #e5e7eb">≤25dB</td><td style="padding:8px;border:1px solid #e5e7eb">Audible hum</td></tr>
<tr><td style="padding:8px;border:1px solid #e5e7eb">LED Interior</td><td style="padding:8px;border:1px solid #e5e7eb">✅</td><td style="padding:8px;border:1px solid #e5e7eb">❌</td></tr>
<tr><td style="padding:8px;border:1px solid #e5e7eb">Door Lock</td><td style="padding:8px;border:1px solid #e5e7eb">✅</td><td style="padding:8px;border:1px solid #e5e7eb">❌</td></tr>
<tr><td style="padding:8px;border:1px solid #e5e7eb">Power</td><td style="padding:8px;border:1px solid #e5e7eb">55W</td><td style="padding:8px;border:1px solid #e5e7eb">60W</td></tr>
</table>
<h4>Safe Box: LAXREE vs Godrej/Yale</h4>
<table style="width:100%;border-collapse:collapse;margin:10px 0">
<tr style="background:#f0fdf4"><th style="padding:8px;border:1px solid #e5e7eb">Feature</th><th style="padding:8px;border:1px solid #e5e7eb">LAXREE</th><th style="padding:8px;border:1px solid #e5e7eb">Godrej/Yale</th></tr>
<tr><td style="padding:8px;border:1px solid #e5e7eb">Auto Lockout</td><td style="padding:8px;border:1px solid #e5e7eb">✅ (4 wrong attempts)</td><td style="padding:8px;border:1px solid #e5e7eb">⚠️ Not standard</td></tr>
<tr><td style="padding:8px;border:1px solid #e5e7eb">Audit Trail</td><td style="padding:8px;border:1px solid #e5e7eb">✅ 100 records</td><td style="padding:8px;border:1px solid #e5e7eb">❌ Many don't offer</td></tr>
<tr><td style="padding:8px;border:1px solid #e5e7eb">LED Interior Light</td><td style="padding:8px;border:1px solid #e5e7eb">✅ Laptop & Orbita</td><td style="padding:8px;border:1px solid #e5e7eb">❌ Rarely available</td></tr>
<tr><td style="padding:8px;border:1px solid #e5e7eb">Custom Branding</td><td style="padding:8px;border:1px solid #e5e7eb">✅ Hotel logo</td><td style="padding:8px;border:1px solid #e5e7eb">❌ Rarely offered</td></tr>
</table>
<h4>How to Use Battle Cards</h4>
<ul>
<li>Don't volunteer comparisons — only use when the client raises a competitor</li>
<li>Be factual and respectful — never disparage competitors</li>
<li>Focus on features that matter to THAT specific client's needs</li>
<li>Always redirect to value: "The comparison shows X, but what matters most for your property is Y"</li>
</ul>`, contentType: 'text', order: 2, duration: 20, courseId: competitiveCourse.id } })

  await db.module.create({ data: { title: 'Market Positioning & Differentiation', description: "LAXREE's unique positioning and single-vendor advantage", content: `<h3>Market Positioning & Differentiation</h3>
<p>LAXREE occupies a unique position in the Indian hospitality market. Understanding and communicating this position is key to winning.</p>
<h4>LAXREE's Market Position</h4>
<p>We are the ONLY company in India that offers:</p>
<ul>
<li>15+ product categories from a single vendor</li>
<li>Hotel-specific products across all categories</li>
<li>PAN India delivery AND service network</li>
<li>ISO-certified quality at competitive pricing</li>
<li>Custom branding options across product range</li>
</ul>
<h4>Positioning Statements by Buyer Type</h4>
<ul>
<li><strong>For Hotel Owners:</strong> "LAXREE is your one-stop partner for all in-room products, saving you procurement time and money while ensuring consistent quality"</li>
<li><strong>For Procurement:</strong> "One PO, one vendor, one warranty, PAN India delivery — LAXREE simplifies your procurement process"</li>
<li><strong>For Architects:</strong> "LAXREE offers design-conscious products with multiple finish options and customization, specified by India's top architects"</li>
<li><strong>For GMs:</strong> "LAXREE products improve guest satisfaction — silent mini bars, secure safes with audit trail, and seamless PMS integration"</li>
</ul>
<h4>Competitive Moat</h4>
<ul>
<li>Single-vendor convenience is extremely hard for competitors to replicate</li>
<li>Most competitors excel in 1-2 categories but can't offer the full range</li>
<li>Our PAN India service network took years to build — new entrants can't match it quickly</li>
</ul>`, contentType: 'text', order: 3, duration: 20, courseId: competitiveCourse.id } })

  await db.module.create({ data: { title: 'Winning Against Competition', description: 'Strategies for each competitor and handling "we already have a vendor" objection', content: `<h3>Winning Against Competition</h3>
<p>Every competitor has weaknesses you can exploit. Here are specific strategies for each.</p>
<h4>Against Godrej</h4>
<ul>
<li><strong>Attack point:</strong> Limited hotel-specific features, no single-vendor range</li>
<li><strong>Strategy:</strong> "Godrej makes great consumer products, but hotels need hospitality-specific solutions. Our mini bars have LED lights, door locks, and digital controllers that Godrej doesn't offer."</li>
</ul>
<h4>Against Yale/Hafele</h4>
<ul>
<li><strong>Attack point:</strong> Premium pricing, limited range beyond locks</li>
<li><strong>Strategy:</strong> "Yale makes excellent locks, but they can't supply your mini bars, safes, kettles, and dispensers. With LAXREE, you get locks PLUS everything else from one vendor."</li>
</ul>
<h4>Against Local/Chinese Imports</h4>
<ul>
<li><strong>Attack point:</strong> No warranty, no service, inconsistent quality</li>
<li><strong>Strategy:</strong> "I understand the price is attractive. But what happens when a safe box fails in Room 302 at 11 PM? With LAXREE, you get 1-year warranty, PAN India service, and spare parts within 48 hours."</li>
</ul>
<h4>"We Already Have a Vendor"</h4>
<ul>
<li><strong>Don't dismiss:</strong> "That's great — who are you working with currently?"</li>
<li><strong>Probe for dissatisfaction:</strong> "Are you happy with the product quality and service?"</li>
<li><strong>Offer a comparison:</strong> "Would it help to see a side-by-side comparison? No obligation."</li>
<li><strong>Find a gap:</strong> "Even if you're happy with their safes, do they also supply mini bars and kettles?"</li>
<li><strong>Pilot approach:</strong> "How about trying LAXREE for one category first? Let us earn your trust."</li>
</ul>`, contentType: 'text', order: 4, duration: 20, courseId: competitiveCourse.id } })

  // 7. INBOUND_SALES - Inbound Sales Academy
  const inboundCourse = await db.course.create({ data: { title: 'Inbound Sales Academy', description: 'Inbound sales handling and conversion strategies', moduleType: 'INBOUND_SALES', learningPathId: inboundPath.id, duration: 80, isRequired: true, isActive: true } })
  allCourses.push(inboundCourse)

  await db.module.create({ data: { title: 'Handling Inbound Inquiries', description: 'Phone and email inquiry protocols, response time SLAs, and first impression', content: `<h3>Handling Inbound Inquiries</h3>
<p>Inbound inquiries are warm leads — they've already shown interest. Your response quality determines whether they become clients.</p>
<h4>Response Time SLAs</h4>
<ul>
<li><strong>Phone calls:</strong> Answer within 3 rings — never let it go to voicemail during business hours</li>
<li><strong>Emails:</strong> Respond within 2 hours during business hours, within 4 hours otherwise</li>
<li><strong>WhatsApp:</strong> Respond within 30 minutes during business hours</li>
<li><strong>Website forms:</strong> Respond within 4 hours maximum</li>
</ul>
<h4>Phone Inquiry Protocol</h4>
<ol>
<li><strong>Greet professionally:</strong> "Thank you for calling LAXREE Hospitality Solutions, this is [Name]. How can I help you?"</li>
<li><strong>Capture details:</strong> Name, property name, star rating, room count, product interest</li>
<li><strong>Ask qualifying questions:</strong> Timeline, budget range, current vendor, decision process</li>
<li><strong>Provide immediate value:</strong> Share relevant product info, SSP range, unique benefits</li>
<li><strong>Set next step:</strong> Schedule a detailed call, send catalog, or arrange site visit</li>
</ol>
<h4>Email Inquiry Template</h4>
<ul>
<li>Subject: "LAXREE Hospitality Solutions — Your Inquiry about [Product]"</li>
<li>Thank them for reaching out</li>
<li>Address their specific need with product recommendations</li>
<li>Include SSP range and key differentiators</li>
<li>Propose a call or meeting with specific time options</li>
<li>Attach relevant catalog pages</li>
</ul>`, contentType: 'text', order: 1, duration: 20, courseId: inboundCourse.id } })

  await db.module.create({ data: { title: 'Qualifying Inbound Leads', description: 'BANT framework for lead qualification and scoring', content: `<h3>Qualifying Inbound Leads with BANT</h3>
<p>Not all inbound leads are equal. Use the BANT framework to prioritize your efforts.</p>
<h4>B - Budget</h4>
<ul>
<li>"What budget has been allocated for this purchase?"</li>
<li>"Is this a budgeted expense or a special approval?"</li>
<li>High-score: Budget confirmed and available → Low-score: No budget yet</li>
</ul>
<h4>A - Authority</h4>
<ul>
<li>"Who will be making the final decision on this purchase?"</li>
<li>"Are you the decision-maker, or is there a committee?"</li>
<li>High-score: Speaking with decision-maker → Low-score: Influencer only</li>
</ul>
<h4>N - Need</h4>
<ul>
<li>"What specific products are you looking for?"</li>
<li>"Is this for a new property, renovation, or replacement?"</li>
<li>High-score: Clear, immediate need → Low-score: Vague or exploratory</li>
</ul>
<h4>T - Timeline</h4>
<ul>
<li>"When do you need the products delivered?"</li>
<li>"Is there a specific deadline — hotel opening, renovation completion?"</li>
<li>High-score: Within 30 days → Low-score: No timeline, "just looking"</li>
</ul>
<h4>Lead Scoring</h4>
<table style="width:100%;border-collapse:collapse;margin:10px 0">
<tr style="background:#f0fdf4"><th style="padding:8px;border:1px solid #e5e7eb">Score</th><th style="padding:8px;border:1px solid #e5e7eb">Priority</th><th style="padding:8px;border:1px solid #e5e7eb">Action</th></tr>
<tr><td style="padding:8px;border:1px solid #e5e7eb">4/4 BANT</td><td style="padding:8px;border:1px solid #e5e7eb">🔥 Hot</td><td style="padding:8px;border:1px solid #e5e7eb">Immediate follow-up, proposal within 24hrs</td></tr>
<tr><td style="padding:8px;border:1px solid #e5e7eb">3/4 BANT</td><td style="padding:8px;border:1px solid #e5e7eb">Warm</td><td style="padding:8px;border:1px solid #e5e7eb">Detailed call within 48hrs, nurture</td></tr>
<tr><td style="padding:8px;border:1px solid #e5e7eb">2/4 BANT</td><td style="padding:8px;border:1px solid #e5e7eb">Cool</td><td style="padding:8px;border:1px solid #e5e7eb">Send catalog, monthly follow-up</td></tr>
<tr><td style="padding:8px;border:1px solid #e5e7eb">1/4 BANT</td><td style="padding:8px;border:1px solid #e5e7eb">Cold</td><td style="padding:8px;border:1px solid #e5e7eb">Add to mailing list, quarterly check-in</td></tr>
</table>`, contentType: 'text', order: 2, duration: 20, courseId: inboundCourse.id } })

  await db.module.create({ data: { title: 'Product Recommendation by Hotel Type', description: 'Mapping LAXREE products to hotel categories and cross-selling strategies', content: `<h3>Product Recommendation by Hotel Type</h3>
<p>Quickly recommending the right products shows expertise and builds trust. Here's your recommendation cheat sheet.</p>
<h4>5-Star Luxury (150+ rooms)</h4>
<ul>
<li>Mini Bar: LRMB-131 (40L Absorption, Mirror Finish, ₹9,800)</li>
<li>Safe Box: LRSB-209 Orbita (Audit trail, LED, ₹5,220)</li>
<li>RFID Lock: LRFD-607 (304 SS, PMS, Fire Rated, ₹8,320)</li>
<li>Hair Dryer: LRHD-280 (Foldable, Ionized, ₹1,744)</li>
<li>Mirror: LRMM-302S (LED, SS, ₹3,264)</li>
<li>Kettle: LRWT-156 (1L, Strix, SS 304, ₹1,400)</li>
<li>Dispenser: LRWA-374 (Automatic, 304 SS, ₹4,170)</li>
</ul>
<h4>4-Star Business (75-150 rooms)</h4>
<ul>
<li>Mini Bar: LRMB-129 (40L Glass Door TE, ₹9,200)</li>
<li>Safe Box: LRSB-214 Laptop (LED display, ₹4,335)</li>
<li>RFID Lock: LRFD-609 (Aluminium Alloy, ₹4,500)</li>
<li>Hair Dryer: LRHD-287 (Wall Mount, ₹1,277)</li>
<li>Kettle: LRWT-150 (0.8L, Strix, ₹1,320)</li>
<li>Dispenser: LRWA-373 (Automatic, ABS, ₹780)</li>
</ul>
<h4>3-Star/Budget (30-75 rooms)</h4>
<ul>
<li>Mini Bar: LRMB-132 (45L Compressor, ₹6,700)</li>
<li>Safe Box: LRSB-201 Essential (₹1,700)</li>
<li>RFID Lock: LRFD-608 (SS Body, ₹3,337)</li>
<li>Kettle: LRWT-143 (0.6L, ₹560)</li>
<li>Hair Dryer: LRHD-276 (Wall Mount, ₹1,035)</li>
</ul>
<h4>Cross-Selling Tips</h4>
<ul>
<li>If they ask about mini bars → also recommend safes and kettles (natural bundle)</li>
<li>If they ask about locks → also recommend safes (security bundle)</li>
<li>Always mention: "Since we offer all categories, we can bundle pricing for additional savings"</li>
</ul>`, contentType: 'text', order: 3, duration: 20, courseId: inboundCourse.id } })

  await db.module.create({ data: { title: 'Converting Inquiries to Orders', description: 'Follow-up sequences, proposal templates, and trial offer strategies', content: `<h3>Converting Inquiries to Orders</h3>
<p>The inquiry is just the beginning. Here's how to systematically convert interest into confirmed orders.</p>
<h4>Follow-Up Sequence</h4>
<ol>
<li><strong>Same Day:</strong> Send thank-you email with product recommendations + catalog</li>
<li><strong>Day 2:</strong> Call to discuss requirements in detail, schedule product demo if applicable</li>
<li><strong>Day 5:</strong> Send customized proposal with product mix, pricing, and ROI calculations</li>
<li><strong>Day 7:</strong> Follow-up call to answer questions, address concerns</li>
<li><strong>Day 10:</strong> Share case study or testimonial from similar property</li>
<li><strong>Day 14:</strong> Final follow-up — ask for the order or clarify next steps</li>
</ol>
<h4>Proposal Template Structure</h4>
<ul>
<li><strong>Cover Page:</strong> LAXREE branding, client name, date, proposal number</li>
<li><strong>Executive Summary:</strong> Client needs, proposed solution, total investment</li>
<li><strong>Product Details:</strong> Model numbers, specifications, quantities, unit price</li>
<li><strong>ROI Analysis:</strong> Energy savings, maintenance savings, guest satisfaction impact</li>
<li><strong>Delivery Timeline:</strong> Manufacturing lead time + installation schedule</li>
<li><strong>Warranty & Support:</strong> 1-year warranty, PAN India service, spare parts commitment</li>
<li><strong>Terms:</strong> Payment schedule, validity period (30 days)</li>
</ul>
<h4>Trial Offer Strategy</h4>
<ul>
<li>"We can install 5 sample rooms so you can evaluate the quality before committing to the full order"</li>
<li>Trial installations typically close at 90%+ conversion rate</li>
<li>Use trial for: New clients, large orders (100+ rooms), skeptical buyers</li>
</ul>`, contentType: 'text', order: 4, duration: 20, courseId: inboundCourse.id } })

  // 8. CERTIFICATION_PREP - Certification Center
  const certificationCourse = await db.course.create({ data: { title: 'Certification Center', description: 'Certification preparation and testing for LAXREE sales professionals', moduleType: 'CERTIFICATION_PREP', learningPathId: null, duration: 80, isRequired: true, isActive: true } })
  allCourses.push(certificationCourse)

  await db.module.create({ data: { title: 'Product Knowledge Certification Prep', description: 'Key product specs to memorize: model numbers, SSPs, and features', content: `<h3>Product Knowledge Certification Prep</h3>
<p>Pass the product knowledge certification by mastering these key specifications.</p>
<h4>Mini Bar — Must Know</h4>
<ul>
<li>3 technologies: Compressor (0-10°C, ~40dB), Absorption (5-12°C, 0dB), Thermoelectric (5-15°C, ≤25dB)</li>
<li>7 models: LRMB-132 to LRMB-131, SSP range ₹6,700 - ₹9,800</li>
<li>Key differentiator: Japanese-grade aluminum heat sink fan + digital controller + LED + door lock</li>
</ul>
<h4>Safe Box — Must Know</h4>
<ul>
<li>4 series: Essential (₹1,700), Medium (₹2,888-3,000), Laptop (₹4,335-4,590), Orbita (₹5,220)</li>
<li>Key features: Auto-lockout after 4 wrong attempts, 100-record audit trail, LED interior light</li>
<li>Battery: 4× AA, 1-1.5 year life, low battery alert</li>
</ul>
<h4>RFID Locks — Must Know</h4>
<ul>
<li>5 models: LRFD-608 to LRFD-606, SSP range ₹3,337 - ₹9,440</li>
<li>LRFD-607: 304 SS, fire rated, moisture proof, 1680 audit records, PMS interface</li>
<li>All models: 5-latch mortise, master override, USB encoder</li>
</ul>
<h4>Kettles & Trays — Must Know</h4>
<ul>
<li>5 kettle models: LRWT-143 to LRWT-156, SSP ₹488 - ₹1,400</li>
<li>Strix controller (LRWT-150, LRWT-156) = premium, longer-lasting auto-shutoff</li>
<li>3 tray models: LRWT-158, 162, 163, SSP ₹706 - ₹1,425</li>
</ul>
<h4>Study Tips</h4>
<ul>
<li>Create flashcards for each model number → SSP → key feature</li>
<li>Practice the "30-second pitch" for each product category</li>
<li>Know the LAXREE vs Godrej Qube comparison by heart</li>
</ul>`, contentType: 'text', order: 1, duration: 20, courseId: certificationCourse.id } })

  await db.module.create({ data: { title: 'Sales Skills Certification Prep', description: 'LACE framework, value selling, buyer types, and objection handling review', content: `<h3>Sales Skills Certification Prep</h3>
<p>Master these sales frameworks to pass the sales skills certification.</p>
<h4>LACE Framework Review</h4>
<ul>
<li><strong>L — Listen:</strong> Full attention, don't interrupt, take notes</li>
<li><strong>A — Acknowledge:</strong> Validate concern, restate, build rapport</li>
<li><strong>C — Counter:</strong> Fact-based response with LAXREE data, reframe objection</li>
<li><strong>E — Engage:</strong> Confirm resolution, move forward, ask for next step</li>
</ul>
<h4>6 Buyer Types Quick Reference</h4>
<ul>
<li>Hotel Owner → ROI focus → Lead with savings</li>
<li>Procurement → Price & delivery → Show SSP + PAN India</li>
<li>Architect → Design specs → Focus on finishes & dimensions</li>
<li>Interior Designer → Visual appeal → Show catalogs & finish options</li>
<li>Hotel Consultant → Best practices → Reference premium installations</li>
<li>Project Manager → Timeline & install → Emphasize quick install + service</li>
</ul>
<h4>Value Selling Key Points</h4>
<ul>
<li>Never sell on price alone — always lead with value and outcomes</li>
<li>5-step consultative approach: Discover → Educate → Customize → Prove → Close</li>
<li>ROI calculators: Mini bar ₹3.9L/year savings, Safe box insurance savings, RFID lock labor savings</li>
</ul>
<h4>Follow-Up System Review</h4>
<ul>
<li>5 touchpoints: Same-Day Recap → Day 3 Value Add → Day 7 Social Proof → Day 14 Proposal → Day 21 Decision Push</li>
<li>Every touchpoint must add value, never just "any update?"</li>
</ul>`, contentType: 'text', order: 2, duration: 20, courseId: certificationCourse.id } })

  await db.module.create({ data: { title: 'Mock Exam Practice', description: 'Practice questions format, time management, and scoring criteria', content: `<h3>Mock Exam Practice</h3>
<p>Prepare for the certification exam with these practice strategies and question formats.</p>
<h4>Exam Format</h4>
<ul>
<li><strong>Questions:</strong> 50 multiple-choice (4 options each)</li>
<li><strong>Time:</strong> 60 minutes</li>
<li><strong>Passing Score:</strong> 70% (35/50 correct)</li>
<li><strong>Categories:</strong> Product Knowledge (60%), Sales Skills (30%), Company Knowledge (10%)</li>
</ul>
<h4>Sample Questions</h4>
<p><strong>Q1:</strong> Which mini bar technology is completely silent (0dB)?</p>
<ul>
<li>A) Compressor ❌</li>
<li>B) Thermoelectric ❌</li>
<li>C) Absorption ✅</li>
<li>D) Hybrid ❌</li>
</ul>
<p><strong>Q2:</strong> In the LACE framework, what does "C" stand for?</p>
<ul>
<li>A) Confirm ❌</li>
<li>B) Counter ✅</li>
<li>C) Clarify ❌</li>
<li>D) Close ❌</li>
</ul>
<h4>Time Management Tips</h4>
<ul>
<li>Spend max 1 minute per question — flag difficult ones and return</li>
<li>Answer easy questions first to build confidence</li>
<li>Product spec questions are straightforward — know your model numbers</li>
<li>Sales scenario questions require thinking — apply frameworks logically</li>
</ul>
<h4>Scoring Criteria</h4>
<ul>
<li>90%+ = Distinction — Ready for advanced certifications</li>
<li>80-89% = Merit — Strong foundation, ready for field</li>
<li>70-79% = Pass — Adequate, focus on weak areas</li>
<li>Below 70% = Fail — Must retake after additional study</li>
</ul>`, contentType: 'text', order: 3, duration: 15, courseId: certificationCourse.id } })

  await db.module.create({ data: { title: 'Field Readiness Assessment', description: 'Site visit readiness, presentation skills, and product demo preparation', content: `<h3>Field Readiness Assessment</h3>
<p>Before you go into the field, ensure you're ready to represent LAXREE professionally.</p>
<h4>Site Visit Readiness Checklist</h4>
<ul>
<li>✅ Know the client's name, property, and current vendor</li>
<li>✅ Have product samples for relevant categories</li>
<li>✅ Carry LAXREE Master Catalogue with sections bookmarked</li>
<li>✅ SSP sheet ready (printed or on tablet)</li>
<li>✅ ROI calculator prepared for their room count</li>
<li>✅ Business cards (minimum 10)</li>
<li>✅ Professional attire — you represent LAXREE's brand</li>
</ul>
<h4>Presentation Skills</h4>
<ul>
<li><strong>Opening:</strong> Introduce yourself, acknowledge their time, state the purpose</li>
<li><strong>Discovery:</strong> Ask before telling — understand their needs first</li>
<li><strong>Presentation:</strong> Show only relevant products, tailor to their star rating</li>
<li><strong>Demonstration:</strong> Let them touch and feel — physical samples sell</li>
<li><strong>Closing:</strong> Summarize agreed points, propose next step with deadline</li>
</ul>
<h4>Product Demo Tips</h4>
<ul>
<li><strong>Mini Bar:</strong> Demonstrate the LED light, door lock, and emphasize silent operation</li>
<li><strong>Safe Box:</strong> Show the keypad, try wrong code to demonstrate auto-lockout, show LED light</li>
<li><strong>RFID Lock:</strong> Swipe different card types, show audit trail on PMS screen</li>
<li><strong>Kettle:</strong> Point out Strix controller in premium models, feel the SS 304 quality</li>
</ul>
<h4>Common Mistakes to Avoid</h4>
<ul>
<li>❌ Talking too much — follow the 70/30 rule (listen 70%)</li>
<li>❌ Presenting everything — only show what's relevant to their needs</li>
<li>❌ Leaving without a clear next step — always set a follow-up date</li>
</ul>`, contentType: 'text', order: 4, duration: 25, courseId: certificationCourse.id } })

  // 9. MOCK_SIMULATOR - Mock Sales Simulator
  const simulatorCourse = await db.course.create({ data: { title: 'Mock Sales Simulator', description: 'Practice sales scenarios with AI-powered simulations', moduleType: 'MOCK_SIMULATOR', learningPathId: null, duration: 60, isRequired: true, isActive: true } })
  allCourses.push(simulatorCourse)

  await db.module.create({ data: { title: 'Simulation Overview & Scoring', description: 'How simulations work and the 4 scoring categories', content: `<h3>Simulation Overview & Scoring</h3>
<p>Mock simulations let you practice real sales scenarios in a safe environment before facing actual clients.</p>
<h4>How Simulations Work</h4>
<ol>
<li><strong>Scenario:</strong> You receive a detailed sales scenario with client profile, property details, and objectives</li>
<li><strong>Questions:</strong> 5 scenario-based questions with 4 options each — choose the best response</li>
<li><strong>Results:</strong> Your performance is scored across 4 categories with detailed feedback</li>
<li><strong>Retry:</strong> Practice as many times as you need — learning is the goal, not perfection</li>
</ol>
<h4>4 Scoring Categories</h4>
<table style="width:100%;border-collapse:collapse;margin:10px 0">
<tr style="background:#f0fdf4"><th style="padding:8px;border:1px solid #e5e7eb">Category</th><th style="padding:8px;border:1px solid #e5e7eb">Weight</th><th style="padding:8px;border:1px solid #e5e7eb">What It Measures</th></tr>
<tr><td style="padding:8px;border:1px solid #e5e7eb">Communication</td><td style="padding:8px;border:1px solid #e5e7eb">25%</td><td style="padding:8px;border:1px solid #e5e7eb">Professionalism, clarity, listening skills</td></tr>
<tr><td style="padding:8px;border:1px solid #e5e7eb">Technical Knowledge</td><td style="padding:8px;border:1px solid #e5e7eb">25%</td><td style="padding:8px;border:1px solid #e5e7eb">Product specs, installation, troubleshooting</td></tr>
<tr><td style="padding:8px;border:1px solid #e5e7eb">Product Knowledge</td><td style="padding:8px;border:1px solid #e5e7eb">25%</td><td style="padding:8px;border:1px solid #e5e7eb">Model recommendations, SSPs, features</td></tr>
<tr><td style="padding:8px;border:1px solid #e5e7eb">Sales Skills</td><td style="padding:8px;border:1px solid #e5e7eb">25%</td><td style="padding:8px;border:1px solid #e5e7eb">Objection handling, closing, value selling</td></tr>
</table>
<h4>Score Interpretation</h4>
<ul>
<li>90%+ = Expert Level — Ready for any client scenario</li>
<li>75-89% = Proficient — Strong skills, minor areas to improve</li>
<li>60-74% = Developing — Need more practice in specific categories</li>
<li>Below 60% = Beginner — Review training modules before retrying</li>
</ul>`, contentType: 'text', order: 1, duration: 15, courseId: simulatorCourse.id } })

  await db.module.create({ data: { title: 'Scenario Preparation', description: 'Pre-simulation research, client profiling, and product selection strategy', content: `<h3>Scenario Preparation</h3>
<p>Preparation before a simulation (or real client meeting) dramatically improves your performance.</p>
<h4>Pre-Simulation Checklist</h4>
<ul>
<li>✅ Read the scenario carefully — understand the client profile and property type</li>
<li>✅ Identify the star rating and recommend products accordingly</li>
<li>✅ Know the key differentiators for recommended products</li>
<li>✅ Prepare for likely objections based on the scenario</li>
<li>✅ Have ROI calculations ready for the property size</li>
</ul>
<h4>Client Profiling</h4>
<ul>
<li><strong>Hotel Owner:</strong> Focus on ROI, total cost of ownership, brand value</li>
<li><strong>Procurement Manager:</strong> Focus on SSP, delivery timeline, single-vendor convenience</li>
<li><strong>GM:</strong> Focus on guest satisfaction, operational efficiency, maintenance</li>
<li><strong>Architect:</strong> Focus on design finishes, dimensions, specifications</li>
</ul>
<h4>Product Selection Strategy</h4>
<ul>
<li>5-Star → Orbita safes, Absorption mini bars, LRFD-607 locks</li>
<li>4-Star → Laptop safes, Thermoelectric mini bars, LRFD-609 locks</li>
<li>3-Star → Essential safes, Compressor mini bars, LRFD-608 locks</li>
<li>Always recommend a bundle — never just one product category</li>
</ul>`, contentType: 'text', order: 2, duration: 15, courseId: simulatorCourse.id } })

  await db.module.create({ data: { title: 'Communication Excellence', description: 'Active listening, professional language, and effective questioning', content: `<h3>Communication Excellence</h3>
<p>Strong communication is the foundation of every successful sales interaction.</p>
<h4>Active Listening</h4>
<ul>
<li>Let the client finish speaking before responding</li>
<li>Paraphrase their concern: "So what I'm hearing is..."</li>
<li>Ask clarifying questions: "Can you tell me more about that?"</li>
<li>Take mental notes of key pain points and requirements</li>
</ul>
<h4>Professional Language</h4>
<table style="width:100%;border-collapse:collapse;margin:10px 0">
<tr style="background:#f0fdf4"><th style="padding:8px;border:1px solid #e5e7eb">Instead of...</th><th style="padding:8px;border:1px solid #e5e7eb">Say...</th></tr>
<tr><td style="padding:8px;border:1px solid #e5e7eb">"Our product is better"</td><td style="padding:8px;border:1px solid #e5e7eb">"LAXREE offers features specifically designed for hotels"</td></tr>
<tr><td style="padding:8px;border:1px solid #e5e7eb">"That's cheap"</td><td style="padding:8px;border:1px solid #e5e7eb">"That's an entry-level option"</td></tr>
<tr><td style="padding:8px;border:1px solid #e5e7eb">"You're wrong"</td><td style="padding:8px;border:1px solid #e5e7eb">"I see it differently — may I share another perspective?"</td></tr>
<tr><td style="padding:8px;border:1px solid #e5e7eb">"I don't know"</td><td style="padding:8px;border:1px solid #e5e7eb">"Great question — let me get the exact details for you"</td></tr>
</table>
<h4>Effective Questions</h4>
<ul>
<li><strong>Open-ended:</strong> "What challenges are you facing with your current setup?"</li>
<li><strong>Probing:</strong> "When you say the quality isn't great, what specifically do you mean?"</li>
<li><strong>Confirming:</strong> "So your main priority is reducing guest noise complaints — is that correct?"</li>
<li><strong>Closing:</strong> "If we can address these concerns, would you be ready to move forward?"</li>
</ul>`, contentType: 'text', order: 3, duration: 15, courseId: simulatorCourse.id } })

  await db.module.create({ data: { title: 'Performance Analysis & Improvement', description: 'Reading your scorecard, identifying weak categories, and improvement strategies', content: `<h3>Performance Analysis & Improvement</h3>
<p>Your simulation scorecard is a roadmap for improvement. Here's how to use it effectively.</p>
<h4>Reading Your Scorecard</h4>
<ul>
<li><strong>Overall Score:</strong> Your weighted average across all 4 categories</li>
<li><strong>Category Breakdown:</strong> Individual scores for Communication, Technical, Product Knowledge, Sales</li>
<li><strong>Question Review:</strong> See which questions you got right/wrong with explanations</li>
<li><strong>AI Feedback:</strong> Personalized recommendations based on your performance pattern</li>
</ul>
<h4>Improvement Strategies by Category</h4>
<ul>
<li><strong>Low Communication Score:</strong> Practice active listening, use professional language, ask more questions before recommending solutions</li>
<li><strong>Low Technical Score:</strong> Review Technical Learning modules, memorize installation steps, study troubleshooting guides</li>
<li><strong>Low Product Knowledge Score:</strong> Review Product Academy modules, create flashcards for model numbers and SSPs, practice product recommendations by hotel type</li>
<li><strong>Low Sales Score:</strong> Review Sales Academy and Negotiation modules, practice LACE framework, study closing techniques</li>
</ul>
<h4>Practice Schedule</h4>
<ul>
<li>Complete at least 2 simulations per week</li>
<li>Review your scorecard after each attempt</li>
<li>Focus next study session on your weakest category</li>
<li>Retake simulations after targeted study — track improvement</li>
<li>Aim for consistent 80%+ scores across all categories</li>
</ul>`, contentType: 'text', order: 4, duration: 15, courseId: simulatorCourse.id } })

  // 10. AI_COACH - AI Sales Coach
  const aiCoachCourse = await db.course.create({ data: { title: 'AI Sales Coach', description: 'AI-powered sales coaching and personalized guidance', moduleType: 'AI_COACH', learningPathId: null, duration: 60, isRequired: false, isActive: true } })
  allCourses.push(aiCoachCourse)

  await db.module.create({ data: { title: 'Using AI Coaching Effectively', description: 'How to interact with the AI coach, ask the right questions, and set goals', content: `<h3>Using AI Coaching Effectively</h3>
<p>The LAXREE AI Coach is your personal sales mentor, available 24/7. Here's how to get the most out of it.</p>
<h4>What the AI Coach Can Do</h4>
<ul>
<li>Answer product questions instantly — model specs, SSPs, features</li>
<li>Role-play client scenarios — practice handling objections</li>
<li>Analyze your sales approach — give feedback on your strategy</li>
<li>Create personalized study plans based on your weak areas</li>
<li>Generate email templates and proposal frameworks</li>
</ul>
<h4>How to Ask Effective Questions</h4>
<ul>
<li><strong>Be specific:</strong> "What's the best LAXREE mini bar for a 5-star coastal resort?" (NOT "tell me about mini bars")</li>
<li><strong>Provide context:</strong> "The client has 150 rooms, 4-star, and currently uses Godrej Qube. How should I position our mini bar?"</li>
<li><strong>Ask for practice:</strong> "Can you role-play as a hotel GM who thinks our safe boxes are too expensive?"</li>
<li><strong>Request feedback:</strong> "Here's my proposed product mix for a 100-room 3-star hotel. Can you review it?"</li>
</ul>
<h4>Setting Goals with AI Coach</h4>
<ul>
<li>Tell the coach your certification target date</li>
<li>Share your latest simulation scores</li>
<li>Ask for a weekly study plan</li>
<li>Request daily practice questions</li>
</ul>`, contentType: 'text', order: 1, duration: 15, courseId: aiCoachCourse.id } })

  await db.module.create({ data: { title: 'Personalized Learning Paths', description: 'AI-driven skill gap analysis and adaptive learning recommendations', content: `<h3>Personalized Learning Paths</h3>
<p>The AI Coach creates learning paths tailored to your specific needs, ensuring efficient skill development.</p>
<h4>How AI Analyzes Your Skills</h4>
<ul>
<li><strong>Quiz Performance:</strong> Which topics you struggle with most</li>
<li><strong>Simulation Scores:</strong> Category-level analysis (Communication, Technical, Product, Sales)</li>
<li><strong>Module Completion:</strong> Which academies you've completed vs. not started</li>
<li><strong>Time Spent:</strong> Where you invest your learning time</li>
</ul>
<h4>Adaptive Learning Flow</h4>
<ol>
<li><strong>Assessment:</strong> AI identifies your current skill level across all categories</li>
<li><strong>Gap Analysis:</strong> Compares your skills to the target level for your role</li>
<li><strong>Priority Ranking:</strong> Ranks skill gaps by impact on sales performance</li>
<li><strong>Module Recommendation:</strong> Suggests specific modules to close each gap</li>
<li><strong>Practice Activities:</strong> Provides targeted practice questions and scenarios</li>
<li><strong>Progress Tracking:</strong> Monitors improvement and adjusts recommendations</li>
</ol>
<h4>Example Learning Path</h4>
<ul>
<li>Week 1-2: Product Academy — Mini Bars & Safe Boxes (priority gap)</li>
<li>Week 3: Sales Academy — LACE Framework (objection handling weak)</li>
<li>Week 4: Competitive Intelligence — Godrej Battle Card (upcoming client uses Godrej)</li>
<li>Week 5: Simulation practice + Certification exam</li>
</ul>`, contentType: 'text', order: 2, duration: 15, courseId: aiCoachCourse.id } })

  await db.module.create({ data: { title: 'Practice Conversations', description: 'Simulated client conversations with AI feedback and improvement tips', content: `<h3>Practice Conversations</h3>
<p>The AI Coach can simulate real client conversations, helping you practice before facing actual clients.</p>
<h4>Types of Practice Conversations</h4>
<ul>
<li><strong>Cold Call Opening:</strong> Practice your first 30 seconds with a new prospect</li>
<li><strong>Objection Handling:</strong> The AI raises common objections — practice your LACE response</li>
<li><strong>Product Presentation:</strong> Present a product to the AI and get feedback on your pitch</li>
<li><strong>Price Negotiation:</strong> Practice holding your ground on SSP while maintaining rapport</li>
<li><strong>Closing Conversation:</strong> Practice different closing techniques</li>
</ul>
<h4>How AI Feedback Works</h4>
<ul>
<li>After each conversation, AI provides scores on: Relevance, Professionalism, Persuasiveness, Product Accuracy</li>
<li>Specific suggestions: "You mentioned the SSP early — try building value first before discussing price"</li>
<li>Alternative phrasing: "Instead of 'our product is better', try 'LAXREE offers features specifically designed for hotels'"</li>
</ul>
<h4>Practice Schedule</h4>
<ul>
<li>Minimum 3 practice conversations per week</li>
<li>Vary the scenario type — don't just practice what you're good at</li>
<li>Revisit scenarios where you scored low</li>
<li>Practice with increasingly difficult client personas</li>
</ul>`, contentType: 'text', order: 3, duration: 15, courseId: aiCoachCourse.id } })

  await db.module.create({ data: { title: 'Career Development with AI', description: 'AI career path suggestions, skill progression, and performance predictions', content: `<h3>Career Development with AI</h3>
<p>The AI Coach doesn't just help you sell better today — it helps you build a long-term career at LAXREE.</p>
<h4>Career Path at LAXREE</h4>
<ul>
<li><strong>Level 1: Sales Executive</strong> — Learn products, basic selling, support team</li>
<li><strong>Level 2: Senior Sales Executive</strong> — Handle major accounts, mentor juniors</li>
<li><strong>Level 3: Team Leader</strong> — Manage a team, strategic planning, coaching</li>
<li><strong>Level 4: Sales Manager</strong> — Department strategy, budget management, hiring</li>
</ul>
<h4>Skills for Each Level</h4>
<table style="width:100%;border-collapse:collapse;margin:10px 0">
<tr style="background:#f0fdf4"><th style="padding:8px;border:1px solid #e5e7eb">Level</th><th style="padding:8px;border:1px solid #e5e7eb">Product Knowledge</th><th style="padding:8px;border:1px solid #e5e7eb">Sales Skills</th><th style="padding:8px;border:1px solid #e5e7eb">Leadership</th></tr>
<tr><td style="padding:8px;border:1px solid #e5e7eb">Level 1</td><td style="padding:8px;border:1px solid #e5e7eb">Core products</td><td style="padding:8px;border:1px solid #e5e7eb">LACE framework</td><td style="padding:8px;border:1px solid #e5e7eb">Self-management</td></tr>
<tr><td style="padding:8px;border:1px solid #e5e7eb">Level 2</td><td style="padding:8px;border:1px solid #e5e7eb">Full portfolio</td><td style="padding:8px;border:1px solid #e5e7eb">Value selling, negotiation</td><td style="padding:8px;border:1px solid #e5e7eb">Peer mentoring</td></tr>
<tr><td style="padding:8px;border:1px solid #e5e7eb">Level 3</td><td style="padding:8px;border:1px solid #e5e7eb">Expert + competitive intel</td><td style="padding:8px;border:1px solid #e5e7eb">Strategic selling</td><td style="padding:8px;border:1px solid #e5e7eb">Team coaching</td></tr>
<tr><td style="padding:8px;border:1px solid #e5e7eb">Level 4</td><td style="padding:8px;border:1px solid #e5e7eb">Industry authority</td><td style="padding:8px;border:1px solid #e5e7eb">Key account strategy</td><td style="padding:8px;border:1px solid #e5e7eb">Department leadership</td></tr>
</table>
<h4>AI Career Guidance</h4>
<ul>
<li>Identifies skills you need for the next level</li>
<li>Tracks your progress against promotion criteria</li>
<li>Recommends specific training modules and simulations</li>
<li>Predicts your readiness timeline based on current progress</li>
</ul>`, contentType: 'text', order: 4, duration: 15, courseId: aiCoachCourse.id } })

  // 11. CROSS_SELLING - Cross Selling Academy
  const crossSellingCourse = await db.course.create({ data: { title: 'Cross Selling Academy', description: 'Learn to pitch complementary products — maximize every client interaction by bundling solutions', moduleType: 'CROSS_SELLING', learningPathId: null, duration: 90, isRequired: true, isActive: true } })
  allCourses.push(crossSellingCourse)

  await db.module.create({ data: { title: 'Introduction to Cross-Selling', description: 'Understanding the art of cross-selling and why it matters in hospitality', content: `<h2>Introduction to Cross-Selling in Hospitality</h2>
<p>Cross-selling is one of the most powerful yet underutilized strategies in hospitality sales. When a hotel client approaches you for a mini bar, they likely need much more — they just don't know it yet.</p>

<h3>What is Cross-Selling?</h3>
<p>Cross-selling is the practice of recommending complementary products to a client who is already buying something. In LAXREE's context, it means when a hotel asks for mini bars, you also recommend safe boxes, kettles, RFID locks, and other in-room amenities.</p>

<h3>Why Cross-Selling Matters</h3>
<ul>
<li><strong>Revenue Multiplier:</strong> A ₹50,000 mini bar order can become a ₹2,00,000+ order with proper cross-selling</li>
<li><strong>Client Convenience:</strong> Hotels prefer a single vendor for all in-room products — it simplifies procurement, billing, and after-sales support</li>
<li><strong>Competitive Advantage:</strong> Very few vendors offer 15+ product categories under one roof like LAXREE</li>
<li><strong>Stronger Relationships:</strong> When you solve multiple problems for a client, you become a trusted partner, not just a vendor</li>
</ul>

<h3>The LAXREE Cross-Selling Advantage</h3>
<p>LAXREE's unique position as a single-source hospitality solutions provider makes cross-selling natural and authentic. We offer:</p>
<ul>
<li>Mini Bars (Absorption, Thermoelectric, Compressor)</li>
<li>Safe Boxes (Essential, Orbita, Elite, Zenith series)</li>
<li>Kettles & TCMs (Stainless Steel, Glass, Travel models)</li>
<li>RFID Door Locks (Mifare, ULTRALITE, NFC)</li>
<li>Hair Dryers (Wall-mounted, Foldable, Professional)</li>
<li>LED Mirrors, Dispensers, Signage, and more</li>
</ul>

<h3>Key Statistics</h3>
<table>
<tr><th>Metric</th><th>Without Cross-Selling</th><th>With Cross-Selling</th></tr>
<tr><td>Average Order Value</td><td>₹50,000 - ₹1,00,000</td><td>₹2,00,000 - ₹5,00,000</td></tr>
<tr><td>Client Retention</td><td>45%</td><td>78%</td></tr>
<tr><td>Repeat Orders</td><td>1.2x per year</td><td>3.5x per year</td></tr>
<tr><td>Relationship Duration</td><td>6-12 months</td><td>2-5 years</td></tr>
</table>`, contentType: 'text', order: 1, duration: 20, courseId: crossSellingCourse.id } })

  await db.module.create({ data: { title: 'Cross-Selling Mini Bar Clients', description: 'When a client wants Mini Bars, how to pitch Safe Box, Kettle, RFID Lock & more', content: `<h2>Cross-Selling from Mini Bar Inquiries</h2>
<p>Mini bar inquiries are the most common entry point for LAXREE sales. When a hotel asks about mini bars, they are furnishing or upgrading rooms — which means they need EVERYTHING that goes in those rooms.</p>

<h3>The Mini Bar Cross-Sell Framework</h3>
<p>Every mini bar inquiry is actually a <strong>complete room solution opportunity</strong>. Here's how to think about it:</p>

<h4>1. Safe Box — The Natural Companion</h4>
<p>Every guest who uses the mini bar also has valuables to secure. Position the safe as the logical next purchase:</p>
<ul>
<li><strong>Pitch:</strong> "Every room with a mini bar needs a safe. Your guests expect both refreshment AND security."</li>
<li><strong>Bundle Name:</strong> "In-Room Comfort + Security Package"</li>
<li><strong>Revenue Impact:</strong> Adds ₹8,000-15,000 per room</li>
<li><strong>Recommended Models:</strong> Essential (3-star), Orbita (4-star), Elite (5-star)</li>
</ul>

<h4>2. Kettle / TCM — The Morning Essential</h4>
<p>After a refreshing drink from the mini bar, guests want morning tea or coffee. The kettle is a must-have:</p>
<ul>
<li><strong>Pitch:</strong> "Morning tea is the first thing a guest reaches for. With our Strix-controlled kettles, they get a perfect cup every time."</li>
<li><strong>Bundle Name:</strong> "Beverage Station Package"</li>
<li><strong>Revenue Impact:</strong> Adds ₹2,500-5,000 per room</li>
<li><strong>Recommended Models:</strong> LRTCM-001 (0.8L travel), LRTCM-004 (1.0L stainless steel)</li>
</ul>

<h4>3. RFID Door Lock — The Smart Upgrade</h4>
<p>If they're upgrading in-room amenities, the door lock is the first thing guests interact with:</p>
<ul>
<li><strong>Pitch:</strong> "Modern guests expect keyless entry. Pair our premium minibars with RFID locks for the complete 'Smart Room' experience."</li>
<li><strong>Bundle Name:</strong> "Smart Room Package"</li>
<li><strong>Revenue Impact:</strong> Adds ₹6,000-12,000 per room</li>
<li><strong>Recommended Models:</strong> Mifare Classic, ULTRALITE C</li>
</ul>

<h3>The Complete Room Solution Bundle</h3>
<p>Instead of selling individual products, offer the complete package:</p>
<table>
<tr><th>Product</th><th>3-Star Hotel</th><th>4-Star Hotel</th><th>5-Star Hotel</th></tr>
<tr><td>Mini Bar</td><td>LRMB-132 Compressor</td><td>LRMB-128 Thermo Glass</td><td>LRMB-131 Absorption Mirror</td></tr>
<tr><td>Safe Box</td><td>Essential Series</td><td>Orbita Series</td><td>Elite Series</td></tr>
<tr><td>Kettle</td><td>LRTCM-001 Travel</td><td>LRTCM-004 SS 1.0L</td><td>LRTCM-006 Glass 0.8L</td></tr>
<tr><td>RFID Lock</td><td>Mifare Classic</td><td>ULTRALITE C</td><td>NFC Premium</td></tr>
<tr><td><strong>Total per Room</strong></td><td><strong>₹22,000-28,000</strong></td><td><strong>₹35,000-45,000</strong></td><td><strong>₹55,000-70,000</strong></td></tr>
</table>

<h3>Conversation Starters</h3>
<ul>
<li>"Since you're looking at minibars for your rooms, have you considered the complete in-room amenity package?"</li>
<li>"Most of our hotel clients bundle minibars with safes — it saves 15-20% compared to buying separately."</li>
<li>"As a single-source provider, we can offer you one warranty, one service contract, and one point of contact for all in-room products."</li>
</ul>`, contentType: 'text', order: 2, duration: 25, courseId: crossSellingCourse.id } })

  await db.module.create({ data: { title: 'Cross-Selling Safe Box Clients', description: 'How to pitch complementary products when a client inquires about Safe Boxes', content: `<h2>Cross-Selling from Safe Box Inquiries</h2>
<p>Safe box inquiries often come from hotels focused on security upgrades. This is your opportunity to position LAXREE as the complete room solutions provider.</p>

<h3>Understanding the Safe Box Client</h3>
<p>A hotel asking about safes is concerned about:</p>
<ul>
<li>Guest security and satisfaction</li>
<li>Compliance with insurance requirements</li>
<li>Modernizing in-room amenities</li>
<li>Reducing front desk complaints about lost valuables</li>
</ul>

<h3>Cross-Sell Opportunities</h3>

<h4>1. Mini Bar — Comfort Meets Security</h4>
<ul>
<li><strong>Pitch:</strong> "Security and comfort go hand in hand. Guests who secure their valuables also want refreshment at their fingertips."</li>
<li><strong>Bundle:</strong> "In-Room Security + Comfort Package"</li>
</ul>

<h4>2. RFID Door Lock — Complete Room Security</h4>
<ul>
<li><strong>Pitch:</strong> "You're upgrading room security with safes. Take it to the next level with keyless entry — digital safe + RFID lock = Total Room Security Suite."</li>
<li><strong>Bundle:</strong> "Total Room Security Suite"</li>
</ul>

<h4>3. Hair Dryer — Executive Room Essentials</h4>
<ul>
<li><strong>Pitch:</strong> "Business travelers need both security and grooming. Our wall-mounted hair dryers complete the executive room setup."</li>
<li><strong>Bundle:</strong> "Executive Room Essentials"</li>
</ul>

<h3>Safe Box Cross-Sell Pricing Strategy</h3>
<table>
<tr><th>Safe Model</th><th>Standalone SSP</th><th>With Mini Bar Bundle</th><th>With RFID Bundle</th><th>Complete Room Bundle</th></tr>
<tr><td>Essential (3★)</td><td>₹8,400</td><td>₹7,500 (-11%)</td><td>₹7,800 (-7%)</td><td>₹6,900 (-18%)</td></tr>
<tr><td>Orbita (4★)</td><td>₹12,000</td><td>₹10,800 (-10%)</td><td>₹11,200 (-7%)</td><td>₹9,600 (-20%)</td></tr>
<tr><td>Elite (5★)</td><td>₹15,000</td><td>₹13,500 (-10%)</td><td>₹14,000 (-7%)</td><td>₹12,000 (-20%)</td></tr>
</table>

<h3>Key Selling Points</h3>
<ul>
<li>Single vendor = single service contract, single warranty, single point of contact</li>
<li>Bundle discounts of 10-20% compared to individual purchases</li>
<li>Consistent brand quality across all in-room products</li>
<li>PAN India delivery and installation support</li>
</ul>`, contentType: 'text', order: 3, duration: 20, courseId: crossSellingCourse.id } })

  await db.module.create({ data: { title: 'Cross-Selling Kettle & TCM Clients', description: 'How to expand a kettle inquiry into a complete room solution', content: `<h2>Cross-Selling from Kettle & TCM Inquiries</h2>
<p>Kettle inquiries may seem small, but they are a gateway to much larger orders. A hotel buying kettles is furnishing rooms — which means they need everything else too.</p>

<h3>The Kettle Cross-Sell Strategy</h3>
<p>Kettles are typically the lowest-priced item in our portfolio, making them an easy first sale. Use this foothold to expand the order.</p>

<h3>Cross-Sell Opportunities</h3>

<h4>1. Mini Bar — The Beverage Station</h4>
<ul>
<li><strong>Pitch:</strong> "Hot beverages and cold beverages go together. Our minibar + kettle combo creates the perfect in-room beverage station."</li>
<li><strong>Bundle:</strong> "Beverage Station Package"</li>
<li><strong>Revenue Multiplier:</strong> 4-5x the kettle order value</li>
</ul>

<h4>2. Hair Dryer — Morning Essentials</h4>
<ul>
<li><strong>Pitch:</strong> "Morning routine = hot drink + hair styling. Our kettles and hair dryers together create the 'Morning Essentials Kit' that every guest appreciates."</li>
<li><strong>Bundle:</strong> "Morning Essentials Kit"</li>
</ul>

<h4>3. Safe Box — Guest Room Essential</h4>
<ul>
<li><strong>Pitch:</strong> "Every guest room needs both comfort and security. Our kettles for comfort, safes for security — the 'Guest Room Essential Bundle.'"</li>
<li><strong>Bundle:</strong> "Guest Room Essential Bundle"</li>
</ul>

<h3>Strategic Approach for Small Orders</h3>
<ol>
<li><strong>Start with the kettle order</strong> — fulfill it quickly and professionally</li>
<li><strong>Follow up within 48 hours</strong> — "I noticed you're furnishing rooms. Can I show you our complete in-room solutions?"</li>
<li><strong>Offer a bundle discount</strong> — "If you add minibars and safes, we can offer 15% off the entire package."</li>
<li><strong>Provide a sample room setup</strong> — "Let me set up one sample room with all our products so your GM can see the complete solution."</li>
</ol>`, contentType: 'text', order: 4, duration: 20, courseId: crossSellingCourse.id } })

  await db.module.create({ data: { title: 'Bundling Strategies & Pricing', description: 'Master the art of creating irresistible product bundles with strategic pricing', content: `<h2>Bundling Strategies & Pricing</h2>
<p>The art of bundling is about creating value that exceeds the sum of individual products. Here's how to create irresistible LAXREE bundles.</p>

<h3>Bundle Types</h3>

<h4>1. The Complete Room Bundle</h4>
<p>Include everything a room needs: Mini Bar + Safe + Kettle + RFID Lock + Hair Dryer</p>
<ul>
<li>Target: New hotel construction or complete renovation</li>
<li>Discount: 15-20% off individual prices</li>
<li>Your commission multiplier: 3-5x vs single product sale</li>
</ul>

<h4>2. The Security Upgrade Bundle</h4>
<p>Safe Box + RFID Door Lock + In-Room Safe</p>
<ul>
<li>Target: Hotels upgrading security systems</li>
<li>Discount: 10-15% off</li>
<li>Emphasis: Compliance, guest safety, insurance</li>
</ul>

<h4>3. The Comfort Package</h4>
<p>Mini Bar + Kettle + Hair Dryer + LED Mirror</p>
<ul>
<li>Target: Hotels upgrading guest experience</li>
<li>Discount: 10-15% off</li>
<li>Emphasis: Guest satisfaction scores, online reviews, repeat bookings</li>
</ul>

<h3>Pricing Psychology</h3>
<ul>
<li><strong>Anchor high:</strong> Show individual prices first, then reveal the bundle price</li>
<li><strong>Show savings:</strong> "You save ₹45,000 on this 50-room order with the bundle"</li>
<li><strong>Per-room pricing:</strong> "Just ₹32,000 per room for the complete setup" sounds more manageable than "₹16,00,000 total"</li>
<li><strong>Value-adds:</strong> Include free installation, extended warranty, or logo branding at no extra cost</li>
</ul>

<h3>Handling "Just Give Me the Best Price"</h3>
<ol>
<li><strong>Don't race to the bottom:</strong> Instead of cutting price, add value</li>
<li><strong>Reframe the conversation:</strong> "Let me show you how the bundle actually costs LESS per room per month than buying individually"</li>
<li><strong>Use ROI calculations:</strong> "This complete room setup pays for itself within 8 months through guest satisfaction and repeat bookings"</li>
<li><strong>Offer tiered bundles:</strong> Good / Better / Best — let the client choose the level, not whether to buy</li>
</ol>

<h3>Bundle Pricing Examples</h3>
<table>
<tr><th>Bundle</th><th>Products</th><th>Individual Total</th><th>Bundle Price</th><th>Savings</th></tr>
<tr><td>Security Suite</td><td>Safe + RFID Lock</td><td>₹20,400</td><td>₹17,800</td><td>13%</td></tr>
<tr><td>Comfort Plus</td><td>Mini Bar + Kettle + Hair Dryer</td><td>₹18,200</td><td>₹15,500</td><td>15%</td></tr>
<tr><td>Complete Room</td><td>Mini Bar + Safe + Kettle + RFID</td><td>₹33,600</td><td>₹27,600</td><td>18%</td></tr>
<tr><td>Luxury Suite</td><td>All 5 products + LED Mirror</td><td>₹42,000</td><td>₹33,600</td><td>20%</td></tr>
</table>`, contentType: 'text', order: 5, duration: 25, courseId: crossSellingCourse.id } })

  // ===== MODULE-SPECIFIC QUESTION BANK & ASSESSMENTS =====
  const questionBanks: any[] = []
  const moduleAssessments: any[] = []

  // Define module-specific questions (5 per module, 18 modules total = 90 questions)
  const moduleQuestions: { moduleTitle: string; moduleType: string; questions: { q: string; a: string; b: string; c: string; d: string; ans: string; cat: string; diff: string; expl: string }[] }[] = [
    // ===== PRODUCT ACADEMY (10 modules × 5 questions = 50 questions) =====
    {
      moduleTitle: 'About LAXREE Hospitality Solutions',
      moduleType: 'PRODUCT_ACADEMY',
      questions: [
        { q: 'What is LAXREE\'s vision statement?', a: 'To be India\'s cheapest hospitality supplier', b: 'To be India\'s most trusted single-source hospitality solutions provider', c: 'To be the largest hospitality exporter', d: 'To dominate the global hotel market', ans: 'B', cat: 'About LAXREE Hospitality Solutions', diff: 'easy', expl: 'LAXREE\'s vision is "To be India\'s most trusted single-source hospitality solutions provider"' },
        { q: 'How many product categories does LAXREE offer under one roof?', a: '5+', b: '8+', c: '15+', d: '20+', ans: 'C', cat: 'About LAXREE Hospitality Solutions', diff: 'easy', expl: 'LAXREE offers 15+ product categories as a single vendor solution' },
        { q: 'Which of the following is NOT a LAXREE USP?', a: 'Single Vendor Convenience', b: 'PAN India Delivery', c: 'Free lifetime warranty', d: 'Customization with hotel logo branding', ans: 'C', cat: 'About LAXREE Hospitality Solutions', diff: 'medium', expl: 'LAXREE offers after-sales support but not free lifetime warranty. USPs include Single Vendor, PAN India Delivery, Customization, Competitive Pricing, Quality Assurance' },
        { q: 'Which market segment does LAXREE NOT specifically serve?', a: '5-Star Luxury Hotels', b: 'Hospital Wards', c: 'Boutique & Heritage Properties', d: 'Serviced Apartments', ans: 'B', cat: 'About LAXREE Hospitality Solutions', diff: 'medium', expl: 'LAXREE serves hotels, resorts, serviced apartments, and boutique properties — not hospital wards' },
        { q: 'Which ISO certifications does LAXREE hold?', a: 'ISO 9001 only', b: 'ISO 9001 and ISO 14001', c: 'ISO 9001:2015, ISO 14001:2015, ISO 45001:2018', d: 'ISO 45001 only', ans: 'C', cat: 'About LAXREE Hospitality Solutions', diff: 'hard', expl: 'LAXREE is ISO 9001:2015 (Quality), ISO 14001:2015 (Environment), and ISO 45001:2018 (OH&S) certified' },
      ]
    },
    {
      moduleTitle: 'Mini Bar Technology Deep Dive',
      moduleType: 'PRODUCT_ACADEMY',
      questions: [
        { q: 'Which mini bar technology operates at 0dB noise level?', a: 'Compressor', b: 'Thermoelectric', c: 'Absorption', d: 'Dual-fan', ans: 'C', cat: 'Mini Bar Technology Deep Dive', diff: 'easy', expl: 'Absorption mini bars have 0dB noise — completely silent operation with no compressor or fan' },
        { q: 'What is the cooling range of thermoelectric mini bars with solid doors?', a: '0-5°C', b: '0-10°C', c: '5-15°C', d: '7-15°C', ans: 'C', cat: 'Mini Bar Technology Deep Dive', diff: 'medium', expl: 'Thermoelectric solid door models cool to 5-15°C, while glass door models cool to 7-15°C' },
        { q: 'How many watts does a LAXREE thermoelectric mini bar consume?', a: '40W', b: '60W', c: '55W', d: '70W', ans: 'C', cat: 'Mini Bar Technology Deep Dive', diff: 'medium', expl: 'LAXREE thermoelectric mini bars consume 55 Watts, which is 5W less than Godrej Qube\'s 60W' },
        { q: 'Why do hotels prefer thermoelectric mini bars over compressor models?', a: 'Lower price', b: 'Silent operation with no moving parts', c: 'Deeper cooling', d: 'Larger capacity', ans: 'B', cat: 'Mini Bar Technology Deep Dive', diff: 'easy', expl: 'Thermoelectric bars are preferred because they are completely silent (≤25dB), energy efficient, and low maintenance' },
        { q: 'What type of heat sink fan does LAXREE use in its thermoelectric mini bars?', a: 'Plastic fan', b: 'Copper fan', c: 'Japanese-grade aluminum', d: 'Steel fan', ans: 'C', cat: 'Mini Bar Technology Deep Dive', diff: 'hard', expl: 'LAXREE uses Japanese-grade aluminum heat sink fans, which have much longer life than the plastic fans used by competitors' },
      ]
    },
    {
      moduleTitle: 'Mini Bar Models & Specifications',
      moduleType: 'PRODUCT_ACADEMY',
      questions: [
        { q: 'What is the SSP of LRMB-132 (45L Solid Door Compressor)?', a: '₹8,400', b: '₹6,700', c: '₹9,200', d: '₹9,800', ans: 'B', cat: 'Mini Bar Models & Specifications', diff: 'easy', expl: 'LRMB-132 is the compressor model at ₹6,700 SSP — the most affordable LAXREE mini bar' },
        { q: 'Which LRMB model is a 40L Glass Door Thermoelectric?', a: 'LRMB-126', b: 'LRMB-128', c: 'LRMB-129', d: 'LRMB-131', ans: 'C', cat: 'Mini Bar Models & Specifications', diff: 'medium', expl: 'LRMB-129 is the 40L Glass Door Thermoelectric model with SSP ₹9,200' },
        { q: 'What is the SSP of the LRMB-131 Absorption mini bar?', a: '₹9,200', b: '₹8,800', c: '₹9,800', d: '₹10,200', ans: 'C', cat: 'Mini Bar Models & Specifications', diff: 'medium', expl: 'LRMB-131 is the 40L Solid Door Mirror Finish Absorption model at ₹9,800 SSP' },
        { q: 'Which mini bar model has a mirror finish?', a: 'LRMB-132', b: 'LRMB-127', c: 'LRMB-130', d: 'LRMB-126', ans: 'C', cat: 'Mini Bar Models & Specifications', diff: 'medium', expl: 'LRMB-130 (30L) and LRMB-131 (40L) are the absorption models with mirror finish' },
        { q: 'What key feature does the LRMB-132 compressor model have that others may not?', a: 'Glass door', b: 'Auto defrost', c: 'Mirror finish', d: 'Zero noise', ans: 'B', cat: 'Mini Bar Models & Specifications', diff: 'hard', expl: 'The LRMB-132 compressor model features auto defrost, which is unique to compressor technology' },
      ]
    },
    {
      moduleTitle: 'LAXREE vs Godrej Qube Comparison',
      moduleType: 'PRODUCT_ACADEMY',
      questions: [
        { q: 'What temperature does the LAXREE solid door thermoelectric mini bar achieve at 30°C ambient?', a: '8-15°C', b: '0-5°C', c: '6°C', d: '12°C', ans: 'C', cat: 'LAXREE vs Godrej Qube Comparison', diff: 'medium', expl: 'LAXREE achieves 6°C (solid door) vs Godrej Qube\'s 8-15°C+ only' },
        { q: 'Which feature does Godrej Qube lack that LAXREE mini bars have?', a: 'Cooling', b: 'Door lock with key', c: 'Power cord', d: 'Shelves', ans: 'B', cat: 'LAXREE vs Godrej Qube Comparison', diff: 'easy', expl: 'Godrej Qube has no door lock; LAXREE offers cam-lock with key for VIP rooms' },
        { q: 'How does the LAXREE temperature control compare to Godrej Qube?', a: 'Both use manual knobs', b: 'LAXREE has digital controller with auto cut-off, Godrej has manual knob', c: 'Godrej has digital control', d: 'Neither has temperature control', ans: 'B', cat: 'LAXREE vs Godrej Qube Comparison', diff: 'medium', expl: 'LAXREE uses digital controller with auto cut-off while Godrej Qube uses a manual knob' },
        { q: 'How many watts does LAXREE save per unit compared to Godrej Qube?', a: '2W', b: '5W', c: '10W', d: '15W', ans: 'B', cat: 'LAXREE vs Godrej Qube Comparison', diff: 'easy', expl: 'LAXREE uses 55W vs Godrej\'s 60W, saving 5W per unit' },
        { q: 'What is the yearly electricity cost for 100 rooms of Godrej Qube at ₹9/unit?', a: '₹3,94,200', b: '₹4,86,000', c: '₹2,50,000', d: '₹5,40,000', ans: 'B', cat: 'LAXREE vs Godrej Qube Comparison', diff: 'hard', expl: 'Daily: 150 units × ₹9 = ₹1,350/day. Monthly: ₹40,500. Yearly: ₹4,86,000/year for 100 rooms' },
      ]
    },
    {
      moduleTitle: 'Safe Box Product Series',
      moduleType: 'PRODUCT_ACADEMY',
      questions: [
        { q: 'Which safe box series is ideal for budget rooms?', a: 'Laptop Series', b: 'Orbita Series', c: 'Essential Series', d: 'Premium Series', ans: 'C', cat: 'Safe Box Product Series', diff: 'easy', expl: 'The Essential Series (LRSB-201, ₹1,700 SSP) is designed for budget rooms and guest houses' },
        { q: 'What is the SSP of LRSB-209 (Orbita Laptop Safe Box)?', a: '₹4,590', b: '₹4,335', c: '₹5,220', d: '₹3,000', ans: 'C', cat: 'Safe Box Product Series', diff: 'medium', expl: 'The Orbita Series LRSB-209 is ₹5,220 SSP — the premium 5-star hotel model' },
        { q: 'Which safe box series features LED Display and LED Interior Light?', a: 'Essential Series', b: 'Medium Series', c: 'Laptop Series', d: 'All series', ans: 'C', cat: 'Safe Box Product Series', diff: 'medium', expl: 'The Laptop Series (LRSB-214, LRSB-203, LRSB-204) features LED Display, LED Interior Light, and audit trail' },
        { q: 'What is the SSP range for the Medium Series safe boxes?', a: '₹1,700 - ₹2,000', b: '₹2,888 - ₹3,000', c: '₹4,335 - ₹4,590', d: '₹5,000+', ans: 'B', cat: 'Safe Box Product Series', diff: 'medium', expl: 'The Medium Series ranges from ₹2,888 to ₹3,000 SSP' },
        { q: 'What is the model number and size of the Essential Series safe box?', a: 'LRSB-206 (W200×D310×H200)', b: 'LRSB-201 (W230×D170×H170mm)', c: 'LRSB-209 (W420×D370×H200)', d: 'LRSB-214 (W420×D370×H200)', ans: 'B', cat: 'Safe Box Product Series', diff: 'hard', expl: 'The Essential Series is LRSB-201 with dimensions W230×D170×H170mm at ₹1,700 SSP' },
      ]
    },
    {
      moduleTitle: 'Safe Box Security Features & Competitive Edge',
      moduleType: 'PRODUCT_ACADEMY',
      questions: [
        { q: 'How many incorrect entries trigger auto-lockout on LAXREE safe boxes?', a: '2', b: '3', c: '4', d: '5', ans: 'C', cat: 'Safe Box Security Features & Competitive Edge', diff: 'easy', expl: 'LAXREE safe boxes auto-lock after 4 incorrect entries — a feature not standard on Godrej/Yale/Hafele' },
        { q: 'How many audit trail records do advanced LAXREE safe boxes maintain?', a: '25', b: '50', c: '100', d: '200', ans: 'C', cat: 'Safe Box Security Features & Competitive Edge', diff: 'medium', expl: 'Laptop and Orbita series maintain 100 audit trail records — a feature many competitors don\'t offer' },
        { q: 'What type of batteries do LAXREE safe boxes use?', a: '2 AA', b: '4 AA', c: '4 AAA', d: '1 9V', ans: 'B', cat: 'Safe Box Security Features & Competitive Edge', diff: 'easy', expl: 'LAXREE safe boxes use 4 AA batteries with a battery life of 1-1.5 years' },
        { q: 'What override options do LAXREE safe boxes provide?', a: 'Master key only', b: 'Manual key only', c: 'Master key + Manual key (dual override)', d: 'PIN only', ans: 'C', cat: 'Safe Box Security Features & Competitive Edge', diff: 'medium', expl: 'LAXREE provides dual override — both Master key and Manual key backup, while some competitors only offer one' },
        { q: 'Which feature does LAXREE offer for safe boxes that most competitors do NOT?', a: 'Steel body', b: 'PIN codes', c: 'Custom hotel branding with logo printing', d: 'Battery power', ans: 'C', cat: 'Safe Box Security Features & Competitive Edge', diff: 'medium', expl: 'Custom hotel branding (logo printing) is rarely offered by Godrej/Yale/Hafele but is available from LAXREE' },
      ]
    },
    {
      moduleTitle: 'RFID Locks & Access Control',
      moduleType: 'PRODUCT_ACADEMY',
      questions: [
        { q: 'Which LAXREE RFID lock model supports 1680 audit records?', a: 'LRFD-608', b: 'LRFD-609', c: 'LRFD-607', d: 'LRFD-606', ans: 'C', cat: 'RFID Locks & Access Control', diff: 'medium', expl: 'LRFD-607 (304 SS) supports up to 1,680 audit records with PMS interface' },
        { q: 'What PMS system is LAXREE RFID locks compatible with?', a: 'SAP', b: 'Oracle ERP', c: 'Opera', d: 'Salesforce', ans: 'C', cat: 'RFID Locks & Access Control', diff: 'easy', expl: 'LAXREE RFID locks are compatible with Opera PMS — the most widely used hotel management system' },
        { q: 'What is the SSP of LRFD-607 (304 SS, Fire Rated)?', a: '₹4,500', b: '₹4,110', c: '₹8,320', d: '₹9,440', ans: 'C', cat: 'RFID Locks & Access Control', diff: 'medium', expl: 'LRFD-607 is ₹8,320 SSP — it\'s the premium model with 304 SS, moisture proof, fire rated, 1680 audit records' },
        { q: 'What special feature does the LRFD-607 have for coastal hotels?', a: 'Solar power', b: 'Moisture proof design', c: 'Salt resistance coating', d: 'Waterproof seal', ans: 'B', cat: 'RFID Locks & Access Control', diff: 'hard', expl: 'The LRFD-607 is moisture proof, making it ideal for coastal hotels where salt air can damage electronics' },
        { q: 'Which is the most affordable LAXREE RFID lock model?', a: 'LRFD-608', b: 'LRFD-610', c: 'LRFD-609', d: 'LRFD-607', ans: 'A', cat: 'RFID Locks & Access Control', diff: 'easy', expl: 'LRFD-608 (SS Body, 5 Latch Mortise) at ₹3,337 SSP is the most affordable model' },
      ]
    },
    {
      moduleTitle: 'Electric Kettles & TCM Trays',
      moduleType: 'PRODUCT_ACADEMY',
      questions: [
        { q: 'What controller brand is used in premium LAXREE kettles?', a: 'Otter', b: 'Strix', c: 'Philips', d: 'Bosch', ans: 'B', cat: 'Electric Kettles & TCM Trays', diff: 'easy', expl: 'Strix controller is used in premium LAXREE kettles (LRWT-150, LRWT-156) — it\'s a globally trusted brand' },
        { q: 'What is the SSP of the LRWT-150 (0.8L Strix Controller)?', a: '₹560', b: '₹1,104', c: '₹1,320', d: '₹1,400', ans: 'C', cat: 'Electric Kettles & TCM Trays', diff: 'medium', expl: 'LRWT-150 with Strix Controller is ₹1,320 SSP' },
        { q: 'Which kettle model has SS 304 Double Layer construction?', a: 'LRWT-143', b: 'LRWT-145', c: 'LRWT-150', d: 'LRWT-155', ans: 'D', cat: 'Electric Kettles & TCM Trays', diff: 'medium', expl: 'LRWT-155 (0.8L, 1200W, SS 304 Double Layer) at ₹1,104 SSP and LRWT-156 (1L) at ₹1,400 SSP' },
        { q: 'What is the SSP of the LRWT-158 Anti Theft Tray (ABS)?', a: '₹706', b: '₹1,305', c: '₹1,425', d: '₹488', ans: 'A', cat: 'Electric Kettles & TCM Trays', diff: 'medium', expl: 'LRWT-158 Anti Theft Tray in ABS is ₹706 SSP — the most affordable tray option' },
        { q: 'Which TCM tray model uses PU Leatherette material?', a: 'LRWT-158', b: 'LRWT-163', c: 'LRWT-162', d: 'LRWT-150', ans: 'B', cat: 'Electric Kettles & TCM Trays', diff: 'hard', expl: 'LRWT-163 is the PU Leatherette Tray at ₹1,305 SSP; LRWT-162 is the large Leatherette Tray at ₹1,425' },
      ]
    },
    {
      moduleTitle: 'Hair Dryers, Mirrors & Dispensers',
      moduleType: 'PRODUCT_ACADEMY',
      questions: [
        { q: 'Which hair dryer model features ionized air technology?', a: 'LRHD-276', b: 'LRHD-287', c: 'LRHD-280', d: 'LRHD-278', ans: 'C', cat: 'Hair Dryers, Mirrors & Dispensers', diff: 'medium', expl: 'LRHD-280 is the foldable 2100W model with ionized air technology at ₹1,744 SSP' },
        { q: 'What is the SSP of the LRHD-276 wall mount hair dryer?', a: '₹1,035', b: '₹1,277', c: '₹1,744', d: '₹974', ans: 'A', cat: 'Hair Dryers, Mirrors & Dispensers', diff: 'easy', expl: 'LRHD-276 (Wall Mount, 1300W, Shaver Socket) is ₹1,035 SSP' },
        { q: 'Which soap dispenser model is automatic with 304 SS body and anti-theft feature?', a: 'LRWA-362', b: 'LRWA-373', c: 'LRWA-374', d: 'LRWA-365', ans: 'C', cat: 'Hair Dryers, Mirrors & Dispensers', diff: 'medium', expl: 'LRWA-374 is the automatic dispenser with 304 SS body, 800ml capacity, and anti-theft feature at ₹4,170 SSP' },
        { q: 'What magnification do LAXREE magnifying mirrors provide?', a: '2x', b: '3x', c: '5x', d: '10x', ans: 'B', cat: 'Hair Dryers, Mirrors & Dispensers', diff: 'easy', expl: 'LAXREE magnifying mirrors (LRMM-305S, LRMM-302S) provide 3x magnification' },
        { q: 'Which magnifying mirror model features LED lighting?', a: 'LRMM-305S', b: 'LRMM-302S', c: 'LRMM-301S', d: 'LRMM-303S', ans: 'B', cat: 'Hair Dryers, Mirrors & Dispensers', diff: 'hard', expl: 'LRMM-302S (8" LED, SS, Power Supply, 3x) at ₹3,264 SSP features LED lighting' },
      ]
    },
    {
      moduleTitle: 'Mattresses, Beds & Housekeeping',
      moduleType: 'PRODUCT_ACADEMY',
      questions: [
        { q: 'What type of spring system do LAXREE mattresses use?', a: 'Pocket Spring', b: 'Bonnell Spring', c: 'Continuous Coil', d: 'Latex Foam', ans: 'B', cat: 'Mattresses, Beds & Housekeeping', diff: 'easy', expl: 'LAXREE mattresses use Bonnell Spring construction, with Euro Top options in 10" and 12" models' },
        { q: 'What is the SSP of the LRMR-251 (8") Bonnell Spring mattress?', a: '₹10,400', b: '₹12,025', c: '₹9,750', d: '₹6,988', ans: 'C', cat: 'Mattresses, Beds & Housekeeping', diff: 'medium', expl: 'LRMR-251 (8" Bonnell Spring) is ₹9,750 SSP' },
        { q: 'Which housekeeping trolley model has an ABS body?', a: 'LRHT-430', b: 'LRHT-427', c: 'LRHT-429', d: 'LRHT-428', ans: 'C', cat: 'Mattresses, Beds & Housekeeping', diff: 'medium', expl: 'LRHT-429 is the ABS Body trolley with 3 shelves and 2 soil bags at ₹22,800 SSP' },
        { q: 'What operating system do LAXREE digital signages run on?', a: 'iOS', b: 'Android 9.0', c: 'Windows 10', d: 'Linux', ans: 'B', cat: 'Mattresses, Beds & Housekeeping', diff: 'easy', expl: 'All LAXREE digital signage models run on Android 9.0' },
        { q: 'Which rollaway bed model features pocket spring with lockable wheels?', a: 'LRMR-256', b: 'LRMR-257', c: 'LRMR-251', d: 'LRMR-252', ans: 'B', cat: 'Mattresses, Beds & Housekeeping', diff: 'hard', expl: 'LRMR-257 (6" Pocket Spring, Lockable Wheels) at ₹10,350 SSP; LRMR-256 has bonded foam with MS frame' },
      ]
    },

    // ===== SALES ACADEMY (4 modules × 5 questions = 20 questions) =====
    {
      moduleTitle: 'The LACE Objection Handling Framework',
      moduleType: 'SALES_ACADEMY',
      questions: [
        { q: 'In the LACE framework, what does the "L" stand for?', a: 'Lead', b: 'Listen', c: 'Learn', d: 'Leverage', ans: 'B', cat: 'The LACE Objection Handling Framework', diff: 'easy', expl: 'LACE stands for Listen, Acknowledge, Counter, Engage — the four steps of handling objections professionally' },
        { q: 'What should you do in the "Acknowledge" step of LACE?', a: 'Agree with the objection', b: 'Validate their concern and restate to confirm understanding', c: 'Ignore the objection', d: 'Immediately provide a counter-argument', ans: 'B', cat: 'The LACE Objection Handling Framework', diff: 'medium', expl: 'Acknowledge means validating the concern, restating the objection to confirm understanding, and never dismissing it' },
        { q: 'In the LACE price objection example, what does the "Counter" step use?', a: 'Discount offer', b: 'Fact-based response with electricity savings data', c: 'Emotional appeal', d: 'Competitor criticism', ans: 'B', cat: 'The LACE Objection Handling Framework', diff: 'medium', expl: 'The Counter step uses LAXREE-specific data: 5W savings per unit, ₹24,300/year electricity savings, and guest satisfaction benefits' },
        { q: 'What is the purpose of the "Engage" step in LACE?', a: 'To close the sale immediately', b: 'To confirm the objection is resolved and move forward', c: 'To offer a discount', d: 'To end the conversation', ans: 'B', cat: 'The LACE Objection Handling Framework', diff: 'easy', expl: 'Engage asks a follow-up question to confirm the objection is resolved and keeps momentum in the sales process' },
        { q: 'What should you NEVER do during the "Acknowledge" step?', a: 'Show empathy', b: 'Make eye contact', c: 'Dismiss or minimize the client\'s concern', d: 'Take notes', ans: 'C', cat: 'The LACE Objection Handling Framework', diff: 'hard', expl: 'You should never dismiss or minimize the client\'s concern during the Acknowledge step — always validate it' },
      ]
    },
    {
      moduleTitle: '6 Buyer Types in Hospitality',
      moduleType: 'SALES_ACADEMY',
      questions: [
        { q: 'What is the primary concern of a Hotel Owner when buying products?', a: 'Design aesthetics', b: 'ROI, cost savings, and brand value', c: 'Installation timeline', d: 'Product specifications', ans: 'B', cat: '6 Buyer Types in Hospitality', diff: 'easy', expl: 'Hotel Owners prioritize ROI, cost savings, and brand value — lead with total cost of ownership' },
        { q: 'How should you approach a Procurement Manager?', a: 'Show design catalogs', b: 'Present SSP clearly, show PAN India delivery, highlight single-vendor convenience', c: 'Offer maximum discounts', d: 'Discuss brand reputation', ans: 'B', cat: '6 Buyer Types in Hospitality', diff: 'medium', expl: 'Procurement Managers prioritize price comparison, vendor reliability, and delivery timelines' },
        { q: 'What should you emphasize when selling to an Interior Designer?', a: 'ROI calculations', b: 'After-sales service network', c: 'Visual appeal, finish options, and design flexibility', d: 'Delivery timelines', ans: 'C', cat: '6 Buyer Types in Hospitality', diff: 'medium', expl: 'Interior Designers prioritize visual appeal, theme matching, and premium feel' },
        { q: 'What percentage of hotel product decisions do architects influence?', a: '20%', b: '40%', c: '60%', d: '80%', ans: 'C', cat: '6 Buyer Types in Hospitality', diff: 'hard', expl: 'Architects influence 60% of hotel product decisions, making them a critical stakeholder to win over' },
        { q: 'What key pitch works best for a Project Manager?', a: 'Energy savings ROI', b: 'Premium finishes', c: 'Quick installation, PAN India service, spare parts within 48 hours', d: 'Brand reputation', ans: 'C', cat: '6 Buyer Types in Hospitality', diff: 'easy', expl: 'Project Managers prioritize timeline, installation ease, and after-sales support' },
      ]
    },
    {
      moduleTitle: 'Value Selling vs Price Selling',
      moduleType: 'SALES_ACADEMY',
      questions: [
        { q: 'What is the result of price selling?', a: 'Premium positioning', b: 'Loyal clients', c: 'Low margins and commodity perception', d: 'Long-term relationships', ans: 'C', cat: 'Value Selling vs Price Selling', diff: 'easy', expl: 'Price selling leads to low margins and commodity perception — it\'s what NOT to do at LAXREE' },
        { q: 'What is the first step in the Consultative Approach?', a: 'Educate', b: 'Customize', c: 'Discover', d: 'Close', ans: 'C', cat: 'Value Selling vs Price Selling', diff: 'medium', expl: 'The Consultative Approach follows: Discover → Educate → Customize → Prove → Close' },
        { q: 'How much does a hotel save yearly with LAXREE mini bars (100 rooms)?', a: '₹1,00,000', b: '₹2,00,000', c: '₹3,94,200', d: '₹5,00,000', ans: 'C', cat: 'Value Selling vs Price Selling', diff: 'medium', expl: '5W savings × 100 rooms × 24hrs × 365 days × ₹9/unit = ₹3,94,200/year saved' },
        { q: 'What is the key difference between value selling and price selling?', a: 'Value selling is faster', b: 'Value selling leads with benefits and outcomes, price selling leads with discounts', c: 'Price selling gets better results', d: 'There is no difference', ans: 'B', cat: 'Value Selling vs Price Selling', diff: 'easy', expl: 'Value selling leads with benefits and outcomes showing total cost of ownership, while price selling leads with discounts' },
        { q: 'What does the "Prove" step in the Consultative Approach use?', a: 'Discounts', b: 'ROI calculations, testimonials, and case studies', c: 'Emotional appeals', d: 'Competitor criticism', ans: 'B', cat: 'Value Selling vs Price Selling', diff: 'hard', expl: 'The Prove step uses ROI calculations, testimonials, and case studies to demonstrate value' },
      ]
    },
    {
      moduleTitle: 'Follow-Up System',
      moduleType: 'SALES_ACADEMY',
      questions: [
        { q: 'What percentage of sales require 5+ follow-ups?', a: '50%', b: '60%', c: '80%', d: '90%', ans: 'C', cat: 'Follow-Up System', diff: 'easy', expl: '80% of sales require 5+ follow-ups, but 44% of salespeople give up after just 1' },
        { q: 'When should you send the Same-Day Recap (Touchpoint 1)?', a: 'Within 24 hours', b: 'Within 2 hours of meeting', c: 'The next business day', d: 'Within a week', ans: 'B', cat: 'Follow-Up System', diff: 'medium', expl: 'Touchpoint 1 is a Same-Day Recap — send email within 2 hours of the meeting' },
        { q: 'What should Touchpoint 2 (Day 3) include?', a: 'A formal proposal', b: 'A discount offer', c: 'Something useful: case study, ROI calculator, or industry insight', d: 'A request for order', ans: 'C', cat: 'Follow-Up System', diff: 'medium', expl: 'Touchpoint 2 (Value Add, Day 3) shares something useful — no hard sell, just value' },
        { q: 'On which day should you send the formal proposal?', a: 'Day 3', b: 'Day 7', c: 'Day 14', d: 'Day 21', ans: 'C', cat: 'Follow-Up System', diff: 'medium', expl: 'Touchpoint 4 (Proposal) is sent on Day 14 with customized product mix, ROI calculations, and warranty terms' },
        { q: 'What is the maximum gap between contacts during active deals?', a: '3 days', b: '5 days', c: '7 days', d: '14 days', ans: 'C', cat: 'Follow-Up System', diff: 'hard', expl: 'Never go more than 7 days without contact during active deals — maintain momentum' },
      ]
    },

    // ===== FIELD SALES ACADEMY (4 modules × 5 questions = 20 questions) =====
    {
      moduleTitle: 'Architect Visit Protocol',
      moduleType: 'FIELD_SALES',
      questions: [
        { q: 'What is the 70/30 rule in architect meetings?', a: 'You talk 70%, listen 30%', b: 'Architect talks 70%, you talk 30%', c: '70% product, 30% price', d: '70% presentation, 30% Q&A', ans: 'B', cat: 'Architect Visit Protocol', diff: 'easy', expl: 'The 70/30 rule means the architect talks 70% of the time and you talk 30% — listen more, talk less' },
        { q: 'What should you research before visiting an architect?', a: 'Their salary', b: 'Their firm and recent hotel projects', c: 'Their personal hobbies', d: 'Their competitor relationships', ans: 'B', cat: 'Architect Visit Protocol', diff: 'medium', expl: 'Pre-visit checklist: research the architect\'s firm, identify current hotel projects, prepare product samples' },
        { q: 'How much influence do architects have on hotel product decisions?', a: '20%', b: '40%', c: '60%', d: '80%', ans: 'C', cat: 'Architect Visit Protocol', diff: 'medium', expl: 'Architects influence 60% of hotel product decisions — winning them over is critical' },
        { q: 'What should you focus on when presenting to an architect?', a: 'Price and discounts', b: 'Design finishes, dimensions, and customization options', c: 'After-sales service', d: 'Delivery timeline', ans: 'B', cat: 'Architect Visit Protocol', diff: 'easy', expl: 'Architects prioritize design aesthetics, space optimization, and specifications' },
        { q: 'What type of product samples should you bring to an architect meeting?', a: 'Full product catalog only', b: 'Relevant product samples, finish swatches, and dimension drawings', c: 'No samples needed', d: 'Only pricing sheets', ans: 'B', cat: 'Architect Visit Protocol', diff: 'hard', expl: 'Bring relevant product samples, finish swatches, and dimension drawings — architects need to see and feel the products' },
      ]
    },
    {
      moduleTitle: 'Interior Designer Meeting Guide',
      moduleType: 'FIELD_SALES',
      questions: [
        { q: 'What is the primary priority for an Interior Designer?', a: 'Cost savings', b: 'Visual appeal, theme matching, and premium feel', c: 'Installation timeline', d: 'Technical specifications', ans: 'B', cat: 'Interior Designer Meeting Guide', diff: 'easy', expl: 'Interior Designers prioritize visual appeal, theme matching, and premium feel for the hotel rooms' },
        { q: 'Which product finishes should you highlight for interior designers?', a: 'Only standard stainless steel', b: 'Rose gold, matte black, SS finishes to match room themes', c: 'Only white finishes', d: 'Custom painted finishes only', ans: 'B', cat: 'Interior Designer Meeting Guide', diff: 'medium', expl: 'LAXREE offers SS, Rose Gold, and Matte Black finishes to match any room design theme' },
        { q: 'For a 5-star hotel, which mini bar should you recommend to a designer?', a: 'LRMB-132 Compressor', b: 'LRMB-130/131 Absorption with Mirror Finish', c: 'LRMB-126 Solid Door', d: 'Any budget model', ans: 'B', cat: 'Interior Designer Meeting Guide', diff: 'medium', expl: 'The absorption models with mirror finish (LRMB-130/131) are ideal for 5-star hotels — silent, elegant, and premium' },
        { q: 'What hotel category is best suited for glass door mini bars?', a: 'Budget hotels', b: 'Guest houses', c: 'Premium and luxury hotels', d: 'Hostels', ans: 'C', cat: 'Interior Designer Meeting Guide', diff: 'easy', expl: 'Glass door mini bars provide easy visibility and a premium look — ideal for premium and luxury hotels' },
        { q: 'How should you present product options to an interior designer?', a: 'Show only the cheapest options', b: 'Show the full catalog without guidance', c: 'Show design flexibility, finish options, and how products complement room themes', d: 'Focus only on technical specifications', ans: 'C', cat: 'Interior Designer Meeting Guide', diff: 'hard', expl: 'For interior designers, show design flexibility, finish options, and how products complement the room\'s design theme' },
      ]
    },
    {
      moduleTitle: 'Site Visit Checklist',
      moduleType: 'FIELD_SALES',
      questions: [
        { q: 'What should you do BEFORE a site visit?', a: 'Just show up unannounced', b: 'Confirm appointment, research the property, prepare relevant product samples', c: 'Call the competitor for advice', d: 'Prepare only pricing documents', ans: 'B', cat: 'Site Visit Checklist', diff: 'easy', expl: 'Before a site visit: confirm appointment, research the property, prepare relevant product samples and documentation' },
        { q: 'What should you observe DURING a site visit?', a: 'Only the lobby area', b: 'Room layouts, existing product brands, renovation stage, and decision-maker availability', c: 'Only the competitor products', d: 'The hotel restaurant menu', ans: 'B', cat: 'Site Visit Checklist', diff: 'medium', expl: 'During a site visit, observe room layouts, existing product brands, renovation stage, and identify decision-makers' },
        { q: 'What should you do AFTER a site visit?', a: 'Wait for the client to call', b: 'Send a follow-up email within 24 hours with meeting summary and recommendations', c: 'Nothing — the visit is complete', d: 'Call the client every day', ans: 'B', cat: 'Site Visit Checklist', diff: 'medium', expl: 'After a site visit, send a follow-up email within 24 hours with meeting summary and product recommendations' },
        { q: 'What is a key benefit of conducting a thorough site visit?', a: 'You get a free hotel stay', b: 'You can identify specific product needs and customize your proposal', c: 'You can skip the follow-up', d: 'You meet the hotel owner', ans: 'B', cat: 'Site Visit Checklist', diff: 'easy', expl: 'A thorough site visit helps identify specific product needs per room type and customize your proposal accordingly' },
        { q: 'What document should you prepare after a site visit for the client?', a: 'Only a price list', b: 'A customized proposal with product mix, specifications, and ROI calculations', c: 'A competitor comparison', d: 'A general brochure', ans: 'B', cat: 'Site Visit Checklist', diff: 'hard', expl: 'After a site visit, prepare a customized proposal with the right product mix, detailed specifications, and ROI calculations' },
      ]
    },
    {
      moduleTitle: 'Daily Sales SOP',
      moduleType: 'FIELD_SALES',
      questions: [
        { q: 'What is the weekly KPI for new prospect visits according to LAXREE SOP?', a: '10', b: '15', c: '25', d: '12-15', ans: 'D', cat: 'Daily Sales SOP', diff: 'medium', expl: 'The LAXREE daily sales SOP targets 12-15 new prospect visits per week' },
        { q: 'What should be the first activity in a sales rep\'s daily schedule?', a: 'Cold calling', b: 'Review daily targets and plan the day\'s visits', c: 'Checking emails', d: 'Attending team meetings', ans: 'B', cat: 'Daily Sales SOP', diff: 'easy', expl: 'Start the day by reviewing daily targets and planning the day\'s visits for maximum productivity' },
        { q: 'How many follow-up calls should be made daily according to the SOP?', a: '2-3', b: '5-8', c: '10-15', d: '20+', ans: 'B', cat: 'Daily Sales SOP', diff: 'medium', expl: 'The SOP recommends 5-8 follow-up calls daily to maintain pipeline momentum' },
        { q: 'What lead sources should field sales reps focus on?', a: 'Only cold calls', b: 'Only referrals', c: 'Mix of architects, interior designers, hotel consultants, and online leads', d: 'Only online leads', ans: 'C', cat: 'Daily Sales SOP', diff: 'medium', expl: 'LAXREE field sales should use a mix of lead sources including architects, interior designers, hotel consultants, and online leads' },
        { q: 'What must be updated daily after sales activities?', a: 'Social media', b: 'CRM with all interactions, visit reports, and next steps', c: 'Only the order tracker', d: 'The company website', ans: 'B', cat: 'Daily Sales SOP', diff: 'hard', expl: 'CRM must be updated daily with all interactions, visit reports, and next steps — this ensures no leads fall through the cracks' },
      ]
    },
    // ===== ORIENTATION (4 modules × 5 questions) =====
    { moduleTitle: 'Welcome to LAXREE', moduleType: 'ORIENTATION', questions: [
      { q: 'What is LAXREE\'s vision statement?', a: 'To be India\'s cheapest supplier', b: 'To be India\'s most trusted single-source hospitality solutions provider', c: 'To be the largest exporter', d: 'To dominate global markets', ans: 'B', cat: 'Welcome to LAXREE', diff: 'easy', expl: 'LAXREE\'s vision is to be India\'s most trusted single-source hospitality solutions provider' },
      { q: 'Which ISO certifications does LAXREE hold?', a: 'ISO 9001 only', b: 'ISO 9001 and 14001', c: 'ISO 9001:2015, ISO 14001:2015, ISO 45001:2018', d: 'No ISO certifications', ans: 'C', cat: 'Welcome to LAXREE', diff: 'medium', expl: 'LAXREE holds three ISO certifications: Quality (9001), Environment (14001), and OH&S (45001)' },
      { q: 'What is NOT one of LAXREE\'s core values?', a: 'Customer First', b: 'Quality Excellence', c: 'Maximum Profit', d: 'Integrity', ans: 'C', cat: 'Welcome to LAXREE', diff: 'easy', expl: 'Core values are Customer First, Quality Excellence, Innovation, Integrity, and Teamwork' },
      { q: 'What problem was LAXREE founded to solve?', a: 'Lack of hotel staff', b: 'Fragmented hotel procurement across multiple vendors', c: 'No hospitality schools in India', d: 'Poor hotel food quality', ans: 'B', cat: 'Welcome to LAXREE', diff: 'medium', expl: 'LAXREE was founded to solve the problem of fragmented hotel procurement where hotels bought from multiple vendors' },
      { q: 'Which premium hotel chains trust LAXREE?', a: 'Only budget hotels', b: 'Radisson, Marriott, Holiday Inn and more', c: 'Only Indian chains', d: 'No hotel chains yet', ans: 'B', cat: 'Welcome to LAXREE', diff: 'easy', expl: 'Premium chains like Radisson, Marriott, Holiday Inn trust LAXREE for in-room requirements' },
    ]},
    { moduleTitle: 'LAXREE Product Portfolio Overview', moduleType: 'ORIENTATION', questions: [
      { q: 'How many product categories does LAXREE offer?', a: '5+', b: '8+', c: '15+', d: '20+', ans: 'C', cat: 'Product Portfolio Overview', diff: 'easy', expl: 'LAXREE offers 15+ product categories under one roof' },
      { q: 'What is the starting SSP for LAXREE mini bars?', a: '₹3,000', b: '₹6,700', c: '₹9,800', d: '₹12,000', ans: 'B', cat: 'Product Portfolio Overview', diff: 'medium', expl: 'Mini bar range starts from ₹6,700 (LRMB-132 compressor model)' },
      { q: 'Which product category includes LRFD models?', a: 'Mini Bars', b: 'Safe Boxes', c: 'RFID Door Locks', d: 'Electric Kettles', ans: 'C', cat: 'Product Portfolio Overview', diff: 'easy', expl: 'LRFD models are LAXREE RFID Door Locks' },
      { q: 'What is the key advantage of LAXREE\'s product portfolio?', a: 'Only mini bars', b: 'Single vendor for all products with PAN India delivery', c: 'Cheapest products', d: 'Import only', ans: 'B', cat: 'Product Portfolio Overview', diff: 'easy', expl: 'All products from a single vendor with PAN India delivery, consistent warranty, and unified after-sales support' },
      { q: 'What is the SSP range for safe boxes?', a: '₹500 - ₹1,000', b: '₹1,700 - ₹5,220', c: '₹10,000 - ₹50,000', d: '₹50,000+', ans: 'B', cat: 'Product Portfolio Overview', diff: 'medium', expl: 'Safe box range from ₹1,700 (Essential) to ₹5,220 (Orbita)' },
    ]},
    { moduleTitle: 'LAXREE Culture & Work Ethics', moduleType: 'ORIENTATION', questions: [
      { q: 'What is the response time SLA for client inquiries?', a: 'Within 24 hours', b: 'Within 2 hours during business hours', c: 'Within 1 week', d: 'No SLA defined', ans: 'B', cat: 'Culture & Work Ethics', diff: 'easy', expl: 'LAXREE culture requires responding to client inquiries within 2 hours during business hours' },
      { q: 'What should you do when you don\'t know an answer?', a: 'Make something up', b: 'Say "I don\'t know" and end the conversation', c: 'Admit you don\'t know and promise to get the exact details', d: 'Change the subject', ans: 'C', cat: 'Culture & Work Ethics', diff: 'easy', expl: 'Professional integrity means admitting when you don\'t know and committing to get the correct answer' },
      { q: 'How should you handle competitor products?', a: 'Disparage them aggressively', b: 'Respect them and differentiate on merit', c: 'Ignore them completely', d: 'Copy their features', ans: 'B', cat: 'Culture & Work Ethics', diff: 'medium', expl: 'LAXREE culture: respect competitor products, never disparage, always differentiate on merit' },
      { q: 'What is a key principle of LAXREE\'s teamwork culture?', a: 'Keep knowledge to yourself', b: 'Share knowledge freely and help colleagues learn', c: 'Only help when asked', d: 'Compete with colleagues', ans: 'B', cat: 'Culture & Work Ethics', diff: 'easy', expl: 'LAXREE culture: share knowledge freely, help colleagues learn products and techniques' },
      { q: 'What does "continuous improvement" mean at LAXREE?', a: 'Only improve when told to', b: 'Learn something new every day and seek feedback actively', c: 'Never change anything', d: 'Only focus on product improvements', ans: 'B', cat: 'Culture & Work Ethics', diff: 'medium', expl: 'Continuous improvement at LAXREE means learning daily, seeking feedback, and embracing change' },
    ]},
    { moduleTitle: 'Your Role at LAXREE', moduleType: 'ORIENTATION', questions: [
      { q: 'How many prospect visits per week is the KPI?', a: '5-8', b: '12-15', c: '20-25', d: '30+', ans: 'B', cat: 'Your Role at LAXREE', diff: 'easy', expl: 'The weekly KPI for prospect visits is 12-15' },
      { q: 'What is Level 2 in the LAXREE growth path?', a: 'Sales Executive', b: 'Senior Sales Executive', c: 'Team Leader', d: 'Sales Manager', ans: 'B', cat: 'Your Role at LAXREE', diff: 'medium', expl: 'Level 2 is Senior Sales Executive — handling larger accounts independently' },
      { q: 'How many proposals should be sent per week?', a: '1-2', b: '5-8', c: '15-20', d: '30+', ans: 'B', cat: 'Your Role at LAXREE', diff: 'easy', expl: 'Weekly KPI: 5-8 proposals sent' },
      { q: 'Which department handles phone/email inquiry handling?', a: 'Sales', b: 'Inbound Sales', c: 'Field Sales', d: 'Training', ans: 'B', cat: 'Your Role at LAXREE', diff: 'easy', expl: 'Inbound Sales handles phone and email inquiry handling' },
      { q: 'What is the minimum pipeline value to maintain?', a: '₹5 Lakhs', b: '₹25 Lakhs', c: '₹50 Lakhs', d: '₹1 Crore', ans: 'C', cat: 'Your Role at LAXREE', diff: 'medium', expl: 'Maintain a minimum pipeline of ₹50 Lakhs at all times' },
    ]},
    // ===== TECHNICAL (4 modules × 5 questions) =====
    { moduleTitle: 'Installation Best Practices', moduleType: 'TECHNICAL', questions: [
      { q: 'How much wall clearance does a mini bar need?', a: 'No clearance needed', b: 'Minimum 10cm', c: 'Minimum 50cm', d: 'Minimum 1 meter', ans: 'B', cat: 'Installation Best Practices', diff: 'easy', expl: 'Mini bars need minimum 10cm clearance from walls for proper ventilation' },
      { q: 'What should you do before stocking a compressor mini bar?', a: 'Stock immediately', b: 'Allow 2 hours settling time', c: 'Wait 24 hours', d: 'Turn it to maximum cooling', ans: 'B', cat: 'Installation Best Practices', diff: 'medium', expl: 'Allow 2 hours settling time before stocking — compressor models need stabilizing' },
      { q: 'How many mounting holes should be used for safe box installation?', a: '1', b: '2', c: '3', d: 'All 4 pre-drilled holes', ans: 'D', cat: 'Installation Best Practices', diff: 'easy', expl: 'Use all 4 pre-drilled mounting holes for maximum security' },
      { q: 'What must be tested before RFID lock handover?', a: 'Only guest cards', b: 'All card types: guest, master, emergency', c: 'Nothing, just install', d: 'Only master cards', ans: 'B', cat: 'Installation Best Practices', diff: 'medium', expl: 'Test with all card types (guest, master, emergency) before handover' },
      { q: 'What should be verified during safe box installation?', a: 'Only the keypad', b: 'Master code setup and battery installation', c: 'Only the door', d: 'Only the color', ans: 'B', cat: 'Installation Best Practices', diff: 'easy', expl: 'Set master code first and verify battery compartment has 4× AA batteries' },
    ]},
    { moduleTitle: 'Product Maintenance & Troubleshooting', moduleType: 'TECHNICAL', questions: [
      { q: 'How long do safe box batteries typically last?', a: '1 month', b: '1-1.5 years', c: '5 years', d: '10 years', ans: 'B', cat: 'Product Maintenance', diff: 'easy', expl: '4× AA batteries last 1-1.5 years in LAXREE safe boxes' },
      { q: 'What happens after 4 wrong safe box code entries?', a: 'Nothing', b: 'Auto-lockout is triggered', c: 'The safe opens', d: 'Alarm sounds forever', ans: 'B', cat: 'Product Maintenance', diff: 'easy', expl: 'LAXREE safe boxes auto-lock after 4 incorrect entries' },
      { q: 'What is the warranty period for LAXREE products?', a: '3 months', b: '6 months', c: '1 year from installation', d: '5 years', ans: 'C', cat: 'Product Maintenance', diff: 'easy', expl: 'All LAXREE products carry 1-year warranty from date of installation' },
      { q: 'How quickly are spare parts available?', a: '1 week', b: 'Within 48 hours via PAN India network', c: '1 month', d: '3 months', ans: 'B', cat: 'Product Maintenance', diff: 'medium', expl: 'Spare parts available within 48 hours via PAN India network' },
      { q: 'What causes RFID lock battery drain?', a: 'Normal use', b: 'Door misalignment causing constant latch motor activation', c: 'Cold weather', d: 'Too many cards', ans: 'B', cat: 'Product Maintenance', diff: 'hard', expl: 'Door misalignment can cause constant latch motor activation, draining batteries quickly' },
    ]},
    { moduleTitle: 'Technical Specifications Reading Guide', moduleType: 'TECHNICAL', questions: [
      { q: 'What does SSP stand for?', a: 'Standard Service Protocol', b: 'Standard Selling Price', c: 'System Setup Parameter', d: 'Sales Support Plan', ans: 'B', cat: 'Technical Specifications', diff: 'easy', expl: 'SSP = Standard Selling Price — the listed retail price before any volume discounts' },
      { q: 'What does a lower wattage indicate?', a: 'Poor performance', b: 'More energy efficient', c: 'Larger size', d: 'Noisier operation', ans: 'B', cat: 'Technical Specifications', diff: 'easy', expl: 'Lower wattage means more energy efficient — LAXREE mini bars use 55W vs competitors\' 60W' },
      { q: 'What does 0dB mean for a mini bar?', a: 'Very loud', b: 'Completely silent', c: 'Moderate noise', d: 'Fan is broken', ans: 'B', cat: 'Technical Specifications', diff: 'easy', expl: '0dB means completely silent — absorption mini bars operate at 0dB' },
      { q: 'How should you present specs to clients?', a: 'Use only technical jargon', b: 'Translate technical specs into client benefits', c: 'Read the entire spec sheet aloud', d: 'Skip the specs entirely', ans: 'B', cat: 'Technical Specifications', diff: 'medium', expl: 'Always translate technical specs into client benefits and use comparison tables' },
      { q: 'What voltage are LAXREE products compatible with?', a: '110V only', b: '220-240V', c: '380V', d: '12V battery', ans: 'B', cat: 'Technical Specifications', diff: 'medium', expl: 'All LAXREE products are 220-240V compatible for the Indian market' },
    ]},
    { moduleTitle: 'PMS Integration & Smart Systems', moduleType: 'TECHNICAL', questions: [
      { q: 'What does PMS stand for?', a: 'Product Management System', b: 'Property Management System', c: 'Process Monitoring Software', d: 'Payment Management Service', ans: 'B', cat: 'PMS Integration', diff: 'easy', expl: 'PMS = Property Management System, the central software managing hotel operations' },
      { q: 'Which is the most widely used PMS in Indian 5-star hotels?', a: 'SAP', b: 'Oracle Opera', c: 'Salesforce', d: 'Tally', ans: 'B', cat: 'PMS Integration', diff: 'medium', expl: 'Opera by Oracle is the most widely used PMS in Indian 5-star hotels' },
      { q: 'Which LAXREE RFID locks support PMS interface?', a: 'LRFD-608 only', b: 'LRFD-607 and LRFD-606', c: 'No LAXREE locks support PMS', d: 'All models', ans: 'B', cat: 'PMS Integration', diff: 'medium', expl: 'LRFD-607 and LRFD-606 support full PMS interface via driverless USB encoder' },
      { q: 'How many audit records does the LRFD-607 support?', a: '100', b: '500', c: '1,680', d: '10,000', ans: 'C', cat: 'PMS Integration', diff: 'medium', expl: 'LRFD-607 supports up to 1,680 audit records' },
      { q: 'What OS do LAXREE digital signages run?', a: 'Windows', b: 'iOS', c: 'Android 9.0', d: 'Linux', ans: 'C', cat: 'PMS Integration', diff: 'easy', expl: 'LAXREE digital signages run Android 9.0 for custom hotel content management' },
    ]},
    // ===== HOSPITALITY (4 modules × 5 questions) =====
    { moduleTitle: 'Understanding the Indian Hotel Industry', moduleType: 'HOSPITALITY', questions: [
      { q: 'What is the approximate CAGR of the Indian hotel segment?', a: '2-3%', b: '5-7%', c: '10-12%', d: '25-30%', ans: 'C', cat: 'Indian Hotel Industry', diff: 'easy', expl: 'Indian hotel segment grows at 10-12% CAGR' },
      { q: 'How many new branded rooms are added annually in India?', a: '5,000', b: '10,000', c: '25,000+', d: '100,000', ans: 'C', cat: 'Indian Hotel Industry', diff: 'medium', expl: '25,000+ new branded hotel rooms are added annually in India' },
      { q: 'Which LAXREE products are recommended for 5-star luxury hotels?', a: 'Essential safes and compressor bars', b: 'Orbita safes, Absorption bars, LRFD-607', c: 'No products for luxury segment', d: 'Only kettles', ans: 'B', cat: 'Indian Hotel Industry', diff: 'easy', expl: '5-star luxury: Orbita safes, Absorption mini bars, LRFD-607 RFID locks' },
      { q: 'Which is a growing hotel segment in India?', a: 'Only 5-star hotels', b: 'Serviced apartments, boutique hotels, wellness resorts', c: 'Only government hotels', d: 'Only heritage properties', ans: 'B', cat: 'Indian Hotel Industry', diff: 'medium', expl: 'Growing segments include serviced apartments, boutique hotels, and wellness resorts' },
      { q: 'What is the typical room rate for a 4-star business hotel?', a: '₹500-1,000', b: '₹2,000-6,000', c: '₹6,000-15,000', d: '₹50,000+', ans: 'C', cat: 'Indian Hotel Industry', diff: 'medium', expl: '4-star business hotels typically charge ₹6,000-15,000 per night' },
    ]},
    { moduleTitle: 'Hotel Decision-Making Process', moduleType: 'HOSPITALITY', questions: [
      { q: 'What is the first step in the hotel procurement cycle?', a: 'Negotiation', b: 'Need Identification', c: 'Order Placement', d: 'Delivery', ans: 'B', cat: 'Hotel Decision-Making', diff: 'easy', expl: 'Need Identification is the first step — new build, renovation, or replacement' },
      { q: 'In-room products typically represent what % of new build project cost?', a: '0.1-0.5%', b: '2-3%', c: '10-15%', d: '50%', ans: 'B', cat: 'Hotel Decision-Making', diff: 'medium', expl: 'In-room products typically account for 2-3% of total project cost in new builds' },
      { q: 'Who has final approval on major hotel purchases?', a: 'Front desk staff', b: 'Hotel Owner', c: 'Interior designer', d: 'Maintenance staff', ans: 'B', cat: 'Hotel Decision-Making', diff: 'easy', expl: 'Hotel Owner has final approval on major purchases, focusing on ROI' },
      { q: 'What budget is replacement usually from?', a: 'Marketing budget', b: 'Operations/maintenance budget', c: 'IT budget', d: 'Training budget', ans: 'B', cat: 'Hotel Decision-Making', diff: 'medium', expl: 'Replacement purchases are often from operations/maintenance budget with faster approval' },
      { q: 'How many vendors do hotels typically shortlist?', a: '1', b: '3-5', c: '10-15', d: '50+', ans: 'B', cat: 'Hotel Decision-Making', diff: 'easy', expl: 'Procurement typically collects quotes from 3-5 vendors during shortlisting' },
    ]},
    { moduleTitle: 'Hotel Star Ratings & Product Requirements', moduleType: 'HOSPITALITY', questions: [
      { q: 'What type of mini bar operation is mandatory for 5-star hotels?', a: 'Compressor', b: 'Silent operation (absorption or thermoelectric)', c: 'Any type is fine', d: 'No mini bar required', ans: 'B', cat: 'Star Ratings', diff: 'easy', expl: '5-star hotels require silent operation — absorption or thermoelectric mini bars' },
      { q: 'Which lock feature is required for buildings above 15m?', a: 'LED light', b: 'Fire-rated locks', c: 'Glass door', d: 'Remote control', ans: 'B', cat: 'Star Ratings', diff: 'medium', expl: 'Locks must be fire-rated for buildings above 15m — LRFD-607 is fire rated' },
      { q: 'What safe box series is acceptable for 3-star/budget hotels?', a: 'Only Orbita', b: 'Essential series', c: 'Only Laptop series', d: 'No safes needed', ans: 'B', cat: 'Star Ratings', diff: 'easy', expl: '3-star/budget hotels can use the Essential series (LRSB-201, ₹1,700)' },
      { q: 'What is a 5-star bathroom requirement?', a: 'Only a towel rack', b: 'LED magnifying mirror', c: 'No bathroom products needed', d: 'Only a soap dish', ans: 'B', cat: 'Star Ratings', diff: 'medium', expl: '5-star hotels require LED magnifying mirror in bathroom' },
      { q: 'What electrical certification must products have?', a: 'No certification needed', b: 'BIS certified or equivalent', c: 'Only FCC', d: 'Only CE mark', ans: 'B', cat: 'Star Ratings', diff: 'medium', expl: 'All products must be BIS certified or equivalent for the Indian market' },
    ]},
    { moduleTitle: 'Trends in Hospitality Technology', moduleType: 'HOSPITALITY', questions: [
      { q: 'What is a key trend in hotel room technology?', a: 'Manual key cards', b: 'IoT-connected smart room controls', c: 'No technology', d: 'Paper-based systems', ans: 'B', cat: 'Hospitality Technology Trends', diff: 'easy', expl: 'IoT-connected room controls — lighting, AC, curtains via app or voice — is a key trend' },
      { q: 'How much energy does LAXREE save per mini bar vs competitors?', a: '1W', b: '5W (55W vs 60W)', c: '20W', d: '50W', ans: 'B', cat: 'Hospitality Technology Trends', diff: 'medium', expl: 'LAXREE thermoelectric mini bars use 55W vs 60W — 8% energy savings per room' },
      { q: 'What sustainability trend are hotels pursuing?', a: 'Using more plastic', b: 'LEED/IGBC green building certification', c: 'Increasing energy waste', d: 'No sustainability focus', ans: 'B', cat: 'Hospitality Technology Trends', diff: 'easy', expl: 'Hotels are targeting LEED/IGBC green building certification, creating demand for energy-efficient products' },
      { q: 'What is the contactless experience trend?', a: 'In-person check-in only', b: 'Mobile check-in with digital key on phone', c: 'Paper key cards', d: 'Physical lock and key', ans: 'B', cat: 'Hospitality Technology Trends', diff: 'easy', expl: 'Contactless experience includes mobile check-in with digital key on phone' },
      { q: 'What customization option does LAXREE offer?', a: 'No customization', b: 'Hotel logo branding on products', c: 'Only color changes', d: 'Only size changes', ans: 'B', cat: 'Hospitality Technology Trends', diff: 'easy', expl: 'LAXREE offers custom branding with hotel logo on products — a key differentiator for personalization trend' },
    ]},
    // ===== CUSTOMER_DISCOVERY (4 modules × 5 questions) =====
    { moduleTitle: 'Identifying Potential Hotel Clients', moduleType: 'CUSTOMER_DISCOVERY', questions: [
      { q: 'What is the minimum room count for qualifying a hotel prospect?', a: '10 rooms', b: '30+ rooms', c: '500 rooms', d: '1,000 rooms', ans: 'B', cat: 'Identifying Clients', diff: 'easy', expl: 'Properties with 30+ rooms qualify — smaller properties rarely invest in premium products' },
      { q: 'What is the minimum pipeline value to maintain?', a: '₹5 Lakhs', b: '₹10 Lakhs', c: '₹50 Lakhs', d: '₹1 Crore', ans: 'C', cat: 'Identifying Clients', diff: 'medium', expl: 'Maintain a minimum pipeline of ₹50 Lakhs at all times' },
      { q: 'Which is a valid lead source for LAXREE?', a: 'Only cold calls', b: 'HVS, STR hotel directories and industry events', c: 'Only TV ads', d: 'Only newspaper ads', ans: 'B', cat: 'Identifying Clients', diff: 'easy', expl: 'HVS, STR, Hotelivate directories, HICSA, FHRAI events are all valid lead sources' },
      { q: 'How should leads be classified?', a: 'Only one category', b: 'Hot (within 30 days), Warm (1-3 months), Cold (3+ months)', c: 'No classification needed', d: 'Only as "important" or "not important"', ans: 'B', cat: 'Identifying Clients', diff: 'medium', expl: 'Classify leads as Hot, Warm, or Cold based on decision timeline' },
      { q: 'How much time should be dedicated daily to prospect research?', a: 'No time needed', b: '1 hour', c: '8 hours', d: 'Entire week', ans: 'B', cat: 'Identifying Clients', diff: 'easy', expl: 'Dedicate 1 hour daily to new prospect research' },
    ]},
    { moduleTitle: 'Needs Analysis Framework', moduleType: 'CUSTOMER_DISCOVERY', questions: [
      { q: 'What does SPIN stand for?', a: 'Sales, Pitch, Inform, Negotiate', b: 'Situation, Problem, Implication, Need-Payoff', c: 'Strategy, Planning, Implementation, Numbers', d: 'Service, Product, Innovation, Networking', ans: 'B', cat: 'Needs Analysis Framework', diff: 'easy', expl: 'SPIN = Situation, Problem, Implication, Need-Payoff' },
      { q: 'What type of SPIN question identifies pain points?', a: 'Situation questions', b: 'Problem questions', c: 'Implication questions', d: 'Need-Payoff questions', ans: 'B', cat: 'Needs Analysis Framework', diff: 'medium', expl: 'Problem questions identify pain points and dissatisfaction with current setup' },
      { q: 'What is the purpose of Implication questions?', a: 'To introduce products', b: 'To make the problem feel urgent and costly', c: 'To close the deal', d: 'To say goodbye', ans: 'B', cat: 'Needs Analysis Framework', diff: 'medium', expl: 'Implication questions make the problem feel urgent and costly to the client' },
      { q: 'Which is a Need-Payoff question example?', a: '"How many rooms do you have?"', b: '"What problems are you facing?"', c: '"If you could eliminate noise, what would that mean for guest satisfaction?"', d: '"What is your budget?"', ans: 'C', cat: 'Needs Analysis Framework', diff: 'easy', expl: 'Need-Payoff questions let the client articulate the value of a solution' },
      { q: 'What should Situation questions help you understand?', a: 'The client\'s budget', b: 'The client\'s current setup', c: 'The competitor\'s products', d: 'The weather', ans: 'B', cat: 'Needs Analysis Framework', diff: 'easy', expl: 'Situation questions help understand the client\'s current setup and context' },
    ]},
    { moduleTitle: 'Research & Preparation', moduleType: 'CUSTOMER_DISCOVERY', questions: [
      { q: 'What is the #1 reason sales calls fail?', a: 'Bad products', b: 'Being unprepared', c: 'Wrong pricing', d: 'Bad weather', ans: 'B', cat: 'Research & Preparation', diff: 'easy', expl: 'Walking into a meeting unprepared is the #1 reason sales calls fail' },
      { q: 'What should you research on LinkedIn before a meeting?', a: 'Only the hotel name', b: 'Decision-maker name, role, and background', c: 'Nothing, just show up', d: 'Only the hotel address', ans: 'B', cat: 'Research & Preparation', diff: 'easy', expl: 'Research the decision-maker\'s name, role, and background on LinkedIn' },
      { q: 'What materials should you carry to a client meeting?', a: 'Only your phone', b: 'Master Catalogue, SSP sheet, ROI calculator, product samples, business cards', c: 'Nothing', d: 'Only a pen', ans: 'B', cat: 'Research & Preparation', diff: 'medium', expl: 'Carry Master Catalogue, SSP sheet, ROI calculator, product samples, case studies, and business cards' },
      { q: 'How can you observe a hotel\'s current products before visiting?', a: 'Break into the hotel', b: 'Check TripAdvisor reviews and hotel website photos', c: 'Guess based on star rating', d: 'Ask the competitor', ans: 'B', cat: 'Research & Preparation', diff: 'easy', expl: 'Check TripAdvisor reviews for product complaints and hotel website for room photos' },
      { q: 'How many business cards should you carry minimum?', a: '1', b: '5', c: '10', d: '50', ans: 'C', cat: 'Research & Preparation', diff: 'easy', expl: 'Always carry minimum 10 business cards to a client meeting' },
    ]},
    { moduleTitle: 'Building Client Relationships', moduleType: 'CUSTOMER_DISCOVERY', questions: [
      { q: 'What should you lead with in a first meeting?', a: 'Product pitch', b: 'Value, not a product pitch', c: 'Price list', d: 'Complaints', ans: 'B', cat: 'Building Relationships', diff: 'easy', expl: 'Lead with value, not with a product pitch — be a consultant first' },
      { q: 'How quickly should you connect on LinkedIn after meeting someone?', a: 'Within 1 month', b: 'Within 24 hours', c: 'Never', d: 'Within 1 year', ans: 'B', cat: 'Building Relationships', diff: 'easy', expl: 'Connect with every person you meet within 24 hours on LinkedIn' },
      { q: 'How often should you check in with active clients?', a: 'Never', b: 'Quarterly', c: 'Only when they complain', d: 'Once a year', ans: 'B', cat: 'Building Relationships', diff: 'medium', expl: 'Quarterly check-in calls with all active clients, even if no pending order' },
      { q: 'What builds trust most effectively?', a: 'Always recommending the most expensive option', b: 'Recommending what\'s best for the client, even if less expensive', c: 'Promising everything', d: 'Never following up', ans: 'B', cat: 'Building Relationships', diff: 'easy', expl: 'Be a consultant — recommend what\'s best for the client, even if it\'s not the most expensive' },
      { q: 'When should you follow through on a promise?', a: 'On the deadline', b: 'Before the deadline — if you say Tuesday, send it Monday', c: 'Never', d: 'Whenever you feel like it', ans: 'B', cat: 'Building Relationships', diff: 'easy', expl: 'Follow through early — if you say you\'ll send something by Tuesday, send it Monday' },
    ]},
    // ===== NEGOTIATION (4 modules × 5 questions) =====
    { moduleTitle: 'Negotiation Fundamentals', moduleType: 'NEGOTIATION', questions: [
      { q: 'What does BATNA stand for?', a: 'Best Approach To New Accounts', b: 'Best Alternative To Negotiated Agreement', c: 'Budget Allocation To Negotiate Assets', d: 'Buy And Trade Negotiation Approach', ans: 'B', cat: 'Negotiation Fundamentals', diff: 'easy', expl: 'BATNA = Best Alternative To Negotiated Agreement — your walk-away option' },
      { q: 'What is ZOPA?', a: 'Zone Of Price Aggression', b: 'Zone Of Possible Agreement', c: 'Zero Option Pricing Approach', d: 'Zonal Operating Performance Analysis', ans: 'B', cat: 'Negotiation Fundamentals', diff: 'medium', expl: 'ZOPA = Zone Of Possible Agreement — the range where both parties can agree' },
      { q: 'What is the maximum discount typically allowed at LAXREE?', a: '5%', b: '10%', c: '15%', d: '25%', ans: 'C', cat: 'Negotiation Fundamentals', diff: 'medium', expl: 'LAXREE\'s ZOPA is typically SSP to SSP minus 15% maximum discount' },
      { q: 'What is "anchoring" in negotiation?', a: 'Sailing terminology', b: 'The first number mentioned sets the negotiation range', c: 'Fixing the final price', d: 'Ignoring the client', ans: 'B', cat: 'Negotiation Fundamentals', diff: 'medium', expl: 'Anchoring: the first number mentioned sets the negotiation range. Always anchor high by quoting SSP first' },
      { q: 'What is a common negotiation mistake?', a: 'Listening carefully', b: 'Discounting too early', c: 'Asking questions', d: 'Being patient', ans: 'B', cat: 'Negotiation Fundamentals', diff: 'easy', expl: 'Discounting too early is a common mistake — always sell value first' },
    ]},
    { moduleTitle: 'Price Negotiation Strategies', moduleType: 'NEGOTIATION', questions: [
      { q: 'What discount can be offered for 150-300 room orders?', a: '0%', b: 'Up to 5%', c: 'Up to 8%', d: 'Up to 20%', ans: 'C', cat: 'Price Negotiation Strategies', diff: 'medium', expl: '150-300 rooms: up to 8% discount for multi-property or repeat orders' },
      { q: 'What is value bundling?', a: 'Selling only one product', b: 'Bundling multiple product categories for a package discount', c: 'Giving everything free', d: 'Selling at maximum price', ans: 'B', cat: 'Price Negotiation Strategies', diff: 'easy', expl: 'Value bundling = combining product categories for a package discount instead of discounting individual items' },
      { q: 'What should you do first when a client asks for a discount?', a: 'Immediately give 20% off', b: 'Acknowledge and reframe to value', c: 'Refuse completely', d: 'End the meeting', ans: 'B', cat: 'Price Negotiation Strategies', diff: 'easy', expl: 'First acknowledge the concern, then reframe to value and total cost of ownership' },
      { q: 'What condition is needed for 75-150 room discount?', a: 'No conditions', b: 'Full product bundle + confirmed timeline', c: 'Cash payment only', d: 'Minimum 1000 rooms', ans: 'B', cat: 'Price Negotiation Strategies', diff: 'medium', expl: '75-150 rooms: up to 5% with full product bundle + confirmed timeline' },
      { q: 'Why is value bundling better than individual discounts?', a: 'It\'s easier', b: 'Protects per-product margin while offering perceived discount', c: 'It costs more', d: 'Clients hate bundles', ans: 'B', cat: 'Price Negotiation Strategies', diff: 'medium', expl: 'Value bundling protects per-product margin while offering a perceived discount on the total package' },
    ]},
    { moduleTitle: 'Handling Tough Negotiators', moduleType: 'NEGOTIATION', questions: [
      { q: 'What should you do when negotiations stall?', a: 'Give up immediately', b: 'Pause, summarize, and identify the real objection', c: 'Lower the price drastically', d: 'Walk away without explanation', ans: 'B', cat: 'Handling Tough Negotiators', diff: 'easy', expl: 'When stalled: pause and summarize, identify the real objection behind the position' },
      { q: 'What is conditional concession language?', a: 'Take it or leave it', b: 'IF...THEN format — "IF you increase the order, THEN I can offer additional discount"', c: 'No concessions ever', d: 'Always say yes', ans: 'B', cat: 'Handling Tough Negotiators', diff: 'medium', expl: 'Conditional concessions use IF...THEN language: never give without getting something in return' },
      { q: 'When should you walk away from a deal?', a: 'Never', b: 'When demands exceed 12% discount or payment terms exceed 90 days', c: 'At the first objection', d: 'When the client asks questions', ans: 'B', cat: 'Handling Tough Negotiators', diff: 'medium', expl: 'Walk away when discount demands exceed 12%, payment terms are >90 days, or the deal is unprofitable' },
      { q: 'What is the purpose of bringing in a senior manager?', a: 'To intimidate the client', b: 'To signal commitment and authority', c: 'To replace the salesperson', d: 'To agree to any demands', ans: 'B', cat: 'Handling Tough Negotiators', diff: 'medium', expl: 'A manager\'s involvement signals commitment and authority, sometimes breaking deadlocks' },
      { q: 'What should a walk-away script emphasize?', a: 'Anger and frustration', b: 'Honesty, desire to make it work, and openness to revisit', c: 'Blame the client', d: 'Threaten the client', ans: 'B', cat: 'Handling Tough Negotiators', diff: 'easy', expl: 'A walk-away script should be honest, express desire to make it work, and propose revisiting the scope' },
    ]},
    { moduleTitle: 'Closing Techniques', moduleType: 'NEGOTIATION', questions: [
      { q: 'What is the assumptive close?', a: 'Assume the client will say no', b: 'Assume the decision is made and move to next steps', c: 'Assume the price is wrong', d: 'Assume the meeting is over', ans: 'B', cat: 'Closing Techniques', diff: 'easy', expl: 'Assumptive close: assume the decision is made and move to logistics like installation scheduling' },
      { q: 'What is a trial close?', a: 'A free trial offer', b: 'Testing readiness before the final ask', c: 'Closing the laptop', d: 'A court trial', ans: 'B', cat: 'Closing Techniques', diff: 'easy', expl: 'Trial close: test readiness with questions like "Does this address all your requirements?"' },
      { q: 'Which is an example of an alternative close?', a: '"Do you want to buy or not?"', b: '"Would you like to start with pilot 20 rooms or go full 150-room order?"', c: '"Take it or leave it"', d: '"Here\'s the price, bye"', ans: 'B', cat: 'Closing Techniques', diff: 'easy', expl: 'Alternative close gives two positive options, both leading to a sale' },
      { q: 'What creates legitimate urgency?', a: 'Fake deadlines', b: 'Quarterly SSP changes and production lead times', c: 'Threatening the client', d: 'Lying about inventory', ans: 'B', cat: 'Closing Techniques', diff: 'medium', expl: 'Legitimate urgency: quarterly SSP changes, production lead times, delivery deadlines' },
      { q: 'What does a summary close do?', a: 'Summarizes your company history', b: 'Summarizes all agreed points making "yes" obvious', c: 'Summarizes competitor products', d: 'Summarizes the weather', ans: 'B', cat: 'Closing Techniques', diff: 'easy', expl: 'Summary close: summarize all agreed points so "yes" becomes the natural next step' },
    ]},
    // ===== COMPETITIVE_INTELLIGENCE (4 modules × 5 questions) =====
    { moduleTitle: 'Know Your Competitors', moduleType: 'COMPETITIVE_INTELLIGENCE', questions: [
      { q: 'What is Godrej\'s main weakness in the hotel segment?', a: 'No products', b: 'Limited hotel-specific features, no single-vendor range', c: 'Too expensive', d: 'Bad website', ans: 'B', cat: 'Know Your Competitors', diff: 'easy', expl: 'Godrej has limited hotel-specific features and cannot offer a single-vendor range across 15+ categories' },
      { q: 'What is Hafele\'s main weakness?', a: 'Poor quality', b: 'Very premium pricing and slow delivery', c: 'No products', d: 'Indian company', ans: 'B', cat: 'Know Your Competitors', diff: 'medium', expl: 'Hafele has very premium pricing and slow delivery timelines' },
      { q: 'What is LAXREE\'s key differentiator vs all competitors?', a: 'Cheapest price', b: 'Single vendor for 15+ categories with PAN India service', c: 'Only sells mini bars', d: 'No warranty', ans: 'B', cat: 'Know Your Competitors', diff: 'easy', expl: 'LAXREE is the ONLY company offering 15+ categories from a single vendor with PAN India delivery AND service' },
      { q: 'What is the main weakness of local/Chinese imports?', a: 'Brand name', b: 'No warranty, inconsistent quality, no service network', c: 'Too expensive', d: 'Too many features', ans: 'B', cat: 'Know Your Competitors', diff: 'easy', expl: 'Local/Chinese imports have no warranty, inconsistent quality, and no service network' },
      { q: 'What custom option does LAXREE offer that competitors rarely do?', a: 'Free shipping', b: 'Hotel logo branding on products', c: '24/7 support', d: 'Gold plating', ans: 'B', cat: 'Know Your Competitors', diff: 'medium', expl: 'Custom hotel branding (logo on products) is rarely offered by competitors' },
    ]},
    { moduleTitle: 'Competitive Battle Cards', moduleType: 'COMPETITIVE_INTELLIGENCE', questions: [
      { q: 'What LAXREE mini bar feature does Godrej Qube lack?', a: 'Cooling', b: 'LED interior light and door lock', c: 'Power cord', d: 'Shelves', ans: 'B', cat: 'Competitive Battle Cards', diff: 'easy', expl: 'LAXREE mini bars have LED interior light and door lock, which Godrej Qube lacks' },
      { q: 'When should you use battle cards?', a: 'Always volunteer comparisons', b: 'Only when the client raises a competitor', c: 'Never', d: 'Only in emails', ans: 'B', cat: 'Competitive Battle Cards', diff: 'medium', expl: 'Don\'t volunteer comparisons — only use when the client raises a competitor' },
      { q: 'What is LAXREE\'s safe box audit trail advantage?', a: 'No audit trail', b: '100 records vs many competitors who don\'t offer it', c: '1 million records', d: 'Only for mini bars', ans: 'B', cat: 'Competitive Battle Cards', diff: 'medium', expl: 'LAXREE offers 100-record audit trail, which many Godrej/Yale/Hafele competitors don\'t offer' },
      { q: 'How should you handle competitor comparisons?', a: 'Disparage aggressively', b: 'Be factual and respectful, never disparage competitors', c: 'Ignore the question', d: 'Lie about competitor features', ans: 'B', cat: 'Competitive Battle Cards', diff: 'easy', expl: 'Be factual and respectful — never disparage competitors, always differentiate on merit' },
      { q: 'What is LAXREE\'s cooling advantage over Godrej Qube at 30°C?', a: 'Same performance', b: '6°C (solid) vs Godrej\'s 8-15°C+', c: 'No cooling advantage', d: 'Godrej cools better', ans: 'B', cat: 'Competitive Battle Cards', diff: 'medium', expl: 'LAXREE achieves 6°C (solid door) vs Godrej Qube\'s 8-15°C+ at 30°C ambient' },
    ]},
    { moduleTitle: 'Market Positioning & Differentiation', moduleType: 'COMPETITIVE_INTELLIGENCE', questions: [
      { q: 'What makes LAXREE\'s market position unique?', a: 'Cheapest products', b: 'Only company offering 15+ categories from single vendor with PAN India service', c: 'Largest company', d: 'Oldest company', ans: 'B', cat: 'Market Positioning', diff: 'easy', expl: 'LAXREE is the ONLY company offering 15+ categories from a single vendor with PAN India delivery AND service' },
      { q: 'How should you position LAXREE for procurement managers?', a: 'Cheapest option', b: '"One PO, one vendor, one warranty — simplifies procurement"', c: 'Most expensive option', d: 'Foreign brand', ans: 'B', cat: 'Market Positioning', diff: 'easy', expl: 'For procurement: "One PO, one vendor, one warranty, PAN India delivery — simplifies procurement"' },
      { q: 'What is LAXREE\'s competitive moat?', a: 'Low prices', b: 'Single-vendor convenience and PAN India service network — hard to replicate', c: 'Large office', d: 'Many employees', ans: 'B', cat: 'Market Positioning', diff: 'medium', expl: 'Single-vendor convenience and PAN India service network took years to build — hard for competitors to replicate' },
      { q: 'How should you position LAXREE for GMs?', a: 'Focus on price only', b: '"Products that improve guest satisfaction — silent bars, secure safes, PMS integration"', c: 'Focus on color options', d: 'Focus on delivery speed only', ans: 'B', cat: 'Market Positioning', diff: 'easy', expl: 'For GMs: "LAXREE products improve guest satisfaction — silent mini bars, secure safes with audit trail, PMS integration"' },
      { q: 'Can competitors easily replicate LAXREE\'s single-vendor advantage?', a: 'Yes, very easily', b: 'No — most excel in 1-2 categories but can\'t offer the full range', c: 'They already have', d: 'It takes only a week', ans: 'B', cat: 'Market Positioning', diff: 'medium', expl: 'Most competitors excel in 1-2 categories but can\'t offer the full 15+ category range' },
    ]},
    { moduleTitle: 'Winning Against Competition', moduleType: 'COMPETITIVE_INTELLIGENCE', questions: [
      { q: 'How should you counter "we already have a vendor"?', a: 'Dismiss their current vendor', b: 'Probe for dissatisfaction and offer a comparison or pilot', c: 'Walk away immediately', d: 'Lower the price drastically', ans: 'B', cat: 'Winning Against Competition', diff: 'easy', expl: 'Probe for dissatisfaction, offer a side-by-side comparison or pilot installation to earn trust' },
      { q: 'What is the attack point against Yale/Hafele?', a: 'Poor quality', b: 'Premium pricing and limited range beyond locks', c: 'No products', d: 'Bad reputation', ans: 'B', cat: 'Winning Against Competition', diff: 'medium', expl: 'Yale/Hafele have premium pricing and limited range beyond locks — can\'t supply mini bars, safes, kettles, etc.' },
      { q: 'What strategy works against local/Chinese imports?', a: 'Match their low price', b: 'Highlight warranty, service network, and spare parts availability', c: 'Ignore them', d: 'Say they are illegal', ans: 'B', cat: 'Winning Against Competition', diff: 'easy', expl: 'Emphasize: 1-year warranty, PAN India service, spare parts within 48 hours vs no warranty with imports' },
      { q: 'What is the pilot approach strategy?', a: 'Force the client to buy everything', b: 'Try LAXREE for one category first to earn trust', c: 'Give free products forever', d: 'Never offer trials', ans: 'B', cat: 'Winning Against Competition', diff: 'easy', expl: '"How about trying LAXREE for one category first? Let us earn your trust." — pilot approach closes at 90%+' },
      { q: 'What question should you ask when a client says "we have a vendor"?', a: '"You\'re wrong"', b: '"Are you happy with the product quality and service?"', c: '"Fire them"', d: '"Our price is lower"', ans: 'B', cat: 'Winning Against Competition', diff: 'easy', expl: 'Ask: "Are you happy with the product quality and service?" — probe for dissatisfaction naturally' },
    ]},
    // ===== INBOUND_SALES (4 modules × 5 questions) =====
    { moduleTitle: 'Handling Inbound Inquiries', moduleType: 'INBOUND_SALES', questions: [
      { q: 'What is the response time SLA for phone calls?', a: 'Within 1 hour', b: 'Answer within 3 rings', c: 'Within 24 hours', d: 'Next business day', ans: 'B', cat: 'Handling Inbound Inquiries', diff: 'easy', expl: 'Answer within 3 rings — never let calls go to voicemail during business hours' },
      { q: 'What is the email response SLA during business hours?', a: 'Within 2 hours', b: 'Within 24 hours', c: 'Within 1 week', d: 'No SLA', ans: 'A', cat: 'Handling Inbound Inquiries', diff: 'easy', expl: 'Respond to emails within 2 hours during business hours' },
      { q: 'What should you capture during a phone inquiry?', a: 'Only the caller\'s name', b: 'Name, property, star rating, room count, product interest', c: 'Only the product they want', d: 'Nothing, just wait for email', ans: 'B', cat: 'Handling Inbound Inquiries', diff: 'medium', expl: 'Capture: name, property name, star rating, room count, and product interest' },
      { q: 'What should every phone inquiry end with?', a: 'Just hang up', b: 'A set next step — schedule call, send catalog, or arrange visit', c: 'A promise to call back someday', d: 'Reading the entire product list', ans: 'B', cat: 'Handling Inbound Inquiries', diff: 'easy', expl: 'Always set a next step: schedule detailed call, send catalog, or arrange site visit' },
      { q: 'What is the WhatsApp response SLA during business hours?', a: 'Within 30 minutes', b: 'Within 24 hours', c: 'Within 1 week', d: 'No SLA', ans: 'A', cat: 'Handling Inbound Inquiries', diff: 'medium', expl: 'WhatsApp inquiries should be responded to within 30 minutes during business hours' },
    ]},
    { moduleTitle: 'Qualifying Inbound Leads', moduleType: 'INBOUND_SALES', questions: [
      { q: 'What does BANT stand for?', a: 'Buy, Analyze, Negotiate, Trade', b: 'Budget, Authority, Need, Timeline', c: 'Business, Account, Numbers, Target', d: 'Budget, Access, Network, Time', ans: 'B', cat: 'Qualifying Leads', diff: 'easy', expl: 'BANT = Budget, Authority, Need, Timeline' },
      { q: 'A lead with 4/4 BANT score is classified as?', a: 'Cold', b: 'Hot — immediate follow-up', c: 'Spam', d: 'Ignore', ans: 'B', cat: 'Qualifying Leads', diff: 'easy', expl: '4/4 BANT = Hot lead — immediate follow-up, proposal within 24hrs' },
      { q: 'What does "Authority" in BANT refer to?', a: 'Government authority', b: 'Whether you\'re speaking with the decision-maker', c: 'Authority to give discounts', d: 'Author of the email', ans: 'B', cat: 'Qualifying Leads', diff: 'easy', expl: 'Authority: Is the person you\'re speaking with the decision-maker or is there a committee?' },
      { q: 'What should you do with a 1/4 BANT lead?', a: 'Ignore completely', b: 'Add to mailing list, quarterly check-in', c: 'Send proposal immediately', d: 'Call every day', ans: 'B', cat: 'Qualifying Leads', diff: 'medium', expl: '1/4 BANT = Cold lead — add to mailing list, quarterly check-in' },
      { q: 'What timeline qualifies a "Hot" lead?', a: 'Decision within 1 year', b: 'Decision within 30 days', c: 'No timeline', d: 'Decision within 5 years', ans: 'B', cat: 'Qualifying Leads', diff: 'easy', expl: 'Hot leads have decision within 30 days (high Timeline score in BANT)' },
    ]},
    { moduleTitle: 'Product Recommendation by Hotel Type', moduleType: 'INBOUND_SALES', questions: [
      { q: 'Which mini bar is recommended for 5-star luxury?', a: 'LRMB-132 Compressor', b: 'LRMB-131 Absorption Mirror Finish', c: 'No mini bar', d: 'LRMB-126 Thermoelectric', ans: 'B', cat: 'Product Recommendations', diff: 'easy', expl: '5-star: LRMB-131 (40L Absorption, Mirror Finish, ₹9,800) — silent and premium' },
      { q: 'Which safe box for 3-star/budget hotels?', a: 'LRSB-209 Orbita', b: 'LRSB-201 Essential', c: 'LRSB-214 Laptop', d: 'No safe needed', ans: 'B', cat: 'Product Recommendations', diff: 'easy', expl: '3-star/budget: LRSB-201 Essential (₹1,700) — affordable and functional' },
      { q: 'What RFID lock is recommended for 4-star business?', a: 'LRFD-608', b: 'LRFD-609 Aluminium Alloy', c: 'LRFD-607', d: 'No lock needed', ans: 'B', cat: 'Product Recommendations', diff: 'medium', expl: '4-star: LRFD-609 (Aluminium Alloy, Gloss Paint, ₹4,500)' },
      { q: 'What is a natural cross-sell with mini bars?', a: 'Only more mini bars', b: 'Safes and kettles — natural bundle', c: 'Digital signages', d: 'Mattresses', ans: 'B', cat: 'Product Recommendations', diff: 'easy', expl: 'If they ask about mini bars → also recommend safes and kettles (natural bundle)' },
      { q: 'Which kettle is recommended for 3-star hotels?', a: 'LRWT-156 (1L Strix)', b: 'LRWT-143 (0.6L, ₹560)', c: 'No kettle needed', d: 'LRWT-150 (0.8L Strix)', ans: 'B', cat: 'Product Recommendations', diff: 'medium', expl: '3-star: LRWT-143 (0.6L, ₹560) — affordable and functional' },
    ]},
    { moduleTitle: 'Converting Inquiries to Orders', moduleType: 'INBOUND_SALES', questions: [
      { q: 'What should you send on Day 0 after a meeting?', a: 'Nothing', b: 'Thank-you email with product recommendations + catalog', c: 'Only a price list', d: 'Competitor comparison', ans: 'B', cat: 'Converting to Orders', diff: 'easy', expl: 'Same Day: Send thank-you email with product recommendations and catalog' },
      { q: 'When should you send a customized proposal?', a: 'Day 30', b: 'Day 5', c: 'Day 100', d: 'Never', ans: 'B', cat: 'Converting to Orders', diff: 'easy', expl: 'Day 5: Send customized proposal with product mix, pricing, and ROI calculations' },
      { q: 'What is a trial offer strategy?', a: 'Free products forever', b: 'Install 5 sample rooms for evaluation before full order', c: 'No trial needed', d: 'Force full order immediately', ans: 'B', cat: 'Converting to Orders', diff: 'easy', expl: '"Install 5 sample rooms so you can evaluate quality before committing" — trial closes at 90%+' },
      { q: 'What should a proposal include?', a: 'Only price', b: 'Product details, ROI analysis, delivery timeline, warranty, terms', c: 'Only warranty', d: 'Only delivery date', ans: 'B', cat: 'Converting to Orders', diff: 'medium', expl: 'Proposal should include: cover page, executive summary, product details, ROI analysis, delivery timeline, warranty, and terms' },
      { q: 'What is the typical conversion rate for trial installations?', a: '10%', b: '50%', c: '90%+', d: '5%', ans: 'C', cat: 'Converting to Orders', diff: 'medium', expl: 'Trial installations typically close at 90%+ conversion rate' },
    ]},
    // ===== CERTIFICATION_PREP (4 modules × 5 questions) =====
    { moduleTitle: 'Product Knowledge Certification Prep', moduleType: 'CERTIFICATION_PREP', questions: [
      { q: 'How many safe box series does LAXREE offer?', a: '2', b: '4', c: '6', d: '8', ans: 'B', cat: 'Product Knowledge Cert Prep', diff: 'easy', expl: '4 series: Essential, Medium, Laptop, Orbita' },
      { q: 'What is the SSP of LRMB-131?', a: '₹6,700', b: '₹8,400', c: '₹9,800', d: '₹12,000', ans: 'C', cat: 'Product Knowledge Cert Prep', diff: 'medium', expl: 'LRMB-131 is the 40L Solid Door Mirror Finish Absorption model at ₹9,800 SSP' },
      { q: 'Which RFID lock model is fire rated?', a: 'LRFD-608', b: 'LRFD-609', c: 'LRFD-607', d: 'LRFD-610', ans: 'C', cat: 'Product Knowledge Cert Prep', diff: 'medium', expl: 'LRFD-607 is 304 SS, moisture proof, fire rated with 1680 audit records' },
      { q: 'What is special about Strix controller in kettles?', a: 'It makes tea taste better', b: 'Premium, longer-lasting auto-shutoff mechanism', c: 'It boils water faster', d: 'It cools water', ans: 'B', cat: 'Product Knowledge Cert Prep', diff: 'easy', expl: 'Strix controller (LRWT-150, LRWT-156) is a premium auto-shutoff mechanism with longer life' },
      { q: 'How many mini bar models does LAXREE offer?', a: '3', b: '5', c: '7', d: '10', ans: 'C', cat: 'Product Knowledge Cert Prep', diff: 'easy', expl: '7 models: LRMB-132 through LRMB-131' },
    ]},
    { moduleTitle: 'Sales Skills Certification Prep', moduleType: 'CERTIFICATION_PREP', questions: [
      { q: 'In LACE, what does "A" stand for?', a: 'Argue', b: 'Acknowledge', c: 'Agree', d: 'Analyze', ans: 'B', cat: 'Sales Skills Cert Prep', diff: 'easy', expl: 'LACE: Listen, Acknowledge, Counter, Engage' },
      { q: 'What is the first step in value selling?', a: 'Present products', b: 'Discover — understand client\'s pain points, budget, priorities', c: 'Close the deal', d: 'Give discounts', ans: 'B', cat: 'Sales Skills Cert Prep', diff: 'easy', expl: '5-step consultative: Discover → Educate → Customize → Prove → Close' },
      { q: 'What buyer type focuses on ROI?', a: 'Architect', b: 'Hotel Owner', c: 'Interior Designer', d: 'Project Manager', ans: 'B', cat: 'Sales Skills Cert Prep', diff: 'easy', expl: 'Hotel Owner focuses on ROI, cost savings, and brand value' },
      { q: 'What happens on Day 3 of the follow-up system?', a: 'Send proposal', b: 'Value Add — share case study, ROI calculator, or industry insight', c: 'Decision push', d: 'Same-day recap', ans: 'B', cat: 'Sales Skills Cert Prep', diff: 'medium', expl: 'Day 3: Value Add — share something useful (case study, ROI calculator, industry insight)' },
      { q: 'What approach should you use with an Interior Designer?', a: 'Focus on SSP only', b: 'Show product catalogs, finish options, design flexibility', c: 'Talk about technical specs only', d: 'Skip the meeting', ans: 'B', cat: 'Sales Skills Cert Prep', diff: 'easy', expl: 'Interior Designer: Show product catalogs, finish options, design flexibility' },
    ]},
    { moduleTitle: 'Mock Exam Practice', moduleType: 'CERTIFICATION_PREP', questions: [
      { q: 'What is the passing score for certification exams?', a: '50%', b: '70%', c: '90%', d: '100%', ans: 'B', cat: 'Mock Exam Practice', diff: 'easy', expl: '70% is the passing score (35/50 correct)' },
      { q: 'How many questions are on the certification exam?', a: '20', b: '30', c: '50', d: '100', ans: 'C', cat: 'Mock Exam Practice', diff: 'easy', expl: 'Certification exam has 50 multiple-choice questions' },
      { q: 'What score earns a "Distinction"?', a: '70%+', b: '80%+', c: '90%+', d: '100%', ans: 'C', cat: 'Mock Exam Practice', diff: 'easy', expl: '90%+ = Distinction — Ready for advanced certifications' },
      { q: 'How much time do you have for the exam?', a: '30 minutes', b: '60 minutes', c: '120 minutes', d: 'Unlimited', ans: 'B', cat: 'Mock Exam Practice', diff: 'easy', expl: '60 minutes for 50 questions' },
      { q: 'What time management strategy is recommended?', a: 'Spend 10 minutes per question', b: 'Max 1 minute per question, flag difficult ones and return', c: 'Start with the hardest questions', d: 'Skip every other question', ans: 'B', cat: 'Mock Exam Practice', diff: 'medium', expl: 'Spend max 1 minute per question — flag difficult ones and return to them later' },
    ]},
    { moduleTitle: 'Field Readiness Assessment', moduleType: 'CERTIFICATION_PREP', questions: [
      { q: 'What is the 70/30 rule?', a: '70% selling, 30% listening', b: 'Client talks 70%, you talk 30%', c: '70% price, 30% value', d: '70% email, 30% phone', ans: 'B', cat: 'Field Readiness', diff: 'easy', expl: '70/30 rule: the client should talk 70% of the time, you talk 30%' },
      { q: 'How should you demonstrate a mini bar?', a: 'Just describe it', b: 'Show LED light, door lock, and emphasize silent operation', c: 'Open and close the door repeatedly', d: 'Turn it upside down', ans: 'B', cat: 'Field Readiness', diff: 'easy', expl: 'Demonstrate LED light, door lock, and emphasize silent operation' },
      { q: 'What mistake should you avoid in client meetings?', a: 'Being on time', b: 'Talking too much and not listening', c: 'Bringing product samples', d: 'Having business cards', ans: 'B', cat: 'Field Readiness', diff: 'easy', expl: 'Don\'t talk too much — follow the 70/30 rule (listen 70%)' },
      { q: 'How should you demo a safe box?', a: 'Show the keypad, try wrong code for auto-lockout, show LED light', b: 'Only show the outside', c: 'Just talk about specs', d: 'Don\'t demo, just send brochure', ans: 'A', cat: 'Field Readiness', diff: 'medium', expl: 'Show keypad, try wrong code to demonstrate auto-lockout, show LED interior light' },
      { q: 'What should you never leave a meeting without?', a: 'A signed order', b: 'A clear next step / follow-up date', c: 'The client\'s money', d: 'Product samples', ans: 'B', cat: 'Field Readiness', diff: 'easy', expl: 'Never leave without a clear next step — always set a follow-up date' },
    ]},
    // ===== MOCK_SIMULATOR (4 modules × 5 questions) =====
    { moduleTitle: 'Simulation Overview & Scoring', moduleType: 'MOCK_SIMULATOR', questions: [
      { q: 'How many scoring categories are in simulations?', a: '2', b: '3', c: '4', d: '6', ans: 'C', cat: 'Simulation Overview', diff: 'easy', expl: '4 categories: Communication, Technical Knowledge, Product Knowledge, Sales Skills' },
      { q: 'What does a 90%+ simulation score indicate?', a: 'Beginner level', b: 'Expert Level — Ready for any client scenario', c: 'Needs improvement', d: 'Failed', ans: 'B', cat: 'Simulation Overview', diff: 'easy', expl: '90%+ = Expert Level — Ready for any client scenario' },
      { q: 'How many questions are in each simulation?', a: '3', b: '5', c: '10', d: '20', ans: 'B', cat: 'Simulation Overview', diff: 'easy', expl: 'Each simulation has 5 scenario-based questions' },
      { q: 'What weight does each scoring category carry?', a: '10% each', b: '25% each', c: '50% each', d: 'Unequal weights', ans: 'B', cat: 'Simulation Overview', diff: 'easy', expl: 'All 4 categories carry equal 25% weight' },
      { q: 'What is the goal of simulations?', a: 'To punish mistakes', b: 'Learning and improvement, not perfection', c: 'To eliminate employees', d: 'To compare with colleagues', ans: 'B', cat: 'Simulation Overview', diff: 'easy', expl: 'Practice as many times as you need — learning is the goal, not perfection' },
    ]},
    { moduleTitle: 'Scenario Preparation', moduleType: 'MOCK_SIMULATOR', questions: [
      { q: 'What should you do first when you receive a scenario?', a: 'Start answering immediately', b: 'Read carefully and understand client profile and property type', c: 'Skip the scenario', d: 'Only look at the questions', ans: 'B', cat: 'Scenario Preparation', diff: 'easy', expl: 'Read the scenario carefully — understand the client profile and property type first' },
      { q: 'What should you always recommend?', a: 'Only one product', b: 'A bundle — never just one product category', c: 'The cheapest option', d: 'The most expensive option', ans: 'B', cat: 'Scenario Preparation', diff: 'easy', expl: 'Always recommend a bundle — never just one product category' },
      { q: 'For a 5-star property, which safe box should you recommend?', a: 'Essential', b: 'Orbita', c: 'Medium', d: 'No safe needed', ans: 'B', cat: 'Scenario Preparation', diff: 'easy', expl: '5-Star → Orbita safes (audit trail, LED, premium positioning)' },
      { q: 'What should you prepare for likely objections?', a: 'Nothing, improvise', b: 'Prepare responses based on the scenario context', c: 'A list of excuses', d: 'A way to change the subject', ans: 'B', cat: 'Scenario Preparation', diff: 'medium', expl: 'Prepare for likely objections based on the specific scenario and client profile' },
      { q: 'For a 3-star property, which mini bar is appropriate?', a: 'Absorption Mirror Finish', b: 'Compressor (affordable)', c: 'No mini bar', d: 'Most expensive model', ans: 'B', cat: 'Scenario Preparation', diff: 'easy', expl: '3-Star → Compressor mini bars (affordable, functional)' },
    ]},
    { moduleTitle: 'Communication Excellence', moduleType: 'MOCK_SIMULATOR', questions: [
      { q: 'What is active listening?', a: 'Waiting for your turn to speak', b: 'Letting the client finish, paraphrasing, asking clarifying questions', c: 'Agreeing with everything', d: 'Taking notes silently', ans: 'B', cat: 'Communication Excellence', diff: 'easy', expl: 'Active listening: let client finish, paraphrase their concern, ask clarifying questions' },
      { q: 'Instead of "Our product is better," you should say?', a: '"Their product is terrible"', b: '"LAXREE offers features specifically designed for hotels"', c: '"We are #1"', d: '"Just trust me"', ans: 'B', cat: 'Communication Excellence', diff: 'easy', expl: 'Professional: "LAXREE offers features specifically designed for hotels"' },
      { q: 'Instead of "I don\'t know," you should say?', a: '"Let me check and get the exact details for you"', b: '"I don\'t care"', c: '"Figure it out yourself"', d: '"I\'m new here"', ans: 'A', cat: 'Communication Excellence', diff: 'easy', expl: '"Great question — let me get the exact details for you" is professional and builds trust' },
      { q: 'What type of question is "What challenges are you facing?"', a: 'Closed-ended', b: 'Open-ended', c: 'Leading', d: 'Rhetorical', ans: 'B', cat: 'Communication Excellence', diff: 'easy', expl: 'Open-ended questions encourage the client to share more information' },
      { q: 'What is a closing question example?', a: '"What\'s your budget?"', b: '"If we can address these concerns, would you be ready to move forward?"', c: '"Do you like our products?"', d: '"What time is it?"', ans: 'B', cat: 'Communication Excellence', diff: 'medium', expl: 'Closing question: "If we can address these concerns, would you be ready to move forward?"' },
    ]},
    { moduleTitle: 'Performance Analysis & Improvement', moduleType: 'MOCK_SIMULATOR', questions: [
      { q: 'How often should you complete simulations?', a: 'Once a year', b: 'At least 2 simulations per week', c: 'Never', d: 'Only when forced', ans: 'B', cat: 'Performance Analysis', diff: 'easy', expl: 'Complete at least 2 simulations per week for continuous improvement' },
      { q: 'What should you do after each simulation?', a: 'Ignore the results', b: 'Review your scorecard and focus study on weakest category', c: 'Only look at the total score', d: 'Delete the results', ans: 'B', cat: 'Performance Analysis', diff: 'easy', expl: 'Review your scorecard after each attempt, focus next study session on weakest category' },
      { q: 'What target should you aim for across all categories?', a: '50%+', b: 'Consistent 80%+ scores', c: '100% only', d: '30%+', ans: 'B', cat: 'Performance Analysis', diff: 'easy', expl: 'Aim for consistent 80%+ scores across all categories' },
      { q: 'How should you improve a low Technical score?', a: 'Ignore it', b: 'Review Technical Learning modules, memorize installation steps', c: 'Only practice simulations', d: 'Give up on technical', ans: 'B', cat: 'Performance Analysis', diff: 'easy', expl: 'Low Technical: Review Technical Learning modules, memorize installation steps, study troubleshooting' },
      { q: 'What does AI feedback provide?', a: 'Generic advice', b: 'Personalized recommendations based on performance pattern', c: 'No feedback', d: 'Only criticism', ans: 'B', cat: 'Performance Analysis', diff: 'medium', expl: 'AI feedback provides personalized recommendations based on your specific performance pattern' },
    ]},
    // ===== AI_COACH (4 modules × 5 questions) =====
    { moduleTitle: 'Using AI Coaching Effectively', moduleType: 'AI_COACH', questions: [
      { q: 'What can the LAXREE AI Coach do?', a: 'Only answer product questions', b: 'Answer questions, role-play scenarios, analyze sales approach, create study plans', c: 'Only send emails', d: 'Only make phone calls', ans: 'B', cat: 'Using AI Coaching', diff: 'easy', expl: 'AI Coach can answer product questions, role-play scenarios, analyze sales approach, create study plans, generate email templates' },
      { q: 'How should you ask questions to the AI Coach?', a: 'Be vague and general', b: 'Be specific with context like hotel type, room count, and situation', c: 'Only ask yes/no questions', d: 'Never ask questions', ans: 'B', cat: 'Using AI Coaching', diff: 'easy', expl: 'Be specific: "What\'s the best mini bar for a 5-star coastal resort?" not "tell me about mini bars"' },
      { q: 'What is an effective AI coaching request?', a: '"Tell me stuff"', b: '"Can you role-play as a hotel GM who thinks our safe boxes are too expensive?"', c: '"Hi"', d: '"Whatever"', ans: 'B', cat: 'Using AI Coaching', diff: 'easy', expl: 'Specific requests with context get the best results from AI coaching' },
      { q: 'Can AI Coach create email templates?', a: 'No', b: 'Yes, along with proposal frameworks', c: 'Only for personal emails', d: 'Only for spam', ans: 'B', cat: 'Using AI Coaching', diff: 'easy', expl: 'AI Coach can generate email templates and proposal frameworks' },
      { q: 'What should you share with the AI Coach for goals?', a: 'Nothing', b: 'Certification target date and latest simulation scores', c: 'Only your name', d: 'Your competitor\'s data', ans: 'B', cat: 'Using AI Coaching', diff: 'medium', expl: 'Share your certification target date and simulation scores for personalized planning' },
    ]},
    { moduleTitle: 'Personalized Learning Paths', moduleType: 'AI_COACH', questions: [
      { q: 'What data does AI use to analyze skills?', a: 'Only age', b: 'Quiz performance, simulation scores, module completion, time spent', c: 'Only height', d: 'Only email address', ans: 'B', cat: 'Personalized Learning Paths', diff: 'easy', expl: 'AI analyzes: quiz performance, simulation scores, module completion, and time spent learning' },
      { q: 'What is the first step in adaptive learning?', a: 'Jump to advanced content', b: 'Assessment — identify current skill level', c: 'Skip to certification', d: 'No assessment needed', ans: 'B', cat: 'Personalized Learning Paths', diff: 'easy', expl: 'Step 1: Assessment — AI identifies your current skill level across all categories' },
      { q: 'How does AI rank skill gaps?', a: 'Randomly', b: 'By impact on sales performance', c: 'Alphabetically', d: 'By difficulty', ans: 'B', cat: 'Personalized Learning Paths', diff: 'medium', expl: 'AI ranks skill gaps by their impact on sales performance, prioritizing the most impactful improvements' },
      { q: 'What does AI provide after identifying gaps?', a: 'Nothing', b: 'Specific module recommendations and targeted practice', c: 'Only criticism', d: 'A certificate', ans: 'B', cat: 'Personalized Learning Paths', diff: 'easy', expl: 'AI provides specific module recommendations to close each gap plus targeted practice activities' },
      { q: 'How does AI track improvement?', a: 'It doesn\'t', b: 'Monitors progress and adjusts recommendations over time', c: 'Only once', d: 'Through social media', ans: 'B', cat: 'Personalized Learning Paths', diff: 'easy', expl: 'AI monitors your improvement and continuously adjusts recommendations as you progress' },
    ]},
    { moduleTitle: 'Practice Conversations', moduleType: 'AI_COACH', questions: [
      { q: 'What types of conversations can you practice with AI?', a: 'Only one type', b: 'Cold calls, objection handling, product presentation, price negotiation, closing', c: 'Only closing', d: 'No conversation practice', ans: 'B', cat: 'Practice Conversations', diff: 'easy', expl: 'Practice cold call openings, objection handling, product presentation, price negotiation, and closing' },
      { q: 'How many practice conversations per week minimum?', a: '1', b: '3', c: '10', d: '50', ans: 'B', cat: 'Practice Conversations', diff: 'easy', expl: 'Minimum 3 practice conversations per week' },
      { q: 'What should you vary in practice?', a: 'Only practice what you\'re good at', b: 'Vary scenario type — practice what you\'re NOT good at', c: 'Only do the same scenario', d: 'Never practice', ans: 'B', cat: 'Practice Conversations', diff: 'easy', expl: 'Vary the scenario type — don\'t just practice what you\'re good at' },
      { q: 'What does AI feedback include after conversations?', a: 'Only pass/fail', b: 'Scores on Relevance, Professionalism, Persuasiveness, Product Accuracy', c: 'No feedback', d: 'Only spelling corrections', ans: 'B', cat: 'Practice Conversations', diff: 'medium', expl: 'AI provides scores on Relevance, Professionalism, Persuasiveness, and Product Accuracy' },
      { q: 'What should you do with low-scoring scenarios?', a: 'Avoid them', b: 'Revisit and practice them with increasingly difficult personas', c: 'Delete them', d: 'Ignore the score', ans: 'B', cat: 'Practice Conversations', diff: 'easy', expl: 'Revisit scenarios where you scored low, practice with increasingly difficult client personas' },
    ]},
    { moduleTitle: 'Career Development with AI', moduleType: 'AI_COACH', questions: [
      { q: 'What is Level 3 in LAXREE career path?', a: 'Sales Executive', b: 'Senior Sales Executive', c: 'Team Leader', d: 'CEO', ans: 'C', cat: 'Career Development', diff: 'easy', expl: 'Level 3: Team Leader — manage a sales team and mentor juniors' },
      { q: 'What leadership skill is needed for Level 3?', a: 'None', b: 'Team coaching and mentoring', c: 'Only coding', d: 'Only accounting', ans: 'B', cat: 'Career Development', diff: 'easy', expl: 'Level 3 (Team Leader) requires team coaching and peer mentoring skills' },
      { q: 'What product knowledge is expected at Level 4?', a: 'None', b: 'Industry authority level', c: 'Basic only', d: 'Just one product', ans: 'B', cat: 'Career Development', diff: 'medium', expl: 'Level 4 (Sales Manager) requires industry authority-level product knowledge' },
      { q: 'What can AI predict about your career?', a: 'Your exact salary', b: 'Readiness timeline based on current progress', c: 'Your retirement date', d: 'Your lucky number', ans: 'B', cat: 'Career Development', diff: 'medium', expl: 'AI predicts your readiness timeline for promotion based on current progress' },
      { q: 'What does AI career guidance identify?', a: 'Your horoscope', b: 'Skills you need for the next level', c: 'Your competition', d: 'Your lunch order', ans: 'B', cat: 'Career Development', diff: 'easy', expl: 'AI identifies skills you need for the next career level and tracks progress against promotion criteria' },
    ]},
  ]

  // Create all questions in the database
  for (const mq of moduleQuestions) {
    for (const q of mq.questions) {
      const qb = await db.questionBank.create({
        data: {
          question: q.q,
          optionA: q.a,
          optionB: q.b,
          optionC: q.c,
          optionD: q.d,
          correctAnswer: q.ans,
          explanation: q.expl,
          category: q.cat,
          difficulty: q.diff,
          moduleType: mq.moduleType as any,
        }
      })
      questionBanks.push({ ...qb, moduleTitle: mq.moduleTitle, moduleType: mq.moduleType })
    }
  }

  // Create Module-Specific Assessments (one per module)
  const moduleTitles = moduleQuestions.map(mq => mq.moduleTitle)
  for (const moduleTitle of moduleTitles) {
    const mq = moduleQuestions.find(m => m.moduleTitle === moduleTitle)!
    const assessment = await db.assessment.create({
      data: {
        title: `${moduleTitle} - Quiz`,
        description: `Assessment for module: ${moduleTitle}`,
        moduleType: mq.moduleType as any,
        duration: 10,
        passingScore: 70,
        totalQuestions: 5,
      }
    })
    moduleAssessments.push({ ...assessment, moduleTitle })
  }

  // Create AssessmentQuestion records linking each question to its module assessment
  for (const q of questionBanks) {
    const assessment = moduleAssessments.find((a: any) => a.moduleTitle === q.moduleTitle)
    if (assessment) {
      const existingCount = await db.assessmentQuestion.count({
        where: { assessmentId: assessment.id }
      })
      await db.assessmentQuestion.create({
        data: {
          assessmentId: assessment.id,
          questionBankId: q.id,
          order: existingCount + 1,
        }
      })
    }
  }

  // Also create 2 aggregate assessments for overall evaluation
  const productQuestions = questionBanks.filter((q: any) => q.moduleType === 'PRODUCT_ACADEMY')
  const productAggregateAssessment = await db.assessment.create({
    data: {
      title: 'Product Knowledge Assessment',
      description: 'Comprehensive test of LAXREE product knowledge across all categories',
      moduleType: 'PRODUCT_ACADEMY',
      duration: 30,
      passingScore: 70,
      totalQuestions: productQuestions.length,
    }
  })
  for (let i = 0; i < productQuestions.length; i++) {
    await db.assessmentQuestion.create({
      data: { assessmentId: productAggregateAssessment.id, questionBankId: productQuestions[i].id, order: i + 1 }
    })
  }

  const salesQuestions = questionBanks.filter((q: any) => q.moduleType === 'SALES_ACADEMY')
  const salesAggregateAssessment = await db.assessment.create({
    data: {
      title: 'Sales Skills Assessment',
      description: 'Comprehensive evaluation of sales skills and methodologies',
      moduleType: 'SALES_ACADEMY',
      duration: 25,
      passingScore: 70,
      totalQuestions: salesQuestions.length,
    }
  })
  for (let i = 0; i < salesQuestions.length; i++) {
    await db.assessmentQuestion.create({
      data: { assessmentId: salesAggregateAssessment.id, questionBankId: salesQuestions[i].id, order: i + 1 }
    })
  }

  const fieldSalesQuestions = questionBanks.filter((q: any) => q.moduleType === 'FIELD_SALES')
  const fieldSalesAggregateAssessment = await db.assessment.create({
    data: {
      title: 'Field Sales Readiness Assessment',
      description: 'Certification assessment for field sales readiness',
      moduleType: 'FIELD_SALES',
      duration: 25,
      passingScore: 70,
      totalQuestions: fieldSalesQuestions.length,
    }
  })
  for (let i = 0; i < fieldSalesQuestions.length; i++) {
    await db.assessmentQuestion.create({
      data: { assessmentId: fieldSalesAggregateAssessment.id, questionBankId: fieldSalesQuestions[i].id, order: i + 1 }
    })
  }

  // Create Certifications
  await db.certification.createMany({
    data: [
      { name: 'Product Knowledge Certified', description: 'Certified in LAXREE product knowledge', moduleType: 'PRODUCT_ACADEMY', requiredScore: 70, validityPeriod: 12 },
      { name: 'Sales Readiness Certified', description: 'Certified for sales operations', moduleType: 'SALES_ACADEMY', requiredScore: 75, validityPeriod: 6 },
      { name: 'Field Sales Ready', description: 'Approved for field sales operations', moduleType: 'FIELD_SALES', requiredScore: 80, validityPeriod: 6 },
      { name: 'Inbound Sales Ready', description: 'Approved for inbound sales operations', moduleType: 'INBOUND_SALES', requiredScore: 75, validityPeriod: 6 },
      { name: 'Hospitality Expert', description: 'Expert certification in hospitality knowledge', moduleType: 'HOSPITALITY', requiredScore: 80, validityPeriod: 12 },
    ]
  })

  // Create Mock Simulations with real scenarios
  const realSimulations = [
    { title: 'Hotel GM Meeting Simulation', description: 'Practice meeting with a hotel General Manager to pitch LAXREE mini bars for their 150-room property', type: 'field_sales', scenario: JSON.stringify({ context: 'You are meeting with the GM of a 4-star business hotel with 150 rooms. They currently use Godrej Qube mini bars and are experiencing guest complaints about noise. Your goal is to pitch LAXREE thermoelectric mini bars.', objectives: ['Demonstrate quiet operation advantage', 'Show ROI with electricity savings', 'Handle price objection', 'Close with a trial order'] }) },
    { title: 'Inbound Inquiry Handling', description: 'Handle an incoming sales inquiry about safe boxes from a hotel procurement manager', type: 'inbound_sales', scenario: JSON.stringify({ context: 'A procurement manager from a new 5-star hotel calls asking about safe box options for 200 rooms. They need a solution with audit trail capability.', objectives: ['Qualify the lead', 'Recommend the right model', 'Explain audit trail features', 'Schedule a product demo'] }) },
    { title: 'Negotiation Challenge', description: 'Negotiate pricing on a bulk order for a hotel chain with 500 rooms across 3 properties', type: 'negotiation', scenario: JSON.stringify({ context: 'A hotel chain wants to equip 500 rooms with mini bars, safe boxes, and kettles. They are comparing LAXREE with 2 other vendors. The procurement head is pushing for 25% discount.', objectives: ['Maintain value positioning', 'Offer strategic concessions', 'Bundle products for better pricing', 'Close the deal profitably'] }) },
    { title: 'Safe Box Demo Presentation', description: 'Present the Orbita safe box to a luxury hotel procurement team', type: 'field_sales', scenario: JSON.stringify({ context: 'You are presenting the LRSB-209 Orbita Laptop Safe Box to a 5-star hotel procurement team. They are currently using a competitor product without audit trail or LED interior light.', objectives: ['Highlight unique features', 'Demonstrate competitive advantage', 'Handle technical questions', 'Propose a pilot installation'] }) },
    { title: 'Resort Project Needs Analysis', description: 'Conduct needs analysis for a new 300-room beach resort project', type: 'customer_discovery', scenario: JSON.stringify({ context: 'A new beach resort is being built with 300 rooms. You have a meeting with the project consultant to understand their requirements across all product categories.', objectives: ['Identify product needs per room type', 'Understand project timeline', 'Discuss coastal-specific requirements', 'Position LAXREE as single-source vendor'] }) },
  ]

  for (const sim of realSimulations) {
    await db.mockSimulation.create({ data: { title: sim.title, description: sim.description, type: sim.type, scenario: sim.scenario } })
  }

  // Create some enrollments for employees
  for (const emp of employees.slice(0, 8)) {
    for (const course of allCourses.slice(0, 5)) {
      const progress = Math.random() * 100
      await db.enrollment.create({
        data: {
          userId: emp.id, courseId: course.id, progress: Math.round(progress),
          status: progress >= 100 ? 'completed' : progress > 0 ? 'in_progress' : 'enrolled',
          completedAt: progress >= 100 ? new Date() : null,
        }
      })
    }
  }

  // Create some assessment attempts (using aggregate product assessment)
  for (const emp of employees.slice(0, 6)) {
    const score = Math.round(Math.random() * 40 + 50)
    const totalQ = productQuestions.length
    const correct = Math.round(totalQ * score / 100)
    const attempt = await db.assessmentAttempt.create({
      data: { userId: emp.id, assessmentId: productAggregateAssessment.id, score, totalMarks: totalQ, correctAnswers: correct, wrongAnswers: totalQ - correct, percentage: score, passed: score >= 70, completedAt: new Date() }
    })
    await db.scorecard.create({
      data: {
        userId: emp.id, assessmentAttemptId: attempt.id, examName: 'Product Knowledge Assessment',
        totalQuestions: totalQ, correctAnswers: correct, wrongAnswers: totalQ - correct, scorePercentage: score,
        rank: Math.floor(Math.random() * 10) + 1, departmentRank: Math.floor(Math.random() * 5) + 1, companyRank: Math.floor(Math.random() * 10) + 1,
        passStatus: score >= 70, certificationStatus: score >= 70 ? 'approved' : 'pending',
        aiFeedback: score >= 70 ? 'Strong product knowledge demonstrated. Consider advanced certification.' : 'Additional product training recommended.',
      }
    })
  }

  // Create Badges
  const badge1 = await db.badge.create({ data: { name: 'First Course Complete', description: 'Completed your first course', icon: '🎓', criteria: 'Complete 1 course' } })
  const badge2 = await db.badge.create({ data: { name: 'Product Expert', description: 'Scored 90%+ on product assessment', icon: '🏆', criteria: 'Score 90%+ on product assessment' } })
  const badge3 = await db.badge.create({ data: { name: 'Sales Ready', description: 'Achieved sales readiness certification', icon: '🎯', criteria: 'Get sales readiness certified' } })
  const badge4 = await db.badge.create({ data: { name: 'Top Performer', description: 'Ranked in top 3 of department', icon: '⭐', criteria: 'Top 3 in department ranking' } })

  // Assign badges to some employees
  if (employees[0]) await db.userBadge.create({ data: { userId: employees[0].id, badgeId: badge1.id } })
  if (employees[1]) await db.userBadge.create({ data: { userId: employees[1].id, badgeId: badge2.id } })
  if (employees[2]) await db.userBadge.create({ data: { userId: employees[2].id, badgeId: badge3.id } })

  // Create Platform Settings
  await db.platformSetting.createMany({
    data: [
      { key: 'company_name', value: 'LAXREE', category: 'branding' },
      { key: 'company_tagline', value: 'Premium Hotel Amenities & Solutions', category: 'branding' },
      { key: 'primary_color', value: '#059669', category: 'theme' },
      { key: 'secondary_color', value: '#0D9488', category: 'theme' },
      { key: 'certification_passing_score', value: '70', category: 'certification' },
      { key: 'leaderboard_enabled', value: 'true', category: 'gamification' },
      { key: 'badges_enabled', value: 'true', category: 'gamification' },
      { key: 'ai_coaching_enabled', value: 'true', category: 'ai_settings' },
      { key: 'field_readiness_score', value: '80', category: 'certification' },
      { key: 'inbound_readiness_score', value: '75', category: 'certification' },
    ]
  })

  // Create Notifications
  for (const emp of employees.slice(0, 5)) {
    await db.notification.createMany({
      data: [
        { userId: emp.id, title: 'Welcome to LAXREE Academy!', message: 'Start your learning journey today.', type: 'info' },
        { userId: emp.id, title: 'New Course Available', message: 'Field Sales Academy is now available.', type: 'info' },
      ]
    })
  }

  // Create Documents
  await db.document.createMany({
    data: [
      { title: 'LAXREE Master Catalogue', type: 'catalog', fileName: 'Laxree Master Catalogue  New.pdf', fileUrl: '/upload/Laxree Master Catalogue  New.pdf', category: 'catalog' },
      { title: 'Mini Bar Product Guide', type: 'pdf', fileName: 'Mini Bar.pdf', fileUrl: '/upload/Mini Bar.pdf', category: 'product' },
      { title: 'Safe Box Product Guide', type: 'pdf', fileName: 'Safe Box.pdf', fileUrl: '/upload/Safe Box.pdf', category: 'product' },
      { title: 'Laxree Sales Training Manual', type: 'pdf', fileName: 'Laxree_Sales_Training_Manual.pdf', fileUrl: '/upload/Laxree_Sales_Training_Manual.pdf', category: 'training' },
      { title: 'Amenities SSP', type: 'sop', fileName: 'Amenities SSP dtd 10.3.26 (All) (1).pdf', fileUrl: '/upload/Amenities SSP dtd 10.3.26 (All) (1).pdf', category: 'product' },
      { title: 'Hotel Amenities Presentation', type: 'video', fileName: 'LAXREE_Hotel_Amenities KOTA HOTEL_UPDATED - Copy.pptx', fileUrl: '/upload/LAXREE_Hotel_Amenities KOTA HOTEL_UPDATED - Copy.pptx', category: 'presentation' },
      { title: 'MiniBar Answer Sheet', type: 'sop', fileName: 'Laxree_MiniBar_AnswerSheet (2).docx', fileUrl: '/upload/Laxree_MiniBar_AnswerSheet (2).docx', category: 'assessment' },
      { title: 'SSP Final', type: 'pdf', fileName: 'SSP Final OLD (12).xlsx', fileUrl: '/upload/SSP Final OLD (12).xlsx', category: 'operations' },
    ]
  })

  // ==================== EXAM CENTER SEEDING ====================
  // Import curated question banks (50 MCQ + 50 Short Answer covering all LAXREE product categories)
  const { MCQ_QUESTIONS, SHORT_ANSWER_QUESTIONS } = await import('@/lib/exam-center-questions')

  // Create QuestionBank entries for all MCQ questions, grouped by difficulty for stage assignment
  const mcqByDifficulty: Record<string, any[]> = { easy: [], medium: [], hard: [] }
  for (const q of MCQ_QUESTIONS) {
    const qb = await db.questionBank.create({
      data: {
        question: q.question,
        questionType: 'MCQ',
        optionA: q.optionA,
        optionB: q.optionB,
        optionC: q.optionC,
        optionD: q.optionD,
        correctAnswer: q.correctAnswer,
        acceptableAnswers: null,
        explanation: q.explanation,
        category: q.category,
        difficulty: q.difficulty,
      }
    })
    mcqByDifficulty[q.difficulty].push(qb)
  }

  // Create QuestionBank entries for all Short Answer questions, grouped by difficulty
  const saByDifficulty: Record<string, any[]> = { easy: [], medium: [], hard: [] }
  for (const q of SHORT_ANSWER_QUESTIONS) {
    const qb = await db.questionBank.create({
      data: {
        question: q.question,
        questionType: 'SHORT_ANSWER',
        optionA: null,
        optionB: null,
        optionC: null,
        optionD: null,
        correctAnswer: q.correctAnswer,
        acceptableAnswers: JSON.stringify(q.acceptableAnswers),
        explanation: q.explanation,
        category: q.category,
        difficulty: q.difficulty,
      }
    })
    saByDifficulty[q.difficulty].push(qb)
  }


  // Distribute questions across exams by difficulty:
  // PRE stage = easy, MID stage = medium, HARD/EXTRA_HARD = hard
  // Both INBOUND and FIELD sales share the same question pool per stage
  const stageDifficultyMap: Record<string, string[]> = {
    'PRE': ['easy'],
    'MID': ['medium'],
    'HARD': ['hard'],
    'EXTRA_HARD': ['hard', 'medium'], // mix of hard + medium for expert level
  }

  // Create Exams for both types and all 4 stages
  const examConfigs = [
    { examType: 'INBOUND_SALES' as const, stage: 'PRE' as const, title: 'Inbound Sales - Pre Stage', description: 'Foundation exam covering LAXREE organization, product basics, and inbound sales fundamentals. 50 MCQ + Short Answer questions.', duration: 90, passingScore: 70, timeGateDays: 7 },
    { examType: 'INBOUND_SALES' as const, stage: 'MID' as const, title: 'Inbound Sales - Mid Stage', description: 'Intermediate exam covering advanced product features, objection handling, and negotiation skills. 50 MCQ + Short Answer questions.', duration: 90, passingScore: 70, timeGateDays: 30 },
    { examType: 'INBOUND_SALES' as const, stage: 'HARD' as const, title: 'Inbound Sales - Hard Stage', description: 'Advanced exam covering complex sales scenarios, competitive intelligence, and strategic selling. 50 MCQ + Short Answer questions.', duration: 90, passingScore: 75, timeGateDays: 45 },
    { examType: 'INBOUND_SALES' as const, stage: 'EXTRA_HARD' as const, title: 'Inbound Sales - Extra Hard Stage', description: 'Expert exam covering mastery-level sales strategy, high-value deals, and leadership. 50 MCQ + Short Answer questions.', duration: 120, passingScore: 80, timeGateDays: 60 },
    { examType: 'FIELD_SALES' as const, stage: 'PRE' as const, title: 'Field Sales - Pre Stage', description: 'Foundation exam for field sales covering on-site selling basics and product demonstration. 50 MCQ + Short Answer questions.', duration: 90, passingScore: 70, timeGateDays: 7 },
    { examType: 'FIELD_SALES' as const, stage: 'MID' as const, title: 'Field Sales - Mid Stage', description: 'Intermediate field sales exam covering relationship building, territory management, and advanced demos. 50 MCQ + Short Answer questions.', duration: 90, passingScore: 70, timeGateDays: 30 },
    { examType: 'FIELD_SALES' as const, stage: 'HARD' as const, title: 'Field Sales - Hard Stage', description: 'Advanced field sales exam covering complex deal structures, key account management, and strategic partnerships. 50 MCQ + Short Answer questions.', duration: 90, passingScore: 75, timeGateDays: 45 },
    { examType: 'FIELD_SALES' as const, stage: 'EXTRA_HARD' as const, title: 'Field Sales - Extra Hard Stage', description: 'Expert field sales exam covering enterprise deals, C-suite engagement, and market expansion strategy. 50 MCQ + Short Answer questions.', duration: 120, passingScore: 80, timeGateDays: 60 },
  ]

  let totalExamQuestions = 0
  for (const config of examConfigs) {
    const exam = await db.exam.create({
      data: {
        examType: config.examType,
        stage: config.stage,
        title: config.title,
        description: config.description,
        duration: config.duration,
        passingScore: config.passingScore,
        timeGateDays: config.timeGateDays,
        isActive: true,
      }
    })

    // Get MCQ and SA questions matching the difficulty for this stage
    const difficulties = stageDifficultyMap[config.stage] || ['easy']
    const mcqForExam = difficulties.flatMap(d => mcqByDifficulty[d] || [])
    const saForExam = difficulties.flatMap(d => saByDifficulty[d] || [])

    // Assign MCQ questions
    let order = 1
    for (const qb of mcqForExam) {
      await db.examQuestion.create({
        data: {
          examId: exam.id,
          questionBankId: qb.id,
          order: order++,
          marks: 1,
        }
      })
    }

    // Assign SHORT_ANSWER questions
    for (const qb of saForExam) {
      await db.examQuestion.create({
        data: {
          examId: exam.id,
          questionBankId: qb.id,
          order: order++,
          marks: 1,
        }
      })
    }

    totalExamQuestions += mcqForExam.length + saForExam.length
  }

  return { users: 1 + 1 + 2 + employees.length, departments: 5, courses: allCourses.length, questionBanks: questionBanks.length + totalExamQuestions, assessments: moduleAssessments.length + 3 }
}

export async function POST(request: NextRequest) {
  try {
    // Check if force=true is passed to force reseed
    const { searchParams } = new URL(request.url)
    const force = searchParams.get('force') === 'true'

    // If force=true, require admin authentication
    if (force) {
      let adminId: string | null = null
      try {
        const body = await request.json()
        adminId = body?.adminId || null
      } catch {
        adminId = searchParams.get('adminId')
      }

      if (!adminId) {
        return NextResponse.json(
          { error: 'Admin authentication required for force seed. Provide adminId in request body.' },
          { status: 401 }
        )
      }

      const admin = await db.user.findUnique({ where: { id: adminId } })
      if (!admin || admin.role !== 'SUPER_ADMIN') {
        return NextResponse.json(
          { error: 'Only SUPER_ADMIN users can force seed the database.' },
          { status: 403 }
        )
      }
    }

    const userCount = await db.user.count()
    const deptCount = await db.department.count()
    const courseCount = await db.course.count()

    // If users exist, never auto-seed (unless force=true)
    if (userCount > 0 && !force) {
      return NextResponse.json({ message: 'Database already seeded', userCount })
    }

    // If no users but departments/courses exist, the DB was seeded before
    // and users were deliberately deleted - don't auto-recreate unless force=true
    if (!force && userCount === 0 && (deptCount > 0 || courseCount > 0)) {
      return NextResponse.json({ 
        message: 'Database was previously seeded. Users were removed. Use /api/reseed to reset or /api/seed?force=true to add seed users back.',
        userCount, deptCount, courseCount 
      })
    }

    // For initial seed (empty database), allow without auth so first-time setup works
    const result = await seedDatabase()

    return NextResponse.json({ message: 'Database seeded successfully', data: result })
  } catch (error: any) {
    console.error('Seed error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
