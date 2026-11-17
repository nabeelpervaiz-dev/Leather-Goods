import { useState } from 'react';
import SafeImage from '../common/SafeImage.jsx';

export default function ProductGallery({ images = [], productName = '', primaryIndex = 0 }) {
  const validImages = images.filter(Boolean).slice(0, 4);
  const [selectedIndex, setSelectedIndex] = useState(
    primaryIndex < validImages.length ? primaryIndex : 0
  );

  const activeImage = validImages[selectedIndex] || validImages[0] || '';

  return (
    <div className="flex flex-col gap-4">
      <div className="aspect-[4/3] bg-[#F3F1ED] border border-[#E6E2DC] overflow-hidden">
        <SafeImage
          src={activeImage}
          alt={productName}
          fallbackTitle={productName}
          loading="eager"
          className="w-full h-full object-cover"
        />
      </div>

      {validImages.length > 1 && (
        <div className="grid grid-cols-4 gap-3">
          {validImages.map((img, idx) => (
            <button
              key={`${img}-${idx}`}
              type="button"
              onClick={() => setSelectedIndex(idx)}
              aria-label={`View ${productName} image ${idx + 1}`}
              className={`aspect-[4/3] bg-[#F3F1ED] overflow-hidden border transition-colors cursor-pointer ${
                idx === selectedIndex
                  ? 'border-[#17130F] ring-1 ring-[#17130F]'
                  : 'border-[#E6E2DC] hover:border-[#8C5A36]'
              }`}
            >
              <SafeImage
                src={img}
                alt={`${productName} thumbnail ${idx + 1}`}
                fallbackTitle={productName}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
