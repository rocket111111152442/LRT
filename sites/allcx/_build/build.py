# -*- coding: utf-8 -*-
"""
Générateur du site ALLCX.

Assemble l'en-tête, le pied de page et le <head> communs, puis écrit les pages
HTML statiques dans sites/allcx/. Le HTML produit est autonome : il n'a besoin
d'aucun serveur applicatif, seulement d'un hébergement de fichiers.

    python3 _build/build.py

Modifier le menu, le pied de page ou les coordonnées ici, puis relancer.
"""
import io
import sys
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# ---------------------------------------------------------------------------
# Coordonnées — à ajuster ici une seule fois
# ---------------------------------------------------------------------------
SITE_URL = "https://allcx-consulting.com"

CONSULTING_MAIL = "contact@allcx-consulting.com"
PATRIMOINE_MAIL = "patrimoine@allcx-consulting.com"
LINKEDIN = ""  # renseigner l'URL du profil pour afficher le lien

SIRET = "908 081 771 00010"
CARTE_T = "CPI 4202 2022 000 000 020"
CARTE_T_FIN = "09/08/2028"
CARTE_T_CCI = "CCI de Lyon Métropole Saint-Étienne Roanne"

TODO = '<span class="todo" title="Information à compléter avant mise en ligne">à compléter</span>'

# ---------------------------------------------------------------------------
# Marques
# ---------------------------------------------------------------------------
MARK_CONSULTING = (
    '<svg class="logo__mark" viewBox="0 0 40 40" aria-hidden="true" focusable="false">'
    '<circle cx="20" cy="20" r="18.4" fill="none" stroke="currentColor" stroke-width="1.2"/>'
    '<path d="M11.6 28.6 20 10.4l8.4 18.2" fill="none" stroke="currentColor" stroke-width="1.7" '
    'stroke-linecap="square" stroke-linejoin="miter"/>'
    '<path d="M15.4 22.6h9.2" stroke="currentColor" stroke-width="1.2"/>'
    '</svg>'
)

MARK_PATRIMOINE = (
    '<svg class="logo__mark" viewBox="0 0 40 40" aria-hidden="true" focusable="false">'
    '<path d="M7.4 33.6V20.4a12.6 12.6 0 0 1 25.2 0v13.2" fill="none" stroke="currentColor" stroke-width="1.3"/>'
    '<path d="M20 12.8v20.8" stroke="currentColor" stroke-width="0.9" stroke-opacity="0.55"/>'
    '<path d="M17.5 6.4h5l-1 6.4h-3z" fill="currentColor"/>'
    '<path d="M3.2 36.4h33.6" stroke="currentColor" stroke-width="1.3"/>'
    '</svg>'
)

MARK_PORTAL = (
    '<svg class="logo__mark" viewBox="0 0 40 40" aria-hidden="true" focusable="false">'
    '<path d="M20 1.6 38.4 20 20 38.4 1.6 20z" fill="none" stroke="currentColor" stroke-width="1.1"/>'
    '<path d="M12.8 27.4 20 11.6l7.2 15.8" fill="none" stroke="currentColor" stroke-width="1.6"/>'
    '<path d="M16 21.8h8" stroke="currentColor" stroke-width="1.1"/>'
    '</svg>'
)

# ---------------------------------------------------------------------------
# Navigation
# ---------------------------------------------------------------------------
NAV = {
    "consulting": [
        ("index.html", "Accueil"),
        ("expertises.html", "Expertises"),
        ("afrique.html", "Afrique francophone"),
        ("formation.html", "Formation"),
        ("cabinet.html", "Le cabinet"),
        ("contact.html", "Contact"),
    ],
    "patrimoine": [
        ("index.html", "Accueil"),
        ("investissement.html", "Investissement"),
        ("acquisition.html", "Acquisition"),
        ("relocation.html", "Relocation"),
        ("biens.html", "Les biens"),
        ("contact.html", "Contact"),
    ],
}

BRAND_INFO = {
    "consulting": {
        "name": "ALLCX",
        "sub": "Consulting",
        "mark": MARK_CONSULTING,
        "mail": CONSULTING_MAIL,
        "cta": ("contact.html", "Prendre rendez-vous"),
        "baseline": "Conseil en management, développement commercial et formation.",
    },
    "patrimoine": {
        "name": "ALLCX",
        "sub": "Patrimoine",
        "mark": MARK_PATRIMOINE,
        "mail": PATRIMOINE_MAIL,
        "cta": ("contact.html", "Nous confier un projet"),
        "baseline": "Transactions sur immeubles et fonds de commerce.",
    },
}

ARROW = '<svg class="arw" width="14" height="10" viewBox="0 0 14 10" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M0 5h12M8.4 1.2 12.6 5l-4.2 3.8"/></svg>'


# ---------------------------------------------------------------------------
# Gabarits
# ---------------------------------------------------------------------------
def head(brand, title, description, path, fonts):
    """<head> complet d'une page."""
    canonical = SITE_URL + "/" + path
    prefix = "../" if "/" in path else ""
    org = json_ld(brand, prefix)
    return f"""<!DOCTYPE html>
<html lang="fr" class="no-js">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title}</title>
<meta name="description" content="{description}">
<link rel="canonical" href="{canonical}">
<meta name="theme-color" content="#75162A">
<meta property="og:type" content="website">
<meta property="og:locale" content="fr_FR">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{description}">
<meta property="og:url" content="{canonical}">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="{prefix}assets/img/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="{fonts}">
<link rel="stylesheet" href="{prefix}assets/css/allcx.css">
{org}
</head>"""


def json_ld(brand, prefix):
    if brand == "consulting":
        return (
            '<script type="application/ld+json">'
            '{"@context":"https://schema.org","@type":"ProfessionalService",'
            '"name":"ALLCX Consulting",'
            '"description":"Conseil en management et developpement commercial, formation commerciale, '
            'apport d\'affaires. France et Afrique francophone.",'
            f'"url":"{SITE_URL}/consulting/","email":"{CONSULTING_MAIL}",'
            '"areaServed":["France","Afrique francophone"],'
            f'"identifier":"SIRET {SIRET}"' + "}</script>"
        )
    if brand == "patrimoine":
        return (
            '<script type="application/ld+json">'
            '{"@context":"https://schema.org","@type":"RealEstateAgent",'
            '"name":"ALLCX Patrimoine",'
            '"description":"Transactions sur immeubles et fonds de commerce : investissement locatif, '
            'acquisition de residence, fonds de commerce, relocation.",'
            f'"url":"{SITE_URL}/patrimoine/","email":"{PATRIMOINE_MAIL}",'
            '"areaServed":"France",'
            f'"identifier":"Carte professionnelle {CARTE_T}"' + "}</script>"
        )
    return ""


def header(brand, current):
    info = BRAND_INFO[brand]
    links = []
    drawer_links = []
    for href, label in NAV[brand]:
        cur = ' aria-current="page"' if href == current else ""
        links.append(f'<a href="{href}"{cur}>{label}</a>')
        drawer_links.append(f'<a href="{href}"{cur}>{label}</a>')
    cta_href, cta_label = info["cta"]
    return f"""<a class="skip-link" href="#contenu">Aller au contenu</a>
<header class="site-header" data-header>
  <div class="shell header-inner">
    <a class="logo" href="index.html" aria-label="ALLCX {info['sub']} — accueil">
      {info['mark']}
      <span class="logo__type">
        <span class="logo__name">{info['name']}</span>
        <span class="logo__sub">{info['sub']}</span>
      </span>
    </a>
    <nav class="nav" aria-label="Navigation principale">
      {''.join(links)}
    </nav>
    <a class="btn header-cta" href="{cta_href}"><span>{cta_label}</span></a>
    <button class="burger" type="button" data-burger aria-expanded="false" aria-controls="menu-mobile">
      <span></span><span></span>
      <span class="sr-only">Ouvrir le menu</span>
    </button>
  </div>
</header>
<div class="drawer" id="menu-mobile" data-drawer aria-hidden="true">
  <nav aria-label="Navigation mobile">{''.join(drawer_links)}</nav>
  <div class="drawer__foot">
    <a href="mailto:{info['mail']}">{info['mail']}</a>
    <span>{info['baseline']}</span>
  </div>
</div>"""


def footer(brand):
    info = BRAND_INFO[brand]
    nav_links = "".join(f'<li><a href="{h}">{l}</a></li>' for h, l in NAV[brand][1:])
    if brand == "consulting":
        col3 = """<h4>Interventions</h4>
        <ul>
          <li>France entière</li>
          <li>Afrique de l'Ouest francophone</li>
          <li>Afrique centrale francophone</li>
          <li>Missions à distance et sur site</li>
        </ul>"""
        legal = (
            f"ALLCX CONSULTING — Société par actions simplifiée. SIRET {SIRET}. "
            "Activité : conseil pour les affaires et autres conseils de gestion (APE 70.22Z). "
            "Les actions de formation proposées relèvent de la formation professionnelle non réglementée."
        )
    else:
        col3 = f"""<h4>Activité réglementée</h4>
        <ul>
          <li>Carte professionnelle<br>« Transactions sur immeubles et fonds de commerce »</li>
          <li>N° {CARTE_T}</li>
          <li>Valable jusqu'au {CARTE_T_FIN}</li>
          <li>Délivrée par la {CARTE_T_CCI}</li>
        </ul>"""
        legal = (
            f"ALLCX PATRIMOINE — marque exploitée par une société par actions simplifiée immatriculée sous le SIRET {SIRET}. "
            f"Titulaire de la carte professionnelle « Transactions sur immeubles et fonds de commerce » n° {CARTE_T}, "
            f"délivrée par la {CARTE_T_CCI}, valable jusqu'au {CARTE_T_FIN}. "
            "Les honoraires applicables sont consultables sur la page Honoraires."
        )
    extra = '<li><a href="honoraires.html">Honoraires</a></li>' if brand == "patrimoine" else ""
    return f"""<footer class="site-footer">
  <div class="shell">
    <div class="footer-grid">
      <div>
        <a class="logo" href="index.html">
          {info['mark']}
          <span class="logo__type">
            <span class="logo__name">{info['name']}</span>
            <span class="logo__sub">{info['sub']}</span>
          </span>
        </a>
        <p class="footer-note">{info['baseline']}</p>
      </div>
      <div>
        <h4>Navigation</h4>
        <ul>{nav_links}</ul>
      </div>
      <div>{col3}</div>
      <div>
        <h4>Contact</h4>
        <ul>
          <li><a href="mailto:{info['mail']}">{info['mail']}</a></li>
          <li>Téléphone : {TODO}</li>
          <li>{TODO}<br>France</li>
        </ul>
      </div>
    </div>
    <div class="footer-bottom">
      <span>© <span data-year>2026</span> ALLCX. Tous droits réservés.</span>
      <ul>
        <li><a href="mentions-legales.html">Mentions légales</a></li>
        {extra}
        <li><a href="../index.html">Portail ALLCX</a></li>
      </ul>
    </div>
    <p class="footer-legal">{legal}</p>
  </div>
</footer>"""


FONTS_CONSULTING = ("https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600;700"
                    "&family=Inter:wght@300;400;500;600&display=swap")
FONTS_PATRIMOINE = ("https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,400"
                    "&family=Jost:wght@300;400;500;600&display=swap")
FONTS_PORTAL = ("https://fonts.googleapis.com/css2?family=Archivo:wght@500;600"
                "&family=Cormorant+Garamond:wght@300;400;500"
                "&family=Inter:wght@300;400;500&display=swap")

FONTS = {"consulting": FONTS_CONSULTING, "patrimoine": FONTS_PATRIMOINE, "portail": FONTS_PORTAL}


def page(brand, filename, title, description, body):
    """Écrit une page complète."""
    path = filename if brand == "portail" else f"{brand}/{filename}"
    prefix = "../" if "/" in path else ""
    doc = [head(brand, title, description, path, FONTS[brand])]
    doc.append(f'<body data-brand="{brand}">')
    if brand != "portail":
        doc.append(header(brand, filename))
        doc.append('<main id="contenu">')
        doc.append(body)
        doc.append("</main>")
        doc.append(footer(brand))
    else:
        doc.append(body)
    doc.append(f'<script src="{prefix}assets/js/allcx.js" defer></script>')
    doc.append("</body>\n</html>")
    out = os.path.join(ROOT, path)
    os.makedirs(os.path.dirname(out), exist_ok=True)
    io.open(out, "w", encoding="utf-8").write("\n".join(doc) + "\n")
    return path


def cta_block(brand, title, text, primary, secondary=None):
    info = BRAND_INFO[brand]
    sec = ""
    if secondary:
        sec = f'<a class="btn btn--outline-light" href="{secondary[0]}"><span>{secondary[1]}</span></a>'
    ornament = MARK_PATRIMOINE if brand == "patrimoine" else MARK_CONSULTING
    ornament = ornament.replace('class="logo__mark"', 'class="cta__ornament"')
    return f"""<section class="cta">
  {ornament}
  <div class="shell cta__inner">
    <div class="split split--wide-left">
      <div data-reveal>
        <p class="eyebrow" style="color:var(--gold-300)">Parlons de votre projet</p>
        <h2 class="display-lg">{title}</h2>
      </div>
      <div data-reveal>
        <p class="lede">{text}</p>
        <div class="btn-row mt-4">
          <a class="btn btn--light" href="{primary[0]}"><span>{primary[1]}</span></a>
          {sec}
        </div>
        <p class="mt-3" style="font-size:.8125rem;color:rgba(255,255,255,.55)">
          Réponse sous 48 heures ouvrées — <a href="mailto:{info['mail']}" style="color:#fff">{info['mail']}</a>
        </p>
      </div>
    </div>
  </div>
</section>"""


def pagehead(eyebrow, title, lede, crumbs=None, dark=False):
    """Bandeau de page intérieure."""
    items = ['<li><a href="index.html">Accueil</a></li>']
    for c in (crumbs or []):
        items.append(f"<li>{c}</li>")
    cls = "pagehead pagehead--dark" if dark else "pagehead"
    lede_html = f'<p class="lede mt-3" data-reveal>{lede}</p>' if lede else ""
    return f"""<section class="{cls}">
  <div class="shell">
    <nav class="breadcrumb" aria-label="Fil d’ariane"><ol>{''.join(items)}</ol></nav>
    <p class="eyebrow" data-reveal>{eyebrow}</p>
    <h1 class="display-lg" data-reveal>{title}</h1>
    {lede_html}
  </div>
</section>"""


def accordion(items, ident="faq"):
    rows = []
    for i, (q, a) in enumerate(items):
        rows.append(f"""<div class="accordion__item">
      <h3><button class="accordion__btn" type="button" aria-expanded="false" aria-controls="{ident}-p{i}" id="{ident}-b{i}">
        <span>{q}</span><span class="accordion__sign" aria-hidden="true"></span>
      </button></h3>
      <div class="accordion__panel" id="{ident}-p{i}" role="region" aria-labelledby="{ident}-b{i}" data-open="false">
        <div><p>{a}</p></div>
      </div>
    </div>""")
    return f'<div class="accordion" data-accordion data-accordion-single>{"".join(rows)}</div>'


def contact_form(brand, subject, sujets):
    """Formulaire de contact : envoi PHP si disponible, repli mailto sinon."""
    info = BRAND_INFO[brand]
    options = "".join(f'<option value="{s}">{s}</option>' for s in sujets)
    return f"""<form class="form" method="post" action="contact.php"
      data-form="mailto" data-mailto="{info['mail']}" data-subject="{subject}" novalidate>
  <input type="text" name="societe_web" class="hp" tabindex="-1" autocomplete="off" aria-hidden="true">
  <div class="form-grid">
    <div class="field">
      <label for="f-nom">Nom et prénom <span class="req">*</span></label>
      <input id="f-nom" name="nom" type="text" required autocomplete="name">
      <span class="error"></span>
    </div>
    <div class="field">
      <label for="f-societe">Société ou structure</label>
      <input id="f-societe" name="societe" type="text" autocomplete="organization">
      <span class="error"></span>
    </div>
    <div class="field">
      <label for="f-email">Adresse e-mail <span class="req">*</span></label>
      <input id="f-email" name="email" type="email" required autocomplete="email">
      <span class="error"></span>
    </div>
    <div class="field">
      <label for="f-tel">Téléphone</label>
      <input id="f-tel" name="telephone" type="tel" autocomplete="tel">
      <span class="error"></span>
    </div>
    <div class="field field--full">
      <label for="f-sujet">Objet de la demande <span class="req">*</span></label>
      <select id="f-sujet" name="sujet" required>
        <option value="">Sélectionner…</option>
        {options}
      </select>
      <span class="error"></span>
    </div>
    <div class="field field--full">
      <label for="f-message">Votre demande <span class="req">*</span></label>
      <textarea id="f-message" name="message" required minlength="20"
        placeholder="Contexte, objectif, échéance envisagée."></textarea>
      <span class="hint">Vingt caractères minimum. Plus le contexte est précis, plus la réponse sera utile.</span>
      <span class="error"></span>
    </div>
  </div>
  <label class="consent">
    <input type="checkbox" name="consentement" required>
    <span>J’accepte que les informations transmises soient utilisées pour traiter ma demande. Elles ne font
    l’objet d’aucune cession à des tiers. <span class="req">*</span></span>
  </label>
  <div class="form-status" data-form-status role="status" aria-live="polite"></div>
  <div class="btn-row">
    <button class="btn" type="submit"><span>Envoyer la demande</span></button>
  </div>
</form>"""


def main():
    import content_portail, content_consulting, content_consulting_pages
    import content_patrimoine, content_patrimoine_pages

    written = []
    for fn, title, desc, body in content_portail.pages(sys.modules[__name__]):
        written.append(page("portail", fn, title, desc, body))
    for mod in (content_consulting, content_consulting_pages):
        for fn, title, desc, body in mod.pages(sys.modules[__name__]):
            written.append(page("consulting", fn, title, desc, body))
    for mod in (content_patrimoine, content_patrimoine_pages):
        for fn, title, desc, body in mod.pages(sys.modules[__name__]):
            written.append(page("patrimoine", fn, title, desc, body))

    sitemap(written)
    for p in written:
        print("  écrit  " + p)
    print("%d pages générées dans %s" % (len(written), ROOT))


def sitemap(paths):
    urls = []
    for p in sorted(paths):
        loc = SITE_URL + "/" + p
        prio = "1.0" if p == "index.html" else ("0.9" if p.endswith("/index.html") else "0.7")
        urls.append(f"  <url><loc>{loc}</loc><priority>{prio}</priority></url>")
    xml = ('<?xml version="1.0" encoding="UTF-8"?>\n'
           '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
           + "\n".join(urls) + "\n</urlset>\n")
    io.open(os.path.join(ROOT, "sitemap.xml"), "w", encoding="utf-8").write(xml)
    robots = "User-agent: *\nAllow: /\n\nSitemap: %s/sitemap.xml\n" % SITE_URL
    io.open(os.path.join(ROOT, "robots.txt"), "w", encoding="utf-8").write(robots)




def legal_page(brand):
    """Mentions légales, communes aux deux marques, avec les blocs propres à chacune."""
    info = BRAND_INFO[brand]
    label = "ALLCX Consulting" if brand == "consulting" else "ALLCX Patrimoine"
    intro = (
        "Le présent site présente l’activité de conseil pour les affaires et autres conseils de gestion "
        "exercée sous la marque ALLCX Consulting."
        if brand == "consulting" else
        "Le présent site présente l’activité de transactions sur immeubles et fonds de commerce exercée "
        "sous la marque ALLCX Patrimoine."
    )
    if brand == "patrimoine":
        reglemente = f"""<h2>Activité réglementée</h2>
      <p>L’activité de transaction sur immeubles et fonds de commerce est régie par la loi n° 70-9 du
      2 janvier 1970 et par le décret n° 72-678 du 20 juillet 1972.</p>
      <ul>
        <li>Carte professionnelle « Transactions sur immeubles et fonds de commerce » n° {CARTE_T}</li>
        <li>Délivrée par la {CARTE_T_CCI}</li>
        <li>Valable jusqu’au {CARTE_T_FIN}</li>
        <li>Garantie financière : {TODO} — à défaut de garantie financière, mention obligatoire de la
        non-détention de fonds, effets ou valeurs</li>
        <li>Assurance de responsabilité civile professionnelle : {TODO} (assureur, n° de contrat, couverture géographique)</li>
      </ul>
      <p>Les honoraires pratiqués sont affichés sur la page <a href="honoraires.html">Honoraires</a>,
      conformément à l’arrêté du 10 janvier 2017 relatif à l’information des consommateurs par les
      professionnels intervenant dans une transaction immobilière.</p>

      <h2>Médiation de la consommation</h2>
      <p>Conformément aux articles L. 612-1 et suivants du code de la consommation, tout consommateur a le
      droit de recourir gratuitement à un médiateur de la consommation en vue de la résolution amiable d’un
      litige. Médiateur désigné : {TODO} (nom, adresse postale et site internet du médiateur).</p>"""
        mediation = ""
    else:
        reglemente = ""
        mediation = f"""<h2>Médiation de la consommation</h2>
      <p>Pour les prestations conclues avec un consommateur, conformément aux articles L. 612-1 et suivants
      du code de la consommation, le client peut recourir gratuitement à un médiateur de la consommation.
      Médiateur désigné : {TODO}.</p>"""

    body = pagehead(
        "Informations légales",
        "Mentions légales.",
        "Éditeur, hébergement, propriété intellectuelle et traitement des données personnelles.",
        crumbs=["Mentions légales"],
    ) + f"""
<section class="section">
  <div class="shell shell--narrow prose" data-reveal>
      <p>{intro}</p>

      <h2>Éditeur du site</h2>
      <ul>
        <li>Dénomination sociale : ALLCX CONSULTING</li>
        <li>Forme juridique : société par actions simplifiée (SAS)</li>
        <li>Capital social : {TODO}</li>
        <li>Siège social : {TODO}</li>
        <li>SIRET : {SIRET}</li>
        <li>RCS : {TODO}</li>
        <li>Numéro de TVA intracommunautaire : {TODO}</li>
        <li>Code APE : 70.22Z — Conseil pour les affaires et autres conseils de gestion</li>
        <li>Courriel : <a href="mailto:{info['mail']}">{info['mail']}</a></li>
        <li>Téléphone : {TODO}</li>
      </ul>

      <h2>Directeur de la publication</h2>
      <p>Fabrice Ekissi, en qualité de représentant légal de la société éditrice.</p>

      <h2>Hébergement</h2>
      <p>Le site est hébergé par IONOS SARL, 7 place de la Gare, BP 70109, 57200 Sarreguemines Cedex,
      France — <a href="https://www.ionos.fr" rel="noopener">www.ionos.fr</a>.</p>

      {reglemente}

      <h2>Propriété intellectuelle</h2>
      <p>L’ensemble des éléments composant ce site — textes, illustrations, identité visuelle, structure et
      code — est protégé par le droit de la propriété intellectuelle. Toute reproduction ou représentation,
      totale ou partielle, sans autorisation écrite préalable est interdite.</p>
      <p>Les marques et logotypes de tiers éventuellement cités demeurent la propriété de leurs titulaires
      respectifs et ne sont mentionnés qu’à titre de référence.</p>

      <h2>Données personnelles</h2>
      <p>Les informations transmises via le formulaire de contact sont destinées au seul traitement de la
      demande. Elles ne font l’objet d’aucune cession, location ou revente à des tiers.</p>
      <ul>
        <li>Responsable de traitement : ALLCX CONSULTING</li>
        <li>Finalité : réponse aux demandes de contact et suivi de la relation commerciale</li>
        <li>Base légale : intérêt légitime et mesures précontractuelles</li>
        <li>Destinataires : le responsable de traitement et, le cas échéant, son prestataire de messagerie</li>
        <li>Durée de conservation : trois ans à compter du dernier contact</li>
      </ul>
      <p>Conformément au règlement (UE) 2016/679 et à la loi « informatique et libertés », vous disposez
      d’un droit d’accès, de rectification, d’effacement, de limitation, d’opposition et de portabilité.
      Ces droits s’exercent par courriel à <a href="mailto:{info['mail']}">{info['mail']}</a>. Vous pouvez
      également introduire une réclamation auprès de la CNIL
      (<a href="https://www.cnil.fr" rel="noopener">www.cnil.fr</a>).</p>

      <h2>Cookies et mesure d’audience</h2>
      <p>Ce site ne dépose aucun cookie de mesure d’audience, de publicité ou de réseau social. Seules les
      polices de caractères sont chargées depuis un service tiers (Google Fonts), ce qui implique la
      transmission de votre adresse IP à ce service au moment du chargement des pages. Aucun traceur n’est
      installé sur votre terminal.</p>

      <h2>Liens hypertextes</h2>
      <p>Les liens vers des sites tiers sont fournis à titre d’information. L’éditeur n’exerce aucun
      contrôle sur leur contenu et décline toute responsabilité à leur égard.</p>

      <h2>Responsabilité</h2>
      <p>Les informations publiées sur ce site sont fournies à titre indicatif et n’ont pas valeur
      d’engagement contractuel. Seules les propositions écrites et signées engagent l’éditeur.</p>

      {mediation}

      <h2>Droit applicable</h2>
      <p>Le présent site et les mentions qui y figurent sont soumis au droit français. En cas de litige et
      à défaut de résolution amiable, les tribunaux français seront seuls compétents.</p>

      <p class="mt-6 muted" style="font-size:.8125rem">Dernière mise à jour : {TODO}.</p>
  </div>
</section>"""

    return (
        "mentions-legales.html",
        f"Mentions légales | {label}",
        f"Mentions légales de {label} : éditeur, hébergement, propriété intellectuelle, "
        "données personnelles et droit applicable.",
        body,
    )


if __name__ == "__main__":
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    main()
