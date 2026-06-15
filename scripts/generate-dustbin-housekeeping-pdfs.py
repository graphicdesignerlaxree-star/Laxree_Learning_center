#!/usr/bin/env python3
"""
LAXREE Product Training PDF Generator
Generates premium product training PDFs for:
1. Lobby Dustbin
2. Housekeeping & Linen Trolley
"""

import os
import sys
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import inch, cm
from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    PageBreak, KeepTogether, HRFlowable, Image
)
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase.pdfmetrics import registerFontFamily

# ── Font Registration ──
pdfmetrics.registerFont(TTFont('LiberationSerif', '/usr/share/fonts/truetype/liberation/LiberationSerif-Regular.ttf'))
pdfmetrics.registerFont(TTFont('LiberationSerif-Bold', '/usr/share/fonts/truetype/liberation/LiberationSerif-Bold.ttf'))
pdfmetrics.registerFont(TTFont('LiberationSerif-Italic', '/usr/share/fonts/truetype/liberation/LiberationSerif-Italic.ttf'))
pdfmetrics.registerFont(TTFont('LiberationSans', '/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf'))
pdfmetrics.registerFont(TTFont('LiberationSans-Bold', '/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf'))
pdfmetrics.registerFont(TTFont('DejaVuSans', '/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf'))
registerFontFamily('LiberationSerif', normal='LiberationSerif', bold='LiberationSerif-Bold', italic='LiberationSerif-Italic')
registerFontFamily('LiberationSans', normal='LiberationSans', bold='LiberationSans-Bold')
registerFontFamily('DejaVuSans', normal='DejaVuSans', bold='DejaVuSans')

# ── Page setup ──
PAGE_W, PAGE_H = A4
LEFT_M = 1.0 * inch
RIGHT_M = 1.0 * inch
TOP_M = 0.8 * inch
BOTTOM_M = 0.8 * inch
CONTENT_W = PAGE_W - LEFT_M - RIGHT_M

# ── Styles ──
def make_styles(accent, text_primary, text_muted):
    """Create a set of paragraph styles with the given palette colors."""
    styles = {}
    styles['cover_title'] = ParagraphStyle(
        name='CoverTitle', fontName='LiberationSerif', fontSize=32, leading=40,
        textColor=accent, alignment=TA_CENTER, spaceAfter=12
    )
    styles['cover_subtitle'] = ParagraphStyle(
        name='CoverSubtitle', fontName='LiberationSerif', fontSize=16, leading=22,
        textColor=text_primary, alignment=TA_CENTER, spaceAfter=8
    )
    styles['cover_meta'] = ParagraphStyle(
        name='CoverMeta', fontName='LiberationSerif', fontSize=11, leading=16,
        textColor=text_muted, alignment=TA_CENTER, spaceAfter=6
    )
    styles['h1'] = ParagraphStyle(
        name='H1', fontName='LiberationSerif', fontSize=22, leading=28,
        textColor=accent, spaceBefore=18, spaceAfter=10
    )
    styles['h2'] = ParagraphStyle(
        name='H2', fontName='LiberationSerif', fontSize=16, leading=22,
        textColor=text_primary, spaceBefore=14, spaceAfter=8
    )
    styles['h3'] = ParagraphStyle(
        name='H3', fontName='LiberationSerif', fontSize=13, leading=18,
        textColor=accent, spaceBefore=10, spaceAfter=6
    )
    styles['body'] = ParagraphStyle(
        name='Body', fontName='LiberationSerif', fontSize=10.5, leading=17,
        textColor=text_primary, alignment=TA_JUSTIFY, spaceAfter=6,
        firstLineIndent=0
    )
    styles['bullet'] = ParagraphStyle(
        name='Bullet', fontName='LiberationSerif', fontSize=10.5, leading=17,
        textColor=text_primary, alignment=TA_LEFT, spaceAfter=4,
        leftIndent=20, bulletIndent=8
    )
    styles['table_header'] = ParagraphStyle(
        name='TableHeader', fontName='LiberationSerif', fontSize=10, leading=14,
        textColor=colors.white, alignment=TA_CENTER
    )
    styles['table_cell'] = ParagraphStyle(
        name='TableCell', fontName='LiberationSerif', fontSize=9.5, leading=14,
        textColor=text_primary, alignment=TA_CENTER
    )
    styles['table_cell_left'] = ParagraphStyle(
        name='TableCellLeft', fontName='LiberationSerif', fontSize=9.5, leading=14,
        textColor=text_primary, alignment=TA_LEFT
    )
    styles['callout'] = ParagraphStyle(
        name='Callout', fontName='LiberationSerif', fontSize=11, leading=17,
        textColor=accent, alignment=TA_LEFT, spaceAfter=6,
        leftIndent=16, borderPadding=6
    )
    styles['footer'] = ParagraphStyle(
        name='Footer', fontName='LiberationSerif', fontSize=8, leading=10,
        textColor=text_muted, alignment=TA_CENTER
    )
    return styles


def make_table(data, col_widths, accent, bg_surface, styles, has_header=True):
    """Create a styled table with the given data and column widths."""
    t = Table(data, colWidths=col_widths, hAlign='CENTER')
    style_cmds = [
        ('GRID', (0, 0), (-1, -1), 0.5, styles['table_cell_left'].textColor),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ]
    if has_header:
        style_cmds.extend([
            ('BACKGROUND', (0, 0), (-1, 0), accent),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ])
        for i in range(1, len(data)):
            bg = colors.white if i % 2 == 1 else bg_surface
            style_cmds.append(('BACKGROUND', (0, i), (-1, i), bg))
    t.setStyle(TableStyle(style_cmds))
    return t


def add_page_number(canvas, doc):
    """Add page number footer."""
    canvas.saveState()
    canvas.setFont('LiberationSerif', 8)
    canvas.setFillColor(colors.HexColor('#908c84'))
    page_num = canvas.getPageNumber()
    canvas.drawCentredString(PAGE_W / 2, 0.5 * inch, f"LAXREE Product Training  |  Page {page_num}")
    canvas.restoreState()


def generate_dustbin_pdf():
    """Generate Lobby Dustbin product training PDF."""
    # Palette - warm stone/metallic tones matching dustbin materials
    ACCENT = colors.HexColor('#6b4c1e')
    TEXT_PRIMARY = colors.HexColor('#2a2520')
    TEXT_MUTED = colors.HexColor('#8a7e72')
    BG_SURFACE = colors.HexColor('#ede8e0')
    
    s = make_styles(ACCENT, TEXT_PRIMARY, TEXT_MUTED)
    
    output_path = '/home/z/my-project/upload/Lobby Dustbin.pdf'
    doc = SimpleDocTemplate(
        output_path, pagesize=A4,
        leftMargin=LEFT_M, rightMargin=RIGHT_M,
        topMargin=TOP_M, bottomMargin=BOTTOM_M
    )
    
    story = []
    
    # ── Cover Page ──
    story.append(Spacer(1, 2.5 * inch))
    story.append(Paragraph('<b>LAXREE</b>', s['cover_title']))
    story.append(Spacer(1, 8))
    story.append(HRFlowable(width="60%", thickness=2, color=ACCENT, spaceAfter=16, spaceBefore=8))
    story.append(Paragraph('<b>Lobby Dustbin</b>', ParagraphStyle(
        'CoverProduct', fontName='LiberationSerif', fontSize=28, leading=34,
        textColor=TEXT_PRIMARY, alignment=TA_CENTER, spaceAfter=8
    )))
    story.append(Paragraph('Premium Waste Management Solutions', s['cover_subtitle']))
    story.append(Spacer(1, 24))
    story.append(Paragraph('Product Training Guide for Sales Professionals', s['cover_meta']))
    story.append(Paragraph('LAXREE Hotel Supplies & Amenities', s['cover_meta']))
    story.append(Paragraph('2025 Edition', s['cover_meta']))
    story.append(Spacer(1, 1.5 * inch))
    story.append(HRFlowable(width="40%", thickness=1, color=TEXT_MUTED, spaceAfter=8))
    story.append(Paragraph('CONFIDENTIAL - For Internal Training Use Only', ParagraphStyle(
        'Conf', fontName='LiberationSerif', fontSize=9, leading=12,
        textColor=TEXT_MUTED, alignment=TA_CENTER
    )))
    story.append(PageBreak())
    
    # ── Table of Contents ──
    story.append(Paragraph('<b>Table of Contents</b>', s['h1']))
    story.append(Spacer(1, 12))
    toc_items = [
        ('1.', 'Product Overview'),
        ('2.', 'Product Range & Models'),
        ('3.', 'Materials & Design Philosophy'),
        ('4.', 'Key Features & Benefits'),
        ('5.', 'Selling Strategy by Hotel Tier'),
        ('6.', 'Objection Handling'),
        ('7.', 'Video Transcript Summary'),
    ]
    for num, title in toc_items:
        story.append(Paragraph(f'<b>{num}</b>  {title}', ParagraphStyle(
            f'TOC_{num}', fontName='LiberationSerif', fontSize=12, leading=20,
            textColor=TEXT_PRIMARY, leftIndent=20, spaceAfter=4
        )))
    story.append(PageBreak())
    
    # ── Section 1: Product Overview ──
    story.append(Paragraph('<b>1. Product Overview</b>', s['h1']))
    story.append(Spacer(1, 8))
    story.append(Paragraph(
        'LAXREE Lobby Dustbins are designed for the most visible and high-traffic areas of a hotel - '
        'lobbies, corridors, banquet halls, and public spaces. Unlike generic waste bins, LAXREE dustbins '
        'are <b>architectural elements</b> that complement the interior design while delivering reliable '
        'waste management performance.', s['body']))
    story.append(Spacer(1, 8))
    story.append(Paragraph(
        'Our range spans three distinct material categories - <b>Stainless Steel, Synthetic Stone, and '
        'Natural Stone</b> - each offering a different aesthetic and price point to match any hotel '
        'concept. From sleek minimalist cylinders to gold-accented stone masterpieces, LAXREE has the '
        'right dustbin for every space.', s['body']))
    story.append(Spacer(1, 8))
    story.append(Paragraph('<b>Why LAXREE Dustbins Stand Out:</b>', s['h3']))
    bullets = [
        '<b>Three Material Tiers:</b> Stainless Steel (practical), Synthetic Stone (premium), Natural Stone (ultra-luxury)',
        '<b>Multiple Lid Options:</b> Open-top for convenience, Swing Lid for hygiene, Rectangular opening for directional waste',
        '<b>Gold-Accented Stone Models:</b> Unique luxury finish that no competitor offers at this price point',
        '<b>Coordinated Range:</b> Matching stanchions, signage, and floor signs for complete lobby solutions',
        '<b>Commercial-Grade Durability:</b> Built for 24/7 high-traffic use with easy maintenance',
    ]
    for b in bullets:
        story.append(Paragraph(f'- {b}', s['bullet']))
    story.append(Spacer(1, 18))
    
    # ── Section 2: Product Range & Models ──
    story.append(Paragraph('<b>2. Product Range & Models</b>', s['h1']))
    story.append(Spacer(1, 8))
    story.append(Paragraph(
        'LAXREE offers a comprehensive dustbin range organized by shape and material. Each model is '
        'designed for specific hotel environments and design aesthetics.', s['body']))
    story.append(Spacer(1, 8))
    
    # Cylindrical SS
    story.append(Paragraph('<b>Stainless Steel Cylindrical Dustbins</b>', s['h2']))
    cyl_data = [
        [Paragraph('<b>Model</b>', s['table_header']),
         Paragraph('<b>Color</b>', s['table_header']),
         Paragraph('<b>Lid Type</b>', s['table_header']),
         Paragraph('<b>Dimensions</b>', s['table_header']),
         Paragraph('<b>Best For</b>', s['table_header'])],
        [Paragraph('LRLI-453', s['table_cell']), Paragraph('Black', s['table_cell']),
         Paragraph('Open-top', s['table_cell']), Paragraph('D250 x H600mm', s['table_cell']),
         Paragraph('Corridors, elevator lobbies', s['table_cell_left'])],
        [Paragraph('LRLI-451', s['table_cell']), Paragraph('Stainless Steel', s['table_cell']),
         Paragraph('Open-top w/ rect. opening', s['table_cell']), Paragraph('D300 x H600mm', s['table_cell']),
         Paragraph('Main lobby, reception', s['table_cell_left'])],
        [Paragraph('LRLI-449', s['table_cell']), Paragraph('Stainless Steel', s['table_cell']),
         Paragraph('Swing Lid, dome-top', s['table_cell']), Paragraph('Cylindrical', s['table_cell']),
         Paragraph('Dining areas, food courts', s['table_cell_left'])],
        [Paragraph('LRLI-450', s['table_cell']), Paragraph('Stainless Steel', s['table_cell']),
         Paragraph('Swing Lid, open-top style', s['table_cell']), Paragraph('Cylindrical', s['table_cell']),
         Paragraph('Conference rooms, banquet', s['table_cell_left'])],
    ]
    col_w1 = [CONTENT_W * 0.14, CONTENT_W * 0.16, CONTENT_W * 0.26, CONTENT_W * 0.18, CONTENT_W * 0.26]
    story.append(make_table(cyl_data, col_w1, ACCENT, BG_SURFACE, s))
    story.append(Spacer(1, 14))
    
    # Rectangular SS
    story.append(Paragraph('<b>Stainless Steel Rectangular Dustbins</b>', s['h2']))
    rect_data = [
        [Paragraph('<b>Model</b>', s['table_header']),
         Paragraph('<b>Color</b>', s['table_header']),
         Paragraph('<b>Lid Type</b>', s['table_header']),
         Paragraph('<b>Dimensions</b>', s['table_header']),
         Paragraph('<b>Best For</b>', s['table_header'])],
        [Paragraph('LRLI-445', s['table_cell']), Paragraph('Stainless Steel', s['table_cell']),
         Paragraph('Open-top', s['table_cell']), Paragraph('L250 x W250 x H600mm', s['table_cell']),
         Paragraph('Guest floors, narrow spaces', s['table_cell_left'])],
        [Paragraph('LRLI-452', s['table_cell']), Paragraph('Dark Gray', s['table_cell']),
         Paragraph('Open-top w/ rect. opening', s['table_cell']), Paragraph('L310 x W250 x H600mm', s['table_cell']),
         Paragraph('Lobby corners, beside seating', s['table_cell_left'])],
    ]
    story.append(make_table(rect_data, col_w1, ACCENT, BG_SURFACE, s))
    story.append(Spacer(1, 14))
    
    # Stone-Finish Premium
    story.append(Paragraph('<b>Stone-Finish Dustbins (Premium Collection)</b>', s['h2']))
    stone_data = [
        [Paragraph('<b>Model</b>', s['table_header']),
         Paragraph('<b>Material</b>', s['table_header']),
         Paragraph('<b>Finish</b>', s['table_header']),
         Paragraph('<b>Dimensions</b>', s['table_header']),
         Paragraph('<b>Best For</b>', s['table_header'])],
        [Paragraph('LRLI-454', s['table_cell']), Paragraph('Synthetic Stone', s['table_cell']),
         Paragraph('Gold-accented', s['table_cell']), Paragraph('L280 x W280 x H680mm', s['table_cell']),
         Paragraph('5-star lobbies, VIP areas', s['table_cell_left'])],
        [Paragraph('LRLI-446', s['table_cell']), Paragraph('Natural Stone', s['table_cell']),
         Paragraph('Gold-accented', s['table_cell']), Paragraph('L280 x W280 x H620mm', s['table_cell']),
         Paragraph('Luxury resorts, premium spas', s['table_cell_left'])],
        [Paragraph('LRLI-447', s['table_cell']), Paragraph('Synthetic Stone', s['table_cell']),
         Paragraph('Gold-accented', s['table_cell']), Paragraph('L300 x W300 x H680mm', s['table_cell']),
         Paragraph('Grand lobbies, ballrooms', s['table_cell_left'])],
        [Paragraph('LRLI-448', s['table_cell']), Paragraph('Natural Stone', s['table_cell']),
         Paragraph('Gold-accented', s['table_cell']), Paragraph('L300 x W300 x H680mm', s['table_cell']),
         Paragraph('Ultra-luxury, presidential suites', s['table_cell_left'])],
    ]
    story.append(make_table(stone_data, col_w1, ACCENT, BG_SURFACE, s))
    story.append(Spacer(1, 14))
    
    # Complementary Products
    story.append(Paragraph('<b>Complementary Lobby Products</b>', s['h2']))
    comp_data = [
        [Paragraph('<b>Model</b>', s['table_header']),
         Paragraph('<b>Product</b>', s['table_header']),
         Paragraph('<b>Description</b>', s['table_header'])],
        [Paragraph('LRLI-457', s['table_cell']), Paragraph('Stanchion', s['table_cell']),
         Paragraph('Crowd management post with rope/chain, pairs with lobby dustbins', s['table_cell_left'])],
        [Paragraph('LRLI-458', s['table_cell']), Paragraph('Stanchion', s['table_cell']),
         Paragraph('Alternative design stanchion for queue management', s['table_cell_left'])],
        [Paragraph('LRLI-459', s['table_cell']), Paragraph('Signage', s['table_cell']),
         Paragraph('Directional/informational signage for lobby areas', s['table_cell_left'])],
        [Paragraph('LRLI-460', s['table_cell']), Paragraph('Signage', s['table_cell']),
         Paragraph('Additional signage variant for wayfinding', s['table_cell_left'])],
        [Paragraph('LRHT-463', s['table_cell']), Paragraph('Floor Sign', s['table_cell']),
         Paragraph('Wet floor / caution floor sign for safety compliance', s['table_cell_left'])],
        [Paragraph('LRHT-469', s['table_cell']), Paragraph('Floor Sign', s['table_cell']),
         Paragraph('Alternative floor sign design for housekeeping', s['table_cell_left'])],
        [Paragraph('LRLI-467', s['table_cell']), Paragraph('Caution Sign', s['table_cell']),
         Paragraph('Compact caution/warning sign for maintenance areas', s['table_cell_left'])],
    ]
    col_w3 = [CONTENT_W * 0.14, CONTENT_W * 0.18, CONTENT_W * 0.68]
    story.append(make_table(comp_data, col_w3, ACCENT, BG_SURFACE, s))
    story.append(Spacer(1, 18))
    
    # ── Section 3: Materials & Design Philosophy ──
    story.append(Paragraph('<b>3. Materials & Design Philosophy</b>', s['h1']))
    story.append(Spacer(1, 8))
    
    story.append(Paragraph('<b>Material Comparison</b>', s['h2']))
    mat_data = [
        [Paragraph('<b>Material</b>', s['table_header']),
         Paragraph('<b>Aesthetic</b>', s['table_header']),
         Paragraph('<b>Durability</b>', s['table_header']),
         Paragraph('<b>Maintenance</b>', s['table_header']),
         Paragraph('<b>Price Tier</b>', s['table_header'])],
        [Paragraph('Stainless Steel', s['table_cell_left']),
         Paragraph('Modern, sleek, professional', s['table_cell_left']),
         Paragraph('Excellent - rust-resistant', s['table_cell_left']),
         Paragraph('Easy wipe-down', s['table_cell_left']),
         Paragraph('Mid-range', s['table_cell'])],
        [Paragraph('Synthetic Stone', s['table_cell_left']),
         Paragraph('Premium, textured, luxury', s['table_cell_left']),
         Paragraph('Very good - scratch-resistant', s['table_cell_left']),
         Paragraph('Low maintenance', s['table_cell_left']),
         Paragraph('Premium', s['table_cell'])],
        [Paragraph('Natural Stone', s['table_cell_left']),
         Paragraph('Ultra-luxury, unique, bespoke', s['table_cell_left']),
         Paragraph('Excellent - weather-resistant', s['table_cell_left']),
         Paragraph('Minimal - natural patina', s['table_cell_left']),
         Paragraph('Ultra-premium', s['table_cell'])],
    ]
    col_wm = [CONTENT_W * 0.18, CONTENT_W * 0.22, CONTENT_W * 0.22, CONTENT_W * 0.20, CONTENT_W * 0.18]
    story.append(make_table(mat_data, col_wm, ACCENT, BG_SURFACE, s))
    story.append(Spacer(1, 14))
    
    story.append(Paragraph('<b>Design Philosophy</b>', s['h2']))
    story.append(Paragraph(
        'Every LAXREE dustbin is designed with the belief that <b>functional objects in premium spaces '
        'should enhance, not detract from, the overall aesthetic</b>. Our design team works with '
        'interior designers and hotel operators to ensure each dustbin seamlessly integrates with '
        'the surrounding architecture.', s['body']))
    story.append(Spacer(1, 6))
    story.append(Paragraph(
        'The gold-accented stone collection represents our pinnacle achievement - combining the raw beauty '
        'of natural and synthetic stone with <b>handcrafted gold detailing</b> that transforms a simple '
        'waste receptacle into a statement piece worthy of 5-star lobbies.', s['body']))
    story.append(Spacer(1, 6))
    story.append(Paragraph(
        'For swing-lid models, the self-closing mechanism ensures <b>hygienic waste disposal</b> - '
        'essential in food service areas and high-traffic public spaces where odor control and visual '
        'cleanliness are paramount.', s['body']))
    story.append(Spacer(1, 18))
    
    # ── Section 4: Key Features & Benefits ──
    story.append(Paragraph('<b>4. Key Features & Benefits</b>', s['h1']))
    story.append(Spacer(1, 8))
    
    feat_data = [
        [Paragraph('<b>Feature</b>', s['table_header']),
         Paragraph('<b>Description</b>', s['table_header']),
         Paragraph('<b>Why It Matters</b>', s['table_header'])],
        [Paragraph('Open-Top Design', s['table_cell']),
         Paragraph('No lid to lift - easy waste disposal on the go', s['table_cell_left']),
         Paragraph('Higher usage compliance in high-traffic areas; guests use it more often', s['table_cell_left'])],
        [Paragraph('Swing Lid', s['table_cell']),
         Paragraph('Self-closing swing mechanism covers waste automatically', s['table_cell_left']),
         Paragraph('Odor control, hygiene compliance, conceals waste visually', s['table_cell_left'])],
        [Paragraph('Rectangular Opening', s['table_cell']),
         Paragraph('Directional opening guides waste into the bin', s['table_cell_left']),
         Paragraph('Reduces misses and spillage, cleaner surrounding floor', s['table_cell_left'])],
        [Paragraph('Gold Accents', s['table_cell']),
         Paragraph('Hand-applied gold detailing on stone-finish models', s['table_cell_left']),
         Paragraph('Luxury positioning, justifies premium pricing, wow factor', s['table_cell_left'])],
        [Paragraph('Stone-Finish Body', s['table_cell']),
         Paragraph('Synthetic or natural stone construction', s['table_cell_left']),
         Paragraph('Weight provides stability, premium tactile feel, unique appearance', s['table_cell_left'])],
        [Paragraph('Cylindrical Shape', s['table_cell']),
         Paragraph('Round profile fits any space and orientation', s['table_cell_left']),
         Paragraph('Versatile placement, 360-degree access, no corner orientation needed', s['table_cell_left'])],
        [Paragraph('Rectangular Shape', s['table_cell']),
         Paragraph('Square profile for wall and corner placement', s['table_cell_left']),
         Paragraph('Space-efficient, fits flush against walls, neat row placement', s['table_cell_left'])],
    ]
    col_wf = [CONTENT_W * 0.20, CONTENT_W * 0.38, CONTENT_W * 0.42]
    story.append(make_table(feat_data, col_wf, ACCENT, BG_SURFACE, s))
    story.append(Spacer(1, 18))
    
    # ── Section 5: Selling Strategy ──
    story.append(Paragraph('<b>5. Selling Strategy by Hotel Tier</b>', s['h1']))
    story.append(Spacer(1, 8))
    
    strategy_data = [
        [Paragraph('<b>Hotel Tier</b>', s['table_header']),
         Paragraph('<b>Recommended Model</b>', s['table_header']),
         Paragraph('<b>Pitch Angle</b>', s['table_header'])],
        [Paragraph('5-Star Luxury', s['table_cell_left']),
         Paragraph('Natural Stone LRLI-448', s['table_cell']),
         Paragraph('"A waste solution that matches the caliber of your lobby - guests will mistake it for a sculpture"', s['table_cell_left'])],
        [Paragraph('5-Star Premium', s['table_cell_left']),
         Paragraph('Synthetic Stone LRLI-454', s['table_cell']),
         Paragraph('"Gold-accented stone finish at a fraction of the natural stone cost - same luxury impression"', s['table_cell_left'])],
        [Paragraph('4-Star Premium', s['table_cell_left']),
         Paragraph('SS Cylindrical LRLI-451', s['table_cell']),
         Paragraph('"Professional stainless steel that complements any modern lobby design"', s['table_cell_left'])],
        [Paragraph('3-Star Business', s['table_cell_left']),
         Paragraph('SS Rectangular LRLI-445', s['table_cell']),
         Paragraph('"Compact, durable, and easy to maintain - the practical choice for high-traffic hotels"', s['table_cell_left'])],
        [Paragraph('Budget / Transit', s['table_cell_left']),
         Paragraph('SS Open-Top LRLI-453', s['table_cell']),
         Paragraph('"Maximum functionality at the most competitive price - built to last"', s['table_cell_left'])],
    ]
    col_w4 = [CONTENT_W * 0.18, CONTENT_W * 0.24, CONTENT_W * 0.58]
    story.append(make_table(strategy_data, col_w4, ACCENT, BG_SURFACE, s))
    story.append(Spacer(1, 12))
    
    story.append(Paragraph('<b>Bundle Strategy - Complete Lobby Solution</b>', s['h2']))
    story.append(Paragraph(
        'Always propose dustbins as part of a <b>complete lobby solution</b> that includes matching '
        'stanchions (LRLI-457/458), signage (LRLI-459/460), and floor signs (LRHT-463/469). '
        'Bundling increases order value by 40-60% while providing a cohesive look that interior '
        'designers appreciate.', s['body']))
    story.append(Spacer(1, 6))
    story.append(Paragraph(
        '<b>Sales Tip:</b> When presenting to 5-star properties, always lead with the stone-finish '
        'collection. Place the gold-accented model in the lobby during your pitch - the visual impact '
        'sells itself. For budget-conscious properties, show the SS range first and upsell stone as '
        'a "lobby centerpiece" option.', s['callout']))
    story.append(Spacer(1, 18))
    
    # ── Section 6: Objection Handling ──
    story.append(Paragraph('<b>6. Objection Handling</b>', s['h1']))
    story.append(Spacer(1, 8))
    
    objections = [
        ('"Dustbins are just functional - why spend more?"',
         'In premium hotels, every visible element affects guest perception. A cheap plastic bin in a luxury lobby creates dissonance. LAXREE stone-finish dustbins transform waste management into a design feature - guests notice the difference, and it reinforces the property\'s luxury positioning.'),
        ('"Our current bins work fine"',
         'Standard bins may function, but they don\'t contribute to the aesthetic. LAXREE dustbins offer the same reliable performance while enhancing the visual appeal of your public spaces. Plus, our commercial-grade construction lasts 3-5x longer than budget alternatives.'),
        ('"Stone dustbins are too expensive"',
         'Consider the total value: a stone-finish dustbin is a one-time investment that lasts 10+ years with minimal maintenance. It eliminates the need for replacement every 2-3 years, and the luxury appearance actually contributes to higher guest satisfaction scores in lobby areas.'),
        ('"Swing lids are annoying - open-top is better"',
         'Each lid type serves a purpose. Open-top is ideal for high-traffic corridors where convenience drives compliance. Swing lids are essential for food service areas, dining rooms, and enclosed spaces where odor control and visual hygiene are critical. We recommend a mix based on placement zones.'),
        ('"Our housekeeping team prefers lightweight bins"',
         'Lightweight bins tip over easily in busy lobbies, creating messes that require immediate attention. The weight of our stone-finish models provides stability - they stay in place even when bumped. For areas requiring frequent emptying, our SS models offer the perfect balance of weight and portability.'),
    ]
    for q, a in objections:
        story.append(Paragraph(f'<b>{q}</b>', s['h3']))
        story.append(Paragraph(a, s['body']))
        story.append(Spacer(1, 8))
    story.append(Spacer(1, 18))
    
    # ── Section 7: Video Transcript Summary ──
    story.append(Paragraph('<b>7. Video Transcript Summary</b>', s['h1']))
    story.append(Spacer(1, 8))
    story.append(Paragraph(
        'Based on the product video analysis, the LAXREE Lobby Dustbin collection features a '
        '<b>comprehensive range of waste management solutions</b> spanning three material categories '
        'and two form factors. The video showcases each model in detail, highlighting the design '
        'differences and optimal placement scenarios.', s['body']))
    story.append(Spacer(1, 6))
    story.append(Paragraph('<b>Key Visual Highlights from Video:</b>', s['h3']))
    video_points = [
        'Stainless steel cylindrical dustbins shown in both open-top and swing-lid configurations',
        'Black SS model (LRLI-453) demonstrates compact footprint ideal for corridor placement',
        'Rectangular SS models (LRLI-445, LRLI-452) featured with wall-flush placement',
        'Stone-finish collection revealed with dramatic gold accent detailing on edges and trim',
        'Natural stone models (LRLI-446, LRLI-448) display unique veining patterns - each piece is one-of-a-kind',
        'Synthetic stone models (LRLI-454, LRLI-447) shown with consistent finish quality across units',
        'Complementary products displayed: stanchions with ropes, directional signage, and caution floor signs',
        'Full lobby scene demonstrating how dustbins, stanchions, and signage work together as a coordinated system',
    ]
    for vp in video_points:
        story.append(Paragraph(f'- {vp}', s['bullet']))
    story.append(Spacer(1, 12))
    story.append(Paragraph(
        '<b>Sales Tip:</b> Always bring a stone-finish sample to presentations. The tactile quality '
        'and gold accent detailing cannot be appreciated through catalogs alone. Let the client touch '
        'and feel the weight - it immediately justifies the premium pricing.', s['callout']))
    
    # Build PDF
    doc.build(story, onFirstPage=add_page_number, onLaterPages=add_page_number)
    print(f"Generated: {output_path}")
    size_kb = os.path.getsize(output_path) / 1024
    print(f"File size: {size_kb:.1f} KB")
    return output_path


def generate_housekeeping_trolley_pdf():
    """Generate Housekeeping & Linen Trolley product training PDF."""
    # Palette - professional steel gray/teal matching housekeeping equipment
    ACCENT = colors.HexColor('#1a5c5e')
    TEXT_PRIMARY = colors.HexColor('#1e2328')
    TEXT_MUTED = colors.HexColor('#6b7785')
    BG_SURFACE = colors.HexColor('#e2e6ea')
    
    s = make_styles(ACCENT, TEXT_PRIMARY, TEXT_MUTED)
    
    output_path = '/home/z/my-project/upload/Housekeeping Trolley.pdf'
    doc = SimpleDocTemplate(
        output_path, pagesize=A4,
        leftMargin=LEFT_M, rightMargin=RIGHT_M,
        topMargin=TOP_M, bottomMargin=BOTTOM_M
    )
    
    story = []
    
    # ── Cover Page ──
    story.append(Spacer(1, 2.5 * inch))
    story.append(Paragraph('<b>LAXREE</b>', s['cover_title']))
    story.append(Spacer(1, 8))
    story.append(HRFlowable(width="60%", thickness=2, color=ACCENT, spaceAfter=16, spaceBefore=8))
    story.append(Paragraph('<b>Housekeeping & Linen Trolley</b>', ParagraphStyle(
        'CoverProduct', fontName='LiberationSerif', fontSize=26, leading=32,
        textColor=TEXT_PRIMARY, alignment=TA_CENTER, spaceAfter=8
    )))
    story.append(Paragraph('Housekeeping Operations Solutions', s['cover_subtitle']))
    story.append(Spacer(1, 24))
    story.append(Paragraph('Product Training Guide for Sales Professionals', s['cover_meta']))
    story.append(Paragraph('LAXREE Hotel Supplies & Amenities', s['cover_meta']))
    story.append(Paragraph('2025 Edition', s['cover_meta']))
    story.append(Spacer(1, 1.5 * inch))
    story.append(HRFlowable(width="40%", thickness=1, color=TEXT_MUTED, spaceAfter=8))
    story.append(Paragraph('CONFIDENTIAL - For Internal Training Use Only', ParagraphStyle(
        'Conf', fontName='LiberationSerif', fontSize=9, leading=12,
        textColor=TEXT_MUTED, alignment=TA_CENTER
    )))
    story.append(PageBreak())
    
    # ── Table of Contents ──
    story.append(Paragraph('<b>Table of Contents</b>', s['h1']))
    story.append(Spacer(1, 12))
    toc_items = [
        ('1.', 'Product Overview'),
        ('2.', 'Product Range & Models'),
        ('3.', 'Materials & Design Philosophy'),
        ('4.', 'Key Features & Benefits'),
        ('5.', 'Selling Strategy by Hotel Tier'),
        ('6.', 'Objection Handling'),
        ('7.', 'Video Transcript Summary'),
    ]
    for num, title in toc_items:
        story.append(Paragraph(f'<b>{num}</b>  {title}', ParagraphStyle(
            f'TOC_{num}', fontName='LiberationSerif', fontSize=12, leading=20,
            textColor=TEXT_PRIMARY, leftIndent=20, spaceAfter=4
        )))
    story.append(PageBreak())
    
    # ── Section 1: Product Overview ──
    story.append(Paragraph('<b>1. Product Overview</b>', s['h1']))
    story.append(Spacer(1, 8))
    story.append(Paragraph(
        'LAXREE Housekeeping & Linen Trolleys are the <b>backbone of efficient hotel operations</b>. '
        'Every room turnover depends on a reliable, well-organized trolley that carries cleaning supplies, '
        'linen, amenities, and waste - making the difference between a 25-minute and 40-minute room service.', s['body']))
    story.append(Spacer(1, 8))
    story.append(Paragraph(
        'Our comprehensive range covers every operational need: from <b>full-featured housekeeping trolleys</b> '
        'with enclosed storage for room servicing, to <b>dedicated linen trolleys</b> for rapid linen transport, '
        'to <b>platform trolleys</b> for heavy-duty moving tasks. Available in three body materials - '
        'Stainless Steel, Wooden/Composite, and ABS Plastic - each designed for different hotel '
        'environments and budgets.', s['body']))
    story.append(Spacer(1, 8))
    story.append(Paragraph('<b>Why LAXREE Trolleys Stand Out:</b>', s['h3']))
    bullets = [
        '<b>Three Material Options:</b> SS for durability, Wood for aesthetics, ABS for budget and weight',
        '<b>Open-Shelf & Enclosed Models:</b> Choose based on security needs and hotel policies',
        '<b>Color-Coordinated Fabric Bins:</b> Brown for premium look, Yellow for visibility, Black for versatility',
        '<b>Smooth-Rolling Wheels:</b> Non-marking casters that glide on any hotel floor surface',
        '<b>X-Frame Innovation:</b> Lightweight yet sturdy ABS design for maximum maneuverability',
    ]
    for b in bullets:
        story.append(Paragraph(f'- {b}', s['bullet']))
    story.append(Spacer(1, 18))
    
    # ── Section 2: Product Range & Models ──
    story.append(Paragraph('<b>2. Product Range & Models</b>', s['h1']))
    story.append(Spacer(1, 8))
    story.append(Paragraph(
        'LAXREE offers five trolley categories, each designed for a specific operational role in hotel housekeeping.', s['body']))
    story.append(Spacer(1, 8))
    
    # SS Trolleys
    story.append(Paragraph('<b>Stainless Steel (SS) Trolleys</b>', s['h2']))
    ss_data = [
        [Paragraph('<b>Model</b>', s['table_header']),
         Paragraph('<b>Body</b>', s['table_header']),
         Paragraph('<b>Configuration</b>', s['table_header']),
         Paragraph('<b>Fabric Color</b>', s['table_header']),
         Paragraph('<b>Best For</b>', s['table_header'])],
        [Paragraph('LRHT-428', s['table_cell']), Paragraph('SS Body', s['table_cell']),
         Paragraph('Open shelves', s['table_cell']), Paragraph('Brown', s['table_cell']),
         Paragraph('Premium hotels, visible corridors', s['table_cell_left'])],
        [Paragraph('LRHT-434', s['table_cell']), Paragraph('SS Body', s['table_cell']),
         Paragraph('With Lid & Door', s['table_cell']), Paragraph('Brown', s['table_cell']),
         Paragraph('Luxury hotels, secure storage', s['table_cell_left'])],
    ]
    col_w1 = [CONTENT_W * 0.13, CONTENT_W * 0.13, CONTENT_W * 0.24, CONTENT_W * 0.16, CONTENT_W * 0.34]
    story.append(make_table(ss_data, col_w1, ACCENT, BG_SURFACE, s))
    story.append(Spacer(1, 14))
    
    # Wooden Trolleys
    story.append(Paragraph('<b>Wooden/Composite Trolleys</b>', s['h2']))
    wood_data = [
        [Paragraph('<b>Model</b>', s['table_header']),
         Paragraph('<b>Body</b>', s['table_header']),
         Paragraph('<b>Configuration</b>', s['table_header']),
         Paragraph('<b>Fabric Color</b>', s['table_header']),
         Paragraph('<b>Best For</b>', s['table_header'])],
        [Paragraph('LRHT-427', s['table_cell']), Paragraph('Wooden body', s['table_cell']),
         Paragraph('Open shelves', s['table_cell']), Paragraph('Brown', s['table_cell']),
         Paragraph('Boutique hotels, heritage properties', s['table_cell_left'])],
        [Paragraph('LRHT-431', s['table_cell']), Paragraph('Wooden body', s['table_cell']),
         Paragraph('With Lid & Door', s['table_cell']), Paragraph('Brown', s['table_cell']),
         Paragraph('Resort hotels, premium aesthetics', s['table_cell_left'])],
    ]
    story.append(make_table(wood_data, col_w1, ACCENT, BG_SURFACE, s))
    story.append(Spacer(1, 14))
    
    # ABS Trolleys
    story.append(Paragraph('<b>ABS (Plastic) Trolleys</b>', s['h2']))
    abs_data = [
        [Paragraph('<b>Model</b>', s['table_header']),
         Paragraph('<b>Body</b>', s['table_header']),
         Paragraph('<b>Configuration</b>', s['table_header']),
         Paragraph('<b>Fabric Color</b>', s['table_header']),
         Paragraph('<b>Best For</b>', s['table_header'])],
        [Paragraph('LRHT-429', s['table_cell']), Paragraph('ABS Body', s['table_cell']),
         Paragraph('Gray cabinet', s['table_cell']), Paragraph('Yellow', s['table_cell']),
         Paragraph('Business hotels, high-visibility', s['table_cell_left'])],
        [Paragraph('LRHT-433', s['table_cell']), Paragraph('ABS Body', s['table_cell']),
         Paragraph('X-frame design', s['table_cell']), Paragraph('Yellow', s['table_cell']),
         Paragraph('Budget hotels, lightweight ops', s['table_cell_left'])],
    ]
    story.append(make_table(abs_data, col_w1, ACCENT, BG_SURFACE, s))
    story.append(Spacer(1, 14))
    
    # Linen Trolleys
    story.append(Paragraph('<b>Linen Trolleys</b>', s['h2']))
    linen_data = [
        [Paragraph('<b>Model</b>', s['table_header']),
         Paragraph('<b>Frame</b>', s['table_header']),
         Paragraph('<b>Liner Color</b>', s['table_header']),
         Paragraph('<b>Best For</b>', s['table_header'])],
        [Paragraph('LRHT-430', s['table_cell']), Paragraph('Metal frame', s['table_cell']),
         Paragraph('Black fabric liner', s['table_cell']), Paragraph('Linen transport, laundry collection', s['table_cell_left'])],
        [Paragraph('LRHT-432', s['table_cell']), Paragraph('Metal frame', s['table_cell']),
         Paragraph('Yellow fabric liner', s['table_cell']), Paragraph('High-visibility linen transport', s['table_cell_left'])],
    ]
    col_w2 = [CONTENT_W * 0.13, CONTENT_W * 0.18, CONTENT_W * 0.24, CONTENT_W * 0.45]
    story.append(make_table(linen_data, col_w2, ACCENT, BG_SURFACE, s))
    story.append(Spacer(1, 14))
    
    # Platform Trolley
    story.append(Paragraph('<b>Platform Trolley</b>', s['h2']))
    plat_data = [
        [Paragraph('<b>Model</b>', s['table_header']),
         Paragraph('<b>Frame</b>', s['table_header']),
         Paragraph('<b>Storage</b>', s['table_header']),
         Paragraph('<b>Best For</b>', s['table_header'])],
        [Paragraph('LRHT-425', s['table_cell']), Paragraph('Metal frame', s['table_cell']),
         Paragraph('Minimal - flat platform', s['table_cell']), Paragraph('Heavy-duty transport, furniture moving, bulk supplies', s['table_cell_left'])],
    ]
    story.append(make_table(plat_data, col_w2, ACCENT, BG_SURFACE, s))
    story.append(Spacer(1, 18))
    
    # ── Section 3: Materials & Design Philosophy ──
    story.append(Paragraph('<b>3. Materials & Design Philosophy</b>', s['h1']))
    story.append(Spacer(1, 8))
    
    story.append(Paragraph('<b>Body Material Comparison</b>', s['h2']))
    mat_data = [
        [Paragraph('<b>Material</b>', s['table_header']),
         Paragraph('<b>Weight</b>', s['table_header']),
         Paragraph('<b>Aesthetic</b>', s['table_header']),
         Paragraph('<b>Durability</b>', s['table_header']),
         Paragraph('<b>Best Hotel Type</b>', s['table_header'])],
        [Paragraph('Stainless Steel', s['table_cell_left']),
         Paragraph('Medium-Heavy', s['table_cell']),
         Paragraph('Professional, modern', s['table_cell_left']),
         Paragraph('Excellent - corrosion-resistant', s['table_cell_left']),
         Paragraph('4-5 star hotels', s['table_cell_left'])],
        [Paragraph('Wooden/Composite', s['table_cell_left']),
         Paragraph('Heavy', s['table_cell']),
         Paragraph('Warm, classic, boutique', s['table_cell_left']),
         Paragraph('Very good - sturdy', s['table_cell_left']),
         Paragraph('Heritage/resort hotels', s['table_cell_left'])],
        [Paragraph('ABS Plastic', s['table_cell_left']),
         Paragraph('Lightweight', s['table_cell']),
         Paragraph('Clean, functional', s['table_cell_left']),
         Paragraph('Good - impact-resistant', s['table_cell_left']),
         Paragraph('3-4 star, budget hotels', s['table_cell_left'])],
        [Paragraph('Metal Frame (Linen)', s['table_cell_left']),
         Paragraph('Lightweight', s['table_cell']),
         Paragraph('Industrial, practical', s['table_cell_left']),
         Paragraph('Very good - chrome finish', s['table_cell_left']),
         Paragraph('Back-of-house operations', s['table_cell_left'])],
    ]
    col_wm = [CONTENT_W * 0.18, CONTENT_W * 0.14, CONTENT_W * 0.22, CONTENT_W * 0.24, CONTENT_W * 0.22]
    story.append(make_table(mat_data, col_wm, ACCENT, BG_SURFACE, s))
    story.append(Spacer(1, 14))
    
    story.append(Paragraph('<b>Fabric Color Strategy</b>', s['h2']))
    color_data = [
        [Paragraph('<b>Color</b>', s['table_header']),
         Paragraph('<b>Visual Impact</b>', s['table_header']),
         Paragraph('<b>Psychology</b>', s['table_header']),
         Paragraph('<b>Recommended Use</b>', s['table_header'])],
        [Paragraph('Brown', s['table_cell']),
         Paragraph('Warm, premium, blends with decor', s['table_cell_left']),
         Paragraph('Sophistication, reliability, quality', s['table_cell_left']),
         Paragraph('Guest-facing corridors, 4-5 star hotels', s['table_cell_left'])],
        [Paragraph('Yellow', s['table_cell']),
         Paragraph('High-visibility, energetic, clean', s['table_cell_left']),
         Paragraph('Attention, efficiency, safety', s['table_cell_left']),
         Paragraph('Back-of-house, housekeeping visibility', s['table_cell_left'])],
        [Paragraph('Black', s['table_cell']),
         Paragraph('Professional, understated, versatile', s['table_cell_left']),
         Paragraph('Authority, cleanliness, neutrality', s['table_cell_left']),
         Paragraph('Linen transport, universal use', s['table_cell_left'])],
        [Paragraph('Gray', s['table_cell']),
         Paragraph('Modern, neutral, clean', s['table_cell_left']),
         Paragraph('Professionalism, balance', s['table_cell_left']),
         Paragraph('ABS cabinet models, business hotels', s['table_cell_left'])],
    ]
    col_wc = [CONTENT_W * 0.12, CONTENT_W * 0.26, CONTENT_W * 0.28, CONTENT_W * 0.34]
    story.append(make_table(color_data, col_wc, ACCENT, BG_SURFACE, s))
    story.append(Spacer(1, 14))
    
    story.append(Paragraph('<b>Design Philosophy</b>', s['h2']))
    story.append(Paragraph(
        'LAXREE trolleys are designed with the <b>housekeeping professional in mind</b>. Every detail - '
        'from shelf height to wheel positioning - is optimized for the repetitive movements of room '
        'servicing. The open-shelf models allow instant visual access to supplies, while enclosed models '
        'with lids and doors provide security for guest amenities and valuable cleaning products.', s['body']))
    story.append(Spacer(1, 6))
    story.append(Paragraph(
        'The <b>X-frame design</b> in our ABS trolley line represents an innovation in housekeeping '
        'equipment - reducing weight by 30% while maintaining structural integrity. This means less '
        'physical strain on housekeeping staff and faster maneuvering through corridors.', s['body']))
    story.append(Spacer(1, 18))
    
    # ── Section 4: Key Features & Benefits ──
    story.append(Paragraph('<b>4. Key Features & Benefits</b>', s['h1']))
    story.append(Spacer(1, 8))
    
    feat_data = [
        [Paragraph('<b>Feature</b>', s['table_header']),
         Paragraph('<b>Description</b>', s['table_header']),
         Paragraph('<b>Why It Matters</b>', s['table_header'])],
        [Paragraph('Open Shelves', s['table_cell']),
         Paragraph('Multiple exposed shelves for organized supply access', s['table_cell_left']),
         Paragraph('Faster room service - staff see and grab instantly, 20% time savings', s['table_cell_left'])],
        [Paragraph('Enclosed w/ Lid & Door', s['table_cell']),
         Paragraph('Lockable storage compartments with hinged lid and door', s['table_cell_left']),
         Paragraph('Security for amenities, prevents unauthorized access, cleaner appearance', s['table_cell_left'])],
        [Paragraph('Fabric Bins', s['table_cell']),
         Paragraph('Removable fabric bags/liners for waste and linen', s['table_cell_left']),
         Paragraph('Easy to clean, replaceable, color-coded for sorting compliance', s['table_cell_left'])],
        [Paragraph('Non-Marking Wheels', s['table_cell']),
         Paragraph('Smooth-rolling casters that won\'t damage floors', s['table_cell_left']),
         Paragraph('Protects marble/carpet investment, silent operation for guest areas', s['table_cell_left'])],
        [Paragraph('X-Frame Design', s['table_cell']),
         Paragraph('Cross-frame structure on ABS models for strength with less weight', s['table_cell_left']),
         Paragraph('30% lighter than traditional frames, easier for staff to maneuver', s['table_cell_left'])],
        [Paragraph('Dedicated Linen Bags', s['table_cell']),
         Paragraph('Large-capacity fabric liners on linen trolleys', s['table_cell_left']),
         Paragraph('Efficient bulk transport, reduces laundry trips by 50%', s['table_cell_left'])],
        [Paragraph('Flat Platform', s['table_cell']),
         Paragraph('Open platform surface on LRHT-425 for heavy loads', s['table_cell_left']),
         Paragraph('Versatile for furniture, bulk supplies, and equipment transport', s['table_cell_left'])],
    ]
    col_wf = [CONTENT_W * 0.20, CONTENT_W * 0.38, CONTENT_W * 0.42]
    story.append(make_table(feat_data, col_wf, ACCENT, BG_SURFACE, s))
    story.append(Spacer(1, 18))
    
    # ── Section 5: Selling Strategy ──
    story.append(Paragraph('<b>5. Selling Strategy by Hotel Tier</b>', s['h1']))
    story.append(Spacer(1, 8))
    
    strategy_data = [
        [Paragraph('<b>Hotel Tier</b>', s['table_header']),
         Paragraph('<b>Recommended Model</b>', s['table_header']),
         Paragraph('<b>Pitch Angle</b>', s['table_header'])],
        [Paragraph('5-Star Luxury', s['table_cell_left']),
         Paragraph('SS w/ Lid & Door LRHT-434', s['table_cell']),
         Paragraph('"Secure, elegant, and professional - your housekeeping trolley should match your lobby furniture"', s['table_cell_left'])],
        [Paragraph('4-Star Premium', s['table_cell_left']),
         Paragraph('Wooden LRHT-427/431', s['table_cell']),
         Paragraph('"Warm wooden aesthetics that blend with your corridor design - guests won\'t notice it as equipment"', s['table_cell_left'])],
        [Paragraph('3-Star Business', s['table_cell_left']),
         Paragraph('ABS Cabinet LRHT-429', s['table_cell']),
         Paragraph('"Lightweight, durable, and high-visibility - designed for efficient high-turnover operations"', s['table_cell_left'])],
        [Paragraph('Budget / Transit', s['table_cell_left']),
         Paragraph('ABS X-Frame LRHT-433', s['table_cell']),
         Paragraph('"Maximum functionality at minimum cost - the X-frame saves weight and saves money"', s['table_cell_left'])],
        [Paragraph('Resort / Heritage', s['table_cell_left']),
         Paragraph('Wooden w/ Lid & Door LRHT-431', s['table_cell']),
         Paragraph('"Classic wooden design complements heritage architecture while providing modern functionality"', s['table_cell_left'])],
    ]
    col_w4 = [CONTENT_W * 0.18, CONTENT_W * 0.26, CONTENT_W * 0.56]
    story.append(make_table(strategy_data, col_w4, ACCENT, BG_SURFACE, s))
    story.append(Spacer(1, 12))
    
    story.append(Paragraph('<b>Operational Bundle Strategy</b>', s['h2']))
    story.append(Paragraph(
        'The most successful approach is selling <b>complete housekeeping fleets</b> rather than '
        'individual trolleys. A typical 100-room hotel needs 8-12 housekeeping trolleys, 4-6 linen '
        'trolleys, and 2-3 platform trolleys. Bundle pricing at these volumes provides 15-20% '
        'margin improvement for the hotel while securing a larger order for LAXREE.', s['body']))
    story.append(Spacer(1, 6))
    story.append(Paragraph(
        '<b>Sales Tip:</b> Always ask about the hotel\'s current room service time. If they\'re above '
        '30 minutes per room, upgrading to open-shelf trolleys with organized supply placement can '
        'cut service time by 20%. That\'s real money saved in labor costs - frame the trolley as a '
        '<b>labor efficiency investment</b>, not just equipment.', s['callout']))
    story.append(Spacer(1, 18))
    
    # ── Section 6: Objection Handling ──
    story.append(Paragraph('<b>6. Objection Handling</b>', s['h1']))
    story.append(Spacer(1, 8))
    
    objections = [
        ('"Our current trolleys work fine"',
         'Most hotels are using trolleys that are 5-10 years old with worn wheels, torn fabric, and rusted frames. Staff have adapted to inefficiencies they no longer notice. A new LAXREE trolley fleet improves room service speed by 20% and reduces staff fatigue - the ROI pays for the upgrade within 6 months through labor savings.'),
        ('"Stainless steel trolleys are too expensive"',
         'SS trolleys last 8-10 years in commercial use - that\'s 2-3x the lifespan of ABS or wooden models. Over a 10-year period, the total cost of ownership is actually lower because you replace them far less frequently. Plus, SS trolleys maintain their professional appearance year after year.'),
        ('"Wooden trolleys will get damaged by water"',
         'Our wooden/composite trolleys use moisture-resistant composite materials with sealed surfaces. They\'re designed for the wet environment of bathroom cleaning and withstand daily exposure to cleaning products. The warm aesthetic of wood is worth the investment for guest-facing hotels.'),
        ('"ABS plastic looks cheap"',
         'Our ABS models feature a professional gray cabinet finish and color-coordinated fabric bins. The X-frame design (LRHT-433) is actually an innovation that top hospitality brands are adopting for its lightweight maneuverability. Position it as "modern efficiency" rather than "budget plastic."'),
        ('"We don\'t need linen trolleys separately"',
         'Dedicated linen trolleys reduce laundry transport time by 50% compared to carrying linen in housekeeping trolleys. For a 200-room hotel doing 150 room turns daily, that saves 2-3 hours of housekeeping labor every day. At minimum wage, that\'s significant monthly savings.'),
        ('"Platform trolleys are not necessary"',
         'Platform trolleys handle the jobs that housekeeping trolleys can\'t - moving furniture, transporting bulk supplies, and handling heavy equipment. Using housekeeping trolleys for these tasks damages them and reduces their lifespan. A dedicated platform trolley protects your fleet investment.'),
    ]
    for q, a in objections:
        story.append(Paragraph(f'<b>{q}</b>', s['h3']))
        story.append(Paragraph(a, s['body']))
        story.append(Spacer(1, 8))
    story.append(Spacer(1, 18))
    
    # ── Section 7: Video Transcript Summary ──
    story.append(Paragraph('<b>7. Video Transcript Summary</b>', s['h1']))
    story.append(Spacer(1, 8))
    story.append(Paragraph(
        'Based on the product video analysis, the LAXREE Housekeeping & Linen Trolley collection features '
        '<b>five distinct trolley categories</b> covering every operational need in hotel housekeeping. '
        'The video demonstrates each model\'s features and shows real-world usage scenarios.', s['body']))
    story.append(Spacer(1, 6))
    story.append(Paragraph('<b>Key Visual Highlights from Video:</b>', s['h3']))
    video_points = [
        'SS trolleys (LRHT-428, LRHT-434) shown with polished steel frames and brown fabric bins - professional appearance',
        'Enclosed model (LRHT-434) demonstrated with lid and door opening, showing organized interior compartments',
        'Wooden trolleys (LRHT-427, LRHT-431) featured in boutique hotel settings - warm tones complement heritage decor',
        'ABS models (LRHT-429, LRHT-433) highlighted for their lightweight construction and maneuverability',
        'X-frame design (LRHT-433) shown with cross-support structure, demonstrating strength despite minimal frame material',
        'Yellow fabric bins on ABS models provide high-visibility for efficient supply identification',
        'Linen trolleys (LRHT-430, LRHT-432) demonstrated with large-capacity fabric liners being loaded and transported',
        'Platform trolley (LRHT-425) shown carrying heavy boxes and equipment - versatile flat-bed utility',
        'Wheel quality emphasized across all models - smooth rolling on various floor surfaces without marking',
        'Complete housekeeping fleet displayed together, showing the coordinated LAXREE system approach',
    ]
    for vp in video_points:
        story.append(Paragraph(f'- {vp}', s['bullet']))
    story.append(Spacer(1, 12))
    story.append(Paragraph(
        '<b>Sales Tip:</b> When presenting to operations managers, always calculate the labor savings. '
        'Show them that a well-organized open-shelf trolley saves 5-6 minutes per room turn. For a '
        '100-room hotel doing 80 turns daily, that\'s 400-480 minutes (6-8 hours) saved every single '
        'day. The trolleys pay for themselves in under 3 months through labor efficiency alone.', s['callout']))
    
    # Build PDF
    doc.build(story, onFirstPage=add_page_number, onLaterPages=add_page_number)
    print(f"Generated: {output_path}")
    size_kb = os.path.getsize(output_path) / 1024
    print(f"File size: {size_kb:.1f} KB")
    return output_path


if __name__ == '__main__':
    print("=" * 60)
    print("LAXREE Product Training PDF Generator")
    print("Generating: Lobby Dustbin + Housekeeping Trolley")
    print("=" * 60)
    
    pdf1 = generate_dustbin_pdf()
    pdf2 = generate_housekeeping_trolley_pdf()
    
    print("\n" + "=" * 60)
    print("Generation Complete!")
    print(f"1. {pdf1} ({os.path.getsize(pdf1)/1024:.1f} KB)")
    print(f"2. {pdf2} ({os.path.getsize(pdf2)/1024:.1f} KB)")
    print("=" * 60)
