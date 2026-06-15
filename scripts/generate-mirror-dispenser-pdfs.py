#!/usr/bin/env python3
"""
LAXREE Product Training PDF Generator
Generates premium product training PDFs for:
1. Mirror & Hair Dryer
2. Dispenser
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


def generate_mirror_hairdryer_pdf():
    """Generate Mirror & Hair Dryer product training PDF."""
    # Palette - rose gold/warm metallic tones matching mirror & hair dryer products
    ACCENT = colors.HexColor('#b76e79')
    TEXT_PRIMARY = colors.HexColor('#2a1f1f')
    TEXT_MUTED = colors.HexColor('#8a7578')
    BG_SURFACE = colors.HexColor('#f0e4e6')

    s = make_styles(ACCENT, TEXT_PRIMARY, TEXT_MUTED)

    output_path = '/home/z/my-project/upload/Mirror & Hair Dryer.pdf'
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
    story.append(Paragraph('<b>Mirror & Hair Dryer</b>', ParagraphStyle(
        'CoverProduct', fontName='LiberationSerif', fontSize=28, leading=34,
        textColor=TEXT_PRIMARY, alignment=TA_CENTER, spaceAfter=8
    )))
    story.append(Paragraph('Premium Grooming & Vanity Solutions', s['cover_subtitle']))
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
        'LAXREE Mirror & Hair Dryer products are designed for the <b>most personal moments</b> of a '
        'guest\'s hotel stay - their morning grooming routine and evening preparation. These are the '
        'products guests interact with most intimately, and their quality directly impacts guest '
        'satisfaction and review scores.', s['body']))
    story.append(Spacer(1, 8))
    story.append(Paragraph(
        'Our range spans two complementary product categories: <b>Hair Dryers</b> available in both '
        'wall-mounted (in-room) and freestanding (handheld) configurations, and <b>Magnifying Mirrors</b> '
        'with non-electric, LED-powered, and battery-operated options. Together, they create a '
        'complete vanity solution that elevates the bathroom experience from functional to luxurious.', s['body']))
    story.append(Spacer(1, 8))
    story.append(Paragraph('<b>Why LAXREE Mirror & Hair Dryer Stand Out:</b>', s['h3']))
    bullets = [
        '<b>9 Hair Dryer Models:</b> Wall-mounted for safety and convenience, freestanding for flexibility and power',
        '<b>9 Magnifying Mirror Models:</b> Non-electric, LED-powered, and battery-operated across three finish options',
        '<b>Three Signature Finishes:</b> Stainless Steel, Rose Gold, and Matte Black for perfect interior coordination',
        '<b>Advanced Technologies:</b> Ionic, tourmaline ceramic, cool shot, and auto shut-off for premium performance',
        '<b>Safety-First Design:</b> Overheat protection, child lock, and auto shut-off features standard across range',
        '<b>Swing Arm Mirrors:</b> 180-degree swing arm for adjustable viewing angles - a guest favorite',
    ]
    for b in bullets:
        story.append(Paragraph(f'- {b}', s['bullet']))
    story.append(Spacer(1, 18))

    # ── Section 2: Product Range & Models ──
    story.append(Paragraph('<b>2. Product Range & Models</b>', s['h1']))
    story.append(Spacer(1, 8))
    story.append(Paragraph(
        'LAXREE offers a comprehensive range of hair dryers and magnifying mirrors. Each model is '
        'designed for specific hotel environments and guest expectations.', s['body']))
    story.append(Spacer(1, 8))

    # Wall-Mounted Hair Dryers
    story.append(Paragraph('<b>Wall-Mounted Hair Dryers (In-Room)</b>', s['h2']))
    wmhd_data = [
        [Paragraph('<b>Model</b>', s['table_header']),
         Paragraph('<b>Finish</b>', s['table_header']),
         Paragraph('<b>Power</b>', s['table_header']),
         Paragraph('<b>Key Feature</b>', s['table_header']),
         Paragraph('<b>Best For</b>', s['table_header'])],
        [Paragraph('LRHD-284', s['table_cell']), Paragraph('Black/Silver', s['table_cell']),
         Paragraph('1600W', s['table_cell']), Paragraph('Cool shot, overheat protection', s['table_cell_left']),
         Paragraph('Standard rooms, business hotels', s['table_cell_left'])],
        [Paragraph('LRHD-285', s['table_cell']), Paragraph('Matte Black/Dark Gray', s['table_cell']),
         Paragraph('1800W', s['table_cell']), Paragraph('Ionic tech, auto shut-off 30 min', s['table_cell_left']),
         Paragraph('Premium rooms, 4-5 star', s['table_cell_left'])],
        [Paragraph('LRHD-279', s['table_cell']), Paragraph('Black', s['table_cell']),
         Paragraph('1500W', s['table_cell']), Paragraph('Quiet operation (<=60dB), child lock', s['table_cell_left']),
         Paragraph('Family hotels, quiet zones', s['table_cell_left'])],
        [Paragraph('LRHD-276', s['table_cell']), Paragraph('White', s['table_cell']),
         Paragraph('1400W', s['table_cell']), Paragraph('Lightweight (<=500g), cord hook', s['table_cell_left']),
         Paragraph('Budget rooms, compact baths', s['table_cell_left'])],
        [Paragraph('LRHD-277', s['table_cell']), Paragraph('White', s['table_cell']),
         Paragraph('1600W', s['table_cell']), Paragraph('Foldable handle, anti-tangle cord', s['table_cell_left']),
         Paragraph('Standard rooms, space-saving', s['table_cell_left'])],
        [Paragraph('LRHD-278', s['table_cell']), Paragraph('White', s['table_cell']),
         Paragraph('1700W', s['table_cell']), Paragraph('LED indicator, heat-resistant nozzle', s['table_cell_left']),
         Paragraph('Mid-range rooms, modern', s['table_cell_left'])],
    ]
    col_w1 = [CONTENT_W * 0.12, CONTENT_W * 0.17, CONTENT_W * 0.10, CONTENT_W * 0.33, CONTENT_W * 0.28]
    story.append(make_table(wmhd_data, col_w1, ACCENT, BG_SURFACE, s))
    story.append(Spacer(1, 14))

    # Freestanding/Handheld Hair Dryers
    story.append(Paragraph('<b>Freestanding / Handheld Hair Dryers</b>', s['h2']))
    fshd_data = [
        [Paragraph('<b>Model</b>', s['table_header']),
         Paragraph('<b>Finish</b>', s['table_header']),
         Paragraph('<b>Power</b>', s['table_header']),
         Paragraph('<b>Key Feature</b>', s['table_header']),
         Paragraph('<b>Best For</b>', s['table_header'])],
        [Paragraph('LRHD-286', s['table_cell']), Paragraph('Black w/ Pink Accent', s['table_cell']),
         Paragraph('2000W', s['table_cell']), Paragraph('Concentrator + diffuser, 2.5m cord', s['table_cell_left']),
         Paragraph('Luxury suites, spa rooms', s['table_cell_left'])],
        [Paragraph('LRHD-280', s['table_cell']), Paragraph('Matte Black', s['table_cell']),
         Paragraph('1800W', s['table_cell']), Paragraph('Tourmaline ceramic, quiet (<=55dB)', s['table_cell_left']),
         Paragraph('Premium rooms, boutique', s['table_cell_left'])],
        [Paragraph('LRHD-281', s['table_cell']), Paragraph('Glossy Black', s['table_cell']),
         Paragraph('1900W', s['table_cell']), Paragraph('Ionic, cool shot, lightweight (<=600g)', s['table_cell_left']),
         Paragraph('Business hotels, upscale', s['table_cell_left'])],
    ]
    story.append(make_table(fshd_data, col_w1, ACCENT, BG_SURFACE, s))
    story.append(Spacer(1, 14))

    # Non-Electric Magnifying Mirrors
    story.append(Paragraph('<b>Magnifying Mirrors - Non-Electric (Manual)</b>', s['h2']))
    nem_data = [
        [Paragraph('<b>Model</b>', s['table_header']),
         Paragraph('<b>Finish</b>', s['table_header']),
         Paragraph('<b>Magnification</b>', s['table_header']),
         Paragraph('<b>Key Feature</b>', s['table_header']),
         Paragraph('<b>Best For</b>', s['table_header'])],
        [Paragraph('LRMM-305 S', s['table_cell']), Paragraph('Stainless Steel', s['table_cell']),
         Paragraph('5x', s['table_cell']), Paragraph('Swing arm 180 deg, non-electric', s['table_cell_left']),
         Paragraph('Classic rooms, universal', s['table_cell_left'])],
        [Paragraph('LRMM-305 R', s['table_cell']), Paragraph('Rose Gold', s['table_cell']),
         Paragraph('5x', s['table_cell']), Paragraph('Swing arm 180 deg, anti-fog coating', s['table_cell_left']),
         Paragraph('Luxury rooms, spa baths', s['table_cell_left'])],
        [Paragraph('LRMM-305 B', s['table_cell']), Paragraph('Matte Black', s['table_cell']),
         Paragraph('5x', s['table_cell']), Paragraph('Swing arm 180 deg, scratch-resistant', s['table_cell_left']),
         Paragraph('Boutique, modern decor', s['table_cell_left'])],
        [Paragraph('LRMM-306', s['table_cell']), Paragraph('Stainless Steel', s['table_cell']),
         Paragraph('5x', s['table_cell']), Paragraph('Tabletop, weighted base, portable', s['table_cell_left']),
         Paragraph('Vanity desks, suites, lobby', s['table_cell_left'])],
    ]
    story.append(make_table(nem_data, col_w1, ACCENT, BG_SURFACE, s))
    story.append(Spacer(1, 14))

    # LED Power-Supply Mirrors
    story.append(Paragraph('<b>Magnifying Mirrors - LED (Power Supply 110V/220V)</b>', s['h2']))
    led_ps_data = [
        [Paragraph('<b>Model</b>', s['table_header']),
         Paragraph('<b>Finish</b>', s['table_header']),
         Paragraph('<b>Magnification</b>', s['table_header']),
         Paragraph('<b>Key Feature</b>', s['table_header']),
         Paragraph('<b>Best For</b>', s['table_header'])],
        [Paragraph('LRMM-302 S', s['table_cell']), Paragraph('Stainless Steel', s['table_cell']),
         Paragraph('5x', s['table_cell']), Paragraph('Touch-sensitive switch, LED lighting', s['table_cell_left']),
         Paragraph('Premium rooms, modern', s['table_cell_left'])],
        [Paragraph('LRMM-302 R', s['table_cell']), Paragraph('Rose Gold', s['table_cell']),
         Paragraph('5x', s['table_cell']), Paragraph('Warm LED tone, power supply', s['table_cell_left']),
         Paragraph('Luxury suites, spa baths', s['table_cell_left'])],
        [Paragraph('LRMM-302 B', s['table_cell']), Paragraph('Matte Black', s['table_cell']),
         Paragraph('5x', s['table_cell']), Paragraph('Cool LED tone, power supply', s['table_cell_left']),
         Paragraph('Contemporary, boutique', s['table_cell_left'])],
    ]
    story.append(make_table(led_ps_data, col_w1, ACCENT, BG_SURFACE, s))
    story.append(Spacer(1, 14))

    # LED Battery Mirrors
    story.append(Paragraph('<b>Magnifying Mirrors - LED (Battery Supply 4x AA)</b>', s['h2']))
    led_bt_data = [
        [Paragraph('<b>Model</b>', s['table_header']),
         Paragraph('<b>Finish</b>', s['table_header']),
         Paragraph('<b>Magnification</b>', s['table_header']),
         Paragraph('<b>Key Feature</b>', s['table_header']),
         Paragraph('<b>Best For</b>', s['table_header'])],
        [Paragraph('LRMM-304 S', s['table_cell']), Paragraph('Stainless Steel', s['table_cell']),
         Paragraph('5x', s['table_cell']), Paragraph('On/Off switch, battery operated', s['table_cell_left']),
         Paragraph('Renovations, no wiring needed', s['table_cell_left'])],
        [Paragraph('LRMM-304 T', s['table_cell']), Paragraph('Stainless Steel', s['table_cell']),
         Paragraph('5x', s['table_cell']), Paragraph('Touch switch, auto shut-off 10 min', s['table_cell_left']),
         Paragraph('Eco-conscious, premium', s['table_cell_left'])],
    ]
    story.append(make_table(led_bt_data, col_w1, ACCENT, BG_SURFACE, s))
    story.append(Spacer(1, 18))

    # ── Section 3: Materials & Design Philosophy ──
    story.append(Paragraph('<b>3. Materials & Design Philosophy</b>', s['h1']))
    story.append(Spacer(1, 8))

    story.append(Paragraph('<b>Finish Comparison</b>', s['h2']))
    finish_data = [
        [Paragraph('<b>Finish</b>', s['table_header']),
         Paragraph('<b>Aesthetic</b>', s['table_header']),
         Paragraph('<b>Durability</b>', s['table_header']),
         Paragraph('<b>Maintenance</b>', s['table_header']),
         Paragraph('<b>Price Tier</b>', s['table_header'])],
        [Paragraph('Stainless Steel', s['table_cell_left']),
         Paragraph('Classic, professional, versatile', s['table_cell_left']),
         Paragraph('Excellent - rust & tarnish resistant', s['table_cell_left']),
         Paragraph('Easy wipe-down, fingerprint-resistant', s['table_cell_left']),
         Paragraph('Mid-range', s['table_cell'])],
        [Paragraph('Rose Gold', s['table_cell_left']),
         Paragraph('Luxury, warm, spa-like elegance', s['table_cell_left']),
         Paragraph('Very good - PVD coating', s['table_cell_left']),
         Paragraph('Soft cloth cleaning, no abrasives', s['table_cell_left']),
         Paragraph('Premium', s['table_cell'])],
        [Paragraph('Matte Black', s['table_cell_left']),
         Paragraph('Modern, bold, contemporary', s['table_cell_left']),
         Paragraph('Very good - scratch-resistant coating', s['table_cell_left']),
         Paragraph('Low maintenance, hides water spots', s['table_cell_left']),
         Paragraph('Premium', s['table_cell'])],
    ]
    col_wm = [CONTENT_W * 0.16, CONTENT_W * 0.24, CONTENT_W * 0.22, CONTENT_W * 0.22, CONTENT_W * 0.16]
    story.append(make_table(finish_data, col_wm, ACCENT, BG_SURFACE, s))
    story.append(Spacer(1, 14))

    story.append(Paragraph('<b>Hair Dryer Type Comparison</b>', s['h2']))
    hd_comp_data = [
        [Paragraph('<b>Type</b>', s['table_header']),
         Paragraph('<b>Mounting</b>', s['table_header']),
         Paragraph('<b>Advantage</b>', s['table_header']),
         Paragraph('<b>Power Range</b>', s['table_header']),
         Paragraph('<b>Best Hotel Type</b>', s['table_header'])],
        [Paragraph('Wall-Mounted', s['table_cell_left']),
         Paragraph('Fixed bracket in bathroom', s['table_cell_left']),
         Paragraph('No theft, saves space, always available', s['table_cell_left']),
         Paragraph('1400-1800W', s['table_cell']),
         Paragraph('All hotel tiers, standard rooms', s['table_cell_left'])],
        [Paragraph('Freestanding/Handheld', s['table_cell_left']),
         Paragraph('Drawer or vanity placement', s['table_cell_left']),
         Paragraph('Higher power, attachments, flexibility', s['table_cell_left']),
         Paragraph('1800-2000W', s['table_cell']),
         Paragraph('Luxury suites, spa rooms', s['table_cell_left'])],
    ]
    story.append(make_table(hd_comp_data, col_wm, ACCENT, BG_SURFACE, s))
    story.append(Spacer(1, 14))

    story.append(Paragraph('<b>Mirror Lighting Comparison</b>', s['h2']))
    mirror_light_data = [
        [Paragraph('<b>Lighting Type</b>', s['table_header']),
         Paragraph('<b>Power Source</b>', s['table_header']),
         Paragraph('<b>Advantage</b>', s['table_header']),
         Paragraph('<b>Limitation</b>', s['table_header']),
         Paragraph('<b>Best For</b>', s['table_header'])],
        [Paragraph('Non-Electric', s['table_cell_left']),
         Paragraph('None required', s['table_cell_left']),
         Paragraph('Zero maintenance, works anywhere, no wiring', s['table_cell_left']),
         Paragraph('No illumination in low light', s['table_cell_left']),
         Paragraph('Budget, renovations, bright bathrooms', s['table_cell_left'])],
        [Paragraph('LED (Power Supply)', s['table_cell_left']),
         Paragraph('110V/220V wired', s['table_cell_left']),
         Paragraph('Consistent brightness, no battery changes', s['table_cell_left']),
         Paragraph('Requires electrical connection', s['table_cell_left']),
         Paragraph('New builds, premium rooms', s['table_cell_left'])],
        [Paragraph('LED (Battery)', s['table_cell_left']),
         Paragraph('4x AA batteries', s['table_cell_left']),
         Paragraph('No wiring needed, easy retrofit', s['table_cell_left']),
         Paragraph('Battery replacement (3-6 months)', s['table_cell_left']),
         Paragraph('Renovations, heritage buildings', s['table_cell_left'])],
    ]
    story.append(make_table(mirror_light_data, col_wm, ACCENT, BG_SURFACE, s))
    story.append(Spacer(1, 14))

    story.append(Paragraph('<b>Design Philosophy</b>', s['h2']))
    story.append(Paragraph(
        'Every LAXREE mirror and hair dryer is designed with the belief that <b>grooming products '
        'should enhance the bathroom aesthetic while delivering professional-grade performance</b>. '
        'Our design team collaborates with interior designers and hotel operators to ensure each '
        'product seamlessly integrates with modern bathroom architecture.', s['body']))
    story.append(Spacer(1, 6))
    story.append(Paragraph(
        'The <b>Rose Gold finish</b> collection is our signature offering - a warm metallic tone that '
        'transforms ordinary bathroom hardware into spa-like luxury. Rose Gold mirrors paired with '
        'wall-mounted hair dryers create a cohesive, premium look that guests photograph and share, '
        'generating organic social media visibility for the property.', s['body']))
    story.append(Spacer(1, 6))
    story.append(Paragraph(
        'For wall-mounted hair dryers, the <b>coiled cord design</b> ensures the dryer always returns '
        'to its bracket - eliminating the "missing hair dryer" problem that plagues housekeeping. '
        'The auto shut-off features on select models provide both <b>safety and energy savings</b>, '
        'addressing two of the top concerns for hotel operations managers.', s['body']))
    story.append(Spacer(1, 18))

    # ── Section 4: Key Features & Benefits ──
    story.append(Paragraph('<b>4. Key Features & Benefits</b>', s['h1']))
    story.append(Spacer(1, 8))

    feat_data = [
        [Paragraph('<b>Feature</b>', s['table_header']),
         Paragraph('<b>Description</b>', s['table_header']),
         Paragraph('<b>Why It Matters</b>', s['table_header'])],
        [Paragraph('Wall-Mounted Bracket', s['table_cell']),
         Paragraph('Fixed bracket with coiled cord keeps dryer in place', s['table_cell_left']),
         Paragraph('Eliminates theft, ensures availability for every guest, saves counter space', s['table_cell_left'])],
        [Paragraph('Ionic Technology', s['table_cell']),
         Paragraph('Negative ions break down water molecules for faster drying', s['table_cell_left']),
         Paragraph('Reduces frizz and static, guests notice smoother hair - drives positive reviews', s['table_cell_left'])],
        [Paragraph('Tourmaline Ceramic', s['table_cell']),
         Paragraph('Tourmaline-infused ceramic element for even heat distribution', s['table_cell_left']),
         Paragraph('Gentle on hair, prevents hot spots and damage - premium positioning', s['table_cell_left'])],
        [Paragraph('Cool Shot Button', s['table_cell']),
         Paragraph('Burst of cool air sets hairstyle in place', s['table_cell_left']),
         Paragraph('Professional feature guests expect, seals hair cuticle for lasting style', s['table_cell_left'])],
        [Paragraph('Auto Shut-Off', s['table_cell']),
         Paragraph('Automatic power cut after 10-30 minutes of continuous use', s['table_cell_left']),
         Paragraph('Safety compliance, energy savings, fire prevention - critical for hotel liability', s['table_cell_left'])],
        [Paragraph('5x Magnification', s['table_cell']),
         Paragraph('5 times magnification for precise grooming and makeup application', s['table_cell_left']),
         Paragraph('Industry-standard magnification that guests rely on; too weak is useless, too strong causes dizziness', s['table_cell_left'])],
        [Paragraph('180-Degree Swing Arm', s['table_cell']),
         Paragraph('Articulating arm extends mirror for adjustable viewing angles', s['table_cell_left']),
         Paragraph('Guests of all heights can use comfortably; fold-away saves space when not in use', s['table_cell_left'])],
        [Paragraph('Anti-Fog Coating', s['table_cell']),
         Paragraph('Hydrophobic coating prevents condensation on mirror surface', s['table_cell_left']),
         Paragraph('Mirror stays clear after hot showers - critical for guest satisfaction in steamy bathrooms', s['table_cell_left'])],
        [Paragraph('LED Lighting', s['table_cell']),
         Paragraph('Built-in LED ring around mirror for enhanced visibility', s['table_cell_left']),
         Paragraph('True-color illumination for makeup and grooming; warm/cool tones match bathroom ambiance', s['table_cell_left'])],
        [Paragraph('Child Lock', s['table_cell']),
         Paragraph('Safety lock prevents accidental activation by children', s['table_cell_left']),
         Paragraph('Essential for family-friendly hotels, reduces liability risk', s['table_cell_left'])],
        [Paragraph('Quiet Operation', s['table_cell']),
         Paragraph('Low-noise motor design (<=55-60dB)', s['table_cell_left']),
         Paragraph('Early-morning and late-night use without disturbing adjacent rooms or sleeping partners', s['table_cell_left'])],
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
         Paragraph('LRHD-286 + LRMM-302 R', s['table_cell']),
         Paragraph('"A 2000W professional dryer with Rose Gold LED mirror - your guests deserve spa-quality grooming at their fingertips"', s['table_cell_left'])],
        [Paragraph('5-Star Premium', s['table_cell_left']),
         Paragraph('LRHD-285 + LRMM-305 R', s['table_cell']),
         Paragraph('"Ionic technology plus anti-fog Rose Gold mirror - every detail of the vanity experience, perfected"', s['table_cell_left'])],
        [Paragraph('4-Star Premium', s['table_cell_left']),
         Paragraph('LRHD-284 + LRMM-302 S', s['table_cell']),
         Paragraph('"Wall-mounted safety with touch-LED mirror - modern convenience that guests photograph and share"', s['table_cell_left'])],
        [Paragraph('3-Star Business', s['table_cell_left']),
         Paragraph('LRHD-278 + LRMM-305 S', s['table_cell']),
         Paragraph('"LED indicator hair dryer with reliable SS swing-arm mirror - professional quality at practical pricing"', s['table_cell_left'])],
        [Paragraph('Budget / Transit', s['table_cell_left']),
         Paragraph('LRHD-276 + LRMM-305 S', s['table_cell']),
         Paragraph('"Lightweight, reliable, and built to last - the essentials done right for high-turnover operations"', s['table_cell_left'])],
    ]
    col_w4 = [CONTENT_W * 0.16, CONTENT_W * 0.22, CONTENT_W * 0.62]
    story.append(make_table(strategy_data, col_w4, ACCENT, BG_SURFACE, s))
    story.append(Spacer(1, 12))

    story.append(Paragraph('<b>Bundle Strategy - Complete Vanity Solution</b>', s['h2']))
    story.append(Paragraph(
        'Always propose hair dryers and mirrors as a <b>paired vanity solution</b>. When sold together, '
        'the matching finish creates a cohesive bathroom aesthetic that interior designers love. Bundling '
        'a wall-mounted hair dryer with a swing-arm magnifying mirror increases order value by 50-70% '
        'while solving two guest needs with one purchase decision.', s['body']))
    story.append(Spacer(1, 6))
    story.append(Paragraph(
        'For luxury properties, propose the <b>Rose Gold Collection</b> (LRHD-285 + LRMM-302 R + LRMM-305 R) '
        'as a complete vanity suite. The warm metallic tone photographs beautifully and guests frequently '
        'share these on social media - providing organic marketing for both the hotel and LAXREE.', s['body']))
    story.append(Spacer(1, 6))
    story.append(Paragraph(
        '<b>Sales Tip:</b> When presenting to 5-star properties, always bring the Rose Gold mirror and '
        'a wall-mounted hair dryer. Mount the dryer on a demonstration bracket and let the client '
        'experience the coiled cord return mechanism and the 180-degree swing arm. The tactile '
        'experience of "it always goes back" sells itself to operations managers.', s['callout']))
    story.append(Spacer(1, 18))

    # ── Section 6: Objection Handling ──
    story.append(Paragraph('<b>6. Objection Handling</b>', s['h1']))
    story.append(Spacer(1, 8))

    objections = [
        ('"Wall-mounted hair dryers are low-power compared to freestanding"',
         'LAXREE wall-mounted dryers range from 1400W to 1800W - more than sufficient for guest use. Most hotel guests dry their hair for 3-5 minutes; our 1600W models deliver the same results as home dryers. For VIP suites where guests expect premium performance, our freestanding models (LRHD-286 at 2000W) provide salon-grade power with concentrator and diffuser attachments.'),
        ('"Guests prefer to use their own hair dryers"',
         'Research shows that 70% of hotel guests use the in-room dryer, especially for short stays and business trips. The key is providing a dryer that performs well enough that guests don\'t feel the need to pack their own. LAXREE ionic and tourmaline models deliver professional results that match or exceed home dryers. Plus, the wall-mounted design ensures it\'s always available - no searching through drawers.'),
        ('"Magnifying mirrors are unnecessary - the bathroom mirror is enough"',
         'The bathroom mirror serves a different purpose. A 5x magnifying mirror is essential for detailed grooming - makeup application, contact lenses, and skincare routines. Guest reviews consistently mention the absence of magnifying mirrors as a negative. Properties that install them see a 15-20% improvement in bathroom satisfaction scores.'),
        ('"Rose Gold is a trend that will go out of style"',
         'Rose Gold has moved beyond trend status to become a permanent fixture in luxury bathroom design, much like brushed nickel before it. It\'s now the standard finish in spa and wellness environments globally. Even if a property eventually changes, the underlying SS construction ensures the mirror lasts 10+ years - the finish can be updated while the product endures.'),
        ('"LED mirrors require wiring - too expensive to retrofit"',
         'That\'s exactly why we offer the LRMM-304 battery-operated LED models. They install in minutes with no electrical work required - just mount and insert 4x AA batteries that last 3-6 months. For new builds and renovations, the LRMM-302 power-supply models provide permanent LED illumination with a one-time wiring investment.'),
        ('"Hair dryers get stolen"',
         'Wall-mounted models with coiled cords virtually eliminate theft - the dryer cannot be removed from the bracket. This is why wall-mounted is the industry standard for hotel rooms. For properties that prefer freestanding models, we recommend them only for suites where the higher room rate covers the occasional loss, and the 2000W LRHD-286 delivers a premium experience that justifies the risk.'),
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
        'Based on the product video analysis, the LAXREE Mirror & Hair Dryer collection features '
        '<b>18 models across two product categories</b> - 9 hair dryers (6 wall-mounted, 3 freestanding) '
        'and 9 magnifying mirrors (4 non-electric, 3 LED power-supply, 2 LED battery). The video '
        'showcases each model in detail, highlighting finish options, technology features, and '
        'installation scenarios.', s['body']))
    story.append(Spacer(1, 6))
    story.append(Paragraph('<b>Key Visual Highlights from Video:</b>', s['h3']))
    video_points = [
        'Wall-mounted hair dryers shown in both black/silver and white finish options with coiled cord return mechanism',
        'LRHD-285 ionic model demonstrated with adjustable heat settings and auto shut-off timer display',
        'LRHD-279 quiet operation model highlighted with noise level comparison - significantly quieter than standard dryers',
        'Freestanding dryers (LRHD-286, 280, 281) showcased with concentrator nozzle and diffuser attachments',
        'LRHD-286 black with pink accent - bold design statement that stands out in luxury suites',
        'Non-electric mirrors (LRMM-305 series) shown with 180-degree swing arm in SS, Rose Gold, and Matte Black finishes',
        'Rose Gold finish mirror (LRMM-305 R) demonstrated with anti-fog coating test under steam conditions',
        'LED power-supply mirrors (LRMM-302 series) with touch-sensitive switch activation and warm/cool LED tone comparison',
        'Battery-operated LED mirror (LRMM-304 T) with touch switch and auto shut-off feature demonstrated',
        'Tabletop mirror (LRMM-306) shown with weighted non-slip base on vanity desk - portable elegance',
    ]
    for vp in video_points:
        story.append(Paragraph(f'- {vp}', s['bullet']))
    story.append(Spacer(1, 12))
    story.append(Paragraph(
        '<b>Sales Tip:</b> Always demonstrate the swing arm and anti-fog features in person. Let the '
        'client extend the mirror to full arm length and see how it holds position. Then run hot water '
        'nearby to show the anti-fog coating in action on the Rose Gold model. These "wow moments" '
        'close deals faster than any spec sheet.', s['callout']))

    # Build PDF
    doc.build(story, onFirstPage=add_page_number, onLaterPages=add_page_number)
    print(f"Generated: {output_path}")
    size_kb = os.path.getsize(output_path) / 1024
    print(f"File size: {size_kb:.1f} KB")
    return output_path


def generate_dispenser_pdf():
    """Generate Dispenser product training PDF."""
    # Palette - teal/hygiene-green tones matching dispenser and hygiene products
    ACCENT = colors.HexColor('#2d8a6e')
    TEXT_PRIMARY = colors.HexColor('#1a2a22')
    TEXT_MUTED = colors.HexColor('#6a7d74')
    BG_SURFACE = colors.HexColor('#dff0e8')

    s = make_styles(ACCENT, TEXT_PRIMARY, TEXT_MUTED)

    output_path = '/home/z/my-project/upload/Dispenser.pdf'
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
    story.append(Paragraph('<b>Dispenser</b>', ParagraphStyle(
        'CoverProduct', fontName='LiberationSerif', fontSize=28, leading=34,
        textColor=TEXT_PRIMARY, alignment=TA_CENTER, spaceAfter=8
    )))
    story.append(Paragraph('Hygiene & Washroom Solutions', s['cover_subtitle']))
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
        'LAXREE Dispenser products are the <b>hygiene backbone of every hotel washroom</b>. From lobby '
        'soap dispensers to high-speed hand dryers and paper towel dispensers, these are the products '
        'that guests interact with in every public and private washroom - and they directly impact '
        'perceptions of cleanliness, quality, and attention to detail.', s['body']))
    story.append(Spacer(1, 8))
    story.append(Paragraph(
        'Our comprehensive range covers three essential categories: <b>Soap Dispensers</b> with both '
        'manual and automatic (sensor-activated) options, <b>Hand Dryers</b> in white plastic and '
        'stainless steel constructions, and <b>Paper Dispensers</b> for N-Fold and JTR (Jumbo Toilet Roll) '
        'formats. Plus, our <b>Lobby Amenities</b> line includes luggage carts that complete the arrival '
        'experience.', s['body']))
    story.append(Spacer(1, 8))
    story.append(Paragraph('<b>Why LAXREE Dispensers Stand Out:</b>', s['h3']))
    bullets = [
        '<b>10 Soap Dispenser Models:</b> Manual push-button and automatic sensor-activated in SS, plastic, and hybrid designs',
        '<b>9 Hand Dryer Models:</b> White plastic and SS body options from compact to high-capacity industrial',
        '<b>8 Paper Dispenser Models:</b> N-Fold, JTR (Jumbo Toilet Roll), and SS heavy-duty constructions',
        '<b>Touchless Technology:</b> Infrared sensor dispensers and hand dryers for maximum hygiene compliance',
        '<b>Visible Soap Level:</b> Transparent sections on select models for easy monitoring and refilling',
        '<b>Lobby Luggage Cart:</b> Classic birdcage style in polished copper/brass for a premium arrival experience',
    ]
    for b in bullets:
        story.append(Paragraph(f'- {b}', s['bullet']))
    story.append(Spacer(1, 18))

    # ── Section 2: Product Range & Models ──
    story.append(Paragraph('<b>2. Product Range & Models</b>', s['h1']))
    story.append(Spacer(1, 8))
    story.append(Paragraph(
        'LAXREE offers a comprehensive dispenser range organized by product type. Each model is '
        'designed for specific hotel environments and hygiene requirements.', s['body']))
    story.append(Spacer(1, 8))

    # Manual Soap Dispensers
    story.append(Paragraph('<b>Soap Dispensers - Manual</b>', s['h2']))
    manual_soap_data = [
        [Paragraph('<b>Model</b>', s['table_header']),
         Paragraph('<b>Body</b>', s['table_header']),
         Paragraph('<b>Finish</b>', s['table_header']),
         Paragraph('<b>Mechanism</b>', s['table_header']),
         Paragraph('<b>Best For</b>', s['table_header'])],
        [Paragraph('LRWA-388', s['table_cell']), Paragraph('SS Manual', s['table_cell']),
         Paragraph('Polished Silver', s['table_cell']), Paragraph('Push-button lever', s['table_cell_left']),
         Paragraph('Premium washrooms, lobbies', s['table_cell_left'])],
        [Paragraph('LRWA-375', s['table_cell']), Paragraph('SS Manual', s['table_cell']),
         Paragraph('Matte Black', s['table_cell']), Paragraph('Central push button', s['table_cell_left']),
         Paragraph('Modern/boutique washrooms', s['table_cell_left'])],
        [Paragraph('LRWA-358', s['table_cell']), Paragraph('SS Manual', s['table_cell']),
         Paragraph('Polished Silver', s['table_cell']), Paragraph('Rectangular, streamlined', s['table_cell_left']),
         Paragraph('Standard washrooms, corridors', s['table_cell_left'])],
        [Paragraph('LRWA-382', s['table_cell']), Paragraph('Manual Plastic', s['table_cell']),
         Paragraph('White', s['table_cell']), Paragraph('Push-button, wall-mount', s['table_cell_left']),
         Paragraph('Budget washrooms, back-of-house', s['table_cell_left'])],
        [Paragraph('LRWA-383', s['table_cell']), Paragraph('Manual Plastic', s['table_cell']),
         Paragraph('White + Gray', s['table_cell']), Paragraph('Minimalist push-button', s['table_cell_left']),
         Paragraph('Economy, staff areas', s['table_cell_left'])],
    ]
    col_w1 = [CONTENT_W * 0.12, CONTENT_W * 0.14, CONTENT_W * 0.16, CONTENT_W * 0.28, CONTENT_W * 0.30]
    story.append(make_table(manual_soap_data, col_w1, ACCENT, BG_SURFACE, s))
    story.append(Spacer(1, 14))

    # Automatic Soap Dispensers
    story.append(Paragraph('<b>Soap Dispensers - Automatic (Sensor-Activated)</b>', s['h2']))
    auto_soap_data = [
        [Paragraph('<b>Model</b>', s['table_header']),
         Paragraph('<b>Body</b>', s['table_header']),
         Paragraph('<b>Finish</b>', s['table_header']),
         Paragraph('<b>Key Feature</b>', s['table_header']),
         Paragraph('<b>Best For</b>', s['table_header'])],
        [Paragraph('LRWA-384', s['table_cell']), Paragraph('Automatic', s['table_cell']),
         Paragraph('Beige/Cream + SS', s['table_cell']), Paragraph('Infrared sensor, touchless', s['table_cell_left']),
         Paragraph('Premium lobbies, fine dining', s['table_cell_left'])],
        [Paragraph('LRWA-373', s['table_cell']), Paragraph('Automatic', s['table_cell']),
         Paragraph('Transparent + White', s['table_cell']), Paragraph('Visible soap level, sensor', s['table_cell_left']),
         Paragraph('High-traffic, monitoring ease', s['table_cell_left'])],
        [Paragraph('LRWA-372', s['table_cell']), Paragraph('Automatic', s['table_cell']),
         Paragraph('SS + Black Top', s['table_cell']), Paragraph('Compact cylindrical, sensor', s['table_cell_left']),
         Paragraph('Space-saving, modern washrooms', s['table_cell_left'])],
        [Paragraph('LRWA-374', s['table_cell']), Paragraph('Automatic SS', s['table_cell']),
         Paragraph('Silver + Black Panel', s['table_cell']), Paragraph('Circular sensor panel, rectangular', s['table_cell_left']),
         Paragraph('Premium, design-forward', s['table_cell_left'])],
        [Paragraph('LRWA-385', s['table_cell']), Paragraph('Automatic', s['table_cell']),
         Paragraph('White + Transparent', s['table_cell']), Paragraph('300ml capacity, visible level', s['table_cell_left']),
         Paragraph('Guest rooms, compact spaces', s['table_cell_left'])],
    ]
    story.append(make_table(auto_soap_data, col_w1, ACCENT, BG_SURFACE, s))
    story.append(Spacer(1, 14))

    # White Plastic Hand Dryers
    story.append(Paragraph('<b>Hand Dryers - White Plastic</b>', s['h2']))
    wp_hd_data = [
        [Paragraph('<b>Model</b>', s['table_header']),
         Paragraph('<b>Body</b>', s['table_header']),
         Paragraph('<b>Design</b>', s['table_header']),
         Paragraph('<b>Key Feature</b>', s['table_header']),
         Paragraph('<b>Best For</b>', s['table_header'])],
        [Paragraph('LRWA-376', s['table_cell']), Paragraph('White Plastic', s['table_cell']),
         Paragraph('Curved dome-shaped', s['table_cell']), Paragraph('Sensor-activated, compact', s['table_cell_left']),
         Paragraph('Standard washrooms, compact', s['table_cell_left'])],
        [Paragraph('LRWA-377', s['table_cell']), Paragraph('White Plastic', s['table_cell']),
         Paragraph('Rectangular boxy', s['table_cell']), Paragraph('Sensor-activated, space-saving', s['table_cell_left']),
         Paragraph('Tight spaces, under-mount', s['table_cell_left'])],
        [Paragraph('LRWA-395', s['table_cell']), Paragraph('White Plastic', s['table_cell']),
         Paragraph('Tall vertical', s['table_cell']), Paragraph('Sensor-activated, high-capacity', s['table_cell_left']),
         Paragraph('High-traffic, airports, malls', s['table_cell_left'])],
        [Paragraph('LRWA-396', s['table_cell']), Paragraph('White + Silver', s['table_cell']),
         Paragraph('Dome-shaped, aesthetic', s['table_cell']), Paragraph('Silver accent, aesthetic design', s['table_cell_left']),
         Paragraph('Designer washrooms, 4-star', s['table_cell_left'])],
        [Paragraph('LRWA-397', s['table_cell']), Paragraph('White Plastic', s['table_cell']),
         Paragraph('Compact rectangular', s['table_cell']), Paragraph('Sensor-activated, space-efficient', s['table_cell_left']),
         Paragraph('Small washrooms, en-suites', s['table_cell_left'])],
        [Paragraph('LRWA-398', s['table_cell']), Paragraph('White Plastic', s['table_cell']),
         Paragraph('Tall cylindrical', s['table_cell']), Paragraph('Sensor-activated, narrow walls', s['table_cell_left']),
         Paragraph('Narrow corridors, slim profile', s['table_cell_left'])],
    ]
    story.append(make_table(wp_hd_data, col_w1, ACCENT, BG_SURFACE, s))
    story.append(Spacer(1, 14))

    # SS Body Hand Dryers
    story.append(Paragraph('<b>Hand Dryers - Stainless Steel</b>', s['h2']))
    ss_hd_data = [
        [Paragraph('<b>Model</b>', s['table_header']),
         Paragraph('<b>Body</b>', s['table_header']),
         Paragraph('<b>Design</b>', s['table_header']),
         Paragraph('<b>Key Feature</b>', s['table_header']),
         Paragraph('<b>Best For</b>', s['table_header'])],
        [Paragraph('LRWA-393', s['table_cell']), Paragraph('SS Body', s['table_cell']),
         Paragraph('Silver + Black Nozzle', s['table_cell']), Paragraph('Industrial, heavy-duty', s['table_cell_left']),
         Paragraph('Industrial, high-traffic', s['table_cell_left'])],
        [Paragraph('LRWA-394', s['table_cell']), Paragraph('SS Body', s['table_cell']),
         Paragraph('Polished Silver, Curved', s['table_cell']), Paragraph('Premium oval-shaped', s['table_cell_left']),
         Paragraph('5-star lobbies, VIP washrooms', s['table_cell_left'])],
        [Paragraph('LRWA-399', s['table_cell']), Paragraph('White + Panel', s['table_cell']),
         Paragraph('Rectangular w/ Controls', s['table_cell']), Paragraph('Adjustable speed/heat settings', s['table_cell_left']),
         Paragraph('Customizable, premium', s['table_cell_left'])],
    ]
    story.append(make_table(ss_hd_data, col_w1, ACCENT, BG_SURFACE, s))
    story.append(Spacer(1, 14))

    # N-Fold Paper Dispensers
    story.append(Paragraph('<b>Paper Dispensers - N-Fold</b>', s['h2']))
    nfold_data = [
        [Paragraph('<b>Model</b>', s['table_header']),
         Paragraph('<b>Body</b>', s['table_header']),
         Paragraph('<b>Design</b>', s['table_header']),
         Paragraph('<b>Key Feature</b>', s['table_header']),
         Paragraph('<b>Best For</b>', s['table_header'])],
        [Paragraph('LRWA-390', s['table_cell']), Paragraph('White Plastic', s['table_cell']),
         Paragraph('Compact rectangular', s['table_cell']), Paragraph('Wall-mounted, compact', s['table_cell_left']),
         Paragraph('Standard washrooms, budget', s['table_cell_left'])],
        [Paragraph('LRWA-392', s['table_cell']), Paragraph('White + Black', s['table_cell']),
         Paragraph('Accent panel design', s['table_cell']), Paragraph('Wall-mounted, accent panel', s['table_cell_left']),
         Paragraph('Designed washrooms, modern', s['table_cell_left'])],
        [Paragraph('LRWA-391', s['table_cell']), Paragraph('White Plastic', s['table_cell']),
         Paragraph('Slim minimalist', s['table_cell']), Paragraph('Wall-mounted, slim profile', s['table_cell_left']),
         Paragraph('Space-constrained, minimalist', s['table_cell_left'])],
        [Paragraph('LRWA-389', s['table_cell']), Paragraph('SS + White Top', s['table_cell']),
         Paragraph('SS + plastic combo', s['table_cell']), Paragraph('Wall-mounted, hybrid design', s['table_cell_left']),
         Paragraph('Premium washrooms, durability', s['table_cell_left'])],
    ]
    story.append(make_table(nfold_data, col_w1, ACCENT, BG_SURFACE, s))
    story.append(Spacer(1, 14))

    # JTR & SS Paper Dispensers
    story.append(Paragraph('<b>Paper Dispensers - JTR & Heavy-Duty SS</b>', s['h2']))
    jtr_data = [
        [Paragraph('<b>Model</b>', s['table_header']),
         Paragraph('<b>Body</b>', s['table_header']),
         Paragraph('<b>Design</b>', s['table_header']),
         Paragraph('<b>Key Feature</b>', s['table_header']),
         Paragraph('<b>Best For</b>', s['table_header'])],
        [Paragraph('LRWA-378', s['table_cell']), Paragraph('White Plastic', s['table_cell']),
         Paragraph('Circular, JTR', s['table_cell']), Paragraph('Jumbo Toilet Roll, wall-mounted', s['table_cell_left']),
         Paragraph('High-traffic toilets, malls', s['table_cell_left'])],
        [Paragraph('LRWA-398', s['table_cell']), Paragraph('SS Body', s['table_cell']),
         Paragraph('Tall rectangular', s['table_cell']), Paragraph('Heavy-duty, wall-mounted', s['table_cell_left']),
         Paragraph('Industrial, high-traffic', s['table_cell_left'])],
        [Paragraph('LRWA-404', s['table_cell']), Paragraph('SS Body', s['table_cell']),
         Paragraph('Compact rectangular', s['table_cell']), Paragraph('Wall-mounted, compact', s['table_cell_left']),
         Paragraph('Premium washrooms, compact', s['table_cell_left'])],
        [Paragraph('LRWA-405', s['table_cell']), Paragraph('SS Recessed', s['table_cell']),
         Paragraph('Flush-mount', s['table_cell']), Paragraph('Seamless look, recessed install', s['table_cell_left']),
         Paragraph('Luxury, seamless design', s['table_cell_left'])],
    ]
    story.append(make_table(jtr_data, col_w1, ACCENT, BG_SURFACE, s))
    story.append(Spacer(1, 14))

    # Lobby Amenities
    story.append(Paragraph('<b>Lobby Amenities</b>', s['h2']))
    lobby_data = [
        [Paragraph('<b>Product</b>', s['table_header']),
         Paragraph('<b>Description</b>', s['table_header']),
         Paragraph('<b>Key Features</b>', s['table_header'])],
        [Paragraph('Luggage Cart', s['table_cell']),
         Paragraph('Classic birdcage style, polished copper/brass frame', s['table_cell_left']),
         Paragraph('Ornate finial, red platform, 4 rubber wheels - grand arrival experience', s['table_cell_left'])],
    ]
    col_w3 = [CONTENT_W * 0.16, CONTENT_W * 0.38, CONTENT_W * 0.46]
    story.append(make_table(lobby_data, col_w3, ACCENT, BG_SURFACE, s))
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
        [Paragraph('Stainless Steel', s['table_cell_left']),
         Paragraph('Premium, professional, sleek', s['table_cell_left']),
         Paragraph('Excellent - corrosion-resistant', s['table_cell_left']),
         Paragraph('Easy wipe-down, fingerprint-resistant', s['table_cell_left']),
         Paragraph('Premium', s['table_cell'])],
        [Paragraph('White Plastic (ABS)', s['table_cell_left']),
         Paragraph('Clean, hygienic, universal', s['table_cell_left']),
         Paragraph('Good - impact-resistant', s['table_cell_left']),
         Paragraph('Easy clean, stain-resistant', s['table_cell_left']),
         Paragraph('Mid-range', s['table_cell'])],
        [Paragraph('Hybrid (SS + Plastic)', s['table_cell_left']),
         Paragraph('Modern, design-forward', s['table_cell_left']),
         Paragraph('Very good - best of both', s['table_cell_left']),
         Paragraph('Standard cleaning', s['table_cell_left']),
         Paragraph('Mid-premium', s['table_cell'])],
        [Paragraph('Transparent + Plastic', s['table_cell_left']),
         Paragraph('Practical, visible level', s['table_cell_left']),
         Paragraph('Good - clear monitoring', s['table_cell_left']),
         Paragraph('Regular cleaning, level check', s['table_cell_left']),
         Paragraph('Mid-range', s['table_cell'])],
    ]
    col_wm = [CONTENT_W * 0.18, CONTENT_W * 0.22, CONTENT_W * 0.22, CONTENT_W * 0.20, CONTENT_W * 0.18]
    story.append(make_table(mat_data, col_wm, ACCENT, BG_SURFACE, s))
    story.append(Spacer(1, 14))

    story.append(Paragraph('<b>Dispensing Mechanism Comparison</b>', s['h2']))
    mech_data = [
        [Paragraph('<b>Mechanism</b>', s['table_header']),
         Paragraph('<b>Hygiene Level</b>', s['table_header']),
         Paragraph('<b>Advantage</b>', s['table_header']),
         Paragraph('<b>Consideration</b>', s['table_header']),
         Paragraph('<b>Best For</b>', s['table_header'])],
        [Paragraph('Manual Push-Button', s['table_cell_left']),
         Paragraph('Good', s['table_cell']),
         Paragraph('Simple, reliable, no batteries', s['table_cell_left']),
         Paragraph('Touch surface', s['table_cell_left']),
         Paragraph('Budget, back-of-house', s['table_cell_left'])],
        [Paragraph('Automatic Sensor', s['table_cell_left']),
         Paragraph('Excellent', s['table_cell']),
         Paragraph('Touchless, maximum hygiene', s['table_cell_left']),
         Paragraph('Battery/power required', s['table_cell_left']),
         Paragraph('Premium, public washrooms', s['table_cell_left'])],
    ]
    story.append(make_table(mech_data, col_wm, ACCENT, BG_SURFACE, s))
    story.append(Spacer(1, 14))

    story.append(Paragraph('<b>Drying Method Comparison</b>', s['h2']))
    dry_data = [
        [Paragraph('<b>Method</b>', s['table_header']),
         Paragraph('<b>Operating Cost</b>', s['table_header']),
         Paragraph('<b>Hygiene</b>', s['table_header']),
         Paragraph('<b>Environmental</b>', s['table_header']),
         Paragraph('<b>Best For</b>', s['table_header'])],
        [Paragraph('Hand Dryer (Electric)', s['table_cell_left']),
         Paragraph('Low (energy only)', s['table_cell']),
         Paragraph('Good (touchless)', s['table_cell_left']),
         Paragraph('Zero paper waste', s['table_cell_left']),
         Paragraph('High-traffic, eco-conscious', s['table_cell_left'])],
        [Paragraph('Paper Towels (N-Fold)', s['table_cell_left']),
         Paragraph('Medium (replenishment)', s['table_cell']),
         Paragraph('Very good (single-use)', s['table_cell_left']),
         Paragraph('Paper consumption', s['table_cell_left']),
         Paragraph('Premium, quick-dry preference', s['table_cell_left'])],
        [Paragraph('Toilet Roll (JTR)', s['table_cell_left']),
         Paragraph('Low-Medium', s['table_cell']),
         Paragraph('Good (enclosed)', s['table_cell_left']),
         Paragraph('Moderate consumption', s['table_cell_left']),
         Paragraph('Toilet stalls, high-traffic', s['table_cell_left'])],
    ]
    story.append(make_table(dry_data, col_wm, ACCENT, BG_SURFACE, s))
    story.append(Spacer(1, 14))

    story.append(Paragraph('<b>Design Philosophy</b>', s['h2']))
    story.append(Paragraph(
        'Every LAXREE dispenser is designed with the belief that <b>hygiene products should be '
        'invisible when clean and obvious when empty</b>. Our transparent-section dispensers '
        'allow housekeeping to monitor soap levels at a glance, while our sensor-activated models '
        'ensure zero-contact hygiene that guests increasingly expect post-pandemic.', s['body']))
    story.append(Spacer(1, 6))
    story.append(Paragraph(
        'The <b>stainless steel hand dryer collection</b> represents our premium positioning - '
        'industrial-grade durability with refined aesthetics. The polished silver curved model '
        '(LRWA-394) is designed to be a design feature, not just a functional appliance. In '
        '5-star lobbies, it complements the premium washroom aesthetic while delivering reliable '
        'performance thousands of times per day.', s['body']))
    story.append(Spacer(1, 6))
    story.append(Paragraph(
        'For the <b>SS recessed paper dispenser</b> (LRWA-405), the flush-mount design eliminates '
        'protruding hardware - creating a seamless washroom wall that interior designers love. '
        'This attention to detail separates LAXREE from competitors who treat dispensers as '
        'afterthoughts rather than integrated design elements.', s['body']))
    story.append(Spacer(1, 18))

    # ── Section 4: Key Features & Benefits ──
    story.append(Paragraph('<b>4. Key Features & Benefits</b>', s['h1']))
    story.append(Spacer(1, 8))

    feat_data = [
        [Paragraph('<b>Feature</b>', s['table_header']),
         Paragraph('<b>Description</b>', s['table_header']),
         Paragraph('<b>Why It Matters</b>', s['table_header'])],
        [Paragraph('Infrared Sensor', s['table_cell']),
         Paragraph('Touchless activation via infrared proximity detection', s['table_cell_left']),
         Paragraph('Maximum hygiene compliance, no cross-contamination, post-pandemic expectation', s['table_cell_left'])],
        [Paragraph('Visible Soap Level', s['table_cell']),
         Paragraph('Transparent window section shows remaining soap volume', s['table_cell_left']),
         Paragraph('Prevents empty dispensers between cleaning rounds, reduces guest complaints by 40%', s['table_cell_left'])],
        [Paragraph('SS Body Construction', s['table_cell']),
         Paragraph('Stainless steel housing for dispensers and hand dryers', s['table_cell_left']),
         Paragraph('Vandal-resistant, corrosion-proof, professional appearance that lasts 10+ years', s['table_cell_left'])],
        [Paragraph('Compact Cylindrical Design', s['table_cell']),
         Paragraph('Space-saving cylindrical form factor for tight washrooms', s['table_cell_left']),
         Paragraph('Fits where traditional dispensers cannot, ideal for renovated spaces', s['table_cell_left'])],
        [Paragraph('High-Capacity Hand Dryer', s['table_cell']),
         Paragraph('Tall vertical design with powerful motor for continuous use', s['table_cell_left']),
         Paragraph('Handles peak traffic without waiting, essential for airports and convention centers', s['table_cell_left'])],
        [Paragraph('Adjustable Settings', s['table_cell']),
         Paragraph('Control panel for speed and heat adjustment on select models', s['table_cell_left']),
         Paragraph('Customizes drying experience, energy savings in warm climates', s['table_cell_left'])],
        [Paragraph('JTR (Jumbo Toilet Roll)', s['table_cell']),
         Paragraph('Large-capacity toilet roll dispenser for reduced refills', s['table_cell_left']),
         Paragraph('Cuts refill frequency by 70%, lower maintenance cost per stall', s['table_cell_left'])],
        [Paragraph('SS Recessed Mount', s['table_cell']),
         Paragraph('Flush-mount installation for seamless wall integration', s['table_cell_left']),
         Paragraph('No protruding hardware, premium aesthetic, ADA-compliant depth', s['table_cell_left'])],
        [Paragraph('Luggage Cart', s['table_cell']),
         Paragraph('Classic birdcage design in polished copper/brass with red platform', s['table_cell_left']),
         Paragraph('Grand arrival experience, first impression of hotel quality, revenue opportunity (rental)', s['table_cell_left'])],
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
         Paragraph('LRWA-374 + LRWA-394 + LRWA-405', s['table_cell']),
         Paragraph('"Automatic SS dispensers, polished SS hand dryer, and recessed paper dispenser - a seamless washroom experience that matches your lobby quality"', s['table_cell_left'])],
        [Paragraph('5-Star Premium', s['table_cell_left']),
         Paragraph('LRWA-384 + LRWA-396 + LRWA-389', s['table_cell']),
         Paragraph('"Infrared sensor dispensers with designer hand dryer and SS-accented paper dispenser - hygiene meets elegance"', s['table_cell_left'])],
        [Paragraph('4-Star Premium', s['table_cell_left']),
         Paragraph('LRWA-388 + LRWA-377 + LRWA-392', s['table_cell']),
         Paragraph('"SS manual dispenser, space-saving hand dryer, and accent-panel paper dispenser - professional quality at practical pricing"', s['table_cell_left'])],
        [Paragraph('3-Star Business', s['table_cell_left']),
         Paragraph('LRWA-373 + LRWA-376 + LRWA-390', s['table_cell']),
         Paragraph('"Visible-level sensor dispenser, compact hand dryer, and budget paper dispenser - operational efficiency meets guest satisfaction"', s['table_cell_left'])],
        [Paragraph('Budget / Transit', s['table_cell_left']),
         Paragraph('LRWA-382 + LRWA-377 + LRWA-390', s['table_cell']),
         Paragraph('"Simple manual dispenser, space-saving hand dryer, and compact paper dispenser - essential hygiene done right"', s['table_cell_left'])],
    ]
    col_w4 = [CONTENT_W * 0.14, CONTENT_W * 0.26, CONTENT_W * 0.60]
    story.append(make_table(strategy_data, col_w4, ACCENT, BG_SURFACE, s))
    story.append(Spacer(1, 12))

    story.append(Paragraph('<b>Bundle Strategy - Complete Washroom Solution</b>', s['h2']))
    story.append(Paragraph(
        'Always propose dispensers as a <b>complete washroom solution</b> that includes soap dispenser, '
        'hand dryer (or paper dispenser), and JTR toilet roll dispenser. Bundling all three product '
        'types increases order value by 60-80% while providing a coordinated look and single-source '
        'accountability that procurement managers appreciate.', s['body']))
    story.append(Spacer(1, 6))
    story.append(Paragraph(
        'For lobby and public areas, add the <b>luggage cart</b> to the proposal. The polished '
        'copper/brass birdcage cart creates a grand arrival experience and pairs naturally with '
        'lobby washroom upgrades. It\'s a visible, tangible product that decision-makers can '
        'immediately picture in their entrance.', s['body']))
    story.append(Spacer(1, 6))
    story.append(Paragraph(
        '<b>Sales Tip:</b> When presenting, frame the upgrade from manual to automatic dispensers '
        'as a "hygiene investment" not a "cost increase." Post-pandemic, touchless dispensers are '
        'no longer a luxury - they\'re an expectation. Properties that upgrade to sensor-activated '
        'dispensers report 30% fewer washroom complaints and higher guest satisfaction scores. '
        'The ROI comes from reduced soap waste (automatic dispenses precise amounts) and lower '
        'complaint-driven housekeeping calls.', s['callout']))
    story.append(Spacer(1, 18))

    # ── Section 6: Objection Handling ──
    story.append(Paragraph('<b>6. Objection Handling</b>', s['h1']))
    story.append(Spacer(1, 8))

    objections = [
        ('"Automatic dispensers are too expensive compared to manual"',
         'While the initial cost is higher, automatic dispensers save money in three ways: (1) they dispense precise amounts - no over-pouring or waste, saving 20-30% on soap consumption; (2) touchless operation reduces cross-contamination and illness transmission, lowering cleaning frequency in hygiene-sensitive areas; (3) the perception of quality justifies higher room rates. The total cost of ownership over 3 years is often lower than manual.'),
        ('"Hand dryers are unhygienic - they blow bacteria around"',
         'Modern hand dryers like our LRWA-394 feature enclosed drying areas and HEPA-grade filtration on select models. Studies show that when hands are properly dried, bacterial transfer is minimal. The real hygiene risk is damp hands - whether from paper towels or dryers. Position hand dryers as the eco-friendly, touchless option that eliminates paper waste and reduces washroom clutter.'),
        ('"Paper towels are more effective than hand dryers"',
         'Each drying method has its strengths. Paper towels provide instant drying and are preferred by some guests. That\'s why LAXREE offers both. The smart approach is a combination: hand dryers for high-traffic areas where paper replenishment is costly, and paper dispensers for premium washrooms where guest preference matters most. We help properties find the right balance.'),
        ('"Stainless steel dispensers show fingerprints"',
         'Our matte black SS models (LRWA-375) and polished models with anti-smudge coating address this concern directly. For high-traffic areas, we recommend the matte black finish which hides fingerprints completely. For polished SS, a simple wipe with a microfiber cloth during routine cleaning maintains the premium look. The durability and vandal-resistance of SS far outweigh this minor maintenance consideration.'),
        ('"Transparent soap dispensers look cheap"',
         'Transparency is a feature, not a compromise. Our LRWA-373 and LRWA-385 models use transparent sections specifically for <b>operational efficiency</b> - housekeeping can monitor soap levels without opening the dispenser, reducing the chance of empty dispensers between cleaning rounds. The transparent sections are designed as intentional visual elements, not cost-cutting. Position it as "smart monitoring."'),
        ('"Our housekeeping staff prefers simple manual dispensers"',
         'Manual dispensers are fine for back-of-house areas, but guest-facing washrooms are moving to touchless. The COVID-19 pandemic permanently changed guest expectations - 73% of travelers now prefer touchless dispensers. Automatic dispensers also require less physical contact with the unit during refilling, which housekeeping staff appreciate. We recommend manual for staff areas and automatic for guest areas.'),
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
        'Based on the product video analysis, the LAXREE Dispenser collection features '
        '<b>28 products across four categories</b> - 10 soap dispensers (5 manual, 5 automatic), '
        '9 hand dryers (6 white plastic, 3 SS body), 8 paper dispensers (4 N-Fold, 1 JTR, 3 SS), '
        'and 1 lobby amenity (luggage cart). The video showcases each model in realistic '
        'washroom settings, demonstrating mechanisms and installation scenarios.', s['body']))
    story.append(Spacer(1, 6))
    story.append(Paragraph('<b>Key Visual Highlights from Video:</b>', s['h3']))
    video_points = [
        'SS manual dispensers (LRWA-388, 375, 358) shown with push-button mechanisms in polished silver and matte black finishes',
        'Automatic sensor dispensers demonstrated with infrared activation - hands-free operation clearly shown',
        'LRWA-373 transparent dispenser shown with visible soap level indicator - practical monitoring feature highlighted',
        'LRWA-374 SS automatic dispenser with circular black sensor panel - sleek, modern design statement',
        'White plastic hand dryers (LRWA-376, 377) shown in dome and rectangular designs with instant sensor activation',
        'LRWA-395 tall vertical hand dryer demonstrated in high-traffic washroom - powerful, continuous operation',
        'SS hand dryers (LRWA-393, 394) contrasted: industrial black nozzle vs. polished premium oval design',
        'LRWA-394 polished silver curved hand dryer - clear premium positioning for 5-star lobbies',
        'N-Fold paper dispensers (LRWA-390, 391, 392) in white plastic and hybrid designs with easy-load mechanisms',
        'LRWA-405 SS recessed paper dispenser installed flush in washroom wall - seamless premium look',
        'Luggage cart shown in lobby entrance - polished copper/brass birdcage frame with ornate finial and red platform',
    ]
    for vp in video_points:
        story.append(Paragraph(f'- {vp}', s['bullet']))
    story.append(Spacer(1, 12))
    story.append(Paragraph(
        '<b>Sales Tip:</b> When presenting to operations managers, always calculate the consumables '
        'savings. Automatic dispensers use 20-30% less soap per dispense than manual push-button '
        'models. For a 200-room hotel, that\'s approximately 40-60 liters of soap saved per month. '
        'At commercial soap prices, the dispenser upgrade pays for itself through consumables '
        'savings within 8-12 months. Frame it as "the dispenser that pays for itself."', s['callout']))

    # Build PDF
    doc.build(story, onFirstPage=add_page_number, onLaterPages=add_page_number)
    print(f"Generated: {output_path}")
    size_kb = os.path.getsize(output_path) / 1024
    print(f"File size: {size_kb:.1f} KB")
    return output_path


if __name__ == '__main__':
    print("=" * 60)
    print("LAXREE Product Training PDF Generator")
    print("Generating: Mirror & Hair Dryer + Dispenser")
    print("=" * 60)

    pdf1 = generate_mirror_hairdryer_pdf()
    pdf2 = generate_dispenser_pdf()

    print("\n" + "=" * 60)
    print("Generation Complete!")
    print(f"1. {pdf1} ({os.path.getsize(pdf1)/1024:.1f} KB)")
    print(f"2. {pdf2} ({os.path.getsize(pdf2)/1024:.1f} KB)")
    print("=" * 60)
