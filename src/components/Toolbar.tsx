import Icon from './Icon';

interface ToolbarProps {
  onExport?: () => void;
  canExport?: boolean;
}

export default function Toolbar({ onExport, canExport }: ToolbarProps) {
  return (
    <header className="h-16 flex items-center justify-end px-8 bg-surface/60 backdrop-blur-xl sticky top-0 z-10 shrink-0">
      <button
        onClick={onExport}
        disabled={!canExport}
        className={`flex items-center gap-2 px-6 py-2 rounded-full font-bold text-sm transition-opacity ${
          canExport
            ? 'bg-on-surface text-surface hover:opacity-90 cursor-pointer'
            : 'bg-surface-container text-on-secondary-container cursor-not-allowed opacity-60'
        }`}
      >
        <Icon name="download" size={16} />
        Export
      </button>
    </header>
  );
}
