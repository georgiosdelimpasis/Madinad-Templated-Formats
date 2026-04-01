interface BannerPreviewProps {
  html: string;
}

export default function BannerPreview({ html }: BannerPreviewProps) {
  return (
    <div className="flex-1 flex items-center justify-center bg-surface p-12">
      <div
        className="shadow-2xl rounded-xl overflow-hidden"
        style={{ width: 300, height: 600, flexShrink: 0 }}
      >
        <iframe
          srcDoc={html}
          sandbox="allow-scripts"
          style={{ width: 300, height: 600, border: 'none', display: 'block' }}
          title="Banner Preview"
        />
      </div>
    </div>
  );
}
