import { useState, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import type { BannerColors } from './components/Sidebar';
import Toolbar from './components/Toolbar';
import EmptyState from './components/EmptyState';
import CommandBar from './components/CommandBar';
import BannerPreview from './components/BannerPreview';
import { patchBanner } from './utils/patchBanner';

const DEFAULT_COLORS: BannerColors = { cta: '#ee1d25', headline: '#ffffff', tagline: '#ffffff' };

export default function App() {
  const [uploadedFiles, setUploadedFiles] = useState<(File | null)[]>(Array(6).fill(null));
  const [slotTexts, setSlotTexts] = useState<string[]>(Array(6).fill(''));
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoText, setLogoText] = useState('');
  const [colors, setColors] = useState<BannerColors>(DEFAULT_COLORS);
  const [generatedHtml, setGeneratedHtml] = useState<string | null>(null);

  const hasGenerated = useRef(false);
  const canGenerate = uploadedFiles.filter(Boolean).length === 6;

  // Clear preview when images are removed and banner can no longer generate
  useEffect(() => {
    if (!canGenerate) setGeneratedHtml(null);
  }, [canGenerate]);

  // Auto-regen with debounce after first manual generate
  useEffect(() => {
    if (!hasGenerated.current || !canGenerate) return;
    const files = uploadedFiles.filter(Boolean) as File[];
    const timer = setTimeout(async () => {
      const html = await patchBanner(files, slotTexts, logoFile, logoText, colors);
      setGeneratedHtml(html);
    }, 300);
    return () => clearTimeout(timer);
  }, [uploadedFiles, slotTexts, logoFile, logoText, colors, canGenerate]);

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
    const html = await patchBanner(files, slotTexts, logoFile, logoText, colors);
    setGeneratedHtml(html);
  }

  return (
    <div className="h-screen overflow-hidden flex bg-surface text-on-surface">
      <Sidebar
        uploadedFiles={uploadedFiles}
        slotTexts={slotTexts}
        logoFile={logoFile}
        logoText={logoText}
        colors={colors}
        onUpload={handleUpload}
        onRemove={handleRemove}
        onBulkUpload={handleBulkUpload}
        onTextChange={handleTextChange}
        onLogoFileChange={f => setLogoFile(f)}
        onLogoTextChange={t => setLogoText(t)}
        onColorChange={handleColorChange}
      />
      <main className="flex-1 flex flex-col bg-surface overflow-hidden">
        <Toolbar />
        {generatedHtml ? <BannerPreview html={generatedHtml} /> : <EmptyState />}
        <CommandBar onGenerate={handleGenerate} canGenerate={canGenerate} />
      </main>
    </div>
  );
}
