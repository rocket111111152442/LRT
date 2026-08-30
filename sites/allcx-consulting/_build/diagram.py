# -*- coding: utf-8 -*-
"""Schéma des marchés couverts en Afrique francophone (SVG en ligne)."""

ORIGIN = (62, 262)
NODE_X = 452
RULE_X = 430
LABEL_X = 470

ZONES = [
    ("Afrique du Nord", ["Casablanca", "Tunis"]),
    ("Afrique de l’Ouest", ["Dakar", "Abidjan", "Lomé", "Cotonou"]),
    ("Afrique centrale", ["Douala", "Libreville", "Kinshasa"]),
]


def network():
    rows, groups = [], []
    y = 48
    for zone, cities in ZONES:
        top = y
        for city in cities:
            rows.append((y, city))
            y += 46
        groups.append((zone, y - 46 if len(cities) else top, top))
        y += 26
    groups = [(zone, top, bottom) for (zone, bottom, top) in groups]

    parts = ['<svg class="diagram" viewBox="0 0 760 %d" role="img" '
             'aria-label="Schéma : marchés suivis en Afrique francophone, depuis la France.">' % (y + 10)]

    for cy, city in rows:
        parts.append('<path class="d-arc" d="M%d %d C 210 %d, 300 %d, %d %d"/>'
                     % (ORIGIN[0] + 10, ORIGIN[1], ORIGIN[1], cy, NODE_X - 8, cy))

    parts.append('<circle class="d-node" cx="%d" cy="%d" r="6"/>' % ORIGIN)
    parts.append('<circle cx="%d" cy="%d" r="17" fill="none" stroke="currentColor" stroke-opacity="0.28" '
                 'stroke-dasharray="2 5"/>' % ORIGIN)
    parts.append('<text class="d-origin" x="%d" y="%d" text-anchor="middle">France</text>'
                 % (ORIGIN[0] + 6, ORIGIN[1] + 44))

    for zone, top, bottom in groups:
        parts.append('<line class="d-rule" x1="%d" y1="%d" x2="%d" y2="%d"/>' % (RULE_X, top - 14, RULE_X, bottom + 14))
        parts.append('<text class="d-zone" transform="translate(%d %d) rotate(-90)" text-anchor="middle">%s</text>'
                     % (RULE_X - 12, (top + bottom) / 2, zone))

    for cy, city in rows:
        parts.append('<circle class="d-node" cx="%d" cy="%d" r="4"/>' % (NODE_X, cy))
        parts.append('<text class="d-city" x="%d" y="%d" dominant-baseline="middle">%s</text>' % (LABEL_X, cy, city))

    parts.append('</svg>')
    return "".join(parts)
