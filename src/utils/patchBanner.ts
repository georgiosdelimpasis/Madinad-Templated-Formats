import type { BannerColors } from '../components/Sidebar';

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export async function patchBanner(
  files: File[],
  texts: string[],
  logoFile: File | null,
  logoText: string,
  colors: BannerColors,
): Promise<string> {
  const [urls, logoDataUrl] = await Promise.all([
    Promise.all(files.map(fileToDataUrl)),
    logoFile ? fileToDataUrl(logoFile) : Promise.resolve(null),
  ]);

  const html = await fetch('/banner/index.html').then(r => r.text());
  let out = html;

  // 1. Slide image src tags
  urls.forEach((url, i) => {
    out = out.replace(`src="${i + 1}.webp"`, `src="${url}"`);
  });

  // 2. Initial bg-layer inline style
  out = out.replace('background-image:url(1.webp)', `background-image:url(${urls[0]})`);

  // 3. JS dynamic bg switching
  out = out.replace('`url(${idx + 1}.webp)`', '`url(${window.__IMGS__[idx]})`');

  // 4. Headline texts
  const filledTexts = texts.map(t => t.trim());
  const hasAnyText = filledTexts.some(t => t.length > 0);

  const imgArrayScript = `<script>window.__IMGS__=${JSON.stringify(urls)};${
    hasAnyText ? `window.__TEXTS__=${JSON.stringify(filledTexts)};` : ''
  }\x3c/script>`;

  if (hasAnyText) {
    out = out.replace(
      'headlineEl.innerHTML = POSES[idx].headline;',
      'headlineEl.innerHTML = (window.__TEXTS__[idx] || POSES[idx].headline);'
    );
    out = out.replace(
      'headlineEl.innerHTML = POSES[0].headline;',
      'headlineEl.innerHTML = (window.__TEXTS__[0] || POSES[0].headline);'
    );
  }

  out = out.replace('<script>\n(function()', `${imgArrayScript}\n<script>\n(function()`);

  // 5. Logo
  const svgPattern = /<svg class="logo-svg"[\s\S]*?<\/svg>/;
  if (logoDataUrl) {
    out = out.replace(
      svgPattern,
      `<img class="logo-svg" src="${logoDataUrl}" style="max-width:120px;height:auto;object-fit:contain;" />`
    );
  } else if (logoText.trim()) {
    const escaped = logoText.trim().replace(/</g, '&lt;').replace(/>/g, '&gt;');
    out = out.replace(
      svgPattern,
      `<span style="display:block;font-size:26px;font-weight:900;color:#fff;letter-spacing:-0.5px;text-align:center;line-height:1.1;">${escaped}</span>`
    );
  }

  // 6. Colors
  out = out.replace('background-color: #ee1d25;', `background-color: ${colors.cta};`);
  out = out.replace(
    'color: #fff; font-size: 20px; font-weight: 800;',
    `color: ${colors.headline}; font-size: 20px; font-weight: 800;`
  );
  out = out.replace(
    'color: rgb(255, 255, 255);',
    `color: ${colors.tagline};`
  );

  return out;
}
