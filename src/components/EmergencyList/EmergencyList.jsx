import "./EmergencyList.css";
import { useEffect, useMemo, useState } from "react";
import { useDashboard } from "../../store/DashboardContext.jsx";
import { useFilters } from "../../hooks/useFilters.js";
import { useSearch } from "../../hooks/useSearch.js";
import { useActiveEmergency } from "../../hooks/useActiveEmergency.js";
import { EMERGENCY_STATUSES } from "../../utils/constants.js";
import { acceptAuthorityDispatch, resolveEmergency } from "../../services/api.js";
import { FilterBar } from "./FilterBar.jsx";
import { SearchBar } from "./SearchBar.jsx";
import { EmergencyCard } from "./EmergencyCard.jsx";
import { EmergencyDetail } from "./EmergencyDetail.jsx";

export function EmergencyList({ loading }) {
  const { state } = useDashboard();
  const { setActive } = useActiveEmergency();
  const { type, setType, status, setStatus, filtered } = useFilters(state.emergencies);
  const { query, setQuery, results } = useSearch(filtered);
  const [detail, setDetail] = useState(null);
  const [activeTab, setActiveTab] = useState("live");
  const [actionBusy, setActionBusy] = useState(false);
  const [actionError, setActionError] = useState("");

  const { live, history } = useMemo(() => {
    const liveItems = results.filter((e) => e.status === EMERGENCY_STATUSES.ACTIVE);
    const historyItems = results
      .filter((e) => e.status !== EMERGENCY_STATUSES.ACTIVE)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return { live: liveItems, history: historyItems };
  }, [results]);

  const splitOpen = Boolean(detail);
  const tabList = activeTab === "live" ? live : history;

  useEffect(() => {
    if (!detail) return;
    const next = state.emergencies.find((e) => e.id === detail.id) ?? null;
    setDetail(next);
  }, [detail, state.emergencies]);

  async function handleResolve(caseId) {
    setActionBusy(true);
    setActionError("");
    try {
      await resolveEmergency(caseId);
    } catch (error) {
      setActionError(error?.message ?? "Unable to resolve this emergency right now.");
    } finally {
      setActionBusy(false);
    }
  }

  async function handleAcceptDispatch(caseId, authority) {
    setActionBusy(true);
    setActionError("");
    try {
      await acceptAuthorityDispatch(caseId, {
        id: authority.id,
        type: authority.type ?? "authority",
        contactName: authority.contactName ?? authority.name ?? null,
        contactPhone: authority.contactPhone ?? authority.phone ?? null,
      });
    } catch (error) {
      setActionError(error?.message ?? "Unable to accept dispatch.");
    } finally {
      setActionBusy(false);
    }
  }

  return (
    <section className="emergency-list-section">
      <div className="emergency-list-intro">
        <h2 className="emergency-list-title">Emergency dashboard</h2>
        <p className="emergency-list-desc">
          Each report is defined by type, on-site location, and minor or major severity. Optional guest details appear in
          the case panel when provided after the initial alert.
        </p>
      </div>

      <div className="emergency-list-toolbar">
        <SearchBar value={query} onChange={setQuery} />
        <FilterBar type={type} status={status} onTypeChange={setType} onStatusChange={setStatus} />
      </div>

      {loading && <p className="emergency-list-hint">Loading incidents…</p>}

      <div className={`emergency-split${splitOpen ? " emergency-split--open" : ""}`}>
        <div className="emergency-split-main">
          <div className="emergency-tabs" role="tablist" aria-label="Emergency views">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "live"}
              className={`emergency-tab${activeTab === "live" ? " emergency-tab--active" : ""}`}
              onClick={() => setActiveTab("live")}
            >
              Live emergencies ({live.length})
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "history"}
              className={`emergency-tab${activeTab === "history" ? " emergency-tab--active" : ""}`}
              onClick={() => setActiveTab("history")}
            >
              Past emergencies ({history.length})
            </button>
          </div>

          <div className={`emergency-list-block${activeTab === "history" ? " emergency-list-block--history" : ""}`}>
            <h3 className={`emergency-list-subtitle${activeTab === "history" ? " emergency-list-subtitle--muted" : ""}`}>
              <span className="emergency-list-subtitle-dot" aria-hidden="true" />
              {activeTab === "live" ? "Live — needs response" : "Past emergencies"}
            </h3>
            {tabList.length === 0 ? (
              <p className="emergency-list-empty">
                {activeTab === "live"
                  ? "No active emergencies match your filters."
                  : "No past incidents in this view."}
              </p>
            ) : (
              <div className={`emergency-grid${splitOpen ? " emergency-grid--with-panel" : ""}`}>
                {tabList.map((item) => (
                  <EmergencyCard
                    key={item.id}
                    item={item}
                    selected={detail?.id === item.id}
                    onSelect={setDetail}
                    onAlert={(e) => setActive(e.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {splitOpen && (
          <aside className="emergency-split-detail" aria-label="Case details">
            <EmergencyDetail
              item={detail}
              onClose={() => setDetail(null)}
              onResolve={handleResolve}
              onAcceptDispatch={handleAcceptDispatch}
              actionBusy={actionBusy}
              actionError={actionError}
            />
          </aside>
        )}
      </div>
    </section>
  );
}
