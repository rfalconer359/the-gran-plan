import { useEffect, useCallback, useState } from 'react';
import { cn } from '../../utils/cn';

interface PhotoLightboxProps {
  photoUrls: string[];
  initialIndex: number;
  onClose: () => void;
}

export function PhotoLightbox({ photoUrls, initialIndex, onClose }: PhotoLightboxProps) {
  const [index, setIndex] = useState(initialIndex);
  const hasMultiple = photoUrls.length > 1;

  const prev = useCallback(() => setIndex((i) => (i > 0 ? i - 1 : photoUrls.length - 1)), [photoUrls.length]);
  const next = useCallback(() => setIndex((i) => (i < photoUrls.length - 1 ? i + 1 : 0)), [photoUrls.length]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, prev, next]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
      onClick={onClose}
    >
      {/* Close */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 w-12 h-12 flex items-center justify-center rounded-full bg-white/20 text-white text-2xl hover:bg-white/30 transition-colors"
        aria-label="Close"
      >
        &times;
      </button>

      {/* Prev */}
      {hasMultiple && (
        <button
          onClick={(e) => { e.stopPropagation(); prev(); }}
          className={cn(
            'absolute left-4 w-12 h-12 flex items-center justify-center rounded-full text-2xl font-bold transition-colors',
            'bg-white/20 text-white hover:bg-white/30',
          )}
          aria-label="Previous photo"
        >
          &lsaquo;
        </button>
      )}

      {/* Image */}
      <img
        src={photoUrls[index]}
        alt=""
        className="max-w-[90vw] max-h-[85vh] object-contain rounded-lg"
        onClick={(e) => e.stopPropagation()}
      />

      {/* Next */}
      {hasMultiple && (
        <button
          onClick={(e) => { e.stopPropagation(); next(); }}
          className={cn(
            'absolute right-4 w-12 h-12 flex items-center justify-center rounded-full text-2xl font-bold transition-colors',
            'bg-white/20 text-white hover:bg-white/30',
          )}
          aria-label="Next photo"
        >
          &rsaquo;
        </button>
      )}

      {/* Counter */}
      {hasMultiple && (
        <span className="absolute bottom-6 text-white text-lg font-medium bg-black/40 px-4 py-1 rounded-full">
          {index + 1} / {photoUrls.length}
        </span>
      )}
    </div>
  );
}
