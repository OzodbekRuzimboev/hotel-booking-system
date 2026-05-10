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
  return (
    <div
      className={`image-fallback-frame ${className ?? ""} ${
        src ? "" : "image-fallback-broken"
      }`}
      role="img"
      aria-label={alt}
    >
      {src && (
        <img
          alt=""
          aria-hidden="true"
          loading="lazy"
          src={src}
          onError={(event) => {
            event.currentTarget.parentElement?.classList.add(
              "image-fallback-broken"
            );
          }}
        />
      )}
      <div className="image-placeholder image-fallback-placeholder">
        <span>{alt.slice(0, 1).toUpperCase()}</span>
      </div>
    </div>
  );
}
