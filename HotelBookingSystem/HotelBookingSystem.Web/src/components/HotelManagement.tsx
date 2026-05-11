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
      setLocalError("This room number is already in the list.");
      return;
    }

    updateRoomNumbers([...roomNumbers, nextRoomNumber]);
    setRoomNumber("");
    setLocalError("");
  }

  return (
    <section className="room-number-editor">
      <div>
        <strong>Rooms</strong>
        <p className="muted small">
          Add room numbers one at a time. At least one room is required.
        </p>
      </div>

      <div className="room-number-add-form">
        <label>
          Room number
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
          Add room
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
                Remove
              </button>
            </span>
          ))}
        </div>
      ) : (
        <p className="muted small">No rooms added yet.</p>
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
  listTitle = "Hotels",
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
    }, "Hotel created.");
  }

  return (
    <main className="page stack-lg">
      <div className="page-header">
        <div>
          <p className="eyebrow">Management</p>
          <h1>{title}</h1>
        </div>
      </div>

      {error && <p className="alert error">{error}</p>}
      {success && <p className="alert success">{success}</p>}
      {loading && <p className="muted">Loading hotels...</p>}

      {createHotel && (
        <section className="panel stack-lg">
          <div>
            <p className="eyebrow">New property</p>
            <h2>Create hotel</h2>
            <p className="muted">
              Add the basics, choose a cover image, then create at least one
              room type with real room numbers.
            </p>
          </div>
          <form className="form wide" onSubmit={handleCreateHotel}>
            <div className="form-grid two">
              <label>
                Name
                <input value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} required minLength={2} />
              </label>
              <label>
                City
                <input value={draft.city} onChange={(event) => setDraft({ ...draft, city: event.target.value })} required minLength={2} />
              </label>
              <label className="full">
                Address
                <input value={draft.address} onChange={(event) => setDraft({ ...draft, address: event.target.value })} required minLength={5} />
              </label>
              <div className="full">
                <ImageField
                  label="Hotel cover image"
                  previewAlt={draft.name || "Hotel cover image"}
                  values={draft.imageUrls}
                  onChange={(imageUrls) => setDraft({ ...draft, imageUrls })}
                />
              </div>
              <label className="full">
                Description
                <textarea value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} rows={3} />
              </label>
              <div className="full">
                <CheckboxFieldGroup
                  options={HOTEL_AMENITIES}
                  selected={draft.amenities}
                  title="Hotel amenities"
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
                <h3>Room types</h3>
                <button className="button secondary" type="button" onClick={() => setDraft({ ...draft, roomTypes: [...draft.roomTypes, blankRoomType()] })}>
                  Add room type
                </button>
              </div>

              {draft.roomTypes.map((roomType, index) => (
                <div className="nested-form" key={index}>
                  <div className="row between gap">
                    <strong>Room type {index + 1}</strong>
                    {draft.roomTypes.length > 1 && (
                      <button className="button danger" type="button" onClick={() => setDraft({ ...draft, roomTypes: draft.roomTypes.filter((_, i) => i !== index) })}>
                        Remove
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

            <button className="button" type="submit">Create hotel</button>
          </form>
        </section>
      )}

      <section className="panel stack">
        <div className="row between gap wrap">
          <h2>{listTitle}</h2>
          <select value={selectedHotelId} onChange={(event) => setSelectedHotelId(event.target.value === "all" ? "all" : Number(event.target.value))}>
            <option value="all">All hotels</option>
            {filteredHotels.map((hotel) => (
              <option key={hotel.id} value={hotel.id}>{hotel.name}</option>
            ))}
          </select>
        </div>

        {visibleHotels.length === 0 && !loading && <p className="muted">No hotels found.</p>}

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
                      {hotel.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <p className="muted">
                    #{hotel.id} - {hotel.city} - {hotel.address}
                  </p>
                  <p className="muted small">
                    {hotel.roomTypes.length} room type{hotel.roomTypes.length === 1 ? "" : "s"}
                    {hotel.ownerId ? ` - Owner ID: ${hotel.ownerId}` : ""}
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
          Name
          <input value={draft.name} onChange={(event) => onChange({ ...draft, name: event.target.value })} required minLength={2} />
        </label>
        <label>
          Capacity
          <input type="number" min={1} value={draft.capacity} onChange={(event) => onChange({ ...draft, capacity: Number(event.target.value) })} required />
        </label>
        <label>
          Price per night
          <input inputMode="decimal" value={draft.price} onChange={(event) => onChange({ ...draft, price: event.target.value })} required />
        </label>
        <label>
          Listing room description
          <textarea
            value={draft.description}
            onChange={(event) => onChange({ ...draft, description: event.target.value })}
            placeholder="Example: Private suite with balcony and city view"
            rows={2}
          />
          <span className="field-hint">
            This exact text is shown on hotel listing cards. Leave it empty to show no room description.
          </span>
        </label>
      </div>

      <RoomNumberDraftEditor
        value={draft.roomsText}
        onChange={(roomsText) => onChange({ ...draft, roomsText })}
      />

      <details className="optional-image-section" open={draft.imageUrls.length > 0}>
        <summary>Optional room photo</summary>
        <p className="muted small">
          Add a room image only if you want this room type to have its own photo.
        </p>
        <ImageField
          label="Upload room image"
          previewAlt={draft.name || "Room image"}
          values={draft.imageUrls}
          onChange={(imageUrls) => onChange({ ...draft, imageUrls })}
        />
      </details>

      <div>
        <CheckboxFieldGroup
          options={ROOM_AMENITIES}
          selected={draft.amenities}
          title="Room amenities"
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
          title="Meals"
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
    }, "Changes saved.");
  }

  return (
    <article className="card stack-lg">
      <div className="management-card-header">
        <ImageWithFallback alt={hotel.name} className="management-image" src={hotel.imageUrl} />
        <div>
          <div className="row gap wrap">
            <h2>{hotel.name}</h2>
            <span className={hotel.isActive ? "status active" : "status inactive"}>{hotel.isActive ? "Active" : "Inactive"}</span>
          </div>
          <p className="muted">#{hotel.id} - {hotel.city} - {hotel.address}</p>
          {hotel.ownerId && <p className="muted small">Owner ID: {hotel.ownerId}</p>}
        </div>
      </div>

      {localError && <p className="alert error">{localError}</p>}
      {localSuccess && <p className="alert success">{localSuccess}</p>}

      <div className="form wide">
        <div className="form-grid two">
          <label>Name<input value={hotelDraft.name} onChange={(event) => setHotelDraft({ ...hotelDraft, name: event.target.value })} required /></label>
          <label>City<input value={hotelDraft.city} onChange={(event) => setHotelDraft({ ...hotelDraft, city: event.target.value })} required /></label>
          <label className="full">Address<input value={hotelDraft.address} onChange={(event) => setHotelDraft({ ...hotelDraft, address: event.target.value })} required /></label>
          <div className="full">
            <ImageField
              label="Hotel cover image"
              previewAlt={hotelDraft.name || hotel.name}
              values={hotelDraft.imageUrls}
              onChange={(imageUrls) => setHotelDraft({ ...hotelDraft, imageUrls })}
            />
          </div>
          <label className="full">Description<textarea value={hotelDraft.description} onChange={(event) => setHotelDraft({ ...hotelDraft, description: event.target.value })} rows={2} /></label>
          <div className="full">
            <CheckboxFieldGroup
              options={HOTEL_AMENITIES}
              selected={hotelDraft.amenities}
              title="Hotel amenities"
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
          runCardAction(() => assignHotelOwner(hotel.id, { ownerId: Number(ownerId) }), "Owner assigned.");
        }}>
          <label>Owner ID<input type="number" min={1} value={ownerId} onChange={(event) => setOwnerId(event.target.value)} required /></label>
          <button className="button secondary" type="submit">Assign owner</button>
        </form>
      )}

      <section className="stack">
        <div className="row between wrap gap">
          <h3>Room types</h3>
          <span className="muted small">{hotel.roomTypes.length} total</span>
        </div>

        {hotel.roomTypes.length === 0 && <p className="muted">No room types yet.</p>}

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

      <form className="nested-form form wide" onSubmit={(event) => {
        event.preventDefault();
        runCardAction(async () => {
          await createRoomType(hotel.id, roomTypeRequestFromDraft(newRoomType));
          setNewRoomType(blankRoomType());
        }, "Room type created.");
      }}>
        <h3>Add room type</h3>
        <RoomTypeDraftFields draft={newRoomType} onChange={setNewRoomType} />
        <button className="button secondary" type="submit">Add room type</button>
      </form>

      <div className="management-save-bar">
        <button className="button" type="button" onClick={handleSaveChanges}>
          Save changes
        </button>
        {deactivateHotel && hotel.isActive && (
          <button
            className="button danger"
            type="button"
            onClick={() => runCardAction(() => deactivateHotel(hotel.id), "Hotel deactivated.")}
          >
            Deactivate hotel
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
            <span className={roomType.isActive ? "status active" : "status inactive"}>{roomType.isActive ? "Active" : "Inactive"}</span>
          </div>
          <p className="muted small">Capacity {roomType.capacity} - {formatCurrency(roomType.price)}/night - {roomType.activeRooms}/{roomType.totalRooms} active rooms</p>
        </div>
      </div>

      <div className="form wide">
        <div className="form-grid two">
          <label>Name<input value={draft.name} onChange={(event) => onDraftChange({ ...draft, name: event.target.value })} required /></label>
          <label>Capacity<input type="number" min={1} value={draft.capacity} onChange={(event) => onDraftChange({ ...draft, capacity: Number(event.target.value) })} required /></label>
          <label>Price<input inputMode="decimal" value={draft.price} onChange={(event) => onDraftChange({ ...draft, price: event.target.value })} required /></label>
          <label className="full">
            Listing room description
            <textarea
              value={draft.description}
              onChange={(event) => onDraftChange({ ...draft, description: event.target.value })}
              placeholder="Example: Private suite with balcony and city view"
              rows={2}
            />
            <span className="field-hint">
              This exact text is shown on hotel listing cards. Leave it empty to show no room description.
            </span>
          </label>
          <details className="optional-image-section full" open={draft.imageUrls.length > 0}>
            <summary>Optional room photo</summary>
            <p className="muted small">
              Add a room image only if you want this room type to have its own photo.
            </p>
            <ImageField
              label="Upload room image"
              previewAlt={draft.name || roomType.name}
              values={draft.imageUrls}
              onChange={(imageUrls) => onDraftChange({ ...draft, imageUrls })}
            />
          </details>
          <div className="full">
            <CheckboxFieldGroup
              options={ROOM_AMENITIES}
              selected={draft.amenities}
              title="Room amenities"
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
              title="Meals"
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
              onClick={() => runRoomAction(() => deactivateRoomType(roomType.id), "Room type deactivated.")}
            >
              Deactivate room type
            </button>
          </div>
        )}
      </div>

      <div className="rooms-section stack-sm">
        <div className="rooms-title">
          <strong>Rooms</strong>
          <p className="muted small">Add and manage room numbers for this room type.</p>
        </div>
        <form className="room-add-form" onSubmit={(event) => {
          event.preventDefault();
          const nextRoomNumber = roomNumber.trim();
          if (!nextRoomNumber) {
            setRoomError("Enter a room number.");
            setRoomSuccess("");
            return;
          }
          runRoomAction(async () => {
            await createRoom(roomType.id, { number: nextRoomNumber });
            setRoomNumber("");
          }, "Room added.");
        }}>
          <label>
            Room number
            <input value={roomNumber} onChange={(event) => setRoomNumber(event.target.value)} placeholder="101" required />
          </label>
          <button className="button secondary" type="submit">Add room</button>
        </form>

        {roomError && <p className="alert error compact-alert">{roomError}</p>}
        {roomSuccess && <p className="alert success compact-alert">{roomSuccess}</p>}

        {roomType.rooms.length === 0 ? (
          <p className="muted small">No rooms yet.</p>
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
        runAction(() => updateRoom(room.id, { number: number.trim() }), "Room updated.").then((saved) => {
          if (saved) setEditing(false);
        });
      }}>
        <input value={number} onChange={(event) => setNumber(event.target.value)} required />
        <button className="mini-button" type="submit">Save</button>
      </form>
    );
  }

  return (
    <div className={room.isActive ? "room-chip" : "room-chip inactive-room"}>
      <span>{room.number}</span>
      <span className="muted small">{room.isActive ? "Active" : "Inactive"}</span>
      <button className="mini-button" type="button" onClick={() => setEditing(true)}>Edit</button>
      {room.isActive && <button className="mini-button danger-text" type="button" onClick={() => runAction(() => deactivateRoom(room.id), "Room deactivated.")}>Off</button>}
    </div>
  );
}
