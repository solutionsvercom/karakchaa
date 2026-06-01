import { useMemo, useState } from "react";
import { getCloudinaryImageCandidates } from "../utils/imageUrl";

type Props = {
  src?: string | { url?: string } | null;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
  fallback?: React.ReactNode;
};

export default function ProductImage({
  src,
  alt,
  className,
  style,
  fallback = null,
}: Props) {
  const candidates = useMemo(() => getCloudinaryImageCandidates(src), [src]);
  const [index, setIndex] = useState(0);

  if (!candidates.length || index >= candidates.length) {
    return <>{fallback}</>;
  }

  return (
    <img
      alt={alt}
      src={candidates[index]}
      className={className}
      style={style}
      loading="lazy"
      referrerPolicy="no-referrer"
      onError={() => setIndex((i) => i + 1)}
    />
  );
}
