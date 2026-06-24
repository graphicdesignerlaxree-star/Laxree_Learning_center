// Shared roofing video lessons data.
// Used by:
//   - src/components/employee/learning-center.tsx (Study Materials chapters + Roofing Product Academy Chapters tab)
//   - src/components/employee/lesson-viewer.tsx (Watch Video tab inside installation modules)
//
// Keeping this in a shared lib file avoids circular imports between the two components.

export interface VideoLesson {
  id: string
  title: string
  duration: string
  category: string
  image: string
  description: string
  transcript: string[]
  keyPoints: string[]
  youtubeId: string
}

export const ROOFING_VIDEO_LESSONS: VideoLesson[] = [
  {
    id: 'rv1',
    title: 'Stone-Coated Tile Installation — Valley Detail',
    duration: '8:24',
    category: 'Stone-Coated',
    image: '/roofing-products/stone-coated-tile.jpg',
    description: 'Step-by-step installation of stone-coated metal roof tiles in a valley, showing proper overlap and waterproofing technique.',
    transcript: [
      `Welcome to this stone-coated metal roof tile installation tutorial focused on valley detailing. Valleys are one of the most leak-prone areas of any roof, so proper technique here is critical for a waterproof installation.`,
      `PREPARATION: Before laying tiles in the valley, install a pre-fabricated valley flashing made of the same AZ-coated steel as the tiles. The valley flashing should extend at least 100mm under the tiles on each side. Secure the flashing to the MS frame with screws at 200mm intervals.`,
      `TILE LAYOUT: Start from the bottom of the valley and work upward. Each tile must overlap the one below by at least 2 inches (50mm) on three sides — top, left, and right. When two roof planes meet at the valley, the tiles from each plane should converge at the valley centerline with a closed-cut or woven pattern.`,
      `FASTENING & FINISHING: Use the manufacturer-provided screws with EPDM washers to fasten each tile at the corners. Never over-tighten — the washer should be just compressed. After all tiles are laid, apply a bead of acrylic sealant along the valley centerline as a secondary waterproofing measure. Inspect the entire valley from below to confirm no gaps are visible.`,
    ],
    keyPoints: [
      'Install pre-fabricated valley flashing before laying tiles',
      'Maintain 2-inch (50mm) overlap on top, left, and right sides',
      'Use EPDM-washer screws at every corner — never over-tighten',
      'Apply acrylic sealant along valley centerline as secondary waterproofing',
    ],
    youtubeId: 'NcoaiGbEeAI',
  },
  {
    id: 'rv2',
    title: 'DECRA Villa Tile Installation Guide',
    duration: '12:10',
    category: 'Stone-Coated',
    image: '/roofing-products/stone-coated-classic.jpg',
    description: 'Complete installation walkthrough of DECRA-style stone-coated Villa tiles on a residential roof.',
    transcript: [
      `This video walks through a complete DECRA Villa Tile installation on a residential roof. Villa tiles are a premium stone-coated profile with a distinctive scalloped bottom edge that mimics traditional European clay tiles.`,
      `ROOF PREPARATION: Verify the MS frame is solid, properly spaced (typically 600mm centers), and free of rust. Install breathable underlayment across the entire roof deck before laying any tiles. The underlayment provides a secondary weather barrier behind the tiles.`,
      `TILE INSTALLATION: Start at the bottom-left corner and work upward in a diagonal pattern. Each Villa tile interlocks with the next via a left-edge hook. Fasten each tile with 4-6 screws (depending on wind zone) at the marked fastening points. The bottom-edge scallop creates the characteristic shadow line.`,
      `RIDGE & HIP: Finish the roof with matching ridge caps and hip caps. Use ridge vents under the ridge cap to allow attic ventilation. Apply butyl tape at all hip/ridge joints for a watertight seal. Final inspection: walk the roof (carefully, on the screws) and check for any movement or loose tiles.`,
    ],
    keyPoints: [
      'Install breathable underlayment before laying Villa tiles',
      'Start at bottom-left, work diagonally upward',
      'Use 4-6 screws per tile depending on wind zone',
      'Install ridge vents under ridge caps for attic ventilation',
    ],
    youtubeId: 'qaHsC-COyTg',
  },
  {
    id: 'rv3',
    title: 'Stone-Coated Sheet Step-by-Step Install',
    duration: '15:32',
    category: 'Stone-Coated',
    image: '/roofing-products/stone-coated-tudor.jpg',
    description: 'Full step-by-step guide to installing stone-coated roofing sheets — frame, fastening, and finishing.',
    transcript: [
      `This is a complete step-by-step installation guide for stone-coated roofing sheets (Tudor profile). The Tudor profile features a flat-tile appearance with a defined shadow line between tiles for a classic European look.`,
      `FRAME PREPARATION: The MS frame must be welded to specification — typically 50x50x3mm MS tubes at 600mm centers for rafters and 400mm centers for purlins. Apply two coats of red oxide primer followed by one coat of enamel paint to prevent corrosion.`,
      `SHEET LAYOUT & FASTENING: Begin at the bottom eave and work up to the ridge. Each sheet overlaps the one below by 2 inches. Side laps are 1 corrugation. Use AZ-coated screws with EPDM washers, fastening at every purlin intersection. A string line helps keep rows straight.`,
      `FINISHING: Install eave closures (foam or AZ-coated metal) to prevent pest entry. Apply ridge caps with butyl tape sealant. Walk only on the screw lines to avoid denting the flat sections. After installation, sweep the roof with a soft broom to remove any stone chips loosened during handling.`,
    ],
    keyPoints: [
      'MS frame: 50x50x3mm tubes, 600mm rafter centers, 400mm purlin centers',
      'Prime and paint MS frame before installation (2 oxide + 1 enamel)',
      'Maintain 2-inch vertical lap and 1-corrugation side lap',
      'Walk only on screw lines to avoid denting flat sections',
    ],
    youtubeId: 'dPznayY99ec',
  },
  {
    id: 'rv4',
    title: 'Synthetic Thatch — Four-Sided Roof Install',
    duration: '9:45',
    category: 'Thatch',
    image: '/roofing-products/thatch-tile.jpg',
    description: 'Installation tutorial for synthetic thatch tiles on a four-sided roof structure with underlying substrate.',
    transcript: [
      `This tutorial covers synthetic thatch tile installation on a four-sided (hip) roof. The four-sided hip design is common for resort cottages, gazebos, and poolside cabanas.`,
      `SUBSTRATE PREPARATION: Synthetic thatch requires a solid substrate — typically plywood (min 12mm), OSB board, or fiber cement board. Install the substrate over the MS frame, ensuring all joints are taped. Install underlayment over the substrate for additional waterproofing.`,
      `THATCH TILE LAYOUT: Start at the bottom eave and work upward. Each thatch tile (500x500mm) is fastened with 6-8 screws through the pre-marked holes. The tiles should overlap by 50-75mm to achieve a dense, natural appearance. At the hips, cut tiles at the appropriate angle with a utility knife.`,
      `RIDGE FINISH: Install a synthetic thatch ridge roll along the hip ridges. Fasten the ridge roll every 200mm. The ridge roll conceals the top edge of the field tiles and provides a finished appearance. Final inspection: check that no substrate is visible from any angle.`,
    ],
    keyPoints: [
      'Synthetic thatch requires a solid substrate (plywood/OSB/fiber cement)',
      'Install underlayment over substrate for additional waterproofing',
      'Overlap tiles by 50-75mm for dense, natural appearance',
      'Install synthetic thatch ridge roll on all hip ridges',
    ],
    youtubeId: 'ZHPn8ScNz68',
  },
  {
    id: 'rv5',
    title: 'Thatch Tiles — How To Install',
    duration: '6:18',
    category: 'Thatch',
    image: '/roofing-products/thatch-umbrella.jpg',
    description: 'Quick practical demonstration of installing artificial thatch tiles with proper overlap and fastening.',
    transcript: [
      `This is a quick practical demonstration of installing artificial thatch tiles on a small umbrella structure. The same principles apply to larger roofs.`,
      `TILE PREPARATION: Inspect each thatch tile before installation. The PE strands should be uniform in color and length. Reject any tile with visible manufacturing defects.`,
      `FASTENING: Use 25mm AZ-coated screws with washers. Fasten through the pre-marked holes — 4 holes per 500x500mm tile. Do not over-tighten, as this can crack the PE base. The tile should sit flat against the substrate.`,
      `OVERLAP PATTERN: For a natural thatch appearance, overlap tiles so the strands of the upper tile cover the fasteners of the lower tile. This conceals all screws and creates a seamless look. Trim any excess strands with scissors for a clean edge.`,
    ],
    keyPoints: [
      'Inspect each tile for uniform color and length before installation',
      'Use 25mm AZ-coated screws with washers, 4 per 500x500mm tile',
      'Do not over-tighten — PE base can crack',
      'Overlap to conceal fasteners and create a seamless look',
    ],
    youtubeId: 'A1toKD41BAU',
  },
  {
    id: 'rv6',
    title: 'VIVA Palm Thatch — Installation Training',
    duration: '11:22',
    category: 'Thatch',
    image: '/roofing-products/thatch-tile.jpg',
    description: 'Professional installation training for VIVA Palm synthetic thatch on cabana and gazebo structures.',
    transcript: [
      `This professional installation training covers VIVA Palm synthetic thatch on cabana and gazebo structures. VIVA Palm is a premium PE thatch product with a palm-leaf texture, ideal for high-end resort installations.`,
      `STRUCTURE PREP: Ensure the cabana frame is sturdy enough to support the substrate and thatch load (approx 8-10 kg/sqm). Install 15mm marine plywood over the frame, sealed at all joints with butyl tape.`,
      `INSTALLATION PATTERN: VIVA Palm tiles are designed for a staggered installation pattern. Row 1: full tiles. Row 2: half-tile offset. This staggered pattern mimics natural palm thatch and prevents visible seam lines. Fasten each tile with 6 screws at the marked points.`,
      `DETAILING: At the cabana crown (top), install a custom thatch crown piece. At the eave edge, allow the thatch strands to overhang 50mm for a natural drip edge. Inspect the finished roof from all sides — no substrate should be visible. Clean any debris with a leaf blower (low setting).`,
    ],
    keyPoints: [
      'Ensure cabana frame supports 8-10 kg/sqm substrate + thatch load',
      'Install 15mm marine plywood, sealed with butyl tape',
      'Staggered pattern: Row 1 full tiles, Row 2 half-tile offset',
      'Allow 50mm thatch overhang at eave for natural drip edge',
    ],
    youtubeId: 'sVjvOXQVO0M',
  },
  {
    id: 'rv7',
    title: 'Roof Shingles Installation — Part 1',
    duration: '10:15',
    category: 'Shingles',
    image: '/roofing-products/asphalt-shingles.jpg',
    description: 'Part 1 of asphalt shingle installation — deck prep, underlayment, and starter course.',
    transcript: [
      `Welcome to Part 1 of our asphalt shingle installation series. This segment covers deck preparation, underlayment installation, and the critical starter course.`,
      `DECK PREPARATION: The roof deck must be solid (plywood or OSB, min 12mm), clean, and dry. Replace any rotten or soft decking. Verify the deck is properly fastened to the trusses — no squeaks when walked on. The deck slope must be at least 15 degrees (3:12 pitch) for shingle installation.`,
      `UNDERLAYMENT: Roll out self-adhesive bitumen underlayment (or asphalt-saturated felt) from the bottom eave upward. Overlap horizontal seams by 100mm and vertical seams by 150mm. At the eaves, install a self-adhesive ice-and-water shield membrane extending 600mm up the roof from the eave edge.`,
      `STARTER COURSE: Cut the tabs off a full shingle to create the starter course. Lay the starter course along the eave edge, with the sealant strip facing UP (toward the ridge). The starter course overhangs the eave and rake edges by 12mm for drip clearance. Fasten every 300mm.`,
    ],
    keyPoints: [
      'Deck must be solid (plywood/OSB min 12mm), clean, and dry',
      'Minimum roof slope: 15 degrees (3:12 pitch) for shingles',
      'Install ice-and-water shield 600mm up from eave edge',
      'Starter course: tabs removed, sealant strip UP, 12mm overhang',
    ],
    youtubeId: 'nWf7pKm3nQY',
  },
  {
    id: 'rv8',
    title: 'Roof Shingles Installation — Part 2',
    duration: '12:45',
    category: 'Shingles',
    image: '/roofing-products/asphalt-shingles.jpg',
    description: 'Part 2 of asphalt shingle installation — field shingles, nailing pattern, and flashing.',
    transcript: [
      `Part 2 covers field shingle installation, proper nailing pattern, and flashing around penetrations.`,
      `FIELD SHINGLE LAYOUT: Start the first course at the bottom-left corner, aligned with the starter course. Use a chalk line every 5 rows to keep courses straight. Each shingle is 1m long with 3 tabs — align the tab cutouts to create the 3-tab pattern. The vertical offset between courses should be 1/2 tab (170mm).`,
      `NAILING PATTERN: Each shingle requires 4 nails (6 nails in high-wind zones). Nail placement: 25mm in from each end, and 25mm above the cutout. Nails must be driven straight and flush — not under-driven (sticking up) or over-driven (cutting into the shingle). Use 25mm roofing nails with a 9mm head.`,
      `FLASHING: Install step flashing at all roof-to-wall intersections — a new piece of flashing with every course of shingles, extending 150mm up the wall and 150mm onto the roof. At plumbing vents, use a rubber boot flashing sealed with asphalt mastic. At chimneys, install cricket (saddle) flashing on the uphill side.`,
    ],
    keyPoints: [
      'Use chalk lines every 5 rows to keep courses straight',
      '4 nails per shingle (6 in high-wind zones), 25mm from edges',
      'Nails must be straight and flush — never under or over-driven',
      'Install step flashing at every roof-to-wall intersection',
    ],
    youtubeId: 'bV-4sF6Q1KE',
  },
  {
    id: 'rv9',
    title: 'Roof Shingles Installation — Part 3',
    duration: '9:30',
    category: 'Shingles',
    image: '/roofing-products/asphalt-shingles.jpg',
    description: 'Part 3 of asphalt shingle installation — ridge cap, ventilation, and final inspection.',
    transcript: [
      `Part 3 completes the shingle installation with ridge cap installation, roof ventilation, and a final inspection checklist.`,
      `RIDGE CAP: Cut standard shingles into 3 equal pieces (333mm x 250mm) for ridge caps. Bend each cap slightly and nail over the ridge, overlapping by 150mm. The sealant strip on each cap seals to the one below. Nail placement: one nail per side, 150mm from the bottom edge of each cap.`,
      `VENTILATION: A properly ventilated roof extends shingle life by 30-50%. Install ridge vents under the ridge caps — cut a 50mm slot on each side of the ridge deck, install the ridge vent, then install the ridge cap over it. Verify intake vents (soffit/eave) are clear and unblocked by insulation.`,
      `FINAL INSPECTION: Walk the perimeter and check for: (1) all nails flush, (2) all tabs sealed (lift gently — they should resist), (3) all flashing properly lapped, (4) ridge vents unobstructed, (5) no shingles lifted at edges. A properly installed asphalt shingle roof will last 20-30 years with minimal maintenance.`,
    ],
    keyPoints: [
      'Cut ridge caps: 333mm x 250mm, overlap 150mm, one nail per side',
      'Install ridge vents — cut 50mm slot each side of ridge deck',
      'Proper ventilation extends shingle life by 30-50%',
      'Final inspection: nails flush, tabs sealed, flashing lapped',
    ],
    youtubeId: 'JxLB1N9VnU8',
  },
]

// Helper: given a module title, return the matching roofing installation videos.
// Used by lesson-viewer.tsx to show a "Watch Video" tab inside installation modules.
// Returns [] for non-installation modules or unknown product categories.
export function getRoofingVideosForModuleTitle(moduleTitle: string): VideoLesson[] {
  const title = moduleTitle.toLowerCase()
  if (title.includes('stone') && title.includes('coated')) {
    return ROOFING_VIDEO_LESSONS.filter(v => v.category === 'Stone-Coated')
  }
  if (title.includes('thatch')) {
    return ROOFING_VIDEO_LESSONS.filter(v => v.category === 'Thatch')
  }
  if (title.includes('shingle')) {
    return ROOFING_VIDEO_LESSONS.filter(v => v.category === 'Shingles')
  }
  // Generic installation module (no specific product) → show all 9
  if (title.includes('install')) {
    return ROOFING_VIDEO_LESSONS
  }
  return []
}

// Category color mapping for badges (shared between components)
export const VIDEO_CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  'Stone-Coated': { bg: 'bg-amber-100', text: 'text-amber-700' },
  'Thatch': { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  'Shingles': { bg: 'bg-rose-100', text: 'text-rose-700' },
}
