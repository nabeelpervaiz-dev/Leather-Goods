export default function Button({
  children,
  variant = 'primary',
  type = 'button',
  disabled = false,
  className = '',
  onClick,
  ...props
}) {
  const base =
    'inline-flex items-center justify-center gap-2 font-medium text-sm sm:text-base transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary: 'bg-[#241811] text-white hover:bg-[#3A281E] px-6 py-3',
    secondary:
      'bg-white text-[#17130F] border border-[#17130F] hover:bg-[#F3F1ED] px-6 py-3',
    subtle:
      'bg-[#F3F1ED] text-[#17130F] border border-[#E6E2DC] hover:bg-[#E8DCCB] px-5 py-2.5',
    danger: 'bg-[#B42318] text-white hover:bg-[#911B12] px-5 py-2.5',
    ghost: 'bg-transparent text-[#17130F] hover:bg-[#F3F1ED] px-4 py-2',
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${base} ${variants[variant] || variants.primary} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
