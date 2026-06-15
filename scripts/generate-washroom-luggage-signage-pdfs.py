#!/usr/bin/env python3
"""
LAXREE Product Training PDF Generator
Generates premium product training PDFs for:
1. Washroom Amenities
2. Luggage
3. Digital Signage
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


# ══════════════════════════════════════════════════════════════════════
# 1. WASHROOM AMENITIES PDF
# ══════════════════════════════════════════════════════════════════════

def generate_washroom_amenities_pdf():
    """Generate Washroom Amenities product training PDF."""
    # Palette - warm spa/sage-green
    ACCENT = colors.HexColor('#5a7a5a')
    TEXT_PRIMARY = colors.HexColor('#2a2e25')
    TEXT_MUTED = colors.HexColor('#7a7e72')
    BG_SURFACE = colors.HexColor('#e8ede5')

    s = make_styles(ACCENT, TEXT_PRIMARY, TEXT_MUTED)

    output_path = '/home/z/my-project/upload/Washroom Amenities.pdf'
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
    story.append(Paragraph('<b>Washroom Amenities</b>', ParagraphStyle(
        'CoverProduct', fontName='LiberationSerif', fontSize=28, leading=34,
        textColor=TEXT_PRIMARY, alignment=TA_CENTER, spaceAfter=8
    )))
    story.append(Paragraph('Premium Bathroom Solutions for Hotels', s['cover_subtitle']))
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
        'LAXREE Washroom Amenities transform the guest bathroom into a <b>five-star spa experience</b>. '
        'From the moment a guest steps onto an electronic weighing scale to the ritual of dispensing '
        'premium body wash from an elegant in-room dispenser, every touchpoint is designed to convey '
        'luxury, hygiene, and thoughtful hospitality.', s['body']))
    story.append(Spacer(1, 8))
    story.append(Paragraph(
        'Our comprehensive washroom range covers <b>four essential product categories</b>: Electronic '
        'Weighing Scales with certified precision, In-Room Soap Dispensers in dozens of style and '
        'capacity options, Premium Bathtubs that become the centerpiece of any luxury bathroom, and '
        'Amenity Tray Sets that tie the entire vanity together with coordinated elegance.', s['body']))
    story.append(Spacer(1, 8))
    story.append(Paragraph('<b>Why LAXREE Washroom Amenities Stand Out:</b>', s['h3']))
    bullets = [
        '<b>Four Product Categories:</b> Weighing Scales, Dispensers, Bathtubs, and Amenity Trays - complete bathroom solution',
        '<b>Certified Precision:</b> APPROVED-certified weighing scales with 0.1kg accuracy - trust and reliability',
        '<b>21 Dispenser Models:</b> From twin body wash/shampoo to quad dispensers - every bathroom configuration covered',
        '<b>Clawfoot Bathtubs:</b> Classic luxury with gold or silver claw feet - a statement piece',
        '<b>Coordinated Tray Sets:</b> Six material/color options from teal to dark wood - design consistency',
    ]
    for b in bullets:
        story.append(Paragraph(f'- {b}', s['bullet']))
    story.append(Spacer(1, 18))

    # ── Section 2: Product Range & Models ──
    story.append(Paragraph('<b>2. Product Range & Models</b>', s['h1']))
    story.append(Spacer(1, 8))
    story.append(Paragraph(
        'LAXREE offers a comprehensive washroom amenities range organized by product category. Each model is '
        'designed for specific hotel environments and design aesthetics.', s['body']))
    story.append(Spacer(1, 8))

    # Electronic Weighing Scales
    story.append(Paragraph('<b>Electronic Weighing Scales</b>', s['h2']))
    scale_data = [
        [Paragraph('<b>Model</b>', s['table_header']),
         Paragraph('<b>Top Material</b>', s['table_header']),
         Paragraph('<b>Display</b>', s['table_header']),
         Paragraph('<b>Key Feature</b>', s['table_header']),
         Paragraph('<b>Best For</b>', s['table_header'])],
        [Paragraph('LRWS-330', s['table_cell']), Paragraph('Clear Tempered Glass', s['table_cell']),
         Paragraph('LCD Backlit', s['table_cell']), Paragraph('APPROVED certified, 0.1kg precision', s['table_cell_left']),
         Paragraph('5-star rooms, premium suites', s['table_cell_left'])],
        [Paragraph('LRWS-329', s['table_cell']), Paragraph('Matte Light Gray Plastic', s['table_cell']),
         Paragraph('LCD Digital', s['table_cell']), Paragraph('Budget-friendly electronic', s['table_cell_left']),
         Paragraph('3-4 star hotels, budget rooms', s['table_cell_left'])],
        [Paragraph('LRWS-327', s['table_cell']), Paragraph('Round White Plastic', s['table_cell']),
         Paragraph('LCD Digital', s['table_cell']), Paragraph('Compact circular design', s['table_cell_left']),
         Paragraph('Small bathrooms, compact rooms', s['table_cell_left'])],
        [Paragraph('LRWS-331', s['table_cell']), Paragraph('Ultra-Slim Matte Black', s['table_cell']),
         Paragraph('LCD Digital', s['table_cell']), Paragraph('Contemporary, space-saving', s['table_cell_left']),
         Paragraph('Boutique hotels, modern design', s['table_cell_left'])],
    ]
    col_w1 = [CONTENT_W * 0.12, CONTENT_W * 0.20, CONTENT_W * 0.14, CONTENT_W * 0.26, CONTENT_W * 0.28]
    story.append(make_table(scale_data, col_w1, ACCENT, BG_SURFACE, s))
    story.append(Spacer(1, 14))

    # In-Room Soap Dispensers - Twin
    story.append(Paragraph('<b>In-Room Soap Dispensers - Twin Bottle</b>', s['h2']))
    twin_data = [
        [Paragraph('<b>Model</b>', s['table_header']),
         Paragraph('<b>Color/Style</b>', s['table_header']),
         Paragraph('<b>Contents</b>', s['table_header']),
         Paragraph('<b>Capacity</b>', s['table_header']),
         Paragraph('<b>Best For</b>', s['table_header'])],
        [Paragraph('LRWA-360', s['table_cell']), Paragraph('White w/ Black Pumps', s['table_cell']),
         Paragraph('Body Wash + Shampoo', s['table_cell_left']), Paragraph('400ml each', s['table_cell']),
         Paragraph('Standard rooms, clean look', s['table_cell_left'])],
        [Paragraph('LRWA-365', s['table_cell']), Paragraph('Amber-Tinted Translucent', s['table_cell']),
         Paragraph('Body Wash + Shampoo', s['table_cell_left']), Paragraph('400ml each', s['table_cell']),
         Paragraph('Spa resorts, shows liquid level', s['table_cell_left'])],
        [Paragraph('LRWA-362', s['table_cell']), Paragraph('Red Vibrant', s['table_cell']),
         Paragraph('Shampoo + Soap', s['table_cell_left']), Paragraph('360ml each', s['table_cell']),
         Paragraph('Boutique hotels, bold design', s['table_cell_left'])],
        [Paragraph('LRWA-361', s['table_cell']), Paragraph('Silver Metal/Chrome', s['table_cell']),
         Paragraph('Body Wash + Shampoo', s['table_cell_left']), Paragraph('380ml each', s['table_cell']),
         Paragraph('Luxury hotels, chrome finish', s['table_cell_left'])],
        [Paragraph('LRWA-387', s['table_cell']), Paragraph('White w/ Silver Pumps', s['table_cell']),
         Paragraph('Body Wash + Shampoo', s['table_cell_left']), Paragraph('260ml each', s['table_cell']),
         Paragraph('Compact rooms, smaller vanity', s['table_cell_left'])],
    ]
    story.append(make_table(twin_data, col_w1, ACCENT, BG_SURFACE, s))
    story.append(Spacer(1, 14))

    # In-Room Soap Dispensers - Single/Quad
    story.append(Paragraph('<b>In-Room Soap Dispensers - Single & Quad</b>', s['h2']))
    single_data = [
        [Paragraph('<b>Model</b>', s['table_header']),
         Paragraph('<b>Color/Style</b>', s['table_header']),
         Paragraph('<b>Contents</b>', s['table_header']),
         Paragraph('<b>Capacity</b>', s['table_header']),
         Paragraph('<b>Best For</b>', s['table_header'])],
        [Paragraph('LRWA-363', s['table_cell']), Paragraph('Black/Silver "HAND"', s['table_cell']),
         Paragraph('Hand Soap', s['table_cell_left']), Paragraph('300ml', s['table_cell']),
         Paragraph('Premium sink-side, hand wash', s['table_cell_left'])],
        [Paragraph('LRWA-359', s['table_cell']), Paragraph('Silver/Blue Translucent', s['table_cell']),
         Paragraph('Soap/Lotion', s['table_cell_left']), Paragraph('320ml', s['table_cell']),
         Paragraph('Mid-range rooms, level indicator', s['table_cell_left'])],
        [Paragraph('LRWA-386', s['table_cell']), Paragraph('White w/ Clear Front', s['table_cell']),
         Paragraph('Soap', s['table_cell_left']), Paragraph('280ml', s['table_cell']),
         Paragraph('Minimalist rooms, clean look', s['table_cell_left'])],
        [Paragraph('LRWA-364', s['table_cell']), Paragraph('Quad Silver Metal', s['table_cell']),
         Paragraph('Sh/Co/BW/Lotion', s['table_cell_left']), Paragraph('400ml each', s['table_cell']),
         Paragraph('Luxury suites, full amenity set', s['table_cell_left'])],
    ]
    story.append(make_table(single_data, col_w1, ACCENT, BG_SURFACE, s))
    story.append(Spacer(1, 14))

    # Bathtubs
    story.append(Paragraph('<b>Premium Bathtubs</b>', s['h2']))
    bath_data = [
        [Paragraph('<b>Model</b>', s['table_header']),
         Paragraph('<b>Body Color</b>', s['table_header']),
         Paragraph('<b>Claw Feet</b>', s['table_header']),
         Paragraph('<b>Style</b>', s['table_header']),
         Paragraph('<b>Best For</b>', s['table_header'])],
        [Paragraph('LRBT-311', s['table_cell']), Paragraph('Red/Burgundy Exterior', s['table_cell']),
         Paragraph('Gold Claw Feet', s['table_cell']), Paragraph('Classic Clawfoot', s['table_cell']),
         Paragraph('Heritage hotels, luxury suites', s['table_cell_left'])],
        [Paragraph('LRBT-312', s['table_cell']), Paragraph('White Body', s['table_cell']),
         Paragraph('Silver Claw Feet', s['table_cell']), Paragraph('Classic Clawfoot', s['table_cell']),
         Paragraph('Modern luxury, versatile fit', s['table_cell_left'])],
    ]
    story.append(make_table(bath_data, col_w1, ACCENT, BG_SURFACE, s))
    story.append(Spacer(1, 14))

    # Amenity Tray Sets
    story.append(Paragraph('<b>Amenity Tray Sets</b>', s['h2']))
    tray_data = [
        [Paragraph('<b>Model</b>', s['table_header']),
         Paragraph('<b>Color/Material</b>', s['table_header']),
         Paragraph('<b>Components</b>', s['table_header']),
         Paragraph('<b>Best For</b>', s['table_header'])],
        [Paragraph('LRAT-366', s['table_cell']), Paragraph('Teal', s['table_cell']),
         Paragraph('Trays, boxes, tissue holder, amenity holders', s['table_cell_left']),
         Paragraph('Coastal resorts, spa hotels', s['table_cell_left'])],
        [Paragraph('LRAT-367', s['table_cell']), Paragraph('Teal & Orange/Gold', s['table_cell']),
         Paragraph('Trays, boxes, tissue holders', s['table_cell_left']),
         Paragraph('Boutique hotels, warm tones', s['table_cell_left'])],
        [Paragraph('LRAT-368', s['table_cell']), Paragraph('Brown Wooden', s['table_cell']),
         Paragraph('Trays, boxes, tissue holders', s['table_cell_left']),
         Paragraph('Classic hotels, heritage style', s['table_cell_left'])],
        [Paragraph('LRAT-369', s['table_cell']), Paragraph('Brown & Beige Two-Tone Wood', s['table_cell']),
         Paragraph('Trays, boxes, tissue holders', s['table_cell_left']),
         Paragraph('Premium rooms, earthy warmth', s['table_cell_left'])],
        [Paragraph('LRAT-370', s['table_cell']), Paragraph('Light Wood (Beige/Tan)', s['table_cell']),
         Paragraph('Trays, boxes, tissue holders', s['table_cell_left']),
         Paragraph('Scandinavian, minimalist rooms', s['table_cell_left'])],
        [Paragraph('LRAT-371', s['table_cell']), Paragraph('Dark Wood', s['table_cell']),
         Paragraph('Trays, boxes, tissue holders', s['table_cell_left']),
         Paragraph('Executive suites, rich tones', s['table_cell_left'])],
    ]
    col_w3 = [CONTENT_W * 0.12, CONTENT_W * 0.22, CONTENT_W * 0.36, CONTENT_W * 0.30]
    story.append(make_table(tray_data, col_w3, ACCENT, BG_SURFACE, s))
    story.append(Spacer(1, 18))

    # ── Section 3: Materials & Design Philosophy ──
    story.append(Paragraph('<b>3. Materials & Design Philosophy</b>', s['h1']))
    story.append(Spacer(1, 8))

    story.append(Paragraph('<b>Dispenser Material Comparison</b>', s['h2']))
    mat_data = [
        [Paragraph('<b>Material</b>', s['table_header']),
         Paragraph('<b>Aesthetic</b>', s['table_header']),
         Paragraph('<b>Durability</b>', s['table_header']),
         Paragraph('<b>Maintenance</b>', s['table_header']),
         Paragraph('<b>Price Tier</b>', s['table_header'])],
        [Paragraph('White Plastic', s['table_cell_left']),
         Paragraph('Clean, classic, universal', s['table_cell_left']),
         Paragraph('Very good - stain-resistant', s['table_cell_left']),
         Paragraph('Easy wipe-down', s['table_cell_left']),
         Paragraph('Standard', s['table_cell'])],
        [Paragraph('Chrome/Silver Metal', s['table_cell_left']),
         Paragraph('Premium, reflective, luxury', s['table_cell_left']),
         Paragraph('Excellent - rust-resistant', s['table_cell_left']),
         Paragraph('Fingerprint-prone, polish needed', s['table_cell_left']),
         Paragraph('Premium', s['table_cell'])],
        [Paragraph('Amber Translucent', s['table_cell_left']),
         Paragraph('Warm, spa-like, organic', s['table_cell_left']),
         Paragraph('Good - UV-sensitive', s['table_cell_left']),
         Paragraph('Easy to monitor level', s['table_cell_left']),
         Paragraph('Mid-premium', s['table_cell'])],
        [Paragraph('Black/Silver', s['table_cell_left']),
         Paragraph('Contemporary, sophisticated', s['table_cell_left']),
         Paragraph('Excellent - hides wear', s['table_cell_left']),
         Paragraph('Low maintenance', s['table_cell_left']),
         Paragraph('Premium', s['table_cell'])],
    ]
    col_wm = [CONTENT_W * 0.18, CONTENT_W * 0.22, CONTENT_W * 0.20, CONTENT_W * 0.22, CONTENT_W * 0.18]
    story.append(make_table(mat_data, col_wm, ACCENT, BG_SURFACE, s))
    story.append(Spacer(1, 14))

    story.append(Paragraph('<b>Amenity Tray Material Comparison</b>', s['h2']))
    tray_mat_data = [
        [Paragraph('<b>Material</b>', s['table_header']),
         Paragraph('<b>Look</b>', s['table_header']),
         Paragraph('<b>Durability</b>', s['table_header']),
         Paragraph('<b>Maintenance</b>', s['table_header']),
         Paragraph('<b>Best Hotel Type</b>', s['table_header'])],
        [Paragraph('Teal Resin', s['table_cell_left']),
         Paragraph('Vibrant, coastal, fresh', s['table_cell_left']),
         Paragraph('Very good - water-resistant', s['table_cell_left']),
         Paragraph('Easy clean, no polishing', s['table_cell_left']),
         Paragraph('Resort, spa hotels', s['table_cell_left'])],
        [Paragraph('Light Wood', s['table_cell_left']),
         Paragraph('Natural, Scandinavian, airy', s['table_cell_left']),
         Paragraph('Good - needs sealing', s['table_cell_left']),
         Paragraph('Regular oiling/treatment', s['table_cell_left']),
         Paragraph('Boutique, minimalist', s['table_cell_left'])],
        [Paragraph('Dark Wood', s['table_cell_left']),
         Paragraph('Rich, executive, classic', s['table_cell_left']),
         Paragraph('Very good - hard-wearing', s['table_cell_left']),
         Paragraph('Polish periodically', s['table_cell_left']),
         Paragraph('5-star, heritage hotels', s['table_cell_left'])],
        [Paragraph('Two-Tone Wood', s['table_cell_left']),
         Paragraph('Warm, balanced, premium', s['table_cell_left']),
         Paragraph('Very good - lacquered', s['table_cell_left']),
         Paragraph('Low maintenance', s['table_cell_left']),
         Paragraph('4-5 star, versatile', s['table_cell_left'])],
    ]
    story.append(make_table(tray_mat_data, col_wm, ACCENT, BG_SURFACE, s))
    story.append(Spacer(1, 14))

    story.append(Paragraph('<b>Design Philosophy</b>', s['h2']))
    story.append(Paragraph(
        'Every LAXREE washroom amenity is designed with the belief that <b>the bathroom is the most '
        'personal space in a hotel room</b>. Guests form lasting impressions from the quality of the '
        'soap dispenser, the precision of the weighing scale, and the elegance of the amenity tray. '
        'Our design philosophy centers on three pillars: <b>Hygiene, Elegance, and Practicality</b>.', s['body']))
    story.append(Spacer(1, 6))
    story.append(Paragraph(
        'The clawfoot bathtub collection represents our heritage design language - combining <b>classic '
        'Victorian elegance</b> with modern manufacturing precision. The gold or silver claw feet are '
        'not merely decorative; they are engineered for stability and weight distribution, ensuring the '
        'tub remains level on any bathroom floor surface.', s['body']))
    story.append(Spacer(1, 6))
    story.append(Paragraph(
        'For dispensers, the translucent amber-tinted models (LRWA-365) reflect our <b>user-centric design</b> '
        'approach - housekeeping can visually monitor liquid levels without opening or handling the '
        'dispenser, reducing restocking time by up to 30%.', s['body']))
    story.append(Spacer(1, 18))

    # ── Section 4: Key Features & Benefits ──
    story.append(Paragraph('<b>4. Key Features & Benefits</b>', s['h1']))
    story.append(Spacer(1, 8))

    feat_data = [
        [Paragraph('<b>Feature</b>', s['table_header']),
         Paragraph('<b>Description</b>', s['table_header']),
         Paragraph('<b>Why It Matters</b>', s['table_header'])],
        [Paragraph('APPROVED Certification', s['table_cell']),
         Paragraph('LRWS-330 scale has official APPROVED certification stamp', s['table_cell_left']),
         Paragraph('Trust and compliance for commercial use; avoids guest disputes over weight accuracy', s['table_cell_left'])],
        [Paragraph('Tempered Glass Top', s['table_cell']),
         Paragraph('Premium scale top with anti-slip rubber feet', s['table_cell_left']),
         Paragraph('Safety, elegance, stability; tempered glass is 4x stronger than regular glass', s['table_cell_left'])],
        [Paragraph('Twin Dispenser System', s['table_cell']),
         Paragraph('Two-bottle system for Body Wash + Shampoo', s['table_cell_left']),
         Paragraph('Complete shower solution in one unit; reduces counter clutter and simplifies restocking', s['table_cell_left'])],
        [Paragraph('Quad Dispenser', s['table_cell']),
         Paragraph('Four-bottle silver metal unit (Sh/Co/BW/Lotion)', s['table_cell_left']),
         Paragraph('Full amenity suite for luxury suites; eliminates individual bottles, saves cost long-term', s['table_cell_left'])],
        [Paragraph('Translucent Level Indicator', s['table_cell']),
         Paragraph('Amber-tinted body shows liquid level visually', s['table_cell_left']),
         Paragraph('Housekeeping efficiency; prevents empty dispensers that cause guest complaints', s['table_cell_left'])],
        [Paragraph('Clawfoot Design', s['table_cell']),
         Paragraph('Classic bathtub with gold or silver claw feet', s['table_cell_left']),
         Paragraph('Iconic luxury statement; photographs beautifully for marketing and OTA listings', s['table_cell_left'])],
        [Paragraph('Coordinated Tray Sets', s['table_cell']),
         Paragraph('Matching trays, boxes, tissue holders, amenity holders', s['table_cell_left']),
         Paragraph('Design consistency across the vanity; professional, curated look guests appreciate', s['table_cell_left'])],
        [Paragraph('Compact Dispenser Models', s['table_cell']),
         Paragraph('LRWA-387 (260ml twin) and LRWA-386 (280ml single)', s['table_cell_left']),
         Paragraph('Fits smaller vanities without sacrificing function; ideal for city hotels', s['table_cell_left'])],
    ]
    col_wf = [CONTENT_W * 0.20, CONTENT_W * 0.38, CONTENT_W * 0.42]
    story.append(make_table(feat_data, col_wf, ACCENT, BG_SURFACE, s))
    story.append(Spacer(1, 18))

    # ── Section 5: Selling Strategy ──
    story.append(Paragraph('<b>5. Selling Strategy by Hotel Tier</b>', s['h1']))
    story.append(Spacer(1, 8))

    strategy_data = [
        [Paragraph('<b>Hotel Tier</b>', s['table_header']),
         Paragraph('<b>Recommended Products</b>', s['table_header']),
         Paragraph('<b>Pitch Angle</b>', s['table_header'])],
        [Paragraph('5-Star Luxury', s['table_cell_left']),
         Paragraph('LRWS-330, LRWA-364 Quad, LRBT-311 Gold, LRAT-371 Dark Wood', s['table_cell']),
         Paragraph('"A complete spa-grade bathroom experience - from certified scale to clawfoot tub"', s['table_cell_left'])],
        [Paragraph('5-Star Premium', s['table_cell_left']),
         Paragraph('LRWS-330, LRWA-361 Chrome Twin, LRBT-312 Silver, LRAT-369 Two-Tone', s['table_cell']),
         Paragraph('"Chrome and silver accents that match your modern luxury aesthetic perfectly"', s['table_cell_left'])],
        [Paragraph('4-Star Business', s['table_cell_left']),
         Paragraph('LRWS-329, LRWA-360 White Twin, LRAT-370 Light Wood', s['table_cell']),
         Paragraph('"Clean, professional, cost-efficient - eliminates individual bottle waste"', s['table_cell_left'])],
        [Paragraph('3-Star Budget', s['table_cell_left']),
         Paragraph('LRWS-329, LRWA-386 Single White, LRAT-366 Teal', s['table_cell']),
         Paragraph('"Dispensers cut amenity costs by 40-60% vs individual bottles while looking premium"', s['table_cell_left'])],
        [Paragraph('Boutique / Design', s['table_cell_left']),
         Paragraph('LRWS-331 Matte Black, LRWA-362 Red, LRWA-363 Black/Silver, LRAT-367 Teal+Gold', s['table_cell']),
         Paragraph('"Bold, Instagram-worthy bathroom design that guests photograph and share"', s['table_cell_left'])],
    ]
    col_w4 = [CONTENT_W * 0.16, CONTENT_W * 0.32, CONTENT_W * 0.52]
    story.append(make_table(strategy_data, col_w4, ACCENT, BG_SURFACE, s))
    story.append(Spacer(1, 12))

    story.append(Paragraph('<b>Bundle Strategy - Complete Washroom Solution</b>', s['h2']))
    story.append(Paragraph(
        'Always propose washroom amenities as a <b>complete bathroom package</b>: Weighing Scale + '
        'Dispenser Set + Amenity Tray Set. This bundling approach increases order value by 50-80% '
        'while ensuring design consistency across the entire bathroom. For luxury properties, add the '
        'clawfoot bathtub as the centerpiece of the pitch.', s['body']))
    story.append(Spacer(1, 6))
    story.append(Paragraph(
        '<b>Sales Tip:</b> Lead with the cost-savings angle for 3-4 star hotels: dispensers eliminate '
        'individual bottle costs (typically $2-4/room/day). For 5-star properties, lead with the design '
        'consistency angle: matching trays, dispensers, and tub create a cohesive luxury experience '
        'that justifies higher room rates.', s['callout']))
    story.append(Spacer(1, 18))

    # ── Section 6: Objection Handling ──
    story.append(Paragraph('<b>6. Objection Handling</b>', s['h1']))
    story.append(Spacer(1, 8))

    objections = [
        ('"Dispensers look cheap compared to individual bottles"',
         'Today\'s guests are increasingly eco-conscious and view refillable dispensers as a <b>sustainability statement</b>, not a cost-cutting measure. LAXREE dispensers are designed to look premium - the chrome metal (LRWA-361) and black/silver (LRWA-363) models are often mistaken for luxury accessories. Position it as: "Individual bottles create waste; dispensers show your commitment to sustainability without compromising on quality."'),
        ('"Our guests expect individual toiletry bottles"',
         'This perception is rapidly changing. Major luxury brands like Marriott, InterContinental, and Four Seasons have already switched to dispensers. LAXREE\'s premium dispenser designs make the transition seamless. Offer to do a <b>side-by-side test</b> in a few rooms - guest satisfaction scores typically remain the same or improve.'),
        ('"Electronic scales are unnecessary - guests don\'t use them"',
         'Data shows that 60-70% of business travelers use hotel scales during their stay. The APPROVED-certified LRWS-330 adds perceived value to the room at minimal cost. It\'s one of those amenities that guests notice <b>when it\'s missing</b> rather than when it\'s present - its absence creates complaints.'),
        ('"Clawfoot bathtubs are impractical and take too much space"',
         'Clawfoot tubs are not just bathtubs - they are <b>marketing assets</b>. Properties with statement bathtubs see 15-25% higher photography engagement on OTA listings, directly impacting booking rates. The LRBT-311 with gold claw feet becomes the hero image of any luxury bathroom. For space concerns, recommend the LRBT-312 which fits standard tub footprints.'),
        ('"Amenity tray sets are an extra expense we don\'t need"',
         'Amenity trays serve a critical function: they <b>organize the vanity</b> and prevent the cluttered look that drags down guest satisfaction scores. A coordinated tray set (LRAT-366 through LRAT-371) creates an immediate impression of thoughtfulness and attention to detail. The cost is minimal compared to the perceived value uplift.'),
        ('"We already have a supplier for these items"',
         'LAXREE offers the unique advantage of <b>complete bathroom coordination</b> - scales, dispensers, trays, and tubs all designed to work together aesthetically. Mixing suppliers creates visual inconsistency. Plus, our one-source solution simplifies procurement, reduces vendor management overhead, and often comes in at a lower total cost.'),
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
        'Based on the product video analysis, the LAXREE Washroom Amenities collection features a '
        '<b>comprehensive range of bathroom solutions</b> spanning four product categories. The video '
        'showcases each model in detail, highlighting material quality, design aesthetics, and '
        'optimal placement scenarios.', s['body']))
    story.append(Spacer(1, 6))
    story.append(Paragraph('<b>Key Visual Highlights from Video:</b>', s['h3']))
    video_points = [
        'LRWS-330 premium scale with clear tempered glass top and APPROVED certification stamp clearly visible',
        'LRWS-329 budget scale shown with matte gray plastic top - clean, functional design',
        'LRWS-327 compact round scale demonstrated in small bathroom setting',
        'LRWS-331 ultra-slim matte black scale featured in contemporary bathroom design',
        'Twin dispenser collection (LRWA-360/365/362/361/387) shown with different liquid fills and pump actions',
        'LRWA-364 quad silver metal dispenser revealed as the premium four-bottle solution',
        'LRWA-363 black/silver "HAND" dispenser demonstrated with hand soap dispensing',
        'LRBT-311 clawfoot bathtub in burgundy with gold claw feet shown as the luxury centerpiece',
        'LRBT-312 white clawfoot bathtub with silver feet demonstrated as the versatile classic',
        'Amenity tray sets (LRAT-366 to LRAT-371) displayed with full vanity arrangements showing coordinated look',
        'Complete bathroom scene with scale, dispensers, tray set, and tub working together as a unified design',
    ]
    for vp in video_points:
        story.append(Paragraph(f'- {vp}', s['bullet']))
    story.append(Spacer(1, 12))
    story.append(Paragraph(
        '<b>Sales Tip:</b> When presenting to hotel owners, always bring the LRWA-363 black/silver '
        '"HAND" dispenser and an amenity tray sample. Let them feel the pump action and see the '
        'coordinated look - the tactile and visual experience sells the entire range. For bathtub '
        'pitches, the LRBT-311 with gold claw feet is your hero product - place it front and center.', s['callout']))

    # Build PDF
    doc.build(story, onFirstPage=add_page_number, onLaterPages=add_page_number)
    print(f"Generated: {output_path}")
    size_kb = os.path.getsize(output_path) / 1024
    print(f"File size: {size_kb:.1f} KB")
    return output_path


# ══════════════════════════════════════════════════════════════════════
# 2. LUGGAGE PDF
# ══════════════════════════════════════════════════════════════════════

def generate_luggage_pdf():
    """Generate Luggage product training PDF."""
    # Palette - rich burgundy/gold
    ACCENT = colors.HexColor('#8b4513')
    TEXT_PRIMARY = colors.HexColor('#2a1e15')
    TEXT_MUTED = colors.HexColor('#8a7262')
    BG_SURFACE = colors.HexColor('#ede5dc')

    s = make_styles(ACCENT, TEXT_PRIMARY, TEXT_MUTED)

    output_path = '/home/z/my-project/upload/Luggage.pdf'
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
    story.append(Paragraph('<b>Luggage Trolleys & Bellman Carts</b>', ParagraphStyle(
        'CoverProduct', fontName='LiberationSerif', fontSize=26, leading=32,
        textColor=TEXT_PRIMARY, alignment=TA_CENTER, spaceAfter=8
    )))
    story.append(Paragraph('Premium Guest Luggage Transport Solutions', s['cover_subtitle']))
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
        'LAXREE Luggage Trolleys and Bellman Carts are the <b>first and last physical touchpoint</b> '
        'between a hotel and its guests. The moment a guest arrives and sees a gleaming gold-framed '
        'cart with "WELCOME" branding, their impression of the property is already being formed. '
        'This is not just a utility cart - it is a <b>brand ambassador on wheels</b>.', s['body']))
    story.append(Spacer(1, 8))
    story.append(Paragraph(
        'Our range includes three distinct models: the <b>Premium Cage-Style Bellman Cart</b> for '
        'grand hotel entrances, the <b>Compact Upright Cart</b> for tight spaces and modern hotels, '
        'and the <b>Standard Low-Profile Cart</b> for versatile everyday use. All three share the '
        'signature LAXREE design language: gold powder-coated steel frames, red platforms with '
        '"WELCOME" gold text, and noise-reducing rubber wheels.', s['body']))
    story.append(Spacer(1, 8))
    story.append(Paragraph('<b>Why LAXREE Luggage Trolleys Stand Out:</b>', s['h3']))
    bullets = [
        '<b>Three Form Factors:</b> Cage-style, Upright, and Low-Profile - one for every hotel layout',
        '<b>Signature Branding:</b> Gold "WELCOME" text on red platform - instant brand recognition',
        '<b>Gold Powder-Coated Frame:</b> Premium appearance with commercial durability',
        '<b>Noise-Reducing Rubber Wheels:</b> Silent operation for guest comfort at all hours',
        '<b>High Load Capacity:</b> 100-200 lbs range covers all luggage transport scenarios',
    ]
    for b in bullets:
        story.append(Paragraph(f'- {b}', s['bullet']))
    story.append(Spacer(1, 18))

    # ── Section 2: Product Range & Models ──
    story.append(Paragraph('<b>2. Product Range & Models</b>', s['h1']))
    story.append(Spacer(1, 8))
    story.append(Paragraph(
        'LAXREE offers three luggage trolley models, each designed for a specific operational '
        'environment and hotel aesthetic.', s['body']))
    story.append(Spacer(1, 8))

    story.append(Paragraph('<b>Luggage Trolleys / Bellman Carts</b>', s['h2']))
    trolley_data = [
        [Paragraph('<b>Model</b>', s['table_header']),
         Paragraph('<b>Style</b>', s['table_header']),
         Paragraph('<b>Frame</b>', s['table_header']),
         Paragraph('<b>Capacity</b>', s['table_header']),
         Paragraph('<b>Best For</b>', s['table_header'])],
        [Paragraph('LRLT-401', s['table_cell']), Paragraph('Cage-Style Bellman Cart', s['table_cell']),
         Paragraph('Gold metal, domed top w/ finial', s['table_cell_left']), Paragraph('150-200 lbs', s['table_cell']),
         Paragraph('Grand hotel entrances, luxury properties', s['table_cell_left'])],
        [Paragraph('LRLT-402', s['table_cell']), Paragraph('Compact Upright', s['table_cell']),
         Paragraph('Gold metal, vertical backrest', s['table_cell_left']), Paragraph('100-150 lbs', s['table_cell']),
         Paragraph('Tight spaces, modern hotels, elevators', s['table_cell_left'])],
        [Paragraph('LRLT-403', s['table_cell']), Paragraph('Standard Low-Profile', s['table_cell']),
         Paragraph('Gold metal, horizontal handle', s['table_cell_left']), Paragraph('120-180 lbs', s['table_cell']),
         Paragraph('Versatile, everyday use, all hotel types', s['table_cell_left'])],
    ]
    col_w1 = [CONTENT_W * 0.12, CONTENT_W * 0.18, CONTENT_W * 0.26, CONTENT_W * 0.14, CONTENT_W * 0.30]
    story.append(make_table(trolley_data, col_w1, ACCENT, BG_SURFACE, s))
    story.append(Spacer(1, 14))

    story.append(Paragraph('<b>Common Features Across All Models</b>', s['h2']))
    common_data = [
        [Paragraph('<b>Feature</b>', s['table_header']),
         Paragraph('<b>Specification</b>', s['table_header']),
         Paragraph('<b>Benefit</b>', s['table_header'])],
        [Paragraph('Frame Material', s['table_cell']),
         Paragraph('Powder-coated steel (gold finish)', s['table_cell_left']),
         Paragraph('Rust-resistant, premium appearance, scratch-tolerant', s['table_cell_left'])],
        [Paragraph('Platform Material', s['table_cell']),
         Paragraph('HDPE/Vinyl (red)', s['table_cell_left']),
         Paragraph('Non-slip, easy to clean, weather-resistant', s['table_cell_left'])],
        [Paragraph('Platform Branding', s['table_cell']),
         Paragraph('"WELCOME" gold text', s['table_cell_left']),
         Paragraph('Brand identity, guest welcome impression', s['table_cell_left'])],
        [Paragraph('Wheels', s['table_cell']),
         Paragraph('Rubber tires, noise-reducing', s['table_cell_left']),
         Paragraph('Silent operation, floor protection, smooth ride', s['table_cell_left'])],
        [Paragraph('Wheel Configuration', s['table_cell']),
         Paragraph('2 swivel + 2 fixed (LRLT-401/403)', s['table_cell_left']),
         Paragraph('Stable tracking with maneuverability', s['table_cell_left'])],
    ]
    col_wc = [CONTENT_W * 0.20, CONTENT_W * 0.35, CONTENT_W * 0.45]
    story.append(make_table(common_data, col_wc, ACCENT, BG_SURFACE, s))
    story.append(Spacer(1, 18))

    # ── Section 3: Materials & Design Philosophy ──
    story.append(Paragraph('<b>3. Materials & Design Philosophy</b>', s['h1']))
    story.append(Spacer(1, 8))

    story.append(Paragraph('<b>Cart Style Comparison</b>', s['h2']))
    style_data = [
        [Paragraph('<b>Style</b>', s['table_header']),
         Paragraph('<b>Visual Impact</b>', s['table_header']),
         Paragraph('<b>Maneuverability</b>', s['table_header']),
         Paragraph('<b>Space Efficiency</b>', s['table_header']),
         Paragraph('<b>Best Hotel Type</b>', s['table_header'])],
        [Paragraph('Cage-Style (LRLT-401)', s['table_cell_left']),
         Paragraph('Maximum - grand, iconic', s['table_cell_left']),
         Paragraph('Requires wide corridors', s['table_cell_left']),
         Paragraph('Low - needs storage space', s['table_cell_left']),
         Paragraph('5-star luxury, grand lobbies', s['table_cell_left'])],
        [Paragraph('Compact Upright (LRLT-402)', s['table_cell_left']),
         Paragraph('Moderate - modern, sleek', s['table_cell_left']),
         Paragraph('Excellent - tight turns', s['table_cell_left']),
         Paragraph('High - compact storage', s['table_cell_left']),
         Paragraph('City hotels, modern towers', s['table_cell_left'])],
        [Paragraph('Low-Profile (LRLT-403)', s['table_cell_left']),
         Paragraph('Good - classic, versatile', s['table_cell_left']),
         Paragraph('Good - stable tracking', s['table_cell_left']),
         Paragraph('Moderate - standard size', s['table_cell_left']),
         Paragraph('All hotel types, versatile', s['table_cell_left'])],
    ]
    col_ws = [CONTENT_W * 0.20, CONTENT_W * 0.20, CONTENT_W * 0.20, CONTENT_W * 0.20, CONTENT_W * 0.20]
    story.append(make_table(style_data, col_ws, ACCENT, BG_SURFACE, s))
    story.append(Spacer(1, 14))

    story.append(Paragraph('<b>Design Philosophy</b>', s['h2']))
    story.append(Paragraph(
        'The LAXREE luggage trolley is designed as a <b>brand ambassador</b>, not just a utility cart. '
        'The gold powder-coated frame and red platform with "WELCOME" text create an unmistakable '
        'visual identity that signals premium hospitality from the moment guests arrive at the porte-cochere.', s['body']))
    story.append(Spacer(1, 6))
    story.append(Paragraph(
        'The <b>cage-style design (LRLT-401)</b> with its domed top and finial represents the '
        'classic grand hotel tradition. The cage prevents luggage from falling during transport '
        'while the dome shape adds elegance. This model is for properties that want their luggage '
        'handling to be a <b>visible part of the luxury experience</b>.', s['body']))
    story.append(Spacer(1, 6))
    story.append(Paragraph(
        'The <b>compact upright (LRLT-402)</b> was designed for modern city hotels where space is '
        'at a premium. Its vertical backrest and ergonomic handle allow bellstaff to navigate tight '
        'elevators and narrow corridors with ease, while still maintaining the signature gold and red '
        'brand identity.', s['body']))
    story.append(Spacer(1, 18))

    # ── Section 4: Key Features & Benefits ──
    story.append(Paragraph('<b>4. Key Features & Benefits</b>', s['h1']))
    story.append(Spacer(1, 8))

    feat_data = [
        [Paragraph('<b>Feature</b>', s['table_header']),
         Paragraph('<b>Description</b>', s['table_header']),
         Paragraph('<b>Why It Matters</b>', s['table_header'])],
        [Paragraph('Gold Powder-Coated Frame', s['table_cell']),
         Paragraph('Steel frame with gold powder coating finish', s['table_cell_left']),
         Paragraph('Premium appearance that matches luxury hotel aesthetics; more durable than paint', s['table_cell_left'])],
        [Paragraph('"WELCOME" Gold Text', s['table_cell']),
         Paragraph('Branded gold text on red platform', s['table_cell_left']),
         Paragraph('Reinforces brand identity; creates positive first/last impression for guests', s['table_cell_left'])],
        [Paragraph('Red HDPE/Vinyl Platform', s['table_cell']),
         Paragraph('Non-slip red platform surface', s['table_cell_left']),
         Paragraph('Luggage stays in place during transport; easy to wipe clean; weather-resistant', s['table_cell_left'])],
        [Paragraph('Rubber Tires', s['table_cell']),
         Paragraph('Noise-reducing rubber wheels on all models', s['table_cell_left']),
         Paragraph('Silent operation preserves guest peace; protects marble and wood floors from damage', s['table_cell_left'])],
        [Paragraph('Domed Cage Top (LRLT-401)', s['table_cell']),
         Paragraph('Cage with dome and finial ornament', s['table_cell_left']),
         Paragraph('Prevents luggage fall; iconic silhouette signals luxury; decorative finial adds grandeur', s['table_cell_left'])],
        [Paragraph('Ergonomic Handle (LRLT-402)', s['table_cell']),
         Paragraph('Vertical backrest with comfortable grip', s['table_cell_left']),
         Paragraph('Staff comfort during long shifts; better control in tight spaces; professional posture', s['table_cell_left'])],
        [Paragraph('Swivel + Fixed Wheels', s['table_cell']),
         Paragraph('2 swivel + 2 fixed wheel configuration', s['table_cell_left']),
         Paragraph('Stable straight-line tracking with easy turning; prevents cart from drifting', s['table_cell_left'])],
    ]
    col_wf = [CONTENT_W * 0.22, CONTENT_W * 0.36, CONTENT_W * 0.42]
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
         Paragraph('LRLT-401 Cage-Style', s['table_cell']),
         Paragraph('"The bellman cart that matches the grandeur of your lobby - it\'s not just transport, it\'s a red carpet experience"', s['table_cell_left'])],
        [Paragraph('5-Star Modern', s['table_cell_left']),
         Paragraph('LRLT-402 Compact Upright', s['table_cell']),
         Paragraph('"Designed for contemporary towers - sleek, maneuverable, and still makes a statement"', s['table_cell_left'])],
        [Paragraph('4-Star Business', s['table_cell_left']),
         Paragraph('LRLT-403 Low-Profile', s['table_cell']),
         Paragraph('"The workhorse cart that looks professional and handles any luggage load reliably"', s['table_cell_left'])],
        [Paragraph('3-Star / Airport', s['table_cell_left']),
         Paragraph('LRLT-403 Low-Profile', s['table_cell']),
         Paragraph('"Maximum durability at the best value - built for high-frequency daily use"', s['table_cell_left'])],
        [Paragraph('Resort / Heritage', s['table_cell_left']),
         Paragraph('LRLT-401 Cage-Style', s['table_cell']),
         Paragraph('"The classic bellman cart that complements your property\'s timeless character"', s['table_cell_left'])],
    ]
    col_w4 = [CONTENT_W * 0.18, CONTENT_W * 0.24, CONTENT_W * 0.58]
    story.append(make_table(strategy_data, col_w4, ACCENT, BG_SURFACE, s))
    story.append(Spacer(1, 12))

    story.append(Paragraph('<b>Bundle Strategy - Complete Arrival Experience</b>', s['h2']))
    story.append(Paragraph(
        'Always propose luggage trolleys as part of the <b>complete arrival experience</b>: Bellman '
        'Cart + Lobby Dustbin + Stanchions + Digital Signage. This creates a coordinated look from '
        'porte-cochere to reception. For properties with long corridors, recommend additional carts '
        'positioned at elevator banks on each floor.', s['body']))
    story.append(Spacer(1, 6))
    story.append(Paragraph(
        '<b>Sales Tip:</b> When presenting, always ask about the hotel\'s lobby layout first. If they '
        'have wide corridors and a grand entrance, the LRLT-401 cage-style is your easy sell. If they '
        'mention tight elevators or modern tower design, immediately pivot to the LRLT-402 compact '
        'upright. The key is matching the cart to the architecture, not the budget.', s['callout']))
    story.append(Spacer(1, 18))

    # ── Section 6: Objection Handling ──
    story.append(Paragraph('<b>6. Objection Handling</b>', s['h1']))
    story.append(Spacer(1, 8))

    objections = [
        ('"Our current carts work fine - why switch?"',
         'Standard utility carts serve a function but send the wrong message about your property. LAXREE carts with their gold frame and "WELCOME" branding transform luggage handling from a <b>back-of-house operation</b> into a front-of-house experience. The visual difference alone justifies the investment - guests photograph and share these moments.'),
        ('"Gold-framed carts are too flashy for our property"',
         'The gold powder-coating is designed to complement warm hotel interiors, not overwhelm them. For properties with cooler design palettes, the gold acts as a <b>warm accent</b> that adds character. If the GM is concerned, show the LRLT-403 low-profile model - its understated design delivers the same quality in a more restrained package.'),
        ('"Cage-style carts are too bulky for our elevators"',
         'That\'s exactly why we offer the LRLT-402 compact upright - designed specifically for <b>tight elevator cabins and narrow corridors</b>. It maintains the same gold and red brand identity at half the footprint. We recommend a mixed fleet: one LRLT-401 for the grand entrance plus two LRLT-402 for floor service.'),
        ('"Rubber wheels wear out quickly"',
         'LAXREE uses <b>commercial-grade solid rubber tires</b> rated for 50,000+ rotations under load. Unlike pneumatic tires that go flat or cheap rubber that cracks, our wheels maintain their shape and noise-reduction properties for years. Replacement wheels are also available as a cost-effective spare part.'),
        ('"The red platform won\'t match our interior"',
         'The red platform is actually a strategic design choice - it creates <b>high visibility</b> for safety in busy lobbies and is traditional in the hospitality industry. The gold "WELCOME" text on red is an internationally recognized symbol of hotel service. That said, we can discuss custom platform colors for bulk orders of 10+ units.'),
        ('"We can\'t justify the cost for just luggage transport"',
         'Think of it as <b>mobile branding</b>. Every time a bellman rolls a LAXREE cart through the lobby, it reinforces the hotel\'s commitment to quality. Properties report that branded carts improve guest perception scores by 5-10% in the "arrival experience" category, which directly impacts review ratings and repeat bookings.'),
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
        'Based on the product video analysis, the LAXREE Luggage Trolley collection features three '
        '<b>distinct bellman cart designs</b> built on a common platform of gold powder-coated steel '
        'and red HDPE platforms. The video showcases each model in operation, highlighting '
        'maneuverability, load capacity, and visual impact.', s['body']))
    story.append(Spacer(1, 6))
    story.append(Paragraph('<b>Key Visual Highlights from Video:</b>', s['h3']))
    video_points = [
        'LRLT-401 cage-style cart shown with full cage frame, domed top, and decorative finial ornament',
        'Gold powder-coated steel frame gleaming under lobby lighting - premium appearance confirmed',
        'Red HDPE platform with "WELCOME" gold text clearly visible from multiple angles',
        'Rubber wheel demonstration showing smooth, silent operation on marble and carpet surfaces',
        'LRLT-402 compact upright cart navigating tight elevator cabin with ease',
        'LRLT-402 ergonomic handle grip demonstrated - comfortable for extended bellstaff shifts',
        'LRLT-403 low-profile cart shown transporting multiple large suitcases simultaneously',
        '2 swivel + 2 fixed wheel configuration demonstrated with smooth turning and straight tracking',
        'All three models lined up side-by-side showing the cohesive LAXREE design language',
        'Bellstaff loading and unloading luggage demonstrating practical daily use scenarios',
    ]
    for vp in video_points:
        story.append(Paragraph(f'- {vp}', s['bullet']))
    story.append(Spacer(1, 12))
    story.append(Paragraph(
        '<b>Sales Tip:</b> The most powerful sales moment is the side-by-side comparison. If possible, '
        'bring a competitor\'s standard utility cart and park it next to the LRLT-401. The visual '
        'contrast is dramatic - the gold frame and red "WELCOME" platform immediately communicates '
        'premium hospitality. This comparison closes deals.', s['callout']))

    # Build PDF
    doc.build(story, onFirstPage=add_page_number, onLaterPages=add_page_number)
    print(f"Generated: {output_path}")
    size_kb = os.path.getsize(output_path) / 1024
    print(f"File size: {size_kb:.1f} KB")
    return output_path


# ══════════════════════════════════════════════════════════════════════
# 3. DIGITAL SIGNAGE PDF
# ══════════════════════════════════════════════════════════════════════

def generate_digital_signage_pdf():
    """Generate Digital Signage product training PDF."""
    # Palette - sleek dark tech / deep navy
    ACCENT = colors.HexColor('#2c3e6b')
    TEXT_PRIMARY = colors.HexColor('#1e2030')
    TEXT_MUTED = colors.HexColor('#6b7085')
    BG_SURFACE = colors.HexColor('#e0e3ea')

    s = make_styles(ACCENT, TEXT_PRIMARY, TEXT_MUTED)

    output_path = '/home/z/my-project/upload/Digital Signage.pdf'
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
    story.append(Paragraph('<b>Digital Signage</b>', ParagraphStyle(
        'CoverProduct', fontName='LiberationSerif', fontSize=28, leading=34,
        textColor=TEXT_PRIMARY, alignment=TA_CENTER, spaceAfter=8
    )))
    story.append(Paragraph('Smart Display Solutions for Modern Hotels', s['cover_subtitle']))
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
        'LAXREE Digital Signage transforms hotel communication from static printed signs to <b>dynamic, '
        'programmable, revenue-generating display systems</b>. In an era where guests expect digital '
        'experiences, paper menus and printed event boards feel outdated. LAXREE digital signage brings '
        'hotels into the modern age with commercial-grade displays designed for 24/7 operation.', s['body']))
    story.append(Spacer(1, 8))
    story.append(Paragraph(
        'Our range spans <b>four installation categories</b>: Freestanding Totems for grand lobbies, '
        'T-Stand displays for elegant floor positioning, Portable Easels for events and conferences, '
        'and Wall-Hanging displays for permanent installations. With sizes from 32" to 55" and '
        'brightness ratings up to 500 nits, there is a LAXREE digital signage solution for every '
        'hotel space and budget.', s['body']))
    story.append(Spacer(1, 8))
    story.append(Paragraph('<b>Why LAXREE Digital Signage Stands Out:</b>', s['h3']))
    bullets = [
        '<b>Four Mounting Categories:</b> Totem, T-Stand, Easel, Wall Hanging - every position covered',
        '<b>Commercial-Grade 24/7:</b> 50,000-hour lifespan rated for continuous operation',
        '<b>Integrated Android Media Player:</b> No external device needed - plug and play content',
        '<b>Cloud CMS Optional:</b> Remote content management across multiple properties',
        '<b>3-Year Warranty:</b> Industry-leading warranty on all digital signage products',
    ]
    for b in bullets:
        story.append(Paragraph(f'- {b}', s['bullet']))
    story.append(Spacer(1, 18))

    # ── Section 2: Product Range & Models ──
    story.append(Paragraph('<b>2. Product Range & Models</b>', s['h1']))
    story.append(Spacer(1, 8))
    story.append(Paragraph(
        'LAXREE offers eight digital signage models across four installation categories, each designed '
        'for specific hotel spaces and communication needs.', s['body']))
    story.append(Spacer(1, 8))

    # Totem Series
    story.append(Paragraph('<b>Totem Series - Freestanding</b>', s['h2']))
    totem_data = [
        [Paragraph('<b>Model</b>', s['table_header']),
         Paragraph('<b>Screen</b>', s['table_header']),
         Paragraph('<b>Resolution</b>', s['table_header']),
         Paragraph('<b>Brightness</b>', s['table_header']),
         Paragraph('<b>Best For</b>', s['table_header'])],
        [Paragraph('Totem 43"', s['table_cell']), Paragraph('43" Full HD', s['table_cell']),
         Paragraph('1920 x 1080', s['table_cell']), Paragraph('500 nits', s['table_cell']),
         Paragraph('Lobbies, reception areas', s['table_cell_left'])],
        [Paragraph('Totem 50"', s['table_cell']), Paragraph('50" Full HD', s['table_cell']),
         Paragraph('1920 x 1080', s['table_cell']), Paragraph('500 nits', s['table_cell']),
         Paragraph('Large lobbies, conference centers', s['table_cell_left'])],
        [Paragraph('Totem 55"', s['table_cell']), Paragraph('55" Full HD', s['table_cell']),
         Paragraph('1920 x 1080', s['table_cell']), Paragraph('500 nits', s['table_cell']),
         Paragraph('Grand lobbies, ballroom entrances', s['table_cell_left'])],
    ]
    col_w1 = [CONTENT_W * 0.14, CONTENT_W * 0.18, CONTENT_W * 0.20, CONTENT_W * 0.16, CONTENT_W * 0.32]
    story.append(make_table(totem_data, col_w1, ACCENT, BG_SURFACE, s))
    story.append(Spacer(1, 10))

    story.append(Paragraph('<i>Totem Common Specs: 4000:1 contrast, 178-degree viewing angle, HDMI/USB/WiFi, '
                           'anti-glare glass, black powder-coated steel base, integrated wheels</i>', s['body']))
    story.append(Spacer(1, 14))

    # T Stand
    story.append(Paragraph('<b>T Stand - Freestanding</b>', s['h2']))
    tstand_data = [
        [Paragraph('<b>Model</b>', s['table_header']),
         Paragraph('<b>Screen</b>', s['table_header']),
         Paragraph('<b>Resolution</b>', s['table_header']),
         Paragraph('<b>Brightness</b>', s['table_header']),
         Paragraph('<b>Best For</b>', s['table_header'])],
        [Paragraph('T Stand 32"', s['table_cell']), Paragraph('32" Full HD', s['table_cell']),
         Paragraph('1920 x 1080', s['table_cell']), Paragraph('450 nits', s['table_cell']),
         Paragraph('Elevator banks, restaurant entrances, corridors', s['table_cell_left'])],
    ]
    story.append(make_table(tstand_data, col_w1, ACCENT, BG_SURFACE, s))
    story.append(Spacer(1, 10))

    story.append(Paragraph('<i>T Stand Features: Slim vertical profile, black aluminum construction, fixed base, '
                           'HDMI/USB/WiFi connectivity</i>', s['body']))
    story.append(Spacer(1, 14))

    # Easel
    story.append(Paragraph('<b>Easel - Portable</b>', s['h2']))
    easel_data = [
        [Paragraph('<b>Model</b>', s['table_header']),
         Paragraph('<b>Screen</b>', s['table_header']),
         Paragraph('<b>Resolution</b>', s['table_header']),
         Paragraph('<b>Weight</b>', s['table_header']),
         Paragraph('<b>Best For</b>', s['table_header'])],
        [Paragraph('Easel 32"', s['table_cell']), Paragraph('32" Full HD', s['table_cell']),
         Paragraph('1920 x 1080', s['table_cell']), Paragraph('~15kg', s['table_cell']),
         Paragraph('Events, conferences, weddings, pop-up displays', s['table_cell_left'])],
    ]
    story.append(make_table(easel_data, col_w1, ACCENT, BG_SURFACE, s))
    story.append(Spacer(1, 10))

    story.append(Paragraph('<i>Easel Features: A-frame foldable metal stand, 450 nits brightness, '
                           'lightweight portable design, 450 nits, HDMI/USB/WiFi</i>', s['body']))
    story.append(Spacer(1, 14))

    # Wall Hanging
    story.append(Paragraph('<b>Wall Hanging Series - Wall-Mounted</b>', s['h2']))
    wall_data = [
        [Paragraph('<b>Model</b>', s['table_header']),
         Paragraph('<b>Screen</b>', s['table_header']),
         Paragraph('<b>Resolution</b>', s['table_header']),
         Paragraph('<b>Brightness</b>', s['table_header']),
         Paragraph('<b>Best For</b>', s['table_header'])],
        [Paragraph('Wall Hanging 32"', s['table_cell']), Paragraph('32" Full HD', s['table_cell']),
         Paragraph('1920 x 1080', s['table_cell']), Paragraph('400 nits', s['table_cell']),
         Paragraph('Elevator interiors, corridors, small spaces', s['table_cell_left'])],
        [Paragraph('Wall Hanging 43"', s['table_cell']), Paragraph('43" Full HD', s['table_cell']),
         Paragraph('1920 x 1080', s['table_cell']), Paragraph('400 nits', s['table_cell']),
         Paragraph('Conference rooms, restaurant menus, reception', s['table_cell_left'])],
        [Paragraph('Wall Hanging 43" Glass', s['table_cell']), Paragraph('43" Full HD', s['table_cell']),
         Paragraph('1920 x 1080', s['table_cell']), Paragraph('450 nits', s['table_cell']),
         Paragraph('Premium spaces, anti-reflective, high-visibility', s['table_cell_left'])],
    ]
    story.append(make_table(wall_data, col_w1, ACCENT, BG_SURFACE, s))
    story.append(Spacer(1, 10))

    story.append(Paragraph('<i>Wall Hanging Features: Ultra-slim profile (~2.5cm), VESA 200x200 bracket, '
                           'HDMI/USB/WiFi. Glass Screen variant has tempered glass front with anti-reflective coating.</i>', s['body']))
    story.append(Spacer(1, 18))

    # ── Section 3: Materials & Design Philosophy ──
    story.append(Paragraph('<b>3. Materials & Design Philosophy</b>', s['h1']))
    story.append(Spacer(1, 8))

    story.append(Paragraph('<b>Installation Category Comparison</b>', s['h2']))
    cat_data = [
        [Paragraph('<b>Category</b>', s['table_header']),
         Paragraph('<b>Mobility</b>', s['table_header']),
         Paragraph('<b>Visual Impact</b>', s['table_header']),
         Paragraph('<b>Space Required</b>', s['table_header']),
         Paragraph('<b>Best Use</b>', s['table_header'])],
        [Paragraph('Totem (Freestanding)', s['table_cell_left']),
         Paragraph('Wheels - repositionable', s['table_cell_left']),
         Paragraph('Maximum - grand presence', s['table_cell_left']),
         Paragraph('Large - floor footprint', s['table_cell_left']),
         Paragraph('Grand lobbies, primary signage', s['table_cell_left'])],
        [Paragraph('T-Stand (Freestanding)', s['table_cell_left']),
         Paragraph('Fixed base - semi-permanent', s['table_cell_left']),
         Paragraph('Good - slim profile', s['table_cell_left']),
         Paragraph('Moderate - vertical only', s['table_cell_left']),
         Paragraph('Secondary displays, wayfinding', s['table_cell_left'])],
        [Paragraph('Easel (Portable)', s['table_cell_left']),
         Paragraph('Foldable - fully portable', s['table_cell_left']),
         Paragraph('Moderate - event-focused', s['table_cell_left']),
         Paragraph('Minimal - temporary setup', s['table_cell_left']),
         Paragraph('Events, conferences, temporary', s['table_cell_left'])],
        [Paragraph('Wall Hanging (Mounted)', s['table_cell_left']),
         Paragraph('Fixed - permanent install', s['table_cell_left']),
         Paragraph('Good - integrated into wall', s['table_cell_left']),
         Paragraph('None - wall mounted', s['table_cell_left']),
         Paragraph('Permanent displays, menus', s['table_cell_left'])],
    ]
    col_wc = [CONTENT_W * 0.18, CONTENT_W * 0.18, CONTENT_W * 0.20, CONTENT_W * 0.20, CONTENT_W * 0.24]
    story.append(make_table(cat_data, col_wc, ACCENT, BG_SURFACE, s))
    story.append(Spacer(1, 14))

    story.append(Paragraph('<b>Design Philosophy</b>', s['h2']))
    story.append(Paragraph(
        'LAXREE digital signage is designed with the principle that <b>technology should enhance '
        'hospitality, not intrude upon it</b>. Our displays blend into hotel environments with '
        'matte black aluminum and steel construction that complements rather than competes with '
        'interior design.', s['body']))
    story.append(Spacer(1, 6))
    story.append(Paragraph(
        'The <b>Totem series</b> represents our flagship product line - designed to be the digital '
        'equivalent of a grand hotel directory. The integrated wheels allow repositioning for events, '
        'while the anti-glare glass ensures readability even in brightly lit lobbies with floor-to-ceiling '
        'windows. The black powder-coated steel base provides stability without visual bulk.', s['body']))
    story.append(Spacer(1, 6))
    story.append(Paragraph(
        'The <b>Wall Hanging Glass Screen (43")</b> is our premium variant - the tempered glass front '
        'with anti-reflective coating produces colors that appear to float on the wall. This model is '
        'for properties where the display itself must be a <b>design element</b>, not just a functional screen.', s['body']))
    story.append(Spacer(1, 18))

    # ── Section 4: Key Features & Benefits ──
    story.append(Paragraph('<b>4. Key Features & Benefits</b>', s['h1']))
    story.append(Spacer(1, 8))

    feat_data = [
        [Paragraph('<b>Feature</b>', s['table_header']),
         Paragraph('<b>Description</b>', s['table_header']),
         Paragraph('<b>Why It Matters</b>', s['table_header'])],
        [Paragraph('Commercial-Grade 24/7', s['table_cell']),
         Paragraph('Rated for continuous 24/7 operation, 50,000-hour lifespan', s['table_cell_left']),
         Paragraph('Consumer TVs fail within months in commercial use; LAXREE displays are built to last', s['table_cell_left'])],
        [Paragraph('Integrated Android Player', s['table_cell']),
         Paragraph('Built-in Android media player - no external device needed', s['table_cell_left']),
         Paragraph('Plug and play; eliminates cost and complexity of external media players', s['table_cell_left'])],
        [Paragraph('Cloud CMS Optional', s['table_cell']),
         Paragraph('Remote content management system available', s['table_cell_left']),
         Paragraph('Update content across all displays from one dashboard; essential for multi-property groups', s['table_cell_left'])],
        [Paragraph('500 Nits Brightness', s['table_cell']),
         Paragraph('High-brightness display visible in well-lit environments', s['table_cell_left']),
         Paragraph('Readable even in lobby areas with natural sunlight; consumer TVs are only 250-300 nits', s['table_cell_left'])],
        [Paragraph('Anti-Glare Glass', s['table_cell']),
         Paragraph('Totem series features anti-glare tempered glass front', s['table_cell_left']),
         Paragraph('Reduces reflections from lobby lighting; ensures readability from all angles', s['table_cell_left'])],
        [Paragraph('178-Degree Viewing', s['table_cell']),
         Paragraph('Wide viewing angle on all models', s['table_cell_left']),
         Paragraph('Content visible from any position in the lobby; no "sweet spot" limitation', s['table_cell_left'])],
        [Paragraph('Integrated Wheels (Totem)', s['table_cell']),
         Paragraph('Wheels built into totem base for repositioning', s['table_cell_left']),
         Paragraph('Move displays for events, seasonal layouts, or renovation without tools', s['table_cell_left'])],
        [Paragraph('Ultra-Slim Profile', s['table_cell']),
         Paragraph('Wall Hanging models are ~2.5cm deep', s['table_cell_left']),
         Paragraph('Looks like a framed picture, not a bulky screen; VESA 200x200 for easy mounting', s['table_cell_left'])],
        [Paragraph('3-Year Warranty', s['table_cell']),
         Paragraph('Industry-leading warranty on all digital signage products', s['table_cell_left']),
         Paragraph('Peace of mind; consumer TVs have 1-year warranty and no commercial coverage', s['table_cell_left'])],
    ]
    col_wf = [CONTENT_W * 0.20, CONTENT_W * 0.36, CONTENT_W * 0.44]
    story.append(make_table(feat_data, col_wf, ACCENT, BG_SURFACE, s))
    story.append(Spacer(1, 18))

    # ── Section 5: Selling Strategy ──
    story.append(Paragraph('<b>5. Selling Strategy by Hotel Tier</b>', s['h1']))
    story.append(Spacer(1, 8))

    strategy_data = [
        [Paragraph('<b>Hotel Tier</b>', s['table_header']),
         Paragraph('<b>Recommended Products</b>', s['table_header']),
         Paragraph('<b>Pitch Angle</b>', s['table_header'])],
        [Paragraph('5-Star Luxury', s['table_cell_left']),
         Paragraph('Totem 55" + Wall Hanging 43" Glass', s['table_cell']),
         Paragraph('"A digital concierge that matches your lobby\'s grandeur - the glass screen model is a work of art"', s['table_cell_left'])],
        [Paragraph('5-Star Modern', s['table_cell_left']),
         Paragraph('Totem 50" + T-Stand 32" per floor', s['table_cell']),
         Paragraph('"Sleek, programmable wayfinding that replaces printed signs forever"', s['table_cell_left'])],
        [Paragraph('4-Star Business', s['table_cell_left']),
         Paragraph('Totem 43" + Wall Hanging 43"', s['table_cell']),
         Paragraph('"Digital event boards and menu displays that update in real-time - no more printing costs"', s['table_cell_left'])],
        [Paragraph('3-Star / Airport', s['table_cell_left']),
         Paragraph('Wall Hanging 32" + Easel 32"', s['table_cell']),
         Paragraph('"Affordable digital displays that eliminate ongoing printing expenses"', s['table_cell_left'])],
        [Paragraph('Resort / Conference', s['table_cell_left']),
         Paragraph('Totem 55" + Easel 32" (multiple)', s['table_cell']),
         Paragraph('"Grand entrance signage plus portable event displays - one system for every occasion"', s['table_cell_left'])],
    ]
    col_w4 = [CONTENT_W * 0.16, CONTENT_W * 0.28, CONTENT_W * 0.56]
    story.append(make_table(strategy_data, col_w4, ACCENT, BG_SURFACE, s))
    story.append(Spacer(1, 12))

    story.append(Paragraph('<b>Bundle Strategy - Digital Signage Network</b>', s['h2']))
    story.append(Paragraph(
        'Always propose digital signage as a <b>network, not individual units</b>: One Totem for the main '
        'lobby, Wall Hanging displays at elevator banks and restaurant entrances, and Easels for '
        'event spaces. This network approach increases order value by 3-5x while providing a '
        'cohesive digital experience. Add the Cloud CMS to enable centralized content management.', s['body']))
    story.append(Spacer(1, 6))
    story.append(Paragraph(
        '<b>Sales Tip:</b> Always calculate the <b>printing cost savings</b> for the client. A typical '
        '4-star hotel spends $3,000-8,000/year on printed menus, event boards, wayfinding signs, '
        'and promotional materials. Show them that digital signage pays for itself within 12-18 months '
        'through eliminated printing costs alone. Then add the revenue from in-house advertising.', s['callout']))
    story.append(Spacer(1, 18))

    # ── Section 6: Objection Handling ──
    story.append(Paragraph('<b>6. Objection Handling</b>', s['h1']))
    story.append(Spacer(1, 8))

    objections = [
        ('"Consumer TVs are much cheaper - why pay more for commercial displays?"',
         'Consumer TVs are not rated for 24/7 operation. They <b>overheat and fail</b> within 6-12 months '
         'of continuous use. LAXREE commercial displays are built with industrial-grade components, '
         'advanced thermal management, and carry a 3-year commercial warranty. A $500 consumer TV that '
         'fails every 8 months costs more in replacements and downtime than a LAXREE display that runs '
         'reliably for 5+ years.'),
        ('"Our staff isn\'t technical enough to manage digital content"',
         'That\'s exactly why we offer the <b>Cloud CMS option</b>. It\'s designed for non-technical users - '
         'drag-and-drop content scheduling, pre-built templates for hotel use cases (menus, events, '
         'wayfinding), and remote management from any web browser. Your marketing team can update all '
         'displays across the property in minutes without touching a single display.'),
        ('"Digital signage seems unnecessary - printed signs work fine"',
         'Printed signs are static, expensive to update, and look dated the moment they\'re printed. '
         'Digital signage enables <b>real-time updates</b>: change restaurant menus instantly, display '
         'live event schedules, promote spa packages during low-occupancy periods, and show weather '
         'and flight information. The average hotel recovers the investment within 18 months through '
         'printing cost elimination and incremental revenue from in-house advertising.'),
        ('"The displays will look out of place in our heritage property"',
         'The LAXREE design philosophy is <b>technology that respects architecture</b>. Our matte black '
         'frames and anti-glare glass blend discreetly into any interior. For heritage properties, the '
        'Wall Hanging models with their ultra-slim profile look like elegant framed displays rather '
         'than technology intrusions. Several heritage hotels have installed our totems and reported '
         'that guests appreciate the modern convenience within the classic setting.'),
        ('"What happens if a display breaks?"',
         'All LAXREE digital signage products carry a <b>3-year commercial warranty</b> - the longest '
         'in the industry. Our support team provides remote diagnostics and on-site service. The '
         'integrated Android media player eliminates the most common failure point (external devices), '
         'and our displays are built with commercial-grade components rated for 50,000 hours of '
         'continuous operation. For mission-critical installations, we recommend keeping one spare unit.'),
        ('"We can\'t justify the upfront investment"',
         'Break down the ROI: A typical hotel spends $3,000-8,000/year on printed materials. Digital '
         'signage eliminates this cost entirely. Additionally, in-house advertising (spa promotions, '
         'restaurant specials, room upgrade offers) generates an estimated $500-2,000/month in '
         'incremental revenue. The system pays for itself in 12-18 months and generates profit '
         'thereafter. We also offer <b>leasing options</b> that spread the cost over 24-36 months, '
         'making it cash-flow positive from month one.'),
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
        'Based on the product video analysis, the LAXREE Digital Signage collection features a '
        '<b>comprehensive range of commercial display solutions</b> spanning four installation '
        'categories. The video showcases each model in realistic hotel settings, highlighting '
        'screen quality, mounting options, and content management capabilities.', s['body']))
    story.append(Spacer(1, 6))
    story.append(Paragraph('<b>Key Visual Highlights from Video:</b>', s['h3']))
    video_points = [
        'Totem 55" displayed in grand hotel lobby - impressive scale and presence confirmed',
        'Totem series with integrated wheels demonstrated - easy repositioning by single staff member',
        'Anti-glare glass on Totem models shown under bright lobby lighting with no reflection issues',
        'T-Stand 32" slim vertical profile shown at elevator bank - elegant and unobtrusive',
        'Easel 32" A-frame foldable design demonstrated - quick setup and breakdown for events',
        'Wall Hanging 43" ultra-slim profile (~2.5cm) shown mounted flush to wall - looks like a frame',
        'Wall Hanging 43" Glass Screen variant revealed with tempered glass front - premium anti-reflective finish',
        'Content management interface demonstrated - drag-and-drop scheduling, hotel-specific templates',
        'Multiple displays shown running in coordinated network - consistent branding across all screens',
        'Side-by-side comparison of 400 nits vs 500 nits brightness in well-lit environment - both readable',
        'VESA 200x200 mounting bracket shown for Wall Hanging models - standard compatibility confirmed',
        '3-year warranty card and commercial-grade certification prominently displayed',
    ]
    for vp in video_points:
        story.append(Paragraph(f'- {vp}', s['bullet']))
    story.append(Spacer(1, 12))
    story.append(Paragraph(
        '<b>Sales Tip:</b> The most effective sales technique for digital signage is the <b>printing '
        'cost calculator</b>. Before your pitch, research the hotel\'s current printing spend (ask their '
        'marketing manager). Show them the exact ROI timeline: "Your $5,000/year printing budget pays '
        'for a complete 3-display system in 14 months, and then generates $12,000/year in advertising '
        'revenue." Numbers close deals faster than features.', s['callout']))

    # Build PDF
    doc.build(story, onFirstPage=add_page_number, onLaterPages=add_page_number)
    print(f"Generated: {output_path}")
    size_kb = os.path.getsize(output_path) / 1024
    print(f"File size: {size_kb:.1f} KB")
    return output_path


# ══════════════════════════════════════════════════════════════════════
# MAIN
# ══════════════════════════════════════════════════════════════════════

if __name__ == '__main__':
    print("=" * 60)
    print("LAXREE Product Training PDF Generator")
    print("Generating 3 premium product PDFs...")
    print("=" * 60)

    results = []
    results.append(generate_washroom_amenities_pdf())
    results.append(generate_luggage_pdf())
    results.append(generate_digital_signage_pdf())

    print("\n" + "=" * 60)
    print("All PDFs generated successfully!")
    print("=" * 60)
    for r in results:
        size_kb = os.path.getsize(r) / 1024
        print(f"  {os.path.basename(r)}: {size_kb:.1f} KB")
