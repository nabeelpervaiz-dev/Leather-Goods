import { useState } from 'react';

function normalizeAssetUrl(src) {
  if (typeof src === 'string' && src.startsWith('/src/assets/images/') && src.endsWith('.jpg')) {
    return `${src.slice(0, -4)}.webp`;
  }
  return src;
}

export default function SafeImage({
  src,
  alt,
  className = '',
  loading = 'lazy',
  fetchPriority,
  width = 800,
  height = 597,
  fallbackTitle = 'Creating Leather Goods',
}) {
  const [failedSrc, setFailedSrc] = useState(null);
  const resolvedSrc = normalizeAssetUrl(src);
  const hasError = !resolvedSrc || failedSrc === resolvedSrc;

  if (hasError) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-[#F3F1ED] text-[#625D57] p-6 text-center select-none ${className}`}
        role="img"
        aria-label={alt || fallbackTitle}
      >
        <div className="w-10 h-10 border border-[#E6E2DC] flex items-center justify-center mb-2 text-xs font-semibold tracking-wider text-[#8C5A36]">
          CLG
        </div>
        <span className="text-sm font-medium text-[#17130F] line-clamp-2">
          {fallbackTitle}
        </span>
      </div>
    );
  }

  return (
    <img
      src={resolvedSrc}
      alt={alt}
      width={width}
      height={height}
      loading={loading}
      decoding="async"
      fetchPriority={fetchPriority}
      referrerPolicy="no-referrer"
      onError={() => setFailedSrc(resolvedSrc)}
      className={className}
    />
  );
}
