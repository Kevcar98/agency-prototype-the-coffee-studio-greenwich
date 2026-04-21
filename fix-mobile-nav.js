const fs = require('fs');
const path = require('path');

const files = ['index.html', 'about.html', 'coffee.html', 'greenwich.html', 'battersea.html', 'careers.html'];
const dir = __dirname;

const links = [
  { label: 'HOME', href: 'index.html' },
  { label: 'ABOUT', href: 'about.html' },
  { label: 'COFFEE', href: 'coffee.html' },
  { label: 'GREENWICH', href: 'greenwich.html' },
  { label: 'BATTERSEA', href: 'battersea.html' },
  { label: 'CAREERS', href: 'careers.html' },
];

function buildMobileMenu(activePage) {
  const items = links.map(l => {
    const isActive = l.href === activePage;
    const cls = isActive
      ? 'text-red-500 border-b-2 border-red-500 pb-1 block py-3 px-6 font-headline font-bold uppercase tracking-tighter text-sm'
      : 'text-white hover:text-red-500 transition-colors duration-200 block py-3 px-6 font-headline font-bold uppercase tracking-tighter text-sm';
    return `    <a class="${cls}" href="${l.href}">${l.label}</a>`;
  }).join('\n');

  return `<div id="mobile-menu" class="md:hidden hidden fixed top-0 left-0 w-full h-full bg-black z-40 flex flex-col pt-20">
${items}
</div>`;
}

const toggleScript = `<script>
(function() {
  var btn = document.getElementById('mobile-menu-btn');
  var menu = document.getElementById('mobile-menu');
  var icon = btn ? btn.querySelector('span') : null;
  if (btn && menu) {
    btn.addEventListener('click', function() {
      var isOpen = !menu.classList.contains('hidden');
      menu.classList.toggle('hidden', isOpen);
      if (icon) icon.textContent = isOpen ? 'menu' : 'close';
    });
    menu.querySelectorAll('a').forEach(function(a) {
      a.addEventListener('click', function() {
        menu.classList.add('hidden');
        if (icon) icon.textContent = 'menu';
      });
    });
  }
})();
</script>`;

files.forEach(file => {
  const filePath = path.join(dir, file);
  if (!fs.existsSync(filePath)) return;

  let html = fs.readFileSync(filePath, 'utf8');

  // Add id to hamburger button if missing
  html = html.replace(
    /<button class="md:hidden text-white">/g,
    '<button id="mobile-menu-btn" class="md:hidden text-white">'
  );

  // Remove any existing mobile menu to avoid duplicates
  html = html.replace(/<div id="mobile-menu"[\s\S]*?<\/div>\n?/g, '');

  // Remove any existing toggle script to avoid duplicates
  html = html.replace(/<script>\s*\(function\(\)[\s\S]*?<\/script>\n?/g, '');

  // Insert mobile menu div right after </nav>
  const mobileMenu = buildMobileMenu(file);
  html = html.replace('</nav>', '</nav>\n' + mobileMenu);

  // Insert toggle script before </body>
  html = html.replace('</body>', toggleScript + '\n</body>');

  fs.writeFileSync(filePath, html, 'utf8');
  console.log(`Patched: ${file}`);
});

console.log('Done. Mobile nav is now functional on all pages.');
