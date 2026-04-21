const fs = require('fs');
const path = require('path');

const dir = __dirname;
const pages = ['index.html', 'about.html', 'coffee.html', 'greenwich.html', 'battersea.html', 'careers.html'];

const NAV_LINKS = [
  { label: 'HOME', file: 'index.html' },
  { label: 'ABOUT', file: 'about.html' },
  { label: 'COFFEE', file: 'coffee.html' },
  { label: 'GREENWICH', file: 'greenwich.html' },
  { label: 'BATTERSEA', file: 'battersea.html' },
  { label: 'CAREERS', file: 'careers.html' },
];

function buildNavHtml(currentFile) {
  const links = NAV_LINKS.map(({ label, file }) => {
    const isActive = file === currentFile;
    const cls = isActive
      ? 'text-red-500 border-b-2 border-red-500 pb-1'
      : 'text-white hover:text-red-500 transition-colors duration-200';
    return `<a class="${cls}" href="${file}">${label}</a>`;
  }).join('\n    ');

  return `<nav class="bg-black font-headline font-bold uppercase tracking-tighter border-b border-white/10 fixed top-0 w-full flex justify-between items-center px-8 py-6 z-50">
  <div class="text-lg sm:text-2xl font-black uppercase tracking-tighter text-white"><a href="index.html" class="text-white no-underline">THE COFFEE STUDIO</a></div>
  <div class="hidden md:flex gap-8 items-center">
    ${links}
  </div>
  <button class="md:hidden text-white"><span class="material-symbols-outlined">menu</span></button>
</nav>`;
}

const MATERIAL_SYMBOLS_LINK = '<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>';

const CANONICAL_FOOTER = `<footer class="bg-black text-white border-t border-white/10">
  <div class="grid grid-cols-1 md:grid-cols-3 px-8 py-16 gap-12 border-b border-white/10">
    <div>
      <div class="font-headline text-2xl font-black uppercase tracking-tighter mb-4">THE COFFEE STUDIO</div>
      <p class="font-body text-white/60 text-sm max-w-xs">Where the coffee elevates the space and the space complements the coffee.</p>
    </div>
    <div>
      <h3 class="font-headline font-bold uppercase tracking-tighter text-white/40 text-xs mb-6">Navigation</h3>
      <div class="flex flex-col gap-3 font-headline uppercase tracking-tighter text-sm">
        <a href="index.html" class="text-white/80 hover:text-white transition-colors">Home</a>
        <a href="about.html" class="text-white/80 hover:text-white transition-colors">About</a>
        <a href="coffee.html" class="text-white/80 hover:text-white transition-colors">Coffee</a>
        <a href="greenwich.html" class="text-white/80 hover:text-white transition-colors">Greenwich</a>
        <a href="battersea.html" class="text-white/80 hover:text-white transition-colors">Battersea</a>
        <a href="careers.html" class="text-white/80 hover:text-white transition-colors">Careers</a>
      </div>
    </div>
    <div>
      <h3 class="font-headline font-bold uppercase tracking-tighter text-white/40 text-xs mb-6">Contact</h3>
      <div class="space-y-3 font-body text-sm text-white/80">
        <p>44 Creek Road, London SE8 3FN</p>
        <p>V1 Railway Arches, Patcham Terrace SW8 4FN</p>
        <p><a href="tel:02081589641" class="hover:text-white transition-colors">0208 158 9641</a></p>
        <p><a href="mailto:hellogreenwich@thecoffeestudioldn.com" class="hover:text-white transition-colors break-all">hellogreenwich@thecoffeestudioldn.com</a></p>
        <p><a href="mailto:hellobattersea@thecoffeestudioldn.com" class="hover:text-white transition-colors break-all">hellobattersea@thecoffeestudioldn.com</a></p>
      </div>
    </div>
  </div>
  <div class="px-8 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
    <p class="font-label text-white/40 text-xs uppercase tracking-widest">&copy; 2024 The Coffee Studio. All rights reserved.</p>
    <div class="flex gap-6 font-label text-white/40 text-xs uppercase tracking-widest">
      <a href="#" class="hover:text-white/80 transition-colors">Instagram</a>
      <a href="#" class="hover:text-white/80 transition-colors">Privacy</a>
      <a href="#" class="hover:text-white/80 transition-colors">Terms</a>
    </div>
  </div>
</footer>`;

const CANONICAL_BODY_CLASS = 'bg-surface text-on-surface font-body antialiased overflow-x-hidden';

pages.forEach(filename => {
  const filepath = path.join(dir, filename);
  if (!fs.existsSync(filepath)) {
    console.log(`SKIP (not found): ${filename}`);
    return;
  }

  let html = fs.readFileSync(filepath, 'utf8');

  // 1. Remove all <style>...</style> blocks injected by Stitch
  html = html.replace(/<style[\s\S]*?<\/style>/gi, '');

  // 2. Strip stale Stitch <header>...</header> wrappers entirely
  //    These are the outer fixed headers Stitch generates; our <nav> will replace them.
  //    Remove any <header> that contains a nav or logo — greedy match on the whole block.
  html = html.replace(/<header[\s\S]*?<\/header>/gi, '');

  // 3. Remove any remaining <nav>...</nav> blocks (footer navs, old navs)
  //    We will re-inject the canonical nav right after <body>
  html = html.replace(/<nav[\s\S]*?<\/nav>/gi, '');

  // 4. Standardise <body> class — replace whatever Stitch put there
  html = html.replace(/<body[^>]*>/gi, `<body class="${CANONICAL_BODY_CLASS}">`);

  // Force scrollbar always visible — prevents layout shift between pages of different lengths
  html = html.replace(/<html([^>]*)>/i, (match, attrs) => {
    if (attrs.includes('overflow-y') || attrs.includes('style=')) return match;
    return `<html${attrs} style="overflow-y: scroll;">`;
  });

  // 5. Inject canonical nav immediately after <body>
  html = html.replace(/(<body[^>]*>)/i, `$1\n${buildNavHtml(filename)}`);

  // 6. Replace all inline arbitrary font references with semantic aliases
  html = html.replace(/font-\['Space_Grotesk'\]/g, 'font-headline');
  html = html.replace(/font-\['Public_Sans'\]/g, 'font-body');
  html = html.replace(/font-spaceGrotesk/g, 'font-headline');
  html = html.replace(/font-publicSans/g, 'font-body');

  // 7. Ensure <main> has pt-24 to clear fixed nav
  html = html.replace(/<main(?![^>]*\bpt-24\b)([^>]*)>/g, (match, attrs) => {
    const classMatch = attrs.match(/class="([^"]*)"/);
    if (classMatch) {
      return match.replace(classMatch[0], `class="${classMatch[1]} pt-24"`);
    }
    return `<main class="pt-24"${attrs}>`;
  });

  // 8. Strip nested <div class="pt-16"> wrappers inside <main> (idempotent)
  let prev;
  do {
    prev = html;
    html = html.replace(/(<main[^>]*>)\s*<div[^>]*class="[^"]*\bpt-16\b[^"]*"[^>]*>([\s\S]*?)<\/div>\s*(<\/main>)/gi, '$1$2$3');
  } while (html !== prev);

  // 9. Strip all existing footers and re-inject canonical footer before </body>
  html = html.replace(/<footer[\s\S]*?<\/footer>/gi, '');
  html = html.replace(/<\/body>/i, `${CANONICAL_FOOTER}\n</body>`);

  // 11. Ensure Material Symbols font link is present in <head>
  if (!html.includes('Material+Symbols+Outlined')) {
    html = html.replace('</head>', `${MATERIAL_SYMBOLS_LINK}\n</head>`);
  }

  // 12. Ensure fontFamily aliases exist in tailwind config
  if (!html.includes('"headline"') && html.includes('tailwind.config')) {
    const fontFamilyBlock = `"fontFamily": {
            "headline": ["Space Grotesk", "sans-serif"],
            "body": ["Public Sans", "sans-serif"],
            "label": ["Inter", "sans-serif"]
          }`;
    html = html.replace(/(extend:\s*\{[\s\S]*?)(}\s*,?\s*}\s*,?\s*}\s*<\/script>)/,
      (match, extendOpen, closeSection) => {
        if (!match.includes('"fontFamily"')) {
          return `${extendOpen},\n        ${fontFamilyBlock}\n      ${closeSection}`;
        }
        return match;
      }
    );
  }

  // 13. Mobile text-size normalization — downsize bare (unprefixed) large headings.
  //     Lookbehind `(?<![a-z\d]:)` skips md:/lg: prefixed variants so they keep their values.
  html = html.replace(/(?<![a-z\d]:)\btext-8xl\b/g, 'text-4xl');
  html = html.replace(/(?<![a-z\d]:)\btext-7xl\b/g, 'text-4xl');
  html = html.replace(/(?<![a-z\d]:)\btext-6xl\b/g, 'text-3xl');
  html = html.replace(/(?<![a-z\d]:)\btext-5xl\b/g, 'text-3xl');

  // 14. Mobile padding normalization — replace bare large padding with responsive equivalents.
  html = html.replace(/(?<![a-z\d]:)\bp-12\b/g, 'p-6 md:p-12');
  html = html.replace(/(?<![a-z\d]:)\bp-24\b/g, 'p-10 md:p-24');

  fs.writeFileSync(filepath, html, 'utf8');
  console.log(`OK: ${filename}`);
});

console.log('\nNormalisation complete.');
