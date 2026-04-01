import Icon from './Icon';

export default function Toolbar() {
  return (
    <header className="h-16 flex items-center justify-end px-8 bg-surface/60 backdrop-blur-xl sticky top-0 z-10 shrink-0">
      <button className="bg-on-surface text-surface flex items-center gap-2 px-6 py-2 rounded-full font-bold text-sm hover:opacity-90 transition-opacity">
        <Icon name="download" size={16} className="text-surface" />
        Export
      </button>
    </header>
  );
}
