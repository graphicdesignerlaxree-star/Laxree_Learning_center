// Standalone seed script that can run outside Next.js
process.env.DATABASE_URL = 'postgresql://neondb_owner:npg_vRfGm1u6XDtq@ep-fragrant-brook-adhkdpuc-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require';
process.env.DIRECT_URL = 'postgresql://neondb_owner:npg_vRfGm1u6XDtq@ep-fragrant-brook-adhkdpuc.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require';

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🧹 Clearing database...');
  
  // Delete all data
  const models = [
    'moduleCompletion','enrollment','assessmentQuestion','scorecard',
    'certificationAttempt','approvalLog','improvementPlan','activity',
    'auditLog','loginHistory','notification','userBadge',
    'mockSimulationAttempt','mockSimulation','examAttempt','examQuestion',
    'exam','questionBank','assessmentAttempt','module','course',
    'assessment','certification','learningPath','badge','productCategory',
    'document','platformSetting','user','department'
  ];
  
  for (const model of models) {
    try { await prisma[model].deleteMany(); } catch(e) {}
  }
  console.log('✅ Database cleared');

  console.log('🌱 Seeding database...');

  // Create Departments
  const salesDept = await prisma.department.create({ data: { name: 'Sales', description: 'Sales Department' } });
  const inboundDept = await prisma.department.create({ data: { name: 'Inbound Sales', description: 'Inbound Sales Department' } });
  const fieldSalesDept = await prisma.department.create({ data: { name: 'Field Sales', description: 'Field Sales Department' } });
  const trainingDept = await prisma.department.create({ data: { name: 'Training', description: 'Training & Development' } });
  const operationsDept = await prisma.department.create({ data: { name: 'Operations', description: 'Operations Department' } });

  // Create Super Admin
  await prisma.user.create({
    data: { email: 'admin@laxree.com', password: 'admin123', role: 'SUPER_ADMIN', fullName: 'Platform Administrator', isFirstLogin: false, isActive: true }
  });
  console.log('✅ Admin created');

  // Create Employees
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
  ];

  for (const emp of empData) {
    await prisma.user.create({
      data: {
        email: `${emp.empId.toLowerCase()}@laxree.com`,
        password: 'emp123',
        role: 'EMPLOYEE',
        fullName: emp.name,
        departmentId: emp.dept,
        designation: emp.desig,
        employeeId: emp.empId,
        isFirstLogin: true,
        isActive: true,
        aiReadinessScore: Math.round((Math.random() * 40 + 30) * 10) / 10,
        currentLevel: ['Beginner', 'Intermediate', 'Advanced'][Math.floor(Math.random() * 3)],
        joiningDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
      }
    });
  }
  console.log('✅ Employees created');

  // Product Categories
  const categories = await Promise.all([
    prisma.productCategory.create({ data: { name: 'Mini Bars', description: 'Hotel Mini Bar Products', icon: '🍷' } }),
    prisma.productCategory.create({ data: { name: 'Safe Boxes', description: 'In-Room Safe Solutions', icon: '🔒' } }),
    prisma.productCategory.create({ data: { name: 'RFID Locks', description: 'RFID Door Locks & Access Control', icon: '🔑' } }),
    prisma.productCategory.create({ data: { name: 'Electric Kettles', description: 'In-Room Electric Kettles', icon: '☕' } }),
    prisma.productCategory.create({ data: { name: 'Hair Dryers', description: 'Wall Mount & Foldable Hair Dryers', icon: '💇' } }),
    prisma.productCategory.create({ data: { name: 'Soap Dispensers', description: 'Manual & Automatic Dispensers', icon: '🧴' } }),
    prisma.productCategory.create({ data: { name: 'Room Accessories', description: 'Trays, Mirrors, Telephones', icon: '🏠' } }),
    prisma.productCategory.create({ data: { name: 'Mattresses & Beds', description: 'Hotel Mattresses & Rollaway Beds', icon: '🛏️' } }),
    prisma.productCategory.create({ data: { name: 'Housekeeping', description: 'Trolleys & Cleaning Equipment', icon: '🧹' } }),
    prisma.productCategory.create({ data: { name: 'Lobby Equipment', description: 'Digital Signage & Luggage Trolleys', icon: '🏛️' } }),
  ]);
  console.log('✅ Product categories created');

  // Learning Paths
  const onboardingPath = await prisma.learningPath.create({ data: { name: 'New Employee Onboarding', description: 'Complete onboarding for new LAXREE employees', targetRole: 'EMPLOYEE' } });
  const salesPath = await prisma.learningPath.create({ data: { name: 'Sales Mastery Path', description: 'Advanced sales training', targetRole: 'EMPLOYEE' } });
  const fieldSalesPath = await prisma.learningPath.create({ data: { name: 'Field Sales Excellence', description: 'Field sales readiness', targetRole: 'EMPLOYEE' } });
  const inboundPath = await prisma.learningPath.create({ data: { name: 'Inbound Sales Excellence', description: 'Inbound sales readiness', targetRole: 'EMPLOYEE' } });
  console.log('✅ Learning paths created');

  // ========== COURSES WITH FULL CONTENT ==========
  
  // Course 1: Product Academy
  const productAcademyCourse = await prisma.course.create({
    data: {
      title: 'LAXREE Product Academy',
      description: 'Complete product knowledge training for all LAXREE hospitality products',
      moduleType: 'PRODUCT_ACADEMY',
      learningPathId: onboardingPath.id,
      duration: 180,
      isRequired: true,
      isActive: true,
    }
  });

  // Product Academy Modules (10 modules)
  const productModules = [
    {
      title: 'About LAXREE Hospitality Solutions',
      description: 'Learn about LAXREE vision, mission, USPs, and market segments',
      contentType: 'text',
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
<li><strong>Pan-India Distribution</strong> - Fast delivery across India</li>
<li><strong>Quality Assurance</strong> - ISO certified products</li>
<li><strong>After-Sales Support</strong> - Dedicated service team</li>
</ul>
<h4>Market Segments We Serve</h4>
<ul>
<li>5-Star Hotels & Resorts</li>
<li>4-Star Business Hotels</li>
<li>Heritage & Boutique Hotels</li>
<li>Serviced Apartments</li>
<li>Hospitals & Healthcare</li>
</ul>`,
      order: 0,
      duration: 15,
    },
    {
      title: 'Mini Bars - Product Knowledge',
      description: 'Complete guide to LAXREE Mini Bar range including compressor, absorption, and thermoelectric models',
      contentType: 'video',
      contentUrl: '/upload/Minibar (1).mp4',
      pdfUrl: '/upload/Mini Bar.pdf',
      content: `<h3>LAXREE Mini Bars</h3>
<p>LAXREE offers a comprehensive range of hotel mini bars designed for every hotel category.</p>
<h4>Types of Mini Bars</h4>
<ul>
<li><strong>Compressor Mini Bars</strong> - Most powerful cooling, ideal for 5-star hotels</li>
<li><strong>Absorption Mini Bars</strong> - Silent operation, perfect for guest rooms</li>
<li><strong>Thermoelectric Mini Bars</strong> - Compact & energy efficient</li>
</ul>
<h4>Key Features</h4>
<ul>
<li>Ultra-quiet operation (as low as 25dB)</li>
<li>Energy efficient with A+ rating</li>
<li>Auto-defrost technology</li>
<li>LED interior lighting</li>
<li>Adjustable shelves & door bins</li>
<li>Available in 20L, 30L, 40L, 50L capacities</li>
</ul>
<h4>Selling Points for Hotels</h4>
<ul>
<li>Silent operation ensures guest comfort</li>
<li>Low energy consumption reduces operational costs</li>
<li>Sleek design complements room decor</li>
<li>Comprehensive warranty & service network</li>
</ul>`,
      productCategoryId: categories[0].id,
      order: 1,
      duration: 20,
    },
    {
      title: 'Safe Boxes - Product Knowledge',
      description: 'Complete guide to LAXREE Safe Box range including essential, medium, laptop, and Orbita models',
      contentType: 'video',
      contentUrl: '/upload/Safe_box.mp4',
      pdfUrl: '/upload/Safe Box.pdf',
      content: `<h3>LAXREE Safe Boxes</h3>
<p>LAXREE offers a range of in-room safes designed for hotel guest security.</p>
<h4>Safe Box Range</h4>
<ul>
<li><strong>Essential Safe</strong> - Compact, basic security for budget & mid-scale hotels</li>
<li><strong>Medium Safe</strong> - Enhanced security with digital keypad</li>
<li><strong>Laptop Safe</strong> - Extra large for laptops & valuables</li>
<li><strong>Orbita Safe</strong> - Premium rotating safe with biometric option</li>
</ul>
<h4>Key Features</h4>
<ul>
<li>Digital keypad with admin override</li>
<li>LED display with time & date</li>
<li>Motorized locking mechanism</li>
<li>Emergency battery backup</li>
<li>Wall & floor mount options</li>
</ul>`,
      productCategoryId: categories[1].id,
      order: 2,
      duration: 20,
    },
    {
      title: 'RFID Door Locks - Product Knowledge',
      description: 'Complete guide to LAXREE RFID Door Lock systems',
      contentType: 'video',
      contentUrl: '/upload/Rfid.mp4',
      pdfUrl: '/upload/RFID Door Lock.pdf',
      content: `<h3>LAXREE RFID Door Locks</h3>
<p>Advanced RFID door lock solutions for modern hotels.</p>
<h4>Lock Types</h4>
<ul>
<li><strong>M1 Lock</strong> - Basic RFID card lock</li>
<li><strong>T5 Lock</strong> - Enhanced with privacy mode</li>
<li><strong>T6 Lock</strong> - Premium with Bluetooth + RFID</li>
</ul>
<h4>Key Features</h4>
<ul>
<li>RFID card + mobile key support</li>
<li>Low battery indicator</li>
<li>Emergency mechanical key override</li>
<li>Do-not-disturb integration</li>
<li>PMS integration compatible</li>
</ul>`,
      productCategoryId: categories[2].id,
      order: 3,
      duration: 20,
    },
    {
      title: 'Electric Kettles - Product Knowledge',
      description: 'Complete guide to LAXREE Electric Kettle range',
      contentType: 'video',
      contentUrl: '/upload/kettle (1).mp4',
      pdfUrl: '/upload/Electric Kettle.pdf',
      content: `<h3>LAXREE Electric Kettles</h3>
<p>Premium electric kettles designed for hotel in-room use.</p>
<h4>Kettle Range</h4>
<ul>
<li><strong>Standard Kettle</strong> - 0.8L stainless steel</li>
<li><strong>Premium Kettle</strong> - 1.0L with temperature control</li>
<li><strong>Kettle with Tray</strong> - Complete set with cups & tray</li>
</ul>
<h4>Key Features</h4>
<ul>
<li>Automatic shut-off safety</li>
<li>Boil-dry protection</li>
<li>360° rotational base</li>
<li>Concealed heating element</li>
<li>LED indicator light</li>
</ul>`,
      productCategoryId: categories[3].id,
      order: 4,
      duration: 15,
    },
    {
      title: 'Hair Dryers & Mirrors - Product Knowledge',
      description: 'Complete guide to LAXREE Hair Dryer and Mirror range',
      contentType: 'video',
      contentUrl: '/upload/mirror & hair drayer.mp4',
      pdfUrl: '/upload/Mirror & Hair Dryer.pdf',
      content: `<h3>LAXREE Hair Dryers & Mirrors</h3>
<p>Wall-mount and foldable hair dryers with LED mirrors for hotel bathrooms.</p>
<h4>Hair Dryer Range</h4>
<ul>
<li><strong>Wall Mount Hair Dryer</strong> - Fixed in bathroom</li>
<li><strong>Foldable Hair Dryer</strong> - Portable & compact</li>
</ul>
<h4>Mirror Range</h4>
<ul>
<li><strong>LED Vanity Mirror</strong> - Touch sensor, anti-fog</li>
<li><strong>Magnifying Mirror</strong> - 5x magnification</li>
</ul>`,
      productCategoryId: categories[4].id,
      order: 5,
      duration: 15,
    },
    {
      title: 'Soap Dispensers - Product Knowledge',
      description: 'Complete guide to LAXREE Soap Dispenser range',
      contentType: 'video',
      contentUrl: '/upload/dispencer.mp4',
      pdfUrl: '/upload/Dispenser.pdf',
      content: `<h3>LAXREE Soap Dispensers</h3>
<p>Manual and automatic dispensers for hotel bathrooms.</p>
<h4>Dispenser Types</h4>
<ul>
<li><strong>Manual Dispenser</strong> - Push-button operation</li>
<li><strong>Automatic Dispenser</strong> - Sensor-based, touchless</li>
<li><strong>Triple Dispenser</strong> - Shampoo, body wash, lotion</li>
</ul>`,
      productCategoryId: categories[5].id,
      order: 6,
      duration: 15,
    },
    {
      title: 'Room Accessories - Product Knowledge',
      description: 'Complete guide to LAXREE Room Accessories',
      contentType: 'text',
      content: `<h3>LAXREE Room Accessories</h3>
<p>Complete range of in-room accessories for hotels.</p>
<h4>Product Range</h4>
<ul>
<li><strong>Hotel Hangers</strong> - Wooden & wire hangers</li>
<li><strong>Kettle Trays</strong> - Serving trays for kettles</li>
<li><strong>Room Telephones</strong> - Hotel-grade telephones</li>
<li><strong>Bathroom Scales</strong> - Digital weighing scales</li>
<li><strong>Shoe Baskets</strong> - In-closet shoe organizers</li>
</ul>`,
      productCategoryId: categories[6].id,
      order: 7,
      duration: 15,
    },
    {
      title: 'Housekeeping Equipment - Product Knowledge',
      description: 'Complete guide to LAXREE Housekeeping Trolleys and equipment',
      contentType: 'video',
      contentUrl: '/upload/Housekeeping.mp4',
      pdfUrl: '/upload/Housekeeping Trolley.pdf',
      content: `<h3>LAXREE Housekeeping Equipment</h3>
<p>Professional housekeeping trolleys and cleaning equipment.</p>
<h4>Product Range</h4>
<ul>
<li><strong>Housekeeping Trolley</strong> - Full-size maid cart</li>
<li><strong>Linen Cart</strong> - For clean & dirty linen</li>
<li><strong>Room Service Trolley</strong> - Food & beverage delivery</li>
</ul>`,
      productCategoryId: categories[8].id,
      order: 8,
      duration: 15,
    },
    {
      title: 'Lobby & Digital Signage - Product Knowledge',
      description: 'Complete guide to LAXREE Lobby Equipment and Digital Signage',
      contentType: 'text',
      content: `<h3>LAXREE Lobby Equipment & Digital Signage</h3>
<p>Complete range of lobby and entrance equipment.</p>
<h4>Product Range</h4>
<ul>
<li><strong>Digital Signage Displays</strong> - Lobby information screens</li>
<li><strong>Lobby Dustbins</strong> - Stainless steel bins</li>
<li><strong>Luggage Trolleys</strong> - Bellman trolleys</li>
<li><strong>Stanchions</strong> - Queue management posts</li>
</ul>`,
      productCategoryId: categories[9].id,
      order: 9,
      duration: 15,
    },
  ];

  for (const mod of productModules) {
    await prisma.module.create({
      data: {
        ...mod,
        courseId: productAcademyCourse.id,
      }
    });
  }
  console.log('✅ Product Academy modules created (10)');

  // Course 2: Sales Academy
  const salesCourse = await prisma.course.create({
    data: {
      title: 'LAXREE Sales Academy',
      description: 'Master the art of selling hospitality products',
      moduleType: 'SALES_ACADEMY',
      learningPathId: salesPath.id,
      duration: 120,
      isRequired: true,
      isActive: true,
    }
  });

  const salesModules = [
    { title: 'Introduction to B2B Hospitality Sales', description: 'Understanding the hospitality sales landscape', content: '<h3>Introduction to B2B Hospitality Sales</h3><p>The hospitality industry presents unique B2B sales opportunities. Unlike consumer sales, hotel procurement involves multiple decision-makers and longer sales cycles.</p><h4>Key Learning Points</h4><ul><li>Understanding hotel buying committees</li><li>B2B vs B2C sales differences</li><li>Hospitality market size & growth</li><li>Building relationships with hotel chains</li></ul>', contentType: 'text', order: 0, duration: 20 },
    { title: 'Understanding Hotel Procurement Process', description: 'How hotels buy and who makes decisions', content: '<h3>Hotel Procurement Process</h3><p>Hotel procurement follows structured processes involving multiple stakeholders.</p><h4>Decision Makers</h4><ul><li>General Manager - Final approval</li><li>Housekeeping Manager - Product selection</li><li>Purchase Manager - Vendor negotiation</li><li>IT Manager - Tech product evaluation</li></ul>', contentType: 'text', order: 1, duration: 25 },
    { title: 'Building Client Relationships', description: 'Techniques for building lasting hotel relationships', content: '<h3>Building Client Relationships</h3><p>Long-term relationships are the foundation of hospitality sales success.</p><h4>Relationship Building Strategies</h4><ul><li>Regular property visits</li><li>Understanding their pain points</li><li>Providing solutions, not products</li><li>Follow-up consistency</li></ul>', contentType: 'text', order: 2, duration: 20 },
    { title: 'Sales Pitch & Presentation Skills', description: 'How to present LAXREE products effectively', content: '<h3>Sales Pitch & Presentation</h3><p>An effective sales pitch addresses client needs and demonstrates value.</p><h4>Pitch Structure</h4><ul><li>Opening - Reference their specific needs</li><li>Problem - Identify their current challenges</li><li>Solution - Present LAXREE products as the answer</li><li>Value - Show ROI and cost savings</li><li>Close - Next steps and timeline</li></ul>', contentType: 'text', order: 3, duration: 25 },
  ];

  for (const mod of salesModules) {
    await prisma.module.create({ data: { ...mod, courseId: salesCourse.id } });
  }
  console.log('✅ Sales Academy modules created (4)');

  // Course 3: Field Sales Academy
  const fieldSalesCourse = await prisma.course.create({
    data: {
      title: 'Field Sales Academy',
      description: 'Training for field sales representatives visiting hotels',
      moduleType: 'FIELD_SALES',
      learningPathId: fieldSalesPath.id,
      duration: 90,
      isRequired: true,
      isActive: true,
    }
  });

  const fieldSalesModules = [
    { title: 'Field Sales Fundamentals', description: 'Core skills for field sales success', content: '<h3>Field Sales Fundamentals</h3><p>Field sales requires unique skills for in-person hotel visits and product demonstrations.</p><h4>Core Skills</h4><ul><li>Territory planning & route optimization</li><li>First impression & professional appearance</li><li>Product demonstration techniques</li><li>Handling objections in person</li></ul>', contentType: 'text', order: 0, duration: 20 },
    { title: 'Hotel Visit Preparation', description: 'How to prepare for successful hotel visits', content: '<h3>Hotel Visit Preparation</h3><p>Preparation is key to successful hotel visits.</p><h4>Pre-Visit Checklist</h4><ul><li>Research the property & brand standards</li><li>Know the decision-maker names</li><li>Prepare product samples & catalogs</li><li>Review previous interaction notes</li></ul>', contentType: 'text', order: 1, duration: 20 },
    { title: 'On-Site Product Demonstrations', description: 'How to conduct effective product demos', content: '<h3>On-Site Product Demonstrations</h3><p>A great demo can close the deal on the spot.</p><h4>Demo Best Practices</h4><ul><li>Set up in the actual hotel environment</li><li>Let the client experience the product</li><li>Highlight unique features vs competitors</li><li>Show warranty & service documentation</li></ul>', contentType: 'text', order: 2, duration: 20 },
    { title: 'Field Sales Closing Techniques', description: 'Techniques to close deals in the field', content: '<h3>Field Sales Closing Techniques</h3><p>Master the art of closing deals during hotel visits.</p><h4>Closing Strategies</h4><ul><li>Assumptive close - "When shall we deliver?"</li><li>Trial close - "Does this meet your requirements?"</li><li>Urgency close - "This price is valid this month"</li><li>Summary close - Recap all agreed benefits</li></ul>', contentType: 'text', order: 3, duration: 20 },
  ];

  for (const mod of fieldSalesModules) {
    await prisma.module.create({ data: { ...mod, courseId: fieldSalesCourse.id } });
  }
  console.log('✅ Field Sales Academy modules created (4)');

  // Course 4: Inbound Sales Academy
  const inboundCourse = await prisma.course.create({
    data: {
      title: 'Inbound Sales Academy',
      description: 'Training for inbound sales handling phone & digital inquiries',
      moduleType: 'INBOUND_SALES',
      learningPathId: inboundPath.id,
      duration: 90,
      isRequired: true,
      isActive: true,
    }
  });

  const inboundModules = [
    { title: 'Inbound Sales Fundamentals', description: 'Core skills for handling inbound inquiries', content: '<h3>Inbound Sales Fundamentals</h3><p>Inbound sales is about converting incoming inquiries into orders.</p><h4>Key Skills</h4><ul><li>Active listening & needs assessment</li><li>Quick product knowledge recall</li><li>Email & phone communication excellence</li><li>Follow-up & nurturing sequences</li></ul>', contentType: 'text', order: 0, duration: 20 },
    { title: 'Handling Phone Inquiries', description: 'Best practices for phone-based sales', content: '<h3>Handling Phone Inquiries</h3><p>Phone inquiries are high-intent opportunities.</p><h4>Phone Sales Framework</h4><ul><li>Greeting & rapport building</li><li>Needs assessment questions</li><li>Product recommendation</li><li>Price quotation & terms</li><li>Close with next steps</li></ul>', contentType: 'text', order: 1, duration: 20 },
    { title: 'Email & Digital Communication', description: 'Professional email and digital follow-up', content: '<h3>Email & Digital Communication</h3><p>Professional digital communication builds credibility.</p><h4>Email Best Practices</h4><ul><li>Subject lines that get opened</li><li>Structured product proposals</li><li>Follow-up timing & frequency</li><li>Attaching catalogs & price lists</li></ul>', contentType: 'text', order: 2, duration: 20 },
    { title: 'Converting Inquiries to Orders', description: 'Techniques to increase conversion rates', content: '<h3>Converting Inquiries to Orders</h3><p>High conversion rates separate top performers.</p><h4>Conversion Strategies</h4><ul><li>Fast response time (under 1 hour)</li><li>Personalized product recommendations</li><li>Competitive pricing strategies</li><li>Creating urgency with limited offers</li></ul>', contentType: 'text', order: 3, duration: 20 },
  ];

  for (const mod of inboundModules) {
    await prisma.module.create({ data: { ...mod, courseId: inboundCourse.id } });
  }
  console.log('✅ Inbound Sales Academy modules created (4)');

  // Course 5: Company Orientation
  const orientationCourse = await prisma.course.create({
    data: {
      title: 'Company Orientation',
      description: 'Welcome to LAXREE - Company overview and policies',
      moduleType: 'ORIENTATION',
      learningPathId: onboardingPath.id,
      duration: 60,
      isRequired: true,
      isActive: true,
    }
  });

  const orientationModules = [
    { title: 'Welcome to LAXREE', description: 'Introduction to the company', content: '<h3>Welcome to LAXREE!</h3><p>We are thrilled to have you join the LAXREE family. This orientation will help you understand our company, culture, and your role in our success.</p><h4>What You Will Learn</h4><ul><li>Company history & mission</li><li>Organizational structure</li><li>Products & services overview</li><li>Company policies & benefits</li></ul>', contentType: 'text', order: 0, duration: 15 },
    { title: 'Company Policies & Code of Conduct', description: 'Understanding company policies', content: '<h3>Company Policies & Code of Conduct</h3><p>Every LAXREE employee must understand and follow our company policies.</p><h4>Key Policies</h4><ul><li>Professional conduct standards</li><li>Confidentiality agreements</li><li>Travel & expense policies</li><li>Customer data protection</li></ul>', contentType: 'text', order: 1, duration: 15 },
    { title: 'Products & Services Overview', description: 'High-level overview of LAXREE product range', content: '<h3>Products & Services Overview</h3><p>LAXREE offers 15+ product categories for the hospitality industry.</p><h4>Product Categories</h4><ul><li>Mini Bars & Safes</li><li>RFID Locks & Kettles</li><li>Hair Dryers & Dispensers</li><li>Housekeeping & Lobby Equipment</li><li>Mattresses & Room Accessories</li></ul>', contentType: 'text', order: 2, duration: 15 },
    { title: 'Your Role & Responsibilities', description: 'Understanding your role at LAXREE', content: '<h3>Your Role & Responsibilities</h3><p>As a LAXREE team member, you play a crucial role in our growth.</p><h4>Expectations</h4><ul><li>Daily activity targets</li><li>CRM & reporting requirements</li><li>Customer service standards</li><li>Continuous learning commitment</li></ul>', contentType: 'text', order: 3, duration: 15 },
  ];

  for (const mod of orientationModules) {
    await prisma.module.create({ data: { ...mod, courseId: orientationCourse.id } });
  }
  console.log('✅ Orientation modules created (4)');

  // ========== QUESTION BANKS ==========
  console.log('Creating question banks...');
  
  // MCQ Questions for Product Academy
  const mcqQuestions = [
    { question: 'What does LAXREE specialize in?', optionA: 'Consumer electronics', optionB: 'Hospitality product solutions', optionC: 'Automotive parts', optionD: 'Food & beverage', correctAnswer: 'B', explanation: 'LAXREE is India\'s leading B2B hospitality product solutions provider.', category: 'General', difficulty: 'easy', moduleType: 'ORIENTATION' },
    { question: 'Which mini bar type is ideal for 5-star hotels?', optionA: 'Thermoelectric', optionB: 'Absorption', optionC: 'Compressor', optionD: 'Manual', correctAnswer: 'C', explanation: 'Compressor mini bars offer the most powerful cooling, ideal for 5-star hotels.', category: 'Mini Bars', difficulty: 'medium', moduleType: 'PRODUCT_ACADEMY' },
    { question: 'What is the noise level of absorption mini bars?', optionA: '45dB', optionB: '35dB', optionC: '25dB', optionD: '55dB', correctAnswer: 'C', explanation: 'Absorption mini bars operate as quietly as 25dB, ensuring guest comfort.', category: 'Mini Bars', difficulty: 'medium', moduleType: 'PRODUCT_ACADEMY' },
    { question: 'Which safe box is designed for laptop storage?', optionA: 'Essential Safe', optionB: 'Medium Safe', optionC: 'Laptop Safe', optionD: 'Orbita Safe', correctAnswer: 'C', explanation: 'The Laptop Safe is extra large specifically designed for laptops & valuables.', category: 'Safe Boxes', difficulty: 'easy', moduleType: 'PRODUCT_ACADEMY' },
    { question: 'What locking mechanism does the Orbita Safe feature?', optionA: 'Key only', optionB: 'Digital keypad only', optionC: 'Rotating mechanism with biometric option', optionD: 'Combination lock', correctAnswer: 'C', explanation: 'The Orbita Safe is a premium rotating safe with biometric option.', category: 'Safe Boxes', difficulty: 'hard', moduleType: 'PRODUCT_ACADEMY' },
    { question: 'Which RFID lock supports mobile key?', optionA: 'M1 Lock only', optionB: 'T5 Lock only', optionC: 'T6 Lock', optionD: 'None', correctAnswer: 'C', explanation: 'The T6 Lock is the premium model supporting both Bluetooth and RFID including mobile key.', category: 'RFID Locks', difficulty: 'medium', moduleType: 'PRODUCT_ACADEMY' },
    { question: 'What safety feature prevents the kettle from boiling dry?', optionA: 'LED indicator', optionB: 'Auto shut-off', optionC: 'Boil-dry protection', optionD: 'Temperature control', correctAnswer: 'C', explanation: 'Boil-dry protection automatically shuts off the kettle when water level is too low.', category: 'Kettles', difficulty: 'easy', moduleType: 'PRODUCT_ACADEMY' },
    { question: 'What type of dispenser is touchless?', optionA: 'Manual dispenser', optionB: 'Push-button dispenser', optionC: 'Automatic sensor dispenser', optionD: 'Wall-mount dispenser', correctAnswer: 'C', explanation: 'Automatic sensor dispensers are touchless, using infrared sensors to detect hands.', category: 'Dispensers', difficulty: 'easy', moduleType: 'PRODUCT_ACADEMY' },
    { question: 'What is the main advantage of LAXREE as a single vendor?', optionA: 'Lower product quality', optionB: 'One source for 15+ categories', optionC: 'Limited product range', optionD: 'Higher prices', correctAnswer: 'B', explanation: 'LAXREE provides single vendor convenience with 15+ product categories under one roof.', category: 'General', difficulty: 'easy', moduleType: 'ORIENTATION' },
    { question: 'Which housekeeping product is used for linen transport?', optionA: 'Maid cart', optionB: 'Linen cart', optionC: 'Room service trolley', optionD: 'Bellman trolley', correctAnswer: 'B', explanation: 'Linen carts are specifically designed for transporting clean & dirty linen.', category: 'Housekeeping', difficulty: 'medium', moduleType: 'PRODUCT_ACADEMY' },
    // Sales questions
    { question: 'Who typically has final approval in hotel procurement?', optionA: 'Housekeeping Manager', optionB: 'IT Manager', optionC: 'General Manager', optionD: 'Front Desk', correctAnswer: 'C', explanation: 'The General Manager typically has final approval authority in hotel procurement.', category: 'Sales', difficulty: 'easy', moduleType: 'SALES_ACADEMY' },
    { question: 'What is the first step in a sales pitch?', optionA: 'Show products', optionB: 'Reference their specific needs', optionC: 'Give price quote', optionD: 'Ask for order', correctAnswer: 'B', explanation: 'An effective pitch opens by referencing the client\'s specific needs.', category: 'Sales', difficulty: 'medium', moduleType: 'SALES_ACADEMY' },
    { question: 'What is the recommended response time for inbound inquiries?', optionA: '24 hours', optionB: '1 week', optionC: 'Under 1 hour', optionD: 'Next business day', correctAnswer: 'C', explanation: 'Fast response time (under 1 hour) is key to high conversion rates.', category: 'Inbound Sales', difficulty: 'medium', moduleType: 'INBOUND_SALES' },
    { question: 'What closing technique assumes the deal is done?', optionA: 'Trial close', optionB: 'Urgency close', optionC: 'Assumptive close', optionD: 'Summary close', correctAnswer: 'C', explanation: 'The assumptive close uses language like "When shall we deliver?" assuming agreement.', category: 'Field Sales', difficulty: 'hard', moduleType: 'FIELD_SALES' },
    { question: 'What should you do before a hotel visit?', optionA: 'Just show up', optionB: 'Research the property & brand standards', optionC: 'Skip preparation', optionD: 'Only bring business cards', correctAnswer: 'B', explanation: 'Researching the property and brand standards is essential for a successful visit.', category: 'Field Sales', difficulty: 'easy', moduleType: 'FIELD_SALES' },
    // More product questions
    { question: 'What capacity options are available for LAXREE mini bars?', optionA: '10L, 20L, 30L', optionB: '20L, 30L, 40L, 50L', optionC: '50L, 60L, 70L', optionD: '5L, 10L, 15L', correctAnswer: 'B', explanation: 'LAXREE mini bars are available in 20L, 30L, 40L, and 50L capacities.', category: 'Mini Bars', difficulty: 'medium', moduleType: 'PRODUCT_ACADEMY' },
    { question: 'What feature does the LED vanity mirror have?', optionA: 'Radio', optionB: 'Touch sensor & anti-fog', optionC: 'Bluetooth speaker', optionD: 'Clock', correctAnswer: 'B', explanation: 'The LED vanity mirror features touch sensor operation and anti-fog technology.', category: 'Hair Dryers', difficulty: 'easy', moduleType: 'PRODUCT_ACADEMY' },
    { question: 'What is the most important factor for hotel mini bar selection?', optionA: 'Color', optionB: 'Silent operation', optionC: 'Brand name', optionD: 'Weight', correctAnswer: 'B', explanation: 'Silent operation is critical for mini bars in hotel rooms to ensure guest comfort.', category: 'Mini Bars', difficulty: 'medium', moduleType: 'PRODUCT_ACADEMY' },
    { question: 'What does PMS integration refer to in RFID locks?', optionA: 'Project Management System', optionB: 'Property Management System', optionC: 'Product Marketing System', optionD: 'Personal Monitoring System', correctAnswer: 'B', explanation: 'PMS stands for Property Management System, which hotel RFID locks can integrate with.', category: 'RFID Locks', difficulty: 'hard', moduleType: 'PRODUCT_ACADEMY' },
    { question: 'What is the triple dispenser used for?', optionA: 'Three types of soap', optionB: 'Shampoo, body wash, and lotion', optionC: 'Hot, cold, and warm water', optionD: 'Cleaning, rinsing, sanitizing', correctAnswer: 'B', explanation: 'The triple dispenser holds shampoo, body wash, and lotion in one unit.', category: 'Dispensers', difficulty: 'easy', moduleType: 'PRODUCT_ACADEMY' },
  ];

  const createdMCQs = [];
  for (const q of mcqQuestions) {
    const qb = await prisma.questionBank.create({
      data: {
        ...q,
        questionType: 'MCQ',
        acceptableAnswers: null,
      }
    });
    createdMCQs.push(qb);
  }
  console.log(`✅ Created ${createdMCQs.length} MCQ questions`);

  // Short Answer Questions
  const shortAnswerQuestions = [
    { question: 'Explain the difference between compressor and absorption mini bars.', correctAnswer: 'Compressor mini bars offer powerful cooling ideal for 5-star hotels, while absorption mini bars operate silently making them perfect for guest rooms where noise is a concern.', acceptableAnswers: '["compressor cooling power","absorption silent operation","5-star hotels","guest comfort","noise level"]', category: 'Mini Bars', difficulty: 'medium', moduleType: 'PRODUCT_ACADEMY' },
    { question: 'Describe the key selling points of LAXREE safe boxes for hotels.', correctAnswer: 'LAXREE safe boxes offer digital keypad with admin override, LED display, motorized locking, emergency battery backup, and wall/floor mount options making them ideal for hotel security.', acceptableAnswers: '["digital keypad","admin override","motorized locking","battery backup","mount options","hotel security"]', category: 'Safe Boxes', difficulty: 'medium', moduleType: 'PRODUCT_ACADEMY' },
    { question: 'How would you pitch LAXREE RFID locks to a hotel GM?', correctAnswer: 'Focus on enhanced guest security, mobile key convenience for modern travelers, PMS integration for seamless operations, and reduced key card replacement costs.', acceptableAnswers: '["guest security","mobile key","PMS integration","cost savings","modern travelers","key card"]', category: 'RFID Locks', difficulty: 'hard', moduleType: 'PRODUCT_ACADEMY' },
    { question: 'Explain the hotel procurement decision-making process.', correctAnswer: 'Hotel procurement involves multiple stakeholders: GM for final approval, Housekeeping Manager for product selection, Purchase Manager for vendor negotiation, and IT Manager for tech product evaluation.', acceptableAnswers: '["General Manager","Housekeeping Manager","Purchase Manager","IT Manager","approval","decision"]', category: 'Sales', difficulty: 'medium', moduleType: 'SALES_ACADEMY' },
    { question: 'What is the assumptive close technique and when should you use it?', correctAnswer: 'The assumptive close uses language that assumes agreement like "When shall we deliver?" It works best when the client has shown positive buying signals throughout the presentation.', acceptableAnswers: '["assumes agreement","when shall we deliver","buying signals","positive signals","presentation"]', category: 'Field Sales', difficulty: 'hard', moduleType: 'FIELD_SALES' },
    { question: 'How should you handle a phone inquiry for mini bars?', correctAnswer: 'Greet professionally, assess their property type and room count, recommend appropriate mini bar type, provide competitive pricing, and close with a site visit proposal.', acceptableAnswers: '["greet professionally","assess needs","property type","recommend products","site visit"]', category: 'Inbound Sales', difficulty: 'medium', moduleType: 'INBOUND_SALES' },
    { question: 'What makes LAXREE different from other hospitality suppliers?', correctAnswer: 'LAXREE offers single vendor convenience with 15+ product categories, hotel-specific expertise, pan-India distribution, ISO certified quality, and dedicated after-sales support.', acceptableAnswers: '["single vendor","15+ categories","hotel expertise","pan-India","ISO certified","after-sales"]', category: 'General', difficulty: 'easy', moduleType: 'ORIENTATION' },
    { question: 'Describe the features of the T6 RFID lock.', correctAnswer: 'The T6 is the premium RFID lock supporting both Bluetooth and RFID technology, including mobile key functionality, privacy mode, and PMS integration for modern hotels.', acceptableAnswers: '["Bluetooth","RFID","mobile key","privacy mode","PMS integration","premium"]', category: 'RFID Locks', difficulty: 'hard', moduleType: 'PRODUCT_ACADEMY' },
    { question: 'What preparation should you do before visiting a hotel?', correctAnswer: 'Research the property and brand standards, know decision-maker names, prepare product samples and catalogs, and review previous interaction notes.', acceptableAnswers: '["research property","brand standards","decision makers","samples","catalogs","previous notes"]', category: 'Field Sales', difficulty: 'medium', moduleType: 'FIELD_SALES' },
    { question: 'Explain the benefits of automatic soap dispensers for hotels.', correctAnswer: 'Automatic dispensers are touchless for hygiene, reduce soap waste through controlled dispensing, enhance bathroom aesthetics, and align with luxury hotel standards.', acceptableAnswers: '["touchless","hygiene","reduce waste","controlled dispensing","aesthetics","luxury"]', category: 'Dispensers', difficulty: 'easy', moduleType: 'PRODUCT_ACADEMY' },
  ];

  const createdSAs = [];
  for (const q of shortAnswerQuestions) {
    const qb = await prisma.questionBank.create({
      data: {
        ...q,
        questionType: 'SHORT_ANSWER',
        optionA: null,
        optionB: null,
        optionC: null,
        optionD: null,
      }
    });
    createdSAs.push(qb);
  }
  console.log(`✅ Created ${createdSAs.length} Short Answer questions`);

  // ========== ASSESSMENTS (module quizzes) ==========
  console.log('Creating assessments...');
  
  // Create assessment for each course
  const allCourses = [productAcademyCourse, salesCourse, fieldSalesCourse, inboundCourse, orientationCourse];
  let assessmentCount = 0;
  
  for (const course of allCourses) {
    const courseModules = await prisma.module.findMany({ where: { courseId: course.id } });
    for (const mod of courseModules) {
      // Find matching questions
      const matchingQuestions = [...createdMCQs, ...createdSAs].filter(q => 
        q.moduleType === course.moduleType || q.category === mod.title.split(' - ')[0] || q.category === 'General'
      ).slice(0, 5);

      if (matchingQuestions.length > 0) {
        const assessment = await prisma.assessment.create({
          data: {
            title: `${mod.title} Quiz`,
            description: `Assessment for ${mod.title}`,
            moduleType: course.moduleType,
            duration: 10,
            passingScore: 70,
            totalQuestions: matchingQuestions.length,
            isActive: true,
          }
        });

        for (let i = 0; i < matchingQuestions.length; i++) {
          await prisma.assessmentQuestion.create({
            data: {
              assessmentId: assessment.id,
              questionBankId: matchingQuestions[i].id,
              order: i,
              marks: 1,
            }
          });
        }
        assessmentCount++;
      }
    }
  }
  console.log(`✅ Created ${assessmentCount} assessments`);

  // ========== EXAMS (8 exams: 2 types × 4 stages) ==========
  console.log('Creating exams...');

  const examConfigs = [
    { type: 'INBOUND_SALES', stage: 'PRE', title: 'Inbound Sales - Pre Assessment', duration: 30, passing: 60, days: 0, desc: 'Baseline assessment for new inbound sales team members' },
    { type: 'INBOUND_SALES', stage: 'MID', title: 'Inbound Sales - Mid Term', duration: 45, passing: 65, days: 7, desc: 'Mid-training assessment for inbound sales' },
    { type: 'INBOUND_SALES', stage: 'HARD', title: 'Inbound Sales - Advanced', duration: 60, passing: 70, days: 30, desc: 'Advanced assessment for inbound sales proficiency' },
    { type: 'INBOUND_SALES', stage: 'EXTRA_HARD', title: 'Inbound Sales - Expert', duration: 75, passing: 75, days: 45, desc: 'Expert level assessment - certification ready' },
    { type: 'FIELD_SALES', stage: 'PRE', title: 'Field Sales - Pre Assessment', duration: 30, passing: 60, days: 0, desc: 'Baseline assessment for new field sales team members' },
    { type: 'FIELD_SALES', stage: 'MID', title: 'Field Sales - Mid Term', duration: 45, passing: 65, days: 7, desc: 'Mid-training assessment for field sales' },
    { type: 'FIELD_SALES', stage: 'HARD', title: 'Field Sales - Advanced', duration: 60, passing: 70, days: 30, desc: 'Advanced assessment for field sales proficiency' },
    { type: 'FIELD_SALES', stage: 'EXTRA_HARD', title: 'Field Sales - Expert', duration: 75, passing: 75, days: 45, desc: 'Expert level assessment - certification ready' },
  ];

  // Create additional exam-specific questions
  const examMCQs = [
    // Inbound Sales specific
    { question: 'A hotel chain inquires about 200 mini bars for their new property. What is your first response?', optionA: 'Send a price list immediately', optionB: 'Ask about their property type, room count, and specific requirements', optionC: 'Transfer to senior sales', optionD: 'Ask them to visit the website', correctAnswer: 'B', explanation: 'Needs assessment should always come before pricing.', category: 'Inbound Sales', difficulty: 'easy', moduleType: 'INBOUND_SALES' },
    { question: 'A client asks for a discount on the first order. What should you do?', optionA: 'Immediately offer maximum discount', optionB: 'Refuse any discount', optionC: 'Explore volume-based pricing while emphasizing value', optionD: 'End the call', correctAnswer: 'C', explanation: 'Volume-based pricing maintains value perception while accommodating budget needs.', category: 'Inbound Sales', difficulty: 'medium', moduleType: 'INBOUND_SALES' },
    { question: 'What is the best way to follow up after sending a quotation?', optionA: 'Wait for them to call back', optionB: 'Call after 2-3 business days to address questions', optionC: 'Send daily reminder emails', optionD: 'Visit the hotel unannounced', correctAnswer: 'B', explanation: 'Following up after 2-3 days shows professionalism without being pushy.', category: 'Inbound Sales', difficulty: 'easy', moduleType: 'INBOUND_SALES' },
    { question: 'A 3-star hotel wants premium products. How do you handle this?', optionA: 'Sell premium anyway', optionB: 'Recommend products matching their budget while explaining value', optionC: 'Decline to serve them', optionD: 'Refer to a competitor', correctAnswer: 'B', explanation: 'Matching products to budget while explaining value builds trust and long-term relationships.', category: 'Inbound Sales', difficulty: 'hard', moduleType: 'INBOUND_SALES' },
    { question: 'What CRM data should you log after every inbound call?', optionA: 'Nothing, it is not important', optionB: 'Only the order details', optionC: 'Client needs, budget, timeline, decision-maker, and next steps', optionD: 'Just the client name', correctAnswer: 'C', explanation: 'Comprehensive CRM logging ensures no information is lost and enables effective follow-up.', category: 'Inbound Sales', difficulty: 'medium', moduleType: 'INBOUND_SALES' },
    // Field Sales specific
    { question: 'You arrive at a hotel for a scheduled meeting but the GM is busy. What do you do?', optionA: 'Leave immediately', optionB: 'Wait politely and try to meet the Housekeeping or Purchase Manager instead', optionC: 'Insist on meeting the GM', optionD: 'Call repeatedly until they answer', correctAnswer: 'B', explanation: 'Meeting other decision-makers maximizes the visit value.', category: 'Field Sales', difficulty: 'easy', moduleType: 'FIELD_SALES' },
    { question: 'During a demo, the client compares LAXREE with a cheaper competitor. How do you respond?', optionA: 'Agree the competitor is cheaper', optionB: 'Ignore the comparison', optionC: 'Highlight total cost of ownership including warranty, service, and product lifespan', optionD: 'Badmouth the competitor', correctAnswer: 'C', explanation: 'Total cost of ownership demonstrates long-term value over initial price.', category: 'Field Sales', difficulty: 'hard', moduleType: 'FIELD_SALES' },
    { question: 'What is the ideal time to request a purchase order during a hotel visit?', optionA: 'At the start of the meeting', optionB: 'After demonstrating value and addressing all concerns', optionC: 'Never - wait for them to offer', optionD: 'Only if they ask', correctAnswer: 'B', explanation: 'Request the order after demonstrating value and addressing all objections.', category: 'Field Sales', difficulty: 'medium', moduleType: 'FIELD_SALES' },
    { question: 'How do you handle a client who says "We already have a supplier"?', optionA: 'Give up and leave', optionB: 'Ask about their satisfaction and offer a comparison or trial', optionC: 'Criticize their current supplier', optionD: 'Offer to undercut their price drastically', correctAnswer: 'B', explanation: 'Asking about satisfaction opens the door to demonstrate LAXREE advantages.', category: 'Field Sales', difficulty: 'hard', moduleType: 'FIELD_SALES' },
    { question: 'What should you always carry during a field visit?', optionA: 'Just business cards', optionB: 'Product samples, catalogs, price lists, and a demo kit', optionC: 'Only a laptop', optionD: 'Personal items', correctAnswer: 'B', explanation: 'Being prepared with samples, catalogs, and demo kits enables effective presentations.', category: 'Field Sales', difficulty: 'easy', moduleType: 'FIELD_SALES' },
    // More difficult questions
    { question: 'A hotel wants to upgrade 500 rooms with new safes but has budget constraints. What solution do you propose?', optionA: 'Suggest cheaper, lower quality safes', optionB: 'Propose phased rollout starting with premium floors, then standard rooms', optionC: 'Decline the business', optionD: 'Offer all safes at once with extended payment terms', correctAnswer: 'B', explanation: 'Phased rollout allows the hotel to manage budget while upgrading progressively.', category: 'Sales Strategy', difficulty: 'hard', moduleType: 'FIELD_SALES' },
    { question: 'Your client reports a defect in 3 out of 100 mini bars. What is the correct response?', optionA: 'Blame the hotel staff', optionB: 'Acknowledge the issue, arrange immediate replacement, and investigate root cause', optionC: 'Ignore the complaint', optionD: 'Ask them to fix it themselves', correctAnswer: 'B', explanation: 'Immediate replacement and root cause investigation demonstrates LAXREE service commitment.', category: 'After-Sales', difficulty: 'medium', moduleType: 'INBOUND_SALES' },
    { question: 'What KPI should an inbound sales rep track daily?', optionA: 'Social media likes', optionB: 'Number of inquiries handled, conversion rate, and average response time', optionC: 'Office attendance', optionD: 'Coffee consumption', correctAnswer: 'B', explanation: 'Inquiries handled, conversion rate, and response time are core inbound sales KPIs.', category: 'Inbound Sales', difficulty: 'easy', moduleType: 'INBOUND_SALES' },
    { question: 'A resort wants RFID locks that work with their existing PMS. What should you verify first?', optionA: 'The color of the locks', optionB: 'PMS compatibility and integration protocol', optionC: 'How many keys they need', optionD: 'Their brand name', correctAnswer: 'B', explanation: 'PMS compatibility verification prevents integration issues after installation.', category: 'Technical Sales', difficulty: 'hard', moduleType: 'FIELD_SALES' },
    { question: 'Which metric indicates a healthy sales pipeline?', optionA: 'Many leads but no conversions', optionB: 'Balanced distribution across pipeline stages with consistent progression', optionC: 'All deals in final stage', optionD: 'No deals at all', correctAnswer: 'B', explanation: 'A healthy pipeline shows balanced distribution and consistent deal progression.', category: 'Sales', difficulty: 'medium', moduleType: 'SALES_ACADEMY' },
  ];

  const createdExamMCQs = [];
  for (const q of examMCQs) {
    const qb = await prisma.questionBank.create({
      data: { ...q, questionType: 'MCQ', acceptableAnswers: null }
    });
    createdExamMCQs.push(qb);
  }
  console.log(`✅ Created ${createdExamMCQs.length} exam MCQ questions`);

  // Exam Short Answers
  const examSA = [
    { question: 'A luxury hotel chain wants to standardize mini bars across 10 properties. Outline your sales approach.', correctAnswer: 'Research their current mini bar setup across properties, prepare a volume-based proposal with standardization benefits, schedule a presentation with their procurement committee, offer pilot installation at one property, and provide comprehensive service SLA.', acceptableAnswers: '["research current setup","volume proposal","standardization","procurement committee","pilot installation","service SLA"]', category: 'Sales Strategy', difficulty: 'hard', moduleType: 'INBOUND_SALES' },
    { question: 'Describe how you would handle a complaint about delayed delivery of safe boxes.', correctAnswer: 'Acknowledge the delay sincerely, provide a clear updated timeline, offer interim solutions if needed, escalate internally for priority handling, and follow up until delivery is confirmed.', acceptableAnswers: '["acknowledge delay","updated timeline","interim solutions","escalate","follow up"]', category: 'After-Sales', difficulty: 'medium', moduleType: 'INBOUND_SALES' },
    { question: 'Explain the total cost of ownership argument for LAXREE mini bars vs cheaper alternatives.', correctAnswer: 'LAXREE mini bars offer lower energy consumption reducing electricity costs, longer lifespan reducing replacement frequency, comprehensive warranty reducing maintenance costs, and better service network reducing downtime costs.', acceptableAnswers: '["energy consumption","lifespan","warranty","service network","downtime","total cost"]', category: 'Sales Strategy', difficulty: 'hard', moduleType: 'FIELD_SALES' },
    { question: 'How would you build a relationship with a new hotel that just opened in your territory?', correctAnswer: 'Congratulate them on opening, schedule an introductory visit with product samples, understand their brand standards and procurement needs, provide a tailored product proposal, and maintain regular follow-up communication.', acceptableAnswers: '["congratulate","introductory visit","brand standards","tailored proposal","follow-up"]', category: 'Field Sales', difficulty: 'medium', moduleType: 'FIELD_SALES' },
    { question: 'A hotel GM asks why they should choose LAXREE over their existing supplier of 5 years. How do you respond?', correctAnswer: 'Acknowledge their loyalty to current supplier, ask about satisfaction levels, highlight LAXREE unique advantages like single vendor convenience for 15+ categories, superior after-sales service, and offer a trial order to demonstrate quality.', acceptableAnswers: '["acknowledge loyalty","satisfaction","single vendor","15+ categories","after-sales","trial order"]', category: 'Sales Strategy', difficulty: 'hard', moduleType: 'FIELD_SALES' },
    { question: 'Describe the process of converting a cold lead into a LAXREE customer.', correctAnswer: 'Research the property, make initial contact with personalized pitch, schedule a meeting or product demo, provide customized proposal, address objections with value propositions, and close with clear next steps.', acceptableAnswers: '["research","initial contact","personalized","meeting","demo","proposal","objections","close"]', category: 'Sales', difficulty: 'medium', moduleType: 'SALES_ACADEMY' },
  ];

  const createdExamSAs = [];
  for (const q of examSA) {
    const qb = await prisma.questionBank.create({
      data: { ...q, questionType: 'SHORT_ANSWER', optionA: null, optionB: null, optionC: null, optionD: null }
    });
    createdExamSAs.push(qb);
  }
  console.log(`✅ Created ${createdExamSAs.length} exam short answer questions`);

  // Create Exam records and assign questions
  const allExamQuestions = [...createdExamMCQs, ...createdExamSAs];
  
  for (const config of examConfigs) {
    const exam = await prisma.exam.create({
      data: {
        examType: config.type,
        stage: config.stage,
        title: config.title,
        description: config.desc,
        duration: config.duration,
        passingScore: config.passing,
        timeGateDays: config.days,
        totalQuestions: 0,
        isActive: true,
      }
    });

    // Assign questions matching the exam type
    let order = 0;
    const typeQuestions = allExamQuestions.filter(q => q.moduleType === config.type);
    const generalQuestions = allExamQuestions.filter(q => q.moduleType === 'SALES_ACADEMY' || q.category === 'Sales Strategy');
    const questionsForExam = [...typeQuestions, ...generalQuestions].slice(0, 10);

    for (const q of questionsForExam) {
      await prisma.examQuestion.create({
        data: {
          examId: exam.id,
          questionBankId: q.id,
          order: order++,
          marks: 1,
        }
      });
    }

    // Update total questions count
    await prisma.exam.update({
      where: { id: exam.id },
      data: { totalQuestions: questionsForExam.length }
    });
  }
  console.log('✅ Created 8 exams with questions');

  // ========== CERTIFICATIONS ==========
  await prisma.certification.create({
    data: {
      name: 'LAXREE Product Expert',
      description: 'Certified product knowledge expert',
      moduleType: 'PRODUCT_ACADEMY',
      requiredScore: 70,
      validityPeriod: 12,
      isActive: true,
    }
  });
  await prisma.certification.create({
    data: {
      name: 'Inbound Sales Certified',
      description: 'Certified inbound sales professional',
      moduleType: 'INBOUND_SALES',
      requiredScore: 75,
      validityPeriod: 12,
      isActive: true,
    }
  });
  await prisma.certification.create({
    data: {
      name: 'Field Sales Certified',
      description: 'Certified field sales professional',
      moduleType: 'FIELD_SALES',
      requiredScore: 75,
      validityPeriod: 12,
      isActive: true,
    }
  });
  console.log('✅ Certifications created');

  // ========== DOCUMENTS ==========
  const documents = [
    { title: 'Mini Bar Product Catalog', type: 'pdf', fileUrl: '/upload/Mini Bar.pdf', fileName: 'Mini Bar.pdf', category: 'Product Catalog' },
    { title: 'Safe Box Product Catalog', type: 'pdf', fileUrl: '/upload/Safe Box.pdf', fileName: 'Safe Box.pdf', category: 'Product Catalog' },
    { title: 'RFID Door Lock Catalog', type: 'pdf', fileUrl: '/upload/RFID Door Lock.pdf', fileName: 'RFID Door Lock.pdf', category: 'Product Catalog' },
    { title: 'Electric Kettle Catalog', type: 'pdf', fileUrl: '/upload/Electric Kettle.pdf', fileName: 'Electric Kettle.pdf', category: 'Product Catalog' },
    { title: 'Mirror & Hair Dryer Catalog', type: 'pdf', fileUrl: '/upload/Mirror & Hair Dryer.pdf', fileName: 'Mirror & Hair Dryer.pdf', category: 'Product Catalog' },
    { title: 'Dispenser Catalog', type: 'pdf', fileUrl: '/upload/Dispenser.pdf', fileName: 'Dispenser.pdf', category: 'Product Catalog' },
    { title: 'Laxree Master Catalogue', type: 'catalog', fileUrl: '/upload/Laxree Master Catalogue  New.pdf', fileName: 'Laxree Master Catalogue.pdf', category: 'Master Catalog' },
    { title: 'Sales Training Manual', type: 'pdf', fileUrl: '/upload/Laxree_Sales_Training_Manual.pdf', fileName: 'Sales Training Manual.pdf', category: 'Training' },
    { title: 'Amenities SSP', type: 'pdf', fileUrl: '/upload/Amenities SSP dtd 10.3.26 (All) (1).pdf', fileName: 'Amenities SSP.pdf', category: 'Product Catalog' },
    { title: 'Hotel Hangers Catalog', type: 'pdf', fileUrl: '/upload/Hotel Hangers.pdf', fileName: 'Hotel Hangers.pdf', category: 'Product Catalog' },
    { title: 'Housekeeping Trolley Catalog', type: 'pdf', fileUrl: '/upload/Housekeeping Trolley.pdf', fileName: 'Housekeeping Trolley.pdf', category: 'Product Catalog' },
    { title: 'Lobby Dustbin Catalog', type: 'pdf', fileUrl: '/upload/Lobby Dustbin.pdf', fileName: 'Lobby Dustbin.pdf', category: 'Product Catalog' },
    { title: 'Luggage Trolley Catalog', type: 'pdf', fileUrl: '/upload/Luggage.pdf', fileName: 'Luggage.pdf', category: 'Product Catalog' },
    { title: 'Digital Signage Catalog', type: 'pdf', fileUrl: '/upload/Digital Signage.pdf', fileName: 'Digital Signage.pdf', category: 'Product Catalog' },
    { title: 'Washroom Amenities Catalog', type: 'pdf', fileUrl: '/upload/Washroom Amenities.pdf', fileName: 'Washroom Amenities.pdf', category: 'Product Catalog' },
    { title: 'Rollaway Bed Catalog', type: 'pdf', fileUrl: '/upload/Rollaway Bed.pdf', fileName: 'Rollaway Bed.pdf', category: 'Product Catalog' },
    { title: 'Hotel Add-ons Catalog', type: 'pdf', fileUrl: '/upload/Hotel Add-ons.pdf', fileName: 'Hotel Add-ons.pdf', category: 'Product Catalog' },
    { title: 'Kettle Tray Catalog', type: 'pdf', fileUrl: '/upload/Kettle Tray.pdf', fileName: 'Kettle Tray.pdf', category: 'Product Catalog' },
  ];

  for (const doc of documents) {
    await prisma.document.create({ data: doc });
  }
  console.log('✅ Documents created');

  // Final count
  const finalCounts = {
    users: await prisma.user.count(),
    departments: await prisma.department.count(),
    courses: await prisma.course.count(),
    modules: await prisma.module.count(),
    questions: await prisma.questionBank.count(),
    exams: await prisma.exam.count(),
    assessments: await prisma.assessment.count(),
    certifications: await prisma.certification.count(),
    documents: await prisma.document.count(),
  };
  console.log('📊 Final counts:', JSON.stringify(finalCounts, null, 2));
  console.log('🎉 Seed complete!');

  await prisma.$disconnect();
}

main().catch(e => { console.error('ERROR:', e); process.exit(1); });
