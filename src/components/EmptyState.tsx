import { useState, useEffect } from 'react';
import Icon from './Icon';

const SKELETON_CSS = `
  .skeleton-bar {
    background: linear-gradient(90deg, rgba(255,255,255,0.08) 25%, rgba(255,255,255,0.18) 50%, rgba(255,255,255,0.08) 75%);
    background-size: 200% 100%;
    animation: skeleton-shimmer 1.5s infinite;
    border-radius: 4px;
    display: inline-block;
  }
  .button.skeleton-btn {
    background: rgba(255,255,255,0.1) !important;
    color: transparent !important;
    pointer-events: none;
    border: 1.5px dashed rgba(255,255,255,0.25);
  }
  .button.skeleton-btn .icon { opacity: 0; }
`;

function skeletonize(html: string): string {
  let out = html;

  // Inject skeleton CSS
  out = out.replace('</style>', `${SKELETON_CSS}</style>`);

  // Replace label/headline empty init with skeleton bars
  out = out.replace(
    "labelEl.textContent  = POSES[0].label;",
    `labelEl.innerHTML = '<span class="skeleton-bar" style="width:50px;height:8px;"></span>';`
  );
  out = out.replace(
    "headlineEl.innerHTML = POSES[0].headline;",
    `headlineEl.innerHTML = '<span class="skeleton-bar" style="width:140px;height:14px;margin-bottom:6px;"></span><br><span class="skeleton-bar" style="width:100px;height:14px;"></span>';`
  );

  // Also skeleton the cycling text updates
  out = out.replace(
    "labelEl.textContent  = POSES[idx].label;",
    `labelEl.innerHTML = '<span class="skeleton-bar" style="width:50px;height:8px;"></span>';`
  );
  out = out.replace(
    "headlineEl.innerHTML = POSES[idx].headline;",
    `headlineEl.innerHTML = '<span class="skeleton-bar" style="width:140px;height:14px;margin-bottom:6px;"></span><br><span class="skeleton-bar" style="width:100px;height:14px;"></span>';`
  );

  // Replace CTA button content with skeleton
  out = out.replace(
    `<button class="button">`,
    `<button class="button skeleton-btn">`
  );
  out = out.replace(
    'Δείτε περισσότερα',
    '<span class="skeleton-bar" style="width:100px;height:12px;"></span>'
  );

  // Replace tagline with skeleton bars
  out = out.replace(
    '>Your campaign slogan goes here<',
    '><span class="skeleton-bar" style="width:140px;height:12px;margin-bottom:5px;"></span><br><span class="skeleton-bar" style="width:110px;height:12px;"></span><'
  );

  return out;
}

export default function EmptyState({ onGenerate, canGenerate }: { onGenerate: () => void; canGenerate: boolean }) {
  const [html, setHtml] = useState<string | null>(null);

  useEffect(() => {
    fetch('/banner/index.html')
      .then(r => r.text())
      .then(raw => setHtml(skeletonize(raw)));
  }, []);

  if (!html) return null;

  return (
    <section className="flex-1 flex flex-col items-center justify-center p-6 gap-6">
      <div
        className="rounded-xl overflow-hidden opacity-50"
        style={{ width: 300, height: 600 }}
      >
        <iframe
          srcDoc={html}
          sandbox="allow-scripts"
          style={{ width: 300, height: 600, border: 'none', display: 'block', pointerEvents: 'none' }}
          title="Banner Skeleton"
        />
      </div>
      <button
        onClick={onGenerate}
        disabled={!canGenerate}
        className={`px-8 py-3 rounded-full font-bold flex items-center gap-2 text-sm transition-all shadow-lg ${
          canGenerate
            ? 'bg-primary-container text-white hover:scale-105 active:scale-95 cursor-pointer'
            : 'bg-surface-container text-on-secondary-container cursor-not-allowed opacity-60'
        }`}
      >
        <Icon name="auto_awesome" size={20} />
        Generate
      </button>
    </section>
  );
}
