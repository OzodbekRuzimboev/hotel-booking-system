import { ImageWithFallback } from "./ImageWithFallback";

type ImageFieldProps = {
  label: string;
  value: string;
  previewAlt: string;
  onChange: (value: string) => void;
};

export function ImageField({
  label,
  value,
  previewAlt,
  onChange,
}: ImageFieldProps) {
  function handleFile(file?: File) {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        onChange(reader.result);
      }
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className="image-field">
      <div className="image-field-preview">
        <ImageWithFallback
          alt={previewAlt || label}
          className="image-field-image"
          src={value}
        />
      </div>
      <div className="stack-sm">
        <label>
          {label}
          <input
            accept="image/*"
            type="file"
            onChange={(event) => handleFile(event.target.files?.[0])}
          />
        </label>
        <label>
          Image link
          <input
            value={value.startsWith("data:") ? "" : value}
            onChange={(event) => onChange(event.target.value)}
            placeholder="Paste an image link or choose a file above"
          />
        </label>
        {value && (
          <button
            className="button secondary inline-button"
            type="button"
            onClick={() => onChange("")}
          >
            Remove image
          </button>
        )}
      </div>
    </div>
  );
}
