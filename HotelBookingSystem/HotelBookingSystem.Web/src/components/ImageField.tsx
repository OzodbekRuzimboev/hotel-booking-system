import { useEffect, useState } from "react";
import { ImageWithFallback } from "./ImageWithFallback";

type ImageFieldProps = {
  label: string;
  values: string[];
  previewAlt: string;
  maxImages?: number;
  onChange: (values: string[]) => void;
};

function readOriginalFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("Не удалось прочитать файл изображения."));
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function readFileAsDataUrl(file: File) {
  const maxImageSize = 1600;

  return new Promise<string>((resolve) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);

      const scale = Math.min(
        1,
        maxImageSize / Math.max(image.naturalWidth, image.naturalHeight)
      );
      const width = Math.max(1, Math.round(image.naturalWidth * scale));
      const height = Math.max(1, Math.round(image.naturalHeight * scale));
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");

      if (!context) {
        readOriginalFileAsDataUrl(file)
          .then(resolve)
          .catch(() => resolve(""));
        return;
      }

      canvas.width = width;
      canvas.height = height;
      context.drawImage(image, 0, 0, width, height);
      resolve(canvas.toDataURL("image/jpeg", 0.86));
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      readOriginalFileAsDataUrl(file)
        .then(resolve)
        .catch(() => resolve(""));
    };

    image.src = objectUrl;
  });
}

function uniqueImages(values: string[], maxImages = 10) {
  return Array.from(
    new Set(values.map((value) => value.trim()).filter(Boolean))
  ).slice(0, maxImages);
}

export function ImageField({
  label,
  values,
  previewAlt,
  maxImages = 10,
  onChange,
}: ImageFieldProps) {
  const [imageLink, setImageLink] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const images = uniqueImages(values, maxImages);
  const selectedImage = images[selectedIndex] ?? null;

  useEffect(() => {
    if (selectedIndex >= images.length) {
      setSelectedIndex(Math.max(0, images.length - 1));
    }
  }, [images.length, selectedIndex]);

  async function handleFiles(files?: FileList | null) {
    if (!files || files.length === 0) return;

    const nextImages = await Promise.all(
      Array.from(files)
        .filter((file) => file.type.startsWith("image/"))
        .map(readFileAsDataUrl)
    );
    const startIndex = maxImages === 1 ? 0 : images.length;
    const mergedImages =
      maxImages === 1
        ? uniqueImages(nextImages, maxImages)
        : uniqueImages([...images, ...nextImages], maxImages);

    onChange(mergedImages);
    setSelectedIndex(Math.min(startIndex, Math.max(0, mergedImages.length - 1)));
  }

  function handleAddLink() {
    const nextImageLink = imageLink.trim();
    if (!nextImageLink) return;

    const startIndex = maxImages === 1 ? 0 : images.length;
    const mergedImages =
      maxImages === 1
        ? uniqueImages([nextImageLink], maxImages)
        : uniqueImages([...images, nextImageLink], maxImages);

    onChange(mergedImages);
    setSelectedIndex(Math.min(startIndex, Math.max(0, mergedImages.length - 1)));
    setImageLink("");
  }

  function handleRemoveSelected() {
    if (images.length === 0) return;

    const nextImages = images.filter((_, index) => index !== selectedIndex);
    onChange(nextImages);
    setSelectedIndex(Math.min(selectedIndex, Math.max(0, nextImages.length - 1)));
  }

  function showPrevious() {
    if (images.length <= 1) return;
    setSelectedIndex((index) => (index === 0 ? images.length - 1 : index - 1));
  }

  function showNext() {
    if (images.length <= 1) return;
    setSelectedIndex((index) => (index + 1) % images.length);
  }

  return (
    <div className="image-field">
      <div className="image-field-stage">
        <ImageWithFallback
          alt={previewAlt || label}
          className="image-field-image"
          src={selectedImage}
        />

        {images.length > 0 && selectedIndex === 0 && (
          <span className="cover-badge">Обложка</span>
        )}

        {images.length > 1 && (
          <>
            <button
              aria-label="Предыдущее изображение"
              className="gallery-arrow previous"
              type="button"
              onClick={showPrevious}
            >
              &lt;
            </button>
            <button
              aria-label="Следующее изображение"
              className="gallery-arrow next"
              type="button"
              onClick={showNext}
            >
              &gt;
            </button>
          </>
        )}
      </div>

      <div className="stack-sm">
        <label>
          {label}
          <input
            accept="image/*"
            multiple={maxImages !== 1}
            type="file"
            onChange={(event) => handleFiles(event.target.files)}
          />
        </label>
        <label>
          URL изображения (необязательно)
          <input
            value={imageLink}
            onChange={(event) => setImageLink(event.target.value)}
            placeholder="https://example.com/photo.jpg"
          />
          <span className="field-hint">
            Используйте это поле, только если изображение уже доступно онлайн. Его можно оставить пустым.
          </span>
        </label>
        <div className="image-field-actions">
          <button
            className="button secondary inline-button"
            type="button"
            onClick={handleAddLink}
          >
            Добавить URL
          </button>
          {images.length > 0 && (
            <button
              className="button secondary inline-button"
              type="button"
              onClick={handleRemoveSelected}
            >
              Удалить изображение
            </button>
          )}
        </div>
        {images.length > 0 && (
          <p className="muted small">
            Изображение {selectedIndex + 1} из {images.length}
          </p>
        )}
      </div>
    </div>
  );
}
