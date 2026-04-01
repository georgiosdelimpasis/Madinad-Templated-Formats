import { useState, useRef } from 'react';
import Icon from './Icon';

const NAV_ITEMS = [
  { id: 'logos', label: 'Logos', icon: 'category' },
  { id: 'images', label: 'Images', icon: 'image' },
  { id: 'colors', label: 'Colors', icon: 'palette' },
  { id: 'fonts', label: 'Fonts', icon: 'format_size' },
];

export interface BannerColors {
  cta: string;
  headline: string;
  tagline: string;
}

interface SidebarProps {
  uploadedFiles: (File | null)[];
  logoFile: File | null;
  colors: BannerColors;
  onUpload: (index: number, file: File) => void;
  onRemove: (index: number) => void;
  onBulkUpload: (files: File[]) => void;
  onLogoFileChange: (file: File | null) => void;
  onColorChange: (key: keyof BannerColors, value: string) => void;
}

function ImageSlot({
  index, file, onUpload, onRemove,
}: {
  index: number; file: File | null;
  onUpload: (file: File) => void; onRemove: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [draggingOver, setDraggingOver] = useState(false);
  const previewUrl = file ? URL.createObjectURL(file) : null;

  return (
    <div className="flex flex-col gap-2">
      <div className="relative">
        <label
          className={`relative flex w-full items-center justify-center rounded-lg border-2 cursor-pointer overflow-hidden transition-all ${
            draggingOver ? 'border-primary-container bg-primary-container/10'
            : file ? 'border-transparent'
            : 'border-dashed border-surface-variant hover:border-primary-container/50 hover:bg-surface-container-high'
          }`}
          style={{ height: 96 }}
          onDragOver={e => { e.preventDefault(); setDraggingOver(true); }}
          onDragLeave={() => setDraggingOver(false)}
          onDrop={e => { e.preventDefault(); setDraggingOver(false); const f = e.dataTransfer.files[0]; if (f?.type.startsWith('image/')) onUpload(f); }}
        >
          <input ref={inputRef} type="file" accept="image/*" className="sr-only"
            onChange={e => { const f = e.target.files?.[0]; if (f) onUpload(f); e.target.value = ''; }} />
          {previewUrl
            ? <img src={previewUrl} className="w-full h-full object-cover" alt={`Slot ${index + 1}`} />
            : <div className="flex flex-col items-center gap-0.5">
                <span className="text-on-secondary-container text-[10px] font-bold leading-none">{index + 1}</span>
                <Icon name="add_photo_alternate" className="text-on-secondary-container" size={14} />
              </div>
          }
        </label>
        {file && (
          <button onClick={onRemove}
            className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-on-surface/70 text-surface flex items-center justify-center hover:bg-on-surface transition-colors z-10">
            <Icon name="close" size={10} />
          </button>
        )}
      </div>
    </div>
  );
}

function ColorRow({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-xs font-semibold text-on-surface">{label}</span>
      <label className="relative cursor-pointer">
        <input type="color" value={value} onChange={e => onChange(e.target.value)}
          className="sr-only" />
        <div className="w-8 h-8 rounded-full border-2 border-surface-variant shadow-sm hover:scale-110 transition-transform"
          style={{ background: value }} />
      </label>
    </div>
  );
}

export default function Sidebar({
  uploadedFiles, logoFile, colors,
  onUpload, onRemove, onBulkUpload,
  onLogoFileChange, onColorChange,
}: SidebarProps) {
  const [active, setActive] = useState('logos');
  const [bulkDragging, setBulkDragging] = useState(false);
  const [logoDragging, setLogoDragging] = useState(false);
  const bulkInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const filledCount = uploadedFiles.filter(Boolean).length;
  const logoPreview = logoFile ? URL.createObjectURL(logoFile) : null;

  function handleBulkFiles(fileList: FileList) {
    const images = Array.from(fileList).filter(f => f.type.startsWith('image/')).slice(0, 6);
    if (images.length) onBulkUpload(images);
  }

  return (
    <aside className="w-72 bg-surface-container-low h-full flex flex-col p-6 gap-6 border-r border-transparent shrink-0">
      {/* Brand */}
      <div className="flex items-center gap-3 px-2">
        <div className="w-10 h-10 rounded-lg bg-primary-container flex items-center justify-center">
          <Icon name="category" fill className="text-white" />
        </div>
        <div>
          <h1 className="text-on-surface font-extrabold text-lg leading-tight">Madinad</h1>
          <p className="text-on-secondary-container text-xs font-medium">Adgen Studio</p>
        </div>
      </div>

      {/* Panel content */}
      <div className="flex flex-col gap-3 overflow-y-auto custom-scrollbar flex-1">

        {/* ── LOGOS ── */}
        {active === 'logos' && (
          <div className="flex flex-col gap-3">
            <p className="text-xs font-bold text-on-surface px-1">Logo</p>

            {/* Logo upload zone */}
            <label
              className={`relative flex items-center justify-center w-full rounded-xl border-2 border-dashed cursor-pointer overflow-hidden transition-all ${
                logoDragging ? 'border-primary-container bg-primary-container/10 scale-[1.02]'
                : 'border-surface-variant hover:border-primary-container/50 hover:bg-surface-container-high'
              }`}
              style={{ height: 100 }}
              onDragOver={e => { e.preventDefault(); setLogoDragging(true); }}
              onDragLeave={() => setLogoDragging(false)}
              onDrop={e => { e.preventDefault(); setLogoDragging(false); const f = e.dataTransfer.files[0]; if (f?.type.startsWith('image/')) onLogoFileChange(f); }}
            >
              <input ref={logoInputRef} type="file" accept="image/*" className="sr-only"
                onChange={e => { const f = e.target.files?.[0]; if (f) onLogoFileChange(f); e.target.value = ''; }} />
              {logoPreview
                ? <img src={logoPreview} className="max-w-full max-h-full object-contain p-2" alt="Logo" />
                : <div className="flex flex-col items-center gap-1 text-center">
                    <Icon name="add_photo_alternate" className="text-primary-container" size={28} />
                    <span className="text-xs font-semibold text-on-surface">Upload logo</span>
                    <span className="text-[10px] text-on-secondary-container">PNG, SVG, WebP</span>
                  </div>
              }
            </label>

            {logoFile && (
              <button onClick={() => onLogoFileChange(null)}
                className="flex items-center gap-2 text-xs font-bold text-on-secondary-container hover:text-on-surface transition-colors px-1">
                <Icon name="delete" size={14} /> Remove logo
              </button>
            )}

          </div>
        )}

        {/* ── IMAGES ── */}
        {active === 'images' && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between px-1 mb-1">
              <p className="text-xs font-bold text-on-surface">Images &amp; Headlines</p>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                filledCount === 6 ? 'bg-primary-container text-white' : 'bg-surface-container text-on-secondary-container'
              }`}>{filledCount}/6</span>
            </div>
            <label
              className={`flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border-2 border-dashed cursor-pointer transition-all ${
                bulkDragging ? 'border-primary-container bg-primary-container/10 scale-[1.02]'
                : 'border-surface-variant hover:border-primary-container/50 hover:bg-surface-container-high'
              }`}
              onDragOver={e => { e.preventDefault(); setBulkDragging(true); }}
              onDragLeave={() => setBulkDragging(false)}
              onDrop={e => { e.preventDefault(); setBulkDragging(false); handleBulkFiles(e.dataTransfer.files); }}
            >
              <input ref={bulkInputRef} type="file" accept="image/*" multiple className="sr-only"
                onChange={e => { if (e.target.files) handleBulkFiles(e.target.files); e.target.value = ''; }} />
              <Icon name="upload_file" className="text-primary-container" size={16} />
              <span className="text-xs font-bold text-on-surface">Upload all at once</span>
            </label>
            <div className="flex flex-col gap-2 mt-1">
              {uploadedFiles.map((file, i) => (
                <ImageSlot key={i} index={i} file={file}
                  onUpload={f => onUpload(i, f)} onRemove={() => onRemove(i)} />
              ))}
            </div>
          </div>
        )}

        {/* ── COLORS ── */}
        {active === 'colors' && (
          <div className="flex flex-col gap-4">
            <p className="text-xs font-bold text-on-surface px-1">Banner Colors</p>
            <div className="bg-surface-container-lowest rounded-xl p-4 flex flex-col gap-4 border border-surface-variant">
              <ColorRow label="CTA Button" value={colors.cta} onChange={v => onColorChange('cta', v)} />
              <ColorRow label="Headline Text" value={colors.headline} onChange={v => onColorChange('headline', v)} />
              <ColorRow label="Tagline Text" value={colors.tagline} onChange={v => onColorChange('tagline', v)} />
            </div>
            <button
              onClick={() => { onColorChange('cta', '#ee1d25'); onColorChange('headline', '#ffffff'); onColorChange('tagline', '#ffffff'); }}
              className="text-xs font-bold text-on-secondary-container hover:text-on-surface transition-colors px-1 text-left"
            >
              Reset to defaults
            </button>
          </div>
        )}

        {/* ── FONTS placeholder ── */}
        {active === 'fonts' && (
          <div className="flex flex-col items-center justify-center flex-1 gap-2 py-8 text-center">
            <Icon name="format_size" className="text-on-secondary-container" size={32} />
            <p className="text-xs font-semibold text-on-secondary-container">Font options coming soon</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1">
        {NAV_ITEMS.map(({ id, label, icon }) => (
          <button key={id} onClick={() => setActive(id)}
            className={`flex items-center gap-4 p-3 rounded-full text-sm font-bold transition-colors ${
              active === id ? 'bg-primary-container text-white shadow-lg' : 'text-on-surface hover:bg-surface-container-high'
            }`}>
            <Icon name={icon} fill={active === id} />
            {label}
          </button>
        ))}
      </nav>

      {/* Settings */}
      <div className="pt-4 border-t border-surface-variant">
        <button className="flex items-center gap-4 p-3 rounded-full hover:bg-surface-container-high w-full transition-colors text-on-surface text-sm font-bold">
          <Icon name="settings" />
          Settings
        </button>
      </div>
    </aside>
  );
}
