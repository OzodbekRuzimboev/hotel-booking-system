import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { getApiErrorMessage } from "../api/client";
import {
  HOTEL_AMENITIES,
  MEAL_OPTIONS,
  ROOM_AMENITIES,
  type AmenityOption,
} from "../constants/amenities";
import type {
  AssignHotelOwnerRequest,
  CreateHotelRequest,
  CreateRoomRequest,
  ManagedHotelResponse,
  ManagedRoomResponse,
  ManagedRoomTypeResponse,
  RoomTypeRequest,
  UpdateHotelRequest,
  UpdateRoomRequest,
  UpdateRoomTypeRequest,
} from "../types";
import { formatCurrency } from "../utils/format";
import { ImageField } from "./ImageField";
import { ImageWithFallback } from "./ImageWithFallback";

type HotelManagementProps = {
  title: string;
  listTitle?: string;
  loadHotels: () => Promise<ManagedHotelResponse[]>;
  updateHotel: (hotelId: number, request: UpdateHotelRequest) => Promise<ManagedHotelResponse>;
  createRoomType: (hotelId: number, request: RoomTypeRequest) => Promise<ManagedRoomTypeResponse>;
  updateRoomType: (roomTypeId: number, request: UpdateRoomTypeRequest) => Promise<ManagedRoomTypeResponse>;
  deactivateRoomType: (roomTypeId: number) => Promise<void>;
  createRoom: (roomTypeId: number, request: CreateRoomRequest) => Promise<ManagedRoomResponse>;
  updateRoom: (roomId: number, request: UpdateRoomRequest) => Promise<ManagedRoomResponse>;
  deactivateRoom: (roomId: number) => Promise<void>;
  createHotel?: (request: CreateHotelRequest) => Promise<unknown>;
  deactivateHotel?: (hotelId: number) => Promise<void>;
  assignHotelOwner?: (hotelId: number, request: AssignHotelOwnerRequest) => Promise<ManagedHotelResponse>;
  hotelFilter?: (hotel: ManagedHotelResponse) => boolean;
  hotelDetailsPath?: (hotel: ManagedHotelResponse) => string;
};

type RoomTypeDraft = {
  name: string;
  description: string;
  imageUrls: string[];
  amenities: string[];
  mealOptions: string[];
  capacity: number;
  price: string;
  roomsText: string;
};

type RoomTypeEditDraft = Omit<RoomTypeDraft, "roomsText">;

export type ActionFeedbackOptions = {
  onError?: (message: string) => void;
  onSuccess?: (message: string) => void;
};

type HotelDraft = {
  name: string;
  description: string;
  imageUrls: string[];
  city: string;
  address: string;
  amenities: string[];
  roomTypes: RoomTypeDraft[];
};

const blankRoomType = (): RoomTypeDraft => ({
  name: "",
  description: "",
  imageUrls: [],
  amenities: [],
  mealOptions: [],
  capacity: 1,
  price: "100",
  roomsText: "",
});

const blankHotel = (): HotelDraft => ({
  name: "",
  description: "",
  imageUrls: [],
  city: "",
  address: "",
  amenities: [],
  roomTypes: [blankRoomType()],
});

function optionalText(value: string) {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function roomNumbersFromText(value: string) {
  return value
    .split(/[\n,]+/)
    .map((number) => number.trim())
    .filter(Boolean);
}

function roomsFromText(value: string) {
  return roomNumbersFromText(value).map((number) => ({ number }));
}

function primaryImageUrl(imageUrls: string[]) {
  return imageUrls.find((imageUrl) => imageUrl.trim().length > 0) ?? null;
}

function imageUrlsFromResponse(imageUrls?: string[] | null, imageUrl?: string | null) {
  return imageUrls && imageUrls.length > 0 ? imageUrls : imageUrl ? [imageUrl] : [];
}

function parseDecimalInput(value: string | number) {
  if (typeof value === "number") return value;

  const parsed = Number(value.trim().replace(",", "."));
  return Number.isFinite(parsed) ? parsed : 0;
}

function toggleSelection(values: string[], value: string) {
  return values.includes(value)
    ? values.filter((current) => current !== value)
    : [...values, value];
}

function roomTypeEditDraftFromResponse(roomType: ManagedRoomTypeResponse): RoomTypeEditDraft {
  return {
    name: roomType.name,
    description: roomType.description ?? "",
    imageUrls: imageUrlsFromResponse(roomType.imageUrls, roomType.imageUrl),
    amenities: roomType.amenities ?? [],
    mealOptions: roomType.mealOptions ?? [],
    capacity: roomType.capacity,
    price: roomType.price.toString(),
  };
}

function updateRoomTypeRequestFromDraft(draft: RoomTypeEditDraft): UpdateRoomTypeRequest {
  return {
    name: draft.name,
    description: optionalText(draft.description),
    imageUrl: primaryImageUrl(draft.imageUrls),
    imageUrls: draft.imageUrls,
    amenities: draft.amenities,
    mealOptions: draft.mealOptions,
    capacity: Number(draft.capacity),
    price: parseDecimalInput(draft.price),
  };
}

function CheckboxFieldGroup({
  options,
  selected,
  title,
  onToggle,
}: {
  options: AmenityOption[];
  selected: string[];
  title: string;
  onToggle: (value: string) => void;
}) {
  return (
    <fieldset className="checkbox-group">
      <legend>{title}</legend>
      <div className="checkbox-grid">
        {options.map((option) => (
          <label className="checkbox-label" key={option.value}>
            <input
              checked={selected.includes(option.value)}
              type="checkbox"
              onChange={() => onToggle(option.value)}
            />
            <span>{option.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function RoomNumberDraftEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const [roomNumber, setRoomNumber] = useState("");
  const [localError, setLocalError] = useState("");
  const roomNumbers = roomNumbersFromText(value);

  function updateRoomNumbers(nextRoomNumbers: string[]) {
    onChange(nextRoomNumbers.join("\n"));
  }

  function handleAddRoom() {
    const nextRoomNumber = roomNumber.trim();
    if (!nextRoomNumber) return;

    if (roomNumbers.some((number) => number.toLowerCase() === nextRoomNumber.toLowerCase())) {
      setLocalError("Этот номер уже есть в списке.");
      return;
    }

    updateRoomNumbers([...roomNumbers, nextRoomNumber]);
    setRoomNumber("");
    setLocalError("");
  }

  return (
    <section className="room-number-editor">
      <div>
        <strong>Номера</strong>
        <p className="muted small">
          Добавляйте номера по одному. Нужен хотя бы один номер.
        </p>
      </div>

      <div className="room-number-add-form">
        <label>
          Номер комнаты
          <input
            value={roomNumber}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                handleAddRoom();
              }
            }}
            onChange={(event) => {
              setLocalError("");
              setRoomNumber(event.target.value);
            }}
            placeholder="101"
          />
        </label>
        <button className="button secondary" type="button" onClick={handleAddRoom}>
          Добавить номер
        </button>
      </div>

      {localError && <p className="alert error compact-alert">{localError}</p>}

      {roomNumbers.length > 0 ? (
        <div className="room-grid">
          {roomNumbers.map((number) => (
            <span className="room-chip" key={number}>
              <span>{number}</span>
              <button
                className="mini-button danger-text"
                type="button"
                onClick={() =>
                  updateRoomNumbers(roomNumbers.filter((current) => current !== number))
                }
              >
                Удалить
              </button>
            </span>
          ))}
        </div>
      ) : (
        <p className="muted small">Номера пока не добавлены.</p>
      )}
    </section>
  );
}

function roomTypeRequestFromDraft(draft: RoomTypeDraft): RoomTypeRequest {
  return {
    name: draft.name.trim(),
    description: optionalText(draft.description),
    imageUrl: primaryImageUrl(draft.imageUrls),
    imageUrls: draft.imageUrls,
    amenities: draft.amenities,
    mealOptions: draft.mealOptions,
    capacity: Number(draft.capacity),
    price: parseDecimalInput(draft.price),
    rooms: roomsFromText(draft.roomsText),
  };
}

function hotelRequestFromDraft(draft: HotelDraft): CreateHotelRequest {
  return {
    name: draft.name.trim(),
    description: optionalText(draft.description),
    imageUrl: primaryImageUrl(draft.imageUrls),
    imageUrls: draft.imageUrls,
    city: draft.city.trim(),
    address: draft.address.trim(),
    amenities: draft.amenities,
    roomTypes: draft.roomTypes
      .filter((roomType) => roomType.name.trim().length > 0)
      .map(roomTypeRequestFromDraft),
  };
}

export function HotelManagement({
  title,
  listTitle = "Отели",
  loadHotels,
  updateHotel,
  createRoomType,
  updateRoomType,
  deactivateRoomType,
  createRoom,
  updateRoom,
  deactivateRoom,
  createHotel,
  deactivateHotel,
  assignHotelOwner,
  hotelFilter,
  hotelDetailsPath,
}: HotelManagementProps) {
  const [hotels, setHotels] = useState<ManagedHotelResponse[]>([]);
  const [selectedHotelId, setSelectedHotelId] = useState<number | "all">("all");
  const [draft, setDraft] = useState<HotelDraft>(blankHotel());
  const [createHotelOpen, setCreateHotelOpen] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const filteredHotels = useMemo(
    () => (hotelFilter ? hotels.filter(hotelFilter) : hotels),
    [hotels, hotelFilter]
  );

  const visibleHotels = useMemo(() => {
    if (selectedHotelId === "all") return filteredHotels;
    return filteredHotels.filter((hotel) => hotel.id === selectedHotelId);
  }, [filteredHotels, selectedHotelId]);

  const refreshHotels = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      setHotels(await loadHotels());
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [loadHotels]);

  useEffect(() => {
    refreshHotels();
  }, [refreshHotels]);

  async function runAction(
    action: () => Promise<unknown>,
    message: string,
    feedback?: ActionFeedbackOptions
  ) {
    setError("");
    setSuccess("");

    try {
      await action();
      await refreshHotels();
      if (feedback?.onSuccess) {
        feedback.onSuccess(message);
      } else {
        setSuccess(message);
      }
      return true;
    } catch (err) {
      const errorMessage = getApiErrorMessage(err);
      if (feedback?.onError) {
        feedback.onError(errorMessage);
      } else {
        setError(errorMessage);
      }
      return false;
    }
  }

  async function handleCreateHotel(event: FormEvent) {
    event.preventDefault();
    if (!createHotel) return;

    await runAction(async () => {
      await createHotel(hotelRequestFromDraft(draft));
      setDraft(blankHotel());
      setCreateHotelOpen(false);
    }, "Отель создан.");
  }

  return (
    <main className="page stack-lg">
      <div className="page-header">
        <div>
          <p className="eyebrow">Управление</p>
          <h1>{title}</h1>
        </div>
      </div>

      {error && <p className="alert error">{error}</p>}
      {success && <p className="alert success">{success}</p>}
      {loading && <p className="muted">Загрузка отелей...</p>}

      {createHotel && (
        createHotelOpen ? (
          <section className="panel stack-lg">
            <div className="row between gap wrap">
              <div>
                <p className="eyebrow">Новый объект</p>
                <h2>Создать отель</h2>
                <p className="muted">
                  Добавьте основные данные, выберите обложку и создайте хотя бы
                  один тип номера с реальными номерами комнат.
                </p>
              </div>
              <button className="button secondary" type="button" onClick={() => setCreateHotelOpen(false)}>
                Скрыть форму
              </button>
            </div>
          <form className="form wide" onSubmit={handleCreateHotel}>
            <div className="form-grid two">
              <label>
                Название
                <input value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} required minLength={2} />
              </label>
              <label>
                Город
                <input value={draft.city} onChange={(event) => setDraft({ ...draft, city: event.target.value })} required minLength={2} />
              </label>
              <label className="full">
                Адрес
                <input value={draft.address} onChange={(event) => setDraft({ ...draft, address: event.target.value })} required minLength={5} />
              </label>
              <div className="full">
                <ImageField
                  label="Обложка отеля"
                  previewAlt={draft.name || "Обложка отеля"}
                  values={draft.imageUrls}
                  onChange={(imageUrls) => setDraft({ ...draft, imageUrls })}
                />
              </div>
              <label className="full">
                Описание
                <textarea value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} rows={3} />
              </label>
              <div className="full">
                <CheckboxFieldGroup
                  options={HOTEL_AMENITIES}
                  selected={draft.amenities}
                  title="Удобства отеля"
                  onToggle={(value) =>
                    setDraft({
                      ...draft,
                      amenities: toggleSelection(draft.amenities, value),
                    })
                  }
                />
              </div>
            </div>

            <div className="stack">
              <div className="row between">
                <h3>Типы номеров</h3>
                <button className="button secondary" type="button" onClick={() => setDraft({ ...draft, roomTypes: [...draft.roomTypes, blankRoomType()] })}>
                  Добавить тип номера
                </button>
              </div>

              {draft.roomTypes.map((roomType, index) => (
                <div className="nested-form" key={index}>
                  <div className="row between gap">
                    <strong>Тип номера {index + 1}</strong>
                    {draft.roomTypes.length > 1 && (
                      <button className="button danger" type="button" onClick={() => setDraft({ ...draft, roomTypes: draft.roomTypes.filter((_, i) => i !== index) })}>
                        Удалить
                      </button>
                    )}
                  </div>
                  <RoomTypeDraftFields
                    draft={roomType}
                    onChange={(next) => {
                      const nextTypes = [...draft.roomTypes];
                      nextTypes[index] = next;
                      setDraft({ ...draft, roomTypes: nextTypes });
                    }}
                  />
                </div>
              ))}
            </div>

            <button className="button" type="submit">Создать отель</button>
          </form>
          </section>
        ) : (
          <div className="row gap wrap">
            <button className="button" type="button" aria-expanded={createHotelOpen} onClick={() => setCreateHotelOpen(true)}>
              Создать отель
            </button>
          </div>
        )
      )}

      <section className="panel stack">
        <div className="row between gap wrap">
          <h2>{listTitle}</h2>
          <select value={selectedHotelId} onChange={(event) => setSelectedHotelId(event.target.value === "all" ? "all" : Number(event.target.value))}>
            <option value="all">Все отели</option>
            {filteredHotels.map((hotel) => (
              <option key={hotel.id} value={hotel.id}>{hotel.name}</option>
            ))}
          </select>
        </div>

        {visibleHotels.length === 0 && !loading && <p className="muted">Отели не найдены.</p>}

        <div className="management-list">
          {visibleHotels.map((hotel) => (
            hotelDetailsPath ? (
              <Link
                className="admin-hotel-summary"
                key={hotel.id}
                to={hotelDetailsPath(hotel)}
              >
                <ImageWithFallback
                  alt={hotel.name}
                  className="management-image"
                  src={hotel.imageUrl}
                />
                <div className="stack-sm">
                  <div className="row gap wrap">
                    <h3>{hotel.name}</h3>
                    <span className={hotel.isActive ? "status active" : "status inactive"}>
                      {hotel.isActive ? "Активен" : "Неактивен"}
                    </span>
                  </div>
                  <p className="muted">
                    #{hotel.id} - {hotel.city} - {hotel.address}
                  </p>
                  <p className="muted small">
                    типов номеров: {hotel.roomTypes.length}
                    {hotel.ownerId ? ` - ID владельца: ${hotel.ownerId}` : ""}
                  </p>
                </div>
              </Link>
            ) : (
              <ManagedHotelCard
                key={hotel.id}
                hotel={hotel}
                updateHotel={updateHotel}
                createRoomType={createRoomType}
                updateRoomType={updateRoomType}
                deactivateRoomType={deactivateRoomType}
                createRoom={createRoom}
                updateRoom={updateRoom}
                deactivateRoom={deactivateRoom}
                deactivateHotel={deactivateHotel}
                assignHotelOwner={assignHotelOwner}
                runAction={runAction}
              />
            )
          ))}
        </div>
      </section>
    </main>
  );
}

function RoomTypeDraftFields({
  draft,
  onChange,
}: {
  draft: RoomTypeDraft;
  onChange: (draft: RoomTypeDraft) => void;
}) {
  return (
    <div className="room-type-draft-fields">
      <div className="form-grid two">
        <label>
          Название
          <input value={draft.name} onChange={(event) => onChange({ ...draft, name: event.target.value })} required minLength={2} />
        </label>
        <label>
          Вместимость
          <input type="number" min={1} value={draft.capacity} onChange={(event) => onChange({ ...draft, capacity: Number(event.target.value) })} required />
        </label>
        <label>
          Цена за ночь
          <input inputMode="decimal" value={draft.price} onChange={(event) => onChange({ ...draft, price: event.target.value })} required />
        </label>
        <label>
          Описание номера в карточке
          <textarea
            value={draft.description}
            onChange={(event) => onChange({ ...draft, description: event.target.value })}
            placeholder="Например: отдельный люкс с балконом и видом на город"
            rows={2}
          />
          <span className="field-hint">
            Этот текст показывается в карточках отеля. Оставьте поле пустым, чтобы не показывать описание номера.
          </span>
        </label>
      </div>

      <RoomNumberDraftEditor
        value={draft.roomsText}
        onChange={(roomsText) => onChange({ ...draft, roomsText })}
      />

      <details className="optional-image-section" open={draft.imageUrls.length > 0}>
        <summary>Необязательное фото номера</summary>
        <p className="muted small">
          Добавьте изображение, только если этому типу номера нужна отдельная фотография.
        </p>
        <ImageField
          label="Загрузить фото номера"
          previewAlt={draft.name || "Фото номера"}
          values={draft.imageUrls}
          onChange={(imageUrls) => onChange({ ...draft, imageUrls })}
        />
      </details>

      <div>
        <CheckboxFieldGroup
          options={ROOM_AMENITIES}
          selected={draft.amenities}
          title="Удобства номера"
          onToggle={(value) =>
            onChange({
              ...draft,
              amenities: toggleSelection(draft.amenities, value),
            })
          }
        />
      </div>
      <div>
        <CheckboxFieldGroup
          options={MEAL_OPTIONS}
          selected={draft.mealOptions}
          title="Питание"
          onToggle={(value) =>
            onChange({
              ...draft,
              mealOptions: toggleSelection(draft.mealOptions, value),
            })
          }
        />
      </div>
    </div>
  );
}

export type ManagedHotelCardProps = {
  hotel: ManagedHotelResponse;
  updateHotel: (hotelId: number, request: UpdateHotelRequest) => Promise<ManagedHotelResponse>;
  createRoomType: (hotelId: number, request: RoomTypeRequest) => Promise<ManagedRoomTypeResponse>;
  updateRoomType: (roomTypeId: number, request: UpdateRoomTypeRequest) => Promise<ManagedRoomTypeResponse>;
  deactivateRoomType: (roomTypeId: number) => Promise<void>;
  createRoom: (roomTypeId: number, request: CreateRoomRequest) => Promise<ManagedRoomResponse>;
  updateRoom: (roomId: number, request: UpdateRoomRequest) => Promise<ManagedRoomResponse>;
  deactivateRoom: (roomId: number) => Promise<void>;
  deactivateHotel?: (hotelId: number) => Promise<void>;
  assignHotelOwner?: (hotelId: number, request: AssignHotelOwnerRequest) => Promise<ManagedHotelResponse>;
  runAction: (
    action: () => Promise<unknown>,
    message: string,
    feedback?: ActionFeedbackOptions
  ) => Promise<boolean>;
};

export function ManagedHotelCard({
  hotel,
  updateHotel,
  createRoomType,
  updateRoomType,
  deactivateRoomType,
  createRoom,
  updateRoom,
  deactivateRoom,
  deactivateHotel,
  assignHotelOwner,
  runAction,
}: ManagedHotelCardProps) {
  const [hotelDraft, setHotelDraft] = useState({
    name: hotel.name,
    description: hotel.description ?? "",
    imageUrls: imageUrlsFromResponse(hotel.imageUrls, hotel.imageUrl),
    city: hotel.city,
    address: hotel.address,
    amenities: hotel.amenities ?? [],
  });
  const [ownerId, setOwnerId] = useState(hotel.ownerId?.toString() ?? "");
  const [newRoomType, setNewRoomType] = useState<RoomTypeDraft>(blankRoomType());
  const [addRoomTypeOpen, setAddRoomTypeOpen] = useState(false);
  const [roomTypeDrafts, setRoomTypeDrafts] = useState<Record<number, RoomTypeEditDraft>>(
    () =>
      Object.fromEntries(
        hotel.roomTypes.map((roomType) => [
          roomType.id,
          roomTypeEditDraftFromResponse(roomType),
        ])
      )
  );
  const [localError, setLocalError] = useState("");
  const [localSuccess, setLocalSuccess] = useState("");

  useEffect(() => {
    setHotelDraft({
      name: hotel.name,
      description: hotel.description ?? "",
      imageUrls: imageUrlsFromResponse(hotel.imageUrls, hotel.imageUrl),
      city: hotel.city,
      address: hotel.address,
      amenities: hotel.amenities ?? [],
    });
    setOwnerId(hotel.ownerId?.toString() ?? "");
    setRoomTypeDrafts(
      Object.fromEntries(
        hotel.roomTypes.map((roomType) => [
          roomType.id,
          roomTypeEditDraftFromResponse(roomType),
        ])
      )
    );
  }, [hotel]);

  function clearLocalFeedback() {
    setLocalError("");
    setLocalSuccess("");
  }

  async function runCardAction(action: () => Promise<unknown>, message: string) {
    clearLocalFeedback();
    return await runAction(action, message, {
      onError: setLocalError,
      onSuccess: setLocalSuccess,
    });
  }

  async function handleSaveChanges() {
    await runCardAction(async () => {
      await updateHotel(hotel.id, {
        name: hotelDraft.name,
        description: optionalText(hotelDraft.description),
        imageUrl: primaryImageUrl(hotelDraft.imageUrls),
        imageUrls: hotelDraft.imageUrls,
        city: hotelDraft.city,
        address: hotelDraft.address,
        amenities: hotelDraft.amenities,
      });

      await Promise.all(
        hotel.roomTypes.map((roomType) => {
          const draft = roomTypeDrafts[roomType.id] ?? roomTypeEditDraftFromResponse(roomType);
          return updateRoomType(roomType.id, updateRoomTypeRequestFromDraft(draft));
        })
      );
    }, "Изменения сохранены.");
  }

  return (
    <article className="card stack-lg">
      <div className="management-card-header">
        <ImageWithFallback alt={hotel.name} className="management-image" src={hotel.imageUrl} />
        <div>
          <div className="row gap wrap">
            <h2>{hotel.name}</h2>
            <span className={hotel.isActive ? "status active" : "status inactive"}>{hotel.isActive ? "Активен" : "Неактивен"}</span>
          </div>
          <p className="muted">#{hotel.id} - {hotel.city} - {hotel.address}</p>
          {hotel.ownerId && <p className="muted small">ID владельца: {hotel.ownerId}</p>}
        </div>
      </div>

      {localError && <p className="alert error">{localError}</p>}
      {localSuccess && <p className="alert success">{localSuccess}</p>}

      <div className="form wide">
        <div className="form-grid two">
          <label>Название<input value={hotelDraft.name} onChange={(event) => setHotelDraft({ ...hotelDraft, name: event.target.value })} required /></label>
          <label>Город<input value={hotelDraft.city} onChange={(event) => setHotelDraft({ ...hotelDraft, city: event.target.value })} required /></label>
          <label className="full">Адрес<input value={hotelDraft.address} onChange={(event) => setHotelDraft({ ...hotelDraft, address: event.target.value })} required /></label>
          <div className="full">
            <ImageField
              label="Обложка отеля"
              previewAlt={hotelDraft.name || hotel.name}
              values={hotelDraft.imageUrls}
              onChange={(imageUrls) => setHotelDraft({ ...hotelDraft, imageUrls })}
            />
          </div>
          <label className="full">Описание<textarea value={hotelDraft.description} onChange={(event) => setHotelDraft({ ...hotelDraft, description: event.target.value })} rows={2} /></label>
          <div className="full">
            <CheckboxFieldGroup
              options={HOTEL_AMENITIES}
              selected={hotelDraft.amenities}
              title="Удобства отеля"
              onToggle={(value) =>
                setHotelDraft({
                  ...hotelDraft,
                  amenities: toggleSelection(hotelDraft.amenities, value),
                })
              }
            />
          </div>
        </div>
      </div>

      {assignHotelOwner && (
        <form className="inline-form owner-assign-form" onSubmit={(event) => {
          event.preventDefault();
          runCardAction(() => assignHotelOwner(hotel.id, { ownerId: Number(ownerId) }), "Владелец назначен.");
        }}>
          <label>ID владельца<input type="number" min={1} value={ownerId} onChange={(event) => setOwnerId(event.target.value)} required /></label>
          <button className="button secondary" type="submit">Назначить владельца</button>
        </form>
      )}

      <section className="stack">
        <div className="row between wrap gap">
          <h3>Типы номеров</h3>
          <span className="muted small">всего: {hotel.roomTypes.length}</span>
        </div>

        {hotel.roomTypes.length === 0 && <p className="muted">Типы номеров пока не добавлены.</p>}

        <div className="room-type-list">
          {hotel.roomTypes.map((roomType) => (
            <RoomTypeManagementCard
              key={roomType.id}
              roomType={roomType}
              draft={roomTypeDrafts[roomType.id] ?? roomTypeEditDraftFromResponse(roomType)}
              onDraftChange={(nextDraft) =>
                setRoomTypeDrafts((current) => ({
                  ...current,
                  [roomType.id]: nextDraft,
                }))
              }
              deactivateRoomType={deactivateRoomType}
              createRoom={createRoom}
              updateRoom={updateRoom}
              deactivateRoom={deactivateRoom}
              runAction={runAction}
            />
          ))}
        </div>
      </section>

      {addRoomTypeOpen ? (
        <form className="nested-form form wide" onSubmit={(event) => {
          event.preventDefault();
          runCardAction(async () => {
            await createRoomType(hotel.id, roomTypeRequestFromDraft(newRoomType));
            setNewRoomType(blankRoomType());
            setAddRoomTypeOpen(false);
          }, "Тип номера создан.");
        }}>
          <div className="row between gap wrap">
            <h3>Добавить тип номера</h3>
            <button className="button secondary" type="button" onClick={() => setAddRoomTypeOpen(false)}>
              Скрыть форму
            </button>
          </div>
          <RoomTypeDraftFields draft={newRoomType} onChange={setNewRoomType} />
          <button className="button secondary" type="submit">Добавить тип номера</button>
        </form>
      ) : (
        <div className="row gap wrap">
          <button className="button secondary" type="button" aria-expanded={addRoomTypeOpen} onClick={() => setAddRoomTypeOpen(true)}>
            Добавить тип номера
          </button>
        </div>
      )}

      <div className="management-save-bar">
        <button className="button" type="button" onClick={handleSaveChanges}>
          Сохранить изменения
        </button>
        {deactivateHotel && hotel.isActive && (
          <button
            className="button danger"
            type="button"
            onClick={() => runCardAction(() => deactivateHotel(hotel.id), "Отель деактивирован.")}
          >
            Деактивировать отель
          </button>
        )}
      </div>
    </article>
  );
}

function RoomTypeManagementCard({
  roomType,
  draft,
  onDraftChange,
  deactivateRoomType,
  createRoom,
  updateRoom,
  deactivateRoom,
  runAction,
}: {
  roomType: ManagedRoomTypeResponse;
  draft: RoomTypeEditDraft;
  onDraftChange: (draft: RoomTypeEditDraft) => void;
  deactivateRoomType: (roomTypeId: number) => Promise<void>;
  createRoom: (roomTypeId: number, request: CreateRoomRequest) => Promise<ManagedRoomResponse>;
  updateRoom: (roomId: number, request: UpdateRoomRequest) => Promise<ManagedRoomResponse>;
  deactivateRoom: (roomId: number) => Promise<void>;
  runAction: (
    action: () => Promise<unknown>,
    message: string,
    feedback?: ActionFeedbackOptions
  ) => Promise<boolean>;
}) {
  const [roomNumber, setRoomNumber] = useState("");
  const [roomError, setRoomError] = useState("");
  const [roomSuccess, setRoomSuccess] = useState("");

  function runRoomAction(action: () => Promise<unknown>, message: string) {
    setRoomError("");
    setRoomSuccess("");
    return runAction(action, message, {
      onError: setRoomError,
      onSuccess: setRoomSuccess,
    });
  }

  return (
    <article className="room-type-card stack">
      <div className="room-type-heading">
        <ImageWithFallback alt={roomType.name} className="room-image" src={roomType.imageUrl} />
        <div>
          <div className="row gap wrap">
            <h4>{roomType.name}</h4>
            <span className={roomType.isActive ? "status active" : "status inactive"}>{roomType.isActive ? "Активен" : "Неактивен"}</span>
          </div>
          <p className="muted small">Вместимость {roomType.capacity} - {formatCurrency(roomType.price)}/ночь - активных номеров: {roomType.activeRooms}/{roomType.totalRooms}</p>
        </div>
      </div>

      <div className="form wide">
        <div className="form-grid two">
          <label>Название<input value={draft.name} onChange={(event) => onDraftChange({ ...draft, name: event.target.value })} required /></label>
          <label>Вместимость<input type="number" min={1} value={draft.capacity} onChange={(event) => onDraftChange({ ...draft, capacity: Number(event.target.value) })} required /></label>
          <label>Цена<input inputMode="decimal" value={draft.price} onChange={(event) => onDraftChange({ ...draft, price: event.target.value })} required /></label>
          <label className="full">
            Описание номера в карточке
            <textarea
              value={draft.description}
              onChange={(event) => onDraftChange({ ...draft, description: event.target.value })}
              placeholder="Например: отдельный люкс с балконом и видом на город"
              rows={2}
            />
            <span className="field-hint">
              Этот текст показывается в карточках отеля. Оставьте поле пустым, чтобы не показывать описание номера.
            </span>
          </label>
          <details className="optional-image-section full" open={draft.imageUrls.length > 0}>
            <summary>Необязательное фото номера</summary>
            <p className="muted small">
              Добавьте изображение, только если этому типу номера нужна отдельная фотография.
            </p>
            <ImageField
              label="Загрузить фото номера"
              previewAlt={draft.name || roomType.name}
              values={draft.imageUrls}
              onChange={(imageUrls) => onDraftChange({ ...draft, imageUrls })}
            />
          </details>
          <div className="full">
            <CheckboxFieldGroup
              options={ROOM_AMENITIES}
              selected={draft.amenities}
              title="Удобства номера"
              onToggle={(value) =>
                onDraftChange({
                  ...draft,
                  amenities: toggleSelection(draft.amenities, value),
                })
              }
            />
          </div>
          <div className="full">
            <CheckboxFieldGroup
              options={MEAL_OPTIONS}
              selected={draft.mealOptions}
              title="Питание"
              onToggle={(value) =>
                onDraftChange({
                  ...draft,
                  mealOptions: toggleSelection(draft.mealOptions, value),
                })
              }
            />
          </div>
        </div>
        {roomType.isActive && (
          <div className="row gap wrap">
            <button
              className="button danger"
              type="button"
              onClick={() => runRoomAction(() => deactivateRoomType(roomType.id), "Тип номера деактивирован.")}
            >
              Деактивировать тип номера
            </button>
          </div>
        )}
      </div>

      <div className="rooms-section stack-sm">
        <div className="rooms-title">
          <strong>Номера</strong>
          <p className="muted small">Добавляйте и управляйте номерами комнат для этого типа номера.</p>
        </div>
        <form className="room-add-form" onSubmit={(event) => {
          event.preventDefault();
          const nextRoomNumber = roomNumber.trim();
          if (!nextRoomNumber) {
            setRoomError("Введите номер комнаты.");
            setRoomSuccess("");
            return;
          }
          runRoomAction(async () => {
            await createRoom(roomType.id, { number: nextRoomNumber });
            setRoomNumber("");
          }, "Номер добавлен.");
        }}>
          <label>
            Номер комнаты
            <input value={roomNumber} onChange={(event) => setRoomNumber(event.target.value)} placeholder="101" required />
          </label>
          <button className="button secondary" type="submit">Добавить номер</button>
        </form>

        {roomError && <p className="alert error compact-alert">{roomError}</p>}
        {roomSuccess && <p className="alert success compact-alert">{roomSuccess}</p>}

        {roomType.rooms.length === 0 ? (
          <p className="muted small">Номера пока не добавлены.</p>
        ) : (
          <div className="room-grid">
            {roomType.rooms.map((room) => (
              <RoomChip key={room.id} room={room} updateRoom={updateRoom} deactivateRoom={deactivateRoom} runAction={runRoomAction} />
            ))}
          </div>
        )}
      </div>
    </article>
  );
}

function RoomChip({
  room,
  updateRoom,
  deactivateRoom,
  runAction,
}: {
  room: ManagedRoomResponse;
  updateRoom: (roomId: number, request: UpdateRoomRequest) => Promise<ManagedRoomResponse>;
  deactivateRoom: (roomId: number) => Promise<void>;
  runAction: (action: () => Promise<unknown>, message: string) => Promise<boolean>;
}) {
  const [editing, setEditing] = useState(false);
  const [number, setNumber] = useState(room.number);

  if (editing) {
    return (
      <form className="room-chip editing" onSubmit={(event) => {
        event.preventDefault();
        runAction(() => updateRoom(room.id, { number: number.trim() }), "Номер обновлен.").then((saved) => {
          if (saved) setEditing(false);
        });
      }}>
        <input value={number} onChange={(event) => setNumber(event.target.value)} required />
        <button className="mini-button" type="submit">Сохранить</button>
      </form>
    );
  }

  return (
    <div className={room.isActive ? "room-chip" : "room-chip inactive-room"}>
      <span>{room.number}</span>
      <span className="muted small">{room.isActive ? "Активен" : "Неактивен"}</span>
      <button className="mini-button" type="button" onClick={() => setEditing(true)}>Изменить</button>
      {room.isActive && <button className="mini-button danger-text" type="button" onClick={() => runAction(() => deactivateRoom(room.id), "Номер деактивирован.")}>Откл.</button>}
    </div>
  );
}
