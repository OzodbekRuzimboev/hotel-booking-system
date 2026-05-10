import { useEffect, useState } from "react";
import { ImageWithFallback } from "./ImageWithFallback";

type ImageGalleryProps = {
  images: string[];
  alt: string;
};

export function getGalleryImages(
  imageUrls?: string[] | null,
  imageUrl?: string | null
) {
  const images = imageUrls && imageUrls.length > 0 ? imageUrls : [];
  return images.length > 0 ? images : imageUrl ? [imageUrl] : [];
}

export function ImageGallery({ images, alt }: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selectedImage = images[selectedIndex] ?? null;

  useEffect(() => {
    setSelectedIndex(0);
  }, [images]);

  return (
    <div className="media-gallery">
      <ImageWithFallback
        alt={alt}
        className="media-gallery-main"
        src={selectedImage}
      />
      {images.length > 1 && (
        <div className="media-gallery-strip">
          {images.map((imageUrl, index) => (
            <button
              aria-label={`Show image ${index + 1}`}
              className={
                index === selectedIndex
                  ? "gallery-thumb selected"
                  : "gallery-thumb"
              }
              key={`${imageUrl}-${index}`}
              type="button"
              onClick={() => setSelectedIndex(index)}
            >
              <ImageWithFallback
                alt={`${alt} ${index + 1}`}
                className="gallery-thumb-image"
                src={imageUrl}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
