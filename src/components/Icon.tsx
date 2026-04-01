interface IconProps {
  name: string;
  fill?: boolean;
  className?: string;
  size?: number;
}

export default function Icon({ name, fill = false, className = '', size = 24 }: IconProps) {
  return (
    <span
      className={`material-symbols-outlined select-none ${className}`}
      style={{
        fontVariationSettings: `'FILL' ${fill ? 1 : 0}, 'wght' 400, 'GRAD' 0, 'opsz' ${size}`,
        fontSize: size,
      }}
    >
      {name}
    </span>
  );
}
