import { useState, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import type { BannerColors } from './components/Sidebar';
import Icon from './components/Icon';
import Toolbar from './components/Toolbar';
import EmptyState from './components/EmptyState';
import CommandBar from './components/CommandBar';
import FloatingPanels from './components/FloatingPanels';
import { patchBanner } from './utils/patchBanner';
import { exportBanner } from './utils/exportBanner';

const DEFAULT_COLORS: BannerColors = { cta: '#ee1d25', headline: '#ffffff', tagline: '#ffffff' };

export default function App() {
  const [uploadedFiles, setUploadedFiles] = useState<(File | null)[]>(Array(6).fill(null));
  const [slotTexts, setSlotTexts] = useState<string[]>(Array(6).fill(''));
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [colors, setColors] = useState<BannerColors>(DEFAULT_COLORS);
  const [taglineText, setTaglineText] = useState('Your campaign slogan goes here');
  const [labelTexts, setLabelTexts] = useState<string[]>(Array(6).fill('LABEL TEXT'));
  const [ctaText, setCtaText] = useState('Δείτε περισσότερα');
  const [ctaUrl, setCtaUrl] = useState('https://example.com');
  const [slideClickModes, setSlideClickModes] = useState<('default' | 'custom' | 'none')[]>(Array(6).fill('default'));
  const [slideUrls, setSlideUrls] = useState<string[]>(Array(6).fill(''));
  const [campaignContext, setCampaignContext] = useState('');
  const [showCommandBar, setShowCommandBar] = useState(true);
  const [generatedHtml, setGeneratedHtml] = useState<string | null>(null);

  const hasGenerated = useRef(false);
  const canGenerate = uploadedFiles.filter(Boolean).length === 6;

  // Clear preview when images are removed and banner can no longer generate
  useEffect(() => {
    if (!canGenerate) setGeneratedHtml(null);
  }, [canGenerate]);

  const resolvedUrls = slideClickModes.map((mode, i) =>
    mode === 'custom' ? slideUrls[i] : mode === 'default' ? ctaUrl : ''
  );

  // Auto-regen with debounce after first manual generate
  useEffect(() => {
    if (!hasGenerated.current || !canGenerate) return;
    const files = uploadedFiles.filter(Boolean) as File[];
    const timer = setTimeout(async () => {
      const html = await patchBanner(files, slotTexts, logoFile, colors, taglineText, labelTexts, ctaText, resolvedUrls);
      setGeneratedHtml(html);
    }, 300);
    return () => clearTimeout(timer);
  }, [uploadedFiles, slotTexts, logoFile, colors, taglineText, labelTexts, ctaText, canGenerate, ctaUrl, slideClickModes, slideUrls]);

  function handleUpload(index: number, file: File) {
    setUploadedFiles(prev => { const next = [...prev]; next[index] = file; return next; });
  }

  function handleRemove(index: number) {
    setUploadedFiles(prev => { const next = [...prev]; next[index] = null; return next; });
  }

  function handleBulkUpload(files: File[]) {
    setUploadedFiles(prev => {
      const next = [...prev];
      let slot = 0;
      for (const file of files) {
        while (slot < 6 && next[slot] !== null) slot++;
        if (slot >= 6) slot = 0;
        next[slot] = file;
        slot++;
      }
      return next;
    });
  }

  function handleTextChange(index: number, text: string) {
    setSlotTexts(prev => { const next = [...prev]; next[index] = text; return next; });
  }

  function handleColorChange(key: keyof BannerColors, value: string) {
    setColors(prev => ({ ...prev, [key]: value }));
  }

  async function handleGenerate() {
    const files = uploadedFiles.filter(Boolean) as File[];
    if (files.length < 6) return;
    hasGenerated.current = true;

    const PLACEHOLDER_TEXTS = [
      'Discover the new collection',
      'Style that speaks for itself',
      'Made for the bold',
      'Elevate your everyday',
      'Limited time. Unlimited style.',
      'Your next favourite piece',
    ];
    const texts = slotTexts.map((t, i) => t.trim() || PLACEHOLDER_TEXTS[i]);
    setSlotTexts(texts);

    const html = await patchBanner(files, texts, logoFile, colors, taglineText, labelTexts, ctaText, resolvedUrls);
    setGeneratedHtml(html);
  }

  return (
    <div className="h-screen overflow-hidden flex bg-surface text-on-surface relative">
      <Sidebar
        uploadedFiles={uploadedFiles}
        logoFile={logoFile}
        colors={colors}
        onUpload={handleUpload}
        onRemove={handleRemove}
        onBulkUpload={handleBulkUpload}
        onLogoFileChange={f => setLogoFile(f)}
        onColorChange={handleColorChange}
      />
      <main className="flex-1 flex flex-col bg-surface overflow-hidden min-w-0">
        <Toolbar
          canExport={!!generatedHtml}
          onExport={() => {
            const files = uploadedFiles.filter(Boolean) as File[];
            if (files.length < 6) return;
            exportBanner(files, slotTexts, logoFile, colors, taglineText, labelTexts, ctaText, resolvedUrls);
          }}
        />
        {generatedHtml ? (
          <FloatingPanels
            html={generatedHtml}
            logoFile={logoFile}
            onLogoFileChange={f => setLogoFile(f)}
            taglineText={taglineText}
            onTaglineChange={setTaglineText}
            uploadedFiles={uploadedFiles}
            onUpload={handleUpload}
            onRemove={handleRemove}
            labelTexts={labelTexts}
            onLabelChange={(i, v) => setLabelTexts(prev => { const next = [...prev]; next[i] = v; return next; })}
            slotTexts={slotTexts}
            onTextChange={handleTextChange}
            ctaText={ctaText}
            onCtaChange={setCtaText}
            ctaUrl={ctaUrl}
            onCtaUrlChange={setCtaUrl}
            slideClickModes={slideClickModes}
            onSlideClickModeChange={(i, v) => setSlideClickModes(prev => { const next = [...prev]; next[i] = v; return next; })}
            slideUrls={slideUrls}
            onSlideUrlChange={(i, v) => setSlideUrls(prev => { const next = [...prev]; next[i] = v; return next; })}
            colors={colors}
            onColorChange={handleColorChange}
          />
        ) : (
          <EmptyState onGenerate={handleGenerate} canGenerate={canGenerate} />
        )}
      </main>
      {showCommandBar ? (
        <CommandBar context={campaignContext} onContextChange={setCampaignContext} onHide={() => setShowCommandBar(false)} />
      ) : (
        <button
          onClick={() => setShowCommandBar(true)}
          className="absolute right-4 bottom-4 flex items-center gap-2 px-4 py-2 rounded-full bg-primary-container text-white text-xs font-bold shadow-lg hover:scale-105 transition-transform cursor-pointer z-20"
        >
          <Icon name="auto_awesome" size={16} />
          AI
        </button>
      )}
    </div>
  );
}
