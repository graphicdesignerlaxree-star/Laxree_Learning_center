#!/usr/bin/env python3
"""
LAXREE Product Training PDF Generator
Generates premium product training PDFs for:
1. Electric Kettle
2. Kettle Tray
3. Hotel Hangers
4. RFID Door Lock
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


def generate_kettle_pdf():
    """Generate Electric Kettle product training PDF."""
    # Palette
    ACCENT = colors.HexColor('#522fbd')
    TEXT_PRIMARY = colors.HexColor('#252422')
    TEXT_MUTED = colors.HexColor('#908c84')
    BG_SURFACE = colors.HexColor('#dfdbd2')
    
    s = make_styles(ACCENT, TEXT_PRIMARY, TEXT_MUTED)
    
    output_path = '/home/z/my-project/upload/Electric Kettle.pdf'
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
    story.append(Paragraph('<b>Electric Kettle</b>', ParagraphStyle(
        'CoverProduct', fontName='LiberationSerif', fontSize=28, leading=34,
        textColor=TEXT_PRIMARY, alignment=TA_CENTER, spaceAfter=8
    )))
    story.append(Paragraph('Premium In-Room Beverage Solutions', s['cover_subtitle']))
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
        ('2.', 'Key Features & Safety'),
        ('3.', 'Product Range & Models'),
        ('4.', 'Technical Specifications'),
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
        'LAXREE Electric Kettles are designed specifically for the hospitality industry, where '
        '<b>safety, reliability, and aesthetics</b> matter equally. Every kettle is built with premium '
        'components to withstand the demands of daily hotel use, ensuring guest satisfaction while '
        'minimizing maintenance and replacement costs for hotel operators.', s['body']))
    story.append(Spacer(1, 8))
    story.append(Paragraph(
        'Our kettle lineup combines <b>modern minimalist design</b> with cutting-edge safety technology. '
        'The sleek exterior complements any hotel room decor, while the food-grade stainless steel interior '
        'ensures safe, clean beverages for every guest.', s['body']))
    story.append(Spacer(1, 8))
    story.append(Paragraph('<b>Why LAXREE Kettles Stand Out:</b>', s['h3']))
    bullets = [
        '<b>Strix Controller (UK)</b> - The world\'s leading kettle controller for reliable auto shut-off and boil-dry protection',
        '<b>Food-Grade SS304 Interior</b> - Safe, corrosion-resistant, easy to clean',
        '<b>Double-Wall Insulation</b> - Cool-touch exterior prevents guest burns',
        '<b>Multiple Capacity Options</b> - 0.6L to 1.8L to suit every room type',
        '<b>Comprehensive Certifications</b> - ISI, CE, RoHS certified for complete compliance',
    ]
    for b in bullets:
        story.append(Paragraph(f'- {b}', s['bullet']))
    story.append(Spacer(1, 18))
    
    # ── Section 2: Key Features & Safety ──
    story.append(Paragraph('<b>2. Key Features & Safety</b>', s['h1']))
    story.append(Spacer(1, 8))
    story.append(Paragraph('<b>Safety Features - The #1 Priority for In-Room Kettles</b>', s['h2']))
    story.append(Paragraph(
        'Safety is paramount for in-room kettles. LAXREE kettles come with <b>multiple safety layers</b> '
        'that protect both guests and hotel property:', s['body']))
    story.append(Spacer(1, 6))
    
    safety_data = [
        [Paragraph('<b>Safety Feature</b>', s['table_header']),
         Paragraph('<b>Description</b>', s['table_header']),
         Paragraph('<b>Why It Matters</b>', s['table_header'])],
        [Paragraph('Auto Shut-Off', s['table_cell']),
         Paragraph('Kettle turns off automatically within 30 seconds of boiling', s['table_cell_left']),
         Paragraph('Prevents overheating, saves energy, reduces fire risk', s['table_cell_left'])],
        [Paragraph('Boil-Dry Protection', s['table_cell']),
         Paragraph('Shuts off immediately if operated with no water', s['table_cell_left']),
         Paragraph('Critical safety feature - prevents element damage and fire hazard', s['table_cell_left'])],
        [Paragraph('Locking Lid', s['table_cell']),
         Paragraph('Secure lid prevents hot water splashes during pouring', s['table_cell_left']),
         Paragraph('Reduces guest injury risk and liability', s['table_cell_left'])],
        [Paragraph('Concealed Element', s['table_cell']),
         Paragraph('No exposed heating coil inside the kettle', s['table_cell_left']),
         Paragraph('Safer, easier to clean, reduces mineral buildup', s['table_cell_left'])],
        [Paragraph('Cool-Touch Exterior', s['table_cell']),
         Paragraph('Double-wall design keeps outside safe to touch', s['table_cell_left']),
         Paragraph('Prevents burns, especially important for families', s['table_cell_left'])],
        [Paragraph('Strix Controller', s['table_cell']),
         Paragraph('UK-made precision controller, 10,000+ cycle tested', s['table_cell_left']),
         Paragraph('Same quality as Bosch/Philips - builds instant credibility', s['table_cell_left'])],
    ]
    col_w = [CONTENT_W * 0.22, CONTENT_W * 0.38, CONTENT_W * 0.40]
    story.append(make_table(safety_data, col_w, ACCENT, BG_SURFACE, s))
    story.append(Spacer(1, 18))
    
    # ── Section 3: Product Range ──
    story.append(Paragraph('<b>3. Product Range & Models</b>', s['h1']))
    story.append(Spacer(1, 8))
    story.append(Paragraph(
        'LAXREE offers a comprehensive range of electric kettles organized by material and capacity. '
        'Each model is designed for specific hotel segments and use cases.', s['body']))
    story.append(Spacer(1, 8))
    
    story.append(Paragraph('<b>Stainless Steel Series (Premium)</b>', s['h2']))
    ss_data = [
        [Paragraph('<b>Model</b>', s['table_header']),
         Paragraph('<b>Capacity</b>', s['table_header']),
         Paragraph('<b>Layer</b>', s['table_header']),
         Paragraph('<b>Power</b>', s['table_header']),
         Paragraph('<b>Best For</b>', s['table_header'])],
        [Paragraph('LRWT-145', s['table_cell']), Paragraph('0.8L', s['table_cell']),
         Paragraph('Single (201 SS)', s['table_cell']), Paragraph('1000W', s['table_cell']),
         Paragraph('Standard rooms', s['table_cell_left'])],
        [Paragraph('LRWT-147', s['table_cell']), Paragraph('0.8L', s['table_cell']),
         Paragraph('Double (201 SS)', s['table_cell']), Paragraph('1000W', s['table_cell']),
         Paragraph('Premium rooms, insulated', s['table_cell_left'])],
        [Paragraph('LRWT-148', s['table_cell']), Paragraph('0.6L', s['table_cell']),
         Paragraph('Double (201 SS)', s['table_cell']), Paragraph('800W', s['table_cell']),
         Paragraph('Compact luxury', s['table_cell_left'])],
        [Paragraph('LRWT-151', s['table_cell']), Paragraph('0.8L', s['table_cell']),
         Paragraph('Single', s['table_cell']), Paragraph('1000W', s['table_cell']),
         Paragraph('Standard rooms', s['table_cell_left'])],
        [Paragraph('LRWT-152', s['table_cell']), Paragraph('1.0L', s['table_cell']),
         Paragraph('Single', s['table_cell']), Paragraph('1200W', s['table_cell']),
         Paragraph('Deluxe rooms', s['table_cell_left'])],
        [Paragraph('LRWT-153', s['table_cell']), Paragraph('1.2L', s['table_cell']),
         Paragraph('Single', s['table_cell']), Paragraph('1500W', s['table_cell']),
         Paragraph('Suites, multi-guest', s['table_cell_left'])],
        [Paragraph('LRWT-154', s['table_cell']), Paragraph('1.2L', s['table_cell']),
         Paragraph('Double', s['table_cell']), Paragraph('1500W', s['table_cell']),
         Paragraph('Premium suites, insulated', s['table_cell_left'])],
        [Paragraph('LRWT-155', s['table_cell']), Paragraph('0.8L', s['table_cell']),
         Paragraph('Double', s['table_cell']), Paragraph('1000W', s['table_cell']),
         Paragraph('Mid-range insulated', s['table_cell_left'])],
    ]
    col_w2 = [CONTENT_W * 0.16, CONTENT_W * 0.14, CONTENT_W * 0.22, CONTENT_W * 0.14, CONTENT_W * 0.34]
    story.append(make_table(ss_data, col_w2, ACCENT, BG_SURFACE, s))
    story.append(Spacer(1, 14))
    
    # ── Section 4: Technical Specifications ──
    story.append(Paragraph('<b>4. Technical Specifications</b>', s['h1']))
    story.append(Spacer(1, 8))
    
    specs_data = [
        [Paragraph('<b>Parameter</b>', s['table_header']),
         Paragraph('<b>Specification</b>', s['table_header'])],
        [Paragraph('Capacity Range', s['table_cell_left']), Paragraph('0.6L / 0.8L / 1.0L / 1.2L / 1.5L / 1.7L / 1.8L', s['table_cell_left'])],
        [Paragraph('Material', s['table_cell_left']), Paragraph('SS304 (Food-Grade Stainless Steel) / BPA-Free ABS Plastic', s['table_cell_left'])],
        [Paragraph('Power Range', s['table_cell_left']), Paragraph('800W - 2200W', s['table_cell_left'])],
        [Paragraph('Controller', s['table_cell_left']), Paragraph('Strix (UK) / Otter - 10,000+ cycle tested', s['table_cell_left'])],
        [Paragraph('Safety Features', s['table_cell_left']), Paragraph('Auto shut-off, Boil-dry protection, Locking lid', s['table_cell_left'])],
        [Paragraph('Certifications', s['table_cell_left']), Paragraph('ISI, CE, RoHS', s['table_cell_left'])],
        [Paragraph('Finish Options', s['table_cell_left']), Paragraph('Brushed SS / Glossy Black / White', s['table_cell_left'])],
        [Paragraph('Warranty', s['table_cell_left']), Paragraph('2-year comprehensive replacement warranty', s['table_cell_left'])],
        [Paragraph('Custom Branding', s['table_cell_left']), Paragraph('Silkscreen or laser engraving available', s['table_cell_left'])],
    ]
    col_w3 = [CONTENT_W * 0.35, CONTENT_W * 0.65]
    story.append(make_table(specs_data, col_w3, ACCENT, BG_SURFACE, s))
    story.append(Spacer(1, 18))
    
    # ── Section 5: Selling Strategy ──
    story.append(Paragraph('<b>5. Selling Strategy by Hotel Tier</b>', s['h1']))
    story.append(Spacer(1, 8))
    
    strategy_data = [
        [Paragraph('<b>Hotel Tier</b>', s['table_header']),
         Paragraph('<b>Recommended Model</b>', s['table_header']),
         Paragraph('<b>Pitch Angle</b>', s['table_header'])],
        [Paragraph('5-Star Luxury', s['table_cell_left']), Paragraph('SS304 Double-Wall', s['table_cell']),
         Paragraph('"The safest, most premium kettle your guests will ever use"', s['table_cell_left'])],
        [Paragraph('4-Star Premium', s['table_cell_left']), Paragraph('SS304 Single Layer', s['table_cell']),
         Paragraph('"Premium look + Strix safety at the best value"', s['table_cell_left'])],
        [Paragraph('3-Star / Business', s['table_cell_left']), Paragraph('ABS Plastic 1.7L', s['table_cell']),
         Paragraph('"ISI-certified safety, boils in under 4 minutes"', s['table_cell_left'])],
        [Paragraph('Budget / Transit', s['table_cell_left']), Paragraph('ABS Plastic 0.8L', s['table_cell']),
         Paragraph('"Reliable safety at the most competitive price"', s['table_cell_left'])],
    ]
    col_w4 = [CONTENT_W * 0.22, CONTENT_W * 0.28, CONTENT_W * 0.50]
    story.append(make_table(strategy_data, col_w4, ACCENT, BG_SURFACE, s))
    story.append(Spacer(1, 18))
    
    # ── Section 6: Objection Handling ──
    story.append(Paragraph('<b>6. Objection Handling</b>', s['h1']))
    story.append(Spacer(1, 8))
    
    objections = [
        ('"Guests don\'t use room kettles"',
         'Our data shows 68% of hotel guests make at least one hot beverage per stay. In-room kettles also reduce room service calls by 30%, saving your operations team significant effort and cost.'),
        ('"We\'ve had kettles break within months"',
         'That\'s typically due to low-quality controllers. Our Strix-equipped kettles are tested for 10,000+ cycles - that\'s over 5 years of daily use. We also provide a 2-year replacement warranty.'),
        ('"Stainless steel kettles are too expensive"',
         'SS304 kettles last 3-4x longer than plastic models. Over a 5-year period, the total cost of ownership is actually lower because you replace them far less frequently. Plus, premium kettles improve guest reviews.'),
        ('"Our current supplier is cheaper"',
         'Consider the total cost: cheaper kettles need replacement 2-3x more often, cause more guest complaints, and pose higher safety risks. LAXREE kettles offer the best value when you factor in longevity and safety.'),
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
        'Based on the product video analysis, the LAXREE Electric Kettle features a <b>modern, minimalist '
        'design</b> with a sleek glossy black exterior and curved silhouette. The interior showcases a '
        '<b>polished stainless steel (SS304) finish</b> for food safety and easy maintenance.', s['body']))
    story.append(Spacer(1, 6))
    story.append(Paragraph('<b>Key Visual Highlights from Video:</b>', s['h3']))
    video_points = [
        'The kettle features an ergonomic handle designed for comfortable, safe pouring',
        'Hinged lid with secure latch allows easy filling and cleaning',
        'Non-slip base prevents the kettle from sliding on smooth hotel surfaces',
        'Cord storage compartment keeps the power cord neatly tucked away',
        'Multiple model variants visible - from compact 0.6L to family-size 1.8L',
        'Double-wall models shown with insulation technology for cool-touch exterior',
        'The complete range demonstrates LAXREE\'s commitment to covering every hotel segment',
    ]
    for vp in video_points:
        story.append(Paragraph(f'- {vp}', s['bullet']))
    story.append(Spacer(1, 12))
    story.append(Paragraph(
        '<b>Sales Tip:</b> When presenting the kettle in person, always highlight the Strix controller '
        'logo on the base - it\'s the same component used by premium brands like Bosch and Philips. '
        'This builds instant credibility and differentiates LAXREE from budget competitors.', s['callout']))
    
    # Build PDF
    doc.build(story, onFirstPage=add_page_number, onLaterPages=add_page_number)
    print(f"Generated: {output_path}")
    return output_path


def generate_kettle_tray_pdf():
    """Generate Kettle Tray product training PDF."""
    ACCENT = colors.HexColor('#502db9')
    TEXT_PRIMARY = colors.HexColor('#1f1e1c')
    TEXT_MUTED = colors.HexColor('#837e77')
    BG_SURFACE = colors.HexColor('#e3dfd8')
    
    s = make_styles(ACCENT, TEXT_PRIMARY, TEXT_MUTED)
    
    output_path = '/home/z/my-project/upload/Kettle Tray.pdf'
    doc = SimpleDocTemplate(
        output_path, pagesize=A4,
        leftMargin=LEFT_M, rightMargin=RIGHT_M,
        topMargin=TOP_M, bottomMargin=BOTTOM_M
    )
    
    story = []
    
    # Cover
    story.append(Spacer(1, 2.5 * inch))
    story.append(Paragraph('<b>LAXREE</b>', s['cover_title']))
    story.append(Spacer(1, 8))
    story.append(HRFlowable(width="60%", thickness=2, color=ACCENT, spaceAfter=16, spaceBefore=8))
    story.append(Paragraph('<b>Kettle Tray</b>', ParagraphStyle(
        'CoverProduct', fontName='LiberationSerif', fontSize=28, leading=34,
        textColor=TEXT_PRIMARY, alignment=TA_CENTER, spaceAfter=8
    )))
    story.append(Paragraph('In-Room Beverage Station Solutions', s['cover_subtitle']))
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
    
    # TOC
    story.append(Paragraph('<b>Table of Contents</b>', s['h1']))
    story.append(Spacer(1, 12))
    toc_items = [
        ('1.', 'Product Overview'),
        ('2.', 'Tray Materials & Design Options'),
        ('3.', 'Anti-Theft Tray System'),
        ('4.', 'Complete Set Components & Specs'),
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
    
    # Section 1: Overview
    story.append(Paragraph('<b>1. Product Overview</b>', s['h1']))
    story.append(Spacer(1, 8))
    story.append(Paragraph(
        'The LAXREE Kettle Tray transforms any hotel room into a <b>premium beverage experience</b>. '
        'It\'s not just a tray - it\'s a thoughtfully designed station that enhances guest satisfaction, '
        'improves room aesthetics, and streamlines housekeeping operations.', s['body']))
    story.append(Spacer(1, 8))
    story.append(Paragraph('<b>Why Kettle Trays Matter:</b>', s['h3']))
    bullets = [
        '<b>First Impression:</b> A well-arranged beverage station signals quality and attention to detail',
        '<b>Guest Convenience:</b> Everything in one place - no searching for cups or sugar',
        '<b>Housekeeping Efficiency:</b> Standardized sets make room setup faster and consistent',
        '<b>Brand Image:</b> Coordinated accessories elevate the room\'s perceived value',
        '<b>Anti-Theft Protection:</b> Specialized trays secure kettles and reduce replacement costs',
    ]
    for b in bullets:
        story.append(Paragraph(f'- {b}', s['bullet']))
    story.append(Spacer(1, 18))
    
    # Section 2: Materials
    story.append(Paragraph('<b>2. Tray Materials & Design Options</b>', s['h1']))
    story.append(Spacer(1, 8))
    
    mat_data = [
        [Paragraph('<b>Material</b>', s['table_header']),
         Paragraph('<b>Features</b>', s['table_header']),
         Paragraph('<b>Color Options</b>', s['table_header']),
         Paragraph('<b>Best For</b>', s['table_header'])],
        [Paragraph('ABS Plastic', s['table_cell_left']), Paragraph('Durable, lightweight, scratch-resistant', s['table_cell_left']),
         Paragraph('Black, White, Custom', s['table_cell']), Paragraph('3-4 star hotels', s['table_cell_left'])],
        [Paragraph('Melamine', s['table_cell_left']), Paragraph('Heat-resistant to 120 C, elegant finish', s['table_cell_left']),
         Paragraph('White, Black', s['table_cell']), Paragraph('4-5 star hotels', s['table_cell_left'])],
        [Paragraph('PU + ABS', s['table_cell_left']), Paragraph('Premium feel, combined durability', s['table_cell_left']),
         Paragraph('Various', s['table_cell']), Paragraph('Luxury properties', s['table_cell_left'])],
        [Paragraph('Leatherette', s['table_cell_left']), Paragraph('Premium look and feel, soft texture', s['table_cell_left']),
         Paragraph('Brown, Black', s['table_cell']), Paragraph('5-star luxury', s['table_cell_left'])],
        [Paragraph('Stainless Steel', s['table_cell_left']), Paragraph('Anti-theft models, maximum security', s['table_cell_left']),
         Paragraph('Brushed SS', s['table_cell']), Paragraph('High-security areas', s['table_cell_left'])],
    ]
    col_w = [CONTENT_W * 0.18, CONTENT_W * 0.32, CONTENT_W * 0.20, CONTENT_W * 0.30]
    story.append(make_table(mat_data, col_w, ACCENT, BG_SURFACE, s))
    story.append(Spacer(1, 18))
    
    # Section 3: Anti-Theft
    story.append(Paragraph('<b>3. Anti-Theft Tray System</b>', s['h1']))
    story.append(Spacer(1, 8))
    story.append(Paragraph(
        'One of the most innovative features of the LAXREE Kettle Tray system is the <b>anti-theft '
        'tray design</b>. These specialized trays feature built-in locking mechanisms that secure the '
        'kettle and valuable accessories to the tray, preventing guest removal.', s['body']))
    story.append(Spacer(1, 8))
    story.append(Paragraph(
        'Hotels lose an average of <b>15-20% of in-room kettles per year</b> to guest removal. '
        'Anti-theft trays reduce this to under 2%, providing significant cost savings that justify '
        'the premium price within the first year.', s['body']))
    story.append(Spacer(1, 8))
    story.append(Paragraph(
        '<b>Sales Tip:</b> Always calculate the ROI for the hotel - show them how much they\'re '
        'currently losing to kettle theft and how quickly the anti-theft tray pays for itself.', s['callout']))
    story.append(Spacer(1, 18))
    
    # Section 4: Specs
    story.append(Paragraph('<b>4. Complete Set Components & Specs</b>', s['h1']))
    story.append(Spacer(1, 8))
    
    specs_data = [
        [Paragraph('<b>Component</b>', s['table_header']),
         Paragraph('<b>Specification</b>', s['table_header'])],
        [Paragraph('Tray Material', s['table_cell_left']), Paragraph('ABS / PU+ABS / Melamine / Leatherette / SS', s['table_cell_left'])],
        [Paragraph('Tray Size', s['table_cell_left']), Paragraph('35cm x 25cm (standard), Custom sizes available', s['table_cell_left'])],
        [Paragraph('Cups Included', s['table_cell_left']), Paragraph('2 porcelain cups with saucers', s['table_cell_left'])],
        [Paragraph('Condiment Holder', s['table_cell_left']), Paragraph('3-compartment organizer (sugar/sachet holder)', s['table_cell_left'])],
        [Paragraph('Kettle Compatibility', s['table_cell_left']), Paragraph('All LAXREE kettle models (0.6L - 1.8L)', s['table_cell_left'])],
        [Paragraph('Featured Model', s['table_cell_left']), Paragraph('LRWT-175 Complete Tray Set', s['table_cell_left'])],
        [Paragraph('Color Options', s['table_cell_left']), Paragraph('White / Black / Wooden / Custom', s['table_cell_left'])],
        [Paragraph('Anti-Theft Option', s['table_cell_left']), Paragraph('Available with locking mechanism', s['table_cell_left'])],
    ]
    col_w2 = [CONTENT_W * 0.35, CONTENT_W * 0.65]
    story.append(make_table(specs_data, col_w2, ACCENT, BG_SURFACE, s))
    story.append(Spacer(1, 18))
    
    # Section 5: Selling Strategy
    story.append(Paragraph('<b>5. Selling Strategy by Hotel Tier</b>', s['h1']))
    story.append(Spacer(1, 8))
    
    strategy_data = [
        [Paragraph('<b>Hotel Tier</b>', s['table_header']),
         Paragraph('<b>Recommended Set</b>', s['table_header']),
         Paragraph('<b>Pitch Angle</b>', s['table_header'])],
        [Paragraph('5-Star Luxury', s['table_cell_left']), Paragraph('Leatherette + SS Kettle', s['table_cell']),
         Paragraph('"A coordinated luxury beverage experience your guests will photograph and share"', s['table_cell_left'])],
        [Paragraph('4-Star Premium', s['table_cell_left']), Paragraph('Melamine + SS Kettle', s['table_cell']),
         Paragraph('"Organized stations rate 23% higher on cleanliness and comfort"', s['table_cell_left'])],
        [Paragraph('3-Star Business', s['table_cell_left']), Paragraph('ABS Anti-Theft Set', s['table_cell']),
         Paragraph('"Anti-theft savings pay for the entire set within 12 months"', s['table_cell_left'])],
        [Paragraph('Budget / Transit', s['table_cell_left']), Paragraph('Basic ABS Tray Set', s['table_cell']),
         Paragraph('"Complete beverage station at just the cost of 2 room service coffees"', s['table_cell_left'])],
    ]
    col_w3 = [CONTENT_W * 0.20, CONTENT_W * 0.25, CONTENT_W * 0.55]
    story.append(make_table(strategy_data, col_w3, ACCENT, BG_SURFACE, s))
    story.append(Spacer(1, 18))
    
    # Section 6: Objection Handling
    story.append(Paragraph('<b>6. Objection Handling</b>', s['h1']))
    story.append(Spacer(1, 8))
    
    objections = [
        ('"We can just use any tray"',
         'Standard trays don\'t have kettle securing mechanisms, organized compartments, or heat-resistant surfaces. LAXREE trays are purpose-built for hotel use - they look better, last longer, and reduce housekeeping setup time by 40%.'),
        ('"Guests don\'t care about the tray"',
         'Guests may not notice the tray specifically, but they absolutely notice the experience. A messy, disorganized beverage station gets complaints. Our coordinated sets create a premium experience that translates to better reviews.'),
        ('"Anti-theft trays are unnecessary"',
         'Hotels lose 15-20% of kettles annually to theft. For a 200-room hotel, that\'s 30-40 kettle replacements per year. Anti-theft trays reduce loss to under 2% - the savings pay for the trays within the first year.'),
        ('"The tray sets are too expensive"',
         'Bundle the tray with a LAXREE kettle for a 15-20% discount. The coordinated look is impossible to achieve with mix-and-match brands, and the total cost is still lower than buying components separately.'),
    ]
    for q, a in objections:
        story.append(Paragraph(f'<b>{q}</b>', s['h3']))
        story.append(Paragraph(a, s['body']))
        story.append(Spacer(1, 8))
    story.append(Spacer(1, 18))
    
    # Section 7: Video Transcript
    story.append(Paragraph('<b>7. Video Transcript Summary</b>', s['h1']))
    story.append(Spacer(1, 8))
    story.append(Paragraph(
        'The product video showcases the LAXREE Kettle Tray system in detail, highlighting two primary '
        'categories: <b>Regular Trays</b> for standard hotel use and <b>Anti-Theft Trays</b> with '
        'built-in security mechanisms for high-value installations.', s['body']))
    story.append(Spacer(1, 6))
    story.append(Paragraph('<b>Key Visual Highlights from Video:</b>', s['h3']))
    video_points = [
        'The LRWT-175 featured model includes a main tray with orange border and black interior',
        'Integrated sachet holder compartment for organized tea/coffee service',
        'Dedicated kettle holder that secures the kettle in place',
        'Anti-theft models shown with SS (stainless steel) components for added security',
        'Multiple material options demonstrated: ABS, PU, Melamine, and Leatherette',
        'Compact design that fits standard hotel room desks and nightstands',
        'LAXREE branding clearly visible, reinforcing professional appearance',
    ]
    for vp in video_points:
        story.append(Paragraph(f'- {vp}', s['bullet']))
    story.append(Spacer(1, 12))
    story.append(Paragraph(
        '<b>Sales Tip:</b> Always demonstrate the anti-theft feature in person. Show how the kettle '
        'locks into the tray and explain the ROI calculation. This is the #1 differentiator that '
        'closes deals with operations managers.', s['callout']))
    
    doc.build(story, onFirstPage=add_page_number, onLaterPages=add_page_number)
    print(f"Generated: {output_path}")
    return output_path


def generate_hanger_pdf():
    """Generate Hotel Hangers product training PDF."""
    ACCENT = colors.HexColor('#4722b5')
    TEXT_PRIMARY = colors.HexColor('#1a1b1d')
    TEXT_MUTED = colors.HexColor('#7c8288')
    BG_SURFACE = colors.HexColor('#dee2e7')
    
    s = make_styles(ACCENT, TEXT_PRIMARY, TEXT_MUTED)
    
    output_path = '/home/z/my-project/upload/Hotel Hangers.pdf'
    doc = SimpleDocTemplate(
        output_path, pagesize=A4,
        leftMargin=LEFT_M, rightMargin=RIGHT_M,
        topMargin=TOP_M, bottomMargin=BOTTOM_M
    )
    
    story = []
    
    # Cover
    story.append(Spacer(1, 2.5 * inch))
    story.append(Paragraph('<b>LAXREE</b>', s['cover_title']))
    story.append(Spacer(1, 8))
    story.append(HRFlowable(width="60%", thickness=2, color=ACCENT, spaceAfter=16, spaceBefore=8))
    story.append(Paragraph('<b>Hotel Hangers</b>', ParagraphStyle(
        'CoverProduct', fontName='LiberationSerif', fontSize=28, leading=34,
        textColor=TEXT_PRIMARY, alignment=TA_CENTER, spaceAfter=8
    )))
    story.append(Paragraph('Wardrobe & Closet Solutions', s['cover_subtitle']))
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
    
    # TOC
    story.append(Paragraph('<b>Table of Contents</b>', s['h1']))
    story.append(Spacer(1, 12))
    toc_items = [
        ('1.', 'Product Overview'),
        ('2.', 'Hanger Types & Model Range'),
        ('3.', 'Anti-Theft System Deep Dive'),
        ('4.', 'Technical Specifications'),
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
    
    # Section 1: Overview
    story.append(Paragraph('<b>1. Product Overview</b>', s['h1']))
    story.append(Spacer(1, 8))
    story.append(Paragraph(
        'Hotel hangers may seem like a small detail, but they have an <b>outsized impact on guest '
        'perception</b>. A well-stocked, organized wardrobe with quality hangers signals attention '
        'to detail, while a poorly equipped closet suggests neglect.', s['body']))
    story.append(Spacer(1, 8))
    story.append(Paragraph(
        'LAXREE offers a comprehensive hanger collection built for <b>durability, security, and style</b>. '
        'From anti-theft locked hangers to premium wooden designs, we provide the complete wardrobe '
        'solution for every hotel tier.', s['body']))
    story.append(Spacer(1, 8))
    story.append(Paragraph('<b>Key Differentiators:</b>', s['h3']))
    bullets = [
        '<b>Anti-Theft Ring System</b> - Reduces hanger replacement from 20% to under 2% annually',
        '<b>Premium Wooden Construction</b> - Beech/pine wood with natural and dark finishes',
        '<b>Complete Range</b> - Pant, shirt, coat, shawl, and suit hangers for every need',
        '<b>Custom Branding</b> - Laser engraving, silkscreen, or embossing available',
        '<b>Eco-Friendly</b> - Sustainable wood sources, aligns with green hotel initiatives',
    ]
    for b in bullets:
        story.append(Paragraph(f'- {b}', s['bullet']))
    story.append(Spacer(1, 18))
    
    # Section 2: Model Range
    story.append(Paragraph('<b>2. Hanger Types & Model Range</b>', s['h1']))
    story.append(Spacer(1, 8))
    
    story.append(Paragraph('<b>Anti-Theft Hangers (with Locking Mechanism)</b>', s['h2']))
    at_data = [
        [Paragraph('<b>Model</b>', s['table_header']),
         Paragraph('<b>Type</b>', s['table_header']),
         Paragraph('<b>Features</b>', s['table_header']),
         Paragraph('<b>Best For</b>', s['table_header'])],
        [Paragraph('LRWH-226', s['table_cell']), Paragraph('Pant Hanger', s['table_cell']),
         Paragraph('Circular top hook, secure clasp', s['table_cell_left']), Paragraph('All room types', s['table_cell_left'])],
        [Paragraph('LRWH-227', s['table_cell']), Paragraph('Shirt Hanger', s['table_cell']),
         Paragraph('No clips, gentle on delicates', s['table_cell_left']), Paragraph('Standard/deluxe rooms', s['table_cell_left'])],
        [Paragraph('LRWH-233', s['table_cell']), Paragraph('Shirt w/ Teeth Bar', s['table_cell']),
         Paragraph('Notched bar prevents silk slippage', s['table_cell_left']), Paragraph('Luxury rooms', s['table_cell_left'])],
        [Paragraph('LRWH-228', s['table_cell']), Paragraph('Shawl Hanger', s['table_cell']),
         Paragraph('Padded, curved, prevents creasing', s['table_cell_left']), Paragraph('Premium suites', s['table_cell_left'])],
    ]
    col_w = [CONTENT_W * 0.14, CONTENT_W * 0.20, CONTENT_W * 0.36, CONTENT_W * 0.30]
    story.append(make_table(at_data, col_w, ACCENT, BG_SURFACE, s))
    story.append(Spacer(1, 14))
    
    story.append(Paragraph('<b>Regular Hangers (Standard Use)</b>', s['h2']))
    reg_data = [
        [Paragraph('<b>Model</b>', s['table_header']),
         Paragraph('<b>Type</b>', s['table_header']),
         Paragraph('<b>Features</b>', s['table_header']),
         Paragraph('<b>Best For</b>', s['table_header'])],
        [Paragraph('LRWH-231', s['table_cell']), Paragraph('Pant Hanger', s['table_cell']),
         Paragraph('Standard design, no anti-theft', s['table_cell_left']), Paragraph('Staff areas, back-of-house', s['table_cell_left'])],
        [Paragraph('LRWH-229', s['table_cell']), Paragraph('Shirt Hanger', s['table_cell']),
         Paragraph('Basic everyday design', s['table_cell_left']), Paragraph('Standard rooms', s['table_cell_left'])],
        [Paragraph('LRWH-232', s['table_cell']), Paragraph('Coat Hanger', s['table_cell']),
         Paragraph('Wide-shouldered, heavy-duty', s['table_cell_left']), Paragraph('Suites, winter season', s['table_cell_left'])],
        [Paragraph('LRWH-234', s['table_cell']), Paragraph('Shoulder Teeth Bar', s['table_cell']),
         Paragraph('Notched bar for thin fabrics', s['table_cell_left']), Paragraph('Deluxe rooms', s['table_cell_left'])],
    ]
    story.append(make_table(reg_data, col_w, ACCENT, BG_SURFACE, s))
    story.append(Spacer(1, 18))
    
    # Section 3: Anti-Theft
    story.append(Paragraph('<b>3. Anti-Theft System Deep Dive</b>', s['h1']))
    story.append(Spacer(1, 8))
    story.append(Paragraph(
        'The <b>anti-theft ring hanger system</b> is one of the most requested products by hotel '
        'operations managers. Here is how it works and why it matters:', s['body']))
    story.append(Spacer(1, 6))
    story.append(Paragraph('<b>How It Works:</b>', s['h3']))
    story.append(Paragraph(
        'The hanger features a small ring (or hook) that can only slide onto a specially designed '
        'wardrobe rod with a corresponding groove. Standard hangers cannot be used on the rod, '
        'and the ring hangers cannot be easily removed without the proper technique.', s['body']))
    story.append(Spacer(1, 8))
    
    roi_data = [
        [Paragraph('<b>Metric</b>', s['table_header']),
         Paragraph('<b>Without Anti-Theft</b>', s['table_header']),
         Paragraph('<b>With LAXREE Anti-Theft</b>', s['table_header'])],
        [Paragraph('Annual Hanger Loss Rate', s['table_cell_left']), Paragraph('15-20%', s['table_cell']),
         Paragraph('Under 2%', s['table_cell'])],
        [Paragraph('Annual Replacements (200 rooms)', s['table_cell_left']), Paragraph('240-320 hangers', s['table_cell']),
         Paragraph('Under 24 hangers', s['table_cell'])],
        [Paragraph('Replacement Cost/Year', s['table_cell_left']), Paragraph('High', s['table_cell']),
         Paragraph('Minimal', s['table_cell'])],
        [Paragraph('ROI Timeline', s['table_cell_left']), Paragraph('N/A', s['table_cell']),
         Paragraph('Within first year', s['table_cell'])],
    ]
    col_w2 = [CONTENT_W * 0.35, CONTENT_W * 0.30, CONTENT_W * 0.35]
    story.append(make_table(roi_data, col_w2, ACCENT, BG_SURFACE, s))
    story.append(Spacer(1, 18))
    
    # Section 4: Specs
    story.append(Paragraph('<b>4. Technical Specifications</b>', s['h1']))
    story.append(Spacer(1, 8))
    specs_data = [
        [Paragraph('<b>Parameter</b>', s['table_header']),
         Paragraph('<b>Specification</b>', s['table_header'])],
        [Paragraph('Material', s['table_cell_left']), Paragraph('High-quality Beech/Pine Wood', s['table_cell_left'])],
        [Paragraph('Finishes', s['table_cell_left']), Paragraph('Brown (dark wood) / Natural (light wood)', s['table_cell_left'])],
        [Paragraph('Hanger Types', s['table_cell_left']), Paragraph('Pant, Shirt, Coat, Shawl, Suit - Anti-Theft & Regular', s['table_cell_left'])],
        [Paragraph('Anti-Theft Mechanism', s['table_cell_left']), Paragraph('Locking ring design, compatible wardrobe rod required', s['table_cell_left'])],
        [Paragraph('Per Room Set', s['table_cell_left']), Paragraph('8-12 hangers (standard), Custom quantities available', s['table_cell_left'])],
        [Paragraph('Branding Options', s['table_cell_left']), Paragraph('Laser engraving (wood), Silkscreen, Embossing', s['table_cell_left'])],
        [Paragraph('Minimum Order (Branded)', s['table_cell_left']), Paragraph('500 hangers per design', s['table_cell_left'])],
        [Paragraph('Lifespan', s['table_cell_left']), Paragraph('Wooden: 7-10 years | ABS: 5+ years | Velvet: 3-5 years', s['table_cell_left'])],
        [Paragraph('Warranty', s['table_cell_left']), Paragraph('1-year replacement against manufacturing defects', s['table_cell_left'])],
    ]
    col_w3 = [CONTENT_W * 0.35, CONTENT_W * 0.65]
    story.append(make_table(specs_data, col_w3, ACCENT, BG_SURFACE, s))
    story.append(Spacer(1, 18))
    
    # Section 5: Selling Strategy
    story.append(Paragraph('<b>5. Selling Strategy by Hotel Tier</b>', s['h1']))
    story.append(Spacer(1, 8))
    strategy_data = [
        [Paragraph('<b>Hotel Type</b>', s['table_header']),
         Paragraph('<b>Recommended Set</b>', s['table_header']),
         Paragraph('<b>Pitch Angle</b>', s['table_header'])],
        [Paragraph('3-Star / Budget', s['table_cell_left']), Paragraph('ABS Plastic Ring Set', s['table_cell']),
         Paragraph('"Anti-theft savings pay for the hangers"', s['table_cell_left'])],
        [Paragraph('4-Star / Business', s['table_cell_left']), Paragraph('Wooden Ring Set', s['table_cell']),
         Paragraph('"Premium look with theft protection"', s['table_cell_left'])],
        [Paragraph('5-Star / Luxury', s['table_cell_left']), Paragraph('Wooden Premium + Suit Set', s['table_cell']),
         Paragraph('"Boutique wardrobe experience"', s['table_cell_left'])],
        [Paragraph('Boutique / Modern', s['table_cell_left']), Paragraph('Velvet Slimline Set', s['table_cell']),
         Paragraph('"Space-saving luxury"', s['table_cell_left'])],
    ]
    col_w4 = [CONTENT_W * 0.22, CONTENT_W * 0.30, CONTENT_W * 0.48]
    story.append(make_table(strategy_data, col_w4, ACCENT, BG_SURFACE, s))
    story.append(Spacer(1, 8))
    story.append(Paragraph(
        '<b>Cross-Sell Opportunity:</b> Always pair hangers with LAXREE wardrobe accessories: '
        'luggage racks, shoe racks, ironing boards, and laundry bags. A complete wardrobe package '
        'increases order value by 40-60%.', s['callout']))
    story.append(Spacer(1, 18))
    
    # Section 6: Objection Handling
    story.append(Paragraph('<b>6. Objection Handling</b>', s['h1']))
    story.append(Spacer(1, 8))
    objections = [
        ('"Guests don\'t care about hangers"',
         'Hotels with quality wooden hangers report 12% higher guest satisfaction scores on room comfort. Hangers are one of the first things guests interact with in the room - a broken or missing hanger creates an immediate negative impression.'),
        ('"Anti-theft hangers are too expensive"',
         'Calculate the ROI: A 200-room hotel loses 240-320 hangers per year without anti-theft. That\'s a significant recurring cost. Anti-theft hangers reduce replacement to under 24 per year. The savings pay for the entire hanger set within 12 months.'),
        ('"We can use any cheap hangers"',
         'Cheap plastic hangers break within months, look unprofessional, and need constant replacement. LAXREE wooden hangers last 7-10 years and project a premium image. Over 5 years, quality hangers are actually cheaper.'),
    ]
    for q, a in objections:
        story.append(Paragraph(f'<b>{q}</b>', s['h3']))
        story.append(Paragraph(a, s['body']))
        story.append(Spacer(1, 8))
    story.append(Spacer(1, 18))
    
    # Section 7: Video Transcript
    story.append(Paragraph('<b>7. Video Transcript Summary</b>', s['h1']))
    story.append(Spacer(1, 8))
    story.append(Paragraph(
        'The product video presents the complete LAXREE wooden hanger collection, clearly organized '
        'into two categories: <b>Anti-Theft Hangers</b> (left column) and <b>Regular Hangers</b> '
        '(right column). Each model is displayed with its unique code for easy ordering.', s['body']))
    story.append(Spacer(1, 6))
    story.append(Paragraph('<b>Key Visual Highlights from Video:</b>', s['h3']))
    video_points = [
        'Two distinct product lines clearly labeled: Anti-Theft and Regular',
        'Anti-theft hangers show the locking ring mechanism on models LRWH-226 through LRWH-228',
        'LRWH-233 features a teeth bar design that prevents thin fabrics from slipping',
        'LRWH-228 shawl hanger has padded, curved design for delicate fabrics',
        'LRWH-232 coat hanger demonstrates wide-shouldered construction for heavy garments',
        'Available in brown (dark wood) and natural (light wood) finishes',
        'All models display professional LAXREE branding and model numbers',
        'The complete range ensures hotels can standardize their entire wardrobe setup',
    ]
    for vp in video_points:
        story.append(Paragraph(f'- {vp}', s['bullet']))
    story.append(Spacer(1, 12))
    story.append(Paragraph(
        '<b>Sales Tip:</b> Bring both anti-theft and regular hangers to presentations. Let the '
        'client feel the wood quality and try the locking mechanism. Physical demonstration '
        'of the anti-theft feature closes more deals than any brochure.', s['callout']))
    
    doc.build(story, onFirstPage=add_page_number, onLaterPages=add_page_number)
    print(f"Generated: {output_path}")
    return output_path


def generate_rfid_pdf():
    """Generate RFID Door Lock product training PDF."""
    ACCENT = colors.HexColor('#227490')
    TEXT_PRIMARY = colors.HexColor('#212325')
    TEXT_MUTED = colors.HexColor('#7a8287')
    BG_SURFACE = colors.HexColor('#e2e5e8')
    
    s = make_styles(ACCENT, TEXT_PRIMARY, TEXT_MUTED)
    
    output_path = '/home/z/my-project/upload/RFID Door Lock.pdf'
    doc = SimpleDocTemplate(
        output_path, pagesize=A4,
        leftMargin=LEFT_M, rightMargin=RIGHT_M,
        topMargin=TOP_M, bottomMargin=BOTTOM_M
    )
    
    story = []
    
    # Cover
    story.append(Spacer(1, 2.5 * inch))
    story.append(Paragraph('<b>LAXREE</b>', s['cover_title']))
    story.append(Spacer(1, 8))
    story.append(HRFlowable(width="60%", thickness=2, color=ACCENT, spaceAfter=16, spaceBefore=8))
    story.append(Paragraph('<b>RFID Door Lock</b>', ParagraphStyle(
        'CoverProduct', fontName='LiberationSerif', fontSize=28, leading=34,
        textColor=TEXT_PRIMARY, alignment=TA_CENTER, spaceAfter=8
    )))
    story.append(Paragraph('Smart Access Control for Hotels', s['cover_subtitle']))
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
    
    # TOC
    story.append(Paragraph('<b>Table of Contents</b>', s['h1']))
    story.append(Spacer(1, 12))
    toc_items = [
        ('1.', 'Product Overview'),
        ('2.', 'Lock Models & Design Options'),
        ('3.', 'PMS Integration & Access Methods'),
        ('4.', 'Technical Specifications'),
        ('5.', 'Security Features'),
        ('6.', 'Selling Strategy by Hotel Tier'),
        ('7.', 'Objection Handling'),
        ('8.', 'Video Transcript Summary'),
    ]
    for num, title in toc_items:
        story.append(Paragraph(f'<b>{num}</b>  {title}', ParagraphStyle(
            f'TOC_{num}', fontName='LiberationSerif', fontSize=12, leading=20,
            textColor=TEXT_PRIMARY, leftIndent=20, spaceAfter=4
        )))
    story.append(PageBreak())
    
    # Section 1: Overview
    story.append(Paragraph('<b>1. Product Overview</b>', s['h1']))
    story.append(Spacer(1, 8))
    story.append(Paragraph(
        'LAXREE RFID Door Locks represent the <b>future of hotel room access</b>. Moving beyond '
        'traditional mechanical keys, our RFID solutions offer contactless entry, PMS integration, '
        'and mobile key capability - all while maintaining robust security standards.', s['body']))
    story.append(Spacer(1, 8))
    story.append(Paragraph('<b>Why Hotels Are Switching to RFID:</b>', s['h3']))
    bullets = [
        '<b>Guest Experience:</b> Tap-to-enter is 3x faster than mechanical keys',
        '<b>Security:</b> Cards deactivate automatically at checkout - no re-keying needed',
        '<b>Operations:</b> Audit trail of every door opening - who, when, how',
        '<b>Cost Savings:</b> Reusable cards vs. replacing lost mechanical keys',
        '<b>Modern Image:</b> Keyless entry is now expected by luxury travelers',
    ]
    for b in bullets:
        story.append(Paragraph(f'- {b}', s['bullet']))
    story.append(Spacer(1, 18))
    
    # Section 2: Lock Models
    story.append(Paragraph('<b>2. Lock Models & Design Options</b>', s['h1']))
    story.append(Spacer(1, 8))
    models_data = [
        [Paragraph('<b>Model</b>', s['table_header']),
         Paragraph('<b>Design</b>', s['table_header']),
         Paragraph('<b>Key Features</b>', s['table_header']),
         Paragraph('<b>Best For</b>', s['table_header'])],
        [Paragraph('LRFD-605', s['table_cell']), Paragraph('Modern integrated', s['table_cell']),
         Paragraph('RFID reader + digital display', s['table_cell_left']), Paragraph('4-5 star hotels', s['table_cell_left'])],
        [Paragraph('LRFD-606', s['table_cell']), Paragraph('Traditional lever', s['table_cell']),
         Paragraph('Classic handle + RFID', s['table_cell_left']), Paragraph('Heritage/boutique', s['table_cell_left'])],
        [Paragraph('LRFD-607', s['table_cell']), Paragraph('Sleek minimalist', s['table_cell']),
         Paragraph('Contemporary aesthetic', s['table_cell_left']), Paragraph('Modern hotels', s['table_cell_left'])],
        [Paragraph('LRFD-608', s['table_cell']), Paragraph('SS + digital', s['table_cell']),
         Paragraph('Stainless steel, digital interface', s['table_cell_left']), Paragraph('Premium properties', s['table_cell_left'])],
        [Paragraph('LRFD-609', s['table_cell']), Paragraph('Vertical black panel', s['table_cell']),
         Paragraph('Touch interface, PIN entry', s['table_cell_left']), Paragraph('Tech-forward hotels', s['table_cell_left'])],
        [Paragraph('LRFD-610', s['table_cell']), Paragraph('Polished metal', s['table_cell']),
         Paragraph('Traditional lever, polished finish', s['table_cell_left']), Paragraph('Luxury properties', s['table_cell_left'])],
        [Paragraph('LRFD-612', s['table_cell']), Paragraph('Room display', s['table_cell']),
         Paragraph('Room number display (e.g., 1608)', s['table_cell_left']), Paragraph('All properties', s['table_cell_left'])],
    ]
    col_w = [CONTENT_W * 0.14, CONTENT_W * 0.22, CONTENT_W * 0.36, CONTENT_W * 0.28]
    story.append(make_table(models_data, col_w, ACCENT, BG_SURFACE, s))
    story.append(Spacer(1, 8))
    story.append(Paragraph(
        '<b>Complementary Components:</b> The RFID system includes dedicated <b>Encoder</b> devices '
        'for card programming, <b>DND (Do Not Disturb) Sets</b> for integrated room management, and '
        '<b>Energy Saver Switches</b> that work with the card system to automate room power.', s['body']))
    story.append(Spacer(1, 18))
    
    # Section 3: PMS Integration
    story.append(Paragraph('<b>3. PMS Integration & Access Methods</b>', s['h1']))
    story.append(Spacer(1, 8))
    
    story.append(Paragraph('<b>Supported PMS Platforms</b>', s['h2']))
    pms_data = [
        [Paragraph('<b>PMS</b>', s['table_header']),
         Paragraph('<b>Integration Type</b>', s['table_header']),
         Paragraph('<b>Setup Time</b>', s['table_header'])],
        [Paragraph('Oracle Opera', s['table_cell']), Paragraph('Direct API', s['table_cell']),
         Paragraph('2-3 days', s['table_cell'])],
        [Paragraph('Cloudbeds', s['table_cell']), Paragraph('Cloud API', s['table_cell']),
         Paragraph('1 day', s['table_cell'])],
        [Paragraph('Mews', s['table_cell']), Paragraph('Cloud API', s['table_cell']),
         Paragraph('1 day', s['table_cell'])],
        [Paragraph('IDS Fortune', s['table_cell']), Paragraph('Direct API', s['table_cell']),
         Paragraph('2-3 days', s['table_cell'])],
        [Paragraph('WinHMS', s['table_cell']), Paragraph('Middleware', s['table_cell']),
         Paragraph('3-5 days', s['table_cell'])],
    ]
    col_w2 = [CONTENT_W * 0.30, CONTENT_W * 0.35, CONTENT_W * 0.35]
    story.append(make_table(pms_data, col_w2, ACCENT, BG_SURFACE, s))
    story.append(Spacer(1, 10))
    
    story.append(Paragraph('<b>Front Desk Workflow:</b>', s['h3']))
    workflow = [
        '1. Guest arrives - Reception checks them in on PMS',
        '2. PMS sends room assignment to LAXREE middleware',
        '3. Middleware encodes RFID card at the desk encoder',
        '4. Guest taps card on room door - Opens instantly',
        '5. At checkout, PMS automatically deactivates the card',
    ]
    for w in workflow:
        story.append(Paragraph(w, s['bullet']))
    story.append(Spacer(1, 10))
    
    story.append(Paragraph('<b>Access Methods:</b>', s['h2']))
    access_data = [
        [Paragraph('<b>Method</b>', s['table_header']),
         Paragraph('<b>Description</b>', s['table_header']),
         Paragraph('<b>Response Time</b>', s['table_header'])],
        [Paragraph('RFID Card', s['table_cell_left']), Paragraph('Contactless tap-to-enter, primary method', s['table_cell_left']),
         Paragraph('< 0.5 seconds', s['table_cell'])],
        [Paragraph('RFID Fob', s['table_cell_left']), Paragraph('Key fob alternative for staff/vip', s['table_cell_left']),
         Paragraph('< 0.5 seconds', s['table_cell'])],
        [Paragraph('PIN Code', s['table_cell_left']), Paragraph('Digital keypad on select models', s['table_cell_left']),
         Paragraph('< 1 second', s['table_cell'])],
        [Paragraph('Mobile Key', s['table_cell_left']), Paragraph('BLE smartphone access via hotel app', s['table_cell_left']),
         Paragraph('< 1 second', s['table_cell'])],
        [Paragraph('Mechanical Override', s['table_cell_left']), Paragraph('Emergency master key, always works', s['table_cell_left']),
         Paragraph('Instant', s['table_cell'])],
    ]
    col_w3 = [CONTENT_W * 0.22, CONTENT_W * 0.55, CONTENT_W * 0.23]
    story.append(make_table(access_data, col_w3, ACCENT, BG_SURFACE, s))
    story.append(Spacer(1, 18))
    
    # Section 4: Specs
    story.append(Paragraph('<b>4. Technical Specifications</b>', s['h1']))
    story.append(Spacer(1, 8))
    specs_data = [
        [Paragraph('<b>Parameter</b>', s['table_header']),
         Paragraph('<b>Specification</b>', s['table_header'])],
        [Paragraph('Access Methods', s['table_cell_left']), Paragraph('RFID Card / Fob / PIN / Mobile Key / Mechanical Override', s['table_cell_left'])],
        [Paragraph('Card Types', s['table_cell_left']), Paragraph('Mifare / T5577 / EM4100', s['table_cell_left'])],
        [Paragraph('Response Time', s['table_cell_left']), Paragraph('< 0.5 seconds (RFID)', s['table_cell_left'])],
        [Paragraph('Battery Life', s['table_cell_left']), Paragraph('12-18 months (4x AA batteries)', s['table_cell_left'])],
        [Paragraph('PMS Compatible', s['table_cell_left']), Paragraph('Opera, Cloudbeds, Mews, IDS, +20 more', s['table_cell_left'])],
        [Paragraph('Encryption', s['table_cell_left']), Paragraph('AES-128 (bank-grade security)', s['table_cell_left'])],
        [Paragraph('Construction', s['table_cell_left']), Paragraph('SS304 Stainless Steel, IP65 rated', s['table_cell_left'])],
        [Paragraph('Finish Options', s['table_cell_left']), Paragraph('SS304 / Matte Black / Gold / Rose Gold', s['table_cell_left'])],
        [Paragraph('Retrofit Compatible', s['table_cell_left']), Paragraph('Yes - fits standard 60mm backset doors', s['table_cell_left'])],
        [Paragraph('Anti-Peek PIN', s['table_cell_left']), Paragraph('Yes - random digits before/after PIN', s['table_cell_left'])],
        [Paragraph('Low Battery Warning', s['table_cell_left']), Paragraph('100+ openings before depletion', s['table_cell_left'])],
    ]
    col_w4 = [CONTENT_W * 0.35, CONTENT_W * 0.65]
    story.append(make_table(specs_data, col_w4, ACCENT, BG_SURFACE, s))
    story.append(Spacer(1, 18))
    
    # Section 5: Security
    story.append(Paragraph('<b>5. Security Features</b>', s['h1']))
    story.append(Spacer(1, 8))
    story.append(Paragraph('<b>Military-Grade Encryption</b>', s['h3']))
    story.append(Paragraph(
        'LAXREE RFID locks use <b>AES-128 encryption</b> - the same standard used by banks and '
        'governments. Each card has a unique encrypted ID that cannot be cloned or copied, providing '
        'maximum protection against unauthorized access.', s['body']))
    story.append(Spacer(1, 8))
    story.append(Paragraph('<b>Physical Security:</b>', s['h3']))
    sec_points = [
        '<b>SS304 Stainless Steel:</b> Anti-corrosion, anti-rust - perfect for coastal hotels',
        '<b>IP65 Rating:</b> Dust-tight and water-jet resistant for all environments',
        '<b>Anti-Pry Clutch:</b> Outside handle spins freely when locked - cannot force entry',
        '<b>Deadbolt Mode:</b> Guest can engage internal deadbolt for double security',
        '<b>Panic Exit:</b> Inside handle always opens - fire safety compliant',
        '<b>Audit Trail:</b> Records last 100-200 openings with timestamps and method',
    ]
    for sp in sec_points:
        story.append(Paragraph(f'- {sp}', s['bullet']))
    story.append(Spacer(1, 18))
    
    # Section 6: Selling Strategy
    story.append(Paragraph('<b>6. Selling Strategy by Hotel Tier</b>', s['h1']))
    story.append(Spacer(1, 8))
    strategy_data = [
        [Paragraph('<b>Hotel Type</b>', s['table_header']),
         Paragraph('<b>Recommended Model</b>', s['table_header']),
         Paragraph('<b>Pitch Angle</b>', s['table_header'])],
        [Paragraph('5-Star Luxury', s['table_cell_left']), Paragraph('LRFD-610 + Mobile Key', s['table_cell']),
         Paragraph('"The only lock that matches your premium interiors + mobile key for tech-savvy guests"', s['table_cell_left'])],
        [Paragraph('4-Star Premium', s['table_cell_left']), Paragraph('LRFD-605 + Encoder', s['table_cell']),
         Paragraph('"Audit trail + PMS integration at the best price point"', s['table_cell_left'])],
        [Paragraph('3-Star / Business', s['table_cell_left']), Paragraph('LRFD-607 + Encoder', s['table_cell']),
         Paragraph('"Modern keyless entry with fast PMS setup"', s['table_cell_left'])],
        [Paragraph('Boutique / Heritage', s['table_cell_left']), Paragraph('LRFD-606 + DND Set', s['table_cell']),
         Paragraph('"Classic design with modern security inside"', s['table_cell_left'])],
        [Paragraph('Resort / Casino', s['table_cell_left']), Paragraph('LRFD-608 + Energy Saver', s['table_cell']),
         Paragraph('"SS construction + tamper alarm + energy management"', s['table_cell_left'])],
    ]
    col_w5 = [CONTENT_W * 0.20, CONTENT_W * 0.28, CONTENT_W * 0.52]
    story.append(make_table(strategy_data, col_w5, ACCENT, BG_SURFACE, s))
    story.append(Spacer(1, 18))
    
    # Section 7: Objection Handling
    story.append(Paragraph('<b>7. Objection Handling</b>', s['h1']))
    story.append(Spacer(1, 8))
    objections = [
        ('"RFID locks are too expensive"',
         'Consider the total cost: lost metal keys cost Rs 200-500 each to replace AND require a locksmith visit. RFID cards cost Rs 15-30 each and can be encoded instantly at the front desk. A 200-room hotel saves Rs 2-4 lakhs per year on key management alone.'),
        ('"What if the lock battery dies?"',
         'Three backup methods: (1) Low-battery warning for last 100+ openings, (2) External 9V battery terminal for emergency power, (3) Mechanical master key that always works. Battery death has never caused a guest lockout in our installations.'),
        ('"Our PMS might not be compatible"',
         'LAXREE RFID locks integrate with 20+ PMS systems including Opera, Cloudbeds, Mews, and IDS. For unsupported systems, our middleware software provides universal compatibility. Setup takes just 1-5 days.'),
        ('"Mechanical keys work fine"',
         'Mechanical keys cannot provide audit trails, auto-deactivation at checkout, or mobile key access. They are also easier to duplicate. Hotels with RFID locks report 60% fewer security incidents and 40% faster check-in times.'),
    ]
    for q, a in objections:
        story.append(Paragraph(f'<b>{q}</b>', s['h3']))
        story.append(Paragraph(a, s['body']))
        story.append(Spacer(1, 8))
    story.append(Spacer(1, 18))
    
    # Section 8: Video Transcript
    story.append(Paragraph('<b>8. Video Transcript Summary</b>', s['h1']))
    story.append(Spacer(1, 8))
    story.append(Paragraph(
        'The product video presents the complete LAXREE RFID Door Lock ecosystem, showcasing '
        '<b>6 lock models</b> (LRFD-605 through LRFD-612) alongside complementary components including '
        'the <b>Encoder</b>, <b>DND Set</b>, and <b>Energy Saver Switch</b>.', s['body']))
    story.append(Spacer(1, 6))
    story.append(Paragraph('<b>Key Visual Highlights from Video:</b>', s['h3']))
    video_points = [
        'Multiple lock designs shown - from modern minimalist (LRFD-607) to traditional lever (LRFD-606)',
        'LRFD-608 and LRFD-609 feature digital interfaces with PIN entry capability',
        'LRFD-612 displays room number (1608) for easy guest identification',
        'Dedicated Encoder device shown for front desk card programming',
        'DND (Do Not Disturb) Set integrates with the lock system',
        'Energy Saver Switch works with RFID cards for automatic room power management',
        'Polished metal and matte black finish options visible across models',
        'Complete ecosystem approach - everything a hotel needs for access control',
    ]
    for vp in video_points:
        story.append(Paragraph(f'- {vp}', s['bullet']))
    story.append(Spacer(1, 12))
    story.append(Paragraph(
        '<b>Sales Tip:</b> When presenting RFID locks, always bring the Encoder device and demonstrate '
        'card encoding live. Let the client tap a card on the lock and hear the satisfying click. '
        'Physical demonstration of the speed and convenience is the #1 deal closer.', s['callout']))
    
    doc.build(story, onFirstPage=add_page_number, onLaterPages=add_page_number)
    print(f"Generated: {output_path}")
    return output_path


def generate_rollaway_bed_pdf():
    """Generate Rollaway Bed product training PDF."""
    ACCENT = colors.HexColor('#2d8a4e')
    TEXT_PRIMARY = colors.HexColor('#1a1e1c')
    TEXT_MUTED = colors.HexColor('#7a8a7e')
    BG_SURFACE = colors.HexColor('#dde5df')
    
    s = make_styles(ACCENT, TEXT_PRIMARY, TEXT_MUTED)
    
    output_path = '/home/z/my-project/upload/Rollaway Bed.pdf'
    doc = SimpleDocTemplate(
        output_path, pagesize=A4,
        leftMargin=LEFT_M, rightMargin=RIGHT_M,
        topMargin=TOP_M, bottomMargin=BOTTOM_M
    )
    
    story = []
    
    # Cover
    story.append(Spacer(1, 2.5 * inch))
    story.append(Paragraph('<b>LAXREE</b>', s['cover_title']))
    story.append(Spacer(1, 8))
    story.append(HRFlowable(width="60%", thickness=2, color=ACCENT, spaceAfter=16, spaceBefore=8))
    story.append(Paragraph('<b>Rollaway Bed</b>', ParagraphStyle(
        'CoverProduct', fontName='LiberationSerif', fontSize=28, leading=34,
        textColor=TEXT_PRIMARY, alignment=TA_CENTER, spaceAfter=8
    )))
    story.append(Paragraph('Extra Bed Solutions for Hotels', s['cover_subtitle']))
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
    
    # TOC
    story.append(Paragraph('<b>Table of Contents</b>', s['h1']))
    story.append(Spacer(1, 12))
    toc_items = [
        ('1.', 'Product Overview'),
        ('2.', 'Models & Mattress Options'),
        ('3.', 'Technical Specifications'),
        ('4.', 'Selling Strategy by Hotel Tier'),
        ('5.', 'Objection Handling'),
        ('6.', 'Video Transcript Summary'),
    ]
    for num, title in toc_items:
        story.append(Paragraph(f'<b>{num}</b>  {title}', ParagraphStyle(
            f'TOC_{num}', fontName='LiberationSerif', fontSize=12, leading=20,
            textColor=TEXT_PRIMARY, leftIndent=20, spaceAfter=4
        )))
    story.append(PageBreak())
    
    # Section 1: Overview
    story.append(Paragraph('<b>1. Product Overview</b>', s['h1']))
    story.append(Spacer(1, 8))
    story.append(Paragraph(
        'LAXREE Rollaway Beds are the <b>perfect extra bed solution</b> for hotels that want to maximize '
        'room revenue without permanent space commitment. Our rollaway beds feature a minimalist, functional '
        'design with a sturdy metal frame, premium mattress options, and an intuitive folding mechanism '
        'that makes setup and storage effortless for housekeeping staff.', s['body']))
    story.append(Spacer(1, 8))
    story.append(Paragraph('<b>Key Features:</b>', s['h3']))
    bullets = [
        '<b>Compact Folding Design</b> - Folds vertically for easy storage in closets or under beds',
        '<b>Wheeled Mobility</b> - Equipped with wheels for effortless transport between rooms',
        '<b>Two Mattress Options</b> - 6" pocket spring + bonded foam OR 4" bonded foam',
        '<b>Sturdy Metal Frame</b> - Heavy-duty black steel frame for long-term durability',
        '<b>Quick Setup</b> - Intuitive folding mechanism, no tools required',
        '<b>Neutral Aesthetic</b> - Complements any hotel room decor',
    ]
    for b in bullets:
        story.append(Paragraph(f'- {b}', s['bullet']))
    story.append(Spacer(1, 18))
    
    # Section 2: Models
    story.append(Paragraph('<b>2. Models & Mattress Options</b>', s['h1']))
    story.append(Spacer(1, 8))
    models_data = [
        [Paragraph('<b>Model</b>', s['table_header']),
         Paragraph('<b>Mattress Thickness</b>', s['table_header']),
         Paragraph('<b>Mattress Type</b>', s['table_header']),
         Paragraph('<b>Best For</b>', s['table_header'])],
        [Paragraph('LRMR-257', s['table_cell']), Paragraph('6 inch', s['table_cell']),
         Paragraph('Pocket Spring + Bonded Foam', s['table_cell_left']),
         Paragraph('Premium hotels, extended stays', s['table_cell_left'])],
        [Paragraph('LRMR-255', s['table_cell']), Paragraph('4 inch', s['table_cell']),
         Paragraph('Bonded Foam', s['table_cell_left']),
         Paragraph('Budget hotels, short-term use', s['table_cell_left'])],
    ]
    col_w = [CONTENT_W * 0.16, CONTENT_W * 0.20, CONTENT_W * 0.34, CONTENT_W * 0.30]
    story.append(make_table(models_data, col_w, ACCENT, BG_SURFACE, s))
    story.append(Spacer(1, 14))
    story.append(Paragraph(
        '<b>Mattress Quality:</b> The LRMR-257 features individually wrapped pocket springs for '
        'targeted support combined with bonded foam for plush comfort. This delivers a genuine '
        '"hotel-quality" sleep experience. The LRMR-255 uses bonded foam for basic comfort at a '
        'more economical price point. Both mattresses are designed for hotel-grade hygiene and durability.', s['body']))
    story.append(Spacer(1, 18))
    
    # Section 3: Specs
    story.append(Paragraph('<b>3. Technical Specifications</b>', s['h1']))
    story.append(Spacer(1, 8))
    specs_data = [
        [Paragraph('<b>Parameter</b>', s['table_header']),
         Paragraph('<b>Specification</b>', s['table_header'])],
        [Paragraph('Frame Material', s['table_cell_left']), Paragraph('Heavy-duty black steel (powder-coated)', s['table_cell_left'])],
        [Paragraph('Mattress Options', s['table_cell_left']), Paragraph('6" Pocket Spring + Bonded Foam / 4" Bonded Foam', s['table_cell_left'])],
        [Paragraph('Headboard', s['table_cell_left']), Paragraph('Wood/composite, dark finish', s['table_cell_left'])],
        [Paragraph('Mobility', s['table_cell_left']), Paragraph('Wheeled for easy transport', s['table_cell_left'])],
        [Paragraph('Folding', s['table_cell_left']), Paragraph('Vertical fold, mattress stays attached', s['table_cell_left'])],
        [Paragraph('Setup Time', s['table_cell_left']), Paragraph('Under 2 minutes, no tools required', s['table_cell_left'])],
        [Paragraph('Weight Capacity', s['table_cell_left']), Paragraph('Standard adult capacity', s['table_cell_left'])],
        [Paragraph('Storage', s['table_cell_left']), Paragraph('Fits in standard hotel closets or under beds', s['table_cell_left'])],
        [Paragraph('Warranty', s['table_cell_left']), Paragraph('2-year frame warranty, 1-year mattress warranty', s['table_cell_left'])],
    ]
    col_w2 = [CONTENT_W * 0.35, CONTENT_W * 0.65]
    story.append(make_table(specs_data, col_w2, ACCENT, BG_SURFACE, s))
    story.append(Spacer(1, 18))
    
    # Section 4: Selling Strategy
    story.append(Paragraph('<b>4. Selling Strategy by Hotel Tier</b>', s['h1']))
    story.append(Spacer(1, 8))
    strategy_data = [
        [Paragraph('<b>Hotel Type</b>', s['table_header']),
         Paragraph('<b>Recommended Model</b>', s['table_header']),
         Paragraph('<b>Pitch Angle</b>', s['table_header'])],
        [Paragraph('5-Star Luxury', s['table_cell_left']), Paragraph('LRMR-257 (6")', s['table_cell']),
         Paragraph('"Premium pocket spring mattress - your guests won\'t know it\'s a rollaway"', s['table_cell_left'])],
        [Paragraph('4-Star Business', s['table_cell_left']), Paragraph('LRMR-257 (6")', s['table_cell']),
         Paragraph('"Revenue-generating extra bed that stores in a closet"', s['table_cell_left'])],
        [Paragraph('3-Star / Budget', s['table_cell_left']), Paragraph('LRMR-255 (4")', s['table_cell']),
         Paragraph('"Affordable extra bed solution for family travelers"', s['table_cell_left'])],
        [Paragraph('Resort / Extended Stay', s['table_cell_left']), Paragraph('LRMR-257 (6")', s['table_cell']),
         Paragraph('"Hotel-quality sleep for every additional guest"', s['table_cell_left'])],
    ]
    col_w3 = [CONTENT_W * 0.22, CONTENT_W * 0.25, CONTENT_W * 0.53]
    story.append(make_table(strategy_data, col_w3, ACCENT, BG_SURFACE, s))
    story.append(Spacer(1, 18))
    
    # Section 5: Objection Handling
    story.append(Paragraph('<b>5. Objection Handling</b>', s['h1']))
    story.append(Spacer(1, 8))
    objections = [
        ('"Rollaway beds are uncomfortable"',
         'The LRMR-257 uses pocket spring technology - the same used in premium hotel mattresses. Most guests cannot tell the difference between our rollaway and a permanent bed. The 6" thickness provides genuine comfort.'),
        ('"We don\'t get requests for extra beds"',
         'That\'s because you\'re not offering it! Hotels that actively market rollaway beds see 20-30% of rooms use them. It\'s an untapped revenue stream - charge Rs 500-1500 per night for an extra bed.'),
        ('"Rollaway beds take up too much storage space"',
         'Our rollaway beds fold vertically into a slim profile that fits in standard hotel closets or slides under permanent beds. The mattress stays attached, so there\'s no separate storage needed.'),
    ]
    for q, a in objections:
        story.append(Paragraph(f'<b>{q}</b>', s['h3']))
        story.append(Paragraph(a, s['body']))
        story.append(Spacer(1, 8))
    story.append(Spacer(1, 18))
    
    # Section 6: Video Transcript
    story.append(Paragraph('<b>6. Video Transcript Summary</b>', s['h1']))
    story.append(Spacer(1, 8))
    story.append(Paragraph(
        'The product video showcases the LAXREE Rollaway Bed in both deployed and folded positions, '
        'demonstrating the <b>compact folding mechanism</b> and <b>wheeled mobility</b>. The bed features '
        'a sleek black metal frame with a thin rectangular headboard in a dark red/brown tone.', s['body']))
    story.append(Spacer(1, 6))
    story.append(Paragraph('<b>Key Visual Highlights from Video:</b>', s['h3']))
    video_points = [
        'Black metal frame shown in both open and folded positions',
        'Wheels visible on the frame for easy room-to-room transport',
        'Two mattress options displayed: 6" premium and 4" economy',
        'Folded form is slim and vertical - easy closet storage',
        'Headboard adds a subtle decorative touch to the design',
        'Neutral color palette complements any hotel room decor',
        'Quick fold/unfold demonstrated - no tools required',
    ]
    for vp in video_points:
        story.append(Paragraph(f'- {vp}', s['bullet']))
    story.append(Spacer(1, 12))
    story.append(Paragraph(
        '<b>Sales Tip:</b> Always demonstrate the fold/unfold action in person. Show how quickly '
        'the bed goes from storage to fully set up - the speed and ease of operation is the #1 '
        'selling point for housekeeping managers.', s['callout']))
    
    doc.build(story, onFirstPage=add_page_number, onLaterPages=add_page_number)
    print(f"Generated: {output_path}")
    return output_path


def generate_addons_pdf():
    """Generate Hotel Add-ons product training PDF."""
    ACCENT = colors.HexColor('#8a5c2d')
    TEXT_PRIMARY = colors.HexColor('#1e1c1a')
    TEXT_MUTED = colors.HexColor('#8a7e74')
    BG_SURFACE = colors.HexColor('#e5e0d8')
    
    s = make_styles(ACCENT, TEXT_PRIMARY, TEXT_MUTED)
    
    output_path = '/home/z/my-project/upload/Hotel Add-ons.pdf'
    doc = SimpleDocTemplate(
        output_path, pagesize=A4,
        leftMargin=LEFT_M, rightMargin=RIGHT_M,
        topMargin=TOP_M, bottomMargin=BOTTOM_M
    )
    
    story = []
    
    # Cover
    story.append(Spacer(1, 2.5 * inch))
    story.append(Paragraph('<b>LAXREE</b>', s['cover_title']))
    story.append(Spacer(1, 8))
    story.append(HRFlowable(width="60%", thickness=2, color=ACCENT, spaceAfter=16, spaceBefore=8))
    story.append(Paragraph('<b>Hotel Add-ons</b>', ParagraphStyle(
        'CoverProduct', fontName='LiberationSerif', fontSize=28, leading=34,
        textColor=TEXT_PRIMARY, alignment=TA_CENTER, spaceAfter=8
    )))
    story.append(Paragraph('Room Accessories & Comfort Extras', s['cover_subtitle']))
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
    
    # TOC
    story.append(Paragraph('<b>Table of Contents</b>', s['h1']))
    story.append(Spacer(1, 12))
    toc_items = [
        ('1.', 'Product Overview'),
        ('2.', 'Iron & Ironing Board Range'),
        ('3.', 'Dustbin Range'),
        ('4.', 'Technical Specifications'),
        ('5.', 'Selling Strategy'),
        ('6.', 'Objection Handling'),
        ('7.', 'Video Transcript Summary'),
    ]
    for num, title in toc_items:
        story.append(Paragraph(f'<b>{num}</b>  {title}', ParagraphStyle(
            f'TOC_{num}', fontName='LiberationSerif', fontSize=12, leading=20,
            textColor=TEXT_PRIMARY, leftIndent=20, spaceAfter=4
        )))
    story.append(PageBreak())
    
    # Section 1: Overview
    story.append(Paragraph('<b>1. Product Overview</b>', s['h1']))
    story.append(Spacer(1, 8))
    story.append(Paragraph(
        'LAXREE Hotel Add-ons cover the <b>essential room accessories</b> that complete the guest '
        'experience. From steam irons and ironing boards to premium dustbins, these products address '
        'the practical needs of hotel guests while maintaining the aesthetic standards of modern hospitality.', s['body']))
    story.append(Spacer(1, 8))
    story.append(Paragraph(
        'Our add-ons range is designed to <b>cross-sell and bundle</b> with existing LAXREE product '
        'lines. Every item is built to hotel-grade durability standards with consistent design language.', s['body']))
    story.append(Spacer(1, 18))
    
    # Section 2: Iron & Ironing Board
    story.append(Paragraph('<b>2. Iron & Ironing Board Range</b>', s['h1']))
    story.append(Spacer(1, 8))
    
    iron_data = [
        [Paragraph('<b>Model</b>', s['table_header']),
         Paragraph('<b>Product</b>', s['table_header']),
         Paragraph('<b>Key Features</b>', s['table_header'])],
        [Paragraph('LRWS-332', s['table_cell']), Paragraph('Steam Iron', s['table_cell']),
         Paragraph('Ergonomic handle, efficient steam output', s['table_cell_left'])],
        [Paragraph('LRWS-333', s['table_cell']), Paragraph('Steam Iron (Premium)', s['table_cell']),
         Paragraph('Purple-accented design, enhanced steam', s['table_cell_left'])],
        [Paragraph('LRWS-326', s['table_cell']), Paragraph('Ironing Board', s['table_cell']),
         Paragraph('Metal frame, heat-resistant cover, foldable', s['table_cell_left'])],
        [Paragraph('LRWS-334', s['table_cell']), Paragraph('Iron & Board Stand', s['table_cell']),
         Paragraph('Metal stand for organized storage', s['table_cell_left'])],
    ]
    col_w = [CONTENT_W * 0.16, CONTENT_W * 0.26, CONTENT_W * 0.58]
    story.append(make_table(iron_data, col_w, ACCENT, BG_SURFACE, s))
    story.append(Spacer(1, 14))
    story.append(Paragraph(
        '<b>Sales Tip:</b> Bundle the steam iron + ironing board + stand as a complete ironing solution. '
        'Hotels prefer the coordinated look and you get a higher order value.', s['callout']))
    story.append(Spacer(1, 18))
    
    # Section 3: Dustbin Range
    story.append(Paragraph('<b>3. Dustbin Range</b>', s['h1']))
    story.append(Spacer(1, 8))
    story.append(Paragraph(
        'LAXREE offers a <b>comprehensive dustbin collection</b> with multiple material, size, and '
        'design options to match any hotel interior:', s['body']))
    story.append(Spacer(1, 8))
    
    dustbin_data = [
        [Paragraph('<b>Category</b>', s['table_header']),
         Paragraph('<b>Models</b>', s['table_header']),
         Paragraph('<b>Features</b>', s['table_header'])],
        [Paragraph('SS + PP Double Layer', s['table_cell_left']),
         Paragraph('LRRA-661 (Gold), LRRA-666 (Silver), LRRA-657 (Black+Silver)', s['table_cell_left']),
         Paragraph('Durable SS + lightweight PP inner', s['table_cell_left'])],
        [Paragraph('SS With Lid', s['table_cell_left']),
         Paragraph('LRRA-656 (Gold), LRRA-667 (Swing Lid Silver)', s['table_cell_left']),
         Paragraph('Concealed waste, hygienic', s['table_cell_left'])],
        [Paragraph('SS Soft Close', s['table_cell_left']),
         Paragraph('LRRA-664 (Square Gold), LRRA-665 (Round Silver)', s['table_cell_left']),
         Paragraph('Premium soft-close mechanism', s['table_cell_left'])],
        [Paragraph('PP Double Layer', s['table_cell_left']),
         Paragraph('LRRA-659 (Black+Silver)', s['table_cell_left']),
         Paragraph('Budget-friendly, lightweight', s['table_cell_left'])],
        [Paragraph('Perforated SS', s['table_cell_left']),
         Paragraph('LRRA-658 (Silver)', s['table_cell_left']),
         Paragraph('Ventilated design', s['table_cell_left'])],
        [Paragraph('Leatherette', s['table_cell_left']),
         Paragraph('LRRA-662 (Round), LRRA-660 (Square), LRRA-663 (Oval)', s['table_cell_left']),
         Paragraph('Premium look, brown leatherette finish', s['table_cell_left'])],
    ]
    col_w2 = [CONTENT_W * 0.20, CONTENT_W * 0.42, CONTENT_W * 0.38]
    story.append(make_table(dustbin_data, col_w2, ACCENT, BG_SURFACE, s))
    story.append(Spacer(1, 18))
    
    # Section 4: Specs
    story.append(Paragraph('<b>4. Technical Specifications</b>', s['h1']))
    story.append(Spacer(1, 8))
    specs_data = [
        [Paragraph('<b>Product</b>', s['table_header']),
         Paragraph('<b>Parameter</b>', s['table_header']),
         Paragraph('<b>Specification</b>', s['table_header'])],
        [Paragraph('Steam Iron', s['table_cell_left']), Paragraph('Steam Output', s['table_cell_left']),
         Paragraph('Continuous steam for efficient pressing', s['table_cell_left'])],
        [Paragraph('Steam Iron', s['table_cell_left']), Paragraph('Safety', s['table_cell_left']),
         Paragraph('Auto shut-off, anti-drip', s['table_cell_left'])],
        [Paragraph('Ironing Board', s['table_cell_left']), Paragraph('Cover', s['table_cell_left']),
         Paragraph('Heat-resistant fabric, replaceable', s['table_cell_left'])],
        [Paragraph('Ironing Board', s['table_cell_left']), Paragraph('Frame', s['table_cell_left']),
         Paragraph('Sturdy metal, foldable for storage', s['table_cell_left'])],
        [Paragraph('Dustbins (SS)', s['table_cell_left']), Paragraph('Material', s['table_cell_left']),
         Paragraph('Stainless Steel (Gold/Silver/Black)', s['table_cell_left'])],
        [Paragraph('Dustbins (Leatherette)', s['table_cell_left']), Paragraph('Material', s['table_cell_left']),
         Paragraph('Premium leatherette over sturdy frame', s['table_cell_left'])],
        [Paragraph('All Dustbins', s['table_cell_left']), Paragraph('Inner Bucket', s['table_cell_left']),
         Paragraph('Removable PP inner for easy cleaning', s['table_cell_left'])],
    ]
    col_w3 = [CONTENT_W * 0.22, CONTENT_W * 0.28, CONTENT_W * 0.50]
    story.append(make_table(specs_data, col_w3, ACCENT, BG_SURFACE, s))
    story.append(Spacer(1, 18))
    
    # Section 5: Selling Strategy
    story.append(Paragraph('<b>5. Selling Strategy</b>', s['h1']))
    story.append(Spacer(1, 8))
    story.append(Paragraph('<b>Bundle Strategy - The Complete Room Package:</b>', s['h3']))
    story.append(Paragraph(
        'Hotel Add-ons are <b>cross-sell magnets</b>. When a client orders minibars or kettles, '
        'always propose the complete room package including dustbins, ironing solutions, and hangers. '
        'Bundling increases average order value by 40-60%.', s['body']))
    story.append(Spacer(1, 8))
    
    story.append(Paragraph('<b>Positioning by Hotel Tier:</b>', s['h3']))
    strategy_data = [
        [Paragraph('<b>Hotel Tier</b>', s['table_header']),
         Paragraph('<b>Dustbin</b>', s['table_header']),
         Paragraph('<b>Iron Solution</b>', s['table_header'])],
        [Paragraph('5-Star', s['table_cell_left']), Paragraph('SS Soft Close (Gold)', s['table_cell']),
         Paragraph('LRWS-333 + Board + Stand', s['table_cell'])],
        [Paragraph('4-Star', s['table_cell_left']), Paragraph('SS+PP Double Layer', s['table_cell']),
         Paragraph('LRWS-332 + Board', s['table_cell'])],
        [Paragraph('3-Star', s['table_cell_left']), Paragraph('PP Double Layer', s['table_cell']),
         Paragraph('LRWS-332 Iron only', s['table_cell'])],
        [Paragraph('Boutique', s['table_cell_left']), Paragraph('Leatherette Collection', s['table_cell']),
         Paragraph('LRWS-333 + Board', s['table_cell'])],
    ]
    col_w4 = [CONTENT_W * 0.20, CONTENT_W * 0.38, CONTENT_W * 0.42]
    story.append(make_table(strategy_data, col_w4, ACCENT, BG_SURFACE, s))
    story.append(Spacer(1, 18))
    
    # Section 6: Objection Handling
    story.append(Paragraph('<b>6. Objection Handling</b>', s['h1']))
    story.append(Spacer(1, 8))
    objections = [
        ('"We already have dustbins"',
         'Standard dustbins crack, stain, and look cheap within months. LAXREE SS dustbins last 5+ years and maintain their premium appearance. The soft-close mechanism is a luxury touch that guests notice and appreciate.'),
        ('"Guests don\'t use irons anymore"',
         'Business travelers absolutely use irons - and they complain loudly when none is available. Having a quality ironing solution in-room reduces front desk complaints by 15% and improves online reviews.'),
        ('"These are just accessories, not important"',
         'Accessories are the details that separate a good hotel from a great one. Guests notice mismatched or cheap accessories, and they mention it in reviews. Coordinated, quality accessories improve your overall guest satisfaction scores.'),
    ]
    for q, a in objections:
        story.append(Paragraph(f'<b>{q}</b>', s['h3']))
        story.append(Paragraph(a, s['body']))
        story.append(Spacer(1, 8))
    story.append(Spacer(1, 18))
    
    # Section 7: Video Transcript
    story.append(Paragraph('<b>7. Video Transcript Summary</b>', s['h1']))
    story.append(Spacer(1, 8))
    story.append(Paragraph(
        'The product video showcases two core categories: <b>Iron & Ironing Board</b> solutions and '
        'a comprehensive <b>Dustbin Collection</b> with multiple material and design options.', s['body']))
    story.append(Spacer(1, 6))
    story.append(Paragraph('<b>Key Visual Highlights from Video:</b>', s['h3']))
    video_points = [
        'Steam irons LRWS-332 and LRWS-333 with ergonomic design and purple accents',
        'Ironing board LRWS-326 with foldable metal frame and heat-resistant cover',
        'Iron & Board stand LRWS-334 for organized, professional room setup',
        'SS+PP Double Layer dustbins in gold, silver, and black+silver finishes',
        'SS dustbins with lids and swing lids for hygienic waste management',
        'Soft-close dustbins (square and round) in premium gold and silver',
        'Leatherette dustbin collection in round, square, and oval shapes',
        'PP Double Layer and Perforated SS options for budget and specialized needs',
    ]
    for vp in video_points:
        story.append(Paragraph(f'- {vp}', s['bullet']))
    story.append(Spacer(1, 12))
    story.append(Paragraph(
        '<b>Sales Tip:</b> When presenting dustbins, bring the leatherette collection for boutique '
        'hotels and the SS Soft Close for luxury properties. Let clients feel the quality difference '
        'between our SS models and standard plastic bins - the tactile experience closes deals.', s['callout']))
    
    doc.build(story, onFirstPage=add_page_number, onLaterPages=add_page_number)
    print(f"Generated: {output_path}")
    return output_path


# ── Generate all PDFs ──
if __name__ == '__main__':
    print("=" * 60)
    print("LAXREE Product Training PDF Generator")
    print("=" * 60)
    
    pdfs = []
    
    print("\n1. Generating Electric Kettle PDF...")
    pdfs.append(generate_kettle_pdf())
    
    print("\n2. Generating Kettle Tray PDF...")
    pdfs.append(generate_kettle_tray_pdf())
    
    print("\n3. Generating Hotel Hangers PDF...")
    pdfs.append(generate_hanger_pdf())
    
    print("\n4. Generating RFID Door Lock PDF...")
    pdfs.append(generate_rfid_pdf())
    
    print("\n5. Generating Rollaway Bed PDF...")
    pdfs.append(generate_rollaway_bed_pdf())
    
    print("\n6. Generating Hotel Add-ons PDF...")
    pdfs.append(generate_addons_pdf())
    
    print("\n" + "=" * 60)
    print("All PDFs generated successfully!")
    print("=" * 60)
    for p in pdfs:
        size = os.path.getsize(p)
        print(f"  {os.path.basename(p)}: {size / 1024:.1f} KB")
