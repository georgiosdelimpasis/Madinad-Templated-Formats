import JSZip from 'jszip';
import type { BannerColors } from '../components/Sidebar';

async function fileToWebp(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(bitmap, 0, 0);
  return canvas.convertToBlob({ type: 'image/webp', quality: 0.85 });
}

export async function exportBanner(
  files: File[],
  texts: string[],
  logoFile: File | null,
  colors: BannerColors,
  taglineText: string,
  labelTexts: string[],
  ctaText: string,
  slideUrls: string[],
): Promise<void> {
  // 1. Convert images to webp
  const [webpBlobs, logoWebp] = await Promise.all([
    Promise.all(files.map(fileToWebp)),
    logoFile ? fileToWebp(logoFile) : Promise.resolve(null),
  ]);

  // 2. Fetch original template and patch with file references (not data URLs)
  const html = await fetch('/banner/index.html').then(r => r.text());
  let out = html;

  // Slide skeletons → file references
  for (let i = 0; i < 6; i++) {
    out = out.replace(
      `<div class="slide-skeleton" data-slot="${i + 1}"></div>`,
      `<img src="${i + 1}.webp" alt="Look ${i + 1}">`,
    );
  }

  // Background skeleton → file reference
  out = out.replace(
    'class="bg-layer bg-skeleton" style="opacity:1;"',
    'class="bg-layer" style="background-image:url(1.webp);opacity:1;"',
  );

  // Headline texts
  const filledTexts = texts.map(t => t.trim());
  const hasAnyText = filledTexts.some(t => t.length > 0);
  const hasAnyLabel = labelTexts.some(t => t.length > 0);

  // Build injected script (no __IMGS__ needed since we use file refs)
  const parts: string[] = [];
  if (hasAnyText) parts.push(`window.__TEXTS__=${JSON.stringify(filledTexts)}`);
  if (hasAnyLabel) parts.push(`window.__LABELS__=${JSON.stringify(labelTexts)}`);
  if (slideUrls.length) parts.push(`window.__URLS__=${JSON.stringify(slideUrls)}`);

  if (parts.length) {
    const script = `<script>${parts.join(';')};\x3c/script>`;
    out = out.replace('<script>\n(function()', `${script}\n<script>\n(function()`);
  }

  if (hasAnyText) {
    out = out.replace(
      'headlineEl.innerHTML = POSES[idx].headline;',
      'headlineEl.innerHTML = (window.__TEXTS__[idx] || POSES[idx].headline);',
    );
    out = out.replace(
      'headlineEl.innerHTML = POSES[0].headline;',
      'headlineEl.innerHTML = (window.__TEXTS__[0] || POSES[0].headline);',
    );
  }

  if (hasAnyLabel) {
    out = out.replace(
      'labelEl.textContent  = POSES[idx].label;',
      'labelEl.textContent  = (window.__LABELS__[idx] || POSES[idx].label);',
    );
    out = out.replace(
      'labelEl.textContent  = POSES[0].label;',
      'labelEl.textContent  = (window.__LABELS__[0] || POSES[0].label);',
    );
  }

  if (slideUrls.length) {
    out = out.replace(
      'window.open(POSES[curIdx].url, "_blank");',
      'var u = (window.__URLS__ && window.__URLS__[curIdx]) || POSES[curIdx].url; if (u) window.open(u, "_blank");',
    );
  }

  // Logo
  const svgPattern = /<(?:svg|div) class="logo-svg"[\s\S]*?<\/(?:svg|div)>/;
  if (logoWebp) {
    out = out.replace(
      svgPattern,
      '<img class="logo-svg" src="logo.webp" style="max-width:120px;height:auto;object-fit:contain;" />',
    );
  }

  // Tagline
  out = out.replace('>Your campaign slogan goes here<', `>${taglineText}<`);

  // CTA text
  if (ctaText) {
    out = out.replace('Δείτε περισσότερα', ctaText);
  }

  // Colors
  out = out.replace('background-color: #ee1d25;', `background-color: ${colors.cta};`);
  out = out.replace(
    'color: #fff; font-size: 20px; font-weight: 800;',
    `color: ${colors.headline}; font-size: 20px; font-weight: 800;`,
  );
  out = out.replace('color: rgb(255, 255, 255);', `color: ${colors.tagline};`);

  // 3. Build zip
  const zip = new JSZip();
  zip.file('index.html', out);
  webpBlobs.forEach((blob, i) => zip.file(`${i + 1}.webp`, blob));
  if (logoWebp) zip.file('logo.webp', logoWebp);

  // 4. Trigger download
  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'banner-export.zip';
  a.click();
  URL.revokeObjectURL(url);
}
