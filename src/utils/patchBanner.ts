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
  colors: BannerColors,
  taglineText?: string,
  labelTexts?: string[],
  ctaText?: string,
  slideUrls?: string[],
): Promise<string> {
  const [urls, logoDataUrl] = await Promise.all([
    Promise.all(files.map(fileToDataUrl)),
    logoFile ? fileToDataUrl(logoFile) : Promise.resolve(null),
  ]);

  const html = await fetch('/banner/index.html').then(r => r.text());
  let out = html;

  // 1. Slide skeleton divs → real images
  urls.forEach((url, i) => {
    out = out.replace(
      `<div class="slide-skeleton" data-slot="${i + 1}"></div>`,
      `<img src="${url}" alt="Look ${i + 1}" style="width:100%;height:100%;object-fit:cover;">`,
    );
  });

  // 2. Initial bg-layer skeleton → real background
  out = out.replace(
    'class="bg-layer bg-skeleton" style="opacity:1;"',
    `class="bg-layer" style="background-image:url(${urls[0]});opacity:1;"`,
  );

  // 3. JS dynamic bg switching
  out = out.replace('`url(${idx + 1}.webp)`', '`url(${window.__IMGS__[idx]})`');

  // 4. Headline texts
  const filledTexts = texts.map(t => t.trim());
  const hasAnyText = filledTexts.some(t => t.length > 0);

  const hasAnyLabel = labelTexts?.some(t => t.length > 0);

  const imgArrayScript = `<script>window.__IMGS__=${JSON.stringify(urls)};${
    hasAnyText ? `window.__TEXTS__=${JSON.stringify(filledTexts)};` : ''
  }${hasAnyLabel && labelTexts ? `window.__LABELS__=${JSON.stringify(labelTexts)};` : ''
  }${slideUrls ? `window.__URLS__=${JSON.stringify(slideUrls)};` : ''
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
  const svgPattern = /<(?:svg|div) class="logo-svg"[\s\S]*?<\/(?:svg|div)>/;
  if (logoDataUrl) {
    out = out.replace(
      svgPattern,
      `<img class="logo-svg" src="${logoDataUrl}" style="max-width:120px;height:auto;object-fit:contain;" />`
    );
  }

  // 6. Labels
  if (hasAnyLabel) {
    out = out.replace(
      'labelEl.textContent  = POSES[idx].label;',
      'labelEl.textContent  = (window.__LABELS__[idx] || POSES[idx].label);'
    );
    out = out.replace(
      'labelEl.textContent  = POSES[0].label;',
      'labelEl.textContent  = (window.__LABELS__[0] || POSES[0].label);'
    );
  }

  // 7. Tagline
  if (taglineText !== undefined) {
    out = out.replace('>Your campaign slogan goes here<', `>${taglineText}<`);
  }

  // 8. CTA button text
  if (ctaText) {
    out = out.replace('Δείτε περισσότερα', ctaText);
  }

  // 9. Slide click URLs
  if (slideUrls) {
    out = out.replace(
      'window.open(POSES[curIdx].url, "_blank");',
      'var u = (window.__URLS__ && window.__URLS__[curIdx]) || POSES[curIdx].url; if (u) window.open(u, "_blank");',
    );
  }

  // 10. Colors
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
