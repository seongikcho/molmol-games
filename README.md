# MOLMOL GAMES — 몰몰게임즈 (`molmol.games`)

Static multipage official website for **Molmol Games / 몰몰게임즈** (Seongsu, Seoul · Original IP Game Studio).

- **Live URL**: [https://seongikcho.github.io/molmol-games/](https://seongikcho.github.io/molmol-games/)
- **Next Lineup Anchor**: [https://seongikcho.github.io/molmol-games/index.html#next](https://seongikcho.github.io/molmol-games/index.html#next)
- **Sitemap**: [https://seongikcho.github.io/molmol-games/sitemap.xml](https://seongikcho.github.io/molmol-games/sitemap.xml)
- **Robots**: [https://seongikcho.github.io/molmol-games/robots.txt](https://seongikcho.github.io/molmol-games/robots.txt)

## Stack & Features
- Vanilla HTML5 / CSS3 / ES5+ JavaScript
- Typography: Pretendard (KO) + Outfit (EN)
- Bilingual (`KOR` default, `ENG` switchable via header language dropdown with `localStorage` persistence)
- Full SEO optimization:
  - Per-page unique `<title>`, `<meta name="description">`, `<meta name="keywords">`, canonical URLs, and `hreflang` alternates (`ko`, `en`, `x-default`)
  - Open Graph (`og:*`) and Twitter Card (`twitter:*`) metadata
  - JSON-LD Structured Data (`Organization`, `WebSite`, `VideoGame`, `CollectionPage`, `AboutPage`, `ContactPage`, `NewsArticle`)
  - `sitemap.xml` & `robots.txt`
- Automated GitHub Pages deployment via `.github/workflows/pages.yml`

## Pages
- `index.html` — Hero, 4 Original IP Showcases (`#cotton-revenant`, `#night-market`, `#hush-parade`, `#project-maru`), What's Next 2026–2027 Roadmap (`#next`), Latest News (`#latest-news`), Recruit CTA
- `about.html` — Studio philosophy (*Soft Worlds, Hard Systems, Long Memories*) & Seongsu team stats
- `games.html` — Full lineup details (`COTTON REVENANT`, `MOLLY & THE NIGHT MARKET`, `HUSH PARADE`, `PROJECT MARU`)
- `recruit.html` — Benefits & filterable open positions accordion
- `news.html` & `news-detail.html` — Category-filterable studio & patch news
- `ir.html` — Studio highlights, metrics, press notes (`#press-notes`), and IR contact
- `contact.html` — Direct department emails (`press`, `recruit`, `biz`, `ir`) & interactive inquiry form
- `store.html` — Official merchandise showcase & release notification modal
