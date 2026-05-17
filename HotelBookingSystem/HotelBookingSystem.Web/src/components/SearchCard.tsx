import { type FormEvent } from "react";
import { toDateInputValue } from "../utils/dates";

export type SearchCardValues = {
  city: string;
  checkInDate: string;
  checkOutDate: string;
  guestsCount: number;
};

type SearchCardProps = {
  values: SearchCardValues;
  loading?: boolean;
  className?: string;
  onChange: (values: SearchCardValues) => void;
  onSubmit: (event: FormEvent) => void;
};

export function SearchCard({
  values,
  loading = false,
  className,
  onChange,
  onSubmit,
}: SearchCardProps) {
  const today = toDateInputValue(new Date());

  return (
    <form
      className={`search-form hero-search ${className ?? ""}`}
      onSubmit={onSubmit}
    >
      <label>
        Город
        <input
          placeholder="Город"
          value={values.city}
          onChange={(event) =>
            onChange({ ...values, city: event.target.value })
          }
          required
        />
      </label>

      <label>
        Заезд
        <input
          type="date"
          min={today}
          value={values.checkInDate}
          onChange={(event) =>
            onChange({ ...values, checkInDate: event.target.value })
          }
          required
        />
      </label>

      <label>
        Выезд
        <input
          type="date"
          min={values.checkInDate || today}
          value={values.checkOutDate}
          onChange={(event) =>
            onChange({ ...values, checkOutDate: event.target.value })
          }
          required
        />
      </label>

      <label>
        Гости
        <input
          type="number"
          min={1}
          value={values.guestsCount}
          onChange={(event) =>
            onChange({ ...values, guestsCount: Number(event.target.value) })
          }
          required
        />
      </label>

      <button className="button search-button" disabled={loading} type="submit">
        {loading ? "Идет поиск..." : "Найти"}
      </button>
    </form>
  );
}
