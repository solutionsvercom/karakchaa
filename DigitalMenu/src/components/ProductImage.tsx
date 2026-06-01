import { useState } from "react";
import { displayImageUrl } from "../utils/imageUrl";

type Props = {
  src?: string | { url?: string } | null;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
  fallback?: React.ReactNode;
};

/** Single Cloudinary URL from DB; on 404 show placeholder (no retry spam). */
export default function ProductImage({
  src,
  alt,
  className,
  style,
  fallback = null,
}: Props) {
  const url = displayImageUrl(src);
  const [failed, setFailed] = useState(false);

  if (!url || failed) return <>{fallback}</>;

  return (
    <img
      alt={alt}
      src={url}
      className={className}
      style={style}
      loading="lazy"
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
    />
  );
}
