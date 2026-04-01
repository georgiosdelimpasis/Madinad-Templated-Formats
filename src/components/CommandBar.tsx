import Icon from './Icon';

interface CommandBarProps {
  context: string;
  onContextChange: (v: string) => void;
  onHide?: () => void;
}

export default function CommandBar({ context, onContextChange, onHide }: CommandBarProps) {
  return (
    <aside className="w-72 shrink-0 h-full bg-surface-container-lowest border-l border-surface-variant/20 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-surface-variant/20">
        <div className="flex items-center gap-2">
          <Icon name="auto_awesome" size={18} className="text-primary-container" />
          <span className="text-xs font-bold text-on-surface">AI Assistant</span>
        </div>
        {onHide && (
          <button
            onClick={onHide}
            className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-surface-container-high transition-colors text-on-secondary-container cursor-pointer"
            title="Close panel"
          >
            <Icon name="chevron_right" size={18} />
          </button>
        )}
      </div>

      {/* Body — empty space for future chat messages */}
      <div className="flex-1" />

      {/* Input + actions at the bottom */}
      <div className="p-3 border-t border-surface-variant/20 flex flex-col gap-2">
        <textarea
          rows={2}
          value={context}
          onChange={e => onContextChange(e.target.value)}
          placeholder="Describe your campaign…"
          className="w-full bg-surface-container border border-surface-variant rounded-lg px-3 py-2 text-xs font-medium text-on-surface placeholder:text-on-secondary-container focus:outline-none focus:border-primary-container transition-colors resize-none"
        />
        <div className="flex items-center justify-between">
          <div className="flex gap-1">
            {(['mic', 'attach_file', 'mood'] as const).map((icon) => (
              <button
                key={icon}
                className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-surface-container-high transition-colors text-on-secondary-container"
              >
                <Icon name={icon} size={16} />
              </button>
            ))}
          </div>
          <button
            className="w-8 h-8 rounded-full bg-primary-container text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-transform cursor-pointer"
          >
            <Icon name="arrow_upward" size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
