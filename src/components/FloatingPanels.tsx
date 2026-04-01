import { useState, useRef, useEffect } from 'react';
import Icon from './Icon';
import type { BannerColors } from './Sidebar';

/* ── tiny reusable pieces ── */

function Panel({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="bg-surface-container-lowest rounded-xl border border-surface-variant/30 shadow-lg overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 px-3 py-2.5 hover:bg-surface-container-high/50 transition-colors cursor-pointer"
      >
        <Icon name={icon} size={16} className="text-primary-container" />
        <span className="text-[11px] font-bold text-on-surface flex-1 text-left">{title}</span>
        <Icon name={open ? 'expand_less' : 'expand_more'} size={16} className="text-on-secondary-container" />
      </button>
      {open && <div className="px-3 pb-3 flex flex-col gap-2">{children}</div>}
    </div>
  );
}

function SlideSelector({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <select
      value={value}
      onChange={e => onChange(Number(e.target.value))}
      className="w-full bg-surface-container border border-surface-variant rounded-lg px-2 py-1 text-[11px] font-semibold text-on-surface focus:outline-none focus:border-primary-container transition-colors cursor-pointer"
    >
      {Array.from({ length: 6 }, (_, i) => (
        <option key={i} value={i}>Slide {i + 1}</option>
      ))}
    </select>
  );
}

function PanelInput({ value, onChange, placeholder, maxLength }: {
  value: string; onChange: (v: string) => void; placeholder?: string; maxLength?: number;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        className="w-full bg-surface-container border border-surface-variant rounded-lg px-2 py-1.5 text-[11px] font-medium text-on-surface placeholder:text-on-secondary-container focus:outline-none focus:border-primary-container transition-colors"
      />
      {maxLength && (
        <span className="text-[9px] text-on-secondary-container text-right">{value.length}/{maxLength}</span>
      )}
    </div>
  );
}

function ColorPicker({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[10px] font-semibold text-on-secondary-container">{label}</span>
      <label className="relative cursor-pointer">
        <input type="color" value={value} onChange={e => onChange(e.target.value)} className="sr-only" />
        <div
          className="w-5 h-5 rounded-full border border-surface-variant shadow-sm hover:scale-110 transition-transform"
          style={{ background: value }}
        />
      </label>
    </div>
  );
}

/* ── main component ── */

export interface FloatingPanelsProps {
  html: string;
  logoFile: File | null;
  onLogoFileChange: (file: File | null) => void;
  taglineText: string;
  onTaglineChange: (v: string) => void;
  uploadedFiles: (File | null)[];
  onUpload: (index: number, file: File) => void;
  onRemove: (index: number) => void;
  labelTexts: string[];
  onLabelChange: (index: number, v: string) => void;
  slotTexts: string[];
  onTextChange: (index: number, v: string) => void;
  ctaText: string;
  onCtaChange: (v: string) => void;
  ctaUrl: string;
  onCtaUrlChange: (v: string) => void;
  slideClickModes: ('default' | 'custom' | 'none')[];
  onSlideClickModeChange: (index: number, v: 'default' | 'custom' | 'none') => void;
  slideUrls: string[];
  onSlideUrlChange: (index: number, v: string) => void;
  colors: BannerColors;
  onColorChange: (key: keyof BannerColors, v: string) => void;
}

export default function FloatingPanels({
  html,
  logoFile, onLogoFileChange,
  taglineText, onTaglineChange,
  uploadedFiles, onUpload, onRemove,
  labelTexts, onLabelChange,
  slotTexts, onTextChange,
  ctaText, onCtaChange,
  ctaUrl, onCtaUrlChange,
  slideClickModes, onSlideClickModeChange,
  slideUrls, onSlideUrlChange,
  colors, onColorChange,
}: FloatingPanelsProps) {
  const [activeSlide, setActiveSlide] = useState(0);

  const logoInputRef = useRef<HTMLInputElement>(null);
  const imgInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const h = entry.contentRect.height - 32;
      setScale(Math.min(1, h / 600));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const logoPreview = logoFile ? URL.createObjectURL(logoFile) : null;
  const currentImg = uploadedFiles[activeSlide];
  const currentImgPreview = currentImg ? URL.createObjectURL(currentImg) : null;

  return (
    <div ref={containerRef} className="flex-1 flex items-center justify-center bg-surface p-4 gap-5 min-h-0 overflow-hidden">
      {/* ── Left column ── */}
      <div className="flex flex-col gap-4 w-52 shrink-0">
        {/* Logo */}
        <Panel title="Logo" icon="branding_watermark">
          <input
            ref={logoInputRef}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={e => { const f = e.target.files?.[0]; if (f) onLogoFileChange(f); e.target.value = ''; }}
          />
          {logoPreview ? (
            <div className="flex flex-col gap-1.5">
              <div className="w-full h-12 rounded-lg bg-surface-container flex items-center justify-center overflow-hidden">
                <img src={logoPreview} className="max-w-full max-h-full object-contain p-1" alt="Logo" />
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => logoInputRef.current?.click()}
                  className="flex-1 flex items-center justify-center gap-1 text-[10px] font-semibold text-on-secondary-container bg-surface-container rounded-lg py-1 hover:bg-surface-container-high transition-colors cursor-pointer"
                >
                  <Icon name="swap_horiz" size={12} /> Change
                </button>
                <button
                  onClick={() => onLogoFileChange(null)}
                  className="flex items-center justify-center gap-1 text-[10px] font-semibold text-on-secondary-container bg-surface-container rounded-lg py-1 px-2 hover:bg-surface-container-high transition-colors cursor-pointer"
                >
                  <Icon name="delete" size={12} />
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => logoInputRef.current?.click()}
              className="w-full h-12 rounded-lg border-2 border-dashed border-surface-variant hover:border-primary-container/50 flex items-center justify-center gap-1 text-[10px] font-semibold text-on-secondary-container transition-colors cursor-pointer"
            >
              <Icon name="upload" size={14} /> Upload logo
            </button>
          )}
        </Panel>

        {/* Images */}
        <Panel title="Images" icon="photo_library">
          <SlideSelector value={activeSlide} onChange={setActiveSlide} />
          <input
            ref={imgInputRef}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={e => { const f = e.target.files?.[0]; if (f) onUpload(activeSlide, f); e.target.value = ''; }}
          />
          {currentImgPreview ? (
            <div className="flex flex-col gap-1.5">
              <div className="w-full h-20 rounded-lg overflow-hidden bg-surface-container">
                <img src={currentImgPreview} className="w-full h-full object-cover" alt={`Slide ${activeSlide + 1}`} />
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => imgInputRef.current?.click()}
                  className="flex-1 flex items-center justify-center gap-1 text-[10px] font-semibold text-on-secondary-container bg-surface-container rounded-lg py-1 hover:bg-surface-container-high transition-colors cursor-pointer"
                >
                  <Icon name="swap_horiz" size={12} /> Change
                </button>
                <button
                  onClick={() => onRemove(activeSlide)}
                  className="flex items-center justify-center gap-1 text-[10px] font-semibold text-on-secondary-container bg-surface-container rounded-lg py-1 px-2 hover:bg-surface-container-high transition-colors cursor-pointer"
                >
                  <Icon name="delete" size={12} />
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => imgInputRef.current?.click()}
              className="w-full h-20 rounded-lg border-2 border-dashed border-surface-variant hover:border-primary-container/50 flex items-center justify-center gap-1 text-[10px] font-semibold text-on-secondary-container transition-colors cursor-pointer"
            >
              <Icon name="add_photo_alternate" size={14} /> Upload image
            </button>
          )}
          <div className="flex flex-col gap-1 pt-1 border-t border-surface-variant/30">
            <label className="text-[9px] font-bold text-on-secondary-container uppercase tracking-wide">Click action</label>
            <select
              value={slideClickModes[activeSlide]}
              onChange={e => onSlideClickModeChange(activeSlide, e.target.value as 'default' | 'custom' | 'none')}
              className="w-full bg-surface-container border border-surface-variant rounded-lg px-2 py-1 text-[11px] font-semibold text-on-surface focus:outline-none focus:border-primary-container transition-colors cursor-pointer"
            >
              <option value="default">Default URL (CTA)</option>
              <option value="custom">Custom URL</option>
              <option value="none">Non-clickable</option>
            </select>
            {slideClickModes[activeSlide] === 'custom' && (
              <input
                type="url"
                value={slideUrls[activeSlide]}
                onChange={e => onSlideUrlChange(activeSlide, e.target.value)}
                placeholder="https://…"
                className="w-full bg-surface-container border border-surface-variant rounded-lg px-2 py-1.5 text-[11px] font-medium text-on-surface placeholder:text-on-secondary-container focus:outline-none focus:border-primary-container transition-colors"
              />
            )}
          </div>
        </Panel>

        {/* Headline */}
        <Panel title="Headline" icon="title">
          <SlideSelector value={activeSlide} onChange={setActiveSlide} />
          <PanelInput
            value={slotTexts[activeSlide]}
            onChange={v => onTextChange(activeSlide, v)}
            placeholder="Headline text…"
            maxLength={100}
          />
          <ColorPicker label="Color" value={colors.headline} onChange={v => onColorChange('headline', v)} />
        </Panel>
      </div>

      {/* ── Banner ── */}
      <div
        className="shadow-2xl rounded-xl overflow-hidden shrink-0"
        style={{ width: 300 * scale, height: 600 * scale }}
      >
        <iframe
          srcDoc={html}
          sandbox="allow-scripts"
          style={{ width: 300, height: 600, border: 'none', display: 'block', transform: `scale(${scale})`, transformOrigin: 'top left' }}
          title="Banner Preview"
        />
      </div>

      {/* ── Right column ── */}
      <div className="flex flex-col gap-4 w-52 shrink-0">
        {/* Tagline */}
        <Panel title="Tagline" icon="format_quote">
          <PanelInput
            value={taglineText}
            onChange={onTaglineChange}
            placeholder="Campaign slogan…"
            maxLength={80}
          />
          <ColorPicker label="Color" value={colors.tagline} onChange={v => onColorChange('tagline', v)} />
        </Panel>

        {/* Label */}
        <Panel title="Label" icon="label">
          <SlideSelector value={activeSlide} onChange={setActiveSlide} />
          <PanelInput
            value={labelTexts[activeSlide]}
            onChange={v => onLabelChange(activeSlide, v)}
            placeholder="Label text…"
            maxLength={30}
          />
        </Panel>

        {/* CTA Button */}
        <Panel title="CTA Button" icon="smart_button">
          <PanelInput
            value={ctaText}
            onChange={onCtaChange}
            placeholder="Button text…"
            maxLength={40}
          />
          <div className="flex flex-col gap-0.5">
            <label className="text-[9px] font-bold text-on-secondary-container uppercase tracking-wide">Destination URL</label>
            <input
              type="url"
              value={ctaUrl}
              onChange={e => onCtaUrlChange(e.target.value)}
              placeholder="https://example.com"
              className="w-full bg-surface-container border border-surface-variant rounded-lg px-2 py-1.5 text-[11px] font-medium text-on-surface placeholder:text-on-secondary-container focus:outline-none focus:border-primary-container transition-colors"
            />
          </div>
          <ColorPicker label="Background" value={colors.cta} onChange={v => onColorChange('cta', v)} />
        </Panel>
      </div>
    </div>
  );
}
