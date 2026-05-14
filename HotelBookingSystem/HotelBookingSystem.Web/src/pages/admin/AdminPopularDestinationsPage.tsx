import { useEffect, useState, type FormEvent } from "react";
import {
  createPopularDestination,
  deletePopularDestination,
  getAdminPopularDestinations,
  updatePopularDestination,
} from "../../api/adminApi";
import { getApiErrorMessage } from "../../api/client";
import { ImageWithFallback } from "../../components/ImageWithFallback";
import type {
  PopularDestinationRequest,
  PopularDestinationResponse,
} from "../../types";

type DestinationDraft = {
  city: string;
  country: string;
  imageUrl: string;
  sortOrder: string;
  isActive: boolean;
};

const blankDestination = (): DestinationDraft => ({
  city: "",
  country: "",
  imageUrl: "",
  sortOrder: "0",
  isActive: true,
});

function draftFromDestination(destination: PopularDestinationResponse): DestinationDraft {
  return {
    city: destination.city,
    country: destination.country,
    imageUrl: destination.imageUrl,
    sortOrder: destination.sortOrder.toString(),
    isActive: destination.isActive,
  };
}

function requestFromDraft(draft: DestinationDraft): PopularDestinationRequest {
  return {
    city: draft.city.trim(),
    country: draft.country.trim(),
    imageUrl: draft.imageUrl.trim(),
    sortOrder: Number(draft.sortOrder),
    isActive: draft.isActive,
  };
}

export function AdminPopularDestinationsPage() {
  const [destinations, setDestinations] = useState<PopularDestinationResponse[]>([]);
  const [drafts, setDrafts] = useState<Record<number, DestinationDraft>>({});
  const [newDestination, setNewDestination] = useState<DestinationDraft>(
    blankDestination()
  );
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function loadDestinations() {
    setError("");
    setLoading(true);

    try {
      const result = await getAdminPopularDestinations();
      setDestinations(result);
      setDrafts(
        Object.fromEntries(
          result.map((destination) => [
            destination.id,
            draftFromDestination(destination),
          ])
        )
      );
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDestinations();
  }, []);

  async function run(action: () => Promise<unknown>, message: string) {
    setError("");
    setSuccess("");

    try {
      await action();
      await loadDestinations();
      setSuccess(message);
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  }

  async function handleCreate(event: FormEvent) {
    event.preventDefault();

    await run(async () => {
      await createPopularDestination(requestFromDraft(newDestination));
      setNewDestination(blankDestination());
    }, "Popular destination created.");
  }

  function updateDraft(destinationId: number, draft: DestinationDraft) {
    setDrafts((current) => ({
      ...current,
      [destinationId]: draft,
    }));
  }

  return (
    <main className="page stack-lg">
      <div className="page-header">
        <div>
          <p className="eyebrow">Admin</p>
          <h1>Popular destinations</h1>
        </div>
      </div>

      {error && <p className="alert error">{error}</p>}
      {success && <p className="alert success">{success}</p>}

      <section className="panel stack">
        <div>
          <p className="eyebrow">Create</p>
          <h2>Add destination</h2>
        </div>
        <DestinationForm
          draft={newDestination}
          submitLabel="Add destination"
          onChange={setNewDestination}
          onSubmit={handleCreate}
        />
      </section>

      <section className="stack">
        <div>
          <p className="eyebrow">Manage</p>
          <h2>Homepage destinations</h2>
        </div>

        {loading && <p className="muted">Loading destinations...</p>}

        {!loading && destinations.length === 0 && (
          <p className="muted">No popular destinations have been added.</p>
        )}

        <div className="management-list">
          {destinations.map((destination) => {
            const draft = drafts[destination.id] ?? draftFromDestination(destination);

            return (
              <article className="card admin-destination-card" key={destination.id}>
                <ImageWithFallback
                  alt={destination.city}
                  className="admin-destination-image"
                  src={draft.imageUrl}
                />
                <div className="stack">
                  <DestinationForm
                    draft={draft}
                    submitLabel="Save changes"
                    onChange={(nextDraft) => updateDraft(destination.id, nextDraft)}
                    onSubmit={(event) => {
                      event.preventDefault();
                      run(
                        () =>
                          updatePopularDestination(
                            destination.id,
                            requestFromDraft(draft)
                          ),
                        "Popular destination updated."
                      );
                    }}
                  />
                  <div className="admin-destination-actions">
                    <button
                      className="button secondary"
                      type="button"
                      onClick={() => updateDraft(destination.id, draftFromDestination(destination))}
                    >
                      Reset
                    </button>
                    <button
                      className="button danger"
                      type="button"
                      onClick={() => {
                        if (!window.confirm(`Delete ${destination.city}?`)) return;

                        run(
                          () => deletePopularDestination(destination.id),
                          "Popular destination deleted."
                        );
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}

function DestinationForm({
  draft,
  submitLabel,
  onChange,
  onSubmit,
}: {
  draft: DestinationDraft;
  submitLabel: string;
  onChange: (draft: DestinationDraft) => void;
  onSubmit: (event: FormEvent) => void;
}) {
  return (
    <form className="form-grid popular-destination-form" onSubmit={onSubmit}>
      <label>
        City
        <input
          value={draft.city}
          onChange={(event) => onChange({ ...draft, city: event.target.value })}
          minLength={2}
          required
        />
      </label>
      <label>
        Country
        <input
          value={draft.country}
          onChange={(event) => onChange({ ...draft, country: event.target.value })}
          minLength={2}
          required
        />
      </label>
      <label>
        Sort order
        <input
          type="number"
          min={0}
          max={1000}
          value={draft.sortOrder}
          onChange={(event) =>
            onChange({ ...draft, sortOrder: event.target.value })
          }
          required
        />
      </label>
      <label className="checkbox-label popular-destination-active">
        <input
          type="checkbox"
          checked={draft.isActive}
          onChange={(event) =>
            onChange({ ...draft, isActive: event.target.checked })
          }
        />
        Show on homepage
      </label>
      <label className="full">
        Image URL
        <input
          value={draft.imageUrl}
          onChange={(event) => onChange({ ...draft, imageUrl: event.target.value })}
          required
        />
      </label>
      <button className="button inline-button" type="submit">
        {submitLabel}
      </button>
    </form>
  );
}
