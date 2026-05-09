import { useEffect, useState } from "react";

type ImageWithFallbackProps = {
  src?: string | null;
  alt: string;
  className?: string;
};

export function ImageWithFallback({
  src,
  alt,
  className,
}: ImageWithFallbackProps) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [src]);

  if (!src || hasError) {
    return (
      <div
        className={`image-placeholder ${className ?? ""}`}
        role="img"
        aria-label={alt}
      >
        <span>{alt.slice(0, 1).toUpperCase()}</span>
      </div>
    );
  }

  return (
    <img
      alt={alt}
      className={className}
      loading="lazy"
      src={src}
      onError={() => setHasError(true)}
    />
  );
}
