import { useMemo, useState } from "react";
import { getCloudinaryImageCandidates } from "../utils/imageUrl";

type Props = {
  src?: string | { url?: string } | null;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
  fallback?: React.ReactNode;
};

/** Tries alternate Cloudinary paths; hides image if asset is missing (stops 404 spam). */
export default function ProductImage({
  src,
  alt,
  className,
  style,
  fallback = null,
}: Props) {
  const candidates = useMemo(() => getCloudinaryImageCandidates(src), [src]);
  const [index, setIndex] = useState(0);

  const url = candidates[index];
  if (!url) return <>{fallback}</>;

  return (
    <img
      alt={alt}
      src={url}
      className={className}
      style={style}
      loading="lazy"
      referrerPolicy="no-referrer"
      onError={() => {
        setIndex((i) => (i + 1 < candidates.length ? i + 1 : candidates.length));
      }}
    />
  );
}
