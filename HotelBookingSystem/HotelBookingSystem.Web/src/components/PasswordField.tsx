import { useState, type InputHTMLAttributes } from "react";

type PasswordFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label: string;
};

export function PasswordField({ label, ...inputProps }: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);
  const buttonLabel = visible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`;

  return (
    <label>
      {label}
      <span className="password-field">
        <input {...inputProps} type={visible ? "text" : "password"} />
        <button
          aria-label={buttonLabel}
          className="password-toggle"
          type="button"
          onClick={() => setVisible((current) => !current)}
        >
          {visible ? "Hide" : "Show"}
        </button>
      </span>
    </label>
  );
}
