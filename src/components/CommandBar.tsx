import { useRef } from 'react';
import Icon from './Icon';

interface CommandBarProps {
  onGenerate: () => void;
  canGenerate: boolean;
}

export default function CommandBar({ onGenerate, canGenerate }: CommandBarProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  return (
    <footer className="p-8 w-full max-w-5xl mx-auto">
      <div className="bg-surface-container-lowest rounded-xl p-3 flex flex-col gap-3 shadow-2xl shadow-on-surface/5 border border-surface-variant/20">
        <div className="flex items-start gap-4 px-3 py-2">
          <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center shrink-0 mt-1">
            <Icon name="auto_awesome" className="text-primary-container" />
          </div>
          <textarea
            ref={textareaRef}
            rows={2}
            placeholder="Describe your campaign (e.g. 20% off sneakers this weekend)..."
            className="flex-1 bg-transparent border-none outline-none text-on-surface placeholder:text-on-secondary-container text-base font-medium resize-none py-2"
          />
        </div>
        <div className="flex items-center justify-between border-t border-surface-container pt-3">
          <div className="flex gap-2">
            {(['mic', 'attach_file', 'mood'] as const).map((icon) => (
              <button
                key={icon}
                className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-surface-container-high transition-colors text-on-secondary-container"
              >
                <Icon name={icon} />
              </button>
            ))}
          </div>
          <button
            onClick={onGenerate}
            disabled={!canGenerate}
            className={`px-8 py-3 rounded-full font-bold flex items-center gap-2 transition-all shadow-lg ${
              canGenerate
                ? 'bg-primary-container text-white hover:scale-105 active:scale-95 cursor-pointer'
                : 'bg-surface-container text-on-secondary-container cursor-not-allowed opacity-60'
            }`}
          >
            <Icon name="auto_awesome" size={20} />
            Generate
          </button>
        </div>
      </div>
    </footer>
  );
}
