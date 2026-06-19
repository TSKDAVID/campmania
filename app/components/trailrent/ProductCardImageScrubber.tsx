import {useCallback, useMemo, useRef, useState} from 'react';
import {CatalogCardImage} from '~/components/trailrent/CatalogCardImage';

const SESSION_SIZE = 5;
const INDEX_CHANGE_PX = 14;

export function ProductCardImageScrubber({
  images,
  alt,
  fit = 'cover',
}: {
  images: string[];
  alt: string;
  fit?: 'cover' | 'contain';
}) {
  const [isHovering, setIsHovering] = useState(false);
  const [sessionOffset, setSessionOffset] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const lastIndexRef = useRef(0);
  const lastXRef = useRef<number | null>(null);
  const hoverCountRef = useRef(0);

  const sessionImages = useMemo(() => {
    if (images.length <= 1) return images;
    return images.slice(sessionOffset, sessionOffset + SESSION_SIZE);
  }, [images, sessionOffset]);

  const handleEnter = useCallback(() => {
    const batchCount = Math.max(1, Math.ceil(images.length / SESSION_SIZE));
    const batch = hoverCountRef.current % batchCount;
    hoverCountRef.current += 1;
    setSessionOffset(batch * SESSION_SIZE);
    setIsHovering(true);
    setActiveIndex(0);
    lastIndexRef.current = 0;
    lastXRef.current = null;
  }, [images.length]);

  const handleLeave = useCallback(() => {
    setIsHovering(false);
    setActiveIndex(0);
    lastXRef.current = null;
  }, []);

  const handleMove = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (!isHovering || sessionImages.length <= 1) return;

      const rect = event.currentTarget.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const width = rect.width;
      if (width <= 0) return;

      const lastX = lastXRef.current;
      if (lastX != null && Math.abs(x - lastX) < INDEX_CHANGE_PX) return;

      const ratio = Math.min(Math.max(x / width, 0), 0.999);
      const nextIndex = Math.floor(ratio * sessionImages.length);
      if (nextIndex !== lastIndexRef.current) {
        lastIndexRef.current = nextIndex;
        lastXRef.current = x;
        setActiveIndex(nextIndex);
      }
    },
    [isHovering, sessionImages.length],
  );

  const displaySrc = isHovering
    ? (sessionImages[activeIndex] ?? images[0])
    : images[0];

  if (!displaySrc) return null;

  return (
    <div
      className={`cm-pkg-card__scrub${
        isHovering && sessionImages.length > 1 ? ' cm-pkg-card__scrub--active' : ''
      }`}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      onMouseMove={handleMove}
    >
      <CatalogCardImage src={displaySrc} alt={alt} fit={fit} />
    </div>
  );
}
