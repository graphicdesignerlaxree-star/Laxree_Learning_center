// Complete script to update Product Academy modules with YouTube embed URLs
// and add new modules for missing products
// This script is idempotent - safe to run multiple times

process.env.DATABASE_URL = 'postgresql://neondb_owner:npg_vRfGm1u6XDtq@ep-fragrant-brook-adhkdpuc-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require';
process.env.DIRECT_URL = 'postgresql://neondb_owner:npg_vRfGm1u6XDtq@ep-fragrant-brook-adhkdpuc.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require';

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('=== Starting Video URL Update Script ===\n');

  // Step 0: Find the Product Academy course
  const productCourse = await prisma.course.findFirst({
    where: { moduleType: 'PRODUCT_ACADEMY' }
  });

  if (!productCourse) {
    console.error('ERROR: Could not find PRODUCT_ACADEMY course!');
    process.exit(1);
  }
  console.log(`Found Product Academy course: "${productCourse.title}" (ID: ${productCourse.id})\n`);

  // Get all current modules in this course
  const existingModules = await prisma.module.findMany({
    where: { courseId: productCourse.id },
    orderBy: { order: 'asc' },
    include: { productCategory: true }
  });
  console.log(`Current modules in Product Academy: ${existingModules.length}`);
  existingModules.forEach(m => {
    console.log(`  [Order ${m.order}] "${m.title}" | contentType: ${m.contentType} | contentUrl: ${m.contentUrl || 'N/A'} | category: ${m.productCategory?.name || 'None'}`);
  });
  console.log('');

  let totalUpdated = 0;
  let totalCreated = 0;

  // =====================================================
  // STEP 1: Update existing modules' contentUrl to YouTube embed URLs
  // Using specific targeting to avoid conflicts with combined-title modules
  // =====================================================
  console.log('--- Step 1: Updating existing module contentUrls ---');

  const urlUpdates = [
    { match: (m) => m.title.toLowerCase().includes('mini bar'), youtubeUrl: 'https://www.youtube.com/embed/Z-eOuzqM0ns', label: 'Mini Bar' },
    { match: (m) => m.title.toLowerCase().includes('safe box') || m.title.toLowerCase().includes('safe box'), youtubeUrl: 'https://www.youtube.com/embed/St815eDtI5c', label: 'Safe Box' },
    { match: (m) => m.title.toLowerCase().includes('rfid'), youtubeUrl: 'https://www.youtube.com/embed/ltARwWOPn6Q', label: 'RFID' },
    { match: (m) => m.title.toLowerCase().includes('kettle') && !m.title.toLowerCase().includes('kettle tray'), youtubeUrl: 'https://www.youtube.com/embed/6OwThbSHUzE', label: 'Kettle (not Kettle Tray)' },
    { match: (m) => (m.title.toLowerCase().includes('hair dryer') || m.title.toLowerCase().includes('mirror')), youtubeUrl: 'https://www.youtube.com/embed/97RFXSbjqyk', label: 'Hair Dryer/Mirror' },
    { match: (m) => m.title.toLowerCase().includes('housekeeping'), youtubeUrl: 'https://www.youtube.com/embed/yVTyegoHfHY', label: 'Housekeeping' },
  ];

  for (const update of urlUpdates) {
    const matchingModules = existingModules.filter(m => update.match(m));

    for (const mod of matchingModules) {
      if (mod.contentUrl !== update.youtubeUrl || mod.contentType !== 'video') {
        const result = await prisma.module.update({
          where: { id: mod.id },
          data: { contentUrl: update.youtubeUrl, contentType: 'video' }
        });
        console.log(`  Updated "${result.title}" → ${update.youtubeUrl}`);
        totalUpdated++;
      } else {
        console.log(`  Already correct: "${mod.title}" → ${update.youtubeUrl}`);
      }
    }

    if (matchingModules.length === 0) {
      console.log(`  No module found for "${update.label}"`);
    }
  }
  console.log(`Total contentUrls updated: ${totalUpdated}\n`);

  // =====================================================
  // STEP 2: Create missing ProductCategory entries
  // =====================================================
  console.log('--- Step 2: Creating missing ProductCategory entries ---');

  const neededCategories = [
    { name: 'Kettle Trays', description: 'Kettle serving trays and accessories', icon: '🍽️' },
    { name: 'Dustbins', description: 'Room and lobby dustbins', icon: '🗑️' },
    { name: 'Luggage Racks', description: 'Luggage racks and bellman stands', icon: '🧳' },
    { name: 'Rollaway Beds', description: 'Extra beds and rollaway solutions', icon: '🛏️' },
    { name: 'Washroom Amenities', description: 'Guest washroom amenity kits and supplies', icon: '🧼' },
    { name: 'Add On Items', description: 'Additional hospitality accessories and items', icon: '➕' },
    { name: 'Hangers', description: 'Hotel hangers for wardrobes and closets', icon: '👔' },
    { name: 'Soap Dispensers', description: 'Manual & Automatic Dispensers', icon: '🧴' },
    { name: 'Digital Signage', description: 'Digital signage displays and lobby equipment', icon: '📺' },
  ];

  const allCategories = await prisma.productCategory.findMany();
  const categoryMap = {};

  for (const cat of neededCategories) {
    let existing = allCategories.find(c => c.name.toLowerCase() === cat.name.toLowerCase());
    if (!existing) {
      existing = await prisma.productCategory.create({ data: cat });
      console.log(`  Created category "${cat.name}" (ID: ${existing.id})`);
    } else {
      console.log(`  Category "${cat.name}" already exists.`);
    }
    categoryMap[cat.name] = existing;
  }
  console.log('');

  // =====================================================
  // STEP 3: Create all missing modules
  // =====================================================
  console.log('--- Step 3: Creating missing Product Academy modules ---');

  const desiredModules = [
    {
      title: 'Kettle Tray - Product Knowledge',
      description: 'Complete guide to LAXREE Kettle Tray range including serving trays and accessories',
      contentType: 'video',
      contentUrl: 'https://www.youtube.com/embed/4aBfypkw-oY',
      order: 11,
      duration: 15,
      categoryName: 'Kettle Trays',
      content: `<h3>LAXREE Kettle Trays</h3>
<p>Premium serving trays designed to complement LAXREE electric kettles in hotel rooms.</p>
<h4>Product Range</h4>
<ul>
<li><strong>Standard Kettle Tray</strong> - Basic serving tray with cup holders</li>
<li><strong>Premium Kettle Tray Set</strong> - Complete set with cups, saucers & tray</li>
<li><strong>Deluxe Tray with Accessories</strong> - Includes sugar bowl & creamer</li>
</ul>
<h4>Key Features</h4>
<ul>
<li>Heat-resistant surface</li>
<li>Elegant design matching room decor</li>
<li>Non-slip base</li>
<li>Easy to clean and maintain</li>
</ul>`,
    },
    {
      title: 'Dustbin - Product Knowledge',
      description: 'Complete guide to LAXREE Dustbin range for hotel rooms and lobbies',
      contentType: 'video',
      contentUrl: 'https://www.youtube.com/embed/dbf6BYPRxYE',
      order: 12,
      duration: 15,
      categoryName: 'Dustbins',
      content: `<h3>LAXREE Dustbins</h3>
<p>Professional waste management solutions for hotel rooms, bathrooms, and lobby areas.</p>
<h4>Product Range</h4>
<ul>
<li><strong>Room Dustbin</strong> - Pedal-operated waste bin for guest rooms</li>
<li><strong>Bathroom Dustbin</strong> - Compact bin for bathroom areas</li>
<li><strong>Lobby Dustbin</strong> - Large stainless steel bin for public areas</li>
</ul>
<h4>Key Features</h4>
<ul>
<li>Stainless steel & ABS plastic options</li>
<li>Silent pedal operation</li>
<li>Removable inner bucket for easy cleaning</li>
<li>Fingerprint-resistant coating</li>
</ul>`,
    },
    {
      title: 'Luggage Rack - Product Knowledge',
      description: 'Complete guide to LAXREE Luggage Rack range including folding and fixed models',
      contentType: 'video',
      contentUrl: 'https://www.youtube.com/embed/16vDMEt2BY8',
      order: 13,
      duration: 15,
      categoryName: 'Luggage Racks',
      content: `<h3>LAXREE Luggage Racks</h3>
<p>Sturdy and elegant luggage racks designed for hotel guest rooms.</p>
<h4>Product Range</h4>
<ul>
<li><strong>Folding Luggage Rack</strong> - Space-saving foldable design</li>
<li><strong>Fixed Luggage Rack</strong> - Permanent wall-mounted option</li>
<li><strong>Deluxe Luggage Stand</strong> - With protective straps and shelf</li>
</ul>
<h4>Key Features</h4>
<ul>
<li>Heavy-duty construction supporting up to 80kg</li>
<li>Non-marking feet protect floor surfaces</li>
<li>Elegant wooden and metal finishes</li>
<li>Easy to fold and store when not in use</li>
</ul>`,
    },
    {
      title: 'Rollaway Bed - Product Knowledge',
      description: 'Complete guide to LAXREE Rollaway Bed range for extra guest accommodation',
      contentType: 'video',
      contentUrl: 'https://www.youtube.com/embed/G7a4zQITXTU',
      order: 14,
      duration: 15,
      categoryName: 'Rollaway Beds',
      content: `<h3>LAXREE Rollaway Beds</h3>
<p>Comfortable and convenient rollaway beds for extra guest accommodation in hotels.</p>
<h4>Product Range</h4>
<ul>
<li><strong>Standard Rollaway Bed</strong> - Basic folding bed with mattress</li>
<li><strong>Premium Rollaway Bed</strong> - Enhanced comfort with thicker mattress</li>
<li><strong>Deluxe Rollaway Bed</strong> - Headboard and premium upholstery</li>
</ul>
<h4>Key Features</h4>
<ul>
<li>Easy folding mechanism for storage</li>
<li>Lockable castor wheels for stability</li>
<li>Comfortable innerspring or foam mattress</li>
<li>Sturdy steel frame construction</li>
</ul>`,
    },
    {
      title: 'Washroom Amenities - Product Knowledge',
      description: 'Complete guide to LAXREE Washroom Amenities including toiletry kits and supplies',
      contentType: 'video',
      contentUrl: 'https://www.youtube.com/embed/DCbGeH-rF7U',
      order: 15,
      duration: 15,
      categoryName: 'Washroom Amenities',
      content: `<h3>LAXREE Washroom Amenities</h3>
<p>Premium guest amenity kits and bathroom supplies for hotels.</p>
<h4>Product Range</h4>
<ul>
<li><strong>Standard Amenity Kit</strong> - Shampoo, soap, lotion in basic packaging</li>
<li><strong>Premium Amenity Kit</strong> - Full range with branded packaging</li>
<li><strong>Deluxe Amenity Collection</strong> - Luxury range with organic products</li>
</ul>
<h4>Key Features</h4>
<ul>
<li>Available in 30ml, 50ml, and 100ml sizes</li>
<li>Custom branding options available</li>
<li>Eco-friendly and biodegradable options</li>
<li>Compliant with airline liquid regulations</li>
</ul>`,
    },
    {
      title: 'Add On Items - Product Knowledge',
      description: 'Complete guide to LAXREE Add On Items and additional hospitality accessories',
      contentType: 'video',
      contentUrl: 'https://www.youtube.com/embed/Ppk4OoV7hnU',
      order: 16,
      duration: 15,
      categoryName: 'Add On Items',
      content: `<h3>LAXREE Add On Items</h3>
<p>Additional hospitality accessories and complementary products for complete hotel solutions.</p>
<h4>Product Range</h4>
<ul>
<li><strong>Iron & Ironing Board</strong> - In-room ironing solutions</li>
<li><strong>Shoe Shine Kit</strong> - Guest shoe care amenities</li>
<li><strong>Sewing Kit</strong> - Emergency sewing supplies</li>
<li><strong>Bathroom Scale</strong> - Digital weighing scale</li>
<li><strong>Room Service Tray</strong> - Food delivery tray</li>
</ul>
<h4>Key Features</h4>
<ul>
<li>Complete range of supplementary items</li>
<li>Consistent design language across products</li>
<li>Bulk purchase discounts available</li>
<li>Custom branding options</li>
</ul>`,
    },
    {
      title: 'Soap Dispensers - Product Knowledge',
      description: 'Complete guide to LAXREE Soap Dispenser range including manual and automatic models',
      contentType: 'video',
      contentUrl: 'https://www.youtube.com/embed/4PYairCeKE4',
      order: 17,
      duration: 15,
      categoryName: 'Soap Dispensers',
      content: `<h3>LAXREE Soap Dispensers</h3>
<p>Manual and automatic dispensers for hotel bathrooms.</p>
<h4>Dispenser Types</h4>
<ul>
<li><strong>Manual Dispenser</strong> - Push-button operation</li>
<li><strong>Automatic Dispenser</strong> - Sensor-based, touchless</li>
<li><strong>Triple Dispenser</strong> - Shampoo, body wash, lotion</li>
</ul>
<h4>Key Features</h4>
<ul>
<li>Touchless sensor operation available</li>
<li>Easy refill mechanism</li>
<li>Wall-mounted design saves space</li>
<li>Transparent window shows fill level</li>
</ul>`,
    },
    {
      title: 'Room Accessories - Hangers',
      description: 'Complete guide to LAXREE Hotel Hangers and room accessories',
      contentType: 'video',
      contentUrl: 'https://www.youtube.com/embed/WDh4zOJjarE',
      order: 18,
      duration: 15,
      categoryName: 'Hangers',
      content: `<h3>LAXREE Room Accessories - Hangers</h3>
<p>Complete range of in-room accessories for hotels, featuring our premium hanger collection.</p>
<h4>Hanger Range</h4>
<ul>
<li><strong>Wooden Hangers</strong> - Classic wooden hangers with non-slip bar</li>
<li><strong>Wire Hangers</strong> - Lightweight and space-saving</li>
<li><strong>Suit Hangers</strong> - Wide-shoulder hangers for jackets</li>
<li><strong>Skirt/Pant Hangers</strong> - Clip hangers for bottoms</li>
</ul>
<h4>Other Room Accessories</h4>
<ul>
<li><strong>Room Telephones</strong> - Hotel-grade telephones</li>
<li><strong>Bathroom Scales</strong> - Digital weighing scales</li>
<li><strong>Shoe Baskets</strong> - In-closet shoe organizers</li>
</ul>`,
    },
    {
      title: 'Lobby & Digital Signage - Product Knowledge',
      description: 'Complete guide to LAXREE Lobby Equipment and Digital Signage solutions',
      contentType: 'video',
      contentUrl: 'https://www.youtube.com/embed/qwdpnZ-5rRE',
      order: 19,
      duration: 15,
      categoryName: 'Digital Signage',
      content: `<h3>LAXREE Lobby & Digital Signage</h3>
<p>Complete range of lobby and entrance equipment for hotels.</p>
<h4>Digital Signage</h4>
<ul>
<li><strong>LED Display Panels</strong> - Lobby information screens</li>
<li><strong>Interactive Kiosks</strong> - Touch-screen wayfinding</li>
<li><strong>Menu Boards</strong> - Restaurant & bar digital menus</li>
</ul>
<h4>Lobby Equipment</h4>
<ul>
<li><strong>Lobby Dustbins</strong> - Stainless steel bins</li>
<li><strong>Luggage Trolleys</strong> - Bellman trolleys</li>
<li><strong>Stanchions</strong> - Queue management posts</li>
</ul>`,
    },
  ];

  for (const mod of desiredModules) {
    const existing = await prisma.module.findFirst({
      where: { title: mod.title, courseId: productCourse.id }
    });

    if (existing) {
      console.log(`  Module "${mod.title}" already exists, skipping.`);
      continue;
    }

    const category = categoryMap[mod.categoryName];
    const moduleData = {
      title: mod.title,
      description: mod.description,
      contentType: mod.contentType,
      contentUrl: mod.contentUrl,
      content: mod.content,
      order: mod.order,
      duration: mod.duration,
      courseId: productCourse.id,
      productCategoryId: category ? category.id : null,
    };

    const created = await prisma.module.create({ data: moduleData });
    console.log(`  Created module "${created.title}" (Order: ${created.order}, ID: ${created.id})`);
    totalCreated++;
  }
  console.log(`Total new modules created: ${totalCreated}\n`);

  // =====================================================
  // Verify final state
  // =====================================================
  console.log('--- Verifying final state ---');
  const finalModules = await prisma.module.findMany({
    where: { courseId: productCourse.id },
    orderBy: { order: 'asc' },
    include: { productCategory: true }
  });

  console.log(`\nFinal Product Academy modules: ${finalModules.length}`);
  finalModules.forEach(m => {
    console.log(`  [Order ${m.order}] "${m.title}" | type: ${m.contentType} | url: ${m.contentUrl || 'N/A'} | cat: ${m.productCategory?.name || 'None'}`);
  });

  const allCats = await prisma.productCategory.findMany();
  console.log(`\nTotal ProductCategory entries: ${allCats.length}`);
  allCats.forEach(c => console.log(`  "${c.name}" (${c.icon})`));

  console.log('\n=== UPDATE SUMMARY ===');
  console.log(`Existing modules updated: ${totalUpdated}`);
  console.log(`New modules created: ${totalCreated}`);
  console.log(`New categories created: ${Object.keys(categoryMap).length}`);
  console.log(`Total Product Academy modules now: ${finalModules.length}`);
  console.log('=== DONE ===');
}

main()
  .catch(e => {
    console.error('ERROR:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
